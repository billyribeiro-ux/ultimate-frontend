---
module: 23
lesson: 23.3
title: Component API design
duration: 55 minutes
prerequisites:
  - "23.1 — What a design system is"
  - "3.2 — $props() — passing data into components"
  - "3.3 — TypeScript interfaces for props"
  - "3.6 — Snippets — {#snippet} and {@render}"
learning_objectives:
  - Design component prop interfaces that follow the "pit of success" principle
  - Implement variant systems using union types for constrained API surfaces
  - Apply size scale conventions (sm, md, lg) consistently across components
  - Choose between compound and monolithic component architectures
  - Evaluate component APIs for discoverability, correctness, and composability
status: ready
---

# Lesson 23.3 — Component API design

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Making wrong usage hard

### 1.1 The problem: a component library nobody can use correctly

A team builds a Button component with 14 props: `type`, `kind`, `style`, `theme`, `size`, `width`, `height`, `disabled`, `loading`, `icon`, `iconPosition`, `onClick`, `href`, `target`. Six months later, a codebase audit reveals that 40% of Button usages have invalid prop combinations: `type="submit"` with `href` (which silently renders a link instead of a button), `loading={true}` with `disabled={true}` (redundant and confusing), `icon` without `iconPosition` (defaults to left, but many developers expected right).

The problem is not the developers who used the component incorrectly. The problem is the API that made incorrect usage easy and correct usage unclear.

### 1.2 The pit of success

Scott Meyers coined the term "pit of success" for API design: the API should make the correct usage the easiest, most natural path. Developers should fall into success, not climb toward it.

For component APIs, this means:

- **Use union types to constrain valid values.** `variant: 'primary' | 'secondary' | 'ghost'` prevents typos and invalid combinations. `variant: string` does not.
- **Use fewer props with more precise types** rather than many loosely-typed props. A `variant` prop that controls visual style is better than separate `color`, `borderColor`, `textColor`, and `backgroundColor` props.
- **Make optional props default to the most common case.** If 90% of buttons are medium-sized, make `size` default to `'md'`.
- **Prevent invalid combinations at the type level.** If a component is either a button or a link but not both, use a discriminated union, not two optional props that can conflict.

### 1.3 Prop naming conventions

Consistent naming across all components makes the design system predictable:

- **`variant`** — visual style: `'primary' | 'secondary' | 'ghost' | 'danger'`
- **`size`** — physical size: `'sm' | 'md' | 'lg'`
- **`disabled`** — interaction disabled: `boolean`
- **`loading`** — shows loading state: `boolean`
- **`children`** — the Svelte 5 snippet for the component's content

These names are used in every component. Once a developer learns that "size means sm/md/lg" on Button, they know it means the same on Input, Card, and Modal.

```typescript
interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onclick?: (event: MouseEvent) => void;
    children: Snippet;
}

let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onclick,
    children
}: ButtonProps = $props();
```

### 1.4 Variant systems

A variant system defines the visual styles a component supports. Each variant maps to a set of CSS values:

```css
.button--primary {
    background: var(--color-brand);
    color: oklch(100% 0 0);
}
.button--secondary {
    background: var(--color-surface-2);
    color: var(--color-text);
    border: 1px solid var(--color-border);
}
.button--ghost {
    background: transparent;
    color: var(--color-brand);
}
.button--danger {
    background: var(--color-error);
    color: oklch(100% 0 0);
}
```

The variant is applied via a dynamic class: `class="button button--{variant}"`. This pattern is consistent across all components: a Card has variants (`elevated`, `outlined`, `flat`), a Badge has variants (`info`, `success`, `warning`, `error`).

### 1.5 Size scales

Size scales follow the same convention everywhere. A `sm` button is smaller in padding, font size, and min-height. A `lg` button is larger. The scale maps to tokens:

```css
.button--sm {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-sm);
    min-block-size: 32px;
}
.button--md {
    padding: var(--space-xs) var(--space-md);
    font-size: var(--text-base);
    min-block-size: 40px;
}
.button--lg {
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--text-lg);
    min-block-size: 48px;
}
```

All sizes meet the 44px minimum touch target by adding sufficient padding even when the visual appearance is compact.

### 1.6 Compound vs monolithic components

**Monolithic components** handle everything internally. A `<Select>` component accepts an `options` array as a prop and renders the dropdown, options, search, and multi-select internally. The API is simple for common cases but inflexible for unusual ones.

**Compound components** expose sub-components that compose together:

```svelte
<Tabs>
    <TabList>
        <Tab>Profile</Tab>
        <Tab>Settings</Tab>
    </TabList>
    <TabPanel>Profile content</TabPanel>
    <TabPanel>Settings content</TabPanel>
</Tabs>
```

