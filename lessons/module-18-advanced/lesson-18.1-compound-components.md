---
module: 18
lesson: 18.1
title: Compound components
duration: 60 minutes
prerequisites:
  - "11.2 — Svelte context API (setContext / getContext)"
  - "3.6 — Snippets ({#snippet} and {@render})"
  - "3.8 — Component composition patterns"
  - "TypeScript interfaces and generics"
learning_objectives:
  - Explain the compound component pattern and articulate why it solves the prop-drilling problem for complex multi-part UI
  - Implement a Tabs compound component family (Tabs + Tab + TabPanel) using typed Svelte context
  - Build an Accordion compound component that supports single and multiple open items
  - Use discriminated unions in context interfaces to enforce valid component relationships
  - Design APIs where the parent coordinates state while children own their own rendering
status: ready
---

# Lesson 18.1 — Compound components

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The compound component pattern and why it exists

### 1.1 The problem: complex UI with too many props

You are building a tabbed interface. It needs tabs, panels, maybe badges on some tabs, icons on others, disabled states, lazy-loading panels, keyboard navigation. If you build this as a single monolithic component, the prop list explodes. Consider what a naive implementation demands:

```typescript
interface MonolithicTabsProps {
  tabs: Array<{ id: string; label: string; icon?: string; disabled?: boolean; badge?: number }>;
  panels: Array<{ id: string; content: Snippet }>;
  defaultValue?: string;
  orientation?: 'horizontal' | 'vertical';
  onchange?: (id: string) => void;
  lazy?: boolean;
}
```

Six props already, and you have not touched styling, animations, or accessibility. Every new requirement adds another prop. Every prop interacts with every other prop. The component becomes a configuration object that happens to render HTML. Users of your component cannot customize the rendering of individual tabs without yet another prop (`renderTab?: (tab: Tab) => Snippet`). This is the **prop explosion** anti-pattern.

Now imagine you need the same pattern for an Accordion, a Stepper, a Menu, a Disclosure group. Do you copy the same monolithic approach each time? Every copy diverges, every API is different, and maintenance becomes a full-time job.

### 1.2 How compound components solve it

A **compound component** is a set of components that work together to deliver a single piece of UI. Instead of one monolithic component with dozens of props, you split the UI into cooperating parts. The parent owns the shared state; the children read from and write to that state through a shared **context**. Each child is independently composable, styleable, and replaceable.

The user assembles the UI declaratively:

```svelte
<Tabs defaultValue="overview">
  <Tab id="overview">Overview</Tab>
  <Tab id="specs">Specifications</Tab>
  <Tab id="reviews">Reviews</Tab>

  <TabPanel id="overview">
    <p>Product overview content here.</p>
  </TabPanel>
  <TabPanel id="specs">
    <SpecsTable {product} />
  </TabPanel>
  <TabPanel id="reviews">
    <ReviewList {reviews} />
  </TabPanel>
</Tabs>
```

This is radically different from passing arrays of configuration objects. Each `<Tab>` is a real Svelte component. It can contain anything — text, icons, badges, other components. The user controls the markup. The `Tabs` parent coordinates which tab is active. The `TabPanel` shows or hides based on the shared state.

### 1.3 The mechanism: typed Svelte context

Svelte's context API (`setContext` and `getContext`) is the backbone. The parent component calls `setContext` with a key and a value — typically an object containing reactive state and mutation functions. Every child anywhere in the subtree calls `getContext` with the same key and receives that shared state.

In Svelte 5 with runes, context values are reactive when you expose getters backed by `$state` or `$derived`. This is the critical insight: you do not pass raw `$state` variables (those lose reactivity when extracted). You pass an object with **getter properties**:

```typescript
setContext('tabs', {
  get activeTab() { return activeTab; },
  setActiveTab,
  isActive
});
```

When `activeTab` (a `$state` variable) changes, any child that reads `ctx.activeTab` re-renders because the getter dereferences the reactive signal at read time.

### 1.4 Why typed context matters

Without types, context is a footgun. Any component anywhere in the tree can call `getContext('tabs')` and get back `unknown`. The type system cannot help you if you misspell a method name or pass the wrong argument.

Define explicit context interfaces:

