---
module: 17
lesson: 17.4
title: Building a live notification feed
duration: 50 minutes
prerequisites:
  - Lesson 17.3 — consuming SSE in Svelte 5
  - Module 6 — PE7 styling and transitions
learning_objectives:
  - Build a multi-type notification system using typed SSE events and discriminated unions
  - Implement dismissable toast notifications with animated entrance and exit using Svelte transitions
  - Auto-dismiss notifications after a timeout while allowing manual dismissal via button
  - Style different notification types (info, success, warning, error) with per-type OKLCH colors
  - Cap the visible notification count and implement a queue to prevent UI overflow
status: ready
---

# Lesson 17.4 — Building a live notification feed

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This lesson combines SSE consumption (Lesson 17.3) with UI design to build a practical feature you will reuse in the module project: a live notification toast feed.

## 1. Concept — From raw events to a polished notification UI

### 1.1 What the problem is

Real-time data is useless if the user cannot perceive it. A number updating silently in a corner of the page is barely better than a manual refresh. Notifications solve this: they interrupt the user's attention briefly to communicate that something happened. But notifications done poorly — too frequent, too loud, impossible to dismiss, covering interactive elements — are worse than no notifications at all.

This lesson builds a notification feed that solves both problems: it streams real-time events from the server AND presents them with respectful, accessible, dismissable toast UI.

### 1.2 The notification data model

Our SSE endpoint streams `NotificationData` objects with a discriminated type field:

```typescript
interface NotificationData {
    readonly id: string;
    readonly type: 'info' | 'success' | 'warning' | 'error';
    readonly title: string;
    readonly body: string;
    readonly timestamp: string;
}
```

The `type` field drives both styling (each type gets its own accent color) and behaviour (errors stay visible longer, info auto-dismisses quickly). This is the discriminated union pattern you will use extensively for WebSocket messages in later lessons.

### 1.3 Toast architecture

A toast is a small, ephemeral notification that appears at the edge of the viewport, stays briefly, and disappears. Our architecture:

1. **A reactive array** — `let notifications: NotificationData[] = $state([])` — holds the currently visible toasts.
2. **Arrival** — When an SSE event arrives, push it to the array. If the array exceeds a maximum (say, 5), remove the oldest.
3. **Auto-dismiss** — Each toast starts a timer. After N seconds (configurable per type), it is removed from the array.
4. **Manual dismiss** — A close button removes it immediately.
5. **Animated entrance/exit** — Svelte's `transition:` directive (or `in:`/`out:`) animates toasts in and out smoothly.

### 1.4 Transitions in Svelte 5

Svelte provides built-in transition functions: `fly`, `fade`, `slide`, `scale`. You apply them with the `transition:` directive on an element that is conditionally rendered with `{#if}` or `{#each}`:

```svelte
{#each notifications as notification (notification.id)}
    <div transition:fly={{ y: 20, duration: 300 }}>
        ...
    </div>
{/each}
```

When an item is added to the `notifications` array, Svelte runs the `in` animation. When it is removed, Svelte runs the `out` animation. The `(notification.id)` key expression is critical — it tells Svelte how to track which items were added and which were removed, so transitions fire on the correct elements.

Important: transitions must respect `prefers-reduced-motion`. You can do this by setting `duration: 0` when the user prefers reduced motion, or by using a wrapper that checks the media query.

### 1.5 Capping the visible count

If the server sends 20 notifications per second (a burst), you do not want 20 toasts stacking up. The cap pattern:

```typescript
function addNotification(notification: NotificationData): void {
    const MAX_VISIBLE = 5;
    notifications = [...notifications, notification].slice(-MAX_VISIBLE);
}
```

The `slice(-MAX_VISIBLE)` keeps only the most recent N, automatically evicting the oldest. Evicted notifications get their out-transition, so from the user's perspective they simply dismiss upward as new ones appear below.

### 1.6 Accessibility considerations

Notifications should use `role="status"` or `role="alert"` depending on urgency. Status is polite (screen reader announces it when convenient); alert is assertive (announced immediately). Error notifications warrant `role="alert"`. Info and success use `role="status"`.

Each toast needs a dismiss button with an accessible label: `aria-label="Dismiss notification"`. The button must be at least 44px in touch-target size (PE7 rule).

## 2. Style it — Toast cards with per-type accent colors

Each notification type gets a left-border accent from the OKLCH palette:

- **info** — `var(--color-brand)` (blue/teal)
- **success** — `var(--color-success)` (green)
- **warning** — `var(--color-warning)` (amber)
- **error** — `var(--color-error)` (red)

Toast layout:
- Fixed to the bottom-right on desktop, bottom-center on mobile
- Stack vertically with `--space-sm` gap
- Each toast has a left border (4px, accent color), rounded corners (`--radius-md`), and a shadow (`--shadow-md`)
- Dismiss button is a small X in the top-right, 44px touch target
- Page personality: `oklch(65% 0.15 200)` — the module's teal

## 3. Interact — Svelte transitions with the fly directive

The interactive concept is **Svelte transitions**. Here is the problem without them:

```svelte
<!-- No transition — toasts pop in and out abruptly -->
{#each notifications as n (n.id)}
    <div class="toast">{n.title}</div>
{/each}
```