Compound components give consumers full control over structure and styling while the parent manages shared state (which tab is active). They are more flexible but require more documentation.

The decision: use monolithic for simple, common cases (Button, Input, Badge). Use compound for complex, customizable cases (Tabs, Accordion, Menu).

### 1.7 "In Production" — API design at a design system team

A design system team at a 500-person company tracked component API "support tickets" — questions from product teams about how to use a component. The Input component had 8 tickets per month because it accepted both `label` (as a string prop) and a `label` snippet, and developers were confused about which to use. The Modal component had 12 tickets per month because `onClose` could be either a callback prop or a dispatched event, depending on the version. The team redesigned both APIs: Input always used a snippet for the label (consistent with how they handled content elsewhere), and Modal always used a callback prop (matching the Svelte 5 convention). Support tickets dropped to near zero. The lesson: every ambiguity in the API generates ongoing cost.

### 1.8 The TypeScript angle

Discriminated unions prevent invalid prop combinations:

```typescript
// Instead of two optional props that can conflict:
// href?: string;  // makes it a link
// type?: 'button' | 'submit';  // makes it a button

// Use a discriminated union:
type ButtonProps = {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: Snippet;
} & (
    | { as: 'button'; onclick?: (event: MouseEvent) => void; href?: never }
    | { as: 'link'; href: string; onclick?: never }
);
```

With this type, you cannot have both `onclick` and `href`. TypeScript enforces at compile time that a Button is either a button element with an onclick handler or an anchor element with an href — never both.

### 1.9 Common interview question

**Q: "How do you design a component API that is hard to misuse?"**

**Model answer:** I follow the "pit of success" principle. First, I use union types for constrained values (`variant: 'primary' | 'secondary'` not `variant: string`). Second, I use consistent prop names across all components (variant, size, disabled, loading, children). Third, I set default values for the most common case so simple usage requires minimal props. Fourth, I use discriminated unions to prevent invalid combinations (a component cannot be both a button and a link). Fifth, I limit the number of props — if a component needs more than 8 props, I consider splitting it into compound sub-components. The goal is that TypeScript catches misuse at compile time and the most natural usage is the correct one.

## Deep Dive

**Rest props and the spread pattern.** Design system components should forward unknown props to the underlying HTML element. In Svelte 5, you capture rest props and spread them:

```typescript
let { variant = 'primary', size = 'md', children, ...restProps }: ButtonProps = $props();
```

This allows consumers to add `aria-label`, `data-testid`, `id`, or any other HTML attribute without the component needing to declare them explicitly.

**Controlled vs uncontrolled components.** A controlled component receives its value via a prop and notifies changes via a callback. An uncontrolled component manages its own internal state. For design system components, offer both: accept an optional `value` prop (controlled mode) and manage internal state when the prop is not provided (uncontrolled mode). Svelte 5's `$bindable()` makes this pattern natural.

**The "slots vs props" decision.** In Svelte 5, snippets replace slots. The decision of whether content should be a snippet (flexible, consumer controls rendering) or a prop (simple, component controls rendering) depends on how much customization the consumer needs. A Button's label is a snippet (the consumer might want an icon inside). A Badge's count is a prop (it is always a number, no custom rendering needed).

**Component composition depth.** Design system components should be shallow — ideally one or two levels of nesting. A Button wraps a native `<button>`. A Card wraps a `<div>` with sections. Deep component hierarchies (a Modal that wraps an Overlay that wraps a Portal that wraps a FocusTrap that wraps a Panel) make debugging difficult because errors can originate in any layer.

