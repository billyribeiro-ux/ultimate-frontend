<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Note {
		id: string;
		title: string;
		body: string;
		createdAt: Date;
	}

	type FormResult =
		| { which: 'create'; ok?: true; title?: string; body?: string; error?: string }
		| { which: 'remove'; ok?: true; error?: string }
		| null;

	let { data, form }: { data: { notes: Note[] }; form: FormResult } = $props();

	let creating: boolean = $state(false);
	let deletingId: string | null = $state(null);

	const handleCreate: SubmitFunction = () => {
		creating = true;
		return async ({ update }) => {
			await update();
			creating = false;
		};
	};

	function handleDelete(id: string): SubmitFunction {
		return () => {
			deletingId = id;
			return async ({ update }) => {
				await update();
				deletingId = null;
			};
		};
	}
</script>

<svelte:head>
	<title>Lesson 10.5 · use:enhance · Ultimate Frontend</title>
	<meta
		name="description"
		content="Progressively enhance SvelteKit form actions with use:enhance, custom SubmitFunction, and typed pending state."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/10-api-forms">← Module 10</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 10.5 · use:enhance</p>
		<h1>Progressive enhancement, Svelte style</h1>
		<p class="lede">
			The Notes app, part 3: same server code, same no-JS fallback, no more
			full-page reloads.
		</p>
	</header>

	<form method="POST" action="?/create" class="composer" use:enhance={handleCreate}>
		<div class="field">
			<label for="title">Title</label>
			<input id="title" name="title" value={form?.which === 'create' ? (form.title ?? '') : ''} />
		</div>
		<div class="field">
			<label for="body">Body</label>
			<textarea id="body" name="body" rows="3"
				>{form?.which === 'create' ? (form.body ?? '') : ''}</textarea
			>
		</div>
		{#if form?.which === 'create' && form.error}
			<p class="err">{form.error}</p>
		{/if}
		<button type="submit" disabled={creating}>
			{creating ? 'Saving…' : 'Create note'}
		</button>
	</form>

	<ul class="notes">
		{#each data.notes as n (n.id)}
			<li class="note" class:note--deleting={deletingId === n.id}>
				<div class="note__content">
					<h2>{n.title}</h2>
					<p>{n.body}</p>
					<time>{new Date(n.createdAt).toLocaleString()}</time>
				</div>
				<form method="POST" action="?/remove" use:enhance={handleDelete(n.id)} class="note__del">
					<input type="hidden" name="id" value={n.id} />
					<button type="submit" aria-label="Delete note" disabled={deletingId === n.id}>
						{deletingId === n.id ? '…' : '×'}
					</button>
				</form>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(55% 0.2 290);
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
		display: grid;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}
	.field {
		display: grid;
		gap: var(--space-xs);
	}
	.field label {
		font-weight: 600;
	}
	.field input,
	.field textarea {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font: inherit;
	}
	.composer button {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
		justify-self: start;
	}
	.composer button[disabled] {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.err {
		color: var(--color-error);
		font-size: var(--text-sm);
		margin: 0;
	}
	.notes {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-sm);
	}
	.note {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		transition: opacity var(--dur-fast) var(--ease-out);
	}
	.note--deleting {
		opacity: 0.5;
	}
	.note__content h2 {
		font-size: var(--text-lg);
		margin: 0;
	}
	.note__content p {
		margin: var(--space-xs) 0;
	}
	.note__content time {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
	.note__del button {
		min-block-size: 44px;
		min-inline-size: 44px;
		font-size: var(--text-lg);
		color: var(--color-error);
		border-radius: var(--radius-md);
	}
</style>
