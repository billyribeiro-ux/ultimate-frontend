---
module: 18
lesson: 18.3
title: Headless components
duration: 60 minutes
prerequisites:
  - "18.1 — Compound components"
  - "18.2 — Polymorphic components"
  - "3.6 — Snippets ({#snippet} and {@render})"
  - "11.2 — Svelte context API"
learning_objectives:
  - Explain the headless component pattern and why it completely separates behavior from presentation
  - Implement a headless Listbox that exposes state and actions through snippet parameters
  - Build a headless Toggle that manages boolean state with zero DOM output
  - Design callback-prop APIs that give consumers full rendering control
  - Apply the renderless pattern to any UI interaction (selection, disclosure, focus trap)
status: ready
---

# Lesson 18.3 — Headless components

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — UI logic without UI

### 1.1 The problem: behavior locked inside visual components

You built a beautiful Listbox component in your design system. It handles keyboard navigation, focus management, selection state, filtering, ARIA attributes — hundreds of lines of JavaScript logic. The problem: it also renders specific HTML (`<ul>`, `<li>`, `<button>`) with specific classes and specific styles. When a different team needs the same selection behavior but in a completely different visual context (a command palette, a chip selector, a sidebar filter), they cannot reuse your component. They need the brain without the body.

This is the fundamental tension in component libraries: **behavior and presentation are different concerns that change for different reasons.** A Listbox's keyboard navigation logic never changes regardless of whether it renders as a dropdown, an inline list, or a set of radio-style cards. But a traditional component bundles both together, making reuse impossible without style overrides or prop explosion.

### 1.2 The headless solution: renderless components

A **headless component** (also called a renderless component) manages state and behavior but renders nothing of its own. It exposes its internal state and control functions to the consumer through snippet parameters, and the consumer provides 100% of the markup and styling.

```svelte
<HeadlessListbox {options} value="svelte" onchange={handleChange}>
  {#snippet children(state, actions)}
    <div class="my-custom-listbox">
      <button onclick={actions.toggle}>
        {state.selectedValue || 'Choose...'}
      </button>
      {#if state.isOpen}
        <ul>
          {#each state.options as option, i}
            <li
              class:highlighted={i === state.highlightedIndex}
              onclick={() => actions.select(option.value)}
            >
              {option.label}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/snippet}
</HeadlessListbox>
```

The `HeadlessListbox` owns the logic: which item is selected, which is highlighted, is the dropdown open, what happens on keyboard input. The consumer owns every pixel of rendering. Two teams using the same `HeadlessListbox` can produce visually unrecognizable UIs while sharing identical selection logic.

### 1.3 The mechanism: snippets with parameters

In Svelte 5, the `children` prop is a snippet. Snippets can accept parameters — values that the parent passes down when rendering the snippet. This is the channel through which a headless component communicates with its consumer:

```typescript
interface HeadlessListboxProps {
  options: ListboxOption[];
  value?: string;
  onchange?: (value: string) => void;
  children: Snippet<[ListboxState, ListboxActions]>;
}
```

The component calls `{@render children(state, actions)}` and the consumer receives those as snippet parameters. The state object is reactive (built with `$derived`), so the consumer's template re-renders when internal state changes.

### 1.4 State objects and action objects

Headless components expose two categories of values:

1. **State** — read-only reactive values describing the current condition: `isOpen`, `selectedValue`, `highlightedIndex`, `isDisabled`. These drive the consumer's conditional rendering and class bindings.

2. **Actions** — functions that mutate state: `toggle()`, `select(value)`, `highlight(index)`, `reset()`. These are wired to the consumer's event handlers.

Separating state from actions creates a clean contract. Consumers know exactly what they can read and what they can do. TypeScript interfaces enforce this boundary:

```typescript
interface ListboxState {
  isOpen: boolean;
  selectedValue: string;
  highlightedIndex: number;
  options: ListboxOption[];
}

interface ListboxActions {
  toggle: () => void;
  select: (value: string) => void;
  highlight: (index: number) => void;
}
```

### 1.5 Why this is different from compound components

