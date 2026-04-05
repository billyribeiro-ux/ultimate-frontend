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
