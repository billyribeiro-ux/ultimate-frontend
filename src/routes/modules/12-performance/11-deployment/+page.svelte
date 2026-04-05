<!--
	Lesson 12.11 — Deployment
	Mini-build: a deploy checklist page.
-->
<script lang="ts">
	interface Item {
		id: string;
		label: string;
		description: string;
	}

	const checklist: Item[] = [
		{ id: 'check', label: 'pnpm check passes', description: 'Zero TypeScript errors, zero warnings.' },
		{ id: 'build', label: 'pnpm build succeeds', description: 'No bundler warnings.' },
		{ id: 'lighthouse', label: 'Lighthouse mobile 90+', description: 'Across all four categories.' },
		{ id: 'tests', label: 'Vitest + Playwright pass', description: 'Both unit and end-to-end.' },
		{ id: 'secrets', label: 'No secrets in PUBLIC_*', description: '$env/static/private only.' },
		{ id: 'adapter', label: 'Correct adapter in svelte.config.js', description: 'Node, Vercel, Cloudflare, or auto.' },
		{ id: 'env', label: 'Env vars configured on target', description: 'Dashboard, CLI, or deploy hook.' },
		{ id: 'errors', label: '+error.svelte exists', description: 'Route-level error UI.' },
		{ id: 'boundaries', label: 'Widgets wrapped in <svelte:boundary>', description: 'Runtime error containment.' },
		{ id: 'seo', label: 'robots.txt + sitemap + canonical', description: 'Covered in Module 13.' }
	];

	let checked = $state<Record<string, boolean>>({});

	const progress = $derived(
		Math.round(
			(Object.values(checked).filter(Boolean).length / checklist.length) * 100
		)
	);
</script>

<svelte:head>
	<title>Lesson 12.11 · Deployment · Ultimate Frontend</title>
	<meta
		name="description"
		content="A ten-item deploy checklist covering build, test, secrets, adapter, and error handling."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.11 · Mini-build</p>
		<h1>Ten items before you ship</h1>
		<p class="lede">
			Work down the list. Green every item. Then click the big button at the bottom of your
			deploy dashboard.
		</p>
	</header>

	<div
		class="progress"
		role="progressbar"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={progress}
	>
		<div class="progress__bar" style:inline-size="{progress}%"></div>
		<p class="progress__text">{progress}% ready</p>
	</div>

	<ul class="items">
		{#each checklist as item (item.id)}
			<li>
				<label>
					<input type="checkbox" bind:checked={checked[item.id]} />
					<span class="item__label">{item.label}</span>
					<span class="item__desc">{item.description}</span>
				</label>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.18 160);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.progress {
		position: relative;
		block-size: 2.5rem;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.progress__bar {
		position: absolute;
		inset-block: 0;
		inset-inline-start: 0;
		background: var(--color-brand);
		transition: inline-size var(--dur-base) var(--ease-out);
	}

	.progress__text {
		position: relative;
		margin: 0;
		inline-size: 100%;
		text-align: center;
		line-height: 2.5rem;
		font-weight: 700;
		color: var(--color-text);
		mix-blend-mode: difference;
	}

	.items {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.items li {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.items label {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		align-items: center;
		cursor: pointer;
	}

	.items input {
		inline-size: 20px;
		block-size: 20px;
		grid-row: span 2;
	}

	.item__label {
		font-weight: 600;
	}

	.item__desc {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.progress__bar {
			transition: none;
		}
	}
</style>
