---
module: 1
lesson: 1.2
title: Project setup with pnpm + SvelteKit 2 + TypeScript strict mode
duration: 45 minutes
prerequisites:
  - Lesson 1.1 — What Svelte is and why it compiles
  - A terminal you are comfortable opening (Terminal on macOS, Windows Terminal on Windows, GNOME Terminal on Linux)
learning_objectives:
  - Install Node.js and pnpm correctly on your operating system
  - Explain why pnpm is preferred over npm and yarn for this course
  - Scaffold a new SvelteKit 2 project from scratch with the official CLI
  - Describe what "TypeScript strict mode" means and why it matters
  - Run the dev server and open your first page in the browser
status: ready
---

# Lesson 1.2 — Project setup with pnpm + SvelteKit 2 + TypeScript strict mode

## 1. Concept — A toolchain that disappears when it's working

### 1.1 The problem with a modern front-end toolchain

Before you can write a single line of Svelte, you need a small stack of programs working together. On a good day you don't notice them: you save a file and your browser updates instantly. On a bad day you notice them *a lot*: a cryptic error scrolls past in your terminal, a package refuses to install, or the dev server starts but the page is blank. This lesson sets up that stack properly once so that every later lesson in the course "just works" when you type `pnpm dev`.

Three programs need to live on your computer for Svelte development to happen: **Node.js** (a JavaScript runtime that lets tools like compilers run outside the browser), **pnpm** (a package manager that downloads and organises the open-source libraries your project depends on), and **SvelteKit** (the application framework itself, installed into each project rather than globally). You met Node and Vite briefly in Lesson 1.1. Now you are going to install them for real.

### 1.2 Why pnpm, not npm or yarn

When you run `pnpm install`, pnpm downloads every package your project needs and puts them in a folder called `node_modules`. Three package managers compete for this job: **npm** (which ships with Node), **yarn**, and **pnpm**. They all do roughly the same thing, but they behave very differently when you work on more than one project at once.

npm and yarn copy every package into every project's `node_modules` folder separately. If ten different projects on your machine all use the same version of `svelte`, that code is on your disk ten times. On a laptop with limited storage, this adds up fast. Installation is also slow because copying files is slow.

pnpm — the name is short for *performant npm* — solves this by using a **content-addressable store**. Every package lives on your disk exactly once, in a central cache. Your projects' `node_modules` folders are filled with tiny symbolic links that point back to that single copy. The result is about three times less disk usage than npm and about twice as fast install speeds. More importantly for a student taking this course, pnpm is **strict** by default: it refuses to let your code use a package you did not explicitly declare as a dependency. That strictness prevents a whole class of bugs where an app works on your machine and breaks on your classmate's.

In this course, every command starts with `pnpm`. If you see a tutorial online telling you to run `npm install <something>`, translate it to `pnpm add <something>` as you go. The underlying package ecosystem is the same — only the front door differs.

### 1.3 What TypeScript strict mode actually is

TypeScript is a language that sits on top of JavaScript. Every valid JavaScript file is a valid TypeScript file, but TypeScript adds **type annotations** and a **type checker** that runs while you type. The type checker reads your code and tells you when you are about to use a value in a way that will crash at runtime — before you ever run it.

TypeScript has many optional safety settings. **Strict mode** turns on all of the important ones at once: `strict: true` in `tsconfig.json`. Among other things, this tells the type checker to complain if any variable could secretly be `null` or `undefined`, to refuse to implicitly assign the type `any` (the "I give up" type) to anything, and to make sure every function parameter has a known type. Non-strict TypeScript is, frankly, not much safer than plain JavaScript. Strict TypeScript catches maybe 80% of the bugs a careful programmer used to catch by running tests or by staring at their screen.

Every file in this course runs under strict mode. Every `<script>` block starts with `lang="ts"`. You will never see `any` in a finished lesson. This is not because the author enjoys typing extra characters — it is because strict TypeScript is genuinely easier to work with once you stop fighting it, and it is the standard every professional Svelte codebase in April 2026 uses.

### 1.4 What `pnpm create svelte@latest` actually does

The command `pnpm create svelte@latest my-app` runs the official SvelteKit scaffolder. It asks you a handful of questions — what template, whether you want TypeScript, whether you want ESLint, Prettier, Vitest, Playwright — and then it writes a working project to a new folder called `my-app`. For this course you will pick the **minimal skeleton** template, **Yes** to TypeScript, and **Yes** to every code-quality add-on (ESLint, Prettier, Vitest, Playwright). Those add-ons come pre-configured and you can ignore them for now; they become important in Module 12.

After the scaffolder finishes, you `cd` into the folder, run `pnpm install` to download dependencies, and then `pnpm dev` to launch the development server. Vite prints a URL — usually `http://localhost:5173` — and you open it. If everything worked, you see the SvelteKit welcome page. Congratulations: the toolchain has disappeared and you can start writing code.

### 1.5 What you will *not* do in this lesson

You are not going to configure Node, npm, pnpm, Vite, or TypeScript by hand. You are not going to memorise `tsconfig.json` settings. Every configuration file the scaffolder gives you is already correct for this course, and you should leave them alone until a later lesson specifically tells you to touch them. Focus on one thing: **getting a green dev server on your machine**.

## 2. Style it — There is nothing to style yet

This lesson has no new styling. The SvelteKit welcome page uses its own styles and we will not modify them. The mini-build route you create at the end uses the PE7 tokens that already live in `src/app.css`, exactly as you saw them in Lesson 1.1. Lesson 1.5 is where you will open `app.css` and understand it in depth.

## 3. Interact — Your first typed constant

