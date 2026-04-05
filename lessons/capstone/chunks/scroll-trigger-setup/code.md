---
chunk: scroll-trigger-setup
level: 3
penalty: high
---

# ScrollTrigger + SvelteKit — Level 3 Code Reveal

**`src/routes/+page.svelte`** (features section — append to the hero from `gsap-timeline`)

```svelte
<script lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	$effect(() => {
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) return;

		gsap.registerPlugin(ScrollTrigger);

		const cards = gsap.utils.toArray<HTMLElement>('.feature-card');
		const tweens = cards.map((card) =>
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

		return () => {
			tweens.forEach((t) => t.scrollTrigger?.kill());
		};
	});
</script>

<section class="features page">
	<h2>Features</h2>
	<ul class="features__grid">
		<li class="feature-card">Typed load and query functions</li>
		<li class="feature-card">GSAP-driven scroll experience</li>
		<li class="feature-card">TanStack Table dashboard</li>
		<li class="feature-card">Full SEO and AEO ready</li>
	</ul>
</section>

<style>
	.features__grid { list-style: none; padding: 0; display: grid; gap: var(--space-md); grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }
	.feature-card { padding: var(--space-lg); background: var(--color-surface-2); border-radius: var(--radius-md); min-block-size: 44px; }
</style>
```
