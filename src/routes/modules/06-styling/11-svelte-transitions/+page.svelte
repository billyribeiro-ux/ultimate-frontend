<!--
	Lesson 6.11 — Svelte transition directive
	A dismissible toast stack using transition:fly. Uses prefersReducedMotion.current
	from svelte/motion to collapse the fly distance and duration when reduced motion
	is preferred. PE7 tokens throughout; teal per-page brand.
-->
<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { DUR } from '$lib/motion';

	type Toast = {
		id: number;
		title: string;
		body: string;
	};

	let toasts: Toast[] = $state([]);
	let nextId: number = $state(1);

	const reduced = $derived(prefersReducedMotion.current);

	const samples: readonly Omit<Toast, 'id'>[] = [
		{ title: 'Saved', body: 'Your changes are safe and sound.' },
		{ title: 'Synced', body: 'All devices are up to date.' },
		{ title: 'Published', body: 'Your post is live for the world to see.' },
		{ title: 'Uploaded', body: 'Three images ready to share.' }
	];

	function addToast(): void {
		const sample = samples[(nextId - 1) % samples.length];
		const toast: Toast = { id: nextId, ...sample };
		nextId += 1;
		toasts = [...toasts, toast];

		// Auto-dismiss after 4 seconds
		setTimeout(() => dismissToast(toast.id), 4000);
	}

	function dismissToast(id: number): void {
		toasts = toasts.filter((t) => t.id !== id);
	}
</script>

<svelte:head>
	<title>Lesson 6.11 · Svelte transitions · Ultimate Frontend</title>
	<meta
		name="description"
		content="Toast notifications entering and leaving the DOM with transition:fly and reduced-motion respect."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.11 · Mini-build</p>
		<h1>A toast notification stack</h1>
		<p class="lead">
			Click the button to add a notification. Each toast flies in from the right and auto-dismisses after
			four seconds. Dismiss manually with the close button. Try enabling reduced motion in DevTools.
		</p>
	</header>

	<div class="controls">
		<button class="primary" type="button" onclick={addToast}>Add notification</button>
		<p class="status">Active: {toasts.length} · Reduced motion: {reduced ? 'on' : 'off'}</p>
	</div>

	<ul class="stack-list" role="list" aria-label="Notifications">
		{#each toasts as toast (toast.id)}
			<li
				class="toast"
				in:fly={{
					x: reduced ? 0 : 320,
					duration: reduced ? 0 : DUR.base,
					easing: cubicOut
				}}
				out:fade={{ duration: reduced ? 0 : DUR.fast }}
			>
				<div class="toast__body">
					<strong>{toast.title}</strong>
					<span>{toast.body}</span>
				</div>
				<button
					class="toast__close"
					type="button"
					aria-label="Dismiss notification"
					onclick={() => dismissToast(toast.id)}
				>
					×
				</button>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.14 190);
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

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		align-items: center;
	}

	.primary {
		background: var(--color-brand);
		color: var(--color-surface);
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		font-weight: 600;
		min-block-size: 2.75rem;
		min-inline-size: 2.75rem;
		transition: transform var(--dur-fast) var(--ease-out);
	}

	.primary:hover,
	.primary:focus-visible {
		transform: translateY(-2px);
	}

	.status {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.stack-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		max-inline-size: 24rem;
	}

	.toast {
		display: flex;
		align-items: flex-start;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
	}

	.toast__body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.toast__body strong {
		color: var(--color-text);
	}

	.toast__body span {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.toast__close {
		min-block-size: 2.75rem;
		min-inline-size: 2.75rem;
		font-size: var(--text-xl);
		color: var(--color-text-muted);
		border-radius: var(--radius-sm);
		transition: color var(--dur-fast) var(--ease-out);
	}

	.toast__close:hover,
	.toast__close:focus-visible {
		color: var(--color-brand);
	}
</style>
