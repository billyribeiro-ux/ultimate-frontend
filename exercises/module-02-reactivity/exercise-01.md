---
module: 2
exercise: 1
title: Counter Variants
difficulty: beginner
estimated_time: 10
skills_tested:
  - $state rune
  - event handlers
  - template reactivity
---

# Exercise 2.1 — Counter Variants

## Brief

Build a page with three different counter implementations: a simple increment/decrement counter, a step counter (configurable step size), and a counter with min/max bounds. Each demonstrates a different aspect of `$state` with primitives.

## Requirements

1. Create `src/routes/exercises/02-reactivity/01/+page.svelte`
2. Counter A: starts at 0, has +1 and -1 buttons, displays current value
3. Counter B: starts at 0, has a step size input (default 5), +step and -step buttons
4. Counter C: starts at 50, min=0, max=100, buttons disabled at bounds
5. All state must use `$state()` rune
6. All event handlers must use lowercase `onclick` attribute syntax
7. Display each counter in a styled card with PE7 tokens
8. TypeScript strict — all variables typed

## Constraints

- No `$derived` (that is Exercise 2)
- No external state management
- No `on:click` (legacy Svelte 4 syntax)
- No `export let` (legacy prop syntax)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Each counter is just a `let count = $state(0)` with buttons that mutate it. For bounds checking, use a conditional in the handler or disable the button with the `disabled` attribute.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The step counter needs two pieces of state: the count and the step size. When the step input changes, it updates the step state, which changes how much the buttons add/subtract. For bounds, check `count >= max` before incrementing.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  let countA: number = $state(0);
  let countB: number = $state(0);
  let step: number = $state(5);
  let countC: number = $state(50);
  const MIN: number = 0;
  const MAX: number = 100;
</script>

<button onclick={() => countA++}>+1</button>
<button onclick={() => { countC = Math.min(MAX, countC + 1) }}>+1</button>
<button disabled={countC >= MAX}>+1 (bounded)</button>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  // Counter A — simple
  let countA: number = $state(0);

  // Counter B — configurable step
  let countB: number = $state(0);
  let step: number = $state(5);

  // Counter C — bounded
  let countC: number = $state(50);
  const MIN: number = 0;
  const MAX: number = 100;
</script>

<main class="page">
  <h1>Counter Variants</h1>

  <div class="grid">
    <article class="card">
      <h2>Simple Counter</h2>
      <p class="value">{countA}</p>
      <div class="controls">
        <button onclick={() => countA--}>-1</button>
        <button onclick={() => countA++}>+1</button>
      </div>
    </article>

    <article class="card">
      <h2>Step Counter</h2>
      <p class="value">{countB}</p>
      <div class="step-config">
        <label>
          Step size:
          <input type="number" bind:value={step} min={1} />
        </label>
      </div>
      <div class="controls">
        <button onclick={() => countB -= step}>-{step}</button>
        <button onclick={() => countB += step}>+{step}</button>
      </div>
    </article>

    <article class="card">
      <h2>Bounded Counter</h2>
      <p class="value">{countC}</p>
      <p class="bounds">Range: {MIN}–{MAX}</p>
      <div class="controls">
        <button onclick={() => countC = Math.max(MIN, countC - 1)} disabled={countC <= MIN}>
          -1
        </button>
        <button onclick={() => countC = Math.max(MIN, countC - 10)} disabled={countC <= MIN}>
          -10
        </button>
        <button onclick={() => countC = Math.min(MAX, countC + 10)} disabled={countC >= MAX}>
          +10
        </button>
        <button onclick={() => countC = Math.min(MAX, countC + 1)} disabled={countC >= MAX}>
          +1
        </button>
      </div>
    </article>
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-xl);
  }

  .grid {
    display: grid;
    gap: var(--space-lg);
  }

  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: grid;
    gap: var(--space-md);
    text-align: center;
  }

  h2 {
    font-size: var(--text-lg);
  }

  .value {
    font-size: var(--text-hero);
    font-weight: 800;
    color: var(--color-brand);
  }

  .bounds {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .step-config {
    font-size: var(--text-sm);
  }

  .step-config input {
    inline-size: 4rem;
    padding: var(--space-xs);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    text-align: center;
  }

  .controls {
    display: flex;
    gap: var(--space-sm);
    justify-content: center;
    flex-wrap: wrap;
  }

  button {
    padding: var(--space-xs) var(--space-md);
    background: var(--color-brand);
    color: oklch(100% 0 0);
    font-weight: 600;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    transition: background var(--dur-fast) var(--ease-out);
  }

  button:hover:not(:disabled) {
    background: var(--color-brand-dim);
  }

  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
```

### Explanation

Each counter demonstrates a progressively more complex use of `$state`. Counter A shows the simplest case — a single reactive primitive. Counter B introduces a second piece of state (step) that influences behavior, showing how multiple `$state` values compose. Counter C adds constraints, demonstrating that reactive updates can include logic (Math.min/max) and that the `disabled` attribute reactively updates when state changes. The key insight: `$state` creates a reactive binding — any expression in the template that reads it will automatically re-render when it changes. No subscriptions, no manual updates.
</details>