```typescript
interface TabContext {
  readonly activeTab: string;
  setActiveTab: (id: string) => void;
  isActive: (id: string) => boolean;
}
```

Then consume with: `const ctx = getContext<TabContext>('tabs');`. Now every access is type-checked. If `TabContext` changes its API, TypeScript surfaces every broken consumer at compile time.

### 1.5 Why this beats prop drilling for complex UI

Prop drilling means threading the same data through intermediate components that do not use it. Compound components eliminate drilling entirely because children access state directly through context, no matter how deep they are nested. You can wrap a `<Tab>` inside a decorator component, inside a scroll container, inside a conditional — it still finds its parent `Tabs` context.

This decoupling enables three architectural wins:

1. **Composability.** Users can insert arbitrary markup between tabs and panels. Need a divider? Add a `<hr>`. Need a lazy-loaded panel? Wrap `TabPanel` in a `{#if}` or use `{#await}`.
2. **Encapsulation.** Each child owns its own styles, its own accessibility attributes, its own event handlers. The parent does not dictate rendering.
3. **Extensibility.** Adding a new child (say `<TabBadge>`) requires zero changes to `Tabs`. The badge simply reads context and renders accordingly.

### 1.6 The pattern at scale: real-world design systems

Every mature component library uses compound components. Radix, Headless UI, Ark UI, Melt UI — they all decompose complex widgets into cooperating parts. When you build a design system for a team of 10+ engineers, this pattern is not optional. It is the only way to keep the API surface sane while allowing infinite customization.

The trade-off is discoverability. A monolithic `<Tabs tabs={[...]} />` is easy to find in docs. A compound `<Tabs> + <Tab> + <TabPanel>` requires users to learn which children are valid. You solve this with documentation, TypeScript errors on invalid nesting (using context checks), and exhaustive examples.

### 1.7 Compound vs. render props vs. slot forwarding

In older Svelte (v3/v4), developers used slots for composition. Slots are gone in Svelte 5 — replaced by **snippets**. Snippets are more powerful but serve a different purpose: they pass render templates as props. Compound components use snippets for the `children` prop (what used to be the default slot), but the coordination happens through context, not through snippet arguments.

Render props (passing a snippet that receives state) are the headless pattern — covered in Lesson 18.3. Compound components give children their own identity as components with their own `<script>`, styles, and lifecycle. Choose compound components when children have distinct behavior; choose headless/render-prop when you want maximum render flexibility with minimal component overhead.

### 1.8 When the May 2026 version changed things

Svelte 5.55+ made compound components significantly cleaner. The `$props()` rune replaced `export let`, making prop interfaces explicit. Snippets replaced slots, giving compound children full TypeScript support for their `children` prop. Reactive getters in context objects replaced the store-based workarounds that Svelte 4 required. The result: compound components in Svelte 5 are simpler to write, fully type-safe, and perform better than any previous version.

## Deep Dive

**Scale implications.** In a 200-component design system serving 15 product teams, compound components reduce the API surface by 40-60% compared to monolithic prop-driven alternatives. At Vercel, the internal component library evolved from monolithic to compound when the prop count on their `<Table>` hit 38. After refactoring to `<Table> + <TableHead> + <TableRow> + <TableCell>`, the prop count per component dropped to 3-5, and adoption increased because engineers could understand individual pieces without reading 200 lines of documentation.

**Mental model.** Think of compound components as a **conversation**. The parent says "I am a tabbed interface, and here is how to ask who is active." Each child says "I am a tab, and I will ask the parent if I am active, and tell the parent when I am clicked." The protocol is the context interface. As long as both sides honor the protocol, they can evolve independently. This is the same principle behind network protocols, plugin architectures, and dependency injection — define a contract, let implementations vary.

**Edge cases.** What happens when a child is rendered outside its parent's subtree? `getContext` returns `undefined`, and your component throws at runtime unless you guard with a check: `if (!ctx) throw new Error('Tab must be used inside Tabs')`. This runtime validation is essential for developer experience — it surfaces misuse immediately with a clear message instead of silent failure. Consider wrapping `getContext` in a helper that includes the error: `function useTabContext(): TabContext { const ctx = getContext<TabContext>('tabs'); if (!ctx) throw new Error('...'); return ctx; }`.

