---
chunk: scroll-trigger-setup
level: 2
penalty: medium
---

# ScrollTrigger + SvelteKit — Level 2 Concept Reveal

**ScrollTrigger** is a GSAP plugin that binds a tween to the user's scroll position. You pick a trigger element, two scroll positions (`start` and `end`), and what should happen when the scroll crosses those thresholds.

### The lifecycle

1. **Register** the plugin once: `gsap.registerPlugin(ScrollTrigger)`.
2. **Create** triggers inside an effect that runs on the client. Each trigger holds a reference to a DOM element.
3. **Kill** every trigger in the cleanup phase when the component is destroyed or the user navigates away.

### Pseudocode

```
$effect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const cards = gsap.utils.toArray<HTMLElement>('.feature-card');
    const triggers = cards.map((card) =>
        gsap.from(card, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        })
    );

    return () => triggers.forEach((t) => t.scrollTrigger?.kill());
});
```

### The four `toggleActions`

`toggleActions: 'play none none reverse'` maps to four scroll events — onEnter, onLeave, onEnterBack, onLeaveBack. `'play none none reverse'` means: play when entering, do nothing when leaving down, do nothing when entering back from below, reverse when leaving up. That is the most common feel for a reveal animation.

### Connecting it to the capstone

The cards this chunk targets come from `container-queries`. The cleanup discipline you learn here becomes a reusable directive in `reveal-action`.
