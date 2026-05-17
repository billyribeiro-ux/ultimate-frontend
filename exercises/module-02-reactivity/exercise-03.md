---
module: 2
exercise: 3
title: Effect Cleanup Puzzle
difficulty: advanced
estimated_time: 30
skills_tested:
  - $effect lifecycle
  - cleanup functions
  - memory leak prevention
  - interval/timeout management
---

# Exercise 2.3 — Effect Cleanup Puzzle

## Brief

Build a "live clock" component that uses `$effect` to start a `setInterval` when mounted and properly cleans it up when the component is destroyed or when a reactive dependency changes. Then add a toggle that switches between a clock and a stopwatch, proving that cleanup runs on every re-execution — not just on destroy.

## Requirements

1. Create `src/routes/exercises/02-reactivity/03/+page.svelte`
2. A `$state` toggle: `mode` that is either `'clock'` or `'stopwatch'`
3. When mode is `'clock'`: display current time, updating every second via `setInterval`
4. When mode is `'stopwatch'`: display elapsed seconds since mode switched, via `setInterval`
5. The `$effect` must return a cleanup function that clears the interval
6. Add a "leak detector" counter that shows how many intervals are currently active (should always be exactly 1)
7. Add a "destroy" button that hides the entire component using `{#if}`, proving cleanup on unmount
8. TypeScript strict — no `any`

## Constraints

- Must use `$effect` with a return cleanup function
- No `onMount`/`onDestroy` lifecycle functions
- No `setTimeout` chains — use `setInterval`
- The leak detector must prove no intervals are leaked

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`$effect` runs after the DOM updates and re-runs whenever its reactive dependencies change. When it re-runs, it first calls the cleanup function from the previous execution. This is how you prevent interval leaks.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Track active intervals with a module-level counter. Increment it when you create an interval, decrement it in the cleanup. If the counter ever exceeds 1, you have a leak. The effect should read `mode` inside its body — this makes `mode` a dependency, so switching modes triggers cleanup of the old interval and creation of a new one.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  let mode: 'clock' | 'stopwatch' = $state('clock');
  let display: string = $state('');
  let activeIntervals: number = $state(0);

  $effect(() => {
    activeIntervals++;
    const id = setInterval(() => {
      if (mode === 'clock') {
        display = new Date().toLocaleTimeString();
      } else {
        // stopwatch logic
      }
    }, 1000);

    return () => {
      clearInterval(id);
      activeIntervals--;
    };
  });
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  let mode: 'clock' | 'stopwatch' = $state('clock');
  let display: string = $state('');
  let activeIntervals: number = $state(0);
  let visible: boolean = $state(true);
  let stopwatchStart: number = $state(Date.now());

  $effect(() => {
    // Reading `mode` makes it a dependency — switching mode triggers cleanup + re-run
    const currentMode = mode;
    const start = Date.now();
    activeIntervals++;

    const id = setInterval(() => {
      if (currentMode === 'clock') {
        display = new Date().toLocaleTimeString();
      } else {
        const elapsed: number = Math.floor((Date.now() - start) / 1000);
        const mins: number = Math.floor(elapsed / 60);
        const secs: number = elapsed % 60;
        display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }, 1000);

    // Immediate first tick
    if (currentMode === 'clock') {
      display = new Date().toLocaleTimeString();
    } else {
      display = '00:00';
    }

    return () => {
      clearInterval(id);
      activeIntervals--;
    };
  });
</script>

<main class="page">
  <h1>Effect Cleanup Puzzle</h1>

  <div class="controls">
    <button onclick={() => visible = !visible}>
      {visible ? 'Destroy Component' : 'Mount Component'}
    </button>
  </div>

  {#if visible}
    <article class="timer-card">
      <div class="mode-switch">
        <button
          class:active={mode === 'clock'}
          onclick={() => mode = 'clock'}
        >
          Clock
        </button>
        <button
          class:active={mode === 'stopwatch'}
          onclick={() => mode = 'stopwatch'}
        >
          Stopwatch
        </button>
      </div>

      <p class="display">{display}</p>
      <p class="mode-label">{mode === 'clock' ? 'Current Time' : 'Elapsed'}</p>

      <div class="leak-detector" class:warning={activeIntervals > 1}>
        <span class="label">Active intervals:</span>
        <span class="count">{activeIntervals}</span>
        {#if activeIntervals > 1}
          <span class="warning-text">LEAK DETECTED</span>
        {:else}
          <span class="ok-text">No leaks</span>
        {/if}
      </div>
    </article>
  {:else}
    <p class="destroyed-notice">
      Component destroyed. Active intervals: {activeIntervals} (should be 0)
    </p>
  {/if}
</main>

<style>
  .page {
    max-inline-size: var(--prose-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-lg);
  }

  .controls {
    margin-block-end: var(--space-lg);
  }

  .controls button {
    padding: var(--space-sm) var(--space-md);
    background: var(--color-error);
    color: oklch(100% 0 0);
    font-weight: 600;
    border-radius: var(--radius-md);
  }

  .timer-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    text-align: center;
    display: grid;
    gap: var(--space-md);
  }

  .mode-switch {
    display: flex;
    gap: var(--space-xs);
    justify-content: center;
  }

  .mode-switch button {
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 600;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    transition: all var(--dur-fast) var(--ease-out);
  }

  .mode-switch button.active {
    background: var(--color-brand);
    color: oklch(100% 0 0);
    border-color: var(--color-brand);
  }

  .display {
    font-size: var(--text-hero);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
  }

  .mode-label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .leak-detector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    font-size: var(--text-sm);
  }

  .leak-detector.warning {
    background: var(--color-error);
    color: oklch(100% 0 0);
  }

  .count {
    font-weight: 700;
    font-size: var(--text-lg);
  }

  .ok-text {
    color: var(--color-success);
    font-weight: 600;
  }

  .warning-text {
    font-weight: 700;
    animation: pulse 0.5s infinite;
  }

  .destroyed-notice {
    padding: var(--space-lg);
    background: var(--color-surface-2);
    border-radius: var(--radius-md);
    text-align: center;
    color: var(--color-text-muted);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
```

### Explanation

The critical insight is that `$effect`'s cleanup function runs in two scenarios: (1) when the effect re-runs due to a dependency change, and (2) when the component is destroyed. By reading `mode` inside the effect body, we make it a dependency — switching modes triggers cleanup (clearing the old interval) before creating a new one. The `activeIntervals` counter provides visible proof that cleanup works correctly. Without the return statement, every mode switch would leak an interval, eventually spawning hundreds of concurrent timers. This pattern applies to any external resource: WebSocket connections, event listeners, observers, subscriptions.
</details>
