<script lang="ts">
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Why SvelteKit is an SEO advantage · Lesson 13.1</title>
	<meta
		name="description"
		content="Proof that SvelteKit ships HTML before JavaScript runs — timestamp rendered on the server, visible in View Source."
	/>
</svelte:head>

<section class="page stack">
	<p class="eyebrow">Lesson 13.1 · Mini-build</p>
	<h1>Server-rendered timestamp</h1>
	<p>
		Rendered at: <time datetime={data.renderedAt}>{data.renderedAt}</time>
	</p>
	<p class="muted">
		Right-click the page and choose <strong>View Source</strong>. You will find this timestamp in
		the literal HTML the server sent. That is the SSR guarantee.
	</p>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 160);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.muted {
		color: var(--color-text-muted);
	}
</style>