Compound components (Lesson 18.1) split UI into cooperating parts where each part has its own template. The parent coordinates, but children are real components with their own `<style>` blocks. Headless components go further: the "component" has no template at all. It is pure logic.

| Concern | Compound | Headless |
|---------|----------|----------|
| Who renders? | Each child component | The consumer exclusively |
| Where are styles? | In each child's `<style>` | In the consumer's `<style>` |
| How do children access state? | Context (getContext) | Snippet parameters |
| Reuse across visual designs? | Difficult (styles are baked in) | Trivial (zero styles to override) |

Choose compound when you want a ready-to-use UI kit with sensible defaults. Choose headless when you want maximum flexibility and are building a library consumed by multiple design systems.

### 1.6 The TanStack model: headless for everything

TanStack (the library family that includes TanStack Table, TanStack Query, TanStack Router) popularized the headless approach in the React ecosystem. TanStack Table provides zero UI — it gives you column definitions, sorting logic, pagination math, and row models. You render the actual `<table>` yourself. This means TanStack Table works identically with Tailwind, Material UI, Ant Design, or your custom CSS.

The same model works perfectly in Svelte. A headless Listbox can drive a shadcn-style dropdown in one app and a mobile bottom-sheet selector in another. A headless DatePicker can power a calendar widget or an inline text input with validation. The behavior is framework-agnostic logic; the presentation is team-specific HTML and CSS.

### 1.7 Callback props vs. snippet parameters

There are two channels for headless output:

1. **Snippet parameters** (primary) — the component passes state and actions as arguments to the children snippet. The consumer renders markup reactively based on those values.

2. **Callback props** (secondary) — the consumer passes functions (`onchange`, `onopen`, `onclose`) that the headless component calls when events occur. These are for side effects (analytics, focus management, API calls) that happen alongside the UI update.

Both work together. The snippet parameters handle rendering; the callbacks handle side effects:

```svelte
<HeadlessListbox
  {options}
  value={selected}
  onchange={(val) => { selected = val; savePreference(val); }}
>
  {#snippet children(state, actions)}
    <!-- rendering here -->
  {/snippet}
</HeadlessListbox>
```

### 1.8 When to use headless vs. styled components

Use headless components when:
- Multiple teams consume the same library with different visual designs
- You are building a primitive that will be styled differently in every context
- The behavior is complex enough to justify extraction (keyboard nav, focus traps, selection)
- You want to test logic without rendering (unit tests on state machines)

Use styled (compound) components when:
- You control the design system and want consistent rendering everywhere
- The visual treatment is unlikely to change across consumers
- Developer ergonomics matter more than flexibility (less boilerplate)
- You want a "just works" experience for rapid prototyping

Most design systems ship both: headless primitives for power users and styled defaults for quick adoption.

### 1.9 The April 2026 advantage

Svelte 5's snippets with typed parameters make headless components significantly more ergonomic than Svelte 4's approach (which required slots with `let:` directives — less type-safe and harder to compose). The `Snippet<[State, Actions]>` type gives you full IntelliSense on snippet parameters, compile-time checks on shape mismatches, and clear documentation through the interface. Combined with `$derived` for reactive state objects, headless components in Svelte 5 require less boilerplate than any other framework.

## Deep Dive

**Scale implications.** Headless component libraries scale to unlimited visual variations with zero code duplication. Radix UI (headless) supports thousands of visual implementations built on top of its behavior primitives. In a monorepo with 10 apps (Lesson 18.10), a single headless Listbox package serves all 10 apps regardless of their CSS framework, design tokens, or component structure. The behavioral test suite (50+ tests for keyboard nav, focus management, ARIA) runs once against the headless package — no need to re-test in each app.

**Mental model.** A headless component is a **puppeteer** — it controls the movements (state, transitions, logic) but has no physical form. The consumer provides the puppet (HTML, CSS). The puppeteer makes the puppet move correctly regardless of what the puppet looks like. Change the puppet from a marionette to a hand puppet and the same movements still work — the puppeteer does not care about the visual form.