This works functionally but feels jarring. Toasts appear instantly and vanish instantly, which is visually confusing — the user cannot tell what was added or removed.

The fix:

```svelte
<script lang="ts">
    import { fly } from 'svelte/transition';
</script>

{#each notifications as n (n.id)}
    <div class="toast" transition:fly={{ y: 20, duration: 300 }}>
        {n.title}
    </div>
{/each}
```

Now toasts slide up from below when they appear, and slide back down when they disappear. The movement tells the user's eye where the new content is and where old content went. This is animation serving communication, not decoration.

## 4. Mini-build — Live notification toast feed

**File:** `src/routes/modules/17-realtime/04-notification-feed/+page.svelte`

The SSE endpoint at `src/routes/modules/17-realtime/04-notification-feed/api/notifications/+server.ts` streams random typed notifications every 3-6 seconds. The page component displays them as animated toasts.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/17-realtime/04-notification-feed`.

You will see notifications appearing as toast cards at the bottom of the page. Each has a colored left border matching its type. Toasts auto-dismiss after 8 seconds (errors after 12). Click the X button to dismiss manually. At most 5 toasts are visible at once.

### DevTools moment

1. Open the **Network** tab and find the `api/notifications` request. Watch the EventStream panel — you will see events arriving every 3-6 seconds.
2. Open **Elements** panel and watch the toast container. When a new toast appears, you will see the element inserted with a CSS transform that animates from `translateY(20px)` to `translateY(0)`. When it is removed, the transform reverses.
3. Toggle `prefers-reduced-motion` in DevTools (Rendering tab > "Emulate CSS media feature prefers-reduced-motion") and observe that transitions have zero duration — toasts still appear and disappear, just without animation.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is the <code>(notification.id)</code> key expression important in the <code>{#each}</code> block?</summary>

The key expression tells Svelte how to identify each item in the array. Without it, Svelte uses array index, which means removing item 0 looks like "every item changed" rather than "item 0 was removed." With a unique key like `notification.id`, Svelte correctly identifies which specific item was removed and runs the out-transition only on that element.
</details>

<details>
<summary><strong>Q2.</strong> How would you make error notifications stay visible until manually dismissed (no auto-dismiss)?</summary>

Skip the `setTimeout` for error-type notifications. In the `addNotification` function, check `notification.type` — if it is `'error'`, do not set a dismissal timer. The notification stays in the array until the user clicks the dismiss button. This ensures critical errors are not missed because the user looked away for 8 seconds.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between <code>role="status"</code> and <code>role="alert"</code> for screen reader users?</summary>

`role="status"` is a polite live region — the screen reader announces the content when it finishes its current utterance, without interrupting. `role="alert"` is assertive — the screen reader interrupts immediately to announce it. Use `alert` only for urgent messages (errors, security warnings). Overusing `alert` is like crying wolf — users disable announcements.
</details>

<details>
<summary><strong>Q4.</strong> If you forget the <code>slice(-MAX_VISIBLE)</code> cap, what happens during a notification burst?</summary>

The notifications array grows without bound. Each notification adds a DOM element with a transition. With dozens of simultaneous toasts, the page becomes unusable: toasts overflow the viewport, transitions fight each other, and layout shift makes the page jump. The cap is a UX safeguard, not just a performance optimization.
</details>

<details>
<summary><strong>Q5.</strong> Why does the transition need <code>duration: 0</code> or equivalent when <code>prefers-reduced-motion</code> is set?</summary>

Users who enable `prefers-reduced-motion` in their OS settings may have vestibular disorders where animation causes nausea or disorientation. Setting `duration: 0` removes the animation while keeping the functionality — elements still appear and disappear, just without movement. The PE7 global `@layer animations` handles this for CSS animations, but Svelte JS transitions need their own check.
</details>

## 6. Common mistakes

- **Using array index as the key.** `{#each notifications as n, i (i)}` means Svelte identifies items by position. When you remove index 0, Svelte thinks index 0 changed (from the old item to the next one), index 1 changed, etc. Transitions fire on the wrong elements. Always use a unique identifier like `notification.id`.
- **Not cleaning up timers on manual dismiss.** If a toast has a 10-second auto-dismiss timer and the user manually dismisses it at 3 seconds, the timer still fires at 10 seconds. If the notification is already gone, this is harmless. But if the ID got reused (unlikely with UUID, but possible with sequential IDs), you could dismiss the wrong toast. Clear the timer on manual dismiss.
- **Placing toasts inside scrollable content.** If the toast container is inside the page flow, it scrolls with the page and may be off-screen when a notification arrives. Use `position: fixed` (or `position: sticky` at the viewport edge) so toasts are always visible regardless of scroll position.
- **Forgetting `aria-live` or `role`.** Without a live region attribute, screen readers do not announce new toasts. The user misses every notification unless they tab into the toast region manually. Add `role="status"` on the container or `role="alert"` on individual error toasts.

## 7. What's next

Lesson 17.5 shifts to the full-duplex world — WebSocket fundamentals, the `ws` package, typed message protocols with discriminated unions, and runtime validation with Valibot.
