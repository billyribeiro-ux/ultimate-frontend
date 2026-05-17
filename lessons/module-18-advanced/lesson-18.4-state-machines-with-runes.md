---
module: 18
lesson: 18.4
title: State machines with runes
duration: 65 minutes
prerequisites:
  - "2.2 — $state with primitive types"
  - "2.7 — $derived() — pure functions"
  - "18.3 — Headless components"
  - "TypeScript discriminated unions"
learning_objectives:
  - Explain why explicit state machines prevent impossible states in complex UI
  - Implement a state machine using $state and $derived with typed transitions
  - Model multi-step forms as state machines with per-state data using discriminated unions
  - Use the createMachine helper to manage async workflows and drag-and-drop flows
  - Apply untrack() surgically to prevent cascade effects during state transitions
status: ready
---

# Lesson 18.4 — State machines with runes

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Modeling complex UI flows as explicit state machines

### 1.1 The problem: boolean soup and impossible states

You are building a multi-step checkout form. It has states: idle, loading user data, showing step 1, validating step 1, showing step 2, submitting payment, success, error. The naive approach uses a collection of booleans:

```typescript
let isLoading: boolean = $state(false);
let isStep1: boolean = $state(true);
let isStep2: boolean = $state(false);
let isSubmitting: boolean = $state(false);
let isSuccess: boolean = $state(false);
let isError: boolean = $state(false);
let errorMessage: string = $state('');
```

This creates **impossible states** — combinations that should never exist but the type system cannot prevent. What does `isLoading = true, isSuccess = true` mean? What does `isStep1 = true, isStep2 = true` mean? Nothing — they are bugs hiding in valid TypeScript. With N booleans you have 2^N possible combinations, but only a handful are actually valid. The rest are landmines.

The real-world consequence: users see a loading spinner and a success message simultaneously. Or a form that is somehow on step 1 and step 2 at the same time. These bugs are intermittent, hard to reproduce, and expensive to fix because the root cause (the data model allows invalid states) is architectural.

### 1.2 The solution: explicit state machines

A **state machine** (formally: a finite state automaton) has a fixed set of states and a fixed set of transitions between them. At any moment, the machine is in exactly one state. It can only move to another state via a defined transition. Impossible states literally cannot happen because they do not exist in the machine definition.

```typescript
type CheckoutState = 'idle' | 'loading' | 'step1' | 'validating' | 'step2' | 'submitting' | 'success' | 'error';
type CheckoutEvent = 'LOAD' | 'LOADED' | 'NEXT' | 'VALIDATE_OK' | 'SUBMIT' | 'SUCCESS' | 'ERROR' | 'RETRY';
```

The machine defines which events are valid in which states:

```typescript
const transitions: Record<CheckoutState, Partial<Record<CheckoutEvent, CheckoutState>>> = {
  idle: { LOAD: 'loading' },
  loading: { LOADED: 'step1', ERROR: 'error' },
  step1: { NEXT: 'validating' },
  validating: { VALIDATE_OK: 'step2', ERROR: 'step1' },
  step2: { SUBMIT: 'submitting' },
  submitting: { SUCCESS: 'success', ERROR: 'error' },
  success: {},
  error: { RETRY: 'idle' }
};
```

Now `isLoading && isSuccess` is impossible — the machine is either in `'loading'` or `'success'`, never both. The transition map is the single source of truth for all valid state changes.

### 1.3 Implementing with $state and $derived

Svelte 5 runes make state machines elegant. The current state is a `$state` variable. Derived values compute what is visible or enabled based on the current state:

```typescript
let current: CheckoutState = $state('idle');

let showSpinner: boolean = $derived(current === 'loading' || current === 'submitting');
let showForm: boolean = $derived(current === 'step1' || current === 'step2');
let canSubmit: boolean = $derived(current === 'step2');
```

These derived values replace the boolean soup. They are always consistent because they derive from a single atomic state. There is no possible way for `showSpinner` and `showForm` to both be true unless you explicitly make them so in the derived logic.

### 1.4 Discriminated unions: per-state data

Real machines carry data that varies by state. A `loading` state has a progress percentage. An `error` state has an error message. A `step1` state has the form data collected so far. TypeScript's **discriminated unions** model this perfectly:

