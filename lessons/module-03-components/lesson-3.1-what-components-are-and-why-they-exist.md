---
module: 3
lesson: 3.1
title: What components are and why they exist
duration: 45 minutes
prerequisites:
  - Module 1 (three blocks, TypeScript variables, PE7 tokens)
  - Module 2 ($state, $derived, $effect)
learning_objectives:
  - Explain in your own words why software is built out of components instead of one long file
  - Identify the three responsibilities a well-designed component isolates
  - Split a page of repeated markup into a reusable component and a consumer
  - Recognise the DOM moment that proves a component is actually one thing, not copy-pasted markup
  - Understand why Svelte files are already components without any extra ceremony
status: ready
---

# Lesson 3.1 — What components are and why they exist

> **Atomic lesson format** — every lesson follows Concept → Style it → Interact → Mini-build.

## 1. Concept — The copy-paste problem and how components solve it

### 1.1 The problem: one long file that repeats itself

Imagine you are building a dashboard page. The design has six small cards across the top, each showing a metric: *Users*, *Sessions*, *Revenue*, *Errors*, *Latency*, *Uptime*. Every card has the same structure — a label, a value, a tiny trend arrow, a subtle border, a soft shadow. Only the three pieces of text inside differ.

The first time you build this page, it is tempting to write the HTML for the first card, then copy-paste it six times and edit each one. The result is a file with hundreds of lines that all look alike. It works. Then on Monday the designer says, "move the label underneath the value instead of above it, and make the trend arrow bigger." Now you have to find all six cards in your file and edit each one identically. If you miss one, the page looks broken and nobody notices until a user complains.

This is the **copy-paste problem**. It is not about typing effort. It is about the fact that knowledge is duplicated. The knowledge *"a metric card looks like this"* lives in six different places in the file. Every change has to happen in six places. Every bug has to be fixed in six places. Every time somebody reads the file, they have to read six near-identical blocks and mentally confirm that they really are near-identical. Software that duplicates knowledge rots from the inside.

### 1.2 The solution: extract the shape once, use it many times

A **component** is a reusable piece of UI that has a name, a shape, a set of inputs, and a rendered output. When you write a component, you describe *the structure* of a metric card exactly once. Then, wherever you need a metric card, you write something very short — a tag — that asks for one and passes in the values that are different.

Instead of six identical blocks of markup, your dashboard file becomes six short tags:

```svelte
<MetricCard label="Users" value="12,384" trend="up" />
<MetricCard label="Sessions" value="7,102" trend="up" />
<MetricCard label="Revenue" value="$41,200" trend="down" />
```

The *shape* of a metric card — the HTML, the CSS, the little bit of logic that decides whether the arrow points up or down — lives in one file called `MetricCard.svelte`. The designer's Monday request now only has to be made in that one file. Every card on every page updates automatically, together, because they are not copies of each other. They are the *same component*, rendered with different inputs.

### 1.3 The three responsibilities a good component isolates

Every component in this course isolates three things:

1. **Structure.** The HTML-ish markup the component produces. Semantic tags, ARIA attributes, the nesting of elements. This is what the browser eventually paints.
2. **Appearance.** The scoped CSS that styles the structure. Because Svelte scopes every `<style>` block, a component's CSS cannot accidentally leak onto another component.
3. **Behaviour.** The TypeScript in the `<script lang="ts">` block. Props that arrive from outside, internal `$state` that the component manages on its own, `$derived` values it computes, and any event handlers.

A well-designed component does each of these three things for one idea — "a metric card", "a button", "a modal" — and nothing more. If a component is trying to isolate five different ideas at once, it is usually too big and should be broken into smaller components.

### 1.4 How this connects to what you already know

You have already written Svelte components. Every `+page.svelte` file you built in Module 1 and Module 2 was technically a component — SvelteKit just happens to mount the root `+page.svelte` at a URL. In Module 3 we are going to do something slightly different: we are going to write `.svelte` files that are **not** routes. They live in `src/lib/components/` and they are imported by other files. The file extension is the same. The three-block structure is the same. The only new thing is that now we will *pass data into them* from the outside, using the `$props()` rune in the next lesson.

If you have used React or Vue before, you already know the broad idea. React calls them components. Vue calls them components. Svelte calls them components. The vocabulary is universal. What differs is the mechanics: in React you write a function that returns JSX; in Vue you write a Single File Component with `<template>`, `<script>`, `<style>`; in Svelte you write a `.svelte` file which already *is* a single file component. No function wrapper, no default export to remember, no `setup()` function to understand. The file is the component.

### 1.5 Why Svelte's model makes this easier than most

In most frameworks, declaring "this is a component" requires ceremony — a function named with a capital letter, a return statement, a set of rules about where state can live and what can be passed down. In Svelte, the ceremony does not exist. A `.svelte` file is a component because it is a `.svelte` file. You do not write `function MetricCard() { return ... }`. You just write the markup and the style and the script. The compiler figures out the rest.

This matters for learners because it removes an entire class of errors. You cannot forget the `export default` because there isn't one. You cannot forget to capitalise the component name because the file name is the component name. You cannot accidentally place state in the wrong place because every `<script>` block runs in the same, well-defined lifecycle. The compiler enforces the rules quietly.

In this lesson's mini-build we will not pass any props yet — that is Lesson 3.2. We will just take two pieces of markup that look identical on a page and prove to ourselves that extracting them into a shared component really does work.

## 2. Style it — PE7 applied to the mini-build

