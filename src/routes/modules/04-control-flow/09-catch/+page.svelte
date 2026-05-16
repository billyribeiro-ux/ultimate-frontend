<!--
	Lesson 4.9 mini-build — Typed error narrowing in a Svelte {:catch} branch.
	Four subclasses of Error map to four distinct error panels.
-->
<script lang="ts">
	class NetworkError extends Error {
		name = 'NetworkError';
	}
	class AuthError extends Error {
		name = 'AuthError';
	}
	class NotFoundError extends Error {
		name = 'NotFoundError';
	}

	type Kind = 'ok' | 'network' | 'auth' | 'notfound' | 'other';

	async function simulate(kind: Kind): Promise<string> {
		await new Promise<void>((resolve) => setTimeout(resolve, 400));
		if (kind === 'network') throw new NetworkError('You appear to be offline.');
		if (kind === 'auth') throw new AuthError('Sign in required.');
		if (kind === 'notfound') throw new NotFoundError('This resource does not exist.');
		if (kind === 'other') throw new Error('Unexpected server error.');
		return 'Loaded successfully.';
	}

	let promise: Promise<string> = $state(simulate('ok'));

	function trigger(kind: Kind): void {
		promise = simulate(kind);
	}
</script>

<svelte:head>
	<title>Lesson 4.9 · catch · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 4.9 mini-build: four custom Error subclasses narrowed in a Svelte catch branch, each rendered as a distinct panel."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/04-control-flow">← Module 4</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 4.9 · Mini-build</p>
		<h1>Four errors, four panels</h1>
		<p class="lede">
			A <code>:catch</code> branch narrows the <code>unknown</code> error to a specific
			subclass and renders a matching panel.
		</p>
	</header>

	<div class="controls">
		<button type="button" class="btn" onclick={() => trigger('ok')}>Succeed</button>
		<button type="button" class="btn btn--warning" onclick={() => trigger('network')}>
			Network
		</button>
		<button type="button" class="btn btn--brand" onclick={() => trigger('auth')}>Auth</button>
		<button type="button" class="btn btn--muted" onclick={() => trigger('notfound')}>
			404
		</button>
		<button type="button" class="btn btn--danger" onclick={() => trigger('other')}>Other</button>
	</div>

	{#await promise}
		<p class="status">Working…</p>
	{:then value}
		<p class="panel panel--ok">{value}</p>
	{:catch err}
		{#if err instanceof NetworkError}
			<p class="panel panel--network"><strong>Network:</strong> {err.message}</p>
		{:else if err instanceof AuthError}
			<p class="panel panel--auth"><strong>Auth:</strong> {err.message}</p>
		{:else if err instanceof NotFoundError}
			<p class="panel panel--404"><strong>Not found:</strong> {err.message}</p>
		{:else}
			<p class="panel panel--error">
				<strong>Error:</strong> {err instanceof Error ? err.message : 'Unknown'}
			</p>
		{/if}
	{/await}
</section>

<style>
	section {
		--color-brand: oklch(66% 0.2 30);
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
		background: var(--color-success);
		color: oklch(15% 0.02 145);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.btn--warning {
		background: var(--color-warning);
		color: oklch(15% 0.02 85);
	}

	.btn--brand {
		background: var(--color-brand);
		color: oklch(99% 0 0);
	}

	.btn--muted {
		background: var(--color-border);
		color: var(--color-text);
	}

	.btn--danger {
		background: var(--color-error);
		color: oklch(99% 0 0);
	}

	.status {
		color: var(--color-text-muted);
	}

	.panel {
		padding: var(--space-md);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.panel--ok {
		background: oklch(from var(--color-success) 96% 0.03 h);
		border-color: var(--color-success);
	}

	.panel--network {
		background: oklch(from var(--color-warning) 96% 0.03 h);
		border-color: var(--color-warning);
	}

	.panel--auth {
		background: oklch(from var(--color-brand) 96% 0.03 h);
		border-color: var(--color-brand);
	}

	.panel--404 {
		background: var(--color-surface-2);
	}

	.panel--error {
		background: oklch(from var(--color-error) 96% 0.03 h);
		border-color: var(--color-error);
	}
</style>
