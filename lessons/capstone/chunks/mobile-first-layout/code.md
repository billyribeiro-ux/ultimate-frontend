---
chunk: mobile-first-layout
level: 3
penalty: high
---

# Mobile-First Layout — Level 3 Code Reveal

**`src/routes/dashboard/+page.svelte`** (layout excerpt)

```svelte
<section class="page">
	<h1>Dashboard</h1>
	<div class="dashboard-grid">
		<!-- Cards injected by other chunks -->
	</div>
</section>

<style>
	.dashboard-grid {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
	}
</style>
```

**`src/routes/+page.svelte`** (hero excerpt)

```svelte
<section class="hero page">
	<div class="hero__text">
		<h1>Ship production SvelteKit faster</h1>
		<p>PE7 SaaS — the starter the whole course builds toward.</p>
	</div>
	<div class="hero__visual" aria-hidden="true"></div>
</section>

<style>
	.hero {
		display: grid;
		gap: var(--space-lg);
		grid-template-columns: 1fr;
	}
	.hero__visual {
		aspect-ratio: 4 / 3;
		background: linear-gradient(135deg, var(--color-brand), oklch(from var(--color-brand) 40% 0.2 h));
		border-radius: var(--radius-lg);
	}

	@media (min-width: 768px) {
		.hero {
			grid-template-columns: 1fr 1fr;
			align-items: center;
		}
	}
</style>
```
