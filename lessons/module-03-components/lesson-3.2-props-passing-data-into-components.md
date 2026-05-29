---
module: 3
lesson: 3.2
title: $props() — passing data into components
duration: 50 minutes
prerequisites:
  - Lesson 3.1 (components extract repeated markup)
  - Module 1 (TypeScript basics)
  - Module 2 ($state, $derived)
learning_objectives:
  - Describe what a prop is and why components need them
  - Use the $props() rune to declare inputs into a Svelte component
  - Pass string, number, and boolean values from a parent into a child component
  - Recognise why `export let` is Svelte 3/4 syntax and never appears in this course
  - Inspect the Svelte DevTools panel to see live prop values flowing into a component
status: ready
---

# Lesson 3.2 — $props(): passing data into components

## 1. Concept — A component without props is a poster; a component with props is a stamp

### 1.1 The problem: Lesson 3.1's component can only say one thing

At the end of Lesson 3.1 we had an `InfoCard.svelte` that rendered a label and a value. Both cards on the page looked identical because the label and value were hard-coded *inside* the component. That was useful for proving that extraction works, but in real software the whole point of a reusable component is that each instance says something different. A single `InfoCard` that always displays "Total users: 12,384" is no more useful than a poster; you can hang it on the wall, but you cannot stamp it onto different pieces of paper with different words each time.

To make the component useful we need a way to say: "render an `InfoCard` **with** this label and **with** this value". The word *with* is doing a lot of work in that sentence. In programming it maps to a very specific idea called a **prop**.

### 1.2 What a prop actually is

A **prop** (short for *property*) is a named piece of data that flows from a parent component into a child component when the child is rendered. If you think of the child component as a function, props are the function's parameters. When the parent writes `<InfoCard label="Total users" value="12,384" />`, the parent is *calling* the `InfoCard` function with two named arguments. The child receives them, uses them in its markup, and returns the rendered output.

Props only flow **downward**, from parent to child. A child cannot reach up and change a parent's variable directly. (There is one carefully controlled exception called `$bindable` which we will meet in Lesson 3.5.) This one-way flow is not a limitation — it is the thing that makes big applications possible to reason about. If data could flow in any direction at any time, you would never be able to answer the question "where did this value come from?" With one-way flow, the answer is always: from a parent, through a prop.

### 1.3 How Svelte 5 spells it: the `$props()` rune

In Svelte 5 (May 2026), props are declared in exactly one way: by calling the `$props()` rune inside the `<script lang="ts">` block and destructuring the object it returns.

```svelte
<script lang="ts">
    let { label, value } = $props();
</script>
```

That `let` statement does three things at once:

1. It tells the compiler that `label` and `value` are **inputs** to this component, not local variables.
2. It creates two reactive bindings in the component's scope so that whenever the parent changes its value, the child re-renders with the new one.
3. It gives the compiler enough information to generate the correct TypeScript types (we will add an explicit `interface Props` in the very next lesson, 3.3).

Call `$props()` exactly once. Destructure everything you need from that single call.

### 1.4 Why we do not use `export let` anymore

If you search "Svelte props" on the internet, a large fraction of the top results still show this:

```svelte
<script>
    export let label;
    export let value;
</script>
```

That is **Svelte 3 and Svelte 4** syntax. It worked for seven years. Svelte 5, released late 2024, introduced runes as a clearer, typed, explicit alternative, and by the May 2026 release the `$props()` rune is the official, recommended, and future-facing way. The old `export let` form still technically works in compatibility mode, but we never use it in this course.

Why did the team change it? Three reasons: `export` normally means "make this available to other files", which confused learners; the old form had strange edge cases around default values; and it did not play well with strict TypeScript. `$props()` fixes all three.

### 1.5 What "passing data" really means at runtime

When a parent renders `<InfoCard label="Users" value="12,384" />`, the Svelte compiler turns that tag into a plain JavaScript function call that hands an object `{ label: 'Users', value: '12,384' }` to the `InfoCard` component. Inside `InfoCard`, `$props()` returns exactly that object. Your `let { label, value }` destructures it. If the parent later changes `label` because it was reading from `$state`, the child's `label` updates automatically and Svelte re-runs only the tiny piece of DOM that depends on it. No lifecycle method, no `shouldComponentUpdate` decision. It just works.

