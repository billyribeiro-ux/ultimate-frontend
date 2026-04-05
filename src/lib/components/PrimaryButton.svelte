<!--
	PrimaryButton.svelte — Module 3, Lesson 3.8.
	A decision wrapper around Button that hard-wires variant and size.
	Forwards every other native button attribute via rest-props spread.
-->
<script lang="ts">
	import Button from './Button.svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();
</script>

<Button variant="solid" size="lg" {...rest}>
	{@render children()}
</Button>
