<!--
	JsonLd — Module 13 Lesson 13.6.
	Emits a <script type="application/ld+json"> tag inside <svelte:head>
	using {@html}. The < character is escaped to prevent a stray
	</script> substring in user data from breaking the block.
-->
<script lang="ts">
	interface JsonLdProps {
		data: Record<string, unknown>;
	}

	const { data }: JsonLdProps = $props();
	const json: string = $derived(JSON.stringify(data).replace(/</g, '\\u003c'));
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${json}</script>`}
</svelte:head>
