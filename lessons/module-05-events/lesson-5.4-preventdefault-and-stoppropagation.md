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

Svelte 3/4 had a shorthand: `on:submit|preventDefault={handleSubmit}`. Svelte 5 removed it. In the May 2026 version you call `event.preventDefault()` yourself inside the handler. This aligns with the rest of the platform (`addEventListener` has never had a modifier) and makes the call visible in the handler body where it belongs.

### 1.7 The full event propagation path — a concrete walkthrough

Consider this DOM structure with handlers at every level:

```svelte
<form onsubmit={handleForm}>           <!-- Phase 3: bubble reaches here -->
    <div onclick={handleCard}>          <!-- Phase 3: bubble reaches here -->
        <button onclick={handleDelete}> <!-- Phase 2: target -->
            <span>×</span>             <!-- Phase 1: capture passes here -->
        </button>
    </div>
</form>
```

When the user clicks the `<span>` icon inside the delete button:

1. **Capture phase** (top-down): `window` → `document` → `html` → `body` → `form` → `div` → `button` → `span`. No capture-phase listeners are registered here, so nothing fires yet.
2. **Target phase**: The event reaches `span`. There is no handler on `span`.
3. **Bubble phase** (bottom-up): `span` → `button` (fires `handleDelete`) → `div` (fires `handleCard`) → `form` (fires `handleForm`) → `body` → `html` → `document` → `window`.

If `handleDelete` calls `event.stopPropagation()`, the bubble stops at `button`. Neither `handleCard` nor `handleForm` fire. If `handleDelete` calls `event.preventDefault()` instead, the bubble continues but the form's native submit action is suppressed.

### 1.8 What the runtime does — `event.cancelable` and `event.defaultPrevented`

Not every event can be prevented. The `scroll` event, for example, has `cancelable: false` — calling `preventDefault()` on it does nothing (the browser ignores the call). You can check `event.cancelable` before calling `preventDefault()` if you want to be defensive. After a successful `preventDefault()`, the event's `defaultPrevented` property becomes `true`. Other handlers in the chain can read this flag to know that an earlier handler already prevented the default:

```ts
function handleParentClick(event: MouseEvent): void {
    if (event.defaultPrevented) return; // a child already handled this
    // ...proceed with parent logic
}
```

This pattern — "check `defaultPrevented` instead of `stopPropagation`" — is considered better practice because it allows other listeners to still run while signaling that the primary action was already handled.

### 1.9 The TypeScript angle — typing handlers that prevent defaults

A clean pattern for submit handlers:

```ts
function createSubmitHandler(
    onSubmit: (data: FormData) => Promise<void>
): (event: SubmitEvent) => void {
    return (event: SubmitEvent): void => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        const data = new FormData(form);
        onSubmit(data);
    };
}
```

TypeScript ensures the handler receives `SubmitEvent` (which has `submitter`) rather than plain `Event`. It also ensures `currentTarget` is narrowed to `HTMLFormElement` so you can safely access `FormData`.

### 1.10 Comparison: event control methods

| Method                     | What it stops                          | What still happens              |
|----------------------------|----------------------------------------|---------------------------------|
| `preventDefault()`         | Browser's default action               | Propagation continues           |
| `stopPropagation()`        | Bubble/capture to ancestor listeners   | Default action still occurs     |
| `stopImmediatePropagation()` | All listeners on same + ancestor elements | Default still occurs (unless also prevented) |
| Check `defaultPrevented`   | Nothing — a read-only signal           | Everything continues            |

> **In production sidebar.** On a 100K-daily-user dashboard with nested clickable cards, we spent two days debugging why the analytics library stopped tracking clicks. The root cause: a developer added `event.stopPropagation()` inside a delete-confirmation modal to prevent the card underneath from navigating. That also stopped the document-level click listener that the analytics library used. The fix was to replace `stopPropagation()` with a `defaultPrevented` check in the card handler: `if (event.defaultPrevented) return;`. The delete handler called `preventDefault()` instead of `stopPropagation()`, and the analytics listener — which did not depend on the default action — continued to fire. The lesson: `stopPropagation` is a sledgehammer. Use `preventDefault` + `defaultPrevented` checks whenever possible.

### 1.11 Common interview question

**Q: You have a dropdown menu inside a page that has a "click outside to close" listener on `document`. Clicking a menu item fires the close handler because the click bubbles to `document`. How do you fix this without `stopPropagation`?**

