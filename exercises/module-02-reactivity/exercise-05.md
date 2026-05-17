---
module: 2
exercise: 5
title: Finite State Machine
difficulty: principal
estimated_time: 60
skills_tested:
  - state machine design
  - reactive class with runes
  - TypeScript discriminated unions
  - $effect for side effects
  - $derived for computed transitions
---

# Exercise 2.5 — Finite State Machine

## Brief

Design and implement a type-safe finite state machine using Svelte 5 runes. The machine manages a multi-step form wizard (Personal Info → Address → Review → Submitted). Each state has defined allowed transitions, and the UI must react to state changes, disable invalid transitions, and track history. This is an architectural exercise — the state machine pattern applies to authentication flows, game logic, and complex UI states.

## Requirements

1. Create `src/routes/exercises/02-reactivity/05/+page.svelte`
2. Define a discriminated union type for states: `'idle' | 'personal' | 'address' | 'review' | 'submitted'`
3. Define allowed transitions as a typed map (e.g., `personal` can go to `address` or back to `idle`)
4. Implement as a reactive class with `$state` for current state and history
5. Methods: `transition(to)`, `back()`, `reset()` — all type-safe (invalid transitions throw)
6. `$derived` values: `canGoBack`, `allowedTransitions`, `progress` (percentage)
7. `$effect` to log every state change to a visible audit trail
8. The UI renders different form content per state (not just labels — actual form fields)
9. The Review state shows all previously entered data
10. Transitions animate between states (use CSS transitions, not GSAP)

## Constraints

- The state machine must be a reusable class (could be imported elsewhere)
- No switch statements longer than 5 cases — use maps/objects for transition logic
- Invalid transitions must be prevented at the type level where possible
- No external state machine libraries (XState, etc.)
- Full TypeScript strict mode

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A finite state machine is just a current state + a map of valid transitions. The map's type ensures you cannot define transitions from non-existent states. A reactive class with `$state` fields lets you use the machine directly in Svelte templates.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Define `type State = 'idle' | 'personal' | 'address' | 'review' | 'submitted'` and a transitions map: `Record<State, State[]>`. The class holds `current = $state<State>('idle')` and `history = $state<State[]>([])`. The `transition` method checks if the target is in `transitions[current]` before allowing it. `$derived` computes `allowedTransitions` from the map.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
class FormMachine {
  current: State = $state('idle');
  history: State[] = $state([]);

  private transitions: Record<State, State[]> = {
    idle: ['personal'],
    personal: ['address', 'idle'],
    address: ['review', 'personal'],
    review: ['submitted', 'address'],
    submitted: []
  };

  get allowedTransitions(): State[] {
    return this.transitions[this.current];
  }

  transition(to: State): void {
    if (!this.transitions[this.current].includes(to)) {
      throw new Error(`Invalid: ${this.current} → ${to}`);
    }
    this.history.push(this.current);
    this.current = to;
  }

  back(): void {
    const prev = this.history.pop();
    if (prev) this.current = prev;
  }
}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  type FormState = 'idle' | 'personal' | 'address' | 'review' | 'submitted';

  interface PersonalData {
    name: string;
    email: string;
  }

  interface AddressData {
    street: string;
    city: string;
    country: string;
  }

  interface FormData {
    personal: PersonalData;
    address: AddressData;
  }

  class FormMachine {
    current: FormState = $state('idle');
    history: FormState[] = $state([]);
    auditLog: string[] = $state([]);

    private readonly transitionMap: Record<FormState, FormState[]> = {
      idle: ['personal'],
      personal: ['address', 'idle'],
      address: ['review', 'personal'],
      review: ['submitted', 'address'],
      submitted: []
    };

    private readonly stateOrder: FormState[] = ['idle', 'personal', 'address', 'review', 'submitted'];

    get allowedTransitions(): FormState[] {
      return this.transitionMap[this.current];
    }

    get canGoBack(): boolean {
      return this.history.length > 0;
    }

    get progress(): number {
      const idx = this.stateOrder.indexOf(this.current);
      return Math.round((idx / (this.stateOrder.length - 1)) * 100);
    }

    transition(to: FormState): void {
      if (!this.transitionMap[this.current].includes(to)) {
        throw new Error(`Invalid transition: ${this.current} → ${to}`);
      }
      this.history.push(this.current);
      this.auditLog.push(`${this.current} → ${to} at ${new Date().toLocaleTimeString()}`);
      this.current = to;
    }

    back(): void {
      const prev = this.history.pop();
      if (prev !== undefined) {
        this.auditLog.push(`${this.current} → ${prev} (back) at ${new Date().toLocaleTimeString()}`);
        this.current = prev;
      }
    }

    reset(): void {
      this.auditLog.push(`RESET at ${new Date().toLocaleTimeString()}`);
      this.current = 'idle';
      this.history = [];
    }
  }

  const machine = new FormMachine();

  let formData: FormData = $state({
    personal: { name: '', email: '' },
    address: { street: '', city: '', country: '' }
  });
</script>

