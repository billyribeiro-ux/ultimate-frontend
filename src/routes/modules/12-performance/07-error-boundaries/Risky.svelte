<!--
	Risky child component — throws on render when shouldThrow is true.
	Used by Lesson 12.7 to demonstrate <svelte:boundary>.
-->
<script lang="ts">
	interface Props {
		shouldThrow: boolean;
	}

	const { shouldThrow }: Props = $props();

	if (shouldThrow) {
		throw new Error('Risky card exploded on render.');
	}
</script>

<p>This card is working normally right now.</p>