The mini-build shows two info cards that share the same structure. Both cards read from the same PE7 tokens (`--color-surface-2`, `--color-border`, `--radius-lg`, `--space-lg`, `--shadow-md`). Because the style lives inside `InfoCard.svelte`, both rendered cards are guaranteed identical down to the hash on every class name. If you later decide the card needs larger padding, you edit *one* line in one file and both cards change. The per-page personality trick is applied at the *consumer* level: the route sets its own `--color-brand` override and both cards pick it up through the cascade, without the component knowing anything about it.

## 3. Interact — The pain of copy-paste, and the relief of extraction

Start by writing the page without a component. Put two `<article>` blocks side by side, each with the same label/value structure, each with its own copy of every class name. It works. Now change the label colour from `var(--color-text-muted)` to `var(--color-brand)` — you have to edit the rule twice. Change the gap between label and value — twice. It is not hard, but every change is a chance to make a typo in one of the two copies.

Then extract. Create `src/lib/components/InfoCard.svelte` with the shape and the styles, and replace both `<article>` blocks in the page with `<InfoCard />`. The page shrinks, the component file contains the knowledge exactly once, and the next design change is a one-line fix.

You will not see any visible difference in the browser — and that is exactly the point. A component is not a visible thing. It is a structural thing. The visible output is identical; the code that produces it is radically easier to maintain.

## 4. Mini-build — Two info cards, one component

### Files

1. `src/lib/components/InfoCard.svelte` — the shared component. (It still hard-codes its label and value in this lesson. Lesson 3.2 will introduce props.)
2. `src/routes/modules/03-components/01-what-are-components/+page.svelte` — the route that imports and renders the component twice.

### `InfoCard.svelte` (simplified)

```svelte
<script lang="ts">
    // Lesson 3.1 — no props yet. We are only proving extraction works.
    const label: string = 'Total users';
    const value: string = '12,384';
</script>

<article class="info-card">
    <p class="info-card__label">{label}</p>
    <p class="info-card__value">{value}</p>
</article>

<style>
    .info-card {
        padding: var(--space-lg);
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
    }

    .info-card__label {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin: 0;
    }

    .info-card__value {
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--color-text);
        margin-block-start: var(--space-xs);
    }
</style>
```

### The route (simplified)

```svelte
<script lang="ts">
    import InfoCard from '$lib/components/InfoCard.svelte';
</script>

<section class="page stack">
    <h1>Two cards, one component</h1>
    <div class="grid">
        <InfoCard />
        <InfoCard />
    </div>
</section>
```

### Run it

```bash
pnpm dev
```

Open `http://localhost:5173/modules/03-components/01-what-are-components`.

### DevTools verification

1. Open DevTools → Elements.
2. Expand the two `<article>` elements. Look at their `class` attributes: both will read `info-card svelte-XXXXXXX` — **and the hash is identical on both**. That identical hash is your proof that both cards come from the *same* `<style>` block in the *same* file. If they had been copy-pasted from two different files, the hashes would differ.
3. Open the **Sources** tab and find `InfoCard.svelte`. There is exactly one of it — not two copies — confirming that the component is stored once and rendered twice.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In your own words, what is the "copy-paste problem" and how does a component solve it?</summary>

When you duplicate the same markup in multiple places, the *knowledge* of what that markup means lives in multiple places. Every edit has to be repeated, and every bug has to be fixed everywhere. A component extracts the knowledge into one named file, so every edit happens once and every consumer updates automatically.
</details>

<details>
<summary><strong>Q2.</strong> What are the three responsibilities a good component isolates?</summary>

Structure (the markup), appearance (the scoped CSS), and behaviour (the TypeScript logic and state). A component should cover these three for one idea, not many.
</details>

<details>
<summary><strong>Q3.</strong> What makes declaring a component in Svelte simpler than in React or Vue?</summary>

A `.svelte` file is automatically a component — there is no function wrapper, no `export default`, no template/script split to learn. The file extension is the declaration.
</details>

<details>
<summary><strong>Q4.</strong> Two `<article>` elements on the same page have the same compiled hash suffix. What does that prove?</summary>

That both elements were rendered from the same `<style>` block in the same component file. Svelte generates a unique hash per file, so matching hashes mean matching source.
</details>

<details>
<summary><strong>Q5.</strong> The route in the mini-build does not define any CSS for `.info-card`. Why does it still look styled?</summary>

Because the styles are scoped *inside* `InfoCard.svelte` and travel with the component automatically. The route only has to import and render the tag — Svelte handles the rest through its per-component CSS scoping.
</details>

## 6. Common mistakes

- **Putting components in the wrong folder.** A component goes in `src/lib/components/`, not in `src/routes/`. Files in `src/routes/` with the special `+page.svelte` / `+layout.svelte` names are *routes*. Regular `.svelte` files under `$lib` are importable components.
- **Forgetting the capital letter in the import.** `import infoCard from '...';` compiles but then `<infoCard />` is treated as an HTML element. Always import components with a capital letter: `import InfoCard from '...';`
- **Inlining component styles in the parent.** Once the styles live in `InfoCard.svelte`, do not also write `.info-card { ... }` in the route. The component owns its look. If the parent needs to influence the look, use CSS custom properties (Lesson 3.9), not duplicated rules.
- **Making one component do everything.** If a single file starts containing a navbar, a hero, and a footer, it is really three components sharing a file. Split it.

## 7. What's next

Lesson 3.2 introduces `$props()` — the rune that lets you pass different data into the same component so those two identical info cards can finally become a set of six different ones.
