---
chunk: component-architecture
title: Component Architecture
module: 3
---

# Component Architecture — Brief

Your capstone's UI sits on top of a small, typed component library. Before you render a single page, you need to decide what goes into `$lib/components/` and how those components talk to each other.

For this chunk, build the **root layout shell** and at least four reusable components the rest of the capstone will compose:

1. `$lib/components/Button.svelte` — typed variants (`primary`, `secondary`, `ghost`), 44 px minimum touch target, `disabled` support, a `children` snippet, and an `onclick` callback prop.
2. `$lib/components/Card.svelte` — a container that accepts a `title` string prop and a `children` snippet for the body, with PE7 surface styling.
3. `$lib/components/Input.svelte` — a typed form field with `label`, `name`, `value` (`$bindable`), `error?`, and `type` props.
4. `$lib/components/PageShell.svelte` — the outer wrapper every route renders inside: header, main, footer, skip link.

The root `+layout.svelte` renders `PageShell` and yields its children snippet.

## Acceptance criteria

- Every component has a TypeScript `Props` interface — no `any`.
- Every component uses `$props()`, `$bindable()`, and snippets (`{#snippet}` / `{@render}`) as appropriate.
- Every component is PE7-tokenised — no raw colors, no raw spacing.
- Lighthouse Accessibility audit passes 100 on the shell.

## How it connects to the capstone

These four components are the building blocks of every later chunk. The dashboard in `tanstack-table-setup` renders inside `Card`. The contact form in `form-remote-validation` uses `Input` and `Button`. The marketing home in `gsap-timeline` uses `Button` for its CTA. If this chunk is shaky, every later chunk wobbles.
