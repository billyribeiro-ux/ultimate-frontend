---
module: 5
lesson: 5.5
title: Forwarding events from child to parent (callback prop pattern)
duration: 45 minutes
prerequisites:
  - Lesson 5.2 (typed functions)
  - Lesson 5.3 (typed events)
  - Module 3 (components and props)
learning_objectives:
  - Explain why a child component sometimes needs to tell its parent that something happened
  - Forward an event from a child to a parent using a typed callback prop
  - Type the callback prop with a function type alias
  - Explain why createEventDispatcher is outdated and what replaced it
  - Build a reusable Button component that forwards its click
status: ready
---

# Lesson 5.5 — Forwarding events from child to parent

## 1. Concept — The callback prop pattern

### 1.1 The problem: the child cannot reach the parent

You build a `<FancyButton>` component. Inside it you have a `<button>` with `onclick={handleClick}`. The handler changes the button's own internal state (for example, to trigger a ripple animation). That is fine. But now the parent page needs to know when the button was clicked, because the parent is the one that actually wants to do something — add an item to a list, delete a row, submit a form. The child does not own the list, the row, or the form. The parent does. How does the child *tell* the parent "hey, the user clicked me"?

In old Svelte (3/4), the answer was `createEventDispatcher`. You created a dispatcher, you dispatched a custom event, and the parent listened with `on:customname`. It worked, but it invented a whole mini-framework for something that JavaScript already had an answer for.

### 1.2 The April 2026 answer: pass a function in

The modern answer is: pass a function from the parent into the child as a prop. The child calls it when the user interacts. That is it. No dispatcher, no bus, no event bubbling tricks. A **callback prop** is a function-shaped prop whose only job is to be called later.

```svelte
<!-- FancyButton.svelte (child) -->
<script lang="ts">
    interface Props {
        label: string;
        onPress: (event: MouseEvent) => void;
    }

    let { label, onPress }: Props = $props();
</script>

<button type="button" class="fancy" onclick={onPress}>{label}</button>

<style>
    .fancy { padding: 1rem; }
</style>
```

```svelte
<!-- Parent -->
<script lang="ts">
    import FancyButton from './FancyButton.svelte';

    let count: number = $state(0);

    function handlePress(event: MouseEvent): void {
        count += 1;
        console.log('clicked at', event.clientX);
    }
</script>

<FancyButton label="Press me" onPress={handlePress} />
<p>Pressed {count} times</p>
```

The parent passes `handlePress` to the child. The child calls it when the DOM `click` fires. That is the whole mechanism. It is exactly the same machinery you used in Lesson 5.1 when you wrote `onclick={increment}`, except now the thing that *calls* the function is another component instead of the DOM.

### 1.3 Why callback props are better than custom events

Four concrete reasons:

1. **Full type safety.** The callback is typed at the prop boundary. If the parent passes a function of the wrong shape, TypeScript fails the check in the parent file, where the bug lives. With a custom event system the contract lives in two places — the dispatcher and the listener — and the compiler cannot check the join.
2. **No framework lore.** A function prop is a plain JavaScript pattern. Any React, Vue, Solid, or vanilla developer understands it immediately.
3. **Simpler debugging.** You can step through the callback in DevTools in a single stack frame. With dispatched events there are framework layers to jump through.
4. **Better tree-shaking.** No dispatcher code to bundle.

`createEventDispatcher` and `on:eventname` still work in Svelte 5 as a compatibility shim, but the official guidance since Svelte 5.0 is: prefer callback props. This course does not use dispatchers at all.

### 1.4 Naming conventions

Two conventions are in use in the Svelte 5 community. Both are fine as long as you are consistent:

- **`on` prefix** — `onclick`, `onchange`, `onopen`. Mirrors DOM attributes and reads naturally on the call site.
- **Verb-phrase** — `press`, `select`, `submit`. Reads as an imperative and is clearer for domain events that are not 1:1 with a DOM event.

