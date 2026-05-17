---
module: 1
lesson: 1.3
title: The three blocks — script, markup, style
duration: 40 minutes
prerequisites:
  - Lesson 1.1 — What Svelte is and why it compiles
  - Lesson 1.2 — A running SvelteKit project on your machine
learning_objectives:
  - Identify the three blocks of any .svelte file and state each block's job
  - Explain the execution order of script, markup, and style at compile time
  - Write a minimal .svelte file that uses all three blocks correctly
  - Recognise what belongs in which block and why mixing them is a mistake
  - Use a template expression to read a script-block value from markup
status: ready
---

# Lesson 1.3 — The three blocks: script, markup, style

## 1. Concept — Why one file has three different languages inside it

### 1.1 The problem: UI code is three concerns glued together

A single button on a page involves three very different kinds of thinking. First, *logic* — what happens when the button is pressed, what state it reads, what type its label is. Second, *structure* — where in the document tree the button sits, what element it is, what text is inside it. Third, *presentation* — what colour it is, how it grows on bigger screens, what happens when the user hovers. For decades, front-end developers kept these three concerns in three separate files: a `.js` file, an `.html` file, and a `.css` file. The reasoning was that "separation of concerns" meant "separation of file types".

That reasoning sounds clean but it has a painful side effect. To understand a single component — a single button — you had to open three files, mentally align them, and trust that the logic in `button.js` was talking to the element in `button.html` which was being styled by `button.css`. If you renamed the element's class, you had to remember to update two other files. If you deleted the component, you had to remember to delete three files. Real-world codebases are full of orphaned CSS classes and dead JavaScript functions nobody dares remove because nobody is sure where they were used.

Svelte's answer is simple: **keep the three concerns in three different places but put those places inside one file.** A `.svelte` file has exactly three blocks, each for one concern, living side by side. They cannot drift out of sync because they are literally next to each other on the screen, and when you delete the file you delete everything at once. Separation of concerns is preserved; separation of files is abandoned. This is the single best decision in the design of Svelte, and once you have used it for a week you will find it hard to go back.

### 1.2 The three blocks

Every `.svelte` file contains up to three blocks, always in this order (though any block may be omitted if unused):

```svelte
<script lang="ts">
    // BLOCK 1 — LOGIC (TypeScript)
    // Variables, types, reactive state, event handlers, imports.
</script>

<!-- BLOCK 2 — MARKUP (HTML + template expressions) -->
<!-- The tree the browser will render. Values from the script are
     interpolated with curly braces: {variableName}. -->

<style>
    /* BLOCK 3 — PRESENTATION (scoped CSS) */
    /* Styles only apply to this file's markup. */
</style>
```

Each block has its own language. The script block is TypeScript (because of `lang="ts"`). The markup block looks like HTML but allows `{expression}` interpolation and Svelte's control-flow tags. The style block is plain CSS — no pre-processor needed — which Svelte automatically scopes so its rules never leak out.

### 1.3 Execution order — what happens at compile time vs runtime

It is tempting to imagine the script running first, then the markup, then the style. That is not quite right. At **compile time**, Svelte reads all three blocks together. It notes which variables from the script are referenced in the markup so it can generate the minimum update code. It parses the CSS, rewrites every selector to include a unique hash suffix, and extracts it into its own stylesheet. It turns the markup into plain DOM-creation instructions that call into the variables from the script.

At **runtime**, only the compiled output runs. The browser creates the DOM from the compiled instructions, fills in the interpolated values, and links up the scoped styles. Your original `.svelte` file never reaches the browser — only the distilled code that Svelte produced from it.

This matters for one practical reason. If you put a `console.log('hello')` at the top of the `<script>` block, it runs every time a component instance is created — that is, every time this route or this component appears on the page. It does *not* run once per application. This is different from a plain HTML `<script>` tag and is the number-one source of confusion for beginners.

### 1.4 What belongs in which block

A short, unambiguous taxonomy:

- **Script block:** anything that has a type, anything with parentheses (`function`, `( )`, `=>`), imports, constants, reactive runes (Module 2), event-handler functions. If you are typing JavaScript or TypeScript keywords, you are in the script block.
- **Markup block:** tags (`<h1>`, `<article>`, `<button>`), text, attributes, and expression interpolation (`{variable}`, `{condition ? 'yes' : 'no'}`). Control-flow blocks like `{#if}`, `{#each}`, and `{#await}` live here (Module 4). If you are describing the shape of the DOM, you are in the markup block.
- **Style block:** selectors, properties, at-rules (`@media`, `@keyframes`), nested rules. If you are writing CSS, you are in the style block.

