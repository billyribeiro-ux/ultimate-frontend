---
module: 2
lesson: 2.3
title: $state with objects
duration: 45 minutes
prerequisites:
  - Lesson 2.2 — $state with primitive types
learning_objectives:
  - Declare reactive state with an object initial value
  - Explain what a "deep reactive proxy" is and how Svelte implements it
  - Mutate nested properties and see the UI update
  - Type an object state with an interface
  - Recognise when deep proxying is unwanted (setting whole-object replacements)
status: ready
---

# Lesson 2.3 — `$state` with objects

## 1. Concept — When the state is not a single value

### 1.1 The problem: real state has structure

A counter is a convenient teaching example, but real-world UI state is rarely a single number. A user profile has a name, an email, a display preference, and an avatar URL. A settings form has ten inputs that all move together. A shopping cart has a list of line items, each with its own quantity. In every case, the shape of the state is an object (or an array — Lesson 2.4). You could in principle flatten the object into ten separate `$state(...)` variables, but you would lose the *unity* of the data: the object is one thing conceptually, and splitting it just to make reactivity work would be absurd.

Fortunately, you do not have to. `$state` accepts any value, and when you pass it an object, the compiler does something clever: it wraps the object in a **deep reactive proxy**.

### 1.2 What a reactive proxy is

A **proxy**, in JavaScript, is a standard built-in object that intercepts operations on another object. You can write a proxy that logs every property access, or that returns a default value for unknown properties, or — crucially for Svelte — that tracks reads and writes for reactivity purposes. Svelte 5 takes your plain object and wraps it in a proxy whose `get` trap registers a subscription on every property access and whose `set` trap notifies subscribers on every property update.

```ts
interface Profile {
    name: string;
    email: string;
    theme: 'light' | 'dark';
}

let profile: Profile = $state({
    name: 'Ada',
    email: 'ada@example.org',
    theme: 'dark'
});

profile.name = 'Augusta';       // triggers an update — only for UI that reads profile.name
profile.theme = 'light';        // triggers a separate update
```

Reading `profile.name` in the markup registers a subscription. Writing `profile.name = ...` notifies exactly that subscription. If another piece of UI reads `profile.email`, it is only notified when `profile.email` changes — not when `profile.name` changes. This fine-grained tracking means Svelte updates the minimum amount of DOM possible.

### 1.3 "Deep" — what it means and why it matters

The word **deep** in "deep reactive proxy" means Svelte proxies *every nested object* too, not just the top level. Consider:

```ts
let user = $state({
    name: 'Ada',
    address: { street: '10 Downing', city: 'London' }
});

user.address.city = 'Paris'; // also triggers an update
```

Svelte's proxy recursively wraps `user.address` the first time you read it, so writes to `user.address.city` are tracked too. You do not have to wrap nested objects yourself. You do not have to replace the whole `user` to change one nested field. You mutate the nested property the way you would in plain JavaScript and reactivity just works.

This is, frankly, a huge ergonomics win over React, where you cannot mutate state objects — you must create a new object with the spread operator every time a single field changes: `setUser({ ...user, address: { ...user.address, city: 'Paris' } })`. In Svelte 5, that becomes `user.address.city = 'Paris'`. It is a meaningful productivity difference.

### 1.4 When you might not want deep proxying

There are two situations where deep proxying is unhelpful:

1. **Very large object graphs.** If your state contains 10,000 nested items, the cost of proxying every one adds up. For this case, Svelte provides `$state.raw` (Lesson 2.5), which stores the value as-is without any proxying.
2. **Immutable third-party objects.** Some libraries return frozen or class-based objects that do not play well with proxies. Again, `$state.raw` is the escape hatch.

For normal UI state — profiles, forms, carts, lists of tens or hundreds of items — deep `$state` is exactly what you want.

### 1.5 Reassigning vs mutating

You have two ways to change object state:

```ts
// Mutation — writes to one property, triggers one targeted update.
profile.name = 'Augusta';

// Reassignment — replaces the whole object, triggers updates for everything reading it.
profile = { name: 'Augusta', email: 'a@b.c', theme: 'light' };
```

Both work. Mutation is usually more efficient because it only touches one property. Reassignment is convenient when you are loading a whole new profile from the server. Use whichever fits.

One subtlety: after a reassignment, the new object is *also* wrapped in a proxy. You can keep mutating its fields normally.

### 1.6 Typing object state

Always declare an interface first, then annotate the `$state` with it:

```ts
interface Profile {
    name: string;
    email: string;
    theme: 'light' | 'dark';
}

let profile: Profile = $state({
    name: 'Ada',
    email: 'ada@example.org',
    theme: 'dark'
});
```

TypeScript will enforce the shape both on the initial value and on every assignment afterwards. A typo like `profile.thme = 'light'` is caught immediately.

## Deep Dive

**Why this matters at scale.** In production applications, state is almost never a single primitive. A user profile, a form, a configuration panel — these are all objects with many fields. In a 50-component app, you might have 30 different object-shaped state containers. If developers misunderstand how deep proxying works, they either over-copy (spreading on every change, React-style) which is wasteful, or they under-react (mutating a nested field and wondering why the UI is stale). Clear understanding of the deep proxy model eliminates both failure modes and lets teams write mutation-style code with confidence.

