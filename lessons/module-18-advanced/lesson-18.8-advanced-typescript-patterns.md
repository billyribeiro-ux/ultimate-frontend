---
module: 18
lesson: 18.8
title: Advanced TypeScript patterns in Svelte
duration: 65 minutes
prerequisites:
  - "1.8 — TypeScript interfaces"
  - "3.3 — TypeScript interfaces for props"
  - "18.2 — Polymorphic components"
  - "TypeScript generics, conditional types, and template literal types"
learning_objectives:
  - Implement conditional types that make props required based on other prop values
  - Build generic Svelte components using the generics attribute for type-safe collections
  - Create branded types that prevent mixing IDs across different component contexts
  - Design a type-safe event bus using mapped types and string literal inference
  - Apply discriminated unions to component prop variants for exhaustive type narrowing
status: ready
---

# Lesson 18.8 — Advanced TypeScript patterns in Svelte

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — TypeScript as a design tool for component APIs

### 1.1 The problem: APIs that allow invalid usage at the type level

You have a `Button` component with a `variant` prop. When `variant` is `'link'`, an `href` prop is required — but when `variant` is `'button'`, `href` should not be provided. A flat interface cannot express this:

```typescript
interface ButtonProps {
  variant: 'button' | 'link' | 'ghost';
  href?: string; // Optional always — but should be required when variant='link'
}
```

This allows `<Button variant="link" />` (no href — a broken link) and `<Button variant="button" href="/oops" />` (href on a button — confusing). TypeScript sees both as valid. The bugs hide until runtime.

### 1.2 Conditional types: prop dependencies

TypeScript's conditional types express "if X then Y" relationships:

```typescript
type ButtonProps =
  | { variant: 'link'; href: string; target?: string }
  | { variant: 'button'; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }
  | { variant: 'ghost'; onclick: () => void };
```

This is a **discriminated union on props**. When `variant` is `'link'`, `href` is required and `disabled` is not available. When `variant` is `'button'`, `href` is not available but `disabled` is. TypeScript narrows the type based on the discriminant.

In Svelte 5, you model this with `$props()` and a union type:

```svelte
<script lang="ts">
  type Props =
    | { variant: 'link'; href: string; target?: string; children: Snippet }
    | { variant: 'button'; disabled?: boolean; onclick?: () => void; children: Snippet }
    | { variant: 'ghost'; onclick: () => void; children: Snippet };

  let props: Props = $props();
</script>
```

Now `<Button variant="link">` without `href` is a compile error. The type system prevents the bug before the code ever runs.

### 1.3 Generic components: type-safe collections

Svelte 5 supports generic components via the `generics` attribute on the script tag:

```svelte
<script lang="ts" generics="T extends { id: string }">
  import type { Snippet } from 'svelte';

  interface ListProps<T> {
    items: T[];
    renderItem: Snippet<[T]>;
    keyFn?: (item: T) => string;
  }

  let { items, renderItem, keyFn = (item) => item.id }: ListProps<T> = $props();
</script>

{#each items as item (keyFn(item))}
  {@render renderItem(item)}
{/each}
```

The generic `T` flows through: the consumer passes `items: User[]` and the `renderItem` snippet parameter is automatically typed as `User`. No manual type annotations needed at the usage site:

```svelte
<List items={users}>
  {#snippet renderItem(user)}
    <!-- 'user' is typed as User automatically -->
    <p>{user.name} — {user.email}</p>
  {/snippet}
</List>
```

### 1.4 Branded types: preventing ID mixups

In a design system with Tabs, Accordion, and Listbox — all using string IDs — it is easy to accidentally pass a Tab ID where an Accordion ID is expected. Both are `string` at the type level, so TypeScript cannot help.

**Branded types** add a phantom property that distinguishes otherwise identical types:

```typescript
type TabId = string & { readonly __brand: 'TabId' };
type AccordionId = string & { readonly __brand: 'AccordionId' };
type ListboxValue = string & { readonly __brand: 'ListboxValue' };

function createTabId(id: string): TabId {
  return id as TabId;
}
```

Now `setActiveTab(accordionId)` is a type error — the brands do not match even though both are strings at runtime. This is a zero-cost abstraction: the brand exists only in TypeScript's type system and disappears completely at runtime.

### 1.5 Type-safe event bus

For cross-component or cross-module communication, a typed event bus prevents payload mismatches:

```typescript
type EventMap = {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'cart:update': { items: CartItem[]; total: number };
  'theme:change': { mode: 'light' | 'dark' };
};

class TypedEventBus {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): () => void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(handler);
    this.listeners.set(event, set);
    return () => set.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.listeners.get(event)?.forEach(fn => fn(payload));
  }
}
```

The `emit` function enforces the correct payload shape for each event name. `bus.emit('user:login', { items: [] })` is a compile error — `user:login` expects `{ userId, timestamp }`, not `{ items }`.

### 1.6 Template literal types for route safety

TypeScript's template literal types can encode route patterns:

