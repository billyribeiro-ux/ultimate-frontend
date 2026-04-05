---
chunk: reveal-action
title: use:revealOnScroll action
module: 7
---

# use:revealOnScroll action — Brief

Extract the scroll-reveal pattern from `scroll-trigger-setup` into a reusable Svelte **action** so any element can opt in with a single `use:revealOnScroll` directive.

## What to build

- `src/lib/actions/revealOnScroll.ts` — a typed Svelte action that accepts optional parameters (`offset`, `duration`) and attaches a ScrollTrigger-backed fade-and-rise to the element.
- Use `IntersectionObserver` as the foundation (lighter than ScrollTrigger for this one-shot reveal case) — no GSAP needed.
- Include a cleanup function that disconnects the observer when the element unmounts.
- Apply it to every card on the blog archive (`/blog`) and to the `AuthorBio` card.

## Acceptance criteria

- `<article use:revealOnScroll>…</article>` just works.
- With `prefers-reduced-motion: reduce`, the element appears at its final state immediately.
- Reusable across the capstone with no per-site setup.
- Fully typed — no `any`.

## How it connects to the capstone

Every scroll-reveal in the capstone uses this action. The blog archive, the About page team cards, and the contact page all import the same file.