```typescript
type MachineState =
  | { state: 'idle' }
  | { state: 'loading'; progress: number }
  | { state: 'step1'; formData: Partial<CheckoutForm> }
  | { state: 'step2'; formData: CheckoutForm }
  | { state: 'submitting'; formData: CheckoutForm }
  | { state: 'success'; orderId: string }
  | { state: 'error'; message: string; retryCount: number };
```

Each variant has a `state` discriminant field plus state-specific data. TypeScript narrows the type when you check `state`:

```typescript
if (machine.state === 'error') {
  // TypeScript knows: machine.message exists, machine.orderId does not
  console.log(machine.message);
}
```

This eliminates an entire class of runtime errors: accessing properties that only exist in certain states.

### 1.5 The createMachine helper

The `StateMachine.svelte.ts` module (in `$lib/components/advanced/`) provides a reusable `createMachine` function. It takes a machine configuration (initial state, state definitions with transitions) and returns a reactive instance:

```typescript
const checkout = createMachine<CheckoutState, CheckoutEvent>({
  initial: 'idle',
  states: {
    idle: { on: { LOAD: 'loading' } },
    loading: { on: { LOADED: 'step1', ERROR: 'error' } },
    step1: { on: { NEXT: 'validating' } },
    validating: { on: { VALIDATE_OK: 'step2', ERROR: 'step1' } },
    step2: { on: { SUBMIT: 'submitting' } },
    submitting: { on: { SUCCESS: 'success', ERROR: 'error' } },
    success: { on: {} },
    error: { on: { RETRY: 'idle' } }
  }
});
```

The returned instance has reactive properties: `checkout.current` (the current state), `checkout.matches(state)` (boolean check), `checkout.canSend(event)` (whether a transition is valid), and `checkout.send(event)` (trigger a transition).

### 1.6 Why machines prevent impossible states by construction

The machine definition is exhaustive. Every state lists its valid transitions. If a state has no transition for a given event, sending that event does nothing (or throws in strict mode). You cannot accidentally skip from `'idle'` to `'success'` — the path must go through every intermediate state.

This means:
- The UI cannot show a success message before submission completes
- The form cannot advance to step 2 before step 1 validates
- The submit button cannot fire while already submitting
- The retry button only appears in the error state

All of these guarantees come from the machine definition, not from scattered `if` checks throughout your template.

### 1.7 Async workflows with machines

Real machines often interact with APIs. The pattern: send an event to enter a "loading" state, kick off the async operation, then send a success/error event when it completes:

```typescript
async function handleSubmit(): Promise<void> {
  checkout.send('SUBMIT'); // enters 'submitting'

  try {
    const result = await submitOrder(formData);
    checkout.send('SUCCESS'); // enters 'success'
  } catch (err) {
    checkout.send('ERROR'); // enters 'error'
  }
}
```

The UI reactively follows the machine state. While the machine is in `'submitting'`, the template shows a spinner. When it moves to `'success'`, the template shows a confirmation. The async code does not touch the UI directly — it only sends events to the machine.

### 1.8 Drag-and-drop as a state machine

Drag-and-drop is notoriously bug-prone with booleans (`isDragging`, `isOver`, `hasDropped`). As a machine it becomes simple:

```typescript
type DragState = 'idle' | 'dragging' | 'over-target' | 'dropped';
type DragEvent = 'GRAB' | 'MOVE_OVER' | 'MOVE_OUT' | 'DROP' | 'CANCEL' | 'RESET';
```

Each state has clear visual and behavioral meaning. `'dragging'` shows the ghost element. `'over-target'` highlights the drop zone. `'dropped'` triggers the reorder animation. Impossible: being `'over-target'` without being `'dragging'`.

### 1.9 Using untrack() to prevent cascades

When a state transition triggers a `$effect` that sends another event (e.g., entering `'loading'` starts a fetch that eventually sends `'LOADED'`), you can create unintended reactive cascades. Use `untrack()` on the machine read inside the effect to prevent the effect from re-running on its own state change:

```typescript
$effect(() => {
  const state = checkout.current; // reactive read
  if (state === 'loading') {
    fetchData().then(() => {
      untrack(() => checkout.send('LOADED')); // does not re-trigger this effect
    });
  }
});
```

This is surgical optimization — only needed when effects both read and write to the same machine.

## Deep Dive

