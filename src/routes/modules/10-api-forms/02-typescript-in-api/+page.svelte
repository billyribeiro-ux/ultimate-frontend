<script lang="ts">
	interface Memo {
		id: string;
		title: string;
		createdAt: string;
	}

	const endpoint = '/modules/10-api-forms/02-typescript-in-api/api/memos';

	let title: string = $state('');
	let memos: Memo[] = $state([]);
	let err: string = $state('');
	let busy: boolean = $state(false);

	async function list(): Promise<void> {
		busy = true;
		err = '';
		try {
			const res = await fetch(endpoint);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data: { memos: Memo[] } = await res.json();
			memos = data.memos;
		} catch (e) {
			err = (e as Error).message;
		} finally {
			busy = false;
		}
	}

	async function create(): Promise<void> {
		busy = true;
		err = '';
		try {
			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title })
			});
			if (!res.ok) {
				err = `HTTP ${res.status}: ${await res.text()}`;
				return;
			}
			title = '';
			await list();
		} catch (e) {
			err = (e as Error).message;
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Lesson 10.2 · TypeScript in API routes · Ultimate Frontend</title>
	<meta
		name="description"
		content="Typed +server.ts handlers with RequestHandler generics, generated route types, and Valibot runtime validation."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/10-api-forms">← Module 10</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 10.2 · Typed endpoints</p>
		<h1>TypeScript in <code>+server.ts</code></h1>
		<p class="lede">
			Route-aware handler types, validated request bodies, and exported
			response interfaces.
		</p>
	</header>

	<div class="composer">
		<label for="title">Memo title</label>
		<input id="title" bind:value={title} placeholder="Buy milk" />
		<button onclick={create} disabled={busy || !title.trim()}>Create</button>
		<button class="ghost" onclick={list} disabled={busy}>List</button>
	</div>

	{#if err}<p class="err" role="alert">{err}</p>{/if}

	<ul class="memos">
		{#each memos as m (m.id)}
			<li>
				<p>{m.title}</p>
				<time>{new Date(m.createdAt).toLocaleString()}</time>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(62% 0.18 15);
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
	.composer {
		display: flex;
		gap: var(--space-sm);
		align-items: center;
		flex-wrap: wrap;
	}
	.composer label {
		font-weight: 600;
	}
	.composer input {
		flex: 1;
		min-inline-size: 12rem;
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.composer button {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
	}
	.composer button.ghost {
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}
	.composer button[disabled] {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.memos {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-sm);
	}
	.memos li {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}
	.memos p {
		margin: 0;
		font-weight: 600;
	}
	.memos time {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
	.err {
		color: var(--color-error);
		padding: var(--space-md);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
	}
</style>