**Edge cases.** DOM-dependent behavior (focus management, scroll locking, portal rendering) cannot be fully headless because it requires DOM references. The pattern breaks down when you need `bind:this` on specific elements. The pragmatic solution: accept element references as props or use actions (`use:focusTrap`) alongside headless logic. For example, a headless Dialog manages open/close state headlessly but the focus trap requires a DOM node — pass `containerRef` as a prop.

**Performance.** Headless components have near-zero overhead because they render nothing. The snippet parameter object is a `$derived` value — Svelte tracks which properties the consumer reads and only re-renders when those specific properties change. If the consumer only reads `state.selectedValue`, changes to `state.highlightedIndex` do not trigger a re-render of unrelated parts.

**Cross-module connections.** This lesson builds on Module 3 (snippets), Module 11 (state management), and Lesson 18.1 (compound components as the "styled" counterpart). It feeds into Lesson 18.4 (state machines) because headless components often embed state machines for complex interaction flows. It connects to Lesson 18.10 (monorepo) because headless packages are the ideal shared-library architecture.

## 2. Style it — PE7 applied to the headless Listbox consumer

Since the headless component itself has no styles, styling lives entirely in the consumer (the mini-build page). The consumer uses PE7 tokens for every visual property:

The trigger button uses `var(--space-sm)` padding, `var(--color-surface-2)` background, `var(--color-border)` for the border, and `min-block-size: 44px` for touch targets. The dropdown panel uses `var(--color-surface)` with `var(--shadow-lg)` for elevation and `var(--radius-md)` for corners. Highlighted items use `var(--color-brand)` background with `var(--color-surface)` text. Selected items show a checkmark via CSS `::before` pseudo-element.

Transitions on the dropdown (opacity + transform) use `var(--dur-fast)` and `var(--ease-out)`, with `prefers-reduced-motion` guard removing the transform and reducing opacity duration. Mobile-first: the dropdown is full-width on small screens and positioned absolutely on larger screens.

## 3. Interact — Building a headless Toggle from scratch

The problem: you need a toggle (on/off switch) that works in three different visual contexts — a classic toggle switch, a checkbox-style card, and a simple text link that says "Enable/Disable". All three share the same state logic (pressed/unpressed, disabled, onChange callback) but look completely different.

The mistake: building three separate components with duplicated logic.

```svelte
<!-- BROKEN: Logic duplicated across three components -->
<!-- ToggleSwitch.svelte -->
<script lang="ts">
  let pressed: boolean = $state(false);
  function toggle() { pressed = !pressed; }
</script>
<button aria-pressed={pressed} onclick={toggle}>...</button>

<!-- ToggleCard.svelte — same logic, different UI -->
<!-- ToggleLink.svelte — same logic, different UI -->
```

The fix: extract the logic into a headless component:

```svelte
<!-- HeadlessToggle.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface ToggleState { pressed: boolean; disabled: boolean; }
  interface ToggleActions { toggle: () => void; setPressed: (value: boolean) => void; }

  interface HeadlessToggleProps {
    defaultPressed?: boolean;
    disabled?: boolean;
    onchange?: (pressed: boolean) => void;
    children: Snippet<[ToggleState, ToggleActions]>;
  }

  let { defaultPressed = false, disabled = false, onchange, children }: HeadlessToggleProps = $props();
  let pressed: boolean = $state(defaultPressed);

  function toggle(): void {
    if (disabled) return;
    pressed = !pressed;
    onchange?.(pressed);
  }

  function setPressed(value: boolean): void {
    if (disabled) return;
    pressed = value;
    onchange?.(pressed);
  }

  let state: ToggleState = $derived({ pressed, disabled });
  let actions: ToggleActions = { toggle, setPressed };
</script>

{@render children(state, actions)}
```

Now each visual variant is pure markup — no duplicated logic:

```svelte
<HeadlessToggle onchange={handleNotifications}>
  {#snippet children(state, actions)}
    <button
      class="toggle-switch"
      class:toggle-switch--on={state.pressed}
      aria-pressed={state.pressed}
      onclick={actions.toggle}
    >
      {state.pressed ? 'ON' : 'OFF'}
    </button>
  {/snippet}
</HeadlessToggle>
```

## 4. Mini-build — Headless Listbox with custom rendering

