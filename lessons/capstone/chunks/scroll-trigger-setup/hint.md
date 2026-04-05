---
chunk: scroll-trigger-setup
level: 1
penalty: 0
---

# ScrollTrigger + SvelteKit — Level 1 Hint (free)

GSAP's ScrollTrigger has two gotchas that bite everyone who uses it with SvelteKit for the first time:

1. **You must `gsap.registerPlugin(ScrollTrigger)` before using it.** Do it once, at the top of the effect, or in a shared module imported on the client. SSR does not need it.
2. **SPA navigations leak triggers.** When SvelteKit navigates away from a page, Svelte tears down components, but unless you kill the triggers they stay attached to the old elements — which are now detached from the DOM. Next navigation, you get ghost triggers. The fix is an `$effect` return function that kills them explicitly.

The other big question is *how many triggers*: one big trigger covering all cards with a stagger, or one trigger per card? For the capstone, one per card keeps each card's animation independent, which plays better when the user scrolls quickly. Reach for `gsap.utils.toArray()` to iterate the cards.