**Performance.** Context lookups in Svelte are O(1) hashmap reads. There is no performance penalty for deep nesting. However, reactive getters trigger re-renders in every child that reads them. If your `Tabs` has 100 children and `activeTab` changes, all 100 children re-evaluate their `$derived(ctx.isActive(id))` expression. For most UIs this is negligible (boolean comparisons are nanoseconds), but for extreme cases (virtualized lists inside compound components), consider splitting context into stable references (functions) and volatile state (signals), or using `$derived` to short-circuit unchanged children.

**Cross-module connections.** This pattern builds directly on Module 11's context API (11.2) and Module 3's composition patterns (3.8). It feeds into Lesson 18.3 (headless components) where you strip away all rendering and expose only the coordination logic. It also connects to Lesson 18.8 (advanced TypeScript) where you make the context interface generic over the item type, enabling `<Tabs<Route>>` where each tab ID is a type-safe route string.

## 2. Style it — PE7 applied to the Tabs and Accordion

The compound components use PE7 tokens exclusively. The `Tabs` wrapper uses `var(--color-surface-2)` for the tab bar background and `var(--color-brand)` for the active indicator. Individual `Tab` buttons use `var(--space-sm)` and `var(--space-md)` for padding, with `min-block-size: 44px` for touch targets.

The Accordion uses `var(--color-border)` for item dividers, `var(--radius-lg)` for the outer container, and the trigger buttons get `var(--dur-fast)` with `var(--ease-out)` for hover transitions. The expand/collapse icon rotation uses `transform` with a `prefers-reduced-motion` guard that disables the transition entirely.

All colors come from tokens — no raw OKLCH anywhere in component styles. The scoped `<style>` blocks use BEM-style class names (`.tab`, `.tab--active`, `.accordion-item__trigger`) that Svelte hashes at compile time. Mobile-first: base styles work on 320px screens, no media queries needed for these components because they are inherently flexible.

## 3. Interact — Building a typed coordination layer with context

The problem: you want a `<Tabs>` component where clicking any tab updates all sibling panels — but the tabs and panels might be separated by arbitrary markup (headers, dividers, wrappers). You cannot use prop drilling because you do not control the intermediate structure.

Here is the mistake that reveals why context is necessary:

```svelte
<!-- BROKEN: Trying to coordinate without context -->
<script lang="ts">
  let active: string = $state('tab1');
</script>

<div class="tabs-wrapper">
  <SomeLayoutComponent>
    <!-- These buttons can't access `active` without prop drilling -->
    <Tab id="tab1" {active} onactivate={(id) => active = id}>One</Tab>
    <Tab id="tab2" {active} onactivate={(id) => active = id}>Two</Tab>
  </SomeLayoutComponent>

  <AnotherWrapper>
    <TabPanel id="tab1" {active}>Content 1</TabPanel>
    <TabPanel id="tab2" {active}>Content 2</TabPanel>
  </AnotherWrapper>
</div>
```

Every intermediate component must forward `active` and `onactivate`. If `SomeLayoutComponent` does not know about tabs (it is a generic grid layout), you are stuck.

The fix: move the state into context. The parent `Tabs` calls `setContext`. Children call `getContext`. No intermediate component needs to know or care:

```typescript
// In Tabs.svelte
setContext('tabs', {
  get activeTab() { return activeTab; },
  setActiveTab,
  isActive
});

// In Tab.svelte
const ctx = getContext<TabContext>('tabs');
let active: boolean = $derived(ctx.isActive(id));
```

Now any nesting depth works. The coordination is invisible to the tree structure.

## 4. Mini-build — A complete compound Tabs + Accordion demo

**File:** `src/routes/modules/18-advanced/01-compound-components/+page.svelte`

