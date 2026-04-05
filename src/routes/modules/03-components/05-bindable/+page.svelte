<!--
	Lesson 3.5 mini-build — Two-way binding with $bindable.
	Demonstrates Input (bind:value) and Modal (bind:open) as two canonical patterns.
-->
<script lang="ts">
	import Input from '$lib/components/Input.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let name: string = $state('Ada');
	let isOpen: boolean = $state(false);

	function openModal(): void {
		isOpen = true;
	}
</script>

<svelte:head>
	<title>Lesson 3.5 · $bindable · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 3.5 mini-build: two-way binding with $bindable() on an Input and a Modal component."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/03-components">← Module 3</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 3.5 · Mini-build</p>
		<h1>Bindable props in action</h1>
		<p class="lede">
			Type your name. The greeting below updates live because
			<code>$bindable()</code> opens the <code>value</code> prop to two-way binding.
		</p>
	</header>

	<form class="form" onsubmit={(event: SubmitEvent) => event.preventDefault()}>
		<Input id="name" label="Your name" bind:value={name} />
		<p class="preview">Hello, <strong>{name}</strong></p>

		<button type="button" class="btn" onclick={openModal}>Open modal</button>
	</form>

	<Modal title="Hi there" bind:open={isOpen}>
		<p>
			Close this with the X button, the Escape key, or clicking the backdrop. The parent's
			<code>isOpen</code> state updates automatically because <code>open</code> is
			<code>$bindable()</code>.
		</p>
	</Modal>
</section>

<style>
	section {
		--color-brand: oklch(65% 0.2 150);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;

			&:hover {
				color: var(--color-brand);
			}
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-lg);
	}

	.preview {
		font-size: var(--text-lg);
		margin: 0;
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: oklch(99% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
		align-self: flex-start;
	}
</style>
