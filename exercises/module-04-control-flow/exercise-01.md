---
module: 4
exercise: 1
title: Conditional Notification Banner
difficulty: beginner
estimated_time: 10
skills_tested:
  - "{#if} blocks"
  - "{:else if} chains"
  - conditional class binding
---

# Exercise 4.1 — Conditional Notification Banner

## Brief

Build a notification banner component that renders different content and styling based on its `type` prop. Use `{#if}` blocks to switch between icons, messages, and color schemes for success, error, warning, and info variants.

## Requirements

1. Create `src/routes/exercises/04-control-flow/01/+page.svelte`
2. Define a union type: `type NotificationType = 'success' | 'error' | 'warning' | 'info'`
3. Use `{#if}/{:else if}/{:else}` to render different icons per type (text characters: checkmark, X, exclamation, info)
4. Each type has a distinct border color using OKLCH feedback tokens
5. A dismiss button hides the notification (conditional rendering)
6. Show all 4 variants on the page simultaneously
7. A "Reset" button re-shows all dismissed notifications

## Constraints

- No component extraction (everything in one file for this exercise)
- No switch statements — use `{#if}` in the template
- Must use `class:` directive for conditional styling
- All colors from PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Use `{#if type === 'success'}` inside the banner markup to render different icons. Use `class:success={type === 'success'}` on the wrapper to apply type-specific styles.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Create an array of notification objects with `type`, `message`, and `visible` (state). Iterate with `{#each}`, and wrap each banner in `{#if notif.visible}`. The dismiss button sets `visible = false`. Reset sets all back to `true`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  type NotificationType = 'success' | 'error' | 'warning' | 'info';
  interface Notification { type: NotificationType; message: string; visible: boolean; }

  let notifications: Notification[] = $state([
    { type: 'success', message: 'Operation completed!', visible: true },
    // ...
  ]);
</script>

{#each notifications as notif}
  {#if notif.visible}
    <div class="banner" class:success={notif.type === 'success'} class:error={notif.type === 'error'}>
      {#if notif.type === 'success'}✓{:else if notif.type === 'error'}✕{/if}
      <span>{notif.message}</span>
      <button onclick={() => notif.visible = false}>Dismiss</button>
    </div>
  {/if}
{/each}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  type NotificationType = 'success' | 'error' | 'warning' | 'info';

  interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    visible: boolean;
  }

  let notifications: Notification[] = $state([
    { id: '1', type: 'success', message: 'Your changes have been saved successfully.', visible: true },
    { id: '2', type: 'error', message: 'Failed to connect to the server. Please try again.', visible: true },
    { id: '3', type: 'warning', message: 'Your session will expire in 5 minutes.', visible: true },
    { id: '4', type: 'info', message: 'A new version is available. Refresh to update.', visible: true }
  ]);

  function dismiss(id: string): void {
    const notif = notifications.find((n) => n.id === id);
    if (notif) notif.visible = false;
  }

  function resetAll(): void {
    for (const notif of notifications) {
      notif.visible = true;
    }
  }

  let anyHidden: boolean = $derived(notifications.some((n) => !n.visible));
</script>

<main class="page">
  <h1>Notification Banners</h1>

  {#if anyHidden}
    <button class="reset-btn" onclick={resetAll}>Reset All</button>
  {/if}

  <div class="stack">
    {#each notifications as notif}
      {#if notif.visible}
        <div
          class="banner"
          class:success={notif.type === 'success'}
          class:error={notif.type === 'error'}
          class:warning={notif.type === 'warning'}
          class:info={notif.type === 'info'}
          role="alert"
        >
          <span class="icon">
            {#if notif.type === 'success'}
              ✓
            {:else if notif.type === 'error'}
              ✕
            {:else if notif.type === 'warning'}
              ⚠
            {:else}
              ℹ
            {/if}
          </span>
          <p class="message">{notif.message}</p>
          <button
            class="dismiss"
            onclick={() => dismiss(notif.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      {/if}
    {/each}
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--prose-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }

  .reset-btn {
    padding: var(--space-xs) var(--space-md);
    background: var(--color-brand);
    color: oklch(100% 0 0);
    font-weight: 600;
    border-radius: var(--radius-md);
    margin-block-end: var(--space-md);
  }

  .stack {
    display: grid;
    gap: var(--space-md);
  }

  .banner {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    border-inline-start: 4px solid var(--color-border);
    background: var(--color-surface-2);
  }

  .banner.success { border-color: var(--color-success); }
  .banner.error { border-color: var(--color-error); }
  .banner.warning { border-color: var(--color-warning); }
  .banner.info { border-color: var(--color-brand); }

  .icon {
    font-size: var(--text-lg);
    flex-shrink: 0;
  }

  .banner.success .icon { color: var(--color-success); }
  .banner.error .icon { color: var(--color-error); }
  .banner.warning .icon { color: var(--color-warning); }
  .banner.info .icon { color: var(--color-brand); }

  .message {
    flex: 1;
    font-size: var(--text-sm);
  }

  .dismiss {
    padding: var(--space-xs);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    border-radius: var(--radius-sm);
    transition: color var(--dur-fast) var(--ease-out);
  }

  .dismiss:hover { color: var(--color-text); }
</style>
```

### Explanation

This exercise demonstrates three forms of conditional rendering: `{#if notif.visible}` for show/hide, `{#if}/{:else if}` for content branching, and `class:` directives for conditional styling. The `role="alert"` ensures screen readers announce notifications. The `$derived` value `anyHidden` reactively shows the Reset button only when needed — this is a simple but powerful pattern for conditional UI elements that depend on computed state.
</details>
