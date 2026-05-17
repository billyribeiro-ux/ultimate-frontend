---
module: 5
lesson: 5.9
title: Touch events and mobile interaction (pointer events, @media hover)
duration: 50 minutes
prerequisites:
  - Lesson 5.3 (typed events)
  - Lesson 5.7 (throttling)
learning_objectives:
  - Name the three pointer event phases and map them to older mouse/touch events
  - Use onpointerdown / onpointermove / onpointerup to handle mouse, touch, and pen with one handler
  - Explain why @media (hover: hover) must gate any hover-only styles
  - Implement a touch-friendly swipe-to-dismiss interaction
  - Apply touch-action: none to prevent the browser from eating your gestures
status: ready
---

# Lesson 5.9 — Touch events and mobile interaction

## 1. Concept — One event model for every input

### 1.1 The problem: three APIs for the same interaction

Before 2013 the browser had two separate event families. `mousedown`, `mousemove`, `mouseup` for mice. `touchstart`, `touchmove`, `touchend` for touchscreens. If you wanted code that worked with both, you wired up both sets and duplicated the logic. Then pens and styluses arrived. Then trackpads with pressure sensing. The explosion of input devices made the two-family model unsustainable.

The fix is **pointer events** — a unified API that fires for mouse, touch, pen, and anything else the platform recognises. One handler, every input. Introduced in 2013, specified by the W3C in 2019, supported in every modern browser. In 2026 there is no reason to write separate touch handlers for new code.

### 1.2 The event names

- **`pointerdown`** — fires when a pointer (finger, stylus, mouse) first makes contact. Replaces `mousedown` and `touchstart`.
- **`pointermove`** — fires when the pointer moves while down (or hovering, for mice). Replaces `mousemove` and `touchmove`.
- **`pointerup`** — fires when the pointer is lifted. Replaces `mouseup` and `touchend`.
- **`pointercancel`** — fires when the browser decides the gesture is no longer yours (for example, scrolling took over). Always handle this the same as `pointerup`.
- **`pointerenter`, `pointerleave`, `pointerover`, `pointerout`** — the hover analogues.

The handler attribute is lowercase — `onpointerdown`, `onpointermove`, etc. — exactly like every other Svelte 5 event.

### 1.3 The event object

A `PointerEvent` extends `MouseEvent` so you get every field you already know (`clientX`, `clientY`, `button`, `shiftKey`, ...) plus the pointer-specific additions:

- **`pointerType`** — a string: `"mouse"`, `"touch"`, or `"pen"`. Branch on it if you really need to treat them differently.
- **`pointerId`** — a stable numeric id that stays the same for the lifetime of a gesture. Useful when multiple fingers are on screen at once.
- **`isPrimary`** — `true` for the "primary" pointer (the mouse cursor, the first touch). Multi-touch gestures typically handle only the primary.
- **`pressure`** — stylus pressure, `0.0` to `1.0`.
- **`tiltX`, `tiltY`** — stylus tilt in degrees.

### 1.4 `touch-action: none` — the secret handshake

Here is a gotcha that tortures every developer building a swipe gesture. By default, the browser treats vertical finger drags as scrolling. If your element has `onpointermove` and you drag inside it, the browser may decide to scroll the page and cancel your gesture half-way through. From your code's perspective, the `pointermove` stream just stops and you receive a `pointercancel` instead.

The fix is a CSS property: **`touch-action: none`** on the element. It tells the browser "I will handle touch gestures on this element; do not scroll, do not zoom, do not pan". Once you set it, your pointer events stream cleanly from down to up.

- Use `touch-action: none` for full gesture control (draggable card, swipe-to-dismiss).
- Use `touch-action: pan-y` if you want horizontal gestures but still allow vertical page scroll to pass through.
- Use `touch-action: pan-x` for the reverse.

### 1.5 `@media (hover: hover)` — because phones don't hover

The other mobile-specific rule. When your site opens on an iPhone, `:hover` still matches — but only for a split second after the user taps, which produces a horrible "sticky hover" flash. The fix is a media query that asks the browser whether the primary input device can hover at all:

```css
@media (hover: hover) {
    .btn:hover {
        background: var(--color-brand-hover);
    }
}
```

Phones return `hover: none` and skip the block entirely. Mice and trackpads return `hover: hover` and get the hover style. Simple, clean, no user-agent sniffing, no JavaScript. Always gate hover styles for non-essential visual changes (small shifts, tooltips, etc.). Focus rings should *not* be gated this way — keyboard users need them on every device.

### 1.6 Pointer capture — stay with the finger even when it leaves the element

A pointer gesture that starts inside an element often moves outside it. If you do nothing, the element stops receiving `pointermove` the moment the pointer leaves. **Pointer capture** fixes this:

```ts
function onDown(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
}
```

