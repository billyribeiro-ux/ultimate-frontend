# Module 3 Project — UI Component Library Part 1

## Brief

Assemble the primitives you built across Module 3 into a small, typed, themeable UI component library with a live demo route. The goal is not a finished design system — it is proof that you can apply every technique from the module to one coherent codebase.

This library continues in Module 6 (animations), Module 7 (GSAP), and Module 11 (context). By the end of the course it becomes your personal component kit.

## Required components

Every component lives in `src/lib/components/` with a capital-letter file name.

| Component          | Introduced in | Required features                                                                 |
| ------------------ | ------------- | --------------------------------------------------------------------------------- |
| `Button.svelte`    | 3.2 → 3.8     | `variant`, `size`, extends `HTMLButtonAttributes`, `...rest` spread, knob vars    |
| `Badge.svelte`     | 3.3           | string-literal union `tone` prop, `Snippet` children                              |
| `Avatar.svelte`    | 3.4           | required `name`, optional `src`, optional `size`, initials fallback               |
| `Input.svelte`     | 3.5           | `value = $bindable()`, label, id, focus ring                                      |
| `Modal.svelte`     | 3.5 / 3.7     | `open = $bindable()`, native `<dialog>`, optional `footer` snippet                |
| `Card.svelte`      | 3.6 / 3.7     | `header?`, `children`, `footer?` as `Snippet` props                               |
| `List.svelte`      | 3.7           | generic `List<T>`, `item: Snippet<[T, number]>`                                   |
| `MediaCard.svelte` | 3.10          | `container-type: inline-size`, `@container` queries for three widths              |

## Required behaviour

- **TypeScript strict, zero `any`.** Every file has `lang="ts"`. Every prop has an explicit type. Every event-handler parameter has an explicit type.
- **Svelte 5 runes only.** `$props`, `$state`, `$derived`, `$effect`, `$bindable`. No `export let`. No `createEventDispatcher`. No `on:click` — only lowercase `onclick`.
- **Snippets, never slots.** `<slot>` is forbidden. Use `{#snippet}` + `{@render}`.
- **CSS custom properties as the bridge.** Every component exposes at least one knob (`--btn-bg`, `--card-bg`, `--avatar-size`, …). The demo route retunes knobs on wrappers to prove external theming works without touching any component file.
- **Mobile-first PE7.** 44 px touch targets, `min-width` media queries only, `prefers-reduced-motion` respected.

## Required demo route

Create `src/routes/modules/03-components/project/+page.svelte` showcasing every component at least once:

1. A **header** with an `Avatar` + page `Badge`.
2. A **toolbar** composed from `Button` (at least two variants) inside a `Toolbar`.
3. A **form card** using `Card` with `header` and `footer` snippets, containing two `Input`s and a submit `Button`.
4. A **list section** using `List<Product>` with a product snippet.
5. A **modal** triggered from the toolbar with `bind:open`.
6. A **responsive section** with at least two `MediaCard` instances placed in differently-sized columns to prove the container queries respond independently.
7. At least two **custom variant zones** that retune `--btn-bg` or `--card-bg` via CSS custom properties.

The route must set a per-page `--color-brand` on its root `<section>` so the whole demo has a unique colour personality.

## Acceptance criteria

- [ ] Every file in `src/lib/components/` from the table above exists and compiles under strict TypeScript.
- [ ] `svelte-autofixer` reports zero issues for every component and the demo route.
- [ ] Every component uses a `Props` interface attached to `$props()` with `let { … }: Props = $props()`.
- [ ] `Button` extends `HTMLButtonAttributes` and forwards `...rest`.
- [ ] At least one component uses `generics="T"` for a typed `Snippet<[T, number]>`.
- [ ] At least one component uses `container-type: inline-size` and at least one `@container` query.
- [ ] No hex colours, no raw OKLCH, no inline `style` attributes except for custom-property values via `style:--var={expr}`.
- [ ] Every animation respects `@media (prefers-reduced-motion: reduce)`.
- [ ] The demo route renders cleanly at 320 px, 768 px, and 1280 px with no overflow and all tap targets ≥ 44 px.

## Stretch goals

- Publish the library to a local `$lib/index.ts` barrel so consumers can `import { Button, Card, List } from '$lib'`.
- Add a `<ThemeSwitcher>` `Toolbar` that toggles the page's `--color-brand` hue live.
- Add a `Dropdown` or `Tabs` component using the snippet-as-props pattern from 3.7.

## Connection to later modules

- Module 6 adds Svelte transitions (`transition:fade`, `transition:fly`) to `Modal` and `Card`.
- Module 7 adds GSAP-driven micro-animations to `Button` hover states.
- Module 11 adds a `ThemeProvider` via `setContext` / `getContext` so knobs can be re-themed from a root.
- Module 12 adds tests (Vitest + Playwright) for every component in the library.
