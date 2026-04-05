---
module: 3
lesson: 3.8
title: Component composition patterns (prop spreading and hierarchy)
duration: 50 minutes
prerequisites:
  - Lesson 3.7 (snippet props)
  - Lesson 3.3 (interface Props)
learning_objectives:
  - Wrap one component in another to create a higher-level component
  - Use the `...rest` rest-props pattern to forward unknown props from parent to child
  - Decide when to wrap, when to compose, and when to leave a component alone
  - Understand why "thin wrappers around native elements" is a valid, common component pattern
  - Spread an arbitrary set of HTML attributes onto a component's root element safely
status: ready
---

# Lesson 3.8 — Component composition patterns

## 1. Concept — Components made of components

### 1.1 The problem: your Button is great, but your PrimaryButton should not be a copy of it

Your component library has a `Button.svelte` with a `variant` prop of `'solid' | 'outline' | 'ghost'`. Every primary action in the product wants a solid, large button with the brand colour — `variant="solid"` and `size="lg"`. You could write those attributes at every call site. That works, but after the 40th time, any change to what "primary" means costs you 40 edits.

A better answer is to wrap `Button` in a tiny higher-level component called `PrimaryButton.svelte` whose whole job is to hard-wire the primary choices and forward everything else. The wrapper is two lines of markup and one line of pass-through, and now "what is a primary button" lives in exactly one file.

This is the simplest and most common composition pattern: **wrap and forward**. It powers half of every real component library.

### 1.2 What "forwarding" means

When one component wraps another, the outer component must let the caller pass props *through it* to the inner component. If `PrimaryButton` only forwards `children`, you lose access to the inner button's `disabled`, `onclick`, `type`, and every other prop. Every wrapper would hand-forward every prop one at a time, and adding a new prop would require editing every wrapper.

The fix is the **rest-props pattern**. In a Props interface you declare the specific props you care about and collect everything else into a `rest` object which you spread onto the inner component.

```svelte
<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import type { Snippet } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';

    interface Props extends HTMLButtonAttributes {
        children: Snippet;
    }

    let { children, ...rest }: Props = $props();
</script>

<Button variant="solid" size="lg" {...rest}>
    {@render children()}
</Button>
```

Extending `HTMLButtonAttributes` gives your wrapper the complete typed surface of a native button — `disabled`, `type`, `onclick`, `form`, `aria-*`, `data-*` — without you having to list each one. `{...rest}` spreads them onto the inner `<Button>`. A caller writing `<PrimaryButton disabled onclick={save}>Save</PrimaryButton>` passes both `disabled` and `onclick` through the wrapper automatically.

### 1.3 When to wrap

Wrapping is the right answer when:

- The wrapper is *smaller* than what it wraps. A two-line wrapper around a 100-line button is worth it. A 200-line wrapper around a 10-line component is a smell.
- The wrapper encodes a *decision*, not just a rename. `PrimaryButton` bakes in `variant="solid"` and `size="lg"`. If the wrapper makes no decision, it is noise.
- The decision belongs to the *design system*, not a single feature. Wrapping `Button` as `PrimaryButton` is design-system work. Wrapping `PrimaryButton` as `SaveButton` is feature work and usually not worth the file.

### 1.4 Composition vs hierarchy

*Composition* is when a component's markup contains other components. A `Card` that renders a `Button` inside its footer is composing. This is how every non-trivial component works.

*Hierarchy* is when a set of components is designed together so the outer ones provide context and the inner ones consume it — `Tabs` / `TabList` / `Tab` / `TabPanel`, for example. Hierarchies use the Svelte context API, which is Module 11's topic. This lesson focuses only on composition and forwarding.

### 1.5 Typing the spread precisely

Avoid `[key: string]: unknown`. Extending a Svelte element-attribute type (`HTMLButtonAttributes`, `HTMLInputAttributes`, `HTMLDivAttributes`, …) is strictly better: typos are caught, editor autocomplete works, and the compiler rejects unknown attributes. Svelte exposes these types from `svelte/elements`.

### 1.6 Composition in layout: the Toolbar pattern

