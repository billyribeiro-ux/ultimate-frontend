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
	const scriptOpen: string = '<script type="application/ld+json">';
	const scriptClose: string = '</' + 'script>';
	const html: string = $derived(
		scriptOpen + JSON.stringify(data).replace(/</g, '\\u003c') + scriptClose
	);
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</svelte:head>
