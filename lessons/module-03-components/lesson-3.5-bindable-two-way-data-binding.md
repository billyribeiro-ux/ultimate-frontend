---
module: 3
lesson: 3.5
title: $bindable() — two-way data binding
duration: 50 minutes
prerequisites:
  - Lesson 3.4 (optional props and defaults)
  - Module 2 ($state)
learning_objectives:
  - Explain why one-way data flow is the default and why two-way is the controlled exception
  - Declare a prop as `$bindable()` so a parent can write back to it
  - Use `bind:value` and `bind:open` from a parent to keep state in sync with a child
  - Design components that expose a minimum of bindable props and default to read-only
  - Recognise that `$bindable` is not a replacement for callback props — it is a different tool
status: ready
---

# Lesson 3.5 — $bindable(): two-way data binding

## 1. Concept — One-way is the rule; two-way is the exception

### 1.1 The problem: typing into an input

Imagine a form with a single text input and a live preview underneath. The input reads `name`, the preview reads `name`. You type — and nothing changes. The flow is one-way: the component handed `name` to the input, but nothing copies the user's typing *back* to `name`. The variable stays frozen.

You could fix this with an event handler — listen for `oninput`, read `event.target.value`, write back into a `$state` variable. That works, and sometimes that is exactly what you want. But for a plain text input, four steps for what the user thinks of as one action is too much ceremony.

Svelte provides a shortcut called **`bind:`** that writes exactly that code for you. For native elements this has always worked: `<input bind:value={name} />` silently wires up the event, the read, and the assignment. The question is: how do we get the same ergonomic shortcut when we wrap the input in our own `<Input>` component?

### 1.2 Why props are read-only by default

In Lesson 3.2 we said props flow only from parent to child. A child cannot write to a parent's variable just because it feels like it. This rule exists for a reason: if any child could reach into any ancestor's state at any time, you would never be able to trace where a value came from. One-way flow keeps the graph tractable.

But sometimes a component genuinely *needs* to send a value back up — an input reports the text the user typed; a modal reports that it has closed; a colour picker reports the selected colour. For these cases Svelte provides an **opt-in escape hatch**: the `$bindable()` rune.

### 1.3 The mechanics of `$bindable()`

Declare a prop as bindable on the child:

```svelte
<!-- Input.svelte -->
<script lang="ts">
    interface Props {
        value: string;
        label: string;
        id: string;
    }

    let { value = $bindable(), label, id }: Props = $props();
</script>

<label for={id}>{label}</label>
<input {id} type="text" bind:value />
```

Three things happen:

1. The child declares `value` with `$bindable()` in the destructure. This tells Svelte: "a parent is allowed to use `bind:value={…}` on me, and assignments I make to `value` should be reflected upward."
2. The child uses `bind:value` on the native `<input>` so DOM input events update its own `value` prop.
3. The parent uses `bind:value={name}` when rendering `<Input bind:value={name} />`. Svelte now treats `name` and the child's `value` as the same reactive slot.

Without `$bindable()`, a parent using `bind:value={name}` on the child is a compile error. Bindability is opt-in, per prop, by the component author — exactly so the component author retains control over what can be written back.

### 1.4 Default values for bindable props

You can still provide a default, with a small syntax tweak:

```ts
let { value = $bindable('initial') }: Props = $props();
```

The argument passed into `$bindable()` is the default used when the parent omits the prop. If the parent passes `bind:value={name}`, the default is ignored in favour of the parent's variable.

### 1.5 `$bindable` vs callback props

Not every "the child reports something to the parent" case needs `$bindable`. There are two patterns:

- **Bindable prop (`$bindable()`) + `bind:`.** For *state* the child owns the edit UI for but the parent owns the storage for. Canonical: `bind:value`, `bind:open`, `bind:checked`.
- **Callback prop (a function passed in).** For *events* — discrete actions the child wants to notify the parent about. Canonical: `onsubmit`, `onsearch`, `onpagechange`.

Rule of thumb: if the parent's question is "what is the current value?", use `$bindable`. If the question is "what did the user just do?", use a callback prop. Do not use `$bindable` for buttons, submissions, or anything that fires once per action.

### 1.6 Two bindable props, one component

A modal is the standard second example. The parent owns `open: boolean`. The child needs to flip it to `false` when the user presses Escape or clicks the close button. `open` is marked bindable; the parent binds its own state to it:

```svelte
<Modal bind:open={isOpen} title="Confirm" />
```

When the child sets `open = false` internally, `isOpen` in the parent updates. No callback, no event dispatcher.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, form inputs are the most common source of "parent needs to know what the child is doing." Every text field, checkbox, select, slider, and colour picker produces a value the parent cares about. Without `$bindable`, every input component needs a callback prop (`oninput`), a value prop, and manual wiring in the parent. With `$bindable`, the parent writes `bind:value={name}` and the wiring is automatic. In a form with 15 fields, this eliminates 15 callback handlers and 15 manual assignments — a significant reduction in boilerplate that also eliminates the class of bugs where the callback forgets to update the state.

**The mental model.** Think of a bindable prop as a shared notebook page. The parent writes a value on the page and hands it to the child. The child can read the page (display the value) and also write on it (update the value). Both parties are looking at the same page — there is no copying, no message-passing, just a shared mutable reference. This is powerful but must be used sparingly: if every prop were bindable, you could never trace where a value changed. That is why bindability is opt-in — the component author explicitly decides which pages of the notebook are shared and which are read-only.

**Edge cases.** A subtle behaviour: if a parent passes a prop without `bind:` to a component that declares it as `$bindable`, the prop still works as a one-way prop. The child's internal writes update the child's local copy but do not propagate back to the parent. This is by design — `$bindable` gives the parent the *option* to bind, not the obligation. Another edge case: binding to a `$derived` value from the parent. This is invalid — `$derived` values are read-only, so they cannot receive writes from a child. TypeScript will not always catch this at the binding site, but runtime behaviour will be incorrect. Only bind to `$state` or `let` variables. A third edge case: binding the same parent variable to two different children's bindable props creates a shared state where either child's writes propagate to the other via the parent. This works but can create confusing update cycles if both children write on the same tick.

**Performance implications.** `bind:` compiles to a signal subscription between parent and child — the same mechanism as regular props, just bidirectional. The overhead is one additional subscription per binding (compared to a one-way prop which has one subscription). For typical forms (10-20 bindings), this is unmeasurable. The real performance consideration is *when* updates fire: every keystroke in a bound input triggers a signal update, which triggers any `$derived` values that depend on it, which triggers any effects watching those derived values. For expensive derivations (like running validation on every keystroke), consider debouncing in the parent rather than blaming the binding mechanism.

**Cross-module connections.** Bindable props are central to Module 5 (form events and input handling), Module 10 (form actions where inputs need to report their values), and Module 11 (where shared state sometimes flows through bindable props on wrapper components). The decision of "bindable prop vs callback prop" is one you will make on every interactive component. The rule of thumb: use `$bindable` for *continuous state* (the current value of an input) and callback props for *discrete events* (form submission, button clicks, navigation actions).

### 1.7 Common interview question

**Q: "In Svelte 5, what is `$bindable()` and when should you use it instead of a callback prop?"**