**File:** `src/routes/modules/18-advanced/03-headless-components/+page.svelte`

This page demonstrates the `HeadlessListbox` component with two completely different visual implementations using the same underlying logic: a dropdown select and an inline card selector.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/18-advanced/03-headless-components`.

You will see two sections. The first is a traditional dropdown (click to open, select an option). The second is an inline grid of cards where clicking a card selects it. Both share the same `HeadlessListbox` component — identical state management, different visuals.

### Prove the headless pattern works

1. Open the Svelte DevTools. Find `HeadlessListbox` in the component tree. Notice it has no DOM output of its own — it renders only what the consumer provides through the snippet.
2. Click an option in the dropdown. The selected value updates. Now click a card in the grid. The same value type updates. Both use `actions.select()` from the same headless component.
3. In DevTools Elements panel, inspect the dropdown `<ul>` and the card grid. They have completely different HTML structures and class names — proof that the headless component owns zero presentation.
4. Try keyboard navigation (arrow keys in the dropdown). The headless component manages `highlightedIndex` — the consumer only needs to apply a visual highlight based on that index.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the fundamental difference between a compound component and a headless component?</summary>

A compound component splits UI into cooperating parts where each part is a real component with its own template and styles. A headless component has no template at all — it manages only state and behavior, exposing them through snippet parameters so the consumer provides 100% of the rendering.
</details>

<details>
<summary><strong>Q2.</strong> How do snippet parameters enable the headless pattern in Svelte 5?</summary>

The headless component declares `children: Snippet<[State, Actions]>` in its props. When it calls `{@render children(state, actions)}`, the consumer's snippet block receives those values as parameters. The state object is reactive (built with `$derived`), so the consumer's template re-renders automatically when internal state changes. This gives the consumer full rendering control while the headless component retains full behavioral control.
</details>

<details>
<summary><strong>Q3.</strong> When would you choose a headless component over a styled compound component?</summary>

Choose headless when the same behavior must serve multiple visual designs (different apps, different teams, different CSS frameworks), when the logic is complex enough to justify extraction and independent testing, or when maximum rendering flexibility is required. Choose styled compound when you want consistent rendering, quick setup, and minimal boilerplate.
</details>

<details>
<summary><strong>Q4.</strong> What is the limitation of headless components when it comes to DOM-dependent behavior like focus management?</summary>

Headless components render nothing, so they have no DOM nodes to reference. Behaviors like focus trapping, scroll locking, or portal rendering require actual DOM elements. The solution is to accept element references as props, use Svelte actions (`use:focusTrap`), or expose a `ref` callback that the consumer calls with their container element.
</details>

<details>
<summary><strong>Q5.</strong> How does the separation of state and actions in a headless component improve testability?</summary>

Because the headless component is pure logic (no DOM rendering), you can test it with unit tests that exercise state transitions without mounting any component. Call `actions.select('value')` and assert `state.selectedValue === 'value'`. No DOM setup, no browser environment, no visual regression testing needed for the logic layer. Visual tests remain the consumer's responsibility.
</details>

## 6. Common mistakes

- **Putting styles inside the headless component.** The entire point is zero presentation. If your headless component has a `<style>` block, it is not headless. Move all styles to the consumer.
- **Exposing mutable state directly instead of derived objects.** If you pass raw `$state` variables as snippet parameters, consumers might accidentally reassign them. Always wrap state in a `$derived` object that creates a new reference on change, making the contract read-only from the consumer's perspective.
- **Forgetting to type the snippet parameters.** Using `Snippet` without type parameters loses IntelliSense and compile-time safety. Always use `Snippet<[StateType, ActionsType]>` to give consumers full type information on what they receive.
- **Not handling keyboard interactions in the headless layer.** Keyboard navigation (arrow keys, Enter, Escape) is behavior, not presentation. It belongs in the headless component. If you leave it to consumers, every consumer reimplements it differently (and usually incorrectly). The headless component should manage key handlers and expose them or apply them internally.

## 7. What's next

Lesson 18.4 introduces state machines with runes — a formal way to model complex interaction flows (multi-step forms, async workflows, drag-and-drop) as explicit states and transitions, preventing impossible states by construction.
