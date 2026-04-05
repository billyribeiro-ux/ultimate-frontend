<script lang="ts">
	let name: string = $state('Ada');
	let result: string = $state('');
	let err: string = $state('');
	let busy: boolean = $state(false);

	async function call(): Promise<void> {
		busy = true;
		err = '';
		result = '';
		try {
			const res = await fetch(
				`/modules/10-api-forms/01-server-endpoints/api/greeting?name=${encodeURIComponent(name)}`
			);
			if (!res.ok) {
				err = `HTTP ${res.status}: ${await res.text()}`;
				return;
			}
			const data: { message: string; at: string } = await res.json();
			result = `${data.message} (at ${new Date(data.at).toLocaleTimeString()})`;
		} catch (e) {
			err = (e as Error).message;
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Lesson 10.1 · +server.ts endpoints · Ultimate Frontend</title>
	<meta
		name="description"
		content="Building HTTP API endpoints with +server.ts, typed RequestHandler, json() and error() helpers."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/10-api-forms">← Module 10</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 10.1 · API endpoints</p>
		<h1><code>+server.ts</code> — a public URL</h1>
		<p class="lede">
			A colocated GET endpoint returning JSON, typed with <code>RequestHandler</code>,
			called from the page via <code>fetch</code>.
		</p>
	</header>

	<div class="console">
		<label for="name">Name</label>
		<input id="name" bind:value={name} />
		<button onclick={call} disabled={busy}>
			{busy ? 'Calling…' : 'Call endpoint'}
		</button>
	</div>

	{#if result}
		<p class="ok" role="status">{result}</p>
	{/if}
	{#if err}
		<p class="err" role="alert">{err}</p>
	{/if}

	<aside class="explain">
		<h2>Try it directly</h2>
		<p>
			Open
			<a href="/modules/10-api-forms/01-server-endpoints/api/greeting?name=You">
				/modules/10-api-forms/01-server-endpoints/api/greeting?name=You
			</a>
			in a new tab. You will see the raw JSON response — the endpoint is as
			public as any URL on the internet.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(65% 0.15 25);
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
	.console {
		display: flex;
		gap: var(--space-sm);
		align-items: center;
		flex-wrap: wrap;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}
	.console label {
		font-weight: 600;
	}
	.console input {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		flex: 1;
		min-inline-size: 10rem;
	}
	.console button {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
	}
	.console button[disabled] {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.ok {
		color: var(--color-success);
		padding: var(--space-md);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-md);
	}
	.err {
		color: var(--color-error);
		padding: var(--space-md);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
	}
	.explain {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}
	.explain h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}
</style>
