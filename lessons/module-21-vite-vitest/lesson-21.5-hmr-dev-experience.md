---
module: 21
lesson: 21.5
title: HMR and the dev experience
duration: 50 minutes
prerequisites:
  - "21.1 — What Vite actually does"
  - "21.4 — The plugin system"
  - "2.2 — $state with primitive types"
learning_objectives:
  - Explain how HMR works under the hood including the WebSocket protocol and module invalidation graph
  - Describe why Svelte's HMR preserves component state and when it falls back to a full reload
  - Use the import.meta.hot API to add HMR acceptance to non-component files
  - Diagnose HMR issues using --debug hmr and browser console logging
  - Identify the boundary between state-preserving updates and full reloads
status: ready
---

# Lesson 21.5 — HMR and the dev experience

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — How your browser updates without losing what you typed

### 1.1 The problem: the full-reload tax

Before HMR existed, every code change required a full page reload. You would edit a CSS color, save, and wait for the entire page to reload — losing your scroll position, form data, dropdown selections, and modal states. In a complex application with authentication, you might have to log in again after every change. For a developer making 50 edits per hour, full reloads waste minutes of productivity per session and break the creative flow of iterating on UI.

**Hot Module Replacement (HMR)** solves this by updating only the changed module in the browser — without reloading the page. When you edit a Svelte component's template, the browser patches just that component. When you edit a CSS file, the browser swaps the stylesheet. Your scroll position stays, your form data stays, and your component state (the counter's current value, the accordion's open/closed state) survives.

### 1.2 How HMR works under the hood

HMR has four participants: the **file watcher**, the **Vite server**, the **WebSocket connection**, and the **browser HMR runtime**.

1. **File watcher** — Vite uses `chokidar` (a cross-platform file watcher) to monitor your source files. The moment a file is saved, chokidar emits a change event.

2. **Vite server** — receives the change event, re-transforms the changed file (re-compiling Svelte, re-stripping TypeScript), and consults the **module graph** to determine which modules are affected. It walks the graph upward from the changed module, looking for an **HMR boundary** — a module that has called `import.meta.hot.accept()`.

3. **WebSocket** — Vite sends an update message to the browser over a persistent WebSocket connection established when the page first loaded. The message includes the module's URL, a timestamp, and the type of update (`'js-update'` or `'css-update'`).

4. **Browser HMR runtime** — the Vite client (a small JavaScript file injected into every dev page) receives the WebSocket message. For JS updates, it fetches the new module version from the dev server (with a cache-busting timestamp query), executes the acceptance callback, and the module replaces itself in the module graph. For CSS updates, it replaces the `<link>` tag's `href` attribute, causing the browser to re-fetch the stylesheet without any JavaScript execution.

### 1.3 HMR boundaries and acceptance

An **HMR boundary** is a module that declares it can handle its own updates. In Svelte, `@sveltejs/vite-plugin-svelte` automatically adds HMR acceptance code to every compiled component. This code:

1. Accepts the new module version.
2. Creates a new component class from the updated code.
3. Swaps the old component for the new one in the DOM.
4. Preserves the component's `$state` values by transferring them from the old instance to the new one.

This is why editing a Svelte component preserves state — the plugin handles the swap explicitly.

For plain `.ts` or `.js` files, there is no automatic HMR boundary. If you change a utility function, Vite walks the import graph upward until it finds a boundary (a Svelte component that imports the utility, directly or transitively). If it finds one, it re-renders that component. If it reaches the root without finding a boundary, it triggers a **full page reload**.

### 1.4 When HMR preserves state

HMR preserves Svelte component state in these cases:

- **Template changes** — editing the markup section of a `.svelte` file. The component re-renders with the new template but keeps its `$state` values.
- **Style changes** — editing the `<style>` block. CSS is hot-replaced without any JavaScript re-execution.
- **Adding or removing reactive declarations** — as long as the existing `$state` variables are not renamed or removed.

### 1.5 When HMR falls back to a full reload

HMR triggers a full page reload when:

