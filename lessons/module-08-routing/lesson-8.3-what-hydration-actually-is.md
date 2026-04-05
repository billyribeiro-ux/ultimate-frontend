---
module: 8
lesson: 8.3
title: What Hydration actually is
duration: 50 minutes
prerequisites:
  - Lesson 8.2 — What SSR actually is
  - Comfort with $state, $effect and onMount
learning_objectives:
  - Explain hydration as a handover, not a re-render
  - Identify the moment in the network waterfall when a page becomes interactive
  - Reproduce and diagnose a hydration mismatch
  - Use <svelte:boundary> to catch hydration errors gracefully
  - Decide which code should run on the server, on the client, or in both
status: ready
---

# Lesson 8.3 — What Hydration actually is

## 1. Concept — The handover from static HTML to live components

### 1.1 The problem — SSR gives us pixels, but not interactivity

Lesson 8.2 showed that SvelteKit sends the finished HTML on the first byte. Pixels appear instantly. But pixels are not an application. A button in that HTML is just a `<button>` element; it has no `onclick` handler yet. A form has no submit logic. A `$state` counter sits at its initial value with no way to update. The page looks done but it is frozen.

Something has to bridge the gap. Something has to walk the existing DOM, attach event listeners, connect reactive state back to the elements that display it, and turn the static HTML into a live Svelte application — without throwing the HTML away and rebuilding it. That step is called **hydration**.

The word is borrowed from a kitchen analogy: the server sent you a dried, lightweight skeleton (HTML), and the browser adds water (JavaScript) to bring it back to life. The name is memorable but the mechanics are what matter.

### 1.2 What hydration actually does

When the JavaScript bundle finishes downloading and starts executing, SvelteKit does roughly this:

1. It finds each component that was rendered on the server. The compiler has left small markers in the HTML so it knows which elements belong to which component.
2. For each component, it creates the Svelte runtime objects — `$state` variables, `$derived` computations, `$effect` blocks — exactly as if the component were being mounted for the first time.
3. Instead of creating new DOM nodes for the output, it **claims the existing nodes** the server left behind. It walks the DOM, matches it to what the component would have produced, and wires its reactive system to those nodes.
4. It attaches every event listener (`onclick`, `oninput`, `onsubmit`) to the right elements.
5. It runs every `$effect` and every `onMount` callback, in order.

After step 5, the page is **hydrated**. `$state` updates now cause DOM updates. Clicks now fire handlers. Forms now submit. The user sees no visible change — the pixels were already correct — but the page is now alive.

### 1.3 The "interactive" moment and why it matters

There is a real, measurable moment in the page's lifetime: **before hydration finishes, clicks do nothing**. You can tap a button, and until the JavaScript has downloaded, parsed, executed and hydrated that component, nothing happens. On a fast desktop this window is tens of milliseconds. On a mid-range Android phone with a 200 KB hydration bundle, it can be half a second or more.

This window has a name in Core Web Vitals. **INP** (Interaction to Next Paint) measures the delay between a user's interaction and the next paint the browser makes in response. A slow hydration makes INP worse, because the browser cannot respond to the click until hydration reaches the button. SvelteKit's hydration is small and fast by design, but you still have to be aware that interactivity is not instant.

### 1.4 Hydration mismatches — when the HTML lies

Hydration only works if the component that runs on the client produces **exactly the same** markup as the component that ran on the server. If they disagree, Svelte does not know which version is correct, and it will log a warning like:

> `Hydration failed because the initial UI does not match what was rendered on the server.`

The two commonest causes are:

1. **Time-dependent values without synchronization.** If your component calls `new Date()` in its top-level script and prints it in the markup, the server writes *"2026-04-05T14:22:01Z"* into the HTML, the client re-renders with *"2026-04-05T14:22:02Z"*, and the strings do not match.
2. **Values from `window`, `localStorage`, or browser-only APIs.** On the server these are undefined, so the server produces one markup; on the client they have values, and the client produces different markup.

The fix is always the same: **do not run code that depends on "now" or "the browser" at the top level**. Run it inside an `$effect` or `onMount` block, which fires only on the client *after* hydration completes. The server then renders a placeholder, and the client fills it in on its own.

### 1.5 `<svelte:boundary>` — catching hydration errors gracefully

Svelte 5.10+ introduced `<svelte:boundary>`, an error boundary you can wrap around a subtree. If a component inside the boundary throws during rendering *or during hydration*, the boundary catches the error and renders a fallback snippet instead of letting the whole page crash. It is the React error boundary idea, ported to Svelte.

```svelte
<svelte:boundary>
    <FlakyWidget />

    {#snippet failed(error, reset)}
        <p class="error">The widget failed: {error.message}</p>
        <button onclick={reset}>Try again</button>
    {/snippet}
</svelte:boundary>
```

You almost never want to use it to hide real bugs — a hydration mismatch is a bug, not a feature — but in a third-party widget that you do not control, a boundary stops one broken component from bringing down the whole page.

