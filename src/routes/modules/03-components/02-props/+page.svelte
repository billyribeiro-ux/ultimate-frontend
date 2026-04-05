<!--
	Lesson 3.2 mini-build — Six metric cards, one component, six different prop values.
	Demonstrates: $props() rune, destructuring defaults, parent-to-child data flow.
-->
<script lang="ts">
	import MetricCard from '$lib/components/MetricCard.svelte';
</script>

<svelte:head>
	<title>Lesson 3.2 · $props() · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 3.2 mini-build: pass different label and value props into the same reusable MetricCard component."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/03-components">← Module 3</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 3.2 · Mini-build</p>
		<h1>Six metrics, one component</h1>
		<p class="lede">
			Every card below is the same <code>MetricCard.svelte</code> file, rendered six times with
			six different prop values. Open the Svelte DevTools tab to inspect them live.
		</p>
	</header>

	<div class="grid">
		<MetricCard label="Users" value="12,384" />
		<MetricCard label="Sessions" value="7,102" />
		<MetricCard label="Revenue" value="$41,200" />
		<MetricCard label="Errors" value="4" />
		<MetricCard label="Latency" value="92 ms" />
		<MetricCard label="Uptime" value="99.98 %" />
	</div>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 180);
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

	.lede {
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}

		@media (min-width: 768px) {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}
</style>
