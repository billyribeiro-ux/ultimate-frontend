# Module 6 — Styling Mastery — Module Project

## Animated Landing Page

**Goal:** ship a complete single-page marketing site that exercises every
technique from Module 6 — PE7 architecture, OKLCH tokens, native CSS nesting,
logical properties, Grid, Flexbox, container queries, per-page color
personality, and the full Svelte animation system. No GSAP — Module 7 adds that
layer. This project is what proves you can build polished, accessible, and
performant surfaces with the built-in tools alone.

## Brief

You have been hired to build the landing page for a fictional product called
**Arbor** — a note-taking app for researchers. The page must be fast, accessible,
and visually distinctive. It launches on a single route:
`src/routes/modules/06-styling/project/+page.svelte`.

## Required sections

1. **Hero** — product name, one-line value proposition, call-to-action button,
   a decorative illustration (CSS art, SVG, or a small Svelte component).
   Uses `transition:fly` for a first-paint reveal with stagger.
2. **Feature grid** — at least six feature cards. Container-query responsive:
   two columns below the breakpoint, three columns above. Cards use
   `animate:flip` if re-orderable, or `transition:fade` with a capped stagger
   on first paint.
3. **Testimonial carousel** — at least three testimonials. Transition between
   them using `in:`/`out:` with asymmetric direction. Auto-advance is optional;
   keyboard navigation (arrow keys) is required.
4. **Animated stat strip** — three key numbers that tween up from 0 to their
   final value on first paint using the `Tween` class from `svelte/motion`.
5. **CTA footer** — secondary call-to-action. Uses a custom transition function
   built with `TransitionConfig`.

## Technical requirements

- **TypeScript strict** — zero `any`.
- **PE7 architecture** — every color, space, and motion value from a token.
  No raw OKLCH or hex strings in components. Per-page color personality is
  declared in a single `:root` override inside the route's `<style>`.
- **Native CSS nesting** — no SCSS, no BEM, no PostCSS plugins.
- **Logical properties** — no `left`/`right`/`top`/`bottom`/`margin-left`.
  Use `inset-inline`, `margin-block-start`, etc.
- **Container queries** — the feature grid is container-query responsive, not
  viewport-query responsive. This is the test that you can build reusable
  components that adapt to any layout context.
- **Mobile-first** — base styles for phone, enhance up with `min-width`.
- **Respects `prefers-reduced-motion: reduce`** — every Svelte transition,
  tween, and decorative animation honours the preference via
  `prefersReducedMotion.current`. Global CSS reset handles pure CSS
  transitions.
- **Touch targets 44×44 CSS pixels minimum** — all buttons, links in nav,
  testimonial pager dots.
- **Keyboard navigable** — every interactive element is reachable with Tab.
  Focus states are visible and use the same motion language as hover.
- **Lighthouse mobile score 100** on Performance, Accessibility, Best
  Practices, and SEO. Run from a cold dev build.

## File structure

```
src/routes/modules/06-styling/project/
  +page.svelte              # the route
  Hero.svelte               # extracted section components
  Features.svelte
  Testimonials.svelte
  Stats.svelte
  Cta.svelte
src/lib/transitions/
  curtain.ts                # custom transition(s) you invented
src/lib/motion.ts           # DUR constants already shared by Module 7
```

You may inline sections into the route if you prefer a single file. The
per-section structure is recommended because the Module 12 performance
pass revisits this project and it is easier to measure per-section bundle
impact when they live in separate files.

## Deliverables checklist

- [ ] Route renders cleanly on `/modules/06-styling/project`
- [ ] Validated with `svelte-autofixer` on every `.svelte` file
- [ ] Lighthouse mobile 100 across all four categories
- [ ] Manual test with reduced-motion enabled — no decorative motion
- [ ] Manual test at 320px wide — no horizontal scroll
- [ ] Keyboard tab order verified

## What this project proves

- You can design a token system and stick to it across a whole page.
- You can pick the right animation tool (CSS transition, Svelte transition,
  Tween, Spring, flip, custom function) for each interaction.
- You can build responsive layout with both Grid and Flexbox and container
  queries in the same page.
- You can ship a site that does not trigger vestibular reactions in users
  who asked not to be animated at.

## What comes next

Module 7's project (`Premium Marketing Page`) extends this work with GSAP,
ScrollTrigger, timelines, and a Threlte 3D hero. You can reuse the Arbor
brand and sections as a starting point.
