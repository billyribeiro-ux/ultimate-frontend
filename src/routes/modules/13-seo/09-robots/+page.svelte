<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="robots.txt · Lesson 13.9"
	description="A text/plain +server.ts endpoint that allows, blocks, and references a sitemap — the final SEO primitive."
/>

<section class="page stack">
	<p class="eyebrow">Lesson 13.9 · Mini-build</p>
	<h1>robots.txt, served from SvelteKit</h1>
	<p>Open <a href="/robots.txt">/robots.txt</a> — confirm the response is text/plain.</p>
	<p class="muted">
		Your admin, auth, and API routes are blocked. GPTBot and Google-Extended are opted out of
		training. Your sitemap is advertised.
	</p>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 30);
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