- **The changed file has no HMR boundary** — a top-level TypeScript file that is not imported by any Svelte component.
- **The module graph is circular** — circular imports confuse the boundary-finding algorithm.
- **The component's script module has syntax errors** — the Svelte compiler cannot produce valid output, so there is nothing to hot-replace.
- **Environment-level changes** — editing `vite.config.ts`, `.env` files, or `svelte.config.js` always requires a manual server restart (not even a full reload — a restart).
- **Adding or removing exports from a module** — the module's interface changed, so dependents cannot safely re-import.

### 1.6 The import.meta.hot API

For non-Svelte files where you want HMR, you use the `import.meta.hot` API:

```typescript
// src/lib/utils/theme.ts
export let currentTheme: string = 'light';

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        if (newModule) {
            currentTheme = newModule.currentTheme;
        }
    });
}
```

The `import.meta.hot` object is only available in dev mode. Vite strips it from production builds. The `accept` method registers a callback that runs when this module is updated. The callback receives the new module, and you decide how to apply the update.

The `if (import.meta.hot)` guard is necessary because `import.meta.hot` is `undefined` in production. Without the guard, production builds would crash.

### 1.7 Diagnosing HMR issues

When HMR is not working (you see full reloads instead of hot updates), use Vite's debug mode:

```bash
pnpm dev -- --debug hmr
```

This logs every HMR event: which file changed, which modules were invalidated, whether a boundary was found, and what update was sent to the browser. Common findings:

- **"no HMR boundary found"** — the changed module is not imported by any module with an acceptance handler. Add `import.meta.hot.accept()` or ensure the chain reaches a Svelte component.
- **"full reload"** — Vite could not find a safe update path. Check for circular imports or errors in the transform output.

In the browser, open DevTools Console and look for `[vite] hot updated:` messages. These confirm which modules were hot-replaced.

### 1.8 "In production" — when understanding HMR prevented a week of frustration

A team of 8 developers noticed that editing any file in `src/lib/stores/` caused a full page reload instead of a hot update. They assumed HMR was broken and considered switching build tools. A senior developer ran `pnpm dev -- --debug hmr` and discovered that all stores imported a shared `config.ts` file that re-exported from `vite.config.ts` — which is outside the HMR boundary. Removing the re-export (and importing config values directly from `$env/static/public` instead) restored HMR for every store file. Total fix time: 20 minutes. Time saved: 8 developers getting instant feedback instead of 3-second full reloads, dozens of times per day, for the rest of the project.

### 1.9 The TypeScript angle

The `import.meta.hot` API is typed via Vite's client type declarations. If your `tsconfig.json` includes `"types": ["vite/client"]` (which SvelteKit projects do by default), TypeScript knows that `import.meta.hot` exists in dev mode and provides autocomplete for methods like `accept()`, `dispose()`, `prune()`, and `invalidate()`. The type is `ImportMetaHot | undefined`, which is why the `if (import.meta.hot)` guard narrows it to `ImportMetaHot` inside the block.

### 1.10 Common interview question

**Q: "Explain how Hot Module Replacement works in Vite and why Svelte components preserve state during HMR."**

**Model answer:** When a file changes, Vite's file watcher detects the save. Vite re-transforms the file and walks the module graph upward to find an HMR boundary — a module that has called `import.meta.hot.accept()`. It sends the updated module to the browser over a WebSocket connection. The browser's HMR runtime fetches the new module version and executes the acceptance callback. For Svelte components, `@sveltejs/vite-plugin-svelte` automatically injects HMR acceptance code during compilation. This code creates a new component class from the updated module, swaps it into the DOM, and transfers the old component's `$state` values to the new instance. State is preserved because the reactive values are separate from the component class — the swap replaces the render logic while keeping the data intact. If no HMR boundary is found, Vite falls back to a full page reload.

## Deep Dive