There is only one line of TypeScript-specific behaviour in this lesson: annotating a constant with its type. Try writing the following inside a new component's `<script lang="ts">` block.

First, the mistake:

```ts
const startedAt = 'yesterday';
startedAt = 'today'; // TypeScript error: Cannot assign to 'startedAt' because it is a constant.
```

This is not a new idea — it is regular JavaScript — but notice what TypeScript adds: it tells you *exactly* which line of your file caused the problem, and it tells you *before* you run the program. Now the fix:

```ts
let startedAt: string = 'yesterday';
startedAt = 'today'; // OK — let is reassignable
```

The `: string` part is the type annotation. It tells TypeScript that `startedAt` must always hold a string and nothing else. If you later wrote `startedAt = 42`, TypeScript would refuse. Lesson 1.4 goes much deeper into type annotations; for today, just knowing this one pattern is enough.

## 4. Mini-build — A verified, running SvelteKit project + your first route

### Step 1 — Install Node.js (if you don't have it)

Open a terminal and run:

```bash
node --version
```

If you see something like `v22.0.0` or higher, you already have Node. If you see "command not found", install it:

- **macOS / Linux:** install [fnm](https://github.com/Schniz/fnm) (a small, fast Node version manager) and then run `fnm install 22 && fnm use 22`.
- **Windows:** download the LTS installer from [nodejs.org](https://nodejs.org) and run it.

### Step 2 — Install pnpm

```bash
npm install -g pnpm
pnpm --version
```

You should see `9.x.x` or newer.

### Step 3 — Scaffold the project

```bash
pnpm create svelte@latest ultimate-frontend-playground
cd ultimate-frontend-playground
```

When the scaffolder asks, pick:

- Template: **Skeleton project**
- Type checking: **Yes, using TypeScript syntax**
- Additional options: tick **ESLint**, **Prettier**, **Vitest**, **Playwright**

### Step 4 — Install dependencies and run

```bash
pnpm install
pnpm dev
```

You should see Vite print a URL, typically `http://localhost:5173`. Open it. The SvelteKit welcome page should appear.

### Step 5 — Your first route

Create a new file at `src/routes/modules/01-foundation/02-project-setup/+page.svelte` with the contents below.

**File:** `src/routes/modules/01-foundation/02-project-setup/+page.svelte`

```svelte
<script lang="ts">
    const nodeVersion: string = '22';
    const packageManager: string = 'pnpm';
    const typescriptStrict: boolean = true;
</script>

<svelte:head>
    <title>Lesson 1.2 · Project setup</title>
</svelte:head>

<section class="page stack">
    <a href="/modules/01-foundation">← Module 1</a>
    <h1>Your toolchain is working</h1>
    <ul class="checks">
        <li>Node {nodeVersion}+</li>
        <li>Package manager: {packageManager}</li>
        <li>TypeScript strict: {typescriptStrict ? 'on' : 'off'}</li>
    </ul>
</section>
```

Save the file. Vite's hot reload should update the browser instantly — no manual refresh needed.

### DevTools verification

1. Open DevTools → Network tab.
2. Reload the page.
3. Note that there is **no** `svelte.js` framework bundle. Just your route's own compiled code.
4. Open DevTools → Console. It should be silent. Any red error here means TypeScript or Svelte caught a real problem; read the message carefully.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does this course use pnpm instead of npm?</summary>

pnpm stores each package once in a central disk cache and fills `node_modules` with symbolic links, saving disk space and installing much faster than npm. It is also stricter about requiring declared dependencies, which prevents a class of "works on my machine" bugs.
</details>

<details>
<summary><strong>Q2.</strong> In plain English, what does TypeScript "strict mode" do for you?</summary>

It turns on every important safety setting at once: no implicit `any`, no silently ignored `null`/`undefined`, every function parameter must have a known type. The result is that the type checker catches roughly 80% of the bugs you would otherwise find at runtime.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between Node.js and Vite?</summary>

Node.js is a JavaScript runtime — it lets JavaScript run outside the browser. Vite is a development server that *uses* Node.js. Vite is what watches your files, runs the Svelte compiler on save, and reloads your browser. Without Node there would be nothing for Vite to run on.
</details>

<details>
<summary><strong>Q4.</strong> What files should you not touch in a freshly scaffolded project?</summary>

`tsconfig.json`, `svelte.config.js`, `vite.config.ts`, `package.json`, and the files in `node_modules`. The scaffolder already set them up correctly for this course. Later modules will specifically tell you when to edit any of these.
</details>

<details>
<summary><strong>Q5.</strong> You run <code>pnpm dev</code> and the terminal prints nothing for 10 seconds before the URL appears. Should you panic?</summary>

No. The first run compiles everything from scratch and warms up caches. Subsequent runs start in under a second. If the command hangs for longer than a minute, then investigate.
</details>

## 6. Common mistakes

- **Running the scaffolder outside an empty folder.** `pnpm create svelte@latest my-app` will refuse to overwrite existing files. Create a fresh directory for every new project.
- **Mixing package managers.** If you run `npm install` *and* `pnpm install` in the same project, you will end up with two different lock files and two different `node_modules` trees. Pick pnpm and stay with it.
- **Forgetting `lang="ts"` on `<script>`.** Without it, your script runs as plain JavaScript and TypeScript catches nothing. Your editor will show zero type errors even when there are many. Every `<script>` in every file in this course is `<script lang="ts">`.
- **Port 5173 already in use.** If another dev server is already running, Vite picks 5174, 5175, and so on. Check the URL the terminal actually prints — don't assume it is 5173.

## 7. What's next

Lesson 1.3 takes apart a single `.svelte` file and explains exactly what each of its three blocks — `<script>`, markup, and `<style>` — is for.