```typescript
type ModuleRoute = `/modules/${number}-${string}/${string}`;

function navigate(to: ModuleRoute): void { /* ... */ }

navigate('/modules/18-advanced/01-compound-components'); // OK
navigate('/random/path'); // Error: not assignable to ModuleRoute
```

Combined with the route manifest from Lesson 18.7, you get compile-time route checking — broken links surface as TypeScript errors during development.

### 1.7 Mapped types for component variants

Design systems often have components with multiple visual variants (size, color, state). Mapped types generate variant classes automatically:

```typescript
type Size = 'sm' | 'md' | 'lg' | 'xl';
type Color = 'brand' | 'success' | 'warning' | 'error';

type SizeClasses = { [K in Size]: string };
type ColorClasses = { [K in Color]: string };

const sizeMap: SizeClasses = {
  sm: 'btn--sm',
  md: 'btn--md',
  lg: 'btn--lg',
  xl: 'btn--xl'
};
```

If you add a new `Size` variant, TypeScript immediately errors on `sizeMap` until you add the corresponding class. Exhaustiveness checking prevents forgotten variants.

### 1.8 The `satisfies` operator for token validation

TypeScript's `satisfies` operator (TS 4.9+) validates that a value matches a type without widening:

```typescript
type TokenName = 'color-brand' | 'color-surface' | 'color-text' | 'space-sm' | 'space-md';

const tokens = {
  'color-brand': 'oklch(65% 0.22 270)',
  'color-surface': 'oklch(98% 0.01 270)',
  'color-text': 'oklch(20% 0.02 270)',
  'space-sm': 'clamp(0.5rem, 2vw, 1rem)',
  'space-md': 'clamp(1rem, 3vw, 1.5rem)',
} satisfies Record<TokenName, string>;
```

If you misspell a token name or forget one, TypeScript catches it. But unlike `as Record<TokenName, string>`, `satisfies` preserves the literal types — `tokens['color-brand']` has type `'oklch(65% 0.22 270)'`, not just `string`.

### 1.9 Utility types for Svelte component inference

Svelte 5 exports utility types for working with component types programmatically:

```typescript
import type { ComponentProps, ComponentEvents } from 'svelte';
import type Button from './Button.svelte';

// Infer the props type of a component
type BtnProps = ComponentProps<typeof Button>;

// Use in tests or wrapper components
function renderButton(props: BtnProps) { /* ... */ }
```

This enables typed wrappers, test utilities, and higher-order components without manually duplicating prop interfaces.

## Deep Dive

**Scale implications.** In a 300-component design system, advanced TypeScript patterns eliminate 80-90% of prop-related bugs that would otherwise reach runtime. At companies like Stripe and Shopify, discriminated union props catch hundreds of invalid usages per quarter — usages that would have been subtle visual bugs (wrong variant, missing href, incompatible prop combinations). The cost is learning curve: engineers need to understand conditional types and generics. The payoff is that the type system becomes an active design reviewer, catching issues that code reviews miss.

**Mental model.** Advanced TypeScript in components is like **writing laws instead of giving advice**. A simple interface says "here are the props you can pass" (advice — you might ignore it). A discriminated union says "when variant is link, href is REQUIRED, period" (law — the compiler enforces it). Branded types say "Tab IDs and Accordion IDs are DIFFERENT things, even though they look the same" (law — mixing them is a crime). The stronger your types, the more impossible states become actually impossible.

**Edge cases.** Svelte's template type checking has limitations. The `generics` attribute works for component-level generics but does not support generic snippets with multiple type parameters in all cases. Complex conditional types may confuse IDE IntelliSense (showing `never` or overly wide types). The pragmatic approach: use discriminated unions for 2-4 variants, flatten to separate components for 5+. Use generics for collection-type components (List, Table, Select) where the item type varies.

**Performance.** TypeScript types have zero runtime cost — they are erased during compilation. Branded types, conditional types, and template literal types do not add a single byte to the JavaScript bundle. They are purely compile-time guardrails. The only "cost" is compilation time, which increases with complex types — but TypeScript's incremental checking keeps this negligible for typical component libraries.

**Cross-module connections.** This lesson deepens the typing introduced in Lessons 18.1-18.3 (typed context, polymorphic constraints, headless snippet parameters). It connects to Lesson 18.7 (typed virtual modules) and the module project (the `@org/ui` package uses all these patterns). It builds on Module 3 (basic prop typing) and Module 11 (typed context).

## 2. Style it — PE7 applied to the type showcase

The mini-build displays a type-driven component showcase. Each pattern is shown in a card with `var(--color-surface-2)` background, `var(--radius-lg)` corners, and `var(--space-lg)` padding. Code examples use monospace font with `var(--color-brand)` highlights for type annotations. The discriminated union Button variants are rendered live — showing how different prop combinations produce different visual outputs, all type-checked.

## 3. Interact — Implementing a discriminated union Button