**The WebSocket protocol in detail.** Vite's HMR uses a custom WebSocket protocol (not the standard `ws://` upgrade — it uses Vite's own message format over a standard WebSocket connection). Messages are JSON objects with a `type` field. Key message types: `'connected'` (initial handshake), `'update'` (module update with a list of changed modules), `'full-reload'` (browser should reload), `'prune'` (removed module), `'error'` (compilation error overlay). You can listen to these messages in the browser console by typing `import.meta.hot.on('vite:beforeUpdate', (payload) => console.log(payload))`.

**Module invalidation graph.** When module A imports module B, and B changes, Vite must re-execute A to pick up the new version of B. But it does not re-execute A's importers unless A itself changes. This is the "invalidation boundary" — the module that accepts the update stops the propagation. In a typical Svelte project, every `.svelte` file is a boundary, so changes to utility files propagate up to the nearest Svelte component and stop there. This is optimal because Svelte components know how to re-render themselves with new data.

**CSS HMR is special.** CSS updates bypass the JavaScript HMR system entirely. Vite injects stylesheets as `<link>` tags with unique query parameters. When a CSS file changes, Vite sends a `css-update` message, and the HMR runtime simply changes the `<link>` tag's `href` to include a new timestamp. The browser re-fetches the stylesheet and applies it instantly — no JavaScript execution, no component re-rendering. This is why CSS changes are the fastest kind of HMR update.

**$effect and HMR interactions.** When a Svelte component is hot-replaced, its `$effect` cleanup functions run (the old component is destroyed) and the new component's effects are created. This means effects that set up external subscriptions (WebSocket connections, event listeners) are correctly torn down and re-established during HMR. However, if an effect modifies external global data (writing to `localStorage`, setting cookies), the cleanup must undo those changes or you may see side effects accumulate across HMR updates.

**Connection to other lessons.** Lesson 21.1 introduced the module graph that HMR depends on. Lesson 21.4 explained how plugins inject HMR acceptance code. Lesson 2.11 covered `$effect` cleanup, which interacts with HMR teardown. The module project uses HMR diagnostics in its `/toolkit/hmr` page.

## Going Deeper

**Official docs to read next:**

