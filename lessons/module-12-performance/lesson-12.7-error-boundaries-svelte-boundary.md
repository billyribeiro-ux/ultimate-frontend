---
module: 12
lesson: 12.7
title: Error boundaries — <svelte:boundary>
duration: 50 minutes
prerequisites:
  - Module 4 — async and error handling
  - Module 8 — SvelteKit SSR
learning_objectives:
  - Wrap a failing subtree in a <svelte:boundary> and recover gracefully
  - Render a custom failure UI with the failed snippet
  - Understand the server-side behaviour added in SvelteKit 2.54+
  - Use the reset action to retry after a failure
  - Log failures for observability without blocking the fallback UI
status: ready
---

# Lesson 12.7 — Error boundaries — `<svelte:boundary>`

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. In production, something will break. A well-placed error boundary contains the break to a small subtree and keeps the rest of the page working.

## 1. Concept — Catch the explosion, keep the plane flying

### 1.1 What an error boundary does

Before Svelte 5.1, a single thrown error inside a component could crash the entire component tree. One broken widget and the whole page disappeared. Svelte's **`<svelte:boundary>`** — stable in 5.x and enhanced in SvelteKit 2.54+ with server-side support — lets you wrap a subtree in an element that catches runtime errors thrown during render, effects, or async work, and renders a fallback UI instead of propagating the error upward.

```svelte
<svelte:boundary>
	<RiskyWidget />

	{#snippet failed(error, reset)}
		<div class="error">
			<p>Something went wrong: {error.message}</p>
			<button type="button" onclick={reset}>Try again</button>
		</div>
	{/snippet}
</svelte:boundary>
```

Read the block top to bottom:

- **The children** are the subtree you want to protect. If anything inside throws, the boundary catches it.
- **The `failed` snippet** is your custom failure UI. It receives the caught `error` and a `reset` function as arguments. Rendering the snippet replaces the children.
- **`reset()`** re-mounts the children and gives them another chance. Use it after the user has fixed whatever caused the failure (for example, reconnected to the network).

The boundary catches errors from synchronous render code, from reactive updates, and from top-level `await` in async components. It does *not* catch errors inside event handlers — those still need explicit `try/catch` — because event handler errors are part of the user's interaction flow, not the component's render flow.

### 1.2 The server-side story

SvelteKit 2.54+ extended `<svelte:boundary>` to work during server-side rendering. Before the extension, an SSR-time error would fail the whole request with a 500 response. With the extension, the boundary catches the error on the server, renders the fallback snippet into the HTML, and the client hydrates the fallback as if it were a normal render. The rest of the page is served as usual.

This is a significant deploy-day upgrade. It means a broken third-party widget — an ad script that throws, an analytics tag that fails to load, a brittle remote data call — does not take down the whole page. The failure is contained to the widget's boundary. The user sees the rest of the page and a small message where the widget used to be.

For boundaries inside pages rendered by `load()`, the boundary catches errors thrown during component render, but data loading errors are still handled by SvelteKit's normal `error()` function and `+error.svelte` pages. The two mechanisms are complementary: `+error.svelte` catches route-level failures before rendering, and `<svelte:boundary>` catches render-level failures inside a successfully-loaded page.

### 1.3 Placing boundaries — small and numerous, not one big one

A single boundary around your entire `+layout.svelte` is better than nothing, but it is the wrong granularity for a good user experience. If one widget fails inside a multi-widget dashboard, a layout-level boundary hides the whole dashboard. A widget-level boundary hides only the broken widget.

The rule: **wrap every independent unit in its own boundary**. Each dashboard card, each sidebar section, each user-submitted embed. The fallback should be sized and styled so that it sits in the slot the failed component would have occupied, without breaking the layout around it. A broken card becomes a small "this card failed" message; the four other cards keep working.

### 1.4 Logging without blocking

A caught error is not a silent error. You want to know in production if a widget is failing, even if the user sees a friendly fallback. The best way is to log from within the `failed` snippet using an `$effect`:

```svelte
{#snippet failed(error, reset)}
	{@const _ = logError(error)}
	<div class="error">
		<p>Something went wrong.</p>
		<button type="button" onclick={reset}>Try again</button>
	</div>
{/snippet}
```