In this course we use `on`-prefixed lowercase names for handlers that map directly to a user interaction (`onpress`, `onselect`, `onclose`) and unprefixed verb phrases for semantic events (`save`, `delete`). Every callback prop is optional-typed only when the parent may legitimately skip it; otherwise mark it required.

### 1.5 Optional callback props

A child that *sometimes* needs a callback should type the prop as optional and default it to a no-op:

```ts
interface Props {
    onPress?: (event: MouseEvent) => void;
}

let { onPress = () => {} }: Props = $props();
```

Now the parent can omit `onPress` entirely and the button still works. The child's handler can safely call `onPress(event)` without an existence check.

## 2. Style it — A reusable button

The child component carries its own styles. Per-page colour for the parent: `oklch(72% 0.2 320)` (magenta). The child inherits `var(--color-brand)` from the parent's scope — proving that per-page personalities flow through component boundaries because CSS custom properties cascade normally, even across Svelte's scoped style hashes.

## 3. Interact — Swap a dispatcher for a prop

If you have older Svelte code lying around, try this refactor on paper:

```svelte
<!-- OLD, Svelte 3/4 — OUTDATED -->
<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    function click() { dispatch('press'); }
</script>
<button on:click={click}>x</button>
```

Replace with:

```svelte
<script lang="ts">
    interface Props { onPress: () => void; }
    let { onPress }: Props = $props();
</script>
<button type="button" onclick={onPress}>x</button>
```

The file is shorter, the types are tighter, and the parent no longer needs `on:press` — just `<Child onPress={handle} />`.

## 4. Mini-build — A click counter with a reusable FancyButton

**Files:**
- `src/routes/modules/05-events/05-forwarding-events/FancyButton.svelte` (child)
- `src/routes/modules/05-events/05-forwarding-events/+page.svelte` (parent)

The parent renders two `FancyButton`s with different labels and different handlers. Each button forwards its click through the `onPress` callback prop. The parent keeps the count state; the child keeps only presentation state.

### DevTools verification

Put a `debugger` statement inside the parent's `handlePress`. Click the button. The call stack shows two frames: the child's inline `onclick={onPress}` (i.e. the DOM handler) and the parent's `handlePress`. No `createEventDispatcher`, no framework internals between them.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is a callback prop?</summary>

A prop whose type is a function. The parent passes a function in; the child calls it when something happens. It is the Svelte 5 replacement for `createEventDispatcher`.
</details>

<details>
<summary><strong>Q2.</strong> Why are callback props more type-safe than custom events?</summary>

The contract lives in one place — the prop type — and is checked at the call site. With custom events the dispatcher and the listener are unchecked relative to each other.
</details>

<details>
<summary><strong>Q3.</strong> How do you make a callback prop optional?</summary>

Type it with a `?` and default it to a no-op: `onPress?: () => void`, then `let { onPress = () => {} } = $props()`.
</details>

<details>
<summary><strong>Q4.</strong> If a parent passes <code>onPress={handleClick}</code>, what type must <code>handleClick</code> be?</summary>

Whatever the child's `onPress` prop declares. If the child types it as `(event: MouseEvent) => void`, then `handleClick` must accept a `MouseEvent` and return `void`.
</details>

<details>
<summary><strong>Q5.</strong> Is <code>createEventDispatcher</code> still in Svelte 5?</summary>

It exists as a compatibility shim for older code, but it is not recommended for new components. Use callback props instead.
</details>

## 6. Common mistakes

- **Forgetting to type the callback prop.** Implicit `any` in strict mode; also makes refactors risky.
- **Calling the callback with the wrong arguments.** If the child forwards a DOM event, it should match the prop type the parent declared.
- **Naming inconsistencies.** Mixing `onClick`, `onclick`, and `handleClick` in the same component. Pick a convention and stick with it.
- **Using `createEventDispatcher` in new code.** Callback props are the current pattern; dispatchers are the compatibility path.

## 7. What's next

Lesson 5.6 takes a deep look at closures — the JavaScript feature that lets a handler "remember" the variables of the place where it was defined.
