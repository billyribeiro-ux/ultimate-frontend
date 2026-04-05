<!--
    Lesson 5.8 — Custom events / toast notification system.
-->
<script lang="ts">
	import Toasts from './Toasts.svelte';
	import { show, clear } from './toasts.svelte';

	let counter: number = $state(0);

	function simulateSave(): void {
		counter += 1;
		show('success', `Saved draft #${counter}`);
	}

	function simulateError(): void {
		show('error', 'Network error — please retry');
	}

	function simulateInfo(): void {
		show('info', 'You have unread messages');
	}
</script>

<svelte:head>
	<title>Lesson 5.8 · Toast notifications · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 5.8: a reactive toast notification system built from a module-level $state store."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/05-events">← Module 5</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 5.8 · Mini-build</p>
		<h1>Toast notifications without a bus</h1>
		<p class="lede">
			A module-level <code>$state</code> array + three exported functions = a complete, typed,
			reactive toast system.
		</p>
	</header>

	<article class="demo">
		<h2>Trigger toasts</h2>
		<div class="demo__actions">
			<button type="button" class="btn btn--success" onclick={simulateSave}>Simulate save</button>
			<button type="button" class="btn btn--error" onclick={simulateError}>Simulate error</button>
			<button type="button" class="btn btn--info" onclick={simulateInfo}>Simulate info</button>
			<button type="button" class="btn btn--ghost" onclick={clear}>Clear all</button>
		</div>
	</article>
</section>

<Toasts />

<style>
	section {
		--color-brand: oklch(68% 0.18 260);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.demo {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);

		& h2 {
			font-size: var(--text-lg);
			color: var(--color-brand);
			margin: 0 0 var(--space-sm);
		}
	}

	.demo__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		font-weight: 600;
		color: oklch(15% 0.02 270);
	}

	.btn--success {
		background: var(--color-success);
	}

	.btn--error {
		background: var(--color-error);
		color: oklch(98% 0.01 25);
	}

	.btn--info {
		background: var(--color-brand);
		color: oklch(98% 0.01 260);
	}

	.btn--ghost {
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}
</style>
