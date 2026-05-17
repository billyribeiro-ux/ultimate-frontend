---
module: 3
exercise: 2
title: Bindable Toggle Switch
difficulty: intermediate
estimated_time: 20
skills_tested:
  - $bindable rune
  - two-way data binding
  - accessible toggle implementation
  - ARIA attributes
---

# Exercise 3.2 — Bindable Toggle Switch

## Brief

Build a custom toggle switch component with `$bindable` that allows the parent to two-way bind to its checked state. The toggle must be fully accessible (keyboard operable, proper ARIA role) and visually styled as a sliding switch using PE7 tokens.

## Requirements

1. Create `src/lib/exercises/03/Toggle.svelte`
2. Create `src/routes/exercises/03-components/02/+page.svelte`
3. The Toggle accepts props: `checked: boolean` (bindable), `label: string`, `disabled?: boolean`
4. Use `$bindable()` for the checked prop
5. The parent page uses `bind:checked` to sync state between two toggles
6. Toggle must have `role="switch"`, `aria-checked`, keyboard support (Space/Enter)
7. Visual: a pill-shaped track with a sliding circle indicator
8. Disabled state must be visually distinct and non-interactive
9. Respect `prefers-reduced-motion` for the slide animation

## Constraints

- No `<input type="checkbox">` — build the switch from scratch with a `<button>`
- No `on:click` — use `onclick`
- The parent must prove two-way binding works (changing one updates the other)
- CSS only for animations (no JS animation)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`$bindable()` makes a prop two-way bindable. The parent uses `bind:checked={someState}`. Inside the component, mutating the prop automatically propagates back to the parent.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Use a `<button>` with `role="switch"` and `aria-checked={checked}`. Toggle the value with `onclick={() => checked = !checked}`. The sliding animation uses CSS `translate` on a pseudo-element or a child `<span>`, controlled by a class that changes based on the `checked` state.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
    disabled?: boolean;
  }
  let { checked = $bindable(), label, disabled = false }: Props = $props();
</script>

<button
  role="switch"
  aria-checked={checked}
  aria-label={label}
  {disabled}
  onclick={() => { if (!disabled) checked = !checked; }}
  class="toggle"
  class:checked
>
  <span class="thumb"></span>
</button>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/03/Toggle.svelte`**

```svelte
<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
    disabled?: boolean;
  }

  let { checked = $bindable(), label, disabled = false }: Props = $props();

  function toggle(): void {
    if (!disabled) {
      checked = !checked;
    }
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  }
</script>

<div class="toggle-wrapper" class:disabled>
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    {disabled}
    onclick={toggle}
    onkeydown={handleKeydown}
    class="track"
    class:checked
  >
    <span class="thumb"></span>
  </button>
  <span class="label">{label}</span>
</div>

<style>
  .toggle-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .toggle-wrapper.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .track {
    position: relative;
    inline-size: 3rem;
    block-size: 1.5rem;
    border-radius: var(--radius-full);
    background: var(--color-border);
    padding: 0.2rem;
    transition: background var(--dur-fast) var(--ease-out);
    cursor: pointer;
  }

  .track.checked {
    background: var(--color-brand);
  }

  .track:focus-visible {
    outline: 2px solid var(--color-brand);
    outline-offset: 2px;
  }

  .thumb {
    display: block;
    inline-size: 1.1rem;
    block-size: 1.1rem;
    border-radius: var(--radius-full);
    background: oklch(100% 0 0);
    box-shadow: var(--shadow-sm);
    transition: translate var(--dur-fast) var(--ease-out);
  }

  .track.checked .thumb {
    translate: 1.5rem 0;
  }

  .label {
    font-size: var(--text-sm);
    color: var(--color-text);
    user-select: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .thumb {
      transition: none;
    }
    .track {
      transition: none;
    }
  }
</style>
```

**`src/routes/exercises/03-components/02/+page.svelte`**

```svelte
<script lang="ts">
  import Toggle from '$lib/exercises/03/Toggle.svelte';

  let notifications: boolean = $state(true);
  let darkMode: boolean = $state(false);
</script>

<main class="page">
  <h1>Bindable Toggle Switch</h1>

  <section class="demo">
    <Toggle bind:checked={notifications} label="Enable notifications" />
    <p>Notifications are: <strong>{notifications ? 'ON' : 'OFF'}</strong></p>

    <Toggle bind:checked={darkMode} label="Dark mode" />
    <p>Dark mode is: <strong>{darkMode ? 'ON' : 'OFF'}</strong></p>

    <Toggle checked={true} label="Disabled toggle (always on)" disabled={true} />
  </section>

  <section class="proof">
    <h2>Two-way binding proof</h2>
    <button onclick={() => notifications = !notifications}>
      Toggle notifications from parent: {notifications}
    </button>
    <p>Clicking this button changes the Toggle component above — proving bind works in both directions.</p>
  </section>
</main>

<style>
  .page {
    max-inline-size: var(--prose-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-sm); }

  .demo {
    display: grid;
    gap: var(--space-md);
    margin-block-end: var(--space-xl);
  }

  .proof {
    background: var(--color-surface-2);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
    display: grid;
    gap: var(--space-md);
  }

  .proof button {
    padding: var(--space-sm) var(--space-md);
    background: var(--color-brand);
    color: oklch(100% 0 0);
    font-weight: 600;
    border-radius: var(--radius-md);
  }
</style>
```

### Explanation

`$bindable()` is Svelte 5's mechanism for two-way prop binding. The child component declares a prop as bindable, and the parent can optionally use `bind:propName` to create a two-way channel. Mutating `checked` inside the Toggle propagates the change back to the parent's `notifications` state. The accessibility implementation uses `role="switch"` (the correct ARIA role for toggles), `aria-checked` for screen reader state, and keyboard handling for Space/Enter. The `prefers-reduced-motion` media query disables the slide animation for users who have requested reduced motion at the OS level.
</details>