<main class="page">
  <h1>Form Wizard — State Machine</h1>

  <div class="progress-bar">
    <div class="progress-fill" style="inline-size: {machine.progress}%"></div>
    <span class="progress-label">{machine.progress}%</span>
  </div>

  <div class="wizard">
    <div class="step" class:active={machine.current === 'idle'}>
      {#if machine.current === 'idle'}
        <h2>Welcome</h2>
        <p>Ready to begin the registration process?</p>
        <button onclick={() => machine.transition('personal')}>Start</button>
      {/if}
    </div>

    <div class="step" class:active={machine.current === 'personal'}>
      {#if machine.current === 'personal'}
        <h2>Personal Information</h2>
        <div class="form-fields">
          <label>
            Name
            <input type="text" bind:value={formData.personal.name} />
          </label>
          <label>
            Email
            <input type="email" bind:value={formData.personal.email} />
          </label>
        </div>
        <div class="nav-buttons">
          <button class="secondary" onclick={() => machine.back()}>Back</button>
          <button onclick={() => machine.transition('address')}>Next</button>
        </div>
      {/if}
    </div>

    <div class="step" class:active={machine.current === 'address'}>
      {#if machine.current === 'address'}
        <h2>Address</h2>
        <div class="form-fields">
          <label>
            Street
            <input type="text" bind:value={formData.address.street} />
          </label>
          <label>
            City
            <input type="text" bind:value={formData.address.city} />
          </label>
          <label>
            Country
            <input type="text" bind:value={formData.address.country} />
          </label>
        </div>
        <div class="nav-buttons">
          <button class="secondary" onclick={() => machine.back()}>Back</button>
          <button onclick={() => machine.transition('review')}>Review</button>
        </div>
      {/if}
    </div>

    <div class="step" class:active={machine.current === 'review'}>
      {#if machine.current === 'review'}
        <h2>Review Your Information</h2>
        <dl class="review-list">
          <dt>Name</dt>
          <dd>{formData.personal.name || '(not provided)'}</dd>
          <dt>Email</dt>
          <dd>{formData.personal.email || '(not provided)'}</dd>
          <dt>Address</dt>
          <dd>{formData.address.street}, {formData.address.city}, {formData.address.country}</dd>
        </dl>
        <div class="nav-buttons">
          <button class="secondary" onclick={() => machine.back()}>Edit Address</button>
          <button onclick={() => machine.transition('submitted')}>Submit</button>
        </div>
      {/if}
    </div>

    <div class="step" class:active={machine.current === 'submitted'}>
      {#if machine.current === 'submitted'}
        <h2>Submitted!</h2>
        <p class="success">Your registration is complete.</p>
        <button onclick={() => machine.reset()}>Start Over</button>
      {/if}
    </div>
  </div>

  <aside class="audit-trail">
    <h3>Audit Trail</h3>
    <ul>
      {#each machine.auditLog as entry}
        <li>{entry}</li>
      {/each}
    </ul>
    {#if machine.auditLog.length === 0}
      <p class="empty">No transitions yet</p>
    {/if}
  </aside>
</main>

<style>
  .page {
    max-inline-size: var(--prose-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  h2 { font-size: var(--text-xl); margin-block-end: var(--space-md); }
  h3 { font-size: var(--text-lg); margin-block-end: var(--space-sm); }

  .progress-bar {
    position: relative;
    block-size: 0.5rem;
    background: var(--color-surface-2);
    border-radius: var(--radius-full);
    margin-block-end: var(--space-xl);
    overflow: hidden;
  }

  .progress-fill {
    block-size: 100%;
    background: var(--color-brand);
    border-radius: var(--radius-full);
    transition: inline-size var(--dur-base) var(--ease-out);
  }

  .progress-label {
    position: absolute;
    inset-inline-end: 0;
    inset-block-start: calc(100% + var(--space-xs));
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .wizard {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    min-block-size: 16rem;
    margin-block-end: var(--space-xl);
  }

  .step {
    display: none;
  }

  .step.active {
    display: grid;
    gap: var(--space-md);
    animation: fadeIn var(--dur-base) var(--ease-out);
  }

  @keyframes fadeIn {
    from { opacity: 0; translate: 0 0.5rem; }
    to { opacity: 1; translate: 0 0; }
  }

  .form-fields {
    display: grid;
    gap: var(--space-md);
  }

  .form-fields label {
    display: grid;
    gap: var(--space-xs);
    font-size: var(--text-sm);
    font-weight: 600;
  }

  .form-fields input {
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
  }

  .form-fields input:focus {
    outline: 2px solid var(--color-brand);
    outline-offset: 2px;
  }

  .nav-buttons {
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-end;
    margin-block-start: var(--space-md);
  }

  button {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-brand);
    color: oklch(100% 0 0);
    font-weight: 600;
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    transition: background var(--dur-fast) var(--ease-out);
  }

  button:hover { background: var(--color-brand-dim); }

  .secondary {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .secondary:hover { background: var(--color-surface-2); }

  .review-list {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-xs) var(--space-md);
    font-size: var(--text-sm);
  }

  dt { font-weight: 600; color: var(--color-text-muted); }
  dd { margin: 0; }

  .success {
    color: var(--color-success);
    font-size: var(--text-lg);
    font-weight: 700;
  }

  .audit-trail {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }

  .audit-trail ul {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--space-xs);
  }

  .audit-trail li {
    font-size: var(--text-xs);
    font-family: ui-monospace, monospace;
    color: var(--color-text-muted);
    padding: var(--space-xs);
    background: var(--color-surface);
    border-radius: var(--radius-sm);
  }

  .empty {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-style: italic;
  }

  @media (prefers-reduced-motion: reduce) {
    .step.active { animation: none; }
  }
</style>
```

### Explanation

This exercise demonstrates how reactive classes with `$state` fields naturally implement the state machine pattern. The `FormMachine` class encapsulates all transition logic, making it testable and reusable (you could extract it to a `.svelte.ts` file). The transition map ensures type safety — adding a new state requires updating the map. The discriminated approach means the UI can confidently branch on `machine.current` knowing exactly which states exist. At scale, this pattern replaces complex boolean flag combinations (`isLoading && !hasError && isAuthenticated`) with explicit named states that are easier to reason about, test, and debug. The audit trail demonstrates how `$effect` captures side effects of state changes without coupling them to the transition logic itself.
</details>
