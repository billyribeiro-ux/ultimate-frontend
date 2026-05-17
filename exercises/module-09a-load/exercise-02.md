---
module: 9
exercise: 2
title: Parallel Data Loading
difficulty: intermediate
estimated_time: 20
skills_tested:
  - Promise.all in load
  - layout vs page load
  - waterfall elimination
---

# Exercise 9a.2 — Parallel Data Loading

## Brief

Build a dashboard page that loads three independent data sources (user profile, notifications, and activity feed) in parallel within a single load function using `Promise.all`, proving that the total load time equals the slowest single fetch rather than the sum of all three.

## Requirements

1. Create `src/routes/dashboard/+page.server.ts` with a load function that fetches three data sources in parallel
2. Simulate three async data sources with `await new Promise(r => setTimeout(r, ms))`: user (200ms), notifications (300ms), activity (150ms)
3. Use `Promise.all` to run all three fetches concurrently
4. Return all three datasets in a single typed object
5. Create `src/routes/dashboard/+page.svelte` that renders a three-column grid showing each dataset
6. Add a visible "Load time" display that shows total server-side duration using `performance.now()` measured inside the load function
7. Prove the total time is approximately 300ms (the max), not 650ms (the sum)

## Constraints

- All three data fetches must run concurrently — no sequential awaits
- The load function return type must be fully typed, no `any`
- All styling uses PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

In a SvelteKit load function, you can use `Promise.all([fetchA(), fetchB(), fetchC()])` to run promises concurrently. Destructure the result: `const [user, notifications, activity] = await Promise.all([...])`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Measure timing inside the load function using `performance.now()` before and after the `Promise.all`. Return the delta as part of the data object. The page renders it to prove parallelism.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
export const load: PageServerLoad = async () => {
  const start = performance.now();

  const [user, notifications, activity] = await Promise.all([
    fetchUser(),
    fetchNotifications(),
    fetchActivity()
  ]);

  return { user, notifications, activity, loadTime: Math.round(performance.now() - start) };
};
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface Notification {
  id: number;
  message: string;
  read: boolean;
}

interface Activity {
  id: number;
  action: string;
  timestamp: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUser(): Promise<User> {
  await delay(200);
  return { name: 'Ada Lovelace', email: 'ada@example.com', avatar: 'https://api.dicebear.com/8.x/shapes/svg?seed=ada' };
}

async function fetchNotifications(): Promise<Notification[]> {
  await delay(300);
  return [
    { id: 1, message: 'New comment on your post', read: false },
    { id: 2, message: 'Build succeeded', read: true },
    { id: 3, message: 'New follower: Grace Hopper', read: false }
  ];
}

async function fetchActivity(): Promise<Activity[]> {
  await delay(150);
  return [
    { id: 1, action: 'Pushed to main', timestamp: '2 min ago' },
    { id: 2, action: 'Opened PR #42', timestamp: '15 min ago' },
    { id: 3, action: 'Merged PR #41', timestamp: '1 hour ago' }
  ];
}

export const load: PageServerLoad = async () => {
  const start = performance.now();

  const [user, notifications, activity] = await Promise.all([
    fetchUser(),
    fetchNotifications(),
    fetchActivity()
  ]);

  const loadTime = Math.round(performance.now() - start);

  return { user, notifications, activity, loadTime };
};
```

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let unreadCount = $derived(data.notifications.filter((n) => !n.read).length);
</script>

<div class="dashboard">
  <header class="dash-header">
    <h1>Dashboard</h1>
    <span class="load-time">Server load: {data.loadTime}ms (parallel)</span>
  </header>

  <div class="grid">
    <section class="card">
      <h2>Profile</h2>
      <img src={data.user.avatar} alt="{data.user.name} avatar" class="avatar" />
      <p class="user-name">{data.user.name}</p>
      <p class="user-email">{data.user.email}</p>
    </section>

    <section class="card">
      <h2>Notifications <span class="badge">{unreadCount}</span></h2>
      <ul class="list">
        {#each data.notifications as notif}
          <li class:unread={!notif.read}>{notif.message}</li>
        {/each}
      </ul>
    </section>

    <section class="card">
      <h2>Activity</h2>
      <ul class="list">
        {#each data.activity as item}
          <li>
            <span>{item.action}</span>
            <time>{item.timestamp}</time>
          </li>
        {/each}
      </ul>
    </section>
  </div>
</div>

<style>
  .dashboard {
    padding: var(--space-lg);
    max-inline-size: 72rem;
    margin-inline: auto;
  }

  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-block-end: var(--space-lg);
  }

  h1 {
    font-size: var(--text-2xl);
    color: var(--color-text);
  }

  .load-time {
    font-size: var(--text-sm);
    color: oklch(55% 0.2 145);
    font-weight: 600;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
    gap: var(--space-md);
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }

  .card h2 {
    font-size: var(--text-lg);
    margin-block-end: var(--space-md);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .badge {
    font-size: var(--text-xs);
    background: oklch(55% 0.2 25);
    color: white;
    padding: var(--space-2xs) var(--space-xs);
    border-radius: var(--radius-full);
  }

  .avatar {
    inline-size: 4rem;
    block-size: 4rem;
    border-radius: var(--radius-full);
    margin-block-end: var(--space-sm);
  }

  .user-name {
    font-weight: 600;
    color: var(--color-text);
  }

  .user-email {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .list li {
    font-size: var(--text-sm);
    color: var(--color-text);
    display: flex;
    justify-content: space-between;
  }

  .list li.unread {
    font-weight: 600;
  }

  time {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }
</style>
```

### Explanation

Sequential `await` calls create a waterfall: each fetch waits for the previous one to finish. `Promise.all` runs all promises concurrently, so the total wait time equals the slowest individual fetch. This is the single most impactful performance optimization in load functions. The timing measurement proves it — ~300ms instead of ~650ms. In production, replace the simulated delays with real API calls or database queries. The same pattern works in `+layout.server.ts` for data shared across pages.
</details>