A second, simpler pattern is a pure *layout* wrapper: a component whose only job is to arrange its children in a row, column, or grid. Our `Toolbar.svelte` is 15 lines and it makes every action group in the app visually identical without knowing anything about what is inside it. Both patterns — decision wrappers and layout containers — are composition.

## 2. Style it — The wrapper borrows, it never duplicates

`PrimaryButton` adds no CSS of its own; it borrows `Button`'s. `Toolbar` adds only *layout* CSS — gap, padding, alignment — and leaves colours and typography to its children. When you write a wrapper and find yourself copy-pasting styles, that is a signal you should be passing a CSS custom property instead (Lesson 3.9).

## 3. Interact — Remove duplication twice

Start with a toolbar written by hand: a `<div class="toolbar">` with three `<button>`s, each with explicit `variant="solid" size="lg"`. Count the repetition: the class name, the three variant/size pairs, the padding. Replace the inner buttons with `<PrimaryButton>` — three attributes disappear per call. Replace the `<div class="toolbar">` with `<Toolbar>` — the layout style moves into the component. The visible result is identical; the file is half the length.

## 4. Mini-build — A settings toolbar

### Files

- `src/lib/components/Button.svelte` (upgraded in this lesson to extend `HTMLButtonAttributes` and spread `...rest`)
- `src/lib/components/PrimaryButton.svelte` (new)
- `src/lib/components/Toolbar.svelte` (new)
- `src/routes/modules/03-components/08-composition/+page.svelte`

### Key excerpt

```svelte
<Toolbar align="end">
    <Button variant="ghost">Cancel</Button>
    <PrimaryButton onclick={save}>Save changes</PrimaryButton>
</Toolbar>
```

### DevTools verification

1. Click the `<PrimaryButton>` in the Svelte DevTools. Notice its tree: `PrimaryButton` → `Button` → `<button>`. Two component layers, one native element, clean.
2. Inspect the native `<button>` in Elements. You should see `disabled`, `aria-label`, and any `data-*` attributes you passed — even though `PrimaryButton` never mentioned them. The rest-spread carried them through.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the rest-props pattern, in one sentence?</summary>

Collecting every prop the wrapper does not care about into a single object and spreading that object onto the inner component or element so all unknown props pass through.
</details>

<details>
<summary><strong>Q2.</strong> Why is extending `HTMLButtonAttributes` better than a loose `[key: string]: unknown`?</summary>

It gives you the full typed list of every real attribute a `<button>` accepts. Typos like `disbled` are caught, unknown attributes are rejected, and editor autocomplete works.
</details>

<details>
<summary><strong>Q3.</strong> When is wrapping a component *not* worth it?</summary>

When the wrapper is larger than what it wraps, when it encodes no decision, or when its job is to rename a component for a single feature rather than the design system.
</details>

<details>
<summary><strong>Q4.</strong> A `PrimaryButton` hard-wires `variant="solid"`. A caller writes `<PrimaryButton variant="ghost">Cancel</PrimaryButton>`. Who wins?</summary>

It depends on the spread order. If the wrapper writes `<Button variant="solid" {...rest}>`, the caller's `variant="ghost"` (inside `rest`) wins because it is spread *after*. If the wrapper writes `<Button {...rest} variant="solid">`, the hard-wired value wins. Pick the order that matches your intent and comment it.
</details>

<details>
<summary><strong>Q5.</strong> What is the difference between composition and hierarchy?</summary>

Composition is one component rendering another inside its markup. Hierarchy is a designed set of components that share state through context (Module 11), where outer components provide and inner ones consume.
</details>

## 6. Common mistakes

- **Forgetting to spread `...rest`.** Without it, every non-listed prop silently disappears. Your wrapper looks fine but loses accessibility attributes.
- **Accepting `any` as the rest type.** Use `HTMLButtonAttributes` or the matching element type. Never `any`.
- **Spreading rest *before* your defaults without thinking.** Order decides who wins. Pick deliberately.
- **Wrapping for the sake of wrapping.** A wrapper that adds nothing is noise.

## 7. What's next

Lesson 3.9 formalises the CSS custom property bridge — the clean way for a parent to influence a child's look without touching its markup, its class names, or its internal implementation.
