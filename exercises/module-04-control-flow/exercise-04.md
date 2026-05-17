---
module: 4
exercise: 4
title: Async Error States
difficulty: expert
estimated_time: 45
skills_tested:
  - "{#await} blocks"
  - error handling
  - retry logic
  - loading/error/success states
  - TypeScript Promise types
---

# Exercise 4.4 — Async Error States

## Brief

Build a data fetching component that handles all async states: loading, success, error, and retry. Use `{#await}` blocks and demonstrate proper error recovery patterns. Include a simulated API that randomly fails to test error handling.

## Requirements

1. Create `src/routes/exercises/04-control-flow/04/+page.svelte`
2. A simulated fetch function that randomly succeeds or fails (50/50)
3. Use `{#await promise}` with `{:then}` and `{:catch}` blocks
4. Loading state: skeleton placeholders
5. Error state: error message with a "Retry" button
6. Success state: rendered data with a "Refresh" button
7. Track and display: attempt count, last error message, time since last fetch
8. Implement exponential backoff on auto-retry (1s, 2s, 4s)
9. A manual retry button that resets the backoff
10. TypeScript: properly typed `Promise<T>` return values

## Constraints

- Must use `{#await}` — no manual loading state management
- No external fetch/query libraries
- The simulated API must use `Promise` with realistic delays
- Error messages must be typed (not `unknown` or `any`)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`{#await promise}` renders the loading block. `{:then data}` renders on success. `{:catch error}` renders on failure. To retry, reassign the promise variable: `promise = fetchData()`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Create a function that returns a `Promise` wrapping a `setTimeout`. Inside, randomly resolve or reject. Store the promise in a `$state` variable. The retry button simply calls the function again and reassigns the promise. For exponential backoff, track attempt count and multiply delay by `2^attempts`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface ApiResponse { users: { id: number; name: string }[]; }

  function fetchUsers(): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve({ users: [{ id: 1, name: 'Alice' }] });
        } else {
          reject(new Error('Server error: 500'));
        }
      }, 1000);
    });
  }

  let promise: Promise<ApiResponse> = $state(fetchUsers());
  function retry() { promise = fetchUsers(); }
</script>

{#await promise}
  <p>Loading...</p>
{:then data}
  <!-- render data.users -->
{:catch error}
  <p>{error.message}</p>
  <button onclick={retry}>Retry</button>
{/await}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
  }

  interface ApiResponse {
    users: User[];
    timestamp: string;
  }

  let attempts: number = $state(0);
  let lastError: string = $state('');
  let lastFetchTime: string = $state('');

  function fetchUsers(): Promise<ApiResponse> {
    attempts++;
    return new Promise((resolve, reject) => {
      const delay = 800 + Math.random() * 700;
      setTimeout(() => {
        if (Math.random() > 0.5) {
          lastFetchTime = new Date().toLocaleTimeString();
          lastError = '';
          resolve({
            users: [
              { id: 1, name: 'Alice Chen', email: 'alice@example.com' },
              { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
              { id: 3, name: 'Carol Davis', email: 'carol@example.com' }
            ],
            timestamp: new Date().toISOString()
          });
        } else {
          const errors: string[] = [
            'Server error: 500 Internal Server Error',
            'Network timeout: request took longer than 10s',
            'Rate limited: too many requests (429)'
          ];
          const msg = errors[Math.floor(Math.random() * errors.length)];
          lastError = msg;
          reject(new Error(msg));
        }
      }, delay);
    });
  }

  let promise: Promise<ApiResponse> = $state(fetchUsers());

  function retry(): void {
    promise = fetchUsers();
  }

  function reset(): void {
    attempts = 0;
    lastError = '';
    promise = fetchUsers();
  }
</script>

<main class="page">
  <h1>Async Error States</h1>

  <div class="stats">
    <span>Attempts: <strong>{attempts}</strong></span>
    <span>Last fetch: <strong>{lastFetchTime || 'never'}</strong></span>
    {#if lastError}
      <span class="error-stat">Last error: {lastError}</span>
    {/if}
  </div>

  <div class="card">
    {#await promise}
      <div class="skeleton-list">
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
      </div>
      <p class="loading-text">Fetching users (attempt #{attempts})...</p>
    {:then data}
      <div class="success">
        <h2>Users loaded</h2>
        <ul class="user-list">
          {#each data.users as user (user.id)}
            <li class="user-item">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </li>
          {/each}
        </ul>
        <p class="timestamp">Fetched at: {data.timestamp}</p>
        <button onclick={retry}>Refresh</button>
      </div>
    {:catch error}
      <div class="error-state">
        <p class="error-icon">✕</p>
        <h2>Something went wrong</h2>
        <p class="error-message">{error.message}</p>
        <div class="error-actions">
          <button onclick={retry}>Retry (attempt #{attempts + 1})</button>
          <button class="secondary" onclick={reset}>Reset</button>
        </div>
      </div>
    {/await}
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--prose-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }

  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
    margin-block-end: var(--space-lg);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .error-stat { color: var(--color-error); }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
  }

  .skeleton-list { display: grid; gap: var(--space-sm); }

  .skeleton {
    block-size: 3rem;
    background: var(--color-border);
    border-radius: var(--radius-md);
    animation: pulse 1.5s infinite;
  }

  .loading-text {
    margin-block-start: var(--space-md);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .user-list {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--space-sm);
  }

  .user-item {
    display: flex;
    justify-content: space-between;
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface);
    border-radius: var(--radius-md);
  }

  .user-item span { color: var(--color-text-muted); font-size: var(--text-sm); }

  .timestamp {
    margin-block-start: var(--space-md);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .error-state { text-align: center; }
  .error-icon { font-size: var(--text-hero); color: var(--color-error); }
  .error-message { color: var(--color-error); font-size: var(--text-sm); margin-block-end: var(--space-lg); }

  .error-actions { display: flex; gap: var(--space-sm); justify-content: center; }

  button {
    padding: var(--space-sm) var(--space-md);
    background: var(--color-brand);
    color: oklch(100% 0 0);
    font-weight: 600;
    border-radius: var(--radius-md);
  }

  .secondary {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton { animation: none; opacity: 0.5; }
  }
</style>
```

### Explanation

`{#await}` is Svelte's built-in mechanism for handling all three promise states in the template. By storing the promise in a `$state` variable, reassigning it triggers a re-render that shows the loading state again. This pattern is simple but powerful — it eliminates the need for separate `isLoading`, `error`, `data` state variables. The retry function just reassigns the promise. At scale, you would wrap this in a reusable component or use SvelteKit's `load` functions (Module 9A), but understanding the raw `{#await}` pattern is essential for client-side fetching scenarios.
</details>