**Connection to other lessons.** Lesson 3.2 introduced `$props()`. Lesson 3.3 covered TypeScript interfaces for props. Lesson 3.6 introduced snippets. Lesson 18.1 explored compound components in depth. Lesson 23.4 documents these APIs in a live documentation site.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/$props](https://svelte.dev/docs/svelte/$props) — Svelte 5 component props and rest props.
- [svelte.dev/docs/svelte/snippet](https://svelte.dev/docs/svelte/snippet) — Svelte 5 snippets for content projection.
- [react-spectrum.adobe.com/react-aria](https://react-spectrum.adobe.com/react-aria/) — Adobe's design system for API design inspiration (framework-agnostic patterns).

**Advanced pattern: prop polymorphism with generics.** A Table component can be generic over its row type: `Table<T>` accepts `columns: Column<T>[]` and `rows: T[]`. The column definitions reference keys of `T`, so TypeScript enforces that column accessors match the data shape. This is the pattern TanStack Table uses (Lesson 11.7).

**Challenge question (combines Lesson 23.3 + Lesson 3.3 + Lesson 18.1):** Design the prop interface for a `Select` component that supports: single selection, multi-selection, searchable options, grouped options, and custom option rendering. Should this be a monolithic component or compound components? Justify your choice with API examples for each approach.

## 2. Style it — PE7 applied to the API playground

The mini-build is an interactive playground where you configure a Button's props and see the result. The prop controls (dropdowns for variant and size, toggles for disabled and loading) use `var(--color-surface-2)` with `var(--radius-md)`. The preview area has a `var(--color-surface)` background with a dashed `var(--color-border)` outline. The generated code snippet uses monospace font at `var(--text-sm)` on `var(--color-surface-2)` background. Layout stacks on mobile and splits into controls/preview columns at `min-width: 768px`.

## 3. Interact — configuring component props and seeing live results

The problem: API documentation is static — you read about props but do not experience them. The interactive element lets you toggle every Button prop and see both the rendered result and the corresponding Svelte code. A `$derived` generates the Svelte markup string based on the current prop configuration.

```typescript
interface PlaygroundConfig {
    variant: 'primary' | 'secondary' | 'ghost' | 'danger';
    size: 'sm' | 'md' | 'lg';
    disabled: boolean;
    loading: boolean;
    label: string;
}
```

## 4. Mini-build — API playground

**File:** `src/routes/modules/23-design-system/03-component-api-design/+page.svelte`

This page renders an interactive component API playground. The student configures Button props using form controls and sees the resulting component rendered live alongside the Svelte code needed to produce it.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/23-design-system/03-component-api-design`.

### Prove the concept

1. Change the variant dropdown and watch the button's visual style update immediately.
2. Toggle "disabled" and observe both the visual change and the generated code adding `disabled`.
3. Toggle "loading" and see the loading spinner appear in the button.
4. In Svelte DevTools, watch `$derived` recalculate the code snippet string whenever a prop changes.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does the "pit of success" mean in the context of component API design?</summary>

The "pit of success" means designing the API so that the correct, intended usage is the easiest and most natural path. Developers should fall into correct usage without effort. This is achieved through constrained types (union types instead of strings), sensible defaults, consistent naming conventions, and type-level prevention of invalid combinations.
</details>

<details>
<summary><strong>Q2.</strong> Why use a union type for `variant` instead of a plain string?</summary>

A union type (`'primary' | 'secondary' | 'ghost'`) constrains values to valid options. TypeScript catches typos and invalid values at compile time — `variant="prinary"` is an error. A plain string accepts anything, including values that produce no visual result or unexpected behavior. Union types make the API self-documenting: the type itself lists all valid options.
</details>

<details>
<summary><strong>Q3.</strong> When should you use compound components instead of a monolithic component?</summary>

Use compound components when consumers need significant control over the component's structure, order, and content — like Tabs, Accordion, or Menu, where the consumer defines the number, order, and content of each section. Use monolithic components for simple, consistent UI elements like Button, Badge, or Avatar where the structure is fixed and customization is limited to variant and size.
</details>

<details>
<summary><strong>Q4.</strong> How does a discriminated union prevent invalid prop combinations?</summary>

A discriminated union uses a shared property (like `as: 'button' | 'link'`) to determine which set of props is valid. When `as` is `'button'`, only button-specific props (like `onclick`) are allowed and link-specific props (like `href`) are typed as `never`. TypeScript enforces at compile time that you cannot mix props from different variants.
</details>

<details>
<summary><strong>Q5.</strong> Why should design system components forward rest props to the underlying HTML element?</summary>

Consumers need to add HTML attributes that the component does not explicitly declare — `aria-label` for accessibility, `data-testid` for testing, `id` for linking, `class` for one-off style overrides. Forwarding rest props via the spread pattern (`{...restProps}`) allows this without the component needing to anticipate every possible HTML attribute.
</details>

## 6. Common mistakes

- **Using `string` instead of union types for constrained props.** `variant: string` accepts `"prinary"`, `"bluee"`, and `""`. `variant: 'primary' | 'secondary'` catches these at compile time.
- **Having too many props.** If a component has more than 8-10 props, the API surface is too large. Consider splitting into compound sub-components or using a configuration object pattern for advanced options.
- **Inconsistent prop names across components.** If Button uses `kind` for its visual style and Card uses `type`, developers must memorize component-specific vocabulary. Use `variant` everywhere for visual style and `size` everywhere for dimensions.
- **Not providing default values.** If the most common usage is a primary, medium button, then `<Button>Click</Button>` should render a primary medium button without requiring `variant="primary" size="md"`. Defaults reduce boilerplate for the 80% case.

## 7. What's next

Lesson 23.4 builds a documentation site that renders live components alongside their source code — making the API playground from this lesson into a permanent reference.
