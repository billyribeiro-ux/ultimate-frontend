---
module: 17
exercise: 3
title: Notification Feed
difficulty: advanced
estimated_time: 30
skills_tested:
  - multi-event type SSE
  - notification data modeling
  - dismissal and read state
  - toast and feed patterns
  - accessibility for live regions
---

# Exercise 17.3 — Notification Feed

## Brief

Build a real-time notification system that streams different types of notifications (info, warning, success, error) from the server and displays them in both a persistent feed panel and as temporary toast messages. Users can dismiss individual notifications and mark all as read. This exercise combines SSE with practical UI state management for a feature found in every production application.

## Requirements

1. Create `src/routes/exercises/17-realtime/03/notifications/+server.ts` that emits typed notification events
2. Define a TypeScript interface `Notification` with `id: string`, `type: 'info' | 'warning' | 'success' | 'error'`, `title: string`, `message: string`, `timestamp: string`
3. The SSE endpoint should emit notifications with different types at random intervals
4. Create `src/routes/exercises/17-realtime/03/+page.svelte` with a notification feed
5. Show a notification bell with an unread count badge
6. Clicking the bell toggles a dropdown feed panel showing all notifications
7. Each notification has a "dismiss" button that removes it from the feed
8. A "Mark all as read" button resets the unread counter
9. New notifications also appear as toast messages that auto-dismiss after 4 seconds
10. Add `aria-live="polite"` to the toast region for screen reader announcements
11. Limit the feed to 50 notifications maximum
12. Style notification types with distinct colors using PE7 tokens

## Constraints

- Use named SSE events (e.g., `event: notification\n`) not default `onmessage`
- TypeScript strict mode with zero errors
- Toasts must animate in and out
- The feed panel must be keyboard-accessible (closable with Escape)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Named SSE events use `event: notification\ndata: {...}\n\n` on the server and `source.addEventListener('notification', handler)` on the client. Track notifications in a `$state` array and a `$state` unread counter. Toasts are a separate `$state` array that items are added to and auto-removed from with `setTimeout`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

When a notification arrives: (1) add it to the feed array, (2) increment the unread counter, (3) add it to the toast array. After 4 seconds, remove it from the toast array. The feed panel is a positioned dropdown that toggles with a boolean `$state`. Use `svelte:window` with a `keydown` handler for Escape to close it.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface Notification {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    timestamp: string;
  }

  let notifications: Notification[] = $state([]);
  let toasts: Notification[] = $state([]);
  let unreadCount = $state(0);
  let feedOpen = $state(false);

  $effect(() => {
    const source = new EventSource('/exercises/17-realtime/03/notifications');
    source.addEventListener('notification', (e: MessageEvent) => {
      const notif: Notification = JSON.parse(e.data);
      notifications = [notif, ...notifications].slice(0, 50);
      unreadCount++;
      toasts = [...toasts, notif];
      setTimeout(() => {
        toasts = toasts.filter(t => t.id !== notif.id);
      }, 4000);
    });
    return () => source.close();
  });
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/17-realtime/03/notifications/+server.ts`**

```typescript
import type { RequestHandler } from './$types';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

const templates: Omit<Notification, 'id' | 'timestamp'>[] = [
  { type: 'info', title: 'New follower', message: 'Someone started following your project.' },
  { type: 'success', title: 'Build passed', message: 'All 47 tests passed successfully.' },
  { type: 'warning', title: 'API rate limit', message: 'You are approaching the hourly request limit.' },
  { type: 'error', title: 'Deploy failed', message: 'Production deployment failed at step 3.' },
  { type: 'info', title: 'Comment added', message: 'A new comment was added to your post.' },
  { type: 'success', title: 'Payment received', message: 'Invoice #1042 has been paid.' },
  { type: 'warning', title: 'Disk usage high', message: 'Server disk usage is at 87%.' },
  { type: 'error', title: 'Certificate expiring', message: 'SSL certificate expires in 7 days.' }
];

export const GET: RequestHandler = async ({ request }) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (): void => {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const notification: Notification = {
          ...template,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        };

        const event = `event: notification\nid: ${notification.id}\ndata: ${JSON.stringify(notification)}\n\n`;
        controller.enqueue(encoder.encode(event));
      };

      // Send first notification quickly
      const initialTimeout = setTimeout(send, 1000);

      const interval = setInterval(send, 3000 + Math.random() * 5000);

      request.signal.addEventListener('abort', () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};
