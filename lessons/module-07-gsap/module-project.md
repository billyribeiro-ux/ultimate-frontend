# Module 7 — GSAP & Threlte — Module Project

## Premium Marketing Page

**Goal:** ship a full-page GSAP-powered marketing experience that exercises
every technique from Module 7. This is the project that proves you can drive
timelines, scroll, stagger, actions, and a 3D hero from one coherent codebase
without leaking a single tween.

## Brief

Build the landing page for a fictional premium audio brand called **Resonance
Labs**. The tone is quiet, confident, architectural. The page is a single
SvelteKit route: `src/routes/modules/07-gsap/project/+page.svelte`. You may
split sections into child components.

## Required sections

1. **Threlte hero.** A full-width stage with a Threlte `<Canvas>` rendering a
   subtle 3D shape (torus, icosahedron, or custom geometry). The shape's
   rotation is scrubbed to scroll via GSAP ScrollTrigger. The material colour
   comes from a PE7 OKLCH brand token converted at runtime. Wrapped in
   `{#if browser}` so SSR stays clean.
2. **Timeline reveal.** Below the hero, a section with a logo mark, a
   headline, a sub-headline, and a CTA button, all choreographed by a single
   `gsap.timeline` with labels and overlapping position parameters.
3. **Feature grid with 2D stagger.** Eight feature cards laid out in a
   responsive grid. On scroll into view, they ripple in using
   `stagger: { amount, from: 'center', grid: 'auto' }`. Cached measurements
   survive navigation via `afterNavigate(() => ScrollTrigger.refresh())`.
4. **Parallax showcase.** A section with a pinned element and scrubbed
   parallax on a background layer. Uses `pin: true` and `scrub: 1`.
5. **Long-form reveal list.** A scrolling content section that uses
   `use:revealOnScroll` (from `$lib/actions/revealOnScroll.ts`) on every
   paragraph and illustration — no ScrollTrigger for the simple cases.
6. **Modal overlay.** A "Book a demo" overlay that uses Svelte's
   `transition:scale` on the outer element and GSAP animation on a nested
   badge inside, demonstrating the lesson 7.13 coexistence pattern.
7. **Footer.** Simple, accessible, no motion.

## Technical requirements

- **TypeScript strict** — zero `any` anywhere, including GSAP callbacks.
- **PE7 architecture** — every colour, space, duration, and easing from a
  token. Per-page brand personality declared in a single `:root` override.
- **Threlte SSR-safe** — `<Canvas>` wrapped in `{#if browser}`.
- **OKLCH-to-THREE.Color conversion** — implemented in a small helper
  (`src/lib/three/oklchToColor.ts` is a reasonable location).
- **Every GSAP call inside `$effect`** — never at the top of a script.
- **Every GSAP call inside `gsap.context`** — scoped to a root ref, reverted
  on cleanup.
- **`afterNavigate(() => ScrollTrigger.refresh())`** — on every page that
  uses ScrollTrigger, this module project included.
- **`prefersReducedMotion.current` respected** — every timeline, stagger,
  and ScrollTrigger. For the 3D hero, reduced motion replaces the scroll-
  driven rotation with a static tilt.
- **Touch targets 44×44** — all buttons and links.
- **Keyboard accessible** — modal traps focus, Escape closes, tab order
  stays inside the dialog.
- **Lighthouse mobile 95+ Performance, 100 Accessibility.** (Performance can
  drop below 100 because of the Three.js payload; 95 is the minimum.)

## File structure

```
src/routes/modules/07-gsap/project/
  +page.svelte
  Hero.svelte              # Threlte + ScrollTrigger scrub
  Timeline.svelte          # GSAP timeline reveal
  Features.svelte          # 2D stagger grid
  Parallax.svelte          # pinned section
  LongForm.svelte          # use:revealOnScroll
  BookDemo.svelte          # modal (transition + GSAP child)
src/lib/actions/
  revealOnScroll.ts        # already built in Lesson 7.12
src/lib/three/
  oklchToColor.ts          # browser-only helper
src/lib/motion.ts          # shared with Module 6
```

## Deliverables checklist

- [ ] Route renders on `/modules/07-gsap/project`
- [ ] `svelte-autofixer` clean on every `.svelte` file
- [ ] `ScrollTrigger.getAll().length` stable across navigations (no leaks)
- [ ] Threlte hero renders without SSR errors (inspect page source)
- [ ] Reduced-motion test: no decorative motion, static 3D tilt
- [ ] Lighthouse mobile: Performance ≥ 95, Accessibility = 100
- [ ] 320px viewport: no horizontal scroll, all content readable
- [ ] Keyboard nav: tab order sensible, focus visible, Escape closes modal

## What this project proves

- You can orchestrate complex motion without hand-written timing glue.
- You can make ScrollTrigger survive SvelteKit navigation reliably.
- You can keep GSAP and Svelte transitions out of each other's way.
- You can render 3D in Svelte without breaking SSR.
- You can honour accessibility across five animation systems at once
  (CSS, Svelte transitions, svelte/motion, GSAP, and Threlte).

## What comes next

Module 8 leaves animation behind and picks up SvelteKit's routing system —
dynamic segments, layouts, nested routes, and navigation hooks. The project
you just built will appear again in Module 12's performance pass, where you
will measure and shrink its Three.js payload.
