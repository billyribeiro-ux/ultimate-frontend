<!--
	Lesson 3.9 mini-build — CSS custom properties as the bridge.
	Four zones each retune --btn-bg, --btn-fg, --btn-bg-hover on a wrapper,
	and the Button file is never touched.
-->
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Lesson 3.9 · CSS variables bridge · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 3.9 mini-build: retune a shared Button component's look from a parent using CSS custom properties."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/03-components">← Module 3</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 3.9 · Mini-build</p>
		<h1>One Button, four personalities</h1>
		<p class="lede">
			The same <code>Button.svelte</code> rendered four times. Each wrapper sets
			<code>--btn-bg</code> and friends, and the cascade carries the values into the button
			without ever touching its file.
		</p>
	</header>

	<div class="zones">
		<div class="zone zone--default">
			<Button>Default</Button>
		</div>
		<div class="zone zone--danger">
			<Button>Delete</Button>
		</div>
		<div class="zone zone--success">
			<Button>Publish</Button>
		</div>
		<div class="zone zone--warning">
			<Button>Archive</Button>
		</div>
	</div>
</section>

<style>
	section {
		--color-brand: oklch(66% 0.2 20);
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

	.zones {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-sm);

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}

		@media (min-width: 768px) {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.zone {
		display: flex;
		justify-content: center;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}

	.zone--danger {
		--btn-bg: var(--color-error);
		--btn-fg: oklch(99% 0 0);
		--btn-bg-hover: oklch(from var(--color-error) 50% c h);
	}

	.zone--success {
		--btn-bg: var(--color-success);
		--btn-fg: oklch(15% 0.02 145);
		--btn-bg-hover: oklch(from var(--color-success) 55% c h);
	}

	.zone--warning {
		--btn-bg: var(--color-warning);
		--btn-fg: oklch(15% 0.02 85);
		--btn-bg-hover: oklch(from var(--color-warning) 65% c h);
	}
</style>
