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

In Svelte 5 (April 2026), props are declared in exactly one way: by calling the `$props()` rune inside the `<script lang="ts">` block and destructuring the object it returns.

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

That is **Svelte 3 and Svelte 4** syntax. It worked for seven years. Svelte 5, released late 2024, introduced runes as a clearer, typed, explicit alternative, and by the April 2026 release the `$props()` rune is the official, recommended, and future-facing way. The old `export let` form still technically works in compatibility mode, but we never use it in this course.

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
<summary><strong>Q2.</strong> What is the one correct way to declare props in Svelte 5 (April 2026)?</summary>

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

Rewrite it as `let { label = '' } = $props();`. The old syntax is Svelte 3/4 and has no place in an April 2026 codebase.
</details>

## 6. Common mistakes

- **Writing `export let` anyway.** Mixing runes and `export let` in the same file is forbidden. Pick runes and stay consistent.
- **Calling `$props()` multiple times.** Only the first call is valid. Destructure everything you need from one call.
- **Mutating a prop inside the child.** Assigning to a prop variable (`label = 'something'`) is a design smell and will trigger a compiler warning. Props are read-only unless you explicitly opt in with `$bindable()` (Lesson 3.5).
- **Forgetting the default when you allow undefined.** If a parent might omit a prop, add a default in the destructure (`{ label = 'Untitled' }`) so the child never has to handle `undefined`.

## 7. What's next

Lesson 3.3 adds an explicit TypeScript `interface Props` so strict mode catches typos and mis-types at compile time.
