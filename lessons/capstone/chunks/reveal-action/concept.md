---
chunk: reveal-action
level: 2
penalty: medium
---

# use:revealOnScroll action — Level 2 Concept Reveal

A Svelte action is the idiomatic way to attach imperative DOM behaviour to a Svelte element. It is a function that takes the mounted DOM node and returns an object with lifecycle methods.

### The action interface (Svelte 5 types)

```ts
import type { Action } from 'svelte/action';

interface RevealOptions {
    offset?: string;   // e.g. '0px 0px -10% 0px'
    once?: boolean;    // default true
}

const revealOnScroll: Action<HTMLElement, RevealOptions | undefined> = (node, params) => {
    // set up
    return { destroy() { /* tear down */ } };
};
```

### Strategy: IntersectionObserver + CSS class

Mount the action, set `data-reveal="pending"` on the node, and hand a one-shot observer to the browser. When the observer fires, flip the attribute to `data-reveal="visible"`. Your CSS reads the attribute and animates the transition.

### Pseudocode

```
revealOnScroll(node, params):
    if matchMedia('(prefers-reduced-motion: reduce)').matches:
        node.dataset.reveal = 'visible'
        return { destroy: () => {} }

    node.dataset.reveal = 'pending'
    const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
            if (e.isIntersecting) {
                node.dataset.reveal = 'visible'
                io.unobserve(e.target)
            }
        }
    }, { rootMargin: params?.offset ?? '0px 0px -10% 0px' })
    io.observe(node)
    return { destroy: () => io.disconnect() }
```

Matching CSS (ship once in `app.css` or `<style>` global):

```
[data-reveal='pending'] { opacity: 0; transform: translateY(20px); }
[data-reveal='visible'] { opacity: 1; transform: translateY(0); transition: opacity 600ms var(--ease-out), transform 600ms var(--ease-out); }
```

### Connecting it to the capstone

Replace per-site ScrollTriggers with `use:revealOnScroll` anywhere you want a one-shot reveal. The feature cards on the marketing home can optionally migrate to this simpler action; the landing hero stays on GSAP Timeline because it needs a multi-step choreography.
