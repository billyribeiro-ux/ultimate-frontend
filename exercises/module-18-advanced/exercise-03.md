---
module: 18
exercise: 3
title: State Machine
difficulty: advanced
estimated_time: 30
skills_tested:
  - finite state machine design
  - state transitions with guards
  - event-driven UI updates
  - exhaustive state handling
  - TypeScript discriminated unions
---

# Exercise 18.3 — State Machine

## Brief

Build a multi-step form wizard controlled by a finite state machine. The machine defines valid states (idle, filling, validating, submitting, success, error), transitions between them, and guards that prevent invalid transitions. The UI renders different content for each state, and all transitions go through the machine — no ad-hoc state changes. This exercise teaches how state machines eliminate impossible states in complex UIs.

## Requirements

1. Create `src/lib/exercises/18/machine.svelte.ts` with a typed state machine
2. Define states: `idle`, `filling`, `validating`, `submitting`, `success`, `error`
3. Define events: `START`, `VALIDATE`, `SUBMIT`, `SUCCESS`, `ERROR`, `RETRY`, `RESET`
4. Define valid transitions (e.g., `idle + START -> filling`, `filling + VALIDATE -> validating`)
5. Implement a `send(event)` function that only allows valid transitions
6. Add a transition guard: `SUBMIT` from `validating` only succeeds if the form data passes validation
7. Create `src/routes/exercises/18-advanced/03/+page.svelte` that renders the form wizard
8. Each state renders a different UI panel (data-driven, not separate templates per state)
9. Show a visual state diagram on the page that highlights the current state
10. Log all state transitions with timestamps
11. Style with PE7 tokens

## Constraints

- No state management libraries — build the machine from scratch using `$state`
- TypeScript strict mode — use discriminated unions for states and events
- Every state must be handled in the template (exhaustive matching)
- The machine must reject invalid transitions (e.g., cannot go from `idle` to `success`)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A state machine is an object with a `current` state and a `transitions` map. The map defines which events are valid in each state: `transitions = { idle: { START: 'filling' }, filling: { VALIDATE: 'validating' }, ... }`. The `send` function looks up the current state in the map, checks if the event exists, and transitions if valid.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Use a `.svelte.ts` file to create the machine with `$state` for the current state and a `$state` array for the transition log. The `send` function checks `transitions[current][event]` — if the entry exists, update current state. For guards, the transition entry can be a function that returns the next state or `null`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// machine.svelte.ts
type State = 'idle' | 'filling' | 'validating' | 'submitting' | 'success' | 'error';
type Event = 'START' | 'VALIDATE' | 'SUBMIT' | 'SUCCESS' | 'ERROR' | 'RETRY' | 'RESET';

const transitions: Record<State, Partial<Record<Event, State>>> = {
  idle: { START: 'filling' },
  filling: { VALIDATE: 'validating' },
  validating: { SUBMIT: 'submitting', ERROR: 'error' },
  submitting: { SUCCESS: 'success', ERROR: 'error' },
  success: { RESET: 'idle' },
  error: { RETRY: 'filling', RESET: 'idle' }
};

export function createFormMachine() {
  let current: State = $state('idle');
  // ...
}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/18/machine.svelte.ts`**

```typescript
type State = 'idle' | 'filling' | 'validating' | 'submitting' | 'success' | 'error';
type Event = 'START' | 'VALIDATE' | 'SUBMIT' | 'SUCCESS' | 'ERROR' | 'RETRY' | 'RESET';

interface TransitionLog {
  from: State;
  event: Event;
  to: State;
  timestamp: string;
}

const transitions: Record<State, Partial<Record<Event, State>>> = {
  idle: { START: 'filling' },
  filling: { VALIDATE: 'validating' },
  validating: { SUBMIT: 'submitting', ERROR: 'filling' },
  submitting: { SUCCESS: 'success', ERROR: 'error' },
  success: { RESET: 'idle' },
  error: { RETRY: 'filling', RESET: 'idle' }
};

export interface FormData {
  name: string;
  email: string;
}

export interface FormMachine {
  readonly current: State;
  readonly log: TransitionLog[];
  readonly formData: FormData;
  send: (event: Event) => boolean;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  validate: () => string[];
}

export function createFormMachine(): FormMachine {
  let current: State = $state('idle');
  let log: TransitionLog[] = $state([]);
  let formData: FormData = $state({ name: '', email: '' });

  function validate(): string[] {
    const errors: string[] = [];
    if (formData.name.trim().length < 2) errors.push('Name must be at least 2 characters');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push('Invalid email format');
    return errors;
  }

  function send(event: Event): boolean {
    const nextState = transitions[current]?.[event];

    if (!nextState) {
      console.warn(`[Machine] Invalid transition: ${current} + ${event}`);
      return false;
    }

    // Guard: SUBMIT only works if validation passes
    if (event === 'SUBMIT') {
      const errors = validate();
      if (errors.length > 0) {
        return false;
      }
    }

    const entry: TransitionLog = {
      from: current,
      event,
      to: nextState,
      timestamp: new Date().toLocaleTimeString()
    };

    log = [...log, entry];
    current = nextState;
    return true;
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]): void {
    formData[key] = value;
  }

  return {
    get current() { return current; },
    get log() { return log; },
    get formData() { return formData; },
    send,
    updateField,
    validate
  };
}