```

**`src/routes/exercises/17-realtime/03/+page.svelte`**

```svelte
<script lang="ts">
  interface Notification {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    timestamp: string;
  }

  let notifications: Notification[] = $state([]);
  let toasts: Notification[] = $state([]);
  let unreadCount = $state(0);
  let feedOpen = $state(false);

  function dismiss(id: string): void {
    notifications = notifications.filter((n) => n.id !== id);
  }

  function markAllRead(): void {
    unreadCount = 0;
  }

  function toggleFeed(): void {
    feedOpen = !feedOpen;
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && feedOpen) {
      feedOpen = false;
    }
  }

  $effect(() => {
    const source = new EventSource('/exercises/17-realtime/03/notifications');

    source.addEventListener('notification', (e: MessageEvent) => {
      const notif: Notification = JSON.parse(e.data);

      notifications = [notif, ...notifications].slice(0, 50);
      unreadCount++;

      toasts = [...toasts, notif];
      setTimeout(() => {
        toasts = toasts.filter((t) => t.id !== notif.id);
      }, 4000);
    });

    return () => source.close();
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<main class="page">
  <header class="topbar">
    <h1>Notification Feed</h1>

    <div class="bell-wrapper">
      <button class="bell-btn" onclick={toggleFeed} aria-label="Toggle notifications">
        <span class="bell-icon">&#128276;</span>
        {#if unreadCount > 0}
          <span class="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        {/if}
      </button>

      {#if feedOpen}
        <div class="feed-panel" role="dialog" aria-label="Notifications">
          <div class="feed-header">
            <span class="feed-title">Notifications</span>
            <button onclick={markAllRead} class="mark-read-btn">Mark all read</button>
          </div>

          <div class="feed-body">
            {#if notifications.length === 0}
              <p class="feed-empty">No notifications yet.</p>
            {:else}
              {#each notifications as notif (notif.id)}
                <div class="feed-item" data-type={notif.type}>
                  <div class="feed-item-content">
                    <strong>{notif.title}</strong>
                    <p>{notif.message}</p>
                    <time>{new Date(notif.timestamp).toLocaleTimeString()}</time>
                  </div>
                  <button class="dismiss-btn" onclick={() => dismiss(notif.id)} aria-label="Dismiss">&#10005;</button>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </header>

  <p class="intro">Notifications arrive in real-time via SSE. Click the bell to see the feed. Toasts appear temporarily at the bottom-right.</p>
</main>

<!-- Toast region -->
<div class="toast-region" aria-live="polite">
  {#each toasts as toast (toast.id)}
    <div class="toast" data-type={toast.type}>
      <strong>{toast.title}</strong>
      <p>{toast.message}</p>
    </div>
  {/each}
</div>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-block-end: var(--space-xl);
  }

  h1 { font-size: var(--text-2xl); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); }

  .bell-wrapper { position: relative; }

  .bell-btn {
    position: relative;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    padding: var(--space-sm);
    cursor: pointer;
    font-size: var(--text-lg);
    line-height: 1;
  }

  .badge {
    position: absolute;
    inset-block-start: -4px;
    inset-inline-end: -4px;
    background: var(--color-error);
    color: var(--color-surface);
    font-size: 0.6rem;
    font-weight: 700;
    min-inline-size: 1.2em;
    padding: 0.1em 0.3em;
    border-radius: var(--radius-full);
    text-align: center;
  }

  .feed-panel {
    position: absolute;
    inset-block-start: calc(100% + var(--space-sm));
    inset-inline-end: 0;
    inline-size: 20rem;
    max-block-size: 24rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 20;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
  }

  .feed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    border-block-end: 1px solid var(--color-border);
  }

  .feed-title { font-size: var(--text-sm); font-weight: 600; }
  .mark-read-btn { font-size: var(--text-xs); color: var(--color-brand); background: none; border: none; cursor: pointer; font-weight: 600; }

  .feed-body { overflow-y: auto; }
  .feed-empty { font-size: var(--text-sm); color: var(--color-text-muted); padding: var(--space-lg); text-align: center; }

  .feed-item {
    display: flex;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border-block-end: 1px solid var(--color-border);
    align-items: flex-start;
  }

  .feed-item[data-type='error'] { border-inline-start: 3px solid var(--color-error); }
  .feed-item[data-type='warning'] { border-inline-start: 3px solid var(--color-warning); }
  .feed-item[data-type='success'] { border-inline-start: 3px solid var(--color-success); }
  .feed-item[data-type='info'] { border-inline-start: 3px solid var(--color-brand); }

  .feed-item-content { flex: 1; }
  .feed-item-content strong { font-size: var(--text-sm); display: block; }
  .feed-item-content p { font-size: var(--text-xs); color: var(--color-text-muted); margin-block: var(--space-xs); }
  .feed-item-content time { font-size: var(--text-xs); color: var(--color-text-muted); }

  .dismiss-btn {
    background: none; border: none; cursor: pointer;
    color: var(--color-text-muted); font-size: var(--text-xs);
    padding: var(--space-xs);
  }

  .toast-region {
    position: fixed;
    inset-block-end: var(--space-lg);
    inset-inline-end: var(--space-lg);
    display: grid;
    gap: var(--space-sm);
    z-index: 50;
    max-inline-size: 20rem;
  }

  .toast {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-md);
    box-shadow: var(--shadow-lg);
    animation: toastIn 0.3s var(--ease-out);
  }

  .toast[data-type='error'] { border-inline-start: 3px solid var(--color-error); }
  .toast[data-type='warning'] { border-inline-start: 3px solid var(--color-warning); }
  .toast[data-type='success'] { border-inline-start: 3px solid var(--color-success); }
  .toast[data-type='info'] { border-inline-start: 3px solid var(--color-brand); }

  .toast strong { font-size: var(--text-sm); }
  .toast p { font-size: var(--text-xs); color: var(--color-text-muted); margin-block-start: var(--space-xs); }

  @keyframes toastIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
</style>
```

### Explanation

This exercise combines SSE with real-world UI patterns. The notification system uses named events (`event: notification`) so the client can listen specifically for notification events and ignore others. The dual display (feed panel + toasts) is a common pattern: toasts provide immediate visual feedback while the feed provides a persistent history. The `$state` array capping (`slice(0, 50)`) prevents unbounded memory growth during long sessions. The `aria-live="polite"` attribute on the toast region ensures screen readers announce new notifications without interrupting the user. The Escape key handler makes the feed panel keyboard-accessible. The `data-type` attribute on CSS selectors is a clean way to style variants without generating multiple CSS classes. The `setTimeout` cleanup for toasts creates the auto-dismiss behavior. In production, you would add persistent dismiss state (so dismissed notifications do not reappear on refresh) and potentially use a service worker for background notifications.
</details>