### 1.6 What the April 2026 version changes

Svelte 5 rewrote hydration to be smaller and faster. Specifically, the compiler now knows exactly which nodes need event listeners and walks a narrow list rather than the whole DOM. In practice this means hydration costs are lower than Svelte 4, and hydration mismatches are harder to cause. You will still meet them, but less often.

## 2. Style it — making the "moment" visible

The mini-build renders two timestamps side by side: one that was written into the HTML on the server, and one that is updated on the client after `onMount` runs. We give the page a warning-ish amber personality (`oklch(75% 0.18 85)`) because the topic is fragile. The server timestamp uses `ui-monospace` and a muted color; the client timestamp uses the brand color to draw the eye. Spacing and type come from PE7 tokens.

## 3. Interact — mount-time vs render-time

The key TypeScript idea is the distinction between code that runs during SSR and code that runs only in the browser. `$state` is fine in both; `onMount` fires only in the browser.

```svelte
<script lang="ts">
    import { onMount } from 'svelte';

    const serverTime: string = new Date().toISOString();
    let clientTime: string = $state('hydrating…');

    onMount(() => {
        clientTime = new Date().toISOString();
    });
</script>
```

`serverTime` is frozen at the value the server generated. `clientTime` starts as a placeholder — the same string on server and client, so hydration has no mismatch — and is replaced in `onMount` after hydration completes. That is the correct pattern for any "now" or "browser-only" value.

## 4. Mini-build — the hydration visualiser

**Path:** `src/routes/modules/08-routing/03-what-hydration-is/+page.svelte`

This lesson creates a new route. The page displays both timestamps and a button that increments a counter. Before the JS bundle finishes downloading, the button click does nothing; after hydration it works. The difference between the two timestamps shows you how many milliseconds hydration took.

### Prove hydration in three steps

1. **View Source** on the page. You will see the `serverTime` value baked into the HTML and `hydrating…` as the `clientTime` placeholder.
2. **Load the page with JavaScript disabled.** (DevTools → Command Menu → "Disable JavaScript", then reload.) The `serverTime` is visible but `clientTime` stays on `hydrating…` forever and the button does nothing. That is the pre-hydration state, frozen.
3. **Re-enable JavaScript and reload.** Watch the `clientTime` change. The gap between the two values is roughly how long the browser spent downloading and running the bundle.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In your own words, what is hydration?</summary>

Hydration is the step that takes the static HTML the server sent, walks it in the browser, attaches event listeners and reactive state, and turns it into a live Svelte application — without rebuilding the DOM from scratch.
</details>

<details>
<summary><strong>Q2.</strong> Why can a button look correct on the page but not respond to clicks?</summary>

Because the HTML was rendered on the server (so the pixels are there) but the JavaScript bundle has not finished hydrating that component yet. Until hydration attaches the click handler, the button is just static markup.
</details>

<details>
<summary><strong>Q3.</strong> What causes a hydration mismatch warning, and how do you avoid it?</summary>

A mismatch happens when the component produces different markup on the server and on the client — usually because the top-level script calls a time-dependent function like `new Date()` or reads from `window`/`localStorage`. The fix is to initialise such values to a safe placeholder and update them inside `onMount` or a `$effect` block, which only run on the client after hydration.
</details>

<details>
<summary><strong>Q4.</strong> What does <code>&lt;svelte:boundary&gt;</code> do?</summary>

It catches errors thrown by descendant components during rendering or hydration and renders a fallback snippet instead of letting the whole page crash. It is Svelte's equivalent of React error boundaries.
</details>

<details>
<summary><strong>Q5.</strong> Which code runs only on the client: a top-level <code>new Date()</code>, a top-level <code>$state(0)</code>, or an <code>onMount</code> callback?</summary>

Only the `onMount` callback is guaranteed to run only on the client. The top-level `new Date()` runs on both server and client. `$state(0)` initialises on both too, but its reactive update behaviour only matters on the client after hydration.
</details>

## 6. Common mistakes

- **Using `if (typeof window !== 'undefined')` as a guard at the top level.** It works, but it is an anti-pattern. Prefer moving the code into `onMount` or `$effect`, which express the same intent more clearly.
- **Blaming Svelte for a hydration mismatch.** Nine times out of ten the mismatch is caused by your own code reading a non-deterministic value at render time. Read the warning carefully — it names the element that disagreed.
- **Wrapping every component in `<svelte:boundary>` defensively.** Boundaries hide bugs. Use them where a third-party widget is genuinely untrusted, not as a global safety net.
- **Testing hydration only with DevTools open.** DevTools slows the browser down and makes hydration look worse. Test on a real mid-range phone or a throttled CPU profile.

## 7. What's next

Lesson 8.4 leaves the low-level rendering pipeline behind and moves up to the surface: how files in `src/routes` become URLs through file-based routing.