**Model answer:** `$bindable()` marks a prop for two-way binding. When a parent uses `bind:value={name}` on the child, changes to the child's `value` propagate back to the parent's `name`. Use it for *continuous state synchronisation* — form inputs, toggles, open/close states — where the parent owns the data and the child owns the edit UI. Use a callback prop (`onSubmit: (data: FormData) => void`) for *discrete events* — form submissions, button clicks, page changes — where the parent needs to know something happened but does not need continuous state sync. The distinction: `$bindable` answers "what is the current value?", while a callback answers "what did the user just do?"

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/$bindable](https://svelte.dev/docs/svelte/$bindable) — the `$bindable` rune reference.
- [svelte.dev/docs/svelte/bind](https://svelte.dev/docs/svelte/bind) — the `bind:` directive on native elements and components.
- [svelte.dev/docs/svelte/$props](https://svelte.dev/docs/svelte/$props) — how `$bindable` interacts with `$props()`.

**Advanced pattern: controlled vs uncontrolled components.** A well-designed input component works in both modes:

```svelte
<script lang="ts">
    interface Props {
        value?: string;
        defaultValue?: string;
    }
    let { value = $bindable(undefined), defaultValue = '' }: Props = $props();
    let internal = $state(defaultValue);
    const current = $derived(value ?? internal);
</script>
```

If the parent uses `bind:value`, the component is *controlled* — the parent owns the state. If the parent omits `value`, the component is *uncontrolled* — it manages its own internal state. This dual-mode pattern is common in production input libraries.

**Challenge question (combines Lesson 3.5 + Lesson 2.2 + Lesson 3.3):** Build a `Toggle` component with a `$bindable` `checked` prop. The parent has a `$state` boolean `isDarkMode`. Use `bind:checked={isDarkMode}` from the parent. Trace the data flow: user clicks the toggle → child updates `checked` → parent's `isDarkMode` updates → a `$derived` value in the parent updates → a `style:--` directive on the page changes the colour scheme. How many DOM updates occur?

## 2. Style it — Focus rings that actually work

The `Input` respects `:focus-visible`, so the outline appears only when the user focuses with the keyboard, not when clicking. This matches WCAG 2.2 guidance. The outline colour comes from `--color-brand`, so per-page personality still applies.

## 3. Interact — Type and see it update everywhere

Write the component with a plain (non-bindable) `value` prop first. Type into the input; nothing updates outside. Then convert `value` to `$bindable()` and use `bind:value` on the parent. Type again — now the live preview updates on every keystroke, and the parent variable stays in perfect sync.

## 4. Mini-build — Live greeting + modal

### Files

- `src/lib/components/Input.svelte`
- `src/lib/components/Modal.svelte`
- `src/routes/modules/03-components/05-bindable/+page.svelte`

### Key excerpt

```svelte
<script lang="ts">
    import Input from '$lib/components/Input.svelte';
    import Modal from '$lib/components/Modal.svelte';

    let name: string = $state('Ada');
    let isOpen: boolean = $state(false);
</script>

<Input id="name" label="Your name" bind:value={name} />
<p>Hello, {name}</p>

<button type="button" onclick={() => (isOpen = true)}>Open modal</button>
<Modal title="Hi there" bind:open={isOpen}>
    Close this with the X, Escape, or clicking outside.
</Modal>
```

### DevTools verification

1. Open the Svelte DevTools and click the `Input` node. The **Props** panel shows `value: "Ada"`.
2. Type into the input. Watch the `value` prop update character by character as the parent's `name` state updates.
3. Do the same with the modal: open it, press Escape, watch `open` flip from `true` to `false`.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why are props read-only by default in Svelte?</summary>

To preserve one-way data flow. If any child could write to any parent's variable, tracing where a value came from would become impossible.
</details>

<details>
<summary><strong>Q2.</strong> How does a component author opt a prop into two-way binding?</summary>

By destructuring it with `$bindable()`: `let { value = $bindable() }: Props = $props();`. Without that call, a parent attempting `bind:value={…}` is a compile error.
</details>

<details>
<summary><strong>Q3.</strong> When should you prefer a callback prop over `$bindable`?</summary>

When the child reports a *discrete event* rather than sharing a *current value*. Submissions, clicks, and "page changed" are events best modelled as typed function calls.
</details>

<details>
<summary><strong>Q4.</strong> A Modal has `bind:open={isOpen}`. The user presses Escape. Walk through what happens.</summary>

The native `<dialog>` fires a `close` event. The component's handler sets its own `open = false`. Because `open` is `$bindable()` and the parent used `bind:open`, Svelte writes `false` into the parent's `isOpen`, triggering any derived values or re-renders that depend on it.
</details>

<details>
<summary><strong>Q5.</strong> Can a parent pass a non-bound value to a `$bindable` prop?</summary>

Yes. `$bindable` means the prop *may* be bound, not that it *must* be. A parent can still pass `value="hello"` without `bind:`.
</details>

## 6. Common mistakes

- **Forgetting `$bindable()` in the child.** The parent writes `bind:value` and gets `'value' is not a bindable prop`. Fix: add `$bindable()` to the destructure.
- **Using `$bindable` for events.** Don't. Use a callback prop like `onsubmit: (value: string) => void`.
- **Binding every prop just in case.** Each bindable prop widens the contract. Bind only what must be bound.
- **Assigning to the bindable prop from a `$derived`.** Derived values are read-only. If you need to write, use `$state` in the child and bind that.

## 7. What's next

Lesson 3.6 introduces snippets — `{#snippet}` and `{@render}` — Svelte 5's replacement for slots, which is how you let parents inject markup into children.
