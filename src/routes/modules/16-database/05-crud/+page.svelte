<script lang="ts">
	import type { InferSelectModel } from 'drizzle-orm';
	import type { notes } from '$lib/server/db/schema';

	type Note = InferSelectModel<typeof notes>;

	interface PageData {
		notes: Note[];
	}

	interface FormResult {
		error?: string;
		title?: string;
		content?: string;
		success?: boolean;
		noteId?: number;
		deleted?: boolean;
		updated?: boolean;
	}

	let { data, form }: { data: PageData; form: FormResult | null } = $props();
</script>

<svelte:head>
	<title>Lesson 16.5 · CRUD with Drizzle · Ultimate Frontend</title>
	<meta
		name="description"
		content="A complete CRUD interface for notes: create, read, update, and delete with Drizzle ORM and SQLite."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/16-database">← Module 16</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 16.5 · Mini-build</p>
		<h1>Notes CRUD playground</h1>
		<p class="lede">
			Create, read, update, and delete notes. All operations write to the
			SQLite database and persist across server restarts.
		</p>
	</header>

	{#if form?.error}
		<p class="message message--error" role="alert">{form.error}</p>
	{/if}
	{#if form?.success}
		<p class="message message--success" role="status">Note created successfully.</p>
	{/if}
	{#if form?.deleted}
		<p class="message message--success" role="status">Note deleted.</p>
	{/if}
	{#if form?.updated}
		<p class="message message--success" role="status">Note updated.</p>
	{/if}

	<form method="POST" action="?/create" class="composer">
		<h2>Create a note</h2>
		<div class="field">
			<label for="title">Title</label>
			<input
				id="title"
				name="title"
				value={form?.title ?? ''}
				required
				aria-invalid={form?.error ? 'true' : undefined}
			/>
		</div>
		<div class="field">
			<label for="content">Content</label>
			<textarea id="content" name="content" rows="3">{form?.content ?? ''}</textarea>
		</div>
		<button type="submit">Create note</button>
	</form>

	<section aria-labelledby="notes-heading">
		<h2 id="notes-heading">All notes ({data.notes.length})</h2>
		{#if data.notes.length === 0}
			<p class="empty">No notes yet. Create one above.</p>
		{:else}
			<ul class="notes-list">
				{#each data.notes as note (note.id)}
					<li class="note-card">
						<div class="note-card__body">
							<h3>{note.title}</h3>
							{#if note.content}
								<p>{note.content}</p>
							{/if}
							<time class="note-card__time">
								{new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
							</time>
						</div>
						<form method="POST" action="?/delete" class="note-card__actions">
							<input type="hidden" name="id" value={note.id} />
							<button type="submit" class="btn-delete" aria-label="Delete note: {note.title}">
								Delete
							</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</section>

<style>
	section.page {
		--color-brand: oklch(60% 0.22 145);
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

	.message {
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}

	.message--error {
		background: oklch(60% 0.22 25 / 0.1);
		border: 1px solid var(--color-error);
		color: var(--color-error);
	}

	.message--success {
		background: oklch(65% 0.18 145 / 0.1);
		border: 1px solid var(--color-success);
		color: var(--color-success);
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

	.composer h2 {
		font-size: var(--text-lg);
		margin: 0;
	}

	.field {
		display: grid;
		gap: var(--space-xs);
	}

	.field label {
		font-weight: 600;
		font-size: var(--text-sm);
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

	.field input:focus,
	.field textarea:focus {
		outline: 2px solid var(--color-brand);
		outline-offset: 2px;
	}

	[aria-invalid='true'] {
		border-color: var(--color-error);
	}

	.composer button[type='submit'] {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
		justify-self: start;
	}

	.empty {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.notes-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.note-card {
		display: flex;
		align-items: start;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.note-card__body {
		flex: 1;
	}

	.note-card__body h3 {
		font-size: var(--text-base);
		margin: 0;
	}

	.note-card__body p {
		margin: var(--space-xs) 0 0;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.note-card__time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.btn-delete {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-error);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
	}
</style>