export const ALL_STATES: State[] = ['idle', 'filling', 'validating', 'submitting', 'success', 'error'];
```

**`src/routes/exercises/18-advanced/03/+page.svelte`**

```svelte
<script lang="ts">
  import { createFormMachine, ALL_STATES } from '$lib/exercises/18/machine.svelte';

  const machine = createFormMachine();

  let validationErrors: string[] = $state([]);

  async function handleSubmit(): Promise<void> {
    const errors = machine.validate();
    if (errors.length > 0) {
      validationErrors = errors;
      machine.send('ERROR');
      return;
    }
    validationErrors = [];
    machine.send('SUBMIT');

    // Simulate async submission
    await new Promise((r) => setTimeout(r, 1500));
    machine.send('SUCCESS');
  }
</script>

<main class="page">
  <h1>State Machine Form Wizard</h1>

  <div class="state-diagram">
    {#each ALL_STATES as s}
      <span class="state-node" class:active={machine.current === s}>{s}</span>
    {/each}
  </div>

  <div class="panel">
    {#if machine.current === 'idle'}
      <h2>Ready to Start</h2>
      <p>Click below to begin the form wizard.</p>
      <button onclick={() => machine.send('START')} class="btn">Start</button>

    {:else if machine.current === 'filling'}
      <h2>Fill Your Information</h2>
      <div class="field">
        <label for="name">Name</label>
        <input id="name" type="text" value={machine.formData.name}
          oninput={(e) => machine.updateField('name', (e.target as HTMLInputElement).value)} />
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" type="email" value={machine.formData.email}
          oninput={(e) => machine.updateField('email', (e.target as HTMLInputElement).value)} />
      </div>
      {#if validationErrors.length > 0}
        <div class="errors">
          {#each validationErrors as err}
            <p>{err}</p>
          {/each}
        </div>
      {/if}
      <button onclick={() => { machine.send('VALIDATE'); handleSubmit(); }} class="btn">Submit</button>

    {:else if machine.current === 'validating'}
      <h2>Validating...</h2>
      <p>Checking your information.</p>

    {:else if machine.current === 'submitting'}
      <h2>Submitting...</h2>
      <div class="spinner"></div>

    {:else if machine.current === 'success'}
      <h2>Success!</h2>
      <p>Your form has been submitted successfully.</p>
      <button onclick={() => machine.send('RESET')} class="btn">Start Over</button>

    {:else if machine.current === 'error'}
      <h2>Something Went Wrong</h2>
      <p>The submission failed. Please try again.</p>
      <div class="error-actions">
        <button onclick={() => machine.send('RETRY')} class="btn">Retry</button>
        <button onclick={() => machine.send('RESET')} class="btn secondary">Reset</button>
      </div>
    {/if}
  </div>

  <section class="log-section">
    <h2>Transition Log</h2>
    <div class="log">
      {#each machine.log as entry}
        <div class="log-entry">
          <time>{entry.timestamp}</time>
          <span class="transition">{entry.from} &#8594; {entry.to}</span>
          <span class="event">{entry.event}</span>
        </div>
      {/each}
    </div>
  </section>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-xl); }

  .state-diagram {
    display: flex; gap: var(--space-sm); flex-wrap: wrap;
    margin-block-end: var(--space-xl);
  }

  .state-node {
    font-size: var(--text-xs); font-weight: 600;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    text-transform: capitalize;
  }

  .state-node.active {
    background: var(--color-brand);
    color: var(--color-surface);
    border-color: var(--color-brand);
  }

  .panel {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    margin-block-end: var(--space-xl);
  }

  .panel h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }
  .panel p { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-md); }

  .field { display: grid; gap: var(--space-xs); margin-block-end: var(--space-md); }
  label { font-size: var(--text-sm); font-weight: 600; }
  input { padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-base); background: var(--color-surface); color: var(--color-text); }

  .errors { margin-block-end: var(--space-md); }
  .errors p { font-size: var(--text-sm); color: var(--color-error); margin-block-end: var(--space-xs); }

  .btn { padding: var(--space-sm) var(--space-lg); background: var(--color-brand); color: var(--color-surface); border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
  .btn.secondary { background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); }

  .error-actions { display: flex; gap: var(--space-sm); }

  .spinner { inline-size: 2rem; block-size: 2rem; border: 3px solid var(--color-border); border-block-start-color: var(--color-brand); border-radius: var(--radius-full); animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(1turn); } }

  .log-section h2 { font-size: var(--text-base); margin-block-end: var(--space-sm); }
  .log { display: grid; gap: var(--space-xs); }
  .log-entry { display: flex; gap: var(--space-md); font-size: var(--text-xs); font-family: monospace; padding: var(--space-xs); background: var(--color-surface-2); border-radius: var(--radius-sm); }
  .log-entry time { color: var(--color-text-muted); }
  .transition { color: var(--color-text); }
  .event { color: var(--color-brand); font-weight: 600; }
</style>
```

### Explanation

State machines eliminate "impossible states" — a concept from David Harel's statecharts. In a typical form, you might have separate booleans for `isLoading`, `isError`, `isSuccess`, `isValidating` — but what does it mean when `isLoading` AND `isError` are both true? That state is nonsensical but possible. A state machine makes it impossible: the form is in exactly one state at all times, and only predefined transitions can change it. The `transitions` map is the heart of the machine — it defines every valid state+event combination. The `send` function acts as a gatekeeper: if the current state does not have an entry for the event, the transition is silently rejected. Guards (like validating before submit) add conditional logic to transitions. The `.svelte.ts` file pattern creates a reactive class that works with Svelte 5's runes, and the getter properties ensure the component reactively updates when state changes. In production, you would use a library like XState for complex machines, but understanding the raw pattern is essential.
</details>