The mistakes beginners make almost always come from confusing markup with script. For example, writing `let count = 0` inside the markup block will do nothing — the compiler will simply emit the literal text "let count = 0" into the DOM. Writing `{background: red}` inside the script block is a syntax error. When something looks wrong, ask yourself: *which block is this in?*

### 1.5 What the compiler does with the three blocks

Let us trace what happens to each block during compilation. Consider this component:

```svelte
<script lang="ts">
    const greeting: string = 'Hello';
</script>

<p class="text">{greeting}</p>

<style>
    .text { color: var(--color-brand); font-weight: 600; }
</style>
```

The Svelte compiler processes all three blocks simultaneously and produces two outputs:

**JavaScript output (simplified):**
```js
import { template, text, append } from 'svelte/internal/client';

const root = template('<p class="text svelte-a1b2c3"> </p>');

export default function Component($$anchor) {
    const greeting = 'Hello';
    const p = root();
    const textNode = p.firstChild;
    textNode.data = greeting;
    append($$anchor, p);
}
```

**CSS output:**
```css
.text.svelte-a1b2c3 { color: var(--color-brand); font-weight: 600; }
```

Three transformations happened. First, the script block's TypeScript was stripped to plain JavaScript (types are erased). Second, the markup became direct DOM instructions — `template()` uses a native `<template>` element for fast cloning, and the expression `{greeting}` became a text-node assignment. Third, the style block was extracted into a separate CSS file with the hash `svelte-a1b2c3` appended to every selector. The compiler chose the hash based on the file's content, so two different files always get different hashes.

The key insight: the compiler does not process the blocks in order (script, then markup, then style). It reads all three together because it needs cross-block information. It needs to know which script variables the markup references (to generate update code). It needs to know which markup elements the style selectors target (to add hashes). This holistic view is what makes the compiled output so efficient.

### 1.6 "In production" — how the three-block model saved a redesign

At a 50-developer media company, the design team requested a full visual refresh of the article card component — new colours, new spacing, new typography. In the old React codebase, the card's styles lived in a CSS module (`ArticleCard.module.css`), its logic in a `.tsx` file, and its tests referenced class names from both. Changing the design meant updating three files, verifying the class name imports still matched, and hoping no other component had accidentally imported the same module. The process took two days and three rounds of code review.

After the migration to Svelte, the same change was a single-file edit. The developer opened `ArticleCard.svelte`, changed the `<style>` block, verified the markup still referenced the same class names (which were two lines above the style), and submitted. One file, one review, 45 minutes. The three-block model did not make the developer more skilled. It made the task structurally simpler by eliminating cross-file coordination.

### 1.7 The TypeScript angle — why `lang="ts"` changes everything

Compare these two script blocks:

```svelte
<!-- Without lang="ts" -->
<script>
    let count = 0;
    count = 'five'; // No error — JavaScript accepts this silently
</script>

<!-- With lang="ts" -->
<script lang="ts">
    let count: number = 0;
    count = 'five'; // Error: Type 'string' is not assignable to type 'number'
</script>
```

Without `lang="ts"`, the Svelte compiler treats the block as plain JavaScript. No type checking runs. No editor squigglies appear. The developer gets zero feedback about type mismatches until a user encounters a crash. With `lang="ts"`, the compiler pipes the script through TypeScript's checker *before* stripping types. Every annotation is verified. Every type mismatch becomes a red underline in your editor *and* a compile-time error in your terminal.

The critical detail: `lang="ts"` also enables type checking *across* the markup block. Template expressions like `{count.toFixed(2)}` are type-checked — if `count` were typed as `string`, the compiler would flag that `toFixed` does not exist on strings. This cross-block type checking only works when the script block has `lang="ts"`.

### 1.8 Comparison: block structures across frameworks

| Framework | Logic block | Template block | Style block |
|---|---|---|---|
| Svelte 5 | `<script lang="ts">` | Inline markup (HTML + `{}`) | `<style>` (auto-scoped) |
| Vue 3 | `<script setup lang="ts">` | `<template>` | `<style scoped>` |
| React | Function body | JSX return value | External CSS / CSS-in-JS |
| Angular | `.ts` class file | `.html` template file | `.css` / `.scss` file |

Svelte and Vue are the only two that put all three concerns in one file by default. React splits logic and template into one file (via JSX) but separates styles. Angular separates all three into different files. Svelte's approach is the most compact because it has no wrapper (`<template>` tag in Vue) and no function-return boilerplate (JSX in React).

### 1.9 Common interview question

**Q: "In a Svelte component, the script block runs once per component instance. What does that mean, and how is it different from a plain `<script>` tag in HTML?"**

