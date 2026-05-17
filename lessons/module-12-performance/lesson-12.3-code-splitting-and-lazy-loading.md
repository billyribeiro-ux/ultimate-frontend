---
module: 12
lesson: 12.3
title: Code splitting and lazy loading
duration: 50 minutes
prerequisites:
  - Lesson 12.1 — Core Web Vitals
  - Module 8 — file-based routing
learning_objectives:
  - Explain what a bundle is and why a smaller initial bundle improves LCP and INP
  - Use SvelteKit's automatic per-route code splitting
  - Lazy-load a component on demand with dynamic import()
  - Render a lazy component with {#await import('./X.svelte') then {default: X}}
  - Distinguish when to split and when not to
status: ready
---

# Lesson 12.3 — Code splitting and lazy loading

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Shipping less JavaScript is almost always a bigger win than making existing JavaScript faster. This lesson is about shipping less.

## 1. Concept — The initial bundle is the performance ceiling

### 1.1 What a bundle is, quickly

When Vite (the bundler SvelteKit uses) packages your app for production, it produces a set of files called **chunks**. Each chunk is a `.js` file containing a subset of your application's code. The browser downloads, parses, and executes the chunks it needs for the current page. Chunks are the unit of shipping JavaScript; bundle size is the sum of every chunk that runs before the page is interactive.

Smaller initial bundle → less to download → less to parse → earlier LCP → smaller INP budget used up by startup. Every kilobyte counts twice: once on the network and once on the CPU. On mobile, CPU is usually the tighter constraint.

### 1.2 SvelteKit's automatic per-route splitting

Before you write any code, you are already benefiting from SvelteKit's built-in splitting. Each route in `src/routes/` becomes a separate chunk at build time. A user landing on `/about` downloads only the chunks needed for that page; the code for `/admin` is downloaded lazily the first time the user clicks a link to it. SvelteKit even *preloads* chunks on hover or touchstart so the navigation feels instant without loading everything up front.

You do not have to configure this. It is the default. Your only job is to not defeat it — see Section 1.4 for the two common ways people accidentally do.

### 1.3 Dynamic import() — per-component splitting

Per-route splitting is coarse. Sometimes a single route has a large component that only appears *sometimes* — a chart that loads when the user clicks a button, a 3D canvas that only renders if the user scrolls to it, a rich-text editor that opens in a modal. Those components should not be in the initial route chunk. Dynamic `import()` pulls them out.

```ts
// Instead of:
import Chart from './Chart.svelte';

// Do:
const Chart = (await import('./Chart.svelte')).default;
```

`import(path)` returns a `Promise<Module>`. The bundler sees the dynamic call at build time and emits a separate chunk for the target module. At runtime, the promise resolves when the chunk has been downloaded. The code for `Chart.svelte` is now only in the browser if the user actually needs it.

### 1.4 The `{#await}` pattern in Svelte 5 templates

Inside a Svelte template, the idiomatic way to render a lazy component is Svelte's `{#await}` block combined with a destructured dynamic import:

```svelte
<script lang="ts">
	let showChart = $state<boolean>(false);
</script>

<button type="button" onclick={() => (showChart = true)}>Show chart</button>

{#if showChart}
	{#await import('./Chart.svelte') then { default: Chart }}
		<Chart />
	{:catch error}
		<p>Failed to load chart: {error.message}</p>
	{/await}
{/if}
```

Read the block top to bottom:

1. The button sets a reactive flag.
2. The `{#if}` delays the `import()` until the flag becomes true.
3. `{#await import('./Chart.svelte') then { default: Chart }}` destructures the default export from the resolved module into a local binding named `Chart`.
4. `<Chart />` renders it.
5. `{:catch}` handles the case where the chunk fails to load (bad network, stale deploy, etc).

While the promise is pending, Svelte renders nothing (unless you add a `{:then}` placeholder or a loading spinner in the initial slot). The delay is usually invisible — chunks load quickly once the request is in flight.

### 1.5 When *not* to split

Dynamic imports have a cost. Each split point is a separate network round trip, which means a new request, a new parse, and a new render pass. For tiny components (a 1 KB button), the overhead of the extra fetch is larger than the saved bundle bytes. The rule of thumb:

- **Split if the component is at least a few KB minified and renders only conditionally.** Charts, 3D canvases, rich-text editors, modals, heavy admin-only widgets.
- **Do not split trivial or always-visible components.** A `<Button>` that appears on every page should live in the main bundle.

You also should not split across critical-path code. If the component is required to paint the LCP, splitting it delays LCP by one network round trip. Keep the LCP candidate in the initial chunk.

### 1.6 Two common ways people accidentally ship huge bundles

1. **A single barrel file (`index.ts`) that re-exports every component in a library.** Importing one component pulls the whole barrel into the bundle because the bundler cannot always prove that the other exports are unused. Import components from their specific files instead.
2. **A third-party library imported at the top level.** If you only use `lodash.debounce`, but you write `import _ from 'lodash'`, you have just added 70 KB of lodash to your bundle. Import specific functions: `import debounce from 'lodash.debounce'` or `import { debounce } from 'lodash-es'`.

Both of these show up clearly in `vite build` output. Inspect the summary table; anything unexpectedly large is almost always one of these two mistakes.

### 1.x What SvelteKit does under the hood for code splitting

SvelteKit automatically code-splits your application at the route level:

1. Each route (`+page.svelte` + its imports) becomes a separate chunk in the build output.
2. When the user navigates to a new route, SvelteKit dynamically imports the route's chunk.
3. The initial page load only downloads the chunks needed for the current route + shared layout components.
4. Prefetching: SvelteKit prefetches route chunks when the user hovers over a link (via `data-sveltekit-preload-data`), so the chunk is already downloaded when they click.

For components within a route, you can manually code-split with dynamic `import()`:

```svelte
{#await import('./HeavyChart.svelte') then { default: Chart }}
    <Chart data={chartData} />
{/await}
```

This loads `HeavyChart` only when the `{#await}` block renders, keeping the initial bundle lean.

> **In production sidebar.** Our SvelteKit app has 42 routes. Without code splitting, the total JS bundle would be 380 KB. With SvelteKit's automatic route-based splitting, the initial route loads 45 KB of JS and each subsequent navigation adds 5-15 KB per route chunk. We also dynamically import three heavy components (a markdown editor, a chart library, and a date picker) that together weigh 120 KB. These load only on the pages that use them. The result: our Time to Interactive is 1.2s on mobile, compared to 3.8s without splitting.

### 1.x Common interview question

**Q: "How does code splitting work in SvelteKit, and what can you do beyond the automatic route-based splitting?"**

**Model answer:** SvelteKit automatically code-splits at the route level — each page's component and its direct imports become a separate JavaScript chunk. The initial page load downloads only the chunks needed for the current route. Navigations trigger dynamic imports of the target route's chunk. Beyond this automatic splitting, you can manually split heavy components using dynamic `import()` inside `{#await}` blocks or `$effect` hooks. This is useful for large third-party libraries (chart libraries, editors, 3D renderers) that are only needed on specific pages or after user interaction. SvelteKit also prefetches route chunks on link hover, so navigations feel instant even though the code was split.

## Deep Dive

**Why this matters at scale.** Code splitting reduces initial JS payload. SvelteKit auto-splits at route boundaries. Dynamic import() creates additional split points.

**The mental model.** import() returns a Promise resolving to the module. Vite creates a separate chunk at each import() boundary. The chunk loads on first call.

**Edge cases.** Dynamic import paths must be statically analyzable. Template literal paths with variables do not split correctly. Use explicit paths.

**Performance implications.** Each code-split chunk adds one HTTP request. HTTP/2 multiplexing mitigates the cost. The tradeoff is smaller initial bundle vs more requests.

**Connection to other modules.** Module 12.2's image lazy loading uses IntersectionObserver. Module 7's GSAP plugins benefit from dynamic import.


## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — A button that reveals a heavy component

The mini-build has a "Show heavy widget" button. The widget is a simple fake heavy component (a big table of computed numbers) loaded via dynamic import. Per-page accent: `oklch(68% 0.2 60)` (orange).

- The button has a minimum 44px touch target.
- A short loading message appears while the chunk is in flight.
- `prefers-reduced-motion` disables the button's scale transition.

## 3. Interact — Lazy import with await

The whole lesson is the `{#await import('./HeavyWidget.svelte')}` pattern. Before the button is clicked, the `HeavyWidget.svelte` file is not in the browser at all. After the click, a new chunk is fetched, and the widget mounts.

## 4. Mini-build — A lazy widget revealed on demand

**File:** `src/routes/modules/12-performance/03-code-splitting/+page.svelte`
**Companion:** `src/routes/modules/12-performance/03-code-splitting/HeavyWidget.svelte`

The page has a single button. Clicking it triggers the dynamic import and renders the heavy widget inside an `{#await}` block.

### DevTools moment

Open the Network tab and filter to "JS". Reload the page and count the chunks that are downloaded. Now click the button — a new chunk appears, named something like `HeavyWidget-<hash>.js`. That chunk did not exist in memory before you clicked. This is the whole argument for dynamic imports in one filmstrip.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does SvelteKit already split per route?</summary>

Because the simplest optimisation for a multi-page app is "don't ship the code for page B when the user is on page A". SvelteKit's router knows the route boundary, so it builds one chunk per route and preloads the next one on hover. You get this for free without writing any code.
</details>

<details>
<summary><strong>Q2.</strong> What does <code>import('./Chart.svelte')</code> return?</summary>

A `Promise` that resolves to the module's exports. The default export lives on `.default`. The bundler sees the call at build time and splits the target module into its own chunk. At runtime, the chunk is fetched lazily.
</details>

<details>
<summary><strong>Q3.</strong> Why is splitting a trivial component counter-productive?</summary>

Each dynamic import adds a network round trip. For a small component, the overhead of the extra request is larger than the saved bundle bytes. Split big, conditional, or rarely-used components; keep small or always-used components in the main chunk.
</details>

<details>
<summary><strong>Q4.</strong> How does a barrel file accidentally inflate a bundle?</summary>

A barrel (`index.ts` that re-exports many modules) makes it harder for the bundler to prove that unused exports can be dropped. In the worst case, the entire barrel is pulled in. Import directly from the specific module file instead of through the barrel.
</details>

<details>
<summary><strong>Q5.</strong> Should the LCP element be behind a dynamic import?</summary>

No. The LCP candidate must be in the initial chunk; a dynamic import adds a round trip that delays LCP directly. Lazy-load anything *except* the thing Lighthouse is measuring.
</details>

## 6. Common mistakes

- **Importing the entire library.** `import * as _ from 'lodash'` drags 70 KB into the bundle. Use named imports.
- **Splitting too small.** The round trip costs more than the bytes saved for components under a few KB.
- **Forgetting the `{:catch}`.** Dynamic imports can fail (flaky network, stale deploy, offline). Always handle the failure.
- **Splitting the LCP candidate.** Moves LCP in the wrong direction.

## 7. What's next

Lesson 12.4 turns from code *delivery* to code *execution*, with a deep look at `$effect` and how to stop it re-running when you do not mean to.
