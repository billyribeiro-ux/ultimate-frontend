<script lang="ts">
	let { data, form }: { data: { memoryCount: number; dbCount: number }; form: { incremented?: 'memory' | 'db' } | null } = $props();
</script>

<svelte:head>
	<title>Lesson 16.1 · What a database is · Ultimate Frontend</title>
	<meta
		name="description"
		content="Demonstrating why SvelteKit needs a database by comparing in-memory state with persistent SQLite storage."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/16-database">← Module 16</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 16.1 · Mini-build</p>
		<h1>In-memory vs database persistence</h1>
		<p class="lede">
			Click both counters, then restart the dev server. The in-memory counter
			resets to zero. The database counter survives.
		</p>
	</header>

	<div class="comparison">
		<article class="counter-card counter-card--memory">
			<h2>In-memory counter</h2>
			<p class="counter-card__value">{data.memoryCount}</p>
			<p class="counter-card__note">Resets on server restart</p>
			<form method="POST" action="?/incrementMemory">
				<button type="submit">Increment</button>
			</form>
		</article>

		<article class="counter-card counter-card--db">
			<h2>Database counter</h2>
			<p class="counter-card__value">{data.dbCount}</p>
			<p class="counter-card__note">Persists across restarts</p>
			<form method="POST" action="?/incrementDb">
				<button type="submit">Increment</button>
			</form>
		</article>
	</div>

	{#if form?.incremented}
		<p class="toast" role="status">
			Incremented the {form.incremented === 'memory' ? 'in-memory' : 'database'} counter.
		</p>
	{/if}

	<article class="explanation">
		<h2>Why this matters</h2>
		<p>
			The in-memory counter lives as a JavaScript variable inside the server process.
			When the process stops (restart, crash, deploy), the variable is gone forever.
		</p>
		<p>
			The database counter is stored in a file on disk (<code>data/dev.db</code>).
			SQLite reads and writes this file independently of your application process.
			Stop the server, start it again — the count remains.
		</p>
	</article>
</section>

<style>
	section.page {
		--color-brand: oklch(65% 0.19 195);
	}

	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: var(--text-sm);
		min-block-size: 44px;
		display: inline-flex;
		align-items: center;
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		max-inline-size: var(--prose-max);
	}

	.comparison {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.comparison {
			grid-template-columns: 1fr 1fr;
		}
	}

	.counter-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.counter-card--memory {
		border-inline-start: 4px solid var(--color-warning);
	}

	.counter-card--db {
		border-inline-start: 4px solid var(--color-success);
	}

	.counter-card h2 {
		font-size: var(--text-lg);
		margin: 0;
	}

	.counter-card__value {
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--color-brand);
		margin: var(--space-sm) 0;
	}

	.counter-card__note {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-md);
	}

	.counter-card button {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.toast {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-md);
		color: var(--color-success);
		font-size: var(--text-sm);
	}

	.explanation {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}

	.explanation h2 {
		font-size: var(--text-lg);
		margin: 0 0 var(--space-sm);
	}
</style>
