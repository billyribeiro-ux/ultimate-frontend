<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="Dynamic sitemap · Lesson 13.8"
	description="How to generate sitemap.xml at request time from static and dynamic routes using a SvelteKit +server.ts endpoint."
/>

<section class="page stack">
	<p class="eyebrow">Lesson 13.8 · Mini-build</p>
	<h1>Your sitemap is live</h1>
	<p>
		Open <a href="/sitemap.xml">/sitemap.xml</a> in a new tab. You should see a valid XML
		document with <code>application/xml</code> content-type.
	</p>
	<p class="muted">
		This endpoint lives at <code>src/routes/sitemap.xml/+server.ts</code> and is built from a
		static route list plus any dynamic entries you add.
	</p>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 240);
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
