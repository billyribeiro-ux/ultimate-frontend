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
