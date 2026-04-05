<script lang="ts">
	function fluidClamp(
		minPx: number,
		maxPx: number,
		minViewportPx: number,
		maxViewportPx: number
	): string {
		const slope = (maxPx - minPx) / (maxViewportPx - minViewportPx);
		const intercept = minPx - slope * minViewportPx;
		const preferredVw = (slope * 100).toFixed(3);
		const interceptRem = (intercept / 16).toFixed(3);
		const minRem = (minPx / 16).toFixed(3);
		const maxRem = (maxPx / 16).toFixed(3);
		return `clamp(${minRem}rem, calc(${interceptRem}rem + ${preferredVw}vw), ${maxRem}rem)`;
	}

	const customHeadingSize: string = fluidClamp(32, 72, 360, 1440);

	interface Sample {
		label: string;
		token: string;
	}

	const samples: Sample[] = [
		{ label: 'Lead caption', token: 'var(--text-sm)' },
		{ label: 'Body copy', token: 'var(--text-base)' },
		{ label: 'Section heading', token: 'var(--text-lg)' },
		{ label: 'Display heading', token: 'var(--text-2xl)' },
		{ label: 'Hero heading', token: 'var(--text-hero)' }
	];
</script>

<svelte:head>
	<title>Lesson 1.6 · Fluid clamp · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 1.6 mini-build: fluid typography demo with a live-computed clamp() helper."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/01-foundation">← Module 1</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 1.6 · Mini-build</p>
		<h1 class="custom-heading" style:font-size={customHeadingSize}>
			This heading breathes
		</h1>
		<p class="lede">
			Resize the browser. The heading above uses a computed clamp() that hits exactly 32px at
			360px wide and exactly 72px at 1440px wide.
		</p>
	</header>

	<ul class="samples">
		{#each samples as sample (sample.label)}
			<li class="sample">
				<span class="sample__label">{sample.label}</span>
				<span class="sample__text" style:font-size={sample.token}>
					The quick brown fox.
				</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 340);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;

			&:hover {
				color: var(--color-brand);
			}
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.custom-heading {
		line-height: 1.05;
		color: var(--color-brand);
		letter-spacing: -0.02em;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.samples {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.sample {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xs);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);

		@media (min-width: 480px) {
			grid-template-columns: 14rem 1fr;
			align-items: baseline;
			gap: var(--space-md);
		}
	}

	.sample__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.sample__text {
		font-weight: 600;
	}
</style>
