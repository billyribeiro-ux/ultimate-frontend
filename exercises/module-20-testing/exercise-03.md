---
module: 20
exercise: 3
title: Component Render Test
difficulty: advanced
estimated_time: 30
skills_tested:
  - "@testing-library/svelte rendering"
  - DOM queries (getByRole, getByText)
  - user event simulation
  - accessibility-first testing
---

# Exercise 20.3 — Component Render Test

## Brief

Write component render tests using `@testing-library/svelte` for an interactive Counter component. The tests should render the component, query the DOM using accessibility-first selectors, simulate user interactions, and assert on the resulting DOM state. This exercise teaches the "testing as a user would" philosophy.

## Requirements

1. Create `src/lib/components/Counter.svelte` with increment/decrement buttons and a count display
2. The component accepts an `initial` prop (default 0) and a `step` prop (default 1)
3. The count display must have an accessible label (e.g., `aria-label="Current count"`)
4. Create `src/lib/components/Counter.test.ts` with render tests
5. Test initial render (count shows 0, buttons are present)
6. Test increment: click the "+" button and verify count updates
7. Test decrement: click the "-" button and verify count updates
8. Test custom initial value: render with `initial={10}` and verify
9. Test custom step: render with `step={5}` and verify increment adds 5
10. Test accessibility: verify buttons have accessible names, count has a role
11. Use `getByRole`, `getByText`, and `getByLabelText` — never query by class name or data-testid
12. Create `src/routes/exercises/20-testing/03/+page.svelte` documenting the testing approach

## Constraints

- All queries must use accessible selectors (role, label, text) — no CSS selectors
- TypeScript strict mode
- Use `@testing-library/user-event` for realistic interactions
- Each test must clean up after itself (Testing Library handles this automatically)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Import `render` from `@testing-library/svelte` and `screen` for queries. `render(Counter, { props: { initial: 5 } })` mounts the component. `screen.getByRole('button', { name: 'Increment' })` finds the button by its accessible name. Use `await userEvent.click(button)` to simulate clicks.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The Counter component needs accessible names for buttons: `<button aria-label="Increment">+</button>`. The count display needs a role: `<span role="status" aria-label="Current count">{count}</span>`. Testing Library queries mirror how screen readers find elements.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Counter from './Counter.svelte';

it('increments the count when + is clicked', async () => {
  const user = userEvent.setup();
  render(Counter);

  const button = screen.getByRole('button', { name: /increment/i });
  await user.click(button);

  expect(screen.getByRole('status')).toHaveTextContent('1');
});
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/components/Counter.svelte`**

```svelte
<script lang="ts">
  interface Props {
    initial?: number;
    step?: number;
  }

  let { initial = 0, step = 1 }: Props = $props();

  let count = $state(initial);
</script>

<div class="counter">
  <button
    class="btn"
    aria-label="Decrement"
    onclick={() => (count -= step)}
  >
    -
  </button>

  <span class="count" role="status" aria-label="Current count">
    {count}
  </span>

  <button
    class="btn"
    aria-label="Increment"
    onclick={() => (count += step)}
  >
    +
  </button>
</div>

