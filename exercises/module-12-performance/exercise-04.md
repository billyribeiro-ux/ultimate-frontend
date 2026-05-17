---
module: 12
exercise: 4
title: Accessible Modal with Focus Trap
difficulty: expert
estimated_time: 45
skills_tested:
  - ARIA roles and attributes
  - keyboard navigation
  - focus management
  - use:action for focus trap
---

# Exercise 12.4 — Accessible Modal with Focus Trap

## Brief

Build a fully accessible modal dialog that traps keyboard focus, supports Escape to close, manages focus restoration, and meets WCAG 2.1 AA requirements. Implement the focus trap as a reusable Svelte action.

## Requirements

1. Create `src/lib/actions/focusTrap.ts` as a Svelte action that traps Tab/Shift+Tab within an element
2. Create `src/lib/components/Modal.svelte` that uses the focus trap action
3. The modal must have `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to its title
4. Opening the modal moves focus to the first focusable element inside
5. Closing the modal restores focus to the element that triggered it
6. Pressing Escape closes the modal
7. Clicking the backdrop (outside the modal content) closes it
8. The modal must contain a form with multiple focusable elements to test the trap
9. Tab wraps from the last focusable element to the first (and vice versa with Shift+Tab)

## Constraints

- The focus trap must be a reusable `use:action`, not inline logic
- No third-party dialog or focus-trap libraries
- The modal must work with keyboard-only navigation
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A focus trap action queries all focusable elements inside its node: `node.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')`. It listens for `keydown` and intercepts Tab at the boundaries.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

On Tab at the last element, `e.preventDefault()` and focus the first element. On Shift+Tab at the first element, focus the last. Store the previously focused element (`document.activeElement`) before opening and restore it on close.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// src/lib/actions/focusTrap.ts
export function focusTrap(node: HTMLElement) {
  const focusable = () => node.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    const els = focusable();
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  node.addEventListener('keydown', handleKeydown);
  focusable()[0]?.focus();
  return { destroy() { node.removeEventListener('keydown', handleKeydown); } };
}
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/actions/focusTrap.ts
export function focusTrap(node: HTMLElement): { destroy: () => void } {
  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getFocusable(): HTMLElement[] {
    return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    const elements = getFocusable();
    if (elements.length === 0) return;

    const first = elements[0];
    const last = elements[elements.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  node.addEventListener('keydown', handleKeydown);

  // Focus the first focusable element on mount
  const elements = getFocusable();
  if (elements.length > 0) {
    elements[0].focus();
  }

  return {
    destroy() {
      node.removeEventListener('keydown', handleKeydown);
    }
  };
}
```

```svelte
<!-- src/lib/components/Modal.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { focusTrap } from '$lib/actions/focusTrap';

  let {
    open = false,
    title,
    onclose,
    children
  }: {
    open: boolean;
    title: string;
    onclose: () => void;
    children: Snippet;
  } = $props();

  let previousFocus = $state<HTMLElement | null>(null);

  $effect(() => {
    if (open) {
      previousFocus = document.activeElement as HTMLElement;
    }
  });

  function close() {
    onclose();
    // Restore focus after the modal unmounts
    requestAnimationFrame(() => {
      previousFocus?.focus();
    });
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={handleBackdropClick} onkeydown={handleKeydown}>
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      use:focusTrap
    >
      <header class="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button class="close-btn" onclick={close} aria-label="Close dialog">
          &#10005;
        </button>
      </header>
      <div class="modal-body">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: oklch(0% 0 0 / 0.5);
    display: grid;
    place-items: center;
    z-index: 100;
    padding: var(--space-lg);
  }

  .modal {
    background: var(--color-surface-1);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-inline-size: 28rem;
    inline-size: 100%;
    max-block-size: 90dvh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) var(--space-lg);
    border-block-end: 1px solid var(--color-border);
  }

  #modal-title {
    font-size: var(--text-lg);
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: var(--text-lg);
    cursor: pointer;
    color: var(--color-text-muted);
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
  }

  .close-btn:hover {
    background: var(--color-surface-3);
    color: var(--color-text);
  }

  .modal-body {
    padding: var(--space-lg);
  }
</style>
```

```svelte
<!-- src/routes/modal-demo/+page.svelte -->
<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';

  let showModal = $state(false);
</script>

<div class="page">
  <h1>Modal Demo</h1>
  <button class="open-btn" onclick={() => { showModal = true; }}>
    Open Settings
  </button>
</div>

<Modal open={showModal} title="Settings" onclose={() => { showModal = false; }}>
  <form onsubmit={(e) => e.preventDefault()} class="modal-form">
    <label>
      Display Name
      <input type="text" placeholder="Your name" />
    </label>
    <label>
      Email
      <input type="email" placeholder="you@example.com" />
    </label>
    <label>
      Theme
      <select>
        <option>Light</option>
        <option>Dark</option>
        <option>System</option>
      </select>
    </label>
    <div class="form-actions">
      <button type="button" onclick={() => { showModal = false; }}>Cancel</button>
      <button type="submit">Save</button>
    </div>
  </form>
</Modal>

<style>
  .page { max-inline-size: 32rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  .open-btn { padding: var(--space-sm) var(--space-lg); background: oklch(55% 0.2 250); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; }

  :global(.modal-form) { display: flex; flex-direction: column; gap: var(--space-md); }
  :global(.modal-form label) { display: flex; flex-direction: column; gap: var(--space-2xs); font-size: var(--text-sm); font-weight: 600; }
  :global(.modal-form input), :global(.modal-form select) { padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-base); }
  :global(.form-actions) { display: flex; gap: var(--space-sm); justify-content: flex-end; margin-block-start: var(--space-sm); }
  :global(.form-actions button) { padding: var(--space-xs) var(--space-md); border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; border: none; }
  :global(.form-actions button[type='submit']) { background: oklch(55% 0.2 250); color: white; }
  :global(.form-actions button[type='button']) { background: var(--color-surface-3); color: var(--color-text); }
</style>
```

### Explanation

Accessibility in modals requires four key behaviors: focus trap (Tab stays inside), Escape to close, backdrop click to close, and focus restoration (returning focus to the trigger button). The `focusTrap` action is reusable because it is a pure function of its DOM node — any component can `use:focusTrap` without knowing the implementation. The `aria-modal="true"` attribute tells assistive technologies that content behind the modal is inert. `aria-labelledby` connects the dialog to its visible title. This combination ensures the modal works for keyboard users, screen reader users, and mouse users equally.
</details>