**Scale implications.** In production applications with 10+ async flows (auth, checkout, onboarding, data sync), state machines reduce bug reports by 60-80% compared to boolean-flag approaches. At Stripe, every payment flow is modeled as a state machine — not because it is academic, but because payment bugs cost real money. A boolean soup checkout that accidentally shows "payment successful" before the charge confirms is a revenue-critical defect.

**Mental model.** A state machine is a **subway map**. Each station (state) connects to specific other stations via tracks (transitions). You cannot teleport from Station A to Station F — you must follow the tracks. The map is the single source of truth. If you ask "can I get from Loading to Success?" you trace the tracks on the map. No tracks? Then no — it is literally impossible.

**Edge cases.** Machines with many states and transitions can become hard to visualize. Beyond 8-10 states, consider hierarchical (nested) machines where a parent state contains child states. For example, a `'form'` parent state contains `'step1'`, `'step2'`, `'step3'` children. The parent handles events common to all steps (like `'CANCEL'`). This is the XState "statecharts" concept. In Svelte 5, model it as nested `createMachine` calls or a single flat machine with compound state names (`'form.step1'`, `'form.step2'`).

**Performance.** State machines have zero performance overhead beyond a single string comparison per render cycle (`current === 'loading'`). The `$derived` values that depend on the current state re-compute as simple equality checks — nanoseconds. The real performance benefit is architectural: because impossible states cannot happen, you never need defensive `if (isLoading && !isError && !isSuccess)` guards scattered throughout your template. Less conditional logic = faster renders.

**Cross-module connections.** This lesson connects to Module 2 (runes as the reactive substrate), Lesson 18.3 (headless components often embed machines for interaction logic), and Module 12 (performance — machines eliminate unnecessary re-renders from inconsistent state). The `createMachine` helper from `StateMachine.svelte.ts` is reused in the module project's multi-step form and in any consumer app that needs complex flow management.

## 2. Style it — PE7 applied to the multi-step form

The multi-step form uses PE7 tokens for its step indicator (circles connected by lines), form panels, and transition animations. Step circles use `var(--color-brand)` for the active step, `var(--color-border)` for inactive, and `var(--color-success)` for completed steps. The connecting lines use `var(--color-border)` base with `var(--color-brand)` fill animation.

Form panels use `var(--color-surface-2)` background with `var(--space-lg)` padding. The submit button uses `min-block-size: 44px` for touch targets. State transitions animate the panel with `opacity` and `transform: translateX()` using `var(--dur-base)` and `var(--ease-out)`, guarded by `prefers-reduced-motion` which falls back to instant opacity switch.

Error and success states use `var(--color-error)` and `var(--color-success)` respectively for their container borders, with the icon color matching.

## 3. Interact — From boolean soup to a machine

The problem: a file upload widget with states (idle, selecting, uploading, progress, success, error, retrying). The boolean approach:

```typescript
// BROKEN: 6 booleans = 64 possible combinations, only 6 are valid
let isSelecting = $state(false);
let isUploading = $state(false);
let progress = $state(0);
let isSuccess = $state(false);
let isError = $state(false);
let isRetrying = $state(false);
```

Bug: setting `isUploading = true` without clearing `isSelecting = false` creates an impossible visual — the file picker and progress bar show simultaneously.

The fix with a machine:

```typescript
type UploadState = 'idle' | 'selecting' | 'uploading' | 'success' | 'error';
type UploadEvent = 'SELECT' | 'FILE_CHOSEN' | 'PROGRESS' | 'COMPLETE' | 'FAIL' | 'RETRY' | 'RESET';

const upload = createMachine<UploadState, UploadEvent>({
  initial: 'idle',
  states: {
    idle: { on: { SELECT: 'selecting' } },
    selecting: { on: { FILE_CHOSEN: 'uploading', RESET: 'idle' } },
    uploading: { on: { COMPLETE: 'success', FAIL: 'error' } },
    success: { on: { RESET: 'idle' } },
    error: { on: { RETRY: 'uploading', RESET: 'idle' } }
  }
});
```

Now the template uses `upload.matches('uploading')` instead of `isUploading && !isError && !isSuccess`. One check, one truth.

## 4. Mini-build — A multi-step form with state machine

**File:** `src/routes/modules/18-advanced/04-state-machines/+page.svelte`