`logError` can be a function that sends the stack trace to your observability backend. The `{@const}` runs once per render of the failure UI; you can also call it inside an `$effect` to rerun on every mount. Whichever pattern you pick, **never swallow the error silently** — a fallback UI that nobody notices is how serious bugs hide for weeks.

### 1.5 Reset semantics

`reset()` clears the boundary's internal error state and re-renders the children. It does not magically fix whatever caused the error — if the same bug strikes again, the boundary catches it again, and the user sees the same fallback. The intended use is for transient failures: a failed `fetch` that may succeed on retry, a timed-out load, a temporarily-unavailable third-party script. For bugs that are deterministic, reset is a courtesy button, not a fix.

A common pattern: render the reset button only when you think retry will help, and show a different message when it will not.

### 1.6 What the boundary does not catch

- **Errors inside `onclick` and other event handlers.** Use `try`/`catch` directly in the handler or wrap the handler body in a small helper.
- **Errors in promises that the component does not await.** Uncaught promise rejections still happen globally. Add a `window.addEventListener('unhandledrejection', ...)` at the root of your app for those.
- **Build-time errors.** If Svelte fails to compile, no boundary helps. Fix the code.

Boundaries are a production safety net, not a bug-hiding mechanism. Use them for failures you cannot prevent at the source, and fix the failures you can.

## 2. Style it — A card that fails gracefully

The mini-build shows a grid of three cards. One card is the "risky" card, which throws on demand. The other two are static. Per-page accent: `oklch(70% 0.18 80)` (caution amber).

- The failure card's fallback is a subdued amber panel with a retry button.
- The fallback honours the same 44px touch-target rule as every other button.
- `prefers-reduced-motion` is honoured by disabling the retry button's transition.

## 3. Interact — Throw on demand, recover on demand

A button inside the risky card throws an error when clicked. The boundary catches the next render, the fallback appears, the two neighbouring cards are unaffected. A second button on the fallback calls `reset()`, and the risky card remounts and resumes.

## 4. Mini-build — Three cards, one protected

**File:** `src/routes/modules/12-performance/07-error-boundaries/+page.svelte`

Renders three dashboard cards. The middle card contains a throw-on-demand component wrapped in `<svelte:boundary>`. The student can toggle the error state and watch the boundary do its job.

### DevTools moment

Open the Console. Click the "throw" button inside the risky card. Notice that the error still shows up in the console (good — observability) but the UI does not crash. Inspect the DOM and confirm that the `failed` snippet content is now where the component used to be. Click reset and watch the original subtree remount.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What kinds of errors does <code>&lt;svelte:boundary&gt;</code> catch?</summary>

Errors thrown during render, during reactive updates, and during component-level `await`. It does not catch errors inside event handlers, unhandled promise rejections that the component did not await, or build-time errors.
</details>

<details>
<summary><strong>Q2.</strong> Why place many small boundaries instead of one large one?</summary>

Granularity. A boundary around the entire layout hides the whole page when any component fails. A boundary around each independent widget hides only the broken widget and keeps the rest of the page usable. The user experience is dramatically better with small, scoped boundaries.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>reset()</code> do?</summary>

It clears the boundary's internal error state and re-renders the children. It does not fix the underlying bug; if the same error recurs, the fallback returns. Use reset for transient failures (network, timing) where retrying has a reasonable chance of success.
</details>

<details>
<summary><strong>Q4.</strong> What changed in SvelteKit 2.54+?</summary>

Boundaries now work during server-side rendering. Before the extension, an SSR-time error would fail the whole request. After, the boundary catches the error on the server, renders the fallback into the HTML, and the client hydrates normally. Broken widgets no longer take down the page.
</details>

<details>
<summary><strong>Q5.</strong> Should a boundary silently swallow the error?</summary>

Never. Always log caught errors to an observability backend. A silent fallback is how serious bugs hide for weeks. The user sees the fallback; your on-call engineer sees the stack trace.
</details>

## 6. Common mistakes

- **One boundary around the whole app.** Too coarse. Scope them per widget.
- **Using a boundary instead of fixing a bug.** Boundaries are a safety net, not a bug hider. Fix the bugs you can reach.
- **Forgetting to log.** Observability is the other half of error handling.
- **Expecting boundaries to catch event handler errors.** They do not. Use `try/catch` in the handler.

## 7. What's next

Lesson 12.8 steps back from errors to the user: ARIA, keyboard navigation, and focus management — accessibility as a non-negotiable baseline.
