---
module: 20
lesson: 20.4
title: Component testing with @testing-library/svelte
duration: 60 minutes
prerequisites:
  - "20.3 — Unit testing .svelte.ts stores"
  - "3.2 — $props()"
  - "5.1 — Event handlers"
learning_objectives:
  - Render Svelte 5 components in tests using @testing-library/svelte's render function
  - Query rendered components by role, text, and label using accessible queries
  - Simulate user interactions (click, type, select) with @testing-library/user-event
  - Assert on component output using jest-dom matchers (toBeVisible, toHaveTextContent, toBeDisabled)
  - Test components that use $props(), $state(), and event handlers
status: ready
---

# Lesson 20.4 — Component testing with @testing-library/svelte

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Rendering components outside the browser

### 1.1 The problem: you cannot click a button in a unit test

Your Counter component has an increment button. You want to verify that clicking it updates the displayed count. But there is no browser in a unit test — no DOM, no click events, no rendered pixels. You need a way to render the component into a virtual DOM, simulate user interactions, and assert on the result.

### 1.2 How @testing-library/svelte solves it

`@testing-library/svelte` provides a `render` function that mounts a Svelte component into jsdom (the virtual DOM configured in Vitest). It returns query functions that let you find elements the same way a user would — by their role, text, or label:

```typescript
import { render, screen } from '@testing-library/svelte';
import Counter from '$lib/components/Counter.svelte';

it('renders the initial count', () => {
  render(Counter, { props: { initial: 5 } });
  expect(screen.getByText('5')).toBeInTheDocument();
});
```

The `screen` object provides query methods:

- `getByRole('button', { name: 'Increment' })` — finds an element by its ARIA role and accessible name
- `getByText('Submit')` — finds an element containing the exact text
- `getByLabelText('Email')` — finds an input by its associated label
- `getByPlaceholderText('Search...')` — finds by placeholder
- `queryByText('Error')` — returns null instead of throwing if not found
- `findByText('Loaded')` — waits for the element to appear (async)

These queries prioritize accessibility. If your component is not findable by role or label, it likely has accessibility issues.

### 1.3 Simulating user interactions

`@testing-library/svelte` re-exports `fireEvent` for simulating DOM events, but the preferred approach is `@testing-library/user-event`, which simulates events more realistically (triggering focus, input, change in sequence):

```typescript
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SearchInput from '$lib/components/SearchInput.svelte';

it('filters results as the user types', async () => {
  const user = userEvent.setup();
  render(SearchInput);

  const input = screen.getByRole('searchbox');
  await user.type(input, 'svelte');

  expect(input).toHaveValue('svelte');
});
```

The `user.type()` method types one character at a time, firing `keydown`, `keypress`, `input`, and `keyup` events for each character — just like a real user. This is more thorough than `fireEvent.input()`, which fires a single event.

### 1.4 Testing event callbacks

When a component emits events via callback props, pass a `vi.fn()` spy as the prop and assert it was called:

```typescript
it('calls onsubmit with the form data', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(LoginForm, { props: { onsubmit: handleSubmit } });

  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Password'), 'secret123');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'ada@example.com',
    password: 'secret123'
  });
});
```

### 1.5 Asserting with jest-dom matchers

The `@testing-library/jest-dom` package adds matchers that express UI assertions naturally:

```typescript
expect(button).toBeDisabled();
expect(element).toBeVisible();
expect(element).toHaveTextContent('Hello');
expect(input).toHaveValue('test');
expect(element).toHaveAttribute('aria-expanded', 'true');
expect(element).toHaveClass('active');
expect(element).not.toBeInTheDocument();
```

These read like specifications and produce clear failure messages.

### Deep Dive — Testing components with context, snippets, and complex props

Svelte 5 components often depend on context provided by a parent component. Testing a `Tab` component that reads context from a `Tabs` parent requires wrapping it:

```typescript
import { render } from '@testing-library/svelte';
import TestWrapper from './TestWrapper.svelte';

// TestWrapper.svelte provides the context:
// <Tabs defaultValue="a"><slot /></Tabs>

render(TestWrapper, {
  props: { component: Tab, componentProps: { id: 'a', children: 'Tab A' } }
});
```

Alternatively, use a test-only wrapper component that sets up the required context.

For components that accept snippets via `{#snippet}` and `{@render}`, you cannot pass snippets as props in a test. Instead, create a small test wrapper component:

```svelte
<!-- tests/wrappers/CardWrapper.svelte -->
<script lang="ts">
  import Card from '$lib/components/Card.svelte';
</script>

<Card>
  {#snippet header()}
    <h2>Test Header</h2>
  {/snippet}
  {#snippet content()}
    <p>Test content goes here</p>
  {/snippet}
</Card>
```

Then render the wrapper in your test:

```typescript
render(CardWrapper);
expect(screen.getByText('Test Header')).toBeInTheDocument();
expect(screen.getByText('Test content goes here')).toBeInTheDocument();
```

For components with complex TypeScript props (discriminated unions, generics), ensure your test data satisfies the type constraints. TypeScript catches prop type errors at compile time, so your tests document the valid prop combinations.

Testing two-way binding (`$bindable`) is less common in component tests because tests typically verify the rendered output, not the binding mechanism. If you need to test that a parent's state updates when a child's bound value changes, create a test wrapper that reads the bound value and renders it.

## 2. Style it — PE7 applied to the component test visualizer mini-build

The mini-build shows a component preview alongside its test code and test results. The component renders in a `var(--color-surface-2)` container. Test code uses monospace font at `var(--text-xs)`. Pass/fail indicators use `var(--color-success)` and `var(--color-error)`. The layout uses a two-column grid at `min-width: 768px`.

## 3. Interact — testing a live component

The student interacts with a rendered component (clicks buttons, types text) and sees the corresponding test assertions update to match the new state.

## 4. Mini-build — Component test demonstrator

**File path:** `src/routes/modules/20-testing/04-component-testing/+page.svelte`

A split view: the left shows a live Counter component the student can interact with, the right shows the test code that would verify the current state. As the student clicks increment/decrement, the test assertions update. A "Run Test" button simulates executing the test and shows pass/fail.

**DevTools moment:** Open the Accessibility tree in DevTools (Elements panel > Accessibility tab). Verify that the button has an accessible name matching what `getByRole('button', { name: '...' })` would find. This connects the testing library's query strategy to the real accessibility tree.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why should you query by role and label rather than CSS selectors in component tests?</summary>

Querying by role and label tests the component the way a user perceives it — through visible text, buttons, inputs, and labels. CSS selectors are implementation details that change during refactoring. Role-based queries also enforce accessibility: if a button cannot be found by its role, it may be missing ARIA attributes that screen readers need.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between getByText and queryByText?</summary>

`getByText` throws an error if the element is not found — use it when the element must exist. `queryByText` returns null if not found — use it to assert that something is NOT in the document: `expect(screen.queryByText('Error')).not.toBeInTheDocument()`.
</details>

<details>
<summary><strong>Q3.</strong> Why is user-event preferred over fireEvent for simulating user interactions?</summary>

`user-event` simulates interactions more realistically by firing the complete sequence of events a real browser would produce. `user.type()` fires `keydown`, `keypress`, `input`, `keyup`, and `change` for each character. `fireEvent.input()` fires only a single event, missing the intermediate events that components may rely on.
</details>

<details>
<summary><strong>Q4.</strong> How do you test a component that depends on Svelte context from a parent?</summary>

Create a test wrapper component that provides the required context. The wrapper sets up the parent component (which calls `setContext`) and renders the child being tested inside it. Render the wrapper in the test, then query for elements from the child component.
</details>

<details>
<summary><strong>Q5.</strong> What does the toBeVisible() matcher check that toBeInTheDocument() does not?</summary>

`toBeInTheDocument()` only checks that the element exists in the DOM. `toBeVisible()` also checks that the element is not hidden by CSS (`display: none`, `visibility: hidden`, `opacity: 0`) or by the `hidden` attribute. An element can be in the document but not visible to the user.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Querying by test IDs for everything.** `getByTestId` should be a last resort. Prefer `getByRole`, `getByLabelText`, and `getByText` — they test accessibility and are more resilient to markup changes.

2. **Not awaiting user interactions.** `user.click()` and `user.type()` are async. Forgetting `await` means assertions run before the interaction completes, producing false passes or failures.

3. **Testing CSS class names instead of visual state.** Asserting `toHaveClass('active')` tests implementation. Asserting `toHaveAttribute('aria-selected', 'true')` tests accessible state that users and screen readers rely on.

4. **Not cleaning up between tests.** `@testing-library/svelte` automatically unmounts components between tests when using `cleanup` (which is auto-configured with globals). But if you manually mount components or modify the DOM, clean up in `afterEach`.

## 7. What's next — one sentence

Next, you will test async components that use `{#await}`, `load()` functions, and streaming data patterns.