**The mental model.** Think of `$state({...})` as dipping an entire tree into a reactive coating. Every branch and leaf of the tree becomes individually trackable. When the UI reads `tree.branch.leaf`, it subscribes specifically to that leaf. When you write `tree.branch.leaf = newValue`, only subscribers to that specific leaf are notified. The tree metaphor extends: if you cut off a branch and replace it (`tree.branch = newBranch`), subscribers to the old branch are disconnected and the new branch is immediately coated. The coating is automatic, recursive, and lazy — Svelte only coats a branch when something first reads it.

**Edge cases.** The destructuring trap is the most common source of bugs: `const { name } = profile` extracts the *current value* of `name` as a plain string, severing it from the proxy. Later mutations to `profile.name` do not update the destructured variable. The fix is to always read through the proxy in templates and effects, or to use `$derived(() => profile.name)` if you need a standalone reactive reference. Another edge case: adding a *new* property that was not in the original object. Svelte's proxy intercepts `set` on any property, so dynamically adding `profile.newField = 'x'` does trigger reactivity — but TypeScript will complain unless the interface uses an index signature or the field is optional. A third edge case: `Object.keys(profile)` returns the keys correctly through the proxy, but `JSON.stringify(profile)` calls the proxy's `toJSON` if it exists — be aware when debugging serialization.

**Performance implications.** Proxy creation is not free: each nested object gets its own Proxy wrapper, which allocates a handler object and sets up the traps. For a profile with 5 fields, this is irrelevant. For an object with 1,000 nested objects (like a deeply nested configuration tree), proxy creation happens lazily on first access, spreading the cost over time. The per-access overhead of a proxy trap is roughly 50-100 nanoseconds — invisible for typical UI work but measurable in tight loops over large datasets. When you hit that threshold, `$state.raw` (Lesson 2.5) is the escape hatch.

**Cross-module connections.** Object state is the foundation for component props (Module 3 — `$props()` returns a reactive object), for form handling (Module 10 — form state is an object with many fields), and for shared state stores (Module 11 — reactive classes hold object state). The deep-proxy mental model you build here carries directly into understanding how props update, how context works, and how reactive class fields behave. If you understand "mutation through the proxy triggers targeted updates," you understand 80% of Svelte's reactivity story.

### 1.7 What the compiler does with object `$state`

When you write `let profile: Profile = $state({ name: 'Ada', email: 'a@b.c', theme: 'dark' })`, the compiler wraps the object in a `Proxy`. The Proxy's `get` trap registers subscriptions per-property. The `set` trap notifies only the subscribers of the changed property. Simplified:

```js
const profile = proxy({
    name: source('Ada'),
    email: source('a@b.c'),
    theme: source('dark')
});

// Reading profile.name in markup → get trap → registers subscription to name signal
// Writing profile.name = 'Augusta' → set trap → notifies only name subscribers
```

The per-property granularity means that changing `profile.name` does not re-render the part of the template that displays `profile.email`. Each field is its own signal. This is fundamentally more efficient than React's model, where calling `setProfile({...profile, name: 'Augusta'})` causes a full re-render of the component and its children.

### 1.8 "In production" — mutation beats immutability for form state

At a 50-developer HR platform, the employee settings page had 15 form fields — name, email, phone, department, manager, timezone, language, notifications preferences, and more. In the previous React codebase, every field change required a spread-and-copy pattern: `setSettings({...settings, phone: newPhone})`. With 15 fields and 15 event handlers, the component had 30 lines of boilerplate just for state updates.

After migrating to Svelte 5, each handler became one line: `settings.phone = newPhone`. Deep reactivity meant the proxy intercepted every mutation. The component shrank from 180 lines to 95 lines. More importantly, a subtle bug in the React version — where the spread operator sometimes lost a concurrent field update due to stale closures — disappeared entirely because mutation does not suffer from stale-closure problems. You always mutate the current object, not a copy of a potentially-old snapshot.

### 1.9 Common interview question

**Q: "Explain the difference between Svelte 5's deep reactive proxy and React's immutable state pattern. When would you choose each?"**

