---
module: 20
exercise: 1
title: Vitest Configuration
difficulty: beginner
estimated_time: 10
skills_tested:
  - vitest.config.ts setup
  - test file conventions
  - first passing test
  - assertion API basics
---

# Exercise 20.1 — Vitest Configuration

## Brief

Set up Vitest for a SvelteKit project and write your first test. Configure the test runner with proper SvelteKit aliases, set up the testing environment, and write tests for a pure utility function. This exercise teaches the testing foundation that every other test builds upon.

## Requirements

1. Create (or verify) `vitest.config.ts` at the project root with SvelteKit-aware configuration
2. Configure path aliases (`$lib`, `$app`) so imports work in test files
3. Set the test environment to `jsdom` for component tests
4. Create `src/lib/utils/math.ts` with pure functions: `clamp(value, min, max)`, `lerp(a, b, t)`, `roundTo(value, decimals)`
5. Create `src/lib/utils/math.test.ts` with tests for each function
6. Write at least 3 test cases per function (edge cases, normal cases, boundary cases)
7. Use `describe`, `it`/`test`, and `expect` assertions
8. Verify the tests pass with `pnpm vitest run`
9. Create `src/routes/exercises/20-testing/01/+page.svelte` documenting the config and test patterns
10. Style with PE7 tokens

## Constraints

- No test utilities beyond what Vitest provides (no additional testing libraries for this exercise)
- TypeScript strict mode
- Tests must have meaningful descriptions (not "test 1", "test 2")
- Each function must have at least one edge case test

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Vitest reads from `vitest.config.ts` at the project root. For SvelteKit, extend the Vite config: `import { defineConfig } from 'vitest/config'; import { sveltekit } from '@sveltejs/kit/vite';` and include `sveltekit()` as a plugin. This ensures `$lib` aliases work.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Test files follow the pattern `*.test.ts` or `*.spec.ts`. Use `describe('function name', () => { ... })` to group tests. Use `expect(result).toBe(expected)` for exact equality, `expect(result).toBeCloseTo(expected)` for floating-point comparisons.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom'
  }
});

// math.test.ts
import { describe, it, expect } from 'vitest';
import { clamp, lerp, roundTo } from './math';

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
});
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true
  }
});
```

**`src/lib/utils/math.ts`**

```typescript
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
```

**`src/lib/utils/math.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { clamp, lerp, roundTo } from './math';

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to minimum when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to maximum when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('handles negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
  });
});

describe('lerp', () => {
  it('returns start value at t=0', () => {
    expect(lerp(0, 100, 0)).toBe(0);
  });

  it('returns end value at t=1', () => {
    expect(lerp(0, 100, 1)).toBe(100);
  });

  it('returns midpoint at t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it('handles negative values', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });

  it('extrapolates beyond t=1', () => {
    expect(lerp(0, 100, 2)).toBe(200);
  });
});

describe('roundTo', () => {
  it('rounds to specified decimal places', () => {
    expect(roundTo(3.14159, 2)).toBe(3.14);
  });

  it('rounds to zero decimal places', () => {
    expect(roundTo(3.7, 0)).toBe(4);
  });

  it('handles already-rounded values', () => {
    expect(roundTo(5.0, 2)).toBe(5);
  });

  it('rounds up at midpoint', () => {
    expect(roundTo(2.555, 2)).toBeCloseTo(2.56);
  });

  it('handles negative values', () => {
    expect(roundTo(-3.456, 1)).toBe(-3.5);
  });
});
```

**`src/routes/exercises/20-testing/01/+page.svelte`**

```svelte
<script lang="ts">
  const configSteps = [
    { step: 'Install', command: 'pnpm add -D vitest @testing-library/svelte jsdom' },
    { step: 'Configure', command: 'Create vitest.config.ts with sveltekit() plugin' },
    { step: 'Write', command: 'Create *.test.ts files next to source files' },
    { step: 'Run', command: 'pnpm vitest run (once) or pnpm vitest (watch mode)' }
  ];
</script>

<main class="page">
  <h1>Vitest Configuration</h1>
  <p class="intro">Setting up Vitest for SvelteKit with proper aliases and environment.</p>

  <section class="steps">
    <h2>Setup Steps</h2>
    {#each configSteps as item, i}
      <div class="step-card">
        <span class="step-num">{i + 1}</span>
        <div>
          <strong>{item.step}</strong>
          <code>{item.command}</code>
        </div>
      </div>
    {/each}
  </section>

  <section class="assertions">
    <h2>Common Assertions</h2>
    <div class="assertion-grid">
      <code>expect(x).toBe(y)</code><span>Exact equality (===)</span>
      <code>expect(x).toEqual(y)</code><span>Deep equality (objects/arrays)</span>
      <code>expect(x).toBeCloseTo(y)</code><span>Floating-point comparison</span>
      <code>expect(x).toBeTruthy()</code><span>Truthy check</span>
      <code>expect(fn).toThrow()</code><span>Exception assertion</span>
    </div>
  </section>
</main>

<style>
  .page { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }

  .steps { margin-block-end: var(--space-2xl); }
  .step-card { display: flex; gap: var(--space-md); align-items: center; padding: var(--space-md); background: var(--color-surface-2); border-radius: var(--radius-md); margin-block-end: var(--space-sm); }
  .step-num { inline-size: 2rem; block-size: 2rem; border-radius: var(--radius-full); background: var(--color-brand); color: var(--color-surface); display: grid; place-items: center; font-weight: 700; font-size: var(--text-sm); flex-shrink: 0; }
  .step-card strong { display: block; font-size: var(--text-sm); }
  .step-card code { font-size: var(--text-xs); color: var(--color-text-muted); }

  .assertion-grid { display: grid; grid-template-columns: auto 1fr; gap: var(--space-sm); }
  .assertion-grid code { font-size: var(--text-xs); background: var(--color-surface-2); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); }
  .assertion-grid span { font-size: var(--text-sm); color: var(--color-text-muted); align-self: center; }
</style>
```

### Explanation

Vitest integrates natively with Vite's plugin system, which makes it the ideal test runner for SvelteKit. By including `sveltekit()` as a plugin, all path aliases (`$lib`, `$app/navigation`, etc.) work in test files without extra configuration. The `jsdom` environment provides a simulated DOM for component tests (needed later, but configured now). Test files live next to source files (`math.test.ts` beside `math.ts`) — this co-location makes it obvious which files have tests and which do not. Each test follows the AAA pattern: Arrange (set up inputs), Act (call the function), Assert (check the result). Edge cases are crucial: `clamp` with equal min/max, `lerp` with `t > 1`, `roundTo` with negative numbers. The `toBeCloseTo` assertion handles floating-point precision issues — `2.555` rounded to 2 decimals might be `2.5549999...` due to IEEE 754, so `toBe(2.56)` could fail while `toBeCloseTo(2.56)` passes.
</details>