<style>
  .counter {
    display: inline-flex;
    align-items: center;
    gap: var(--space-md);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-sm) var(--space-md);
  }

  .btn {
    inline-size: 2.5rem;
    block-size: 2.5rem;
    border-radius: var(--radius-full);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    font-size: var(--text-lg);
    font-weight: 700;
    cursor: pointer;
    display: grid;
    place-items: center;
    color: var(--color-text);
  }

  .count {
    font-size: var(--text-xl);
    font-weight: 700;
    min-inline-size: 3rem;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
</style>
```

**`src/lib/components/Counter.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Counter from './Counter.svelte';

describe('Counter', () => {
  describe('initial render', () => {
    it('displays zero by default', () => {
      render(Counter);
      expect(screen.getByRole('status')).toHaveTextContent('0');
    });

    it('renders increment and decrement buttons', () => {
      render(Counter);
      expect(screen.getByRole('button', { name: /increment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /decrement/i })).toBeInTheDocument();
    });

    it('displays custom initial value', () => {
      render(Counter, { props: { initial: 42 } });
      expect(screen.getByRole('status')).toHaveTextContent('42');
    });
  });

  describe('increment', () => {
    it('increases count by 1 when increment is clicked', async () => {
      const user = userEvent.setup();
      render(Counter);

      await user.click(screen.getByRole('button', { name: /increment/i }));

      expect(screen.getByRole('status')).toHaveTextContent('1');
    });

    it('increases count by custom step', async () => {
      const user = userEvent.setup();
      render(Counter, { props: { step: 5 } });

      await user.click(screen.getByRole('button', { name: /increment/i }));

      expect(screen.getByRole('status')).toHaveTextContent('5');
    });

    it('handles multiple clicks', async () => {
      const user = userEvent.setup();
      render(Counter);

      const btn = screen.getByRole('button', { name: /increment/i });
      await user.click(btn);
      await user.click(btn);
      await user.click(btn);

      expect(screen.getByRole('status')).toHaveTextContent('3');
    });
  });

  describe('decrement', () => {
    it('decreases count by 1 when decrement is clicked', async () => {
      const user = userEvent.setup();
      render(Counter, { props: { initial: 5 } });

      await user.click(screen.getByRole('button', { name: /decrement/i }));

      expect(screen.getByRole('status')).toHaveTextContent('4');
    });

    it('allows negative values', async () => {
      const user = userEvent.setup();
      render(Counter);

      await user.click(screen.getByRole('button', { name: /decrement/i }));

      expect(screen.getByRole('status')).toHaveTextContent('-1');
    });
  });

  describe('accessibility', () => {
    it('has accessible button names', () => {
      render(Counter);
      expect(screen.getByRole('button', { name: /increment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /decrement/i })).toBeInTheDocument();
    });

    it('count has status role for live announcements', () => {
      render(Counter);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Current count');
    });
  });
});
```

**`src/routes/exercises/20-testing/03/+page.svelte`**

```svelte
<script lang="ts">
  import Counter from '$lib/components/Counter.svelte';
</script>

<main class="page">
  <h1>Component Render Testing</h1>
  <p class="intro">Testing components the way users interact with them — by role, label, and text content.</p>

  <section class="live-demo">
    <h2>Live Component</h2>
    <Counter />
    <Counter initial={100} step={10} />
  </section>

  <section class="principles">
    <h2>Testing Principles</h2>
    <div class="principle-list">
      <div class="principle">
        <h3>Query by accessibility role</h3>
        <p><code>getByRole('button', {'{ name: /increment/i }'})</code> — finds elements the way screen readers do.</p>
      </div>
      <div class="principle">
        <h3>Simulate real user actions</h3>
        <p><code>await userEvent.click(button)</code> — fires the full event chain (mousedown, mouseup, click).</p>
      </div>
      <div class="principle">
        <h3>Assert on visible output</h3>
        <p><code>expect(element).toHaveTextContent('5')</code> — assert on what the user sees, not internal state.</p>
      </div>
    </div>
  </section>
</main>

<style>
  .page { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }

  .live-demo { display: flex; gap: var(--space-lg); flex-wrap: wrap; margin-block-end: var(--space-2xl); }

  .principle-list { display: grid; gap: var(--space-md); }
  .principle { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); }
  .principle h3 { font-size: var(--text-sm); margin-block-end: var(--space-xs); }
  .principle p { font-size: var(--text-sm); color: var(--color-text-muted); }
  code { font-size: var(--text-xs); background: var(--color-surface); padding: 0.1em 0.3em; border-radius: var(--radius-sm); }
</style>
```

### Explanation

Testing Library's philosophy is "the more your tests resemble the way your software is used, the more confidence they can give you." By querying with `getByRole('button', { name: /increment/i })`, we find elements the same way a screen reader would — this means our tests validate both functionality AND accessibility in one pass. If someone removes the `aria-label`, the test breaks. The `userEvent.setup()` pattern creates a user instance that fires realistic event chains (mousedown, focus, mouseup, click) rather than synthetic single events. The `role="status"` on the count display tells screen readers to announce changes — and our test verifies this role exists. We never query by class name (`.counter`) or test ID (`data-testid`) because those selectors do not reflect how users interact with the component. Each test calls `render()` fresh, and Testing Library automatically cleans up the DOM between tests.
</details>