This page demonstrates both compound component families — Tabs and Accordion — using the shared library components from `$lib/components/advanced/`.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/18-advanced/01-compound-components`.

You will see a tabbed interface at the top with three tabs (Overview, Features, Code), and below it an Accordion with three expandable items. Clicking tabs switches panels. Clicking accordion triggers expands/collapses content. Keyboard navigation works: arrow keys move between tabs, Enter/Space toggle accordion items.

### Prove the compound pattern works

1. Open DevTools and inspect the DOM. Notice that `<Tab>` buttons and `<TabPanel>` divs are siblings — there is no wrapper component threading state between them.
2. Look at the `aria-selected` attribute on tab buttons. It updates reactively when you click a different tab — proof that context is reactive.
3. Inspect the Accordion. Each `AccordionItem` has `aria-expanded` that toggles independently — proof that the parent coordinates but each child owns its own DOM.
4. In the Svelte DevTools extension, look at the component tree. You will see `Tabs > Tab, Tab, Tab, TabPanel, TabPanel, TabPanel` — flat children, no prop threading.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is a compound component preferable to a single component with an array prop like <code>tabs={[{ id, label, content }]}</code>?</summary>

A compound component gives each child its own component identity — its own script, styles, lifecycle, and arbitrary children. An array prop forces all customization through configuration objects, making it impossible to insert arbitrary markup (icons, badges, other components) without adding ever more prop options. Compound components invert control: the user owns the rendering, the parent owns the coordination.
</details>

<details>
<summary><strong>Q2.</strong> What happens if you render a <code>&lt;Tab&gt;</code> outside of a <code>&lt;Tabs&gt;</code> parent? How should you handle this?</summary>

`getContext('tabs')` returns `undefined` because no ancestor called `setContext` with that key. The component should guard against this with an explicit check: `if (!ctx) throw new Error('Tab must be used inside a Tabs component')`. This provides a clear error message instead of a cryptic `Cannot read property of undefined` at runtime.
</details>

<details>
<summary><strong>Q3.</strong> Why do we use getter properties (like <code>get activeTab() { return activeTab; }</code>) in the context object instead of passing the <code>$state</code> variable directly?</summary>

Passing a `$state` variable directly would pass its current value at the time `setContext` is called — a static snapshot. Getter properties create a live binding: every time a consumer reads `ctx.activeTab`, the getter dereferences the reactive `$state` signal, triggering Svelte's dependency tracking and ensuring the consumer re-renders when the value changes.
</details>

<details>
<summary><strong>Q4.</strong> How would you add a "disabled" state to individual <code>&lt;Tab&gt;</code> components without modifying the <code>&lt;Tabs&gt;</code> parent at all?</summary>

Add a `disabled` prop to the `Tab` component. In its click handler, check `if (disabled) return` before calling `ctx.setActiveTab(id)`. Add `aria-disabled={disabled}` to the button and style it with reduced opacity. The parent `Tabs` never needs to know — each `Tab` manages its own disabled state independently.
</details>

<details>
<summary><strong>Q5.</strong> What is the performance implication of 50 <code>&lt;Tab&gt;</code> components all reading <code>ctx.activeTab</code>, and how would you mitigate it if it became a bottleneck?</summary>

When `activeTab` changes, all 50 components re-evaluate their `$derived(ctx.isActive(id))`. Each evaluation is a simple string comparison (nanoseconds), so 50 is negligible. If profiling revealed a real bottleneck (hundreds of children with expensive derived computations), you could split context into a stable-function context (methods that never change) and a volatile-state context (signals), or use a Map-based approach where each child subscribes only to its own `isActive` signal.
</details>

## 6. Common mistakes

- **Passing `$state` directly in context instead of using getters.** `setContext('tabs', { activeTab })` captures the value once. Children never see updates. Always use `get activeTab() { return activeTab; }` to maintain reactivity.
- **Forgetting to validate context in children.** If a `<Tab>` is accidentally rendered outside `<Tabs>`, `getContext` returns `undefined`. Without a guard, you get `TypeError: Cannot read properties of undefined (reading 'isActive')` — cryptic for the user. Always check and throw a descriptive error.
- **Using a string literal as the context key.** If two compound component families both use `'context'` as their key, they collide. Use unique, descriptive keys like `'tabs'` and `'accordion'`, or better yet, use `Symbol()` keys for guaranteed uniqueness in libraries.
- **Mutating context objects directly.** If a child does `ctx.activeTab = 'new'`, it bypasses the parent's state management. Make context properties `readonly` in the interface and provide explicit setter functions.

## 7. What's next

Lesson 18.2 introduces polymorphic components — a pattern where a single component renders as different HTML elements while preserving type safety, enabling you to build design-system primitives like `<Button>` that can also be `<a>` or `<span>`.
