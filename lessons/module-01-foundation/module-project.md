# Module 1 — The Foundation — Module Project

## Project: Personal Portfolio Card

Build a single, production-quality portfolio card that introduces you — your name, role, a short bio, a list of skills, and a few links. Everything you have learned in Module 1 is expected to appear in this card: typed constants, an interface, template expressions, scoped PE7 styling, mobile-first responsiveness, and a per-page colour personality.

This is the first deliverable of the course. You will reuse and extend it in later modules as you learn reactivity, props, routing, and deployment.

## Learning objectives

By the end of this project you can:

- Set up a new SvelteKit 2 project from scratch and run it locally
- Declare a typed, strict-mode TypeScript data model for your own information
- Build a mobile-first, fluid-typography card styled exclusively with PE7 tokens
- Scope your styles and demonstrate you understand CSS hash scoping
- Add a per-page colour personality by overriding a single token
- Pass Lighthouse mobile audit with 100 on Accessibility

## Required features

1. **Typed profile data.** Declare a `Profile` interface with fields: `name: string`, `headline: string`, `bio: string`, `skills: Skill[]`, `links: Link[]`. `Skill` is `{ name: string; level: 'beginner' | 'intermediate' | 'advanced' }`. `Link` is `{ label: string; href: string; kind: 'email' | 'site' | 'social' }`.
2. **A single `+page.svelte` route** at `src/routes/modules/01-foundation/project/+page.svelte`.
3. **Hero section** with the name as an `<h1>` using `var(--text-hero)`, the headline below it, and a short bio paragraph constrained to `var(--prose-max)`.
4. **Skills grid.** An iterable `{#each}` block (you may forward-reference Module 4's `{#each}` for this once) rendering each skill as a chip. Each chip uses a `class:` binding for its level (`.chip--beginner`, `.chip--intermediate`, `.chip--advanced`).
5. **Links list.** A list of the profile's links, each an `<a>` with proper `href`. The `kind` drives a `style:--link-hue` custom property for visual differentiation.
6. **Per-page colour personality.** Override `--color-brand` on the top-level `section` scoped selector to your chosen OKLCH hue.
7. **Mobile-first layout.** Base styles are mobile. One `min-width: 768px` media query upgrades the layout to two columns on desktop (hero on the left, skills/links on the right).
8. **Reduced motion.** Any hover transition must collapse under `@media (prefers-reduced-motion: reduce)`.
9. **Accessibility.** Every interactive element has a minimum 44×44 touch target. Every link that leaves the site uses `rel="noopener"`.

## Acceptance criteria

- [ ] File at `src/routes/modules/01-foundation/project/+page.svelte`
- [ ] `<script lang="ts">` with a `Profile` interface and a typed `profile: Profile` constant
- [ ] No `any` types, no `export let`, no `on:click`, no raw hex/rgb/hsl
- [ ] Every colour value references a PE7 token or a scoped custom property
- [ ] Lighthouse mobile accessibility score: 100
- [ ] No unused-selector warnings from the Svelte compiler
- [ ] DevTools shows the hash suffix on every scoped class

## Suggested timeline

- **45 min.** Design the `Profile` interface and fill in your own data.
- **45 min.** Build the hero section and skills grid with PE7 tokens.
- **30 min.** Add the links list and per-page colour personality.
- **20 min.** Lighthouse audit and accessibility fixes.
- **10 min.** Read your own code once more, delete dead code, format.

## Stretch goals

- Add a small "now" section with your current focus (typed as a separate constant).
- Generate an `og:image` meta tag in `<svelte:head>` so the card previews well on social media.
- Use `{@const}` inside an `{#each}` to compute each skill's badge colour once per iteration.

## Deliverable

Commit the route plus any supporting `src/lib/types.ts` if you factored the interfaces out. In later modules you will extend this card with interactivity (Module 2), componentisation (Module 3), routing (Module 8), and deployment (Module 12).