This page demonstrates a three-step form (personal info, preferences, confirmation) controlled entirely by a state machine. The machine prevents skipping steps, handles validation, and manages the submit-to-success flow.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/18-advanced/04-state-machines`.

You will see a step indicator (1-2-3), the current form step, navigation buttons, and a state debugger showing the machine's current state and available transitions.

### Prove the machine prevents impossible states

1. Look at the state debugger panel. It shows `current: "step1"` and `available: ["NEXT"]`. You cannot skip to step 3 — the button is disabled because `canSend('SUBMIT')` is false.
2. Click Next to advance to step 2. The debugger updates to `current: "step2"`. The Back button appears because `canSend('BACK')` is now true.
3. Click Submit on step 3. The state moves to `'submitting'`, the spinner shows, and after 1.5 seconds it moves to `'success'`. During submission, all buttons are disabled — the machine has no transitions from `'submitting'` except `SUCCESS` and `ERROR`.
4. Open the console. There are no "impossible state" warnings because the machine makes them structurally impossible.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why are booleans problematic for modeling complex UI states?</summary>

N booleans create 2^N possible combinations, but only a small fraction are valid application states. The type system cannot prevent invalid combinations (e.g., `isLoading = true` and `isSuccess = true` simultaneously), leading to bugs where the UI shows contradictory states. These bugs are intermittent and hard to reproduce because they depend on timing and event ordering.
</details>

<details>
<summary><strong>Q2.</strong> How does a discriminated union add type safety beyond a simple string state?</summary>

A discriminated union attaches state-specific data to each variant. TypeScript narrows the type when you check the discriminant field, ensuring you only access properties that exist in the current state. For example, `error.message` is only accessible when `state === 'error'`, preventing runtime crashes from accessing non-existent properties.
</details>

<details>
<summary><strong>Q3.</strong> What role does <code>$derived</code> play in a state machine implementation?</summary>

`$derived` computes UI-relevant values from the current machine state. Instead of scattering conditional checks throughout the template (`{#if current === 'loading' || current === 'submitting'}`), you derive named booleans (`let showSpinner = $derived(...)`) that the template uses directly. These derived values are always consistent because they depend on a single atomic source.
</details>

<details>
<summary><strong>Q4.</strong> When would you use <code>untrack()</code> with a state machine, and why?</summary>

Use `untrack()` when an `$effect` both reads the machine state (to decide what to do) and writes to it (by sending an event). Without `untrack()`, sending an event changes the state, which re-triggers the effect, which may send another event — creating an infinite loop. Wrapping the send call in `untrack()` breaks the reactive dependency for that specific write.
</details>

<details>
<summary><strong>Q5.</strong> How would you model a parallel state (e.g., a form that is both "dirty" and "submitting") within this pattern?</summary>

Use two independent machines or add a parallel state dimension. For example: one machine for the form flow (`idle → step1 → step2 → submitting → success`) and a separate `$state` for the dirty flag (`let isDirty = $state(false)`). The dirty flag is orthogonal to the flow state — they do not interact. Alternatively, encode it in the state name: `'step1-clean'`, `'step1-dirty'` — though this increases states multiplicatively and is only worth it if the dirty status affects transitions.
</details>

## 6. Common mistakes

- **Sending events without checking canSend first.** If the machine has no transition for an event in the current state, the event is silently ignored. This can hide bugs. In development, log a warning when an event is sent but no transition exists: `if (!canSend(event)) console.warn(...)`.
- **Storing derived UI state separately from the machine.** If you have `let showSpinner = $state(false)` alongside the machine, you now have two sources of truth that can disagree. Always derive UI state from the machine: `let showSpinner = $derived(machine.matches('loading'))`.
- **Making the machine too granular.** Not every boolean needs to be a machine state. A toggle (on/off) is fine as a boolean. Use machines for flows with 3+ states and non-obvious transitions. Over-engineering simple interactions with machines adds complexity without value.
- **Forgetting to handle the error-to-retry path.** Many machines define the happy path but forget that errors need recovery transitions. Always define how the user gets back to a valid state from every error state — whether that is retry, reset, or manual correction.

## 7. What's next

Lesson 18.5 explores micro-frontends with SvelteKit — the architecture for when one application is not enough, and multiple teams need to deploy independently while sharing a cohesive user experience.
