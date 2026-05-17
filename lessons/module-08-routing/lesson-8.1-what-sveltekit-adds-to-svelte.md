---
module: 8
lesson: 8.1
title: What SvelteKit adds to Svelte
duration: 45 minutes
prerequisites:
  - Module 1 through Module 7 (components, reactivity, styling, animation)
  - Comfort with TypeScript interfaces and typed arrays
learning_objectives:
  - Explain in your own words where Svelte ends and where SvelteKit begins
  - Name the five biggest features SvelteKit adds on top of the Svelte compiler
  - Describe why file-based routing exists and what problem it solves
  - Identify which part of a broken app (Svelte or SvelteKit) is failing when you see a specific error
  - Open the SvelteKit docs to the right page without guessing
status: ready
---

# Lesson 8.1 — What SvelteKit adds to Svelte

## 1. Concept — Two products, one family

### 1.1 The problem — components alone do not make a website

For the first seven modules you wrote `.svelte` files. Each file described a single piece of a user interface: a button, a form, a card, an animated hero. You learned reactivity with runes, you learned styling with PE7 tokens, you learned how to orchestrate GSAP timelines. Every one of those files could be compiled by the Svelte compiler on its own, with nothing else around it.

But a real website is not a pile of components. A real website has **URLs**. It has a home page at `/`, an about page at `/about`, a blog at `/blog`, and a dynamic page at `/blog/some-post`. When the user types a URL into the address bar, something has to look at that URL, decide which component to render, fetch any data that component needs from a server, turn the result into HTML, send it to the browser, and then hand control over to the JavaScript in the browser so that clicks and forms start working.

That "something" is not Svelte. Svelte is only a compiler for components. If you tried to build a real website with just Svelte, you would have to write — by hand — a router, a development server, a production bundler, a data-loading system, a form-handling system, a deployment adapter, a server-side rendering pipeline, and a hydration system. That is an enormous amount of plumbing, and every Svelte developer would end up writing the same plumbing slightly differently. The web would be a mess.

**SvelteKit is the answer to that problem.** It is a framework built on top of Svelte that writes all of the plumbing for you, exposes it through a small number of file conventions, and gets out of your way.

### 1.2 What SvelteKit actually is

Think of SvelteKit as four things in one package:

1. **A router.** SvelteKit looks at a folder called `src/routes` and turns its file tree into URLs. A file named `src/routes/+page.svelte` is the home page. A file named `src/routes/about/+page.svelte` is `/about`. There is no configuration file listing your routes; the routes *are* the files.
2. **A data-loading system.** Alongside each `+page.svelte` you can put a `+page.ts` (or `+page.server.ts`) that exports a function called `load`. SvelteKit calls that function before rendering the page, passes the result into your component as `data`, and fully types the whole thing for you. That is the topic of Module 9A.
3. **A server-side renderer.** Every page is rendered to HTML on the server first, so the first byte the browser receives already contains the content. Search engines see real HTML. Social previews see real HTML. Users on slow connections see real HTML. That is the topic of Lessons 8.2 and 8.3.
4. **A universal deployment target.** When you are done, you pick an adapter (`adapter-node`, `adapter-vercel`, `adapter-cloudflare`, `adapter-static`) and the same codebase ships to any of them. You do not rewrite your app for each platform.

On top of those four, SvelteKit also adds hooks (middleware that sees every request — Lesson 8.9), form actions (Module 10), layouts (Lesson 8.5), error boundaries (Lesson 8.4), and in April 2026 a very new feature called **remote functions** (Module 9B) that lets you call typed server functions directly from a component.

### 1.3 Why file-based routing exists

Before file-based routing, every framework expected you to write a routing configuration — usually a big JavaScript object or a JSX tree — that mapped URL patterns to component imports. That approach has three problems. First, it duplicates information: the file already has a name and a folder, but the config has to repeat that information. Second, it hides the relationship between URL and file: to find the component for `/blog/[slug]` you had to grep the config. Third, it means that adding a new page is a two-step operation: create the file, then register it.

File-based routing solves all three problems in one stroke. The file's location on disk *is* its URL. To add a page you create one file. To move a page you drag its folder. To delete a page you delete its folder. The URL tree is the folder tree. Every other modern framework has since copied this idea from earlier frameworks that pioneered it, and SvelteKit's version is one of the cleanest.

### 1.4 How to tell where Svelte ends and SvelteKit begins

A good heuristic: **if the file is a single component that could be used in any project, it is Svelte. If the file name starts with a `+`, it is SvelteKit.**

| File pattern                  | Who owns it | What it does                                         |
| ----------------------------- | ----------- | ---------------------------------------------------- |
| `Button.svelte`               | Svelte      | A reusable component                                 |
| `+page.svelte`                | SvelteKit   | The page rendered at a URL                           |
| `+layout.svelte`              | SvelteKit   | A shell wrapped around child pages                   |
| `+page.ts` / `+page.server.ts`| SvelteKit   | Data-loading functions                               |
| `+error.svelte`               | SvelteKit   | Error boundary for a route subtree                   |
| `+server.ts`                  | SvelteKit   | Bare HTTP endpoint (no HTML)                         |
| `hooks.server.ts`             | SvelteKit   | Middleware that runs on every server request         |

When something breaks, the file that exploded tells you which docs to open. A reactivity bug in a `.svelte` file points you at **svelte.dev/docs/svelte**. A 404 or a hydration mismatch points you at **svelte.dev/docs/kit**.

### 1.5 What is different in April 2026