**Model answer:** Inside the `document` click handler, check whether `event.target` is inside the dropdown using `dropdown.contains(event.target as Node)`. If it is, return early without closing. This avoids `stopPropagation` (which would break other document-level listeners like analytics) and keeps the handler logic self-contained. The pattern is: "the parent listener decides whether to act based on where the click came from, rather than the child silencing the event." Alternatively, the menu item handler can call `event.preventDefault()`, and the document handler can check `event.defaultPrevented` before closing.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, event propagation bugs are among the hardest to diagnose. A delete button inside a clickable card triggers both the delete action and the card's navigation. A submit button inside a modal submits the form and also closes the modal via a bubbling click on the overlay. These are real bugs that reach production because they only manifest under specific nesting conditions that unit tests miss. Understanding `preventDefault` and `stopPropagation` at a deep level — knowing when each is appropriate, and when neither is the answer — prevents dozens of nesting-related interaction bugs.

**The mental model.** Think of event propagation as a shout in a building. Someone shouts "click!" on the 3rd floor (the target element). The shout travels up through the 4th floor, 5th floor, all the way to the roof (bubbling phase). Every floor that has a listener hears the shout and can react. `stopPropagation` is closing the fire door on your floor — floors above cannot hear the shout. `preventDefault` is a different mechanism entirely — it tells the browser "do not perform your built-in reaction to this event" (do not navigate for a link click, do not submit for a form submit). These are two orthogonal controls: you can stop propagation without preventing default, prevent default without stopping propagation, or do both.

**Edge cases.** A dangerous pattern: `stopPropagation` on every handler "just to be safe." This breaks analytics libraries, global keyboard shortcuts, and accessibility tools that listen at the document level. Only stop propagation when you have a specific parent listener you need to shield from. Another edge case: `preventDefault` on a `keydown` event prevents the character from being typed — useful for keyboard shortcuts but destructive if applied too broadly. A third subtlety: `stopImmediatePropagation` stops not only parent listeners but also other listeners on the *same* element. This is rarely needed but exists for cases where multiple libraries attach handlers to the same element and you need to prevent one from reacting.

**Performance implications.** Neither `preventDefault` nor `stopPropagation` has meaningful performance cost — they are single flag checks in the browser's event dispatch loop. However, *how* you attach handlers affects performance. Adding a click handler to every row in a 1,000-row table creates 1,000 listeners. Event delegation — attaching one handler to the parent and checking `event.target` — creates one listener. Svelte handles this efficiently for `{#each}` blocks, but understanding the propagation model helps you design efficient delegation patterns for performance-critical lists.

**Cross-module connections.** Event control is critical in Module 7 (preventing scroll events from bubbling during GSAP ScrollTrigger animations), Module 8 (preventing default navigation for client-side routing), Module 10 (preventing form submission for progressive enhancement with `use:enhance`), and Module 12 (managing focus trapping in modals and accessible components). The principle "be specific about which events you intercept and why" is a professional discipline that prevents subtle interaction regressions.

## Going Deeper

**Official documentation:**
- [MDN: Event.preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) — including the `cancelable` property
- [MDN: Event.stopPropagation()](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation) — and why `stopImmediatePropagation` exists
- [Svelte docs: on:eventname (legacy)](https://svelte.dev/docs/svelte/legacy-on) — explains why the `|preventDefault` modifier was removed

**Advanced pattern: an event control utility.** Build a `handled` wrapper that calls `preventDefault`, calls `stopPropagation` only when explicitly requested, and returns the event for chaining:

```ts
function handled<E extends Event>(
    fn: (event: E) => void,
    options: { prevent?: boolean; stop?: boolean } = { prevent: true }
): (event: E) => void {
    return (event: E) => {
        if (options.prevent) event.preventDefault();
        if (options.stop) event.stopPropagation();
        fn(event);
    };
}

// Usage: <form onsubmit={handled(submitForm)}>
// Usage: <button onclick={handled(deleteItem, { prevent: false, stop: true })}>
```

**Challenge question (combines Lessons 5.4, 5.1, and 5.3):** Build a nested component structure: a `<Card>` with `onclick` that navigates, containing a `<Menu>` with `onclick` that opens a dropdown, containing a `<DeleteButton>` with `onclick` that deletes the item. Each handler should work independently. Implement it *without* `stopPropagation` — instead, use `event.defaultPrevented` checks so each parent handler skips its action if a child already handled the event. Verify that clicking the delete button does not navigate or open the menu.

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