The problem: a Button component allows `href` regardless of variant. Users pass `href` to non-link buttons, creating dead attributes in the DOM.

The mistake:

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'link';
  href?: string; // Always optional — no enforcement
  children: Snippet;
}
// Usage: <Button variant="primary" href="/oops"> — valid but wrong
```

The fix — discriminated union:

```typescript
type ButtonProps =
  | { variant: 'primary'; disabled?: boolean; onclick?: () => void; children: Snippet }
  | { variant: 'secondary'; disabled?: boolean; onclick?: () => void; children: Snippet }
  | { variant: 'link'; href: string; target?: '_blank' | '_self'; children: Snippet };
```

Now `<Button variant="link">` without href produces: "Property 'href' is missing in type..." at compile time. The bug is impossible.

## 4. Mini-build — A type-safe component showcase

**File:** `src/routes/modules/18-advanced/08-advanced-typescript/+page.svelte`

This page demonstrates discriminated union props, branded types, and generic component usage. A Button component renders differently based on its variant type, with TypeScript enforcing the correct props for each variant.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/18-advanced/08-advanced-typescript`.

You will see three Button variants (Primary, Secondary, Link) with a type debugger showing which props are available for each. Attempting invalid combinations (shown as "would-be errors") displays the TypeScript error that would occur.

### Prove type safety works

1. Look at the "Valid Usages" section — each Button has exactly the props its variant requires. No extra, no missing.
2. Look at the "Type Errors" section — it shows what TypeScript would reject: a link variant without href, a primary variant with href.
3. The generic List component renders User items with full type inference — hover in your IDE to see the inferred type.
4. The branded ID section shows TabId and AccordionId are visually identical strings but TypeScript treats them as incompatible types.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> How does a discriminated union on props prevent invalid prop combinations?</summary>

Each variant in the union specifies exactly which props are available. TypeScript narrows the type based on the discriminant field (e.g., `variant`). When `variant` is `'link'`, only the link variant's props exist — `href` is required, `disabled` is not available. This makes invalid combinations (link without href, button with href) compile errors rather than runtime bugs.
</details>

<details>
<summary><strong>Q2.</strong> What is the purpose of a branded type, and why does it have zero runtime cost?</summary>

A branded type adds a phantom property (`& { readonly __brand: 'X' }`) that distinguishes otherwise identical types at the type level. It prevents mixing IDs across contexts (e.g., TabId vs AccordionId). It has zero runtime cost because the brand property only exists in TypeScript's type system — it is erased during compilation and adds nothing to the JavaScript output.
</details>

<details>
<summary><strong>Q3.</strong> How does the <code>generics</code> attribute on a Svelte script tag enable type-safe generic components?</summary>

The `generics="T extends Constraint"` attribute declares a type parameter for the entire component. Props, snippet parameters, and internal logic can all use `T`. When the component is used, TypeScript infers `T` from the passed props (e.g., `items: User[]` infers `T = User`), and all related types flow through without manual annotation at the usage site.
</details>

<details>
<summary><strong>Q4.</strong> When would you choose <code>satisfies</code> over a type assertion (<code>as</code>)?</summary>

Use `satisfies` when you want to validate a value matches a type while preserving its literal type. `as` widens the type and suppresses errors. `satisfies` catches errors (misspelled keys, missing entries) while keeping the specific literal types for autocomplete and downstream inference. Use `as` only when you genuinely know more than TypeScript (e.g., casting DOM elements after `querySelector`).
</details>

<details>
<summary><strong>Q5.</strong> How does a typed event bus prevent payload shape mismatches across different parts of an application?</summary>

The event bus uses a mapped type (`EventMap`) that associates each event name with a specific payload type. The `emit` and `on` methods are generic over the event name — TypeScript infers the payload type from the event string literal. If you emit `'user:login'` with the wrong payload shape, TypeScript rejects it immediately. This contract spans the entire application without runtime validation.
</details>

## 6. Common mistakes

- **Overcomplicating types.** If a union has 10+ variants or a conditional type has 5+ branches, the IDE IntelliSense becomes unreadable. Split into separate components at that point — each with a simple, focused interface.
- **Using `any` to escape type errors.** When a complex type produces an error, the temptation is `as any`. This silences the error but removes all safety. Instead, narrow the type with a type guard or restructure the API.
- **Forgetting that generics need constraints.** `generics="T"` without `extends` means T can be anything — including `undefined`. Add meaningful constraints: `generics="T extends { id: string }"` ensures T is always an object with an id.
- **Branded types without factory functions.** If users can write `'my-id' as TabId`, the brand is bypassable. Provide factory functions (`createTabId(s)`) and document that direct casting should not be used. The brand is a convention enforced by code review, not a runtime guarantee.

## 7. What's next

Lesson 18.9 dives into performance profiling and optimization — using Chrome DevTools flame charts to identify layout thrash, applying `untrack()` surgically to prevent unnecessary re-renders, and knowing when web workers are the right tool.
