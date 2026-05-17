---
module: 5
lesson: 5.8
title: Custom events and the callback prop pattern (toast notifications)
duration: 55 minutes
prerequisites:
  - Lesson 5.5 (callback props)
  - Lesson 5.6 (closures)
learning_objectives:
  - Design a small reactive "store" as a plain module-level $state proxy
  - Expose methods like show(), dismiss(), and clear() that any component can call
  - Render a list of active toasts with an aria-live region
  - Dismiss a toast automatically with setTimeout and manually with a close button
  - Explain why this pattern replaces a global event bus
status: ready
---

# Lesson 5.8 — Custom events and the callback prop pattern

## 1. Concept — When "events" are really "shared state"

### 1.1 The problem: any component might want to show a toast

Every real web app eventually needs a toast: a small notification that slides in, says "Saved!" or "Error — try again", and disappears a few seconds later. Toasts can be triggered from anywhere — a form submission, a background sync, a keyboard shortcut — and they appear in one fixed place in the UI, usually a corner of the screen.

In old frameworks, this was a classic use case for a global event bus: any component could `emit('toast', {...})` and a container listening on the other end would render it. Svelte 5's runes have retired the event bus for good. The modern pattern is a tiny **store** — a file that exports some `$state` plus a handful of functions that mutate it. Any component that imports the store can push new toasts. One container component reads the store and renders them.

This is still the callback-prop pattern in disguise. The "callback" is the method you call on the store. The store is a shared reactive scope. The container reads it with plain Svelte reactivity.

### 1.2 The shape of a minimal toast store

A `.svelte.ts` file can use runes at module scope. That gives you global reactive state without context, without provider components, and without a third-party library.

```ts
// src/routes/modules/05-events/08-custom-events-toasts/toasts.svelte.ts
export interface Toast {
    id: number;
    kind: 'success' | 'error' | 'info';
    message: string;
}

let nextId: number = 1;
export const toasts: Toast[] = $state([]);

export function show(kind: Toast['kind'], message: string, ttl: number = 3000): number {
    const id: number = nextId++;
    toasts.push({ id, kind, message });
    setTimeout(() => dismiss(id), ttl);
    return id;
}

export function dismiss(id: number): void {
    const index: number = toasts.findIndex((t) => t.id === id);
    if (index !== -1) toasts.splice(index, 1);
}

export function clear(): void {
    toasts.length = 0;
}
```

Notice three things. First, `$state` on an array at module level is legal inside a `.svelte.ts` file — this is one of the most powerful Svelte 5 features. Second, we mutate the array in place (`push`, `splice`, `length = 0`) and Svelte's reactive proxy picks up the changes. Third, `show` returns the new toast's id so callers can dismiss it early if they want to.

### 1.3 The container — a pure reader

One component reads the store and renders it. It has no state of its own:

```svelte
<!-- Toasts.svelte -->
<script lang="ts">
    import { toasts, dismiss } from './toasts.svelte.ts';
</script>

<ul class="toasts" role="status" aria-live="polite" aria-atomic="false">
    {#each toasts as toast (toast.id)}
        <li class="toast toast--{toast.kind}">
            <span>{toast.message}</span>
            <button type="button" onclick={() => dismiss(toast.id)} aria-label="Dismiss">×</button>
        </li>
    {/each}
</ul>
```

`role="status"` plus `aria-live="polite"` tells screen readers to announce new items as they are added — without interrupting whatever the user is already hearing. This is the correct live region for non-urgent notifications; errors sometimes use `role="alert"` with `aria-live="assertive"` instead.

### 1.4 Why this is better than a global event bus

- **Type-safe.** `show('success', 'Saved')` is type-checked. A misspelt kind or a missing message fails at compile time.
- **Discoverable.** Your IDE's "find references" on `show` instantly lists every trigger site in the codebase. With an event bus, string event names are invisible to tooling.
- **Reactive by default.** No subscribe/unsubscribe, no manual cleanup. Any component that reads `toasts` updates automatically; any that does not is free.
- **No global object.** The store is an ES module. It is only "global" in the sense that you can import it from anywhere; there is no `window.toast` pollution.

### 1.5 Combining with callback props

You can still pass a callback prop for a *local* event (e.g., a `<Modal>` telling its parent `onClose`) and use the toast store for *app-wide* events (e.g., "the save succeeded"). The two patterns do not compete. Rule of thumb:

- **Callback prop** when one specific parent needs to know.
- **Reactive store** when many places might need to know.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, components communicate upward for dozens of reasons: a search bar reports a query, a pagination control reports a page change, a date picker reports a selection, a modal reports dismissal. Without a consistent pattern for upward communication, you get a mix of overused bindings, over-global stores, and undocumented DOM events. The callback prop pattern establishes one clear, typed, discoverable mechanism: "if a child needs to tell a parent something, it accepts a function prop and calls it." This is the same pattern React, Vue, and Angular settled on, making it transferable across frameworks.