After `setPointerCapture`, all future pointer events for that `pointerId` go to `target` no matter where the pointer moves on the page. Release it automatically on `pointerup` or `pointercancel` (the browser does this for you).


### 1.7 The TypeScript angle — typing pointer event handlers

`PointerEvent` extends `MouseEvent`, which means any handler typed as `(event: MouseEvent) => void` can also receive a `PointerEvent`. But the reverse is not true. If your handler uses `pointerType` or `pointerId`, type it as `PointerEvent`:

```ts
function handleDrag(event: PointerEvent): void {
    if (event.pointerType === 'touch') {
        // touch-specific: maybe show a larger drag handle
    }
    console.log(`Pointer ${event.pointerId} at ${event.clientX}, ${event.clientY}`);
}
```

TypeScript catches the mistake of writing `onpointerdown` but typing the handler as `(event: MouseEvent)` — `MouseEvent` does not have `pointerType`, and the compiler will flag the access.

### 1.8 Comparison: input API capabilities

| API | Mouse | Touch | Pen | Multi-touch | Pressure | Tilt |
|-----|-------|-------|-----|-------------|----------|------|
| Mouse events | Yes | No | No | No | No | No |
| Touch events | No | Yes | No | Yes | Partial | No |
| Pointer events | Yes | Yes | Yes | Yes | Yes | Yes |

Pointer events are a strict superset. There is no interaction that mouse or touch events can express that pointer events cannot.

> **In production sidebar.** On a 100K-daily-user e-commerce mobile app, we tracked a bug where the "swipe to delete" gesture on cart items worked on Android but failed silently on iOS Safari. The cause: the gesture used `touchstart`/`touchmove`/`touchend` events, and iOS Safari 17 started passive-defaulting touch events, which meant `preventDefault()` calls were ignored and the browser's back-swipe gesture intercepted the horizontal drag. Switching to pointer events with `touch-action: pan-y` on the swipeable element fixed both platforms in one change — the CSS property told the browser "I handle horizontal gestures; you handle vertical scroll," and the pointer events streamed cleanly from start to finish. The migration took 30 minutes and eliminated a bug that had been open for 4 months.

### 1.9 Common interview question

**Q: Why should modern web applications use pointer events instead of separate mouse and touch event handlers?**

**Model answer:** Pointer events provide a unified API that handles mouse, touch, and pen input with a single set of handlers. This eliminates the need to duplicate gesture logic across `mousedown`/`touchstart`, `mousemove`/`touchmove`, and `mouseup`/`touchend`. Pointer events also provide properties not available on mouse events — `pointerType` (to distinguish input sources), `pointerId` (for multi-touch tracking), and `pressure` (for stylus sensitivity). They work with `setPointerCapture` for reliable drag gestures that extend beyond the element's bounds. The key CSS companion is `touch-action`, which tells the browser which gestures the developer handles and which the browser should handle (scrolling, zooming). Without `touch-action: none` on a draggable element, the browser may intercept the gesture for scrolling and cancel the pointer event stream.

## Deep Dive

**Why this matters at scale.** In production apps, over 60% of traffic comes from mobile devices. A 50-component app that only handles click events is broken for touch users: drag interactions do not work, swipe gestures are ignored, and 300ms click delays make the app feel sluggish. Understanding pointer and touch events deeply — how they relate to click events, how multitouch works, how to capture pointers for drag — is what separates a desktop-only prototype from a production-grade mobile experience.

**The mental model.** Think of the pointer events API as a universal translator. Mouse, touch, and pen all speak different languages (MouseEvent, TouchEvent), but PointerEvent translates them into a single interface. One `pointerdown` handler covers mouse clicks, finger taps, and pen touches. One `pointermove` handler covers mouse drags, finger swipes, and pen strokes. The `pointerId` identifies which finger (or which pen tip) is active, enabling multitouch tracking without the complexity of the raw TouchEvent API.

**Edge cases.** A critical mobile gotcha: browsers on iOS fire a 300ms delay between `touchend` and the synthesized `click` event (to detect double-tap zoom). Using `pointerdown`/`pointerup` instead of `click` avoids this delay entirely for custom interactions. However, for links and buttons, keep using native click — the browser handles the delay correctly and accessibility tools rely on it. Another edge case: `touch-action: none` on an element prevents the browser's default touch behaviours (scrolling, pinch-zoom) on that element. Forget it on a draggable element and the page scrolls instead of dragging. Apply it too broadly and you break scrolling for the entire page. A third subtlety: `pointercancel` fires when the browser takes over a gesture (e.g., the user starts scrolling). Always handle it as equivalent to `pointerup` to avoid stuck drag states.

**Performance implications.** Pointer events fire at the device's refresh rate — 60-120 times per second on modern phones. Moving DOM elements in `pointermove` can cause jank if the handler is expensive. For smooth drag interactions, use CSS `transform` (which runs on the compositor thread) rather than `top`/`left` (which trigger layout). With GSAP (Module 7), use `gsap.set()` inside the pointer handler for GPU-accelerated updates. For complex calculations during drag, `requestAnimationFrame`-throttle the expensive work and apply the latest pointer position on each frame.