**Model answer:** Svelte 5 wraps objects in a deep Proxy that intercepts property reads and writes. You mutate the object directly (`profile.name = 'Ada'`), and the proxy notifies only the specific DOM nodes that read that property. React requires immutability: you create a new object with the changed field (`setProfile({...profile, name: 'Ada'})`), and React re-renders the component to find what changed via virtual DOM diffing. Svelte's approach is more ergonomic (less boilerplate), more performant (targeted updates instead of diffing), and avoids stale-closure bugs. React's approach is more familiar to functional programmers and makes "undo/redo" patterns simpler (you can store snapshots of each state). Choose Svelte's mutation for UI state that changes frequently (forms, toggles, real-time data). Choose immutable patterns when you need a change history or need to compare old and new states (use `$state.snapshot` in Svelte for this).

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/$state](https://svelte.dev/docs/svelte/$state) — covers deep reactivity, proxies, and the `$state` rune in detail.
- [svelte.dev/docs/svelte/reactivity-fundamentals](https://svelte.dev/docs/svelte/reactivity-fundamentals) — explains how the reactive graph works with objects.
- [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) — MDN reference for JavaScript Proxies.

**Advanced pattern: reactive class instances.** You can use `$state` on class fields to create reactive objects with methods:

```ts
class Profile {
    name = $state('');
    email = $state('');
    theme: 'light' | 'dark' = $state('dark');

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
    }
}

const profile = new Profile();
```

This pattern bundles state and behaviour together, and each field is independently reactive. It is the Svelte 5 equivalent of MobX's observable classes.

**Challenge question (combines Lesson 2.3 + Lesson 2.2 + Lesson 1.8):** You have `let user = $state({ name: 'Ada', address: { city: 'London' } })`. Write code to update `user.address.city` to `'Paris'`. Then explain why `const { address } = user; address.city = 'Paris'` also works but `const { city } = user.address; city = 'Paris'` does not trigger reactivity. What TypeScript type does `city` have in the second case, and why?

## 2. Style it — A live settings panel

The mini-build is a tiny settings panel: a form with a name input, an email input, and a theme toggle. All three fields read from and write to one `Profile` state object. PE7 tokens drive spacing, colour, and form styling. When the theme changes, a CSS custom property on the panel's root updates — we will make the whole panel's colour scheme flip.

## 3. Interact — Mutating a nested property

Declare the nested state:

```ts
interface Profile {
    name: string;
    notifications: { email: boolean; sms: boolean };
}

let profile: Profile = $state({
    name: 'Ada',
    notifications: { email: true, sms: false }
});
```

In plain-JS thinking, you might worry that writing `profile.notifications.sms = true` will not trigger a re-render because the outer `profile` reference did not change. In Svelte 5, it does trigger a re-render, because the proxy is deep: every nested object is itself proxied, and writing `notifications.sms` is intercepted at the nested level. This is the key mental shift from React-style state.

## 4. Mini-build — A live settings panel

**File:** `src/routes/modules/02-reactivity/03-state-objects/+page.svelte`

The panel has two text inputs (name, email) and a theme selector. All three bind directly to fields of a single `Profile` state object. A preview card below the form shows the current values and updates as you type.

### DevTools verification

1. Type in the name input. Watch the preview update on every keystroke.
2. Open DevTools → Console and run `$state.snapshot(profile)` (we will meet this properly in Lesson 2.6). It returns a plain object with the current values.
3. Change the theme. Observe the CSS custom property flip on the panel element.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does Svelte do under the hood when you pass an object to <code>$state(...)</code>?</summary>

It wraps the object in a deep reactive proxy. The proxy's get trap registers subscriptions and its set trap notifies subscribers. Nested objects are wrapped lazily on first access.
</details>

<details>
<summary><strong>Q2.</strong> Does <code>profile.address.city = 'Paris'</code> trigger reactivity on a <code>$state</code> profile?</summary>

Yes. The nested `address` object is itself proxied, so writes to its properties are tracked. You do not have to reassign the outer `profile`.
</details>

<details>
<summary><strong>Q3.</strong> Why is deep proxying usually a feature and sometimes a problem?</summary>

It is a feature because it lets you mutate nested state naturally without spreading and copying. It becomes a problem for very large object graphs (proxy overhead adds up) or for third-party frozen objects that cannot be proxied. For those cases use `$state.raw` (Lesson 2.5).
</details>

<details>
<summary><strong>Q4.</strong> What is the difference between mutating a field (<code>profile.name = ...</code>) and reassigning the whole object (<code>profile = {...}</code>)?</summary>

Mutation triggers only the subscriptions that read the specific field. Reassignment triggers every subscription that reads any part of the object. Both are valid; mutation is usually more efficient.
</details>

<details>
<summary><strong>Q5.</strong> Why type your object state with an <code>interface</code> rather than relying on inference?</summary>

So that TypeScript enforces the shape on every future mutation and reassignment. Inference works for the initial literal but silently widens when the object grows, which can let typos and missing fields slip through.
</details>

## 6. Common mistakes

- **Destructuring and expecting reactivity to survive.** `const { name } = profile` creates a *copy* — a plain string — that is no longer connected to the state. Read `profile.name` directly, or use `$derived` (Lesson 2.7) to project a piece of state.
- **Passing a destructured piece of state to a child component.** Same problem. Pass the whole state, or pass a getter function, or bind the property.
- **Believing reassignment is always required, like in React.** In Svelte 5, mutation works. `profile.name = 'New'` is fine.
- **Forgetting to type nested objects.** An interface should describe the nested shape too: `interface Profile { address: { city: string } }`. Don't let nested objects fall back to `any`.

## 7. What's next

Lesson 2.4 is the same idea but with arrays — plus an introduction to the array methods (`push`, `splice`, `map`, `filter`) you will use all the time.
