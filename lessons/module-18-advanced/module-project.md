# Module 18 — Advanced Patterns & Architecture — Module Project

## Project: Design System Monorepo

Build a multi-package monorepo with a shared component library (compound components, polymorphic rendering, headless patterns), a documentation site, and a consumer application — all sharing PE7 tokens and strict TypeScript types across package boundaries.

This project synthesizes every pattern from Module 18 into a production-scale architecture that teams of 5-50 engineers use daily.

## Learning objectives

By the end of this project you can:

- Architect a pnpm workspace monorepo with shared packages and independent apps
- Build compound components (Tabs, Accordion) with typed Svelte context
- Create polymorphic `<As>` components that preserve type safety across element variants
- Implement headless components that separate behavior from presentation entirely
- Model complex UI flows as explicit state machines preventing impossible states
- Write custom Svelte preprocessors and Vite plugins for build-time code generation
- Apply advanced TypeScript patterns (conditional types, generics, branded types) to Svelte components
- Profile performance with Chrome DevTools and apply surgical optimizations
- Configure Turborepo for incremental builds and CI/CD pipelines

## Architecture

```
design-system-monorepo/
├── packages/
│   ├── ui/                    # @org/ui — shared component library
│   │   ├── src/
│   │   │   ├── compound/      # Tabs, Accordion, Dialog
│   │   │   ├── polymorphic/   # As, Button, Link
│   │   │   ├── headless/      # Listbox, Combobox, Toggle
│   │   │   └── machines/      # State machine helpers
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── tokens/                # @org/tokens — PE7 design tokens
│   │   ├── src/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── config/                # @org/config — shared TS/ESLint/Svelte config
│       ├── tsconfig.base.json
│       ├── svelte.config.js
│       └── package.json
├── apps/
│   ├── docs/                  # Documentation site (SvelteKit)
│   │   ├── src/routes/
│   │   └── package.json
│   └── consumer/              # Consumer app (SvelteKit)
│       ├── src/routes/
│       └── package.json
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Required features

1. **pnpm workspace configuration.** A `pnpm-workspace.yaml` that declares `packages/` and `apps/` directories. Each package has its own `package.json` with proper `name`, `exports`, and `types` fields.

2. **Shared tokens package (`@org/tokens`).** Exports PE7 design tokens as TypeScript constants and a CSS custom properties file. Colors are OKLCH exclusively. Spacing, typography, radii, shadows, and motion tokens match the course PE7 system.

3. **Component library (`@org/ui`).** Contains:
   - **Compound components:** `Tabs`, `Tab`, `TabPanel` using typed `setContext`/`getContext`. `Accordion`, `AccordionItem` with multi-open support.
   - **Polymorphic component:** `As` that renders as any valid HTML element via `svelte:element`, with TypeScript constraints ensuring `href` is only available when `as="a"`.
   - **Headless components:** `HeadlessListbox` that exposes state and actions via snippets with zero UI. `HeadlessToggle` for boolean state. Each accepts a render snippet.
   - **State machine helper:** A `.svelte.ts` module exporting `createMachine` with typed states, events, and transitions.

4. **Documentation site (`apps/docs`).** A SvelteKit app that imports from `@org/ui` and `@org/tokens`. Each component has a documentation page with:
   - Props table (auto-generated from TypeScript interfaces)
   - Live interactive example
   - Code snippet
   - Accessibility notes

5. **Consumer app (`apps/consumer`).** A SvelteKit app demonstrating real-world usage of the design system: a multi-step form (state machine), a settings page (tabs + accordion), and a searchable list (headless listbox).

6. **Turborepo configuration.** A `turbo.json` with:
   - `build` pipeline with proper dependency ordering
   - `dev` pipeline for parallel development
   - `check` pipeline for type-checking
   - `lint` pipeline for ESLint
   - Remote caching configuration (local for this project)

7. **Custom preprocessor.** A Svelte preprocessor in `packages/config` that auto-imports the token CSS file into every component that uses `var(--color-*)` or `var(--space-*)` tokens.

8. **Vite plugin for route manifest.** A Vite plugin in `packages/config` that generates a typed route manifest (`virtual:routes`) from the filesystem, available to both apps.

9. **Advanced TypeScript patterns.** The component library uses:
   - Conditional types: `href` required only when `as="a"`
   - Generic components: `HeadlessListbox<T>` where T is the option type
   - Branded types: `ComponentId` type that prevents mixing IDs across components
   - Discriminated unions: State machine states with per-state data

10. **Performance budget.** The consumer app must:
    - Ship zero layout shift (CLS = 0)
    - Keep all component renders under 16ms
    - Use `untrack()` in state machine transitions to prevent cascade effects
    - Respect `prefers-reduced-motion` in all animated transitions

## Acceptance criteria

- [ ] `pnpm-workspace.yaml` at root with packages and apps
- [ ] `pnpm install` resolves all workspace dependencies
- [ ] `pnpm -r build` succeeds with zero TypeScript errors
- [ ] `@org/ui` exports compound, polymorphic, headless, and machine patterns
- [ ] `@org/tokens` exports PE7-compliant tokens as TS constants and CSS
- [ ] Documentation site renders component pages with live examples
- [ ] Consumer app demonstrates all four patterns in realistic scenarios
- [ ] Turborepo caches builds correctly (second run is near-instant)
- [ ] No `any` types anywhere in the monorepo
- [ ] All colors are OKLCH via tokens, all spacing via token variables
- [ ] Every interactive element has 44px minimum touch targets
- [ ] `prefers-reduced-motion` respected in every animated component
- [ ] Custom preprocessor auto-imports tokens where needed
- [ ] Vite plugin generates typed virtual module
- [ ] Chrome DevTools Performance audit shows no frames > 16ms
