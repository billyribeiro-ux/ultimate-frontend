<!--
	Lesson 6.12 — in: and out: different enter and exit animations
	A modal whose dialog scales in and flies out. Scrim uses symmetric fade.
-->
<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut, cubicIn } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { DUR } from '$lib/motion';

	let open: boolean = $state(false);

	const reduced = $derived(prefersReducedMotion.current);

	function openDialog(): void {
		open = true;
	}

	function closeDialog(): void {
		open = false;
	}

	function onKey(event: KeyboardEvent): void {
		if (event.key === 'Escape') closeDialog();
	}
</script>

<svelte:window onkeydown={onKey} />

<svelte:head>
	<title>Lesson 6.12 · in: and out: · Ultimate Frontend</title>
	<meta
		name="description"
		content="A modal whose enter and exit animations are different — scale in, fly out — using Svelte in: and out: directives."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.12 · Mini-build</p>
		<h1>Asymmetric motion: scale in, fly out</h1>
		<p class="lead">
			Open the dialog. It scales up from 0.9 on entrance and slides downward on exit —
			two completely different animations on the same element.
		</p>
	</header>

	<button class="primary" type="button" onclick={openDialog}>Open dialog</button>
</section>

{#if open}
	<div
		class="scrim"
		role="presentation"
		onclick={closeDialog}
		onkeydown={() => {}}
		transition:fade={{ duration: reduced ? 0 : DUR.fast }}
	>
		<!-- scrim click-to-close handled by outer div -->
	</div>

	<div
		class="dialog-wrap"
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
		in:scale={{
			duration: reduced ? 0 : DUR.base,
			start: reduced ? 1 : 0.9,
			opacity: 0,
			easing: cubicOut
		}}
		out:fly={{
			duration: reduced ? 0 : DUR.fast,
			y: reduced ? 0 : 40,
			opacity: 0,
			easing: cubicIn
		}}
	>
		<div class="dialog">
			<header class="dialog__head">
				<h2 id="dialog-title">Save your changes?</h2>
				<button
					class="dialog__close"
					type="button"
					aria-label="Close"
					onclick={closeDialog}
				>×</button>
			</header>
			<p>
				This dialog scales up from 0.9 on entrance (feels assertive) and flies down to exit
				(feels like dismissal). Press <kbd>Esc</kbd> or click the scrim to close.
			</p>
			<div class="dialog__actions">
				<button type="button" class="ghost" onclick={closeDialog}>Cancel</button>
				<button type="button" class="primary" onclick={closeDialog}>Save</button>
			</div>
		</div>
	</div>
{/if}

<style>
	section {
		--color-brand: oklch(72% 0.17 55);
	}

	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lead {
		color: var(--color-text-muted);
		max-inline-size: 56ch;
	}

	.primary {
		background: oklch(72% 0.17 55);
		color: var(--color-surface);
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		font-weight: 600;
		min-block-size: 2.75rem;
		min-inline-size: 2.75rem;
	}

	.ghost {
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		min-block-size: 2.75rem;
	}

	.scrim {
		position: fixed;
		inset: 0;
		background: oklch(0% 0 0 / 0.45);
		z-index: 40;
	}

	.dialog-wrap {
		position: fixed;
		inset: 0;
		display: grid;
		place-items: center;
		padding: var(--space-md);
		z-index: 50;
		pointer-events: none;
	}

	.dialog {
		pointer-events: auto;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		padding: var(--space-lg);
		max-inline-size: 28rem;
		width: 100%;
		--color-brand: oklch(72% 0.17 55);
	}

	.dialog__head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-md);
		margin-block-end: var(--space-md);
	}

	.dialog__close {
		font-size: var(--text-xl);
		min-block-size: 2.75rem;
		min-inline-size: 2.75rem;
		color: var(--color-text-muted);
	}

	.dialog__actions {
		display: flex;
		gap: var(--space-sm);
		justify-content: flex-end;
		margin-block-start: var(--space-lg);
	}
</style>
