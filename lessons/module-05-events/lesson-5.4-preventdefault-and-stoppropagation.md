---
module: 5
lesson: 5.4
title: preventDefault and stopPropagation
duration: 40 minutes
prerequisites:
  - Lesson 5.3 (typed events)
learning_objectives:
  - Explain what the browser's "default action" means for a given event
  - Call event.preventDefault() to stop form submission, link navigation, and context menus
  - Explain the two phases of event propagation (capture and bubble)
  - Call event.stopPropagation() to stop an event from reaching parent listeners
  - Decide when each method is the right fix and when it is the wrong one
status: ready
---

# Lesson 5.4 — `preventDefault` and `stopPropagation`

## 1. Concept — Two methods that every form depends on

### 1.1 The problem: forms that reload the page

Write a plain HTML form with a submit button, click the button, and your browser will navigate away from the page. That is because `<form>` has a **default action** baked into the browser since 1995: when you submit it, the browser serialises the inputs, makes an HTTP request to the form's `action` URL, and loads the response as a new page. That behaviour is excellent for a static HTML document. For a single-page app where you want to handle the submission in JavaScript, it is catastrophic — your whole app disappears and reloads.

The same is true for many other events. Click a link with `href="#"` and the URL hash changes. Right-click an element and a context menu pops up. Drag a file onto a page and the browser tries to navigate to the file. All of these are **default actions** — behaviours the browser will perform unless you stop it.

### 1.2 `preventDefault()` — "I'll handle it myself"

Every `Event` object has a method called `preventDefault()`. Calling it tells the browser: *do not perform the default action for this event*. Your handler still runs; the browser's built-in behaviour does not.

```ts
function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    // ...now I can read the form values and do what I like
}
```

`preventDefault` is not a cancellation. The event still reaches every other listener. All it does is cancel the one thing the browser would otherwise do automatically.

Common use cases:

- **Forms.** `onsubmit={handleSubmit}` with `preventDefault` is the canonical "SPA form" pattern.
- **Anchors.** An `<a href="#something">` that opens a modal needs `preventDefault` so the URL hash does not change.
- **Drag and drop.** `ondragover` must call `preventDefault` on the target element, otherwise the browser refuses to fire `drop` at all.
- **Custom shortcuts.** An `onkeydown` that handles `Ctrl+S` to save must `preventDefault` so the browser does not open its "Save Page As" dialog.

Not every event has a default. A plain `click` on a `<div>` does nothing by default, so `preventDefault` is a no-op. Use it only where there is something to prevent.

### 1.3 The two phases of event propagation

When you click a `<span>` inside a `<button>` inside a `<form>`, *three* elements can hear about the click, not one. The DOM runs events through two phases:

1. **Capture phase.** The event travels from the root (`document`) down through the DOM tree toward the target. Listeners attached with `{ capture: true }` fire on the way down.
2. **Target phase.** The event reaches the `<span>`.
3. **Bubble phase.** The event travels back up through the ancestors. Normal listeners fire on the way up.

In practice, 99% of listeners are "normal" (bubble phase), so the mental model is: *a click on an inner element also fires on every parent listener, in order from innermost to outermost*.

This is usually what you want. A single `onclick` on a card element can catch clicks on any child. But sometimes it is a problem. If you put an `onclick` on a card *and* a separate `onclick` on a "delete" button inside the card, clicking the button will trigger the card's handler too, because the event bubbles up.

### 1.4 `stopPropagation()` — "I've got it, don't tell anyone else"

`event.stopPropagation()` stops the event from travelling any further. Any listeners on ancestor elements do not fire. The default action still happens (unless you separately call `preventDefault`).

```ts
function handleDeleteClick(event: MouseEvent): void {
    event.stopPropagation(); // do not let the card's onclick fire
    deleteItem();
}
```

A useful rule of thumb: `preventDefault` stops *the browser*, `stopPropagation` stops *your other handlers*. They are independent — you can call one, the other, both, or neither.

### 1.5 When *not* to use them

Both methods are frequently overused. Two red flags:

- **`preventDefault` on every event "just to be safe".** If a default does not exist or would not cause harm, preventing it is noise that will confuse the next reader.
- **`stopPropagation` to fix a bug caused by overlapping handlers.** The deeper fix is usually to check `event.target` or `event.currentTarget` inside the ancestor handler and return early if the click came from the child, rather than silencing all events. Stopping propagation globally can break unrelated code — modals that close on outside click, analytics listeners, accessibility tooling.

### 1.6 Svelte 5 removed the `|preventDefault` modifier

Svelte 3/4 had a shorthand: `on:submit|preventDefault={handleSubmit}`. Svelte 5 removed it. In the April 2026 version you call `event.preventDefault()` yourself inside the handler. This aligns with the rest of the platform (`addEventListener` has never had a modifier) and makes the call visible in the handler body where it belongs.

## 2. Style it — A card with a nested delete button

The mini-build is a "task card" with an invisible whole-card click area that expands a description, plus a visible red delete button in the corner. Both have their own handlers. Per-page colour: `oklch(70% 0.18 140)` (fresh green). Keep tokens, mobile first, 44 px targets.

## 3. Interact — See the bubble, then stop it

Write the broken version: clicking delete accidentally also expands the card. Watch it happen. Fix it with `stopPropagation` on the delete handler. Then write a second broken version: a form that reloads the page. Fix it with `preventDefault`.

## 4. Mini-build — Two bugs, two fixes

**File:** `src/routes/modules/05-events/04-prevent-default-stop-propagation/+page.svelte`

- A card with `onclick` that toggles expansion.
- A nested delete button with its own `onclick` that calls `stopPropagation` then removes the item.
- A small form with `onsubmit` that calls `preventDefault` then displays the submitted text.

### DevTools verification

Open the Console, set a breakpoint inside the card handler, and click the delete button. Before you added `stopPropagation`, both handlers fired; after, only the button handler fired. For the form, Network tab shows a navigation request in the broken version and nothing in the fixed version.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does <code>event.preventDefault()</code> actually do?</summary>

It tells the browser not to perform the default action associated with this event. Other listeners still run; propagation still happens. Only the browser's built-in behaviour (form submission, link navigation, context menu, etc.) is suppressed.
</details>

<details>
<summary><strong>Q2.</strong> A click on a button inside a card is also firing the card's onclick. How do you stop that?</summary>

Call `event.stopPropagation()` inside the button's handler. That stops the event from bubbling up to the card's listener.
</details>

<details>
<summary><strong>Q3.</strong> Can you call both preventDefault and stopPropagation on the same event?</summary>

Yes — they are independent. `preventDefault` stops the browser's default action; `stopPropagation` stops propagation to other listeners. You can call either, both, or neither.
</details>

<details>
<summary><strong>Q4.</strong> Why did Svelte 5 remove the <code>|preventDefault</code> modifier?</summary>

To align with the underlying platform. `addEventListener` has never had a modifier syntax; calling `event.preventDefault()` inside the handler is the standard DOM pattern. Removing the shortcut makes Svelte code easier to port and easier to read.
</details>

<details>
<summary><strong>Q5.</strong> When is <code>stopPropagation</code> the wrong fix?</summary>

When the bug is a symptom of ambiguous click targets. The deeper fix is usually to narrow `event.target` inside the parent handler and ignore clicks that came from the child, instead of silencing propagation globally and potentially breaking unrelated listeners (modal close, analytics, a11y tools).
</details>

## 6. Common mistakes

- **Calling `preventDefault` on an event that has no default.** Harmless but noisy; confuses future readers.
- **Using `stopPropagation` to patch a logic bug instead of checking `event.target`.** Breaks outside-click handlers and global listeners.
- **Forgetting `preventDefault` on `ondragover`.** Drop targets silently do not fire `drop` unless `dragover` prevents default.
- **Forgetting `preventDefault` on a form.** Full-page reload wipes your SPA state.

## 7. What's next

Lesson 5.5 introduces the callback prop pattern — how a child component tells its parent "something happened" without any event dispatcher.