**The mental model.** Think of callback props as order forms. The parent hands the child a blank form (the callback function). When the child needs to communicate, it fills in the form (calls the function with arguments) and submits it. The form's structure (the function's type signature) is agreed upon in advance via the Props interface. The child cannot send data the parent did not agree to receive, and the parent cannot be surprised by an unexpected shape. This contract makes communication explicit, typed, and traceable in code review.

**Edge cases.** A common mistake: passing inline arrow functions that create a new reference on every render. In Svelte this is harmless (unlike React where it can trigger child re-renders), but it makes debugging harder because the function has no name in stack traces. Prefer named functions defined in the script block. Another edge case: callback props that return a value. A `shouldClose: () => boolean` callback lets the parent veto an action — the child calls it and proceeds only if it returns true. This request/response pattern is powerful but should be used sparingly. A third subtlety: if the parent's callback throws, the error propagates through the child's call stack. Keep callbacks simple and move complex logic to the parent's scope.

**Performance implications.** Callback props are standard function references — the performance characteristics are identical to any function call (nanoseconds). There is no event system overhead, no serialization, no async dispatch. For high-frequency events (scroll, mousemove, drag), callbacks fire synchronously and the parent handler runs immediately. If the parent's handler is expensive, the parent is responsible for debouncing (Lesson 5.7). The callback pattern itself adds zero overhead beyond the function call.

**Cross-module connections.** The callback prop pattern replaces Svelte 3/4's `createEventDispatcher` entirely. Module 7 uses it for GSAP animation lifecycle callbacks. Module 9b uses it for remote function completion notifications. Module 10 uses it for form action feedback. Module 11 uses it in hierarchical component APIs. The pattern "typed function in, typed data out" is the cleanest upward communication pattern in component architecture.

## 2. Style it — A toast container in the corner

Use `position: fixed` + `inset-block-end: var(--space-md)` + `inset-inline-end: var(--space-md)`. Give each toast variant a distinct colour drawn from tokens: `var(--color-success)`, `var(--color-error)`, `var(--color-brand)`. Slide in with a subtle transform + opacity transition that collapses to zero under `prefers-reduced-motion`.

## 3. Interact — Triggering toasts from three different places

Put three buttons on the page — "Simulate save", "Simulate error", "Simulate info" — each of which imports `show` from the store and fires a different toast. Because the store is reactive, the container updates without any wiring between the buttons and the container.

## 4. Mini-build — A full toast system

**Files:**
- `src/routes/modules/05-events/08-custom-events-toasts/toasts.svelte.ts` (store)
- `src/routes/modules/05-events/08-custom-events-toasts/Toasts.svelte` (container)
- `src/routes/modules/05-events/08-custom-events-toasts/+page.svelte` (demo page)

Clicking any trigger button pushes a toast. Toasts auto-dismiss after 3 seconds. Clicking × dismisses them early. The container reads the store; the triggers mutate it.

### DevTools verification

Select the `<ul class="toasts">` in Elements. Watch children appear and disappear as you click the buttons — no framework internal events, no re-subscribes, just reactive state mutation.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why can you declare <code>$state</code> at module scope in a <code>.svelte.ts</code> file?</summary>

Because `.svelte.ts` files are processed by Svelte's compiler and runes are legal there. In a plain `.ts` file they are not. The pattern gives you reactive global state with no provider and no context.
</details>

<details>
<summary><strong>Q2.</strong> Why is this pattern better than a global event bus?</summary>

It is type-safe, discoverable by IDE tooling, reactive without subscribe/unsubscribe, and does not pollute the `window` object.
</details>

<details>
<summary><strong>Q3.</strong> When would you use a callback prop instead of a reactive store?</summary>

When the event has exactly one interested parent. Callback props keep the contract local and make the data flow obvious. Stores are for app-wide concerns where many components are interested.
</details>

<details>
<summary><strong>Q4.</strong> What ARIA attributes does a polite toast container use?</summary>

`role="status"` with `aria-live="polite"` and `aria-atomic="false"`. Screen readers will announce new items without interrupting current speech. Errors that must be read immediately use `role="alert"` with `aria-live="assertive"`.
</details>

<details>
<summary><strong>Q5.</strong> Why does <code>toasts.splice(index, 1)</code> trigger reactivity in Svelte 5?</summary>

Because `toasts` is a reactive proxy produced by `$state`. The proxy intercepts mutations like `splice`, `push`, and `length = 0` and notifies any code that is reading the array.
</details>

## 6. Common mistakes

- **Declaring `$state` in a plain `.ts` file.** It only works in `.svelte.ts` or `.svelte` files. TypeScript will flag it.
- **Replacing the array variable.** `toasts = []` in a consumer file does not reassign the imported binding. Use `toasts.length = 0` or `clear()`.
- **Forgetting the key in `{#each}`.** Without `(toast.id)`, Svelte cannot animate add/remove correctly and may reuse DOM nodes for the wrong item.
- **Using `role="alert"` for every toast.** Alert regions interrupt screen-reader speech. Reserve them for urgent errors.

## 7. What's next

Lesson 5.9 covers touch and pointer events — the unified API that handles mouse, touch, and pen in one handler.
