---
module: 18
lesson: 18.2
title: Polymorphic components
duration: 55 minutes
prerequisites:
  - "18.1 — Compound components"
  - "3.2 — $props() — passing data into components"
  - "TypeScript conditional types and generics"
learning_objectives:
  - Explain what a polymorphic component is and why design systems need them
  - Implement an As component using svelte:element with typed element constraints
  - Use TypeScript conditional types to enforce prop dependencies based on the element type
  - Build a polymorphic Button that renders as button, a, or span with correct attributes
  - Apply the pattern to create flexible design-system primitives
status: ready
---

# Lesson 18.2 — Polymorphic components

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — A single component, many HTML elements

### 1.1 The problem: design systems need flexible primitives

You are building a design system. You have a `Button` component with specific styles — padding, border-radius, font weight, hover state, focus ring. It looks exactly how your brand demands. But then a designer says: "I need that same button style on a link that navigates to another page." And another says: "I need it on a `<span>` inside a third-party widget where I cannot use `<button>` or `<a>`."

The naive solution is three separate components: `Button.svelte`, `ButtonLink.svelte`, `ButtonSpan.svelte`. They share the same styles but different markup. When the design changes, you update three files. When you add a new variant (size, color), you update three files. Multiply by every primitive in your system (Card, Text, Badge, Container) and you have a maintenance nightmare.

### 1.2 The polymorphic pattern: one component, configurable element

A **polymorphic component** accepts an `as` prop that determines which HTML element it renders. The component owns the styles and behavior; the consumer chooses the semantic element:

```svelte
<Button as="a" href="/pricing">View Pricing</Button>
<Button as="button" onclick={handleSubmit}>Submit</Button>
<Button as="span" role="button" tabindex={0}>Legacy Widget</Button>
```

One component. One style source. One behavior layer. The `as` prop changes the underlying DOM element without touching anything else. This is the pattern that Chakra UI, Radix, Styled Components, and every serious design system implements.

### 1.3 How svelte:element enables polymorphism

Svelte provides a built-in mechanism for dynamic elements: `<svelte:element this={tag}>`. This special syntax renders whatever HTML element you specify at runtime:

```svelte
<script lang="ts">
  let { as = 'div' }: { as: string } = $props();
</script>

<svelte:element this={as} class="box">
  Content
</svelte:element>
```

If `as` is `'section'`, the DOM shows `<section class="box">`. If `as` is `'article'`, you get `<article class="box">`. The same compiled component, different semantic output.

### 1.4 The TypeScript challenge: element-specific attributes

Here is where things get interesting. An `<a>` element accepts `href`, `target`, `rel`. A `<button>` accepts `type`, `disabled`, `form`. A `<div>` accepts neither `href` nor `type`. If your polymorphic component accepts `as="a"` but you forget `href`, that is a bug. If you pass `href` when `as="button"`, that is also a bug — buttons do not navigate.

TypeScript conditional types solve this. You define a type that changes based on the `as` value:

```typescript
type ValidElement = 'a' | 'button' | 'div' | 'span' | 'section' | 'article';

type ElementProps<T extends ValidElement> =
  T extends 'a' ? { href: string; target?: string; rel?: string } :
  T extends 'button' ? { type?: 'button' | 'submit' | 'reset'; disabled?: boolean } :
  Record<string, never>;
```

When `as` is `'a'`, `href` becomes required. When `as` is `'button'`, `type` and `disabled` become available. When `as` is `'div'`, no extra props are allowed.

### 1.5 The practical implementation in Svelte 5

In practice, Svelte 5's type system has limitations with the `as` prop pattern. The `svelte:element` directive accepts a string, and TypeScript cannot narrow the rest-spread props based on a string literal at the component boundary in the same way that React's `createElement` can. The pragmatic approach is:

1. Define a union type of valid elements.
2. Accept an `as` prop with a default.
3. Accept `class`, `href`, and common attributes as optional props.
4. Spread remaining props onto the element.
5. Document which props are valid for which element.

```typescript
interface AsProps {
  as?: ValidElement;
  class?: string;
  href?: string;
  children: Snippet;
  [key: string]: unknown;
}
```

For stricter enforcement, provide wrapper components (`ButtonLink`, `ButtonAction`) that fix the `as` value and narrow the props — combining the best of both worlds: a single styling source internally, strict types externally.

### 1.6 Why this matters for design systems

A design system with 30 visual components and 5 possible underlying elements per component would need 150 separate component files without polymorphism. With polymorphism, you maintain 30 files. The math alone justifies the pattern.

But it goes deeper. Polymorphism enables **semantic correctness without style duplication**. A card that is clickable should be an `<article>` with an `<a>` inside — but sometimes it needs to be a `<li>` in a list, or a `<section>` in a sidebar. The visual treatment is identical; only the semantics change. Without polymorphism, you either duplicate styles (maintenance burden) or use a non-semantic `<div>` everywhere (accessibility burden).

### 1.7 Constraints and valid elements

