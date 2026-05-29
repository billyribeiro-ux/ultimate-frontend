---
chunk: gsap-timeline
level: 3
penalty: high
---

# GSAP Timeline — Level 3 Code Reveal

**`src/routes/+page.svelte`** (hero excerpt — merge with the mobile-first layout chunk)

```svelte
<script lang="ts">
	import { gsap } from 'gsap';

	let eyebrow = $state<HTMLElement | undefined>();
	let headline = $state<HTMLElement | undefined>();
	let subhead = $state<HTMLElement | undefined>();
	let cta = $state<HTMLElement | undefined>();

	$effect(() => {
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const items = [eyebrow, headline, subhead, cta].filter(
			(el): el is HTMLElement => el !== undefined
		);
		if (reduced || items.length === 0) return;

		const tl = gsap.timeline();
		tl.from(items, {
			opacity: 0,
			y: 20,
			duration: 0.6,
			stagger: 0.08,
			ease: 'power2.out'
		});

		return () => {
			tl.kill();
		};
	});
</script>

<section class="hero page">
	<div class="hero__text">
		<p class="eyebrow" bind:this={eyebrow}>PE7 SaaS · May 2026</p>
		<h1 bind:this={headline}>Ship production SvelteKit faster</h1>
		<p class="subhead" bind:this={subhead}>
			The course capstone — every module, one app.
		</p>
		<a class="cta" href="/dashboard" bind:this={cta}>Open the dashboard →</a>
	</div>
	<div class="hero__visual" aria-hidden="true"></div>
</section>

<style>
	.hero { display: grid; gap: var(--space-lg); }
	.eyebrow { color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.08em; font-size: var(--text-sm); }
	.subhead { color: var(--color-text-muted); font-size: var(--text-lg); }
	.cta { display: inline-block; min-block-size: 44px; padding-inline: var(--space-md); padding-block: var(--space-sm); background: var(--color-brand); color: oklch(98% 0.01 0); border-radius: var(--radius-md); text-decoration: none; }
	.hero__visual { aspect-ratio: 4 / 3; background: linear-gradient(135deg, var(--color-brand), oklch(from var(--color-brand) 40% 0.2 h)); border-radius: var(--radius-lg); }
	@media (min-width: 768px) { .hero { grid-template-columns: 1fr 1fr; align-items: center; } }
</style>
```
