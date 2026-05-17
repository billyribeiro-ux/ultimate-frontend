---
module: 5
exercise: 3
title: Debounce Implementation
Closure Puzzle
difficulty: advanced
expert
estimated_time: 30
45
skills_tested:
  - debounce pattern
closure debugging
  - closure scoping
event handler identity
---

# Exercise 5.3 — Debounce Implementation
Closure Puzzle

## Brief

Implement a debounce utility function from scratch (no lodash) and use it in a search input component. The search fires an API call only after the user stops typing for 300ms. Include proper cleanup when the component unmounts and when the debounce delay changes.
Solve a series of closure-related bugs in event handlers. Each bug demonstrates a common mistake: stale closures in loops, capturing the wrong variable, and the difference between capturing a value vs a reference. Build a fix for each.

## Requirements

1. Create `src/lib/exercises/05/debounce.ts` — generic debounce utility
2. Create `src/routes/exercises/05-events/03/+page.svelte`
3. `debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T & { cancel: () => void }`
4. A search input that triggers a simulated API call only after 300ms of inactivity
5. Visual feedback: show "typing...", "searching...", and results states
6. The debounce must clean up on component destroy (no orphaned timeouts)
7. A configurable delay slider that demonstrates changing debounce timing live

## Constraints

- No lodash, no external debounce libraries
- Must implement from scratch using setTimeout/clearTimeout
- Must handle component destruction (cancel pending calls)
- The utility must be generic (work with any function signature)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A debounce function returns a wrapper that delays execution. Each call resets the timer. The key: store the timeout ID in a closure variable that persists across calls.
A closure captures variables, not values. If you create a function inside a loop that references the loop variable, all functions share the same variable (which ends at the final value after the loop completes).
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The debounce function creates a closure with a `timeoutId` variable. Each call clears the previous timeout and sets a new one. The returned function has the same signature as the original. Add a `.cancel()` method that clears the timeout — use this in $effect cleanup.
Bug 1 fix: Use let in the loop (block scoping) or capture the index in the closure at creation time. Bug 2 fix: Read state inside the handler body (Svelte's reactivity ensures fresh values). Bug 3 fix: Store the interval ID in a  variable so cleanup always references the current one.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`typescript
export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => { if (timeoutId) clearTimeout(timeoutId); };
  return debounced as T & { cancel: () => void };
}
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**\`src/lib/exercises/05/debounce.ts\`**

\`\`\`typescript
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...(args as never[]));
    }, ms);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced as T & { cancel: () => void };
}
\`\`\`

**\`src/routes/exercises/05-events/03/+page.svelte\`**

\`\`\`svelte
<script lang="ts">
  import { debounce } from '\$lib/exercises/05/debounce';

  type SearchState = 'idle' | 'typing' | 'searching' | 'results';

  let query: string = \$state('');
  let searchState: SearchState = \$state('idle');
  let results: string[] = \$state([]);
  let delay: number = \$state(300);

  const allItems: string[] = ['Svelte', 'SvelteKit', 'React', 'Next.js', 'Vue', 'Nuxt', 'Angular', 'Solid', 'Qwik', 'Astro'];

  function performSearch(q: string): void {
    searchState = 'searching';
    setTimeout(() => {
      results = allItems.filter(item => item.toLowerCase().includes(q.toLowerCase()));
      searchState = 'results';
    }, 500);
  }

  const debouncedSearch = debounce((q: string) => performSearch(q), delay);

  function handleInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    query = target.value;
    if (query) {
      searchState = 'typing';
      debouncedSearch(query);
    } else {
      searchState = 'idle';
      results = [];
      debouncedSearch.cancel();
    }
  }

  \$effect(() => {
    return () => debouncedSearch.cancel();
  });
</script>

<main class="page">
  <h1>Debounce Search</h1>
  <input type="search" value={query} oninput={handleInput} placeholder="Search frameworks..." />
  <p class="state">State: <strong>{searchState}</strong></p>

  <label>Delay: {delay}ms <input type="range" min={100} max={1000} step={50} bind:value={delay} /></label>

  {#if searchState === 'results'}
    <ul>{#each results as item}<li>{item}</li>{/each}</ul>
    {#if results.length === 0}<p>No results for "{query}"</p>{/if}
  {/if}
</main>

<style>
  .page { max-inline-size: var(--prose-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  input[type="search"] { inline-size: 100%; padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-base); margin-block-end: var(--space-md); }
  .state { font-size: var(--text-sm); color: var(--color-text-muted); }
  ul { list-style: none; padding: 0; display: grid; gap: var(--space-xs); }
  li { padding: var(--space-sm); background: var(--color-surface-2); border-radius: var(--radius-sm); }
</style>
\`\`\`

### Explanation

Debouncing is a closure that captures a timeout ID across invocations. Each call clears the previous timer and starts a new one, ensuring the actual function only fires after a quiet period. The cleanup pattern (`debouncedSearch.cancel()` in $effect's return) prevents orphaned timeouts when the component unmounts. This is essential for search inputs, resize handlers, and scroll events.
Closures capture variables by reference, not by value. In a `var`-scoped loop, all closures share one variable that ends at the final value. With `let`, each iteration creates a new binding. In reactive frameworks, the equivalent bug is capturing stale state — Svelte's reactive system helps by re-creating handlers when dependencies change, but setTimeout/setInterval still capture at call time.
</details>
