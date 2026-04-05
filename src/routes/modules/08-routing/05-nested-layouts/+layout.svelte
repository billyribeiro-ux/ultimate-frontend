<!--
	Lesson 8.5 — Nested layouts.
	This layout wraps only pages inside src/routes/modules/08-routing/05-nested-layouts.
	It renders a labelled box around its children so the layout chain is visible.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="lesson-shell">
	<p class="lesson-shell__label">Lesson layout (+layout.svelte)</p>
	<div class="lesson-shell__body">
		{@render children()}
	</div>
</div>

<style>
	.lesson-shell {
		padding: var(--space-md);
		margin-block: var(--space-md);
		border: 2px dashed oklch(72% 0.18 340);
		border-radius: var(--radius-lg);
		background: oklch(from oklch(72% 0.18 340) 96% 0.03 h);
	}

	.lesson-shell__label {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: oklch(45% 0.15 340);
		margin-block-end: var(--space-sm);
		font-weight: 700;
	}

	.lesson-shell__body {
		padding: var(--space-md);
		background: var(--color-surface);
		border-radius: var(--radius-md);
	}
</style>