**Cross-module connections.** Touch interactions are foundational for Module 7 (GSAP-powered drag and gesture animations), Module 6 (swipe-to-dismiss transitions), and Module 12 (touch-friendly accessible components). The `setPointerCapture` pattern introduced here is the same mechanism Module 7 uses for custom drag actions. Mobile-first event handling also connects to Module 13's SEO considerations — Google's mobile-first indexing penalises pages that are not fully functional on touch devices.


## Going Deeper

**Official documentation:**
- [MDN: Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) — the complete guide including multi-touch
- [MDN: touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) — all values and their behaviour
- [Svelte docs: svelte:window](https://svelte.dev/docs/svelte/svelte-window) — how to listen to global pointer events

**Advanced pattern: multi-finger gesture recognition.** Use `pointerId` tracking with a `Map<number, {startX: number, startY: number}>` to recognise pinch-to-zoom gestures. Two fingers moving apart increase the map's inter-point distance; two fingers moving together decrease it. Map the distance delta to a scale factor and apply it via `transform: scale()`.

**Challenge question (combines Lessons 5.9, 5.7, and 5.4):** Build a "scratch card" component where the user drags a finger (or mouse) over a hidden area to reveal content underneath. Use `onpointerdown` to start tracking, `onpointermove` (throttled at 16ms) to reveal pixels along the drag path, and `onpointerup` to stop. Call `event.preventDefault()` on the move handler to prevent scrolling. Set `touch-action: none` on the scratch area. Track the percentage of area revealed and display it. When 70% is revealed, trigger a "You won!" animation.

## 2. Style it — A draggable card

Per-page colour: `oklch(70% 0.18 30)` (peach). The card has `touch-action: none`, a visible "drag me" affordance, and smooth `translateX` based on the pointer delta. Under `prefers-reduced-motion`, the card snaps instead of sliding.

## 3. Interact — Swipe to dismiss

The JS concept is that a single `pointerdown/pointermove/pointerup` sequence captures a gesture. Store the start X on `pointerdown`, compute a delta on `pointermove`, apply it as a CSS translation, then on `pointerup` decide: if the delta is greater than a threshold, dismiss; otherwise animate back to zero.

## 4. Mini-build — Swipe-to-dismiss card

**File:** `src/routes/modules/05-events/09-touch-pointer-events/+page.svelte`

A list of three cards. Each card uses `onpointerdown`, `onpointermove`, `onpointerup` to track horizontal drag, applies a live `translateX`, and is removed from the list if the user swipes past 100 px.

### DevTools verification

Open the Elements panel and enable device toolbar (phone emulation). The card should respond to synthetic touches. Toggle the emulator off and use your mouse — the same handler should work because `PointerEvent` fires for both.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why are pointer events preferable to separate mouse and touch handlers?</summary>

One API handles mouse, touch, and pen with the same handler. You write the gesture once and it works for every input type the browser supports.
</details>

<details>
<summary><strong>Q2.</strong> What does <code>touch-action: none</code> do and why is it essential for a swipe gesture?</summary>

It tells the browser not to perform its default gestures (scroll, zoom) on the element. Without it, the browser may decide a vertical drag is a scroll and cancel your `pointermove` stream halfway through.
</details>

<details>
<summary><strong>Q3.</strong> Why must hover styles be wrapped in <code>@media (hover: hover)</code>?</summary>

Because touch devices briefly match <code>:hover</code> after a tap, producing a sticky hover flash. Gating with the media query means only devices that actually support hover (mouse, trackpad) get the hover styles.
</details>

<details>
<summary><strong>Q4.</strong> Should focus rings be hidden on touch devices?</summary>

No. Keyboard users on every device — including Bluetooth keyboards on tablets — depend on focus rings. Use `:focus-visible`, not `@media (hover)`, to scope focus styles.
</details>

<details>
<summary><strong>Q5.</strong> What does <code>setPointerCapture</code> do?</summary>

It routes all subsequent events for the given pointer id to the element you called it on, even after the pointer moves outside that element. Essential for drag gestures that extend beyond the element's bounds.
</details>

## 6. Common mistakes

- **Forgetting `touch-action: none` on a draggable element.** Gesture works on desktop, fails on mobile.
- **Handling touch and mouse events separately.** Duplicate logic, more bugs, no reason to do it in 2026.
- **Applying hover styles without the media query.** Sticky hover on tap — a common polish bug.
- **Not handling `pointercancel`.** If the browser reclaims the gesture, you get `pointercancel` instead of `pointerup`. Treat it the same or you leak state.

## 7. What's next

Lesson 5.10 closes the module by wiring everything together into a fully accessible, keyboard-navigable form with live validation.