- [vite.dev/guide/api-hmr](https://vite.dev/guide/api-hmr) — the full `import.meta.hot` API reference.
- [vite.dev/guide/troubleshooting#hmr](https://vite.dev/guide/troubleshooting) — troubleshooting HMR issues.
- [svelte.dev/docs/svelte/svelte-compiler](https://svelte.dev/docs/svelte/svelte-compiler) — understanding the compiler output that HMR replaces.

**Advanced pattern: custom HMR handlers for stores.** If you have a `.svelte.ts` store that you want to preserve across HMR, you can use `import.meta.hot.data` to persist values between module versions:

```typescript
// src/lib/stores/counter.svelte.ts
let count: number = $state(import.meta.hot?.data?.count ?? 0);

if (import.meta.hot) {
    import.meta.hot.dispose((data) => {
        data.count = count;
    });
    import.meta.hot.accept();
}
```

The `dispose` callback saves the current count before the old module is discarded. The `accept` callback marks this module as an HMR boundary. The initial state reads from `import.meta.hot.data`, which persists across updates.

**Challenge question (combines Lesson 21.5 + Lesson 21.4 + Lesson 21.1):** You notice that editing `src/lib/utils/format.ts` causes a full page reload, but editing `src/lib/components/Card.svelte` (which imports `format.ts`) updates instantly. Explain this behavior using the concepts of module graph traversal, HMR boundaries, and acceptance handlers. Then describe two approaches to make changes to `format.ts` trigger a hot update instead of a full reload.

## 2. Style it — PE7 applied to the HMR demo

The mini-build demonstrates HMR state preservation with a counter. The counter display uses `var(--text-2xl)` with `var(--color-brand)` text. The HMR status indicator uses `var(--color-success)` for connected and `var(--color-error)` for disconnected. The instruction card uses `var(--color-surface-2)` background with `var(--radius-lg)`.

## 3. Interact — a counter that survives edits

The problem: students have used HMR implicitly but do not understand what it preserves and what it loses.

```typescript
interface HmrEvent {
    id: string;
    timestamp: number;
    moduleUrl: string;
    updateType: 'hot' | 'full-reload';
}
```

The interactive element is a counter that persists through HMR. Students increment the counter, then edit the component's template (a label or color) and save. The counter value survives the edit — proving HMR preserved the component state.

## 4. Mini-build — HMR state preservation demo

**File:** `src/routes/modules/21-vite-vitest/05-hmr-dev-experience/+page.svelte`

This page has a counter component that students can increment. The page explains how to test HMR by editing the component's markup and observing that the counter value survives. It also shows a simulated log of HMR events.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/21-vite-vitest/05-hmr-dev-experience`.

### Prove the concept

1. Click the counter button several times to set it to a non-zero value.
2. Open this file in your editor and change the text of the heading (e.g., add a word).
3. Save the file and look at the browser — the heading updates but the counter value is unchanged.
4. Open the browser Console and look for `[vite] hot updated:` messages confirming HMR worked.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is an HMR boundary and why does every Svelte component act as one?</summary>

An HMR boundary is a module that has called `import.meta.hot.accept()`, declaring that it can handle its own updates without requiring its importers to update too. Every Svelte component acts as a boundary because `@sveltejs/vite-plugin-svelte` injects HMR acceptance code during compilation. The acceptance code swaps the old component for the new one while preserving state.
</details>

<details>
<summary><strong>Q2.</strong> Why does editing a .ts utility file sometimes cause a full page reload?</summary>

Plain `.ts` files do not have automatic HMR acceptance handlers. When a `.ts` file changes, Vite walks the module graph upward looking for an HMR boundary. If the file is not imported by any Svelte component (or any other module with `import.meta.hot.accept()`), Vite reaches the root without finding a boundary and falls back to a full page reload.
</details>

<details>
<summary><strong>Q3.</strong> How do CSS changes bypass the JavaScript HMR system?</summary>

CSS files are injected as `<link>` tags. When a CSS file changes, Vite sends a `css-update` WebSocket message. The browser's HMR runtime simply updates the `<link>` tag's `href` with a new timestamp query parameter, causing the browser to re-fetch the stylesheet. No JavaScript is re-executed, no components are re-rendered — the browser applies the new styles directly.
</details>

<details>
<summary><strong>Q4.</strong> What does the import.meta.hot.dispose callback do?</summary>

The `dispose` callback runs just before the old version of the module is discarded during an HMR update. It receives a `data` object where you can store values that persist to the new module version. This is useful for preserving state in non-component modules (like stores) across hot updates.
</details>

<details>
<summary><strong>Q5.</strong> Why must the import.meta.hot guard use an if statement, not optional chaining?</summary>

The guard `if (import.meta.hot)` is needed because `import.meta.hot` is `undefined` in production builds. Vite uses this guard to tree-shake the entire HMR block from production output. If you used optional chaining (`import.meta.hot?.accept()`), the HMR code would remain in the production bundle as dead code.
</details>

## 6. Common mistakes

- **Assuming all file changes are hot-replaced.** Only modules within an HMR boundary chain are hot-replaced. Changes to config files, env files, or files not imported by any component trigger full reloads or require server restarts.
- **Not checking the browser console for HMR errors.** When HMR fails silently, the console shows `[vite] page reloaded` instead of `[vite] hot updated`. This is your signal that something broke the HMR chain.
- **Expecting HMR to persist across component removals.** If you remove a `$state` variable from a component, HMR cannot transfer a value that no longer exists. The component re-mounts with fresh state for that variable.
- **Mutating global objects in components without cleanup.** If a component adds event listeners to `window` or writes to `localStorage` during creation, HMR will re-run that code, accumulating listeners. Always clean up global side effects in `$effect` return functions.

## 7. What's next

Lesson 21.6 shifts from the dev experience to the production pipeline — you will learn to read Vite's build output, analyze chunk sizes, and verify that tree-shaking eliminated dead code.