**Model answer:** A plain HTML `<script>` tag runs once when the browser encounters it during page parsing — it is a global, page-level execution. A Svelte component's `<script>` block is compiled into a function that runs once per component instance — every time a component is created (mounted into the DOM), its script runs again with fresh variable scopes. If you render `<MyComponent />` three times on a page, the script block runs three times, each with its own independent set of variables. This is fundamentally different from a global script that runs once per page load. It is also different from React, where the function body runs on *every* render, not just on mount. In Svelte 5, the script block runs once at creation time, and subsequent updates are handled by the reactive system (runes) without re-executing the entire script.

### 1.10 The April 2026 difference

Older Svelte (3 and 4) had a fourth block pattern: a `<script context="module">` block for code that should run once per module rather than once per instance. In Svelte 5 this is replaced by simply importing from a regular `.ts` file or a `.svelte.ts` file (Module 11). You will not need a `context="module"` block anywhere in this course, and if you see one online it is older code.

Also: the script must be typed. `<script>` without `lang="ts"` is not an error in Svelte itself, but this course treats it as one. Every single `<script>` tag in every single lesson is `<script lang="ts">`. No exceptions.

## Deep Dive

**Why this matters at scale.** In a 50-component application, the single-file component model is the reason you can onboard a new team member in a day rather than a week. When every component is self-contained — logic, markup, and style in one file — there is no "which CSS file does this button live in?" scavenger hunt. Deleting a component means deleting one file; every dependency disappears with it. In codebases that separate concerns by file type, orphaned CSS accumulates silently. Studies of large React + CSS-modules codebases show 15-30% dead CSS within two years. Svelte's single-file model and unused-selector warnings make dead CSS structurally impossible to accumulate without the compiler yelling at you.

**The mental model.** Think of a `.svelte` file as a biological cell. The script block is the nucleus — the instructions that govern behaviour. The markup block is the cell membrane — the visible boundary that interacts with the outside world. The style block is the cytoplasm — the internal environment that gives the cell its colour and texture. You would never store a cell's membrane in a separate jar from its nucleus; they are one unit. The same logic applies to components. Co-location is not laziness; it is the acknowledgment that these three concerns have the same lifecycle: they are created together, modified together, and deleted together.

**Edge cases.** A `.svelte` file with no `<script>` block is valid — Svelte treats it as a purely presentational component with no logic. A file with no `<style>` block inherits nothing (there is no implicit global style); it simply has no component-scoped CSS. A file can have at most one `<script lang="ts">` block (the instance script). If you need module-level code that runs once regardless of how many instances exist, put it in a separate `.ts` file and import it — the old `<script context="module">` pattern from Svelte 3/4 still works in compatibility mode but is considered deprecated. TypeScript will not type-check markup expressions unless the script block has `lang="ts"` — this means a typo in `{variableName}` inside markup goes uncaught if you forget the lang attribute.

**Performance.** The three-block architecture has zero runtime cost. At compile time, Svelte extracts the style block into a separate `.css` file (or inlines it, depending on adapter configuration), which the browser loads and caches independently. The script block compiles to a lean JavaScript module with no framework overhead. The markup block compiles to direct DOM instructions — no virtual DOM diffing, no template parsing at runtime. This means that adding a style block to a component does not increase JavaScript bundle size at all; it only adds to the CSS bundle, which the browser processes on a separate thread.

