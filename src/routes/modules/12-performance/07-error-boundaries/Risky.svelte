<!--
	Risky child component — throws during render when shouldThrow is true.
	Used by Lesson 12.7 to demonstrate <svelte:boundary>.
-->
<script lang="ts">
	interface Props {
		shouldThrow: boolean;
	}

	let { shouldThrow }: Props = $props();

	// Evaluated during render (status is read in the markup), so the error
	// surfaces where <svelte:boundary> can catch it — and it reacts to the
	// prop instead of only capturing its initial value.
	const status: string = $derived.by(() => {
		if (shouldThrow) {
			throw new Error('Risky card exploded on render.');
		}
		return 'working normally';
	});
</script>

<p>This card is {status} right now.</p>
