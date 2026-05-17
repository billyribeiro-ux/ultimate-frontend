---
module: 8
exercise: 3
title: Programmatic Navigation Controller
difficulty: advanced
estimated_time: 30
skills_tested:
  - programmatic navigation
  - goto and pushState
  - reactive page state
---

# Exercise 8.3 — Programmatic Navigation Controller

## Brief

Build a multi-step wizard form that uses programmatic navigation to move between steps stored as URL search params, with a progress bar derived from `page.url`, and guard logic that prevents skipping ahead.

## Requirements

1. Create a wizard at `src/routes/wizard/+page.svelte` that reads the current step from `page.url.searchParams.get('step')` (defaulting to `1`)
2. Render three step panels: "Personal Info", "Preferences", and "Review" — only the active step is visible
3. "Next" and "Back" buttons use `goto()` from `$app/navigation` to update the `?step=` param
4. A progress bar at the top derives its width from the current step using `$derived`
5. Guard logic: if the user manually types `?step=3`, redirect them to `?step=1` unless steps 1 and 2 have been completed (track completion in reactive state)
6. The "Review" step displays a summary of data entered in steps 1 and 2
7. All styles use PE7 tokens; the progress bar uses an OKLCH accent color

## Constraints

- No `window.location` or `history.pushState` — use `goto()` exclusively
- No page reloads — all navigation must be client-side
- The wizard state must survive using the browser back button

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Import `goto` from `$app/navigation` and `page` from `$app/state`. Call `goto('?step=2')` to navigate. The `page.url.searchParams` object updates reactively, so your `$derived` expressions recompute automatically.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Track completed steps in a `$state` Set. Before rendering any step, check if the previous steps are in the Set. If not, call `goto('?step=1')` inside an `$effect`. The progress bar width is `(currentStep / totalSteps) * 100` percent.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  let completedSteps = $state(new Set<number>());
  let currentStep = $derived(Number(page.url.searchParams.get('step') ?? '1'));
  let progress = $derived((currentStep / 3) * 100);

  $effect(() => {
    if (currentStep > 1 && !completedSteps.has(currentStep - 1)) {
      goto('?step=1');
    }
  });

  function next() {
    completedSteps.add(currentStep);
    goto(`?step=${currentStep + 1}`);
  }
</script>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```svelte
<!-- src/routes/wizard/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  interface FormData {
    name: string;
    email: string;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  }

  let formData = $state<FormData>({
    name: '',
    email: '',
    theme: 'system',
    notifications: true
  });

  let completedSteps = $state(new Set<number>());
  let currentStep = $derived(Number(page.url.searchParams.get('step') ?? '1'));
  let progress = $derived(Math.min((currentStep / 3) * 100, 100));

  $effect(() => {
    if (currentStep > 1 && !completedSteps.has(currentStep - 1)) {
      goto('?step=1', { replaceState: true });
    }
  });

  function next() {
    completedSteps.add(currentStep);
    goto(`?step=${currentStep + 1}`);
  }

  function back() {
    goto(`?step=${currentStep - 1}`);
  }
</script>

<div class="wizard">
  <div class="progress-track">
    <div class="progress-fill" style:inline-size="{progress}%"></div>
  </div>

  <p class="step-label">Step {currentStep} of 3</p>

  {#if currentStep === 1}
    <fieldset class="step">
      <legend>Personal Info</legend>
      <label>
        Name
        <input type="text" bind:value={formData.name} />
      </label>
      <label>
        Email
        <input type="email" bind:value={formData.email} />
      </label>
    </fieldset>
  {:else if currentStep === 2}
    <fieldset class="step">
      <legend>Preferences</legend>
      <label>
        Theme
        <select bind:value={formData.theme}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </label>
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={formData.notifications} />
        Enable notifications
      </label>
    </fieldset>
  {:else if currentStep === 3}
    <div class="step review">
      <h2>Review</h2>
      <dl>
        <dt>Name</dt>
        <dd>{formData.name || '(empty)'}</dd>
        <dt>Email</dt>
        <dd>{formData.email || '(empty)'}</dd>
        <dt>Theme</dt>
        <dd>{formData.theme}</dd>
        <dt>Notifications</dt>
        <dd>{formData.notifications ? 'Enabled' : 'Disabled'}</dd>
      </dl>
    </div>
  {/if}

  <div class="actions">
    {#if currentStep > 1}
      <button type="button" class="btn-secondary" onclick={back}>Back</button>
    {/if}
    {#if currentStep < 3}
      <button type="button" class="btn-primary" onclick={next}>Next</button>
    {:else}
      <button type="button" class="btn-primary">Submit</button>
    {/if}
  </div>
</div>

<style>
  .wizard {
    max-inline-size: 32rem;
    margin-inline: auto;
    padding: var(--space-lg);
  }

  .progress-track {
    block-size: 0.5rem;
    background: var(--color-surface-3);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin-block-end: var(--space-sm);
  }

  .progress-fill {
    block-size: 100%;
    background: oklch(65% 0.2 250);
    border-radius: var(--radius-full);
    transition: inline-size 300ms ease;
  }

  .step-label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-lg);
  }

  .step {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  legend {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text);
  }

  label {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    font-size: var(--text-sm);
    color: var(--color-text);
  }

  .checkbox-label {
    flex-direction: row;
    align-items: center;
    gap: var(--space-xs);
  }

  input[type='text'],
  input[type='email'],
  select {
    padding: var(--space-xs) var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--text-base);
    background: var(--color-surface-1);
    color: var(--color-text);
  }

  .review dl {
    display: grid;
    grid-template-columns: 8rem 1fr;
    gap: var(--space-xs);
  }

  .review dt {
    font-weight: 600;
    color: var(--color-text-muted);
  }

  .actions {
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-end;
    margin-block-start: var(--space-lg);
  }

  .btn-primary,
  .btn-secondary {
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    border: none;
  }

  .btn-primary {
    background: oklch(65% 0.2 250);
    color: white;
  }

  .btn-secondary {
    background: var(--color-surface-3);
    color: var(--color-text);
  }
</style>
```

### Explanation

This wizard uses the URL as the source of truth for the current step, making the browser back/forward buttons work for free. The `goto()` function from `$app/navigation` performs client-side navigation without a page reload. The guard `$effect` runs whenever `currentStep` changes (because it reads `currentStep`, which derives from `page.url`). If the user tries to skip ahead, the effect redirects them. This pattern scales to any multi-step flow — checkout, onboarding, survey — and the URL-as-state approach means users can bookmark or share their progress.
</details>