Not every HTML element makes sense for every component. A `Button` should render as `button`, `a`, or at most `span` — never as `table` or `img`. Constrain the `as` prop to valid options:

```typescript
type ButtonElement = 'button' | 'a' | 'span';
type CardElement = 'article' | 'section' | 'div' | 'li';
type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
```

These constraints serve as documentation and prevent misuse. If someone tries `<Button as="img">`, TypeScript rejects it at build time.

### 1.8 The relationship to web components and framework interop

Polymorphic components are framework-specific — they rely on Svelte's `svelte:element`. If you need cross-framework interop (Svelte + React + Vue consuming the same library), consider Web Components or headless libraries instead. But within a single-framework monorepo (the architecture from Lesson 18.10), polymorphic Svelte components are the optimal primitive. They compile away to nothing, they are fully typed, and they produce the smallest possible output.

### 1.9 Historical context: Svelte 4 vs Svelte 5

In Svelte 4, polymorphic components required `export let as = 'div'` and slots for children. The type safety story was poor — there was no good way to narrow props based on the `as` value. Svelte 5's `$props()` with explicit interfaces, combined with TypeScript 5.5+ const type parameters, makes the pattern significantly more ergonomic. The `svelte:element` syntax itself has not changed, but everything around it (prop typing, snippet children, rest spreading) is vastly improved.

## Deep Dive

**Scale implications.** At companies like Shopify (Polaris), Adobe (Spectrum), and GitHub (Primer), polymorphic components reduce the design system's component count by 3-5x. Primer's `Box` component renders as 15 different elements depending on context. This consolidation means that design changes propagate from a single source, reducing the "update 47 files for a border-radius change" problem to "update 1 file." The build-time cost is zero because `svelte:element` compiles to a direct `document.createElement(tag)` call — there is no runtime branching or conditional rendering.

**Mental model.** Think of a polymorphic component as a **costume**. The costume (styles, behavior, ARIA attributes) remains the same regardless of who wears it (which HTML element renders). A button costume on a `<button>` element gives you native click handling and form submission. The same costume on an `<a>` element gives you native navigation. The costume does not change — only the underlying actor changes, and with it, the native capabilities.

**Edge cases.** Accessibility is the critical edge case. When `as="span"`, you lose native keyboard interaction — spans are not focusable or clickable by default. Your component must compensate: add `role="button"`, `tabindex={0}`, and keyboard event handlers (`onkeydown` for Enter/Space). This compensation logic should be conditional — only apply it when the underlying element is not natively interactive. A helper function like `needsInteractiveRole(element: ValidElement): boolean` keeps this clean.

**Performance.** `svelte:element` has identical performance to a static element. The compiler generates `document.createElement(tag)` where `tag` is the prop value. There is no virtual DOM diffing, no conditional branching in the template, no runtime overhead. The only "cost" is that the element tag is determined at runtime rather than compile time, which means Svelte cannot optimize static children as aggressively — but this difference is unmeasurable in practice.

**Cross-module connections.** This pattern feeds directly into Lesson 18.8 (advanced TypeScript) where you learn conditional types that make `href` required only when `as="a"`. It connects to Module 12 (performance) because polymorphic components are the primitive that design systems build on — if the primitive is slow, everything is slow. It connects to Lesson 18.10 (monorepo) because the `@org/ui` package exports polymorphic primitives consumed by multiple apps.

## 2. Style it — PE7 applied to the polymorphic Button

The polymorphic Button uses PE7 tokens for every visual property. Padding uses `var(--space-sm)` and `var(--space-md)` for a balanced touch target (minimum 44px block size). Background color uses `var(--color-brand)` with text in `var(--color-surface)` for contrast. Border-radius uses `var(--radius-md)`. Hover transitions use `var(--dur-fast)` with `var(--ease-out)`.

The key insight: styles are declared once in the `<style>` block and apply regardless of which element renders. Whether the DOM shows `<button class="btn">` or `<a class="btn">`, the visual output is identical. This is the power of separating presentation from semantics.

Focus styles use the global `:focus-visible` rule from the reset layer (2px solid brand outline with 2px offset), ensuring consistency across all element types. The `prefers-reduced-motion` guard in the animations layer handles transitions globally.

## 3. Interact — Building type-safe element constraints

The problem: you want `<Button as="a" href="/about">` to work but `<Button as="button" href="/about">` to be a type error — buttons do not have hrefs.

First, the mistake — a permissive interface that allows invalid combinations:

```typescript
// BROKEN: allows href on buttons, allows disabled on links
interface ButtonProps {
  as?: 'button' | 'a' | 'span';
  href?: string;
  disabled?: boolean;
  children: Snippet;
}
```

This compiles without errors even when the user writes `<Button as="button" href="/oops">`. The href is silently ignored in the DOM (buttons ignore unknown attributes), but it signals developer confusion.

The fix uses conditional prop spreading and runtime documentation. Because Svelte 5's component type system cannot fully narrow rest props based on a string literal prop at the template level, the pragmatic approach combines TypeScript interfaces with runtime validation:

```typescript
interface AsProps {
  as?: ValidElement;
  class?: string;
  href?: string;
  children: Snippet;
  [key: string]: unknown;
}

// In component logic:
if (as === 'a' && !href) {
  console.warn('As: element "a" requires an href prop');
}
if (as !== 'a' && href) {
  console.warn('As: href is only valid when as="a"');
}
```

For strict enforcement at the type level, create specialized wrappers:

```svelte
<!-- ButtonLink.svelte — as="a" locked, href required -->
<script lang="ts">
  import As from './As.svelte';
  interface ButtonLinkProps { href: string; class?: string; children: Snippet; }
  let { href, class: className = '', children }: ButtonLinkProps = $props();
</script>
<As as="a" {href} class="btn {className}">{@render children()}</As>
```

## 4. Mini-build — A polymorphic component showcase

**File:** `src/routes/modules/18-advanced/02-polymorphic-components/+page.svelte`

This page demonstrates the `<As>` component rendering as different elements, plus a polymorphic Button that works as `<button>`, `<a>`, and `<span>`.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/18-advanced/02-polymorphic-components`.

You will see three rows: a button that submits, a link that navigates, and a span that acts as a button. All three share identical visual styling but render different HTML elements.

### Prove polymorphism works

1. Right-click each "button" and Inspect. The first is a `<button>`, the second is `<a href="...">`, the third is `<span role="button" tabindex="0">`. Same visual, different elements.
2. Try Tab-navigating. All three receive focus because they all have appropriate focusability (native for button/a, `tabindex` for span).
3. Check the Network tab — click the `<a>` version and watch a navigation request. Click the `<button>` version — no navigation, just a click handler.
4. In DevTools, look at the scoped classes. All three share the same `.btn.svelte-xxxx` class, proving they come from the same style block.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why would you use a polymorphic component instead of creating separate components for each element (ButtonLink, ButtonAction, ButtonSpan)?</summary>

A polymorphic component maintains styles in a single source. When the design changes (new border-radius, new padding, new color), you update one file. With separate components, you update N files and risk them drifting apart over time. Polymorphism also reduces the API surface — users learn one component instead of N.
</details>

<details>
<summary><strong>Q2.</strong> What accessibility concerns arise when rendering a <code>&lt;Button as="span"&gt;</code>?</summary>

A `<span>` is not natively interactive — it is not focusable, does not respond to Enter/Space keypresses, and screen readers do not announce it as a button. The component must add `role="button"`, `tabindex={0}`, and keyboard event handlers for Enter and Space. Without these, the element is invisible to keyboard and assistive technology users.
</details>

<details>
<summary><strong>Q3.</strong> How does <code>svelte:element</code> differ from conditional rendering (<code>{#if as === 'a'} &lt;a&gt; {:else} &lt;button&gt; {/if}</code>)?</summary>

`svelte:element` produces a single code path that creates the appropriate element dynamically. Conditional rendering creates separate branches in the compiled output for each element, duplicating the children, styles, and event bindings. `svelte:element` is more concise, avoids duplication, and handles N elements without N branches.
</details>

<details>
<summary><strong>Q4.</strong> Why should you constrain the <code>as</code> prop to a specific union type rather than accepting any string?</summary>

Accepting any string means users could write `as="img"` or `as="table"` — elements that make no sense for a Button or Card. A constrained union (`'button' | 'a' | 'span'`) prevents nonsensical usage at compile time, serves as self-documentation for valid options, and enables IDE autocomplete.
</details>

<details>
<summary><strong>Q5.</strong> In a monorepo with shared packages, where should polymorphic components live and why?</summary>

They belong in the lowest-level UI package (e.g., `@org/ui/primitives`) because they are the foundation other components build on. Higher-level compound components (Tabs, Dialog) may use polymorphic primitives internally. Consumer apps import them from the shared package, ensuring consistent rendering across all applications.
</details>

## 6. Common mistakes

- **Forgetting ARIA attributes on non-interactive elements.** When `as="span"` or `as="div"`, native interactivity is lost. You must add `role="button"`, `tabindex={0}`, and keyboard handlers. Without them, keyboard and screen reader users cannot interact with the element.
- **Allowing any string as the `as` prop.** Using `as?: string` provides no guardrails. Users can pass `'script'`, `'style'`, or any invalid element. Constrain to a union of valid elements for the specific component.
- **Spreading all props onto the element without filtering.** If you spread `{...rest}` and a user passes `disabled` when `as="a"`, the DOM receives an invalid attribute. Filter props based on the active element or accept the trade-off and document it.
- **Not handling the `href` requirement for links.** When `as="a"`, an `href` is semantically required. Without it, the element renders as a link that goes nowhere — confusing for users and flagged by accessibility audits. Validate and warn in development mode.

## 7. What's next

Lesson 18.3 takes the separation of concerns further with headless components — UI logic with zero UI. You will build components that expose behavior through snippets and callbacks, letting consumers provide 100% of the rendering.