### 1.6 Typing strictly, even without an interface yet

In Lesson 3.3 we will add an explicit `interface Props { ... }` and attach it to the `$props()` call like this: `let { label, value }: Props = $props();`. For this lesson we use defaults so that strict TypeScript can still infer string types:

```svelte
<script lang="ts">
    let { label = '', value = '' } = $props();
</script>
```

That works, but it is not yet strict enough for a university-level course. We tighten it in the next lesson. For now, focus on the mechanics of `$props()` itself.

### 1.7 Props are reactive by default

A crucial property of `$props()` that beginners sometimes miss: **props are reactive**. If a parent component changes the value it passes as a prop (because the parent's own `$state` changed), the child component re-renders the affected portion of its template automatically. You do not need to "subscribe" to props, you do not need to add a watcher, and you do not need to call any update function. The reactivity is wired up by the compiler at build time.

This means you can use a prop value directly in `$derived` expressions:

```svelte
<script lang="ts">
    let { price = 0, quantity = 1 } = $props();
    const total = $derived(price * quantity);
</script>
```

When the parent updates `price` or `quantity`, the child's `total` recomputes automatically. The prop flows in, the derived value updates, the DOM reflects the change — all without a single explicit subscription.

### 1.8 The rest pattern for forwarding unknown props

A component sometimes needs to accept arbitrary HTML attributes (like `class`, `id`, `aria-label`) and forward them to its root element. The rest pattern handles this:

```svelte
<script lang="ts">
    let { label, value, ...rest } = $props();
</script>

<article {...rest} class="info-card">
    <p>{label}</p>
    <p>{value}</p>
</article>
```

The `...rest` collects every prop that is not `label` or `value` into an object, and `{...rest}` spreads that object as attributes on the element. This is how you build components that feel "native" — callers can add `class="my-override"`, `data-testid="metric"`, or any ARIA attribute without the component needing to know about them in advance. We will use this pattern extensively in the component library later.

### 1.9 Props vs state: when to upgrade

A common question: "if I receive a value as a prop, can I also make it stateful?" The answer is: you *can*, but you probably should not. If you write `let { count } = $props(); count = 5;` the compiler will warn you. Props are inputs from the parent; they represent the parent's truth. If you need a local copy that the child can modify independently, create a new state variable initialized from the prop:

```svelte
<script lang="ts">
    let { initialCount = 0 } = $props();
    let localCount = $state(initialCount);
</script>
```

Now `localCount` is independent state. Changes to the parent's `initialCount` after mount do *not* automatically update `localCount` — it has become its own source of truth. This is an important distinction: props flow downward continuously; a state variable initialized from a prop takes a snapshot at creation time and diverges from there.

## Deep Dive

**Why this matters at scale.** In a 50-component app, props are the primary mechanism for data flow. A component library with 20 components, each accepting 3–8 props, has hundreds of data flow points. If even one of those is untyped, incorrectly defaulted, or mutated by the child, you get subtle bugs that are hard to trace. The discipline of "props flow down, never mutated by the child, always typed" is the single most important architectural rule for maintainable component trees. Teams that violate it end up with "works on my machine" bugs that only manifest when specific prop combinations occur.

**The mental model.** A component is a function. Props are its parameters. Just as a well-designed function does not modify its arguments (that would be a side effect), a well-designed component does not modify its props. The parent "calls" the component with arguments; the component uses those arguments to produce output. If the component needs mutable local state, it declares its own `$state` variables separate from props. This function-like mental model is what makes components composable: you can reason about each one in isolation, knowing that its behavior is fully determined by its props (and its internal state), with no hidden external mutations.

**Edge cases.** If a prop is an object or array and the parent passes a `$state` object, the child can accidentally mutate the parent's state through the prop reference. For example, `items.push(newItem)` inside the child modifies the parent's array. This is technically allowed but architecturally dangerous — it creates implicit upward data flow that breaks the "props flow down" contract. The fix is to use callback props for mutations: the parent passes an `onAdd` callback, and the child calls it when it wants to add an item. Lesson 3.5 covers `$bindable` as the controlled exception to this rule.

**Performance implications.** Props themselves have near-zero overhead. The compiler generates a direct reference from parent to child — there is no intermediate serialization, no cloning, no diffing. Changing a prop triggers a targeted update only of the DOM nodes that read that prop, not a full re-render of the child component. This is one of Svelte's advantages over React, where changing a prop re-renders the entire child subtree (unless you manually wrap it in `React.memo`). In Svelte, granular reactivity means only the specific text node, attribute, or expression that references the prop is updated.

**Connection to other modules.** Props are the glue of the component tree. Module 4 (control flow) passes loop variables as props to child components. Module 5 (events) passes callback functions as props for child-to-parent communication. Module 6 (styling) uses CSS custom properties as a parallel "styling props" channel. Module 8 (routing) passes `data` from load functions as a prop to page components. Module 11 (state management) compares prop drilling to context and stores. Understanding props deeply here makes every subsequent pattern — callback props, render props via snippets, data props from load functions — immediately comprehensible.

### 1.10 What the compiler does with props

When a parent renders `<InfoCard label="Users" value="12,384" />`, the compiler generates a function call:

```js
InfoCard(target, { label: 'Users', value: '12,384' });
```

Inside `InfoCard`, `$props()` compiles to reading from that argument object. The compiler sets up signal subscriptions so that if the parent's props come from reactive state, changes flow into the child automatically:

```js
// Compiled child (simplified)
export default function InfoCard($$anchor, $$props) {
    const label = () => $$props.label;  // reactive getter
    const value = () => $$props.value;  // reactive getter
    // Template uses label() and value() to create subscriptions
}
```

Each prop becomes a reactive getter. When the parent updates a prop, the getter returns the new value, and only the specific DOM nodes that reference that prop update. This is why Svelte does not re-render the entire child component when one prop changes — it updates only the affected DOM nodes.

### 1.11 Common interview question

**Q: "In Svelte 5, what is the `$props()` rune and how does it differ from Svelte 4's `export let` pattern?"**

**Model answer:** `$props()` is a compiler intrinsic that returns the component's incoming props as a single reactive object. You destructure it once: `let { label, value } = $props()`. It replaces Svelte 4's `export let label; export let value;` pattern. Three improvements: (1) `$props()` is a single call with one destructure, making it obvious which variables are props; (2) it integrates with TypeScript naturally — you annotate the destructure with an interface (`let { label, value }: Props = $props()`); (3) `export` no longer has a dual meaning — in JavaScript, `export` means "make available to importers", but in Svelte 4 it meant "this is a prop." The semantic overloading confused many learners. `$props()` eliminates the confusion.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/$props](https://svelte.dev/docs/svelte/$props) — the official `$props` rune reference.
- [svelte.dev/docs/svelte/old-vs-new](https://svelte.dev/docs/svelte/old-vs-new) — comparing `$props()` to `export let`.
- [svelte.dev/docs/svelte/typescript](https://svelte.dev/docs/svelte/typescript) — typing props with interfaces.

**Advanced pattern: rest-props for HTML attribute forwarding.** Many components need to accept arbitrary HTML attributes and pass them to the root element:

```svelte
<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    
    interface Props extends HTMLAttributes<HTMLElement> {
        label: string;
        value: string;
    }
    
    let { label, value, ...rest }: Props = $props();
</script>

<article {...rest} class="info-card">
    <p>{label}</p>
    <p>{value}</p>
</article>
```

The `...rest` pattern collects all props not explicitly listed and spreads them onto the element. This enables callers to pass `class`, `id`, `data-testid`, ARIA attributes, and event handlers without the component author listing each one.

**Challenge question (combines Lesson 3.2 + Lesson 2.2 + Lesson 1.9):** A parent component has a `$state` variable `count` that changes on button clicks. It passes `count` as a prop to a child `Counter` component. Inside the child, the count is displayed with `{count}`. Explain the full reactive chain: from the button click in the parent, through the state update, through the prop flow, to the specific DOM text node that updates in the child. At which point does the virtual DOM get diffed? (Trick question — it does not.)

## 2. Style it — Brand personality moves with the component

`InfoCard` already carries its own styles from Lesson 3.1. In this lesson the consumer route overrides the per-page `--color-brand` to teal, and every instance picks it up through the cascade — even though the component itself never mentions teal. This is your first taste of the pattern used for the entire UI library later: the parent sets tokens, the child reads them.

## 3. Interact — Hard-coded pain, then prop relief

Start by trying to render six different metrics without props. You copy `<InfoCard />` six times, and every card displays the same hard-coded label. Useless. Now introduce `$props()`: delete the `const label` and `const value` from inside the component and replace them with `let { label, value } = $props()`. Then from the parent, render six cards with six different values. The cards differ, the component file is still one file, and every piece of knowledge about "what a metric card looks like" still lives in one place.

## 4. Mini-build — Six metrics, one component

### Files

1. `src/lib/components/InfoCard.svelte` — updated to accept `label` and `value` props.
2. `src/routes/modules/03-components/02-props/+page.svelte` — renders six metric cards.

### Key excerpt

```svelte
<!-- InfoCard.svelte -->
<script lang="ts">
    let { label = '', value = '' } = $props();
</script>

<article class="info-card">
    <p class="info-card__label">{label}</p>
    <p class="info-card__value">{value}</p>
</article>
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
    import InfoCard from '$lib/components/InfoCard.svelte';
</script>

<div class="grid">
    <InfoCard label="Users" value="12,384" />
    <InfoCard label="Sessions" value="7,102" />
    <InfoCard label="Revenue" value="$41,200" />
    <InfoCard label="Errors" value="4" />
    <InfoCard label="Latency" value="92 ms" />
    <InfoCard label="Uptime" value="99.98 %" />
</div>
```

### Run it

```bash
pnpm dev
```

Visit `http://localhost:5173/modules/03-components/02-props`.

### DevTools verification

1. Install the **Svelte DevTools** browser extension if you have not already.
2. Open DevTools → Svelte tab.
3. Click on one of the `InfoCard` nodes in the component tree. The right panel shows **Props** with the current values of `label` and `value` for that instance.
4. Click another `InfoCard`. Same component, different prop values. That is the thing a reusable component is for.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Explain in your own words why props only flow from parent to child.</summary>

One-way flow gives you a single reliable answer to "where did this value come from?" If data could flow in any direction, you would have to check every file in the app to trace a value. With top-down flow, you trace upward until you find the component that declared it.
</details>

<details>
<summary><strong>Q2.</strong> What is the one correct way to declare props in Svelte 5 (May 2026)?</summary>

Call the `$props()` rune exactly once inside `<script lang="ts">` and destructure the returned object: `let { label, value } = $props();`. Any example using `export let` is Svelte 3/4 and must be rewritten.
</details>

<details>
<summary><strong>Q3.</strong> If a parent component updates a prop value because its own `$state` changed, what does the child have to do to re-render?</summary>

Nothing. Svelte's compiler wires the prop to the child's reactive graph automatically. When the prop changes, only the DOM that depends on it updates.
</details>

<details>
<summary><strong>Q4.</strong> Why must `$props()` be called exactly once per component?</summary>

`$props()` represents the entire props object for that component instance. Calling it twice would mean two different objects competing for the same role. The compiler only permits one call, and destructures every prop from it.
</details>

<details>
<summary><strong>Q5.</strong> A tutorial shows `export let label = '';` inside a Svelte file. What should you do with it?</summary>

Rewrite it as `let { label = '' } = $props();`. The old syntax is Svelte 3/4 and has no place in an May 2026 codebase.
</details>

## 6. Common mistakes

- **Writing `export let` anyway.** Mixing runes and `export let` in the same file is forbidden. Pick runes and stay consistent.
- **Calling `$props()` multiple times.** Only the first call is valid. Destructure everything you need from one call.
- **Mutating a prop inside the child.** Assigning to a prop variable (`label = 'something'`) is a design smell and will trigger a compiler warning. Props are read-only unless you explicitly opt in with `$bindable()` (Lesson 3.5).
- **Forgetting the default when you allow undefined.** If a parent might omit a prop, add a default in the destructure (`{ label = 'Untitled' }`) so the child never has to handle `undefined`.

## 7. What's next

Lesson 3.3 adds an explicit TypeScript `interface Props` so strict mode catches typos and mis-types at compile time.
