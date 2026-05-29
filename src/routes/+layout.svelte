<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="shell">
	<header class="shell__header">
		<a class="shell__brand" href="/">Ultimate Frontend</a>
		<nav class="shell__nav" aria-label="Primary">
			<a href="/">Home</a>
			<a href="/modules">Modules</a>
			<a href="/capstone">Capstone</a>
		</nav>
	</header>

	<main class="shell__main">
		{@render children()}
	</main>

	<footer class="shell__footer">
		<small>Svelte 5 · SvelteKit 2 · PE7 · May 2026 syntax</small>
	</footer>
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		min-block-size: 100dvb;
	}

	.shell__header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		background: var(--color-surface-2);
		border-block-end: 1px solid var(--color-border);
		position: sticky;
		inset-block-start: 0;
		z-index: 10;
		backdrop-filter: saturate(140%) blur(6px);
	}

	.shell__brand {
		font-weight: 700;
		font-size: var(--text-lg);
		text-decoration: none;
		color: var(--color-brand);
		letter-spacing: -0.01em;
	}

	.shell__nav {
		display: flex;
		gap: var(--space-md);
		font-size: var(--text-sm);

		& a {
			text-decoration: none;
			color: var(--color-text-muted);
			transition: color var(--dur-fast) var(--ease-out);

			&:hover,
			&:focus-visible {
				color: var(--color-text);
			}
		}
	}

	.shell__main {
		flex-grow: 1;
	}

	.shell__footer {
		padding-inline: var(--space-md);
		padding-block: var(--space-md);
		border-block-start: 1px solid var(--color-border);
		color: var(--color-text-muted);
		text-align: center;
	}
</style>
