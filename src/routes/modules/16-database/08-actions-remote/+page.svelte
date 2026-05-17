<script lang="ts">
	interface Tag {
		id: number;
		name: string;
	}

	interface NoteWithRelations {
		id: number;
		title: string;
		content: string;
		userId: number;
		createdAt: string;
		updatedAt: string;
		user: { id: number; name: string; email: string; createdAt: string };
		notesTags: Array<{ noteId: number; tagId: number; tag: Tag }>;
	}

	interface PageData {
		notes: NoteWithRelations[];
	}

	interface FormResult {
		error?: string;
		title?: string;
		content?: string;
		success?: boolean;
		noteId?: number;
		updated?: boolean;
		deleted?: boolean;
	}

	let { data, form }: { data: PageData; form: FormResult | null } = $props();

	let editingId: number | null = $state(null);

	function startEdit(noteId: number): void {
		editingId = noteId;
	}

	function cancelEdit(): void {
		editingId = null;
	}
</script>

<svelte:head>
	<title>Lesson 16.8 · Actions and remote functions · Ultimate Frontend</title>
	<meta
		name="description"
		content="Full CRUD with SvelteKit form actions and transactions — create, update, and delete notes in a real database."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/16-database">← Module 16</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 16.8 · Mini-build</p>
		<h1>Full CRUD with form actions</h1>
		<p class="lede">
			Create, edit, and delete notes using SvelteKit form actions with database
			transactions. Works without JavaScript — progressive enhancement built in.
		</p>
	</header>

	{#if form?.error}
		<p class="message message--error" role="alert">{form.error}</p>
	{/if}
	{#if form?.success}
		<p class="message message--success" role="status">Note created.</p>
	{/if}
	{#if form?.updated}
		<p class="message message--success" role="status">Note updated.</p>
	{/if}
	{#if form?.deleted}
		<p class="message message--success" role="status">Note deleted.</p>
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
		<h2 id="notes-heading">Notes ({data.notes.length})</h2>
		{#if data.notes.length === 0}
			<p class="empty">No notes yet. Create one above.</p>
		{:else}
			<ul class="notes-list">
				{#each data.notes as note (note.id)}
					<li class="note-card">
						{#if editingId === note.id}
							<form method="POST" action="?/update" class="edit-form">
								<input type="hidden" name="id" value={note.id} />
								<div class="field">
									<label for="edit-title-{note.id}">Title</label>
									<input id="edit-title-{note.id}" name="title" value={note.title} required />
								</div>
								<div class="field">
									<label for="edit-content-{note.id}">Content</label>
									<textarea id="edit-content-{note.id}" name="content" rows="3">{note.content}</textarea>
								</div>
								<div class="edit-form__actions">
									<button type="submit" class="btn-save">Save</button>
									<button type="button" class="btn-cancel" onclick={cancelEdit}>Cancel</button>
								</div>
							</form>
						{:else}
							<div class="note-card__header">
								<h3>{note.title}</h3>
								<span class="note-card__author">by {note.user.name}</span>
							</div>
							{#if note.content}
								<p class="note-card__content">{note.content}</p>
							{/if}
							{#if note.notesTags.length > 0}
								<ul class="tag-pills">
									{#each note.notesTags as nt (nt.tagId)}
										<li class="tag-pill">{nt.tag.name}</li>
									{/each}
								</ul>
							{/if}
							<footer class="note-card__actions">
								<button type="button" class="btn-edit" onclick={() => startEdit(note.id)}>
									Edit
								</button>
								<form method="POST" action="?/delete">
									<input type="hidden" name="id" value={note.id} />
									<button type="submit" class="btn-delete">Delete</button>
								</form>
							</footer>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<article class="explanation">
		<h2>What happens on delete</h2>
		<p>
			Deleting a note uses a <strong>transaction</strong>: first the junction rows in
			<code>notes_tags</code> are removed, then the note itself. If either step fails,
			both are rolled back — atomicity in action.
		</p>
	</article>
</section>

<style>
	section.page {
		--color-brand: oklch(62% 0.18 35);
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
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.note-card__header {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.note-card__header h3 {
		font-size: var(--text-base);
		margin: 0;
	}

	.note-card__author {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.note-card__content {
		margin: var(--space-xs) 0 0;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.tag-pills {
		list-style: none;
		padding: 0;
		margin: var(--space-sm) 0 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.tag-pill {
		background: oklch(62% 0.18 35 / 0.15);
		color: var(--color-brand);
		padding: 0.15em 0.5em;
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: 500;
	}

	.note-card__actions {
		display: flex;
		gap: var(--space-sm);
		margin-block-start: var(--space-sm);
		padding-block-start: var(--space-sm);
		border-block-start: 1px solid var(--color-border);
	}

	.note-card__actions form {
		display: contents;
	}

	.btn-edit {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface);
		border: 1px solid var(--color-brand);
		color: var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
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

	.edit-form {
		display: grid;
		gap: var(--space-sm);
	}

	.edit-form__actions {
		display: flex;
		gap: var(--space-sm);
	}

	.btn-save {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-success);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.btn-cancel {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
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
