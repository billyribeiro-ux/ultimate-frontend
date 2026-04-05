<!--
	Lesson 4.2 mini-build — Four-state fetch panel.
	Demonstrates {#if} / {:else if} / {:else} and a string-literal union type.
-->
<script lang="ts">
	type Status = 'idle' | 'loading' | 'success' | 'error';

	let status: Status = $state('idle');

	function simulate(result: 'success' | 'error'): void {
		status = 'loading';
		setTimeout((): void => {
			status = result;
		}, 800);
	}

	function reset(): void {
		status = 'idle';
	}
</script>

<svelte:head>
	<title>Lesson 4.2 · else if · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 4.2 mini-build: multi-branch logic with #if / :else if / :else modelling a four-state fetch panel."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/04-control-flow">← Module 4</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 4.2 · Mini-build</p>
		<h1>One chain, four states</h1>
		<p class="lede">
			One <code>status</code> variable, four mutually-exclusive UI states, one
			<code>#if</code> chain with <code>:else if</code> and <code>:else</code>.
		</p>
	</header>

	<div class="controls">
		<button type="button" class="btn" onclick={() => simulate('success')}>Succeed</button>
		<button type="button" class="btn btn--danger" onclick={() => simulate('error')}>Fail</button>
		<button type="button" class="btn btn--ghost" onclick={reset}>Reset</button>
	</div>

	<div class="panel" aria-live="polite">
		{#if status === 'idle'}
			<p>Press a button to simulate a request.</p>
		{:else if status === 'loading'}
			<p class="loading">Loading…</p>
		{:else if status === 'success'}
			<p class="success">Success — the request returned 200 OK.</p>
		{:else}
			<p class="error">Something went wrong. Try again.</p>
		{/if}
	</div>
</section>

<style>
	section {
		--color-brand: oklch(66% 0.2 140);
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

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: oklch(99% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.btn--danger {
		background: var(--color-error);
	}

	.btn--ghost {
		background: transparent;
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.panel {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		min-block-size: 5rem;
	}

	.loading {
		color: var(--color-text-muted);
	}

	.success {
		color: var(--color-success);
	}

	.error {
		color: var(--color-error);
	}
</style>