**Cross-module connections.** The three-block model underpins everything in this course. Module 2 (reactivity) lives entirely in the script block. Module 6 (styling) lives entirely in the style block. Module 4 (control flow) lives in the markup block. Module 3 (components) shows how the three blocks compose hierarchically when components nest inside each other. Understanding that the blocks are processed together at compile time — not sequentially at runtime — is essential for debugging the reactive system in Module 2, where students often wonder "why did my `$effect` run before the DOM updated?" The answer is always rooted in understanding the compile-time relationship between the script and markup blocks.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/overview](https://svelte.dev/docs/svelte/overview) — covers the component structure and the role of each block.
- [svelte.dev/docs/svelte/svelte-files](https://svelte.dev/docs/svelte/svelte-files) — details on what is allowed in each block, including edge cases like multiple script tags.
- [svelte.dev/docs/svelte/basic-markup](https://svelte.dev/docs/svelte/basic-markup) — the full syntax reference for Svelte's enhanced HTML markup.

**Advanced pattern: module-level code in `.svelte.ts` files.** When you need code that runs once per module (not once per component instance) — for example, a shared counter or a singleton WebSocket connection — create a `.svelte.ts` file in `src/lib/`. The `.svelte.ts` extension tells the Svelte compiler to process runes in the file, but unlike a component's script block, the code runs once when the module is first imported. This is the Svelte 5 replacement for the old `<script context="module">` block. You will use this extensively in Module 11.

**Challenge question (combines Lesson 1.3 + Lesson 1.1 + Lesson 1.7):** A developer puts a global CSS reset (`* { margin: 0; box-sizing: border-box; }`) inside a component's `<style>` block. Explain why this does not work as expected, what the compiled CSS looks like, and where global resets should live instead.

## 2. Style it — Colour the three blocks visually

The mini-build renders a diagram of the three blocks of a Svelte file — a little meta, but useful — with each block coloured differently using PE7 tokens. The brand token is overridden once at the top-level scoped selector (`section`), and three utility classes pick three hue rotations off it using OKLCH's `from` syntax, so every block's colour is still a function of the single brand variable. Mobile baseline stacks the blocks vertically; at `min-width: 480px` they arrange into a grid row.

## 3. Interact — A typed variable read from the markup

Here is the mistake many first-time Svelte learners make:

```svelte
<script lang="ts">
    let lessonNumber = 1.3;
</script>

<p>Lesson lessonNumber</p>
```

The rendered paragraph prints the literal text "Lesson lessonNumber" — not "Lesson 1.3". The markup block does not know that `lessonNumber` is a variable unless you tell it so with curly braces. The fix:

```svelte
<script lang="ts">
    const lessonNumber: number = 1.3;
</script>

<p>Lesson {lessonNumber}</p>
```

Two changes: `let` became `const` because we never reassign it, and the variable is wrapped in `{ }` so the compiler knows to interpolate its value. This is your first **template expression**. Anything between `{` and `}` inside markup is a JavaScript expression evaluated at runtime and inserted into the DOM.

## 4. Mini-build — A self-describing three-block page

**File:** `src/routes/modules/01-foundation/03-three-blocks/+page.svelte`

The page renders three cards, one per block, each labelled with the block's name and a one-sentence summary. The values for those labels and summaries come from a typed constant in the script block, and the cards are styled entirely from the style block.

Open the route in your browser. You should see three cards stacked on mobile and arranged in a row on desktop. Inspect any card in DevTools and confirm you see a `svelte-xxxxxx` hash appended to its class.

### DevTools verification

1. Open DevTools → Elements.
2. Click the middle card and look at its class attribute. You will see the hash suffix.
3. Open the Sources tab and locate the compiled module for this route. You will see your script's `const` values baked into the generated update code.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In your own words, why does Svelte keep logic, markup, and style in one file when traditional web development kept them in three?</summary>

Because the three concerns are *logically* separate but *practically* entangled. A single component's script talks to its own markup which is styled by its own CSS. Keeping them in one file means you cannot delete, rename, or move one without seeing the others, which eliminates whole categories of drift bugs.
</details>

<details>
<summary><strong>Q2.</strong> In what order does Svelte process the three blocks at compile time?</summary>

Svelte reads all three blocks together at compile time. It is not a three-pass pipeline. The compiler needs to know every variable referenced in the markup in order to generate efficient update code, and it needs to know every selector in the style block in order to scope it.
</details>

<details>
<summary><strong>Q3.</strong> What happens if you write <code>let count = 0</code> directly inside the markup block?</summary>

Svelte treats it as text content and renders the literal string "let count = 0" into the DOM. Variables live in the script block; the markup block only *reads* from them through `{ }` expressions.
</details>

<details>
<summary><strong>Q4.</strong> Where should an <code>@media</code> rule live — script, markup, or style — and why?</summary>

Style. `@media` is CSS. It belongs in the `<style>` block. Scoped CSS in Svelte supports all modern CSS including media queries, nesting, and container queries.
</details>

<details>
<summary><strong>Q5.</strong> Why must your script block start with <code>&lt;script lang="ts"&gt;</code> and not just <code>&lt;script&gt;</code>?</summary>

Without `lang="ts"`, Svelte treats the block as plain JavaScript and the TypeScript type checker will not run on it. You will get no type errors in your editor even when there are many, which defeats the entire point of using TypeScript strict mode.
</details>

## 6. Common mistakes

- **Writing JavaScript in the markup block.** If you catch yourself typing `let`, `const`, `function`, or `if (...)` outside of `{ }`, you are in the wrong block. Move the code into `<script lang="ts">`.
- **Writing a CSS selector in the script block.** `font-size: 2rem;` in a `<script>` is a syntax error. CSS lives in `<style>`.
- **Expecting global CSS.** A rule inside `<style>` only affects *this* file. If a class does not apply in a sibling component, that is not a bug — it is scoping doing its job (Lesson 1.7).
- **Forgetting the curly braces on a template expression.** `<p>Lesson lessonNumber</p>` renders the literal text. `<p>Lesson {lessonNumber}</p>` renders the value. This is every beginner's first typo.

## 7. What's next

Lesson 1.4 goes deep on the type annotations you have been copy-pasting into your script blocks and shows you how TypeScript infers types automatically when you let it.
