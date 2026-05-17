---
module: 2
exercise: 2
title: Derived Chain Calculator
difficulty: intermediate
estimated_time: 20
skills_tested:
  - $derived rune
  - chained derivations
  - TypeScript type narrowing
---

# Exercise 2.2 — Derived Chain Calculator

## Brief

Build a unit converter that chains multiple `$derived` values. The user enters a temperature in Celsius, and the page displays Fahrenheit, Kelvin, and a human-readable description — each computed as a derived value from the previous one. This proves that `$derived` values can depend on other `$derived` values.

## Requirements

1. Create `src/routes/exercises/02-reactivity/02/+page.svelte`
2. A single `$state` input: `celsius` (number)
3. `$derived` value: `fahrenheit` computed from celsius
4. `$derived` value: `kelvin` computed from celsius
5. `$derived` value: `description` (string) that returns "Freezing", "Cold", "Comfortable", "Warm", or "Hot" based on celsius ranges
6. `$derived` value: `cssColor` that returns an OKLCH color string (blue for cold, green for comfortable, red for hot)
7. Display all values in a styled dashboard with a live-updating background color
8. The input must be a range slider AND a number input (both bound to the same state)

## Constraints

- No `$effect` — all computations must be `$derived`
- No imperative updates to derived values
- The color must be computed, not looked up from a map
- TypeScript strict — the description must be typed as a union of literals

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`$derived` takes an expression and recomputes whenever its dependencies change. Chain them: `let fahrenheit = $derived(celsius * 9/5 + 32)`. The description can use ternary operators or a function call inside `$derived`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

For the color, map the celsius range (say -20 to 50) to an OKLCH hue (250 for blue, 145 for green, 25 for red). Use linear interpolation: `hue = 250 - ((celsius + 20) / 70) * 225`. Clamp the result. The `$derived` for color depends on celsius, creating a reactive color that changes as you drag the slider.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  type TempDescription = 'Freezing' | 'Cold' | 'Comfortable' | 'Warm' | 'Hot';

  let celsius: number = $state(20);
  let fahrenheit: number = $derived(celsius * 9 / 5 + 32);
  let kelvin: number = $derived(celsius + 273.15);
  let description: TempDescription = $derived(
    celsius <= 0 ? 'Freezing' :
    celsius <= 10 ? 'Cold' :
    celsius <= 24 ? 'Comfortable' :
    celsius <= 35 ? 'Warm' : 'Hot'
  );
  let hue: number = $derived(Math.max(0, Math.min(250, 250 - ((celsius + 20) / 70) * 250)));
  let cssColor: string = $derived(`oklch(65% 0.2 ${hue})`);
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  type TempDescription = 'Freezing' | 'Cold' | 'Comfortable' | 'Warm' | 'Hot';

  let celsius: number = $state(20);

  let fahrenheit: number = $derived(Math.round((celsius * 9 / 5 + 32) * 10) / 10);

  let kelvin: number = $derived(Math.round((celsius + 273.15) * 10) / 10);

  let description: TempDescription = $derived(
    celsius <= 0 ? 'Freezing' :
    celsius <= 10 ? 'Cold' :
    celsius <= 24 ? 'Comfortable' :
    celsius <= 35 ? 'Warm' : 'Hot'
  );

  let hue: number = $derived(
    Math.max(0, Math.min(250, 250 - ((celsius + 20) / 70) * 250))
  );

  let cssColor: string = $derived(`oklch(65% 0.18 ${hue.toFixed(0)})`);
</script>

<main class="page">
  <h1>Temperature Converter</h1>

  <div class="dashboard" style="--temp-color: {cssColor}">
    <div class="input-group">
      <label for="celsius-range">Celsius: {celsius}°C</label>
      <input
        id="celsius-range"
        type="range"
        min={-40}
        max={60}
        bind:value={celsius}
      />
      <input
        type="number"
        min={-40}
        max={60}
        bind:value={celsius}
        class="number-input"
      />
    </div>

    <div class="results">
      <div class="result-card">
        <span class="result-label">Fahrenheit</span>
        <span class="result-value">{fahrenheit}°F</span>
      </div>
      <div class="result-card">
        <span class="result-label">Kelvin</span>
        <span class="result-value">{kelvin} K</span>
      </div>
      <div class="result-card highlight">
        <span class="result-label">Feels</span>
        <span class="result-value">{description}</span>
      </div>
    </div>
  </div>
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

  .dashboard {
    background: var(--color-surface-2);
    border: 2px solid var(--temp-color, var(--color-border));
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    display: grid;
    gap: var(--space-lg);
    transition: border-color var(--dur-base) var(--ease-out);
  }

  .input-group {
    display: grid;
    gap: var(--space-sm);
  }

  label {
    font-size: var(--text-lg);
    font-weight: 600;
  }

  input[type="range"] {
    inline-size: 100%;
    accent-color: var(--temp-color, var(--color-brand));
  }

  .number-input {
    inline-size: 5rem;
    padding: var(--space-xs) var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--text-base);
  }

  .results {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-md);
  }

  @media (max-width: 479px) {
    .results {
      grid-template-columns: 1fr;
    }
  }

  .result-card {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    text-align: center;
    display: grid;
    gap: var(--space-xs);
  }

  .result-card.highlight {
    background: var(--temp-color, var(--color-brand));
    color: oklch(100% 0 0);
  }

  .result-label {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.8;
  }

  .result-value {
    font-size: var(--text-xl);
    font-weight: 700;
  }
</style>
```

### Explanation

This exercise proves that `$derived` is not just syntactic sugar — it creates a dependency graph. When `celsius` changes, all four derived values recompute automatically in topological order. The chain is: `celsius` → `fahrenheit`, `kelvin`, `description`, `hue` → `cssColor`. The compiler tracks these dependencies at compile time, so there is zero wasted work. The `cssColor` derived value feeds into a CSS custom property via inline style, creating a fully reactive visual system. This pattern scales: you could add dozens of derived values and the framework handles ordering and caching automatically.
</details>
