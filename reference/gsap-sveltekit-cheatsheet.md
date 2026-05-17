# GSAP in SvelteKit Cheat Sheet

## Import Patterns

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { Draggable } from 'gsap/Draggable';

// Register plugins once (typically in +layout.svelte or a shared module)
gsap.registerPlugin(ScrollTrigger, Flip, Draggable);
```

## The Three Tweens

| Method | Direction | Signature |
|--------|-----------|-----------|
| `gsap.to()` | From current → target | `gsap.to(target, { duration, x, opacity, ease, ... })` |
| `gsap.from()` | From values → current | `gsap.from(target, { duration, y: -50, opacity: 0 })` |
| `gsap.fromTo()` | Explicit start → end | `gsap.fromTo(target, { opacity: 0 }, { opacity: 1, duration: 1 })` |

```ts
// Common properties
gsap.to('.box', {
  x: 100,           // translateX
  y: 50,            // translateY
  rotation: 45,     // degrees
  scale: 1.2,
  opacity: 0.5,
  duration: 0.8,    // seconds
  delay: 0.2,
  ease: 'power2.out',
  stagger: 0.1,     // delay between multiple targets
  onComplete: () => {},
});
```

## Timeline Position Parameter

```ts
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' } });

tl.to('.a', { x: 100 })           // starts at 0s
  .to('.b', { y: 50 }, '<')        // < = same start as previous
  .to('.c', { opacity: 0 }, '>')   // > = end of previous
  .to('.d', { scale: 0 }, '-=0.2') // 0.2s before end of previous
  .to('.e', { x: -50 }, '+=0.3')   // 0.3s after end of previous
  .to('.f', { y: 100 }, 'myLabel') // at named label position
  .addLabel('myLabel', 1.5);       // place label at 1.5s
```

| Syntax | Meaning |
|--------|---------|
| `"<"` | Start of the previous tween |
| `">"` | End of the previous tween |
| `"-=0.2"` | 0.2s before end of previous |
| `"+=0.3"` | 0.3s after end of previous |
| `"label"` | At the named label |
| `"label+=0.5"` | 0.5s after the label |
| `2` | Absolute time (2s from timeline start) |

## $effect Bridge Pattern

```svelte
<script lang="ts">
  let isOpen = $state(false);
  let drawer: HTMLElement | undefined = $state();

  $effect(() => {
    if (!drawer) return;
    gsap.to(drawer, {
      x: isOpen ? 0 : -300,
      duration: 0.4,
      ease: 'power2.inOut',
    });
  });
</script>

<button onclick={() => isOpen = !isOpen}>Toggle</button>
<div bind:this={drawer} class="drawer">...</div>
```

## Cleanup Pattern (gsap.context)

```svelte
<script lang="ts">
  let container: HTMLElement | undefined = $state();

  $effect(() => {
    if (!container) return;

    const ctx = gsap.context(() => {
      // All GSAP animations created inside are scoped to ctx
      gsap.from('.card', { y: 30, opacity: 0, stagger: 0.1 });
      gsap.to('.hero', { scale: 1.05, scrollTrigger: { trigger: '.hero' } });
    }, container); // scope selector queries to container

    return () => ctx.revert(); // kills all animations + ScrollTriggers in this context
  });
</script>
```

## ScrollTrigger with SvelteKit Navigation

```svelte
<script lang="ts">
  import { afterNavigate } from '$app/navigation';

  let section: HTMLElement | undefined = $state();

  $effect(() => {
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from('.reveal', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      });
    }, section);

    return () => ctx.revert();
  });

  // Refresh ScrollTrigger after SvelteKit navigation (DOM may have changed)
  afterNavigate(() => {
    ScrollTrigger.refresh();
  });
</script>
```

## use:revealOnScroll Action Pattern

```ts
// src/lib/actions/reveal.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface RevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
}

export function revealOnScroll(node: HTMLElement, options: RevealOptions = {}) {
  const { y = 30, duration = 0.6, delay = 0 } = options;

  const ctx = gsap.context(() => {
    gsap.from(node, {
      y,
      opacity: 0,
      duration,
      delay,
      scrollTrigger: { trigger: node, start: 'top 85%' },
    });
  });

  return { destroy: () => ctx.revert() };
}
```

```svelte
<div use:revealOnScroll={{ y: 50, duration: 0.8 }}>Revealed on scroll</div>
```

## prefers-reduced-motion Guard

```ts
// src/lib/utils/motion.ts
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Usage in $effect:
$effect(() => {
  if (prefersReducedMotion()) return; // skip all animation
  const ctx = gsap.context(() => { /* ... */ }, container);
  return () => ctx.revert();
});
```

```ts
// Global GSAP config (in root layout)
if (prefersReducedMotion()) {
  gsap.globalTimeline.timeScale(20); // near-instant
  ScrollTrigger.config({ ignoreMobileResize: true });
}
```

## Threlte Integration (GSAP + Three.js)

```svelte
<script lang="ts">
  import { T } from '@threlte/core';
  import gsap from 'gsap';

  let mesh: THREE.Mesh | undefined = $state();

  $effect(() => {
    if (!mesh) return;
    const ctx = gsap.context(() => {
      gsap.to(mesh!.rotation, { y: Math.PI * 2, duration: 3, repeat: -1, ease: 'none' });
      gsap.to(mesh!.position, { y: 1, duration: 1.5, yoyo: true, repeat: -1 });
    });
    return () => ctx.revert();
  });
</script>

<T.Mesh bind:ref={mesh}>
  <T.BoxGeometry args={[1, 1, 1]} />
  <T.MeshStandardMaterial color="hotpink" />
</T.Mesh>
```

## Common Mistakes

- **Not reverting context on cleanup** — causes memory leaks and zombie animations on navigation.
- **Using `document.querySelector` inside GSAP** — scope queries to component via `gsap.context(fn, container)`.
- **Forgetting `ScrollTrigger.refresh()` after navigation** — scroll positions stale after SvelteKit route change.
- **Animating layout properties (width, height, top, left)** — use transforms (x, y, scale) for 60fps.
- **Not checking `prefers-reduced-motion`** — accessibility violation; always guard or reduce.
- **Creating ScrollTriggers without cleanup** — they persist after component unmount; always `ctx.revert()`.
- **Using `gsap.to` inside `$derived`** — side effects belong in `$effect`, never in derivations.
- **Setting `duration: 0` instead of `gsap.set()`** — use `gsap.set()` for instant property assignment.
