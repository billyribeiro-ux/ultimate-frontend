<!--
	Lesson 12.8 — Accessibility: ARIA, keyboard, focus management
	Mini-build: a form with labels, a focus-trapped modal, a skip link,
	and a live region that announces submissions.
-->
<script lang="ts">
	import { focusTrap } from '$lib/actions/focus-trap.svelte';

	let modalOpen = $state<boolean>(false);
	let name = $state<string>('');
	let email = $state<string>('');
	let message = $state<string>('');
	let toast = $state<string>('');

	function openModal(): void {
		modalOpen = true;
	}

	function closeModal(): void {
		modalOpen = false;
	}

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		toast = `Thank you, ${name || 'friend'}, your message was received.`;
		setTimeout(() => (toast = ''), 4000);
		name = '';
		email = '';
		message = '';
	}

	function onKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && modalOpen) closeModal();
	}
</script>

<svelte:head>
	<title>Lesson 12.8 · Accessibility · Ultimate Frontend</title>
	<meta
		name="description"
		content="An accessible form with a focus-trapped modal, a skip link, and an aria-live region announcing submissions."
	/>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<a href="#main" class="skip-link">Skip to main content</a>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.8 · Mini-build</p>
		<h1 id="main">Accessible by default</h1>
		<p class="lede">
			Semantic HTML, visible labels, focus management, and a live region — the five patterns
			that cover 90 % of real accessibility work.
		</p>
	</header>

	<form class="form" onsubmit={submit} aria-label="Contact form">
		<label class="field">
			<span>Name</span>
			<input type="text" required bind:value={name} />
		</label>
		<label class="field">
			<span>Email</span>
			<input type="email" required bind:value={email} />
		</label>
		<label class="field">
			<span>Message</span>
			<textarea required bind:value={message} rows="4"></textarea>
		</label>
		<div class="actions">
			<button type="submit">Send</button>
			<button type="button" class="secondary" onclick={openModal}>Open modal</button>
		</div>
	</form>

	<div class="toast" role="status" aria-live="polite">
		{#if toast}
			<p>{toast}</p>
		{/if}
	</div>
</section>

{#if modalOpen}
	<div class="overlay">
		<!-- The backdrop is a real <button> so its dismiss action is keyboard-
		     reachable, not a click handler on a non-interactive element. -->
		<button type="button" class="overlay__backdrop" aria-label="Close dialog" onclick={closeModal}
		></button>
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			tabindex="-1"
			use:focusTrap
		>
			<h2 id="modal-title">A focus-trapped modal</h2>
			<p>Press Tab and Shift+Tab to cycle inside this modal. Press Escape to close it.</p>
			<button type="button" onclick={closeModal}>Close</button>
		</div>
	</div>
{/if}

<style>
	.skip-link {
		position: absolute;
		inset-block-start: -100%;
		inset-inline-start: 0;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(15% 0.02 180);
		font-weight: 700;
		z-index: 100;
	}

	.skip-link:focus-visible {
		inset-block-start: 0;
	}

	section {
		--color-brand: oklch(68% 0.18 180);
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

	.form {
		display: grid;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.field {
		display: grid;
		gap: var(--space-xs);
	}

	.field span {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.field input,
	.field textarea {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.actions {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	button {
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-brand);
		color: oklch(15% 0.02 180);
		border-radius: var(--radius-md);
		font-weight: 700;
	}

	button.secondary {
		background: var(--color-surface);
		color: var(--color-brand);
		border: 1px solid var(--color-brand);
	}

	.toast {
		min-block-size: 2rem;
	}

	.toast p {
		padding: var(--space-sm) var(--space-md);
		background: oklch(from var(--color-success) 96% 0.03 h);
		color: var(--color-success);
		border-inline-start: 3px solid var(--color-success);
		border-radius: var(--radius-md);
		margin: 0;
	}

	.overlay {
		position: fixed;
		inset: 0;
		display: grid;
		place-items: center;
		z-index: 50;
	}

	.overlay__backdrop {
		position: absolute;
		inset: 0;
		border: 0;
		padding: 0;
		background: oklch(0% 0 0 / 0.5);
		cursor: pointer;
	}

	.modal {
		position: relative;
		background: var(--color-surface);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		max-inline-size: min(90vw, 30rem);
		display: grid;
		gap: var(--space-md);
	}

	.modal h2 {
		font-size: var(--text-xl);
		margin: 0;
	}
</style>
