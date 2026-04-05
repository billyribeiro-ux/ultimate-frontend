<!--
	Lesson 9A.5 — layout that applies the accent color from layout data
	as a CSS custom property on its wrapper.
-->
<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="lesson-shell" style="--layout-accent: {data.preferences.accent}">
	{@render children()}
</div>

<style>
	.lesson-shell {
		/* Expose the layout-provided accent to descendants via a custom property. */
		--color-brand: var(--layout-accent);
	}
</style>