Since SvelteKit 2.50 the reactive page state API lives in `$app/state`, not `$app/stores`. Since SvelteKit 2.55 typed route parameters are generated into `$app/types`. Remote functions (query / form / command) are stable and opt-in via `experimental.remoteFunctions: true` in `svelte.config.js`. You will meet each of these in its own lesson.



## Going Deeper

**Official documentation:**
- [SvelteKit docs](https://svelte.dev/docs/kit)
- [Svelte docs](https://svelte.dev/docs/svelte)
- [SvelteKit: Introduction](https://svelte.dev/docs/kit/introduction)

**Advanced pattern:** List every SvelteKit file convention (`+page.svelte`, `+layout.svelte`, etc.) and explain what each does in one sentence.

**Challenge question:** (Combines Lessons 8.1, 8.2, and 8.4) Build a mental model diagram showing how a browser request flows through SvelteKit: URL → routing → load functions → SSR → HTML response → hydration → interactive page.

## 2. Style it — PE7 for the module

The mini-build for this lesson is a table of stack layers. Each row is a card with a left border. We give Module 8 a per-page color personality by setting `--color-brand` to a cool blue (`oklch(70% 0.18 230)`). Svelte-owned layers use a warm accent so the two families are visually distinct. Spacing comes from `--space-*`, type comes from `--text-*`, and the 44px minimum height on every card satisfies touch-target rules. Mobile-first: the grid is one column until `min-width: 480px` is not even needed here — one column scales to any width.

## 3. Interact — typed data that describes the stack

The lesson is conceptual, so the Interact section is also conceptual: we model the stack with a TypeScript `interface` and render it with a keyed `{#each}` block. That is it — no runes, no state, no effects. The point is to practice reading typed data in a SvelteKit route.

```svelte
<script lang="ts">
    interface StackLayer {
        id: string;
        name: string;
        owner: 'Svelte' | 'SvelteKit';
        summary: string;
    }

    const layers: StackLayer[] = [
        /* ... */
    ];
</script>
```

The `owner` field is a union type, not a `string`. That means TypeScript will reject `owner: 'React'` at compile time. Prefer unions over strings whenever the value is one of a fixed set.

## 4. Mini-build — the stack feature map

**File:** `src/routes/modules/08-routing/01-what-sveltekit-adds/+page.svelte`

The route is already in the repository. Open it, read it, then run `pnpm dev` and visit `/modules/08-routing/01-what-sveltekit-adds`. You will see a column of cards. Each card has a coloured left border: cool blue for SvelteKit-owned features, warm red for Svelte-owned features. Hover a card and nothing animates — we have not taught interaction yet in this module.

### Prove the concept in DevTools

1. Open DevTools → Network. Reload. You will see exactly one HTML document and a small JavaScript chunk for the page. There is no framework bundle — that is Svelte's compiled output from Module 1.
2. Open DevTools → Elements. Inspect any `.layer` card. The class name has a `svelte-xxxxxx` hash suffix. That is Svelte's scoped CSS.
3. Right-click the page and choose **View Page Source**. The cards are in the HTML already, not inside an empty `<div id="app"></div>`. That is SvelteKit's SSR, which we will unpack in Lesson 8.2.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In one sentence, what is the difference between Svelte and SvelteKit?</summary>

Svelte is the compiler that turns `.svelte` files into plain JS + CSS; SvelteKit is the full application framework on top of Svelte that adds routing, server-side rendering, data loading, hooks and deployment adapters.
</details>

<details>
<summary><strong>Q2.</strong> You see a filename that starts with <code>+</code>. Which product is responsible for it?</summary>

SvelteKit. The `+` prefix is SvelteKit's convention for special files (`+page.svelte`, `+layout.svelte`, `+page.ts`, `+server.ts`, `+error.svelte`). Plain component files never start with `+`.
</details>

<details>
<summary><strong>Q3.</strong> Why is file-based routing better than a route config object?</summary>

It removes duplication (the filename already contains the route), it makes the URL tree visible in the folder tree, and it turns adding, moving and deleting pages into a one-step operation (create, rename or delete the file).
</details>

<details>
<summary><strong>Q4.</strong> Name three things SvelteKit does that Svelte alone cannot do.</summary>

(1) Route URLs to components. (2) Render components to HTML on the server before any JavaScript runs. (3) Load typed data for a page via `load` functions. Any three of: routing, SSR, data loading, deployment adapters, hooks, form actions, layouts, remote functions.
</details>

<details>
<summary><strong>Q5.</strong> A tutorial tells you to install <code>svelte-routing</code>. Is that advice current?</summary>

No. `svelte-routing` is a third-party router for standalone Svelte apps that do not use SvelteKit. For any real website in 2026 you use SvelteKit's built-in file-based routing. If a tutorial tells you to install a separate router, it is either very old or targeting a non-SvelteKit project.
</details>

## 6. Common mistakes

- **Searching "Svelte router" instead of "SvelteKit routing".** Old Svelte 3 results still rank well on Google and will send you to abandoned libraries. Always prefix searches with "SvelteKit" when the topic is URLs, SSR, hooks or data loading.
- **Copying a Next.js or Remix config pattern.** SvelteKit does not have `next.config.js`-style route rewrites in JavaScript. Its configuration lives in `svelte.config.js` and is intentionally small.
- **Putting logic in `svelte.config.js`.** That file configures the compiler and adapters; it is not a place to import your database client or your auth library. Those belong in `hooks.server.ts` (Lesson 8.9).
- **Using `$app/stores` because an old tutorial said so.** In SvelteKit 2.50+ the reactive page object lives in `$app/state`. We teach only the new API.

## 7. What's next

Lesson 8.2 opens DevTools on a real SSR page and proves, byte by byte, that the HTML arrives fully rendered before any JavaScript executes.
