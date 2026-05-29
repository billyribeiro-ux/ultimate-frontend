---
module: 1
lesson: 1.1
title: What Svelte is and why it compiles
duration: 45 minutes
prerequisites:
  - Basic HTML (tags, attributes)
  - Basic CSS (selectors, properties)
  - Nothing else — zero JavaScript required
learning_objectives:
  - Explain the difference between a compiler and a runtime framework in your own words
  - State three concrete reasons why a compiled framework can be faster than a runtime one
  - Describe the relationship between Svelte, SvelteKit, Node.js, and Vite
  - Identify the three blocks of a .svelte file and say what each one does
  - Open DevTools and point to the compiled class hash that proves CSS is scoped
status: ready
---

# Lesson 1.1 — What Svelte is and why it compiles

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**. Lesson 1.1 is the only lesson where the Interact section is intentionally empty, because we have not written any JavaScript yet and we want you to look at the simplest possible Svelte file first. Lesson 1.2 introduces your first variables.

## 1. Concept — What Svelte is, and why it is different

### 1.1 The two families of front-end frameworks

When you put a modern JavaScript framework on a website, you are almost always choosing one of two families. Every framework you have heard of belongs to one of them.

**Family A — Runtime frameworks.** React, Vue, Angular, Solid (mostly), Ember, and many more. When you build a React application, the browser downloads *two things*: your app code **and** the React library itself. React's job is to run inside the browser and turn your component code into real DOM updates. That library is the "runtime". It has to be there, it has to load before anything works, and it adds weight to every page your user visits — typically 40 KB to 120 KB of compressed JavaScript just for the framework, before a single line of your own code runs.

**Family B — Compiled frameworks.** Svelte is the best-known member of this family. Svelte does not have a runtime in the traditional sense. Instead, Svelte ships a small program called a **compiler** that runs on *your* computer while you are building the app. The compiler looks at every `.svelte` file you write and translates it into plain, direct JavaScript and CSS. It writes the exact lines of code that are needed to update the page for your specific components, and nothing more. By the time your app reaches your user's browser, there is no "Svelte" to download. The framework has already done its job and disappeared.

> **Helpful analogy:** Runtime frameworks are like a translator who travels with you on a trip and translates every conversation in real time — you have to feed the translator, book them a hotel room, and carry them everywhere. Compiled frameworks are like hiring a translator before the trip to write out every sentence you might need, and then travelling alone with the phrasebook. The translator's work is done at home. You travel lighter.

### 1.2 Why "lighter" matters more than it sounds

A 100 KB runtime is not the end of the world on a fast laptop. But your users are not always on fast laptops. Four facts make framework size *enormously* important:

1. **Mobile networks are slow and unreliable.** Most traffic to most sites in 2026 is mobile. On a 4G connection in a train tunnel, 100 KB of extra JavaScript can mean an extra second of waiting — sometimes more. Users abandon sites that take more than three seconds to show content.
2. **JavaScript is the most expensive resource a browser handles.** Unlike an image, which the browser decodes and paints, JavaScript has to be *parsed* and *executed*. Every kilobyte of JS takes work. Mobile CPUs are much slower than desktop CPUs; on a mid-range Android phone, parsing 100 KB of framework JavaScript can take a noticeable amount of time during the most fragile moment of your app — the first few hundred milliseconds after the page loads.
3. **Google measures this and ranks on it.** Since 2020, Google has used a set of metrics called **Core Web Vitals** as real, measurable ranking signals. One of them, **INP** (Interaction to Next Paint), measures how quickly your page responds to a user's first click or tap. Heavy runtime frameworks make INP harder to keep green. You will learn all of this in depth in Module 12, but it is worth knowing right now: **lighter sites are better sites, and Google agrees.**
4. **Bundle size compounds.** Every user, every page, every visit pays the cost. If 100,000 users load a page each day, that is 100,000 copies of your framework transferred and parsed. Every kilobyte you save is 100,000 kilobytes — 100 megabytes — of work the world did not have to do.

Svelte's zero-runtime architecture is not a marketing trick. It is a real, measurable engineering choice that makes your applications faster, your users happier, and your Core Web Vitals score greener without you having to become a performance expert first.

### 1.3 Svelte vs SvelteKit — they are not the same thing

Two names, two jobs, one family. Keep them straight from day one:

| Name        | What it is                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| **Svelte**   | The **component language and compiler**. The thing that turns `.svelte` files into JS + CSS. It knows nothing about pages, URLs, servers, or data. |
| **SvelteKit** | The **application framework** built on top of Svelte. It gives you routing, server-side rendering, data loading, form handling, deployment adapters, and everything else you need to build a real website or web application. |

If Svelte is a single Lego brick, SvelteKit is the instruction manual *and* the baseplate *and* all the other bricks you need to build an entire castle.

In this course, every file you write with a `.svelte` extension is processed by **Svelte**. Every file with a name like `+page.svelte`, `+layout.svelte`, `+page.server.ts`, or `+server.ts` is recognised by **SvelteKit**. You will be using both together from Lesson 1.2 onward. Most of the time you do not even have to think about where one ends and the other begins — but when something breaks, knowing the difference saves you hours.

### 1.4 Node.js and Vite — the invisible tooling

Two more names that will show up constantly:

- **Node.js** is a program that lets you run JavaScript outside the browser — on your computer, from the terminal. Your computer needs Node installed so that the Svelte compiler has somewhere to run. Think of Node as the workbench. You do not usually interact with it directly; other tools use it in the background.
- **Vite** (pronounced *"veet"*, French for "fast") is the development server that SvelteKit uses. When you run `pnpm dev`, Vite is what starts up, watches your files, runs the Svelte compiler the moment you save, and reloads your browser automatically. Vite is also what bundles your app for production when you run `pnpm build`.

You do not need to configure Node or Vite to take this course. They come with SvelteKit and they mostly stay out of your way. But when you hear the terms, you now know exactly what they refer to.

### 1.5 Why the April 2026 version of Svelte is different from older versions

You may see tutorials online that look different from the code in this course. That is because Svelte changed in a big way starting with Svelte 5 (released late 2024), and the April 2026 version (Svelte 5.55+, SvelteKit 2.55+) has introduced even more new features. The most important change is something called **runes** — a small set of special functions like `$state`, `$derived`, and `$effect` that you use to declare reactive values. Older Svelte used a shorter, more magical syntax that new learners found confusing. Runes are explicit, they are typed, and they are easier to reason about. We use them exclusively in this course starting in Module 2.

For this lesson, you do not need to know anything about runes yet. Just know this: **if a tutorial tells you to write `export let` or `<script>` without `lang="ts"`, it is outdated.** Stick to this course and you will always be using the current syntax.

### 1.6 The three blocks of a `.svelte` file

Every Svelte component consists of three blocks, always in the same order. Understanding this structure now saves confusion later:

1. **`<script lang="ts">`** — the logic block. This is where you declare variables, import other components, define types, and write functions. It runs once when the component is created. The `lang="ts"` tells Svelte and your editor that you are writing TypeScript, not plain JavaScript.

2. **The markup** — everything outside `<script>` and `<style>` is the template. It looks like HTML but with superpowers: you can embed JavaScript expressions in curly braces (`{variableName}`), use control flow (`{#if}`, `{#each}`), and render child components as if they were custom HTML elements (`<InfoCard />`). The markup is what the user sees.

3. **`<style>`** — the CSS block. Every rule you write here is automatically scoped to this component. You never have to worry about class name collisions. Svelte adds a unique hash to every selector at compile time, making `.card` in component A completely independent from `.card` in component B.

The order is always `<script>`, then markup, then `<style>`. You can omit any of the three blocks — a component with only markup and style (no script) is perfectly valid. But in practice, most components have all three.

### 1.7 What "compile time" means for your workflow

The phrase "compile time" keeps appearing. Let us make it concrete. When you run `pnpm dev`, several things happen in sequence:

1. Vite watches your filesystem for changes.
2. The moment you save a `.svelte` file, Vite hands it to the Svelte compiler.
3. The compiler reads the three blocks, analyses which state variables exist, which DOM nodes depend on them, and which CSS rules are used.
4. It outputs a `.js` file (the component's runtime code) and a `.css` file (the scoped styles).
5. Vite sends the new code to the browser via Hot Module Replacement (HMR), and the page updates instantly.

This entire process takes 10-50 milliseconds on a modern machine. You save the file and the browser updates before your eyes have time to look at it. That is the developer experience of a compiled framework: the compiler does heavy work fast, during development, so the browser does minimal work at runtime.

### 1.8 What the compiler does — a closer look at the compiled output

Understanding what the Svelte compiler produces helps you reason about performance and debug unexpected behaviour. Consider this simple component:

```svelte
<script lang="ts">
    const name: string = 'Ada';
</script>

<p>Hello, {name}!</p>
```

The compiler turns this into roughly the following JavaScript (simplified for readability):

```js
// Compiled output (simplified)
import { template, text, append } from 'svelte/internal/client';

const root = template('<p> </p>');

export default function Hello_component($$anchor) {
    const name = 'Ada';
    const p = root();
    const text_node = p.firstChild;
    text_node.data = `Hello, ${name}!`;
    append($$anchor, p);
}
```

Notice three things about this compiled output. First, there is no "Svelte runtime" object that manages a virtual DOM. The compiled code directly creates DOM nodes using the `template` helper, which internally uses the browser's native `<template>` element for fast cloning. Second, the variable `name` is used directly — there is no wrapper, no proxy, no observable. Because `name` is a constant (not reactive state), the compiler knows it never changes and generates no update path for it. Third, the CSS scoping happens during compilation too — the compiler rewrites selectors and adds hash classes before anything reaches the browser. The output CSS is a plain stylesheet, not JavaScript-injected styles.

The compiler makes these choices because it can see the *entire* component at once. A runtime framework cannot make these choices because it only sees component code at execution time, when it is too late to optimize statically. This is the fundamental advantage of compilation: move work from the user's device to the developer's device.

### 1.9 "In production" — why a real team chose Svelte

At a 50-developer e-commerce company, the frontend team migrated a product catalogue page from React to SvelteKit. The React version shipped 127 KB of compressed JavaScript — 42 KB was React itself plus ReactDOM, and 85 KB was application code including several third-party state management libraries. After rewriting in Svelte, the total dropped to 38 KB. The page's Largest Contentful Paint (LCP) improved by 1.4 seconds on median 4G connections. The team spent less time optimising because Svelte's compiled output was already small. The key learning: Svelte did not just reduce bundle size — it eliminated entire categories of performance work. The team no longer needed `React.memo`, `useMemo`, `useCallback`, or code-splitting boundaries for the framework itself. When a new developer joined, they could understand the component model in a day because there was no runtime API surface to learn beyond the runes.

### 1.10 The TypeScript angle

Even in Lesson 1.1, TypeScript is quietly protecting you. The three constants in the mini-build are annotated with explicit types:

```ts
const courseName: string = 'Ultimate Frontend';
const lessonNumber: number = 1;
const isUniversityLevel: boolean = true;
```

Without TypeScript, you could accidentally write `const lessonNumber = '1'` (a string) and later try to do arithmetic: `lessonNumber + 1` would produce `'11'` instead of `2`. The type annotation catches this at compile time. In a plain JavaScript file, the bug is silent — the page renders "11" and nobody notices until a user files a ticket. TypeScript makes the compiler your first code reviewer. It checks every line before the code reaches the browser.

### 1.11 Comparing Svelte to other frameworks

| Feature | Svelte 5 | React 19 | Vue 3 | Angular 19 |
|---|---|---|---|---|
| Runtime shipped to browser | ~2-4 KB shared | ~42 KB | ~33 KB | ~65 KB |
| Reactivity model | Compiler-generated signals | Virtual DOM + diffing | Proxy-based | Zone.js + signals |
| Template syntax | Enhanced HTML | JSX (JavaScript) | SFC template | Angular template |
| CSS scoping | Built-in hash | CSS Modules / styled-components | Scoped `<style>` | ViewEncapsulation |
| TypeScript support | First-class via `lang="ts"` | First-class | First-class | Built on TS |
| Compile-time optimisation | Full | Partial (React Compiler) | Partial (Vapor mode) | Partial (Ivy) |

Each framework makes valid engineering choices. Svelte's differentiator is that more work happens at compile time, leaving less for the browser.

### 1.12 Common interview question

**Q: "Explain what it means for Svelte to be a compiled framework, and what concrete advantage that gives over a runtime framework like React."**

**Model answer:** Svelte runs a compiler during the build step that transforms `.svelte` files into plain JavaScript and CSS. The compiler can see every component's template, state, and styles together, so it generates the minimum code needed to create and update the specific DOM nodes in that component. At runtime there is no framework library to download — the output is self-contained. React, by contrast, ships a runtime (~42 KB) that must interpret your component code at runtime, maintain a virtual DOM, and diff it on every state change. Svelte's approach results in smaller bundles (30-70% smaller for equivalent apps), faster initial paint (less JavaScript to parse), and more efficient updates (direct DOM mutations instead of virtual DOM reconciliation). The trade-off is that Svelte requires a compile step — you cannot drop a Svelte component into a plain HTML file the way you can with a React script tag.

## Deep Dive

**Why this matters at scale.** In a 50-component, 20-route production application, the framework choice determines the baseline performance budget, the developer experience, and the long-term maintainability of the codebase. Svelte's compiled model produces bundles that are 30-70% smaller than equivalent React or Vue applications because there is no framework runtime to ship. In concrete terms: a React app with 50 components ships ~45 KB of React + ReactDOM + your 50 components. A Svelte app with 50 components ships only your 50 components (compiled into optimized JS). The framework cost is zero at runtime. For a mobile user on a slow connection, this translates to 200-500ms faster First Contentful Paint — a difference users can feel.

**The mental model.** A compiled framework is like a factory that builds furniture. You (the developer) design a chair (write a `.svelte` file). The factory (the Svelte compiler) builds the chair from raw materials, sands it, paints it, and ships the finished product (compiled JS + CSS) directly to the customer (browser). The customer does not need to assemble anything — the chair arrives ready to sit on. A runtime framework, by contrast, ships the customer a flat-pack box with instructions and a general-purpose toolkit. The customer has to assemble the chair themselves (the browser parses and executes React, which then builds the DOM). The flat-pack is heavier to ship (bigger download) and slower to use (assembly time).

**Edge cases.** The "zero runtime" claim has one important nuance: Svelte does ship a small amount of shared runtime code (approximately 2-4 KB compressed) for features like the transition system, lifecycle management, and the reactive scheduler. This is far smaller than React's 40+ KB but it is not literally zero. The key insight is that this code is shared across all components and loaded once — it does not grow with your application size. Additionally, the compiler cannot optimize code that is only known at runtime (e.g., rendering a component chosen at runtime — in Svelte 5 you render a dynamic component by using a capitalized variable as the tag, like `<Dynamic />` where `Dynamic` is a `$state`/`$derived` value; the old `<svelte:component>` tag is no longer needed — which still requires a small runtime dispatcher). For the vast majority of static component trees, the compiler produces direct DOM operations with no runtime overhead at all.

**Performance implications.** Bundle size directly correlates with three Core Web Vitals metrics. Smaller bundles mean faster download (better LCP), faster parsing (better INP because the main thread is free sooner), and fewer bytes over the wire (lower hosting costs at scale). In benchmarks, Svelte 5 consistently produces smaller bundles and faster update performance than React, Vue, or Angular for equivalent UIs. The April 2026 version's signal-based reactivity system (runes) further reduces the per-component overhead by eliminating the diffing step entirely — when state changes, only the specific DOM nodes that reference that state are updated.

**Connection to other modules.** The compile model introduced here is the foundation for everything that follows. Module 2 uses it to explain why runes are syntactically lightweight (the compiler does the heavy lifting). Module 6 uses it to explain how CSS scoping works (the compiler adds hashes). Module 7 uses it to explain why DOM references (`bind:this`) are safe in effects (the compiler schedules them correctly). Module 8 uses it to explain SSR (the compiler produces both a client and a server render function from the same source). Module 12 uses it to explain why Svelte has a structural performance advantage. Understanding compilation deeply — not just "it makes the code smaller" but "it enables targeted DOM updates with zero abstraction cost" — is what separates a Svelte developer who uses the framework from one who understands it.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/overview](https://svelte.dev/docs/svelte/overview) — the official introduction to Svelte's compilation model and component structure.
- [svelte.dev/docs/kit/introduction](https://svelte.dev/docs/kit/introduction) — SvelteKit's architecture overview, explaining how the app framework layers on top of the component compiler.
- [svelte.dev/docs/svelte/svelte-compiler](https://svelte.dev/docs/svelte/svelte-compiler) — the compiler API, showing how `compile()` and `parse()` work under the hood if you ever need to build tooling.

**Advanced pattern: inspecting the compiled output yourself.** You can see exactly what the Svelte compiler produces for any component by visiting the [Svelte REPL](https://svelte.dev/playground) and clicking the "JS Output" or "CSS Output" tabs. Write a component with a `$state` variable and observe how the compiler generates signal reads and writes. Then change the variable to a plain `const` and watch the signal code disappear. This exercise builds deep intuition for what runes actually cost — and what they do not cost.

**Challenge question (combines Lesson 1.1 + Lesson 1.3 + Lesson 1.5):** A teammate argues that Svelte's compilation step is just "an extra thing that can break" compared to React's simpler model where you just ship JSX and a runtime. Write a three-point response explaining why the compilation step actually *reduces* the number of things that can break, considering: (a) bundle size and parsing time on slow devices, (b) CSS scoping without a runtime, and (c) unused-selector warnings that act as free dead-code detection for styles.

## 2. Style it — The PE7 baseline that you will use forever

You will establish the full **PE7 CSS architecture** (tokens, layers, fluid clamps, OKLCH colors, everything) in Lesson 1.5. For this very first lesson we use an already-populated `src/app.css` so you can see what PE7 looks like in action before you have to build it yourself.

Look at the `<style>` block in the mini-build file below. Notice three things:

1. Every color comes from a variable starting with `--color-…`. You will never see a raw hex code, a raw `rgb()`, or a raw `oklch()` literal outside of the `app.css` token file. The whole point of the token system is that colors live in exactly one place.
2. Every space (padding, margin, gap) uses variables starting with `--space-…`. Same rule: spacing lives in one place.
3. The `<style>` block is **scoped**. Svelte will add a unique hash to every class name so that `.greeting-card` in this file is not the same `.greeting-card` as in any other file. You can prove this by opening DevTools after you run the mini-build, as we will do in step 4 below.

If any of this feels abstract right now, that is expected. You are seeing the ingredients. In Lesson 1.5 you will build the recipe.

## 3. Interact — Nothing yet, and here is why

A Svelte file can have JavaScript or TypeScript in its `<script>` block. For this lesson we deliberately only put **typed constants** in there (`string`, `number`, `boolean`) — values that never change. There is no clicking, no reactivity, no state.

We do this for a reason. We want you to see the absolute simplest possible Svelte file first — the one that looks most like HTML — before we introduce reactivity. If we threw `$state`, `$derived`, and `$effect` at you in Lesson 1.1, you would never stop to notice the things that actually matter in this lesson: the three-block structure, the compiled output, and the scoped CSS.

Lesson 1.2 sets up the SvelteKit project on your machine. Lesson 1.4 introduces variables with real types. Lesson 2.1 introduces your first rune, `$state`. By the time you reach that rune, you will already be comfortable with everything around it.

## 4. Mini-build — A typed, styled "Hello World" card

**File:** `src/routes/modules/01-foundation/01-what-is-svelte/+page.svelte`

This file is already in the repository for you to read and run. Here is a simplified version of its contents for reading comfort:

```svelte
<script lang="ts">
    const courseName: string = 'Ultimate Frontend';
    const lessonNumber: number = 1;
    const isUniversityLevel: boolean = true;
</script>

<svelte:head>
    <title>Lesson 1.1 · What Svelte is</title>
</svelte:head>

<section class="page stack">
    <header>
        <p class="eyebrow">Lesson 1.1 · Mini-build</p>
        <h1>Hello from a compiled component</h1>
    </header>

    <article class="greeting-card">
        <p class="greeting-card__label">Course</p>
        <p class="greeting-card__value">{courseName}</p>

        <p class="greeting-card__label">Lesson number</p>
        <p class="greeting-card__value">{lessonNumber}</p>

        <p class="greeting-card__label">University level?</p>
        <p class="greeting-card__value">{isUniversityLevel ? 'Yes' : 'No'}</p>
    </article>
</section>

<style>
    .greeting-card {
        padding: var(--space-lg);
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
    }

    .greeting-card__label {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        text-transform: uppercase;
    }

    .greeting-card__value {
        font-size: var(--text-lg);
        font-weight: 600;
    }
</style>
```

### Run it

```bash
pnpm install   # once, from the repo root
pnpm dev       # starts the SvelteKit dev server on http://localhost:5173
```

Then open `http://localhost:5173/modules/01-foundation/01-what-is-svelte`.

You should see a card with three rows: **Course**, **Lesson number**, and **University level?**, with the values filled in. The card has rounded corners, a soft shadow, a subtle gradient background, and the text reads cleanly on mobile and desktop.

### Prove that Svelte compiled your CSS with a hash

1. Right-click the card in your browser and choose **Inspect**.
2. Look at the `class` attribute on the `<article>` element. You will see something like `class="greeting-card svelte-1a2b3c4"`.
3. That `svelte-1a2b3c4` suffix is Svelte's work. It is how Svelte guarantees your `.greeting-card` class cannot collide with any other `.greeting-card` in the whole project. There is no CSS-in-JS runtime, no naming convention you have to memorise, no `[data-css]` attribute tricks — just a tiny, unique suffix added at compile time.
4. Now click on one of the `.greeting-card__label` rules in the Styles panel and look at the selector. It will show up as `.greeting-card__label.svelte-1a2b3c4`. That is the full, real selector in your stylesheet. Your author code never had to write the hash; the compiler added it for you.

### Prove that Svelte shipped no runtime

1. In DevTools, open the **Network** tab.
2. Reload the page with the Network tab open.
3. Look at the list of downloaded resources. You will see a file for the page, a small CSS file, and a JavaScript file for the route. You will **not** see a file called `svelte.js` or anything similar. There is no separate "framework runtime" to download — the component you wrote is the whole thing.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In your own words, what is the difference between a runtime framework and a compiled framework?</summary>

A runtime framework ships a library that runs in the browser and interprets your component code at runtime; the user has to download the framework along with your app. A compiled framework runs a compiler on your machine during development and produces plain JavaScript and CSS as output, so the user never has to download the framework itself — only the final code.
</details>

<details>
<summary><strong>Q2.</strong> Name three concrete reasons a compiled framework can be faster than a runtime framework.</summary>

(1) Smaller download size — no framework library to transfer over the network. (2) Less JavaScript to parse and execute on the main thread, which matters enormously on mobile CPUs. (3) Better Core Web Vitals scores, especially INP, because there is less work for the browser to do during the critical first few hundred milliseconds of interaction.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between Svelte and SvelteKit?</summary>

Svelte is the component language and the compiler — it turns `.svelte` files into plain JS and CSS. SvelteKit is the full application framework built on top of Svelte; it adds routing, server-side rendering, data loading, form actions, hooks, and deployment adapters. You can use Svelte on its own for a component library, but to build an actual website or web app you use SvelteKit.
</details>

<details>
<summary><strong>Q4.</strong> What are the three blocks of a <code>.svelte</code> file and what does each one do?</summary>

(1) `<script lang="ts">` — runs when the component is created; this is where variables, types, and logic live. (2) The markup block (the HTML-like part outside `<script>` and `<style>`) — describes what the browser should render. (3) `<style>` — the scoped CSS for this component; Svelte adds a unique hash to every selector so styles never leak out or collide.
</details>

<details>
<summary><strong>Q5.</strong> If a tutorial tells you to write <code>export let name;</code> in a Svelte file, is it current or outdated?</summary>

Outdated. That is Svelte 3/4 syntax. The April 2026 version of Svelte uses the `$props()` rune instead, which you will meet in Module 3. Throughout this course, if you ever see `export let` in tutorial code from the internet, treat it as a red flag that the tutorial is at least a year out of date.
</details>

## 6. Common mistakes

- **Mixing up Svelte and SvelteKit.** If you search "Svelte routing" on Google, you will find results from years ago telling you to install a separate router library. You do not need one. SvelteKit comes with routing built in. Always prefer documentation at **svelte.dev/docs/kit** for SvelteKit topics.
- **Assuming the `<style>` block is global.** Svelte scopes every `<style>` block automatically. If a rule in one file does not apply to an element in another file, that is *correct behaviour*, not a bug. When you genuinely need a global rule — for example, to style the `<body>` — you write it in `src/app.css` instead, which we will cover in Lesson 1.5.
- **Writing `<script>` without `lang="ts"`.** This course is TypeScript-strict from day one. Every `<script>` block must include `lang="ts"`. If you forget, your editor will not show you type errors, and mistakes will slip through that would have been caught for free.
- **Trusting old tutorials.** Svelte has gone through a major evolution — runes, snippets, lowercase event attributes, remote functions. A tutorial from 2023 is almost certainly wrong for Svelte 5.55. Stick to the official docs at **svelte.dev** and to this course.

## 7. What's next

Lesson 1.2 walks you through `pnpm create svelte@latest` and configures a TypeScript-strict SvelteKit project on your own machine — the project you will build every future mini-build inside.
