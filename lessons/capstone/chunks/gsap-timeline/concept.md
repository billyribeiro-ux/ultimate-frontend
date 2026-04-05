---
chunk: gsap-timeline
level: 2
penalty: medium
---

# GSAP Timeline — Level 2 Concept Reveal

A GSAP **Timeline** is a container for animations. Tweens you add to it play in order by default. Each tween has a duration, ease, starting state, and ending state. The timeline gives you a single object you can pause, resume, reverse, or kill.

### Why a timeline instead of four `gsap.to()` calls

- **One source of truth for timing.** Adjusting the stagger is one number, not four.
- **One cleanup target.** `tl.kill()` stops everything. Four independent tweens would need four kills.
- **Reversible.** A timeline can `.reverse()` to play the sequence backward — useful for exit animations.

### The Svelte 5 bridge

GSAP is a DOM-level animation library. It needs real elements. Svelte gives you those with `bind:this`. But DOM elements do not exist during SSR — only after mount. The correct place to run DOM code in Svelte 5 is `$effect`, which fires after the DOM is ready in the browser and never on the server.

### Pseudocode

```
<script lang="ts">
    import { gsap } from 'gsap';

    let eyebrow = $state<HTMLElement | undefined>();
    let headline = $state<HTMLElement | undefined>();
    let subhead = $state<HTMLElement | undefined>();
    let cta = $state<HTMLElement | undefined>();

    $effect(() => {
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const items = [eyebrow, headline, subhead, cta].filter(Boolean);
        if (reduced || items.length === 0) return;

        const tl = gsap.timeline();
        tl.from(items, { opacity: 0, y: 20, duration: 0.6, stagger: 0.08, ease: 'power2.out' });

        return () => tl.kill();
    });
</script>
```

### Connecting it to the capstone

`scroll-trigger-setup` wires ScrollTrigger to the same pattern and animates the features grid as it enters the viewport. `reveal-action` packages the whole concept into a reusable `use:revealOnScroll` directive the blog uses for every card.
