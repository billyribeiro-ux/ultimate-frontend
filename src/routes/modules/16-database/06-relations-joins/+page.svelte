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
		tags: Tag[];
	}

	interface FormResult {
		error?: string;
		tagCreated?: boolean;
		tagAssigned?: boolean;
	}

	let { data, form }: { data: PageData; form: FormResult | null } = $props();
</script>

<svelte:head>
	<title>Lesson 16.6 · Relations and joins · Ultimate Frontend</title>
	<meta
		name="description"
		content="Loading notes with their user and tags using Drizzle's relational query API — one query, fully typed nested data."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/16-database">← Module 16</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 16.6 · Mini-build</p>
		<h1>Notes with relations</h1>
		<p class="lede">
			Each note shows its author and tags — all loaded in a single
			<code>db.query</code> call with nested <code>with</code> clauses.
		</p>
	</header>

	{#if form?.error}
		<p class="message message--error" role="alert">{form.error}</p>
	{/if}
	{#if form?.tagCreated}
		<p class="message message--success" role="status">Tag created.</p>
	{/if}
	{#if form?.tagAssigned}
		<p class="message message--success" role="status">Tag assigned to note.</p>
	{/if}

	<form method="POST" action="?/createTag" class="tag-form">
		<label for="tag-name">New tag</label>
		<div class="tag-form__row">
			<input id="tag-name" name="name" placeholder="e.g. svelte" required />
			<button type="submit">Add tag</button>
		</div>
	</form>

	{#if data.tags.length > 0}
		<div class="existing-tags">
			<p class="existing-tags__label">Available tags:</p>
			<ul class="tag-pills">
				{#each data.tags as tag (tag.id)}
					<li class="tag-pill">{tag.name}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<section aria-labelledby="notes-heading">
		<h2 id="notes-heading">Notes ({data.notes.length})</h2>
		{#if data.notes.length === 0}
			<p class="empty">No notes yet. Create some in <a href="/modules/16-database/05-crud">Lesson 16.5</a>.</p>
		{:else}
			<ul class="notes-list">
				{#each data.notes as note (note.id)}
					<li class="note-card">
						<div class="note-card__header">
							<h3>{note.title}</h3>
							<span class="note-card__author">by {note.user.name}</span>
						</div>
						{#if note.content}
							<p class="note-card__content">{note.content}</p>
						{/if}
						{#if note.notesTags.length > 0}
							<ul class="tag-pills tag-pills--small">
								{#each note.notesTags as nt (nt.tagId)}
									<li class="tag-pill">{nt.tag.name}</li>
								{/each}
							</ul>
						{/if}
						{#if data.tags.length > 0}
							<form method="POST" action="?/assignTag" class="assign-form">
								<input type="hidden" name="noteId" value={note.id} />
								<select name="tagId" aria-label="Select tag for {note.title}">
									{#each data.tags as tag (tag.id)}
										<option value={tag.id}>{tag.name}</option>
									{/each}
								</select>
								<button type="submit">Assign</button>
							</form>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</section>

<style>
	section.page {
		--color-brand: oklch(63% 0.2 280);
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

	.tag-form {
		display: grid;
		gap: var(--space-xs);
	}

	.tag-form label {
		font-weight: 600;
		font-size: var(--text-sm);
	}

	.tag-form__row {
		display: flex;
		gap: var(--space-sm);
	}

	.tag-form__row input {
		flex: 1;
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font: inherit;
	}

	.tag-form__row button {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
		white-space: nowrap;
	}

	.existing-tags {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.existing-tags__label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	.tag-pills {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.tag-pill {
		background: oklch(63% 0.2 280 / 0.15);
		color: var(--color-brand);
		padding: 0.2em 0.7em;
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: 500;
	}

	.tag-pills--small .tag-pill {
		font-size: var(--text-xs);
		padding: 0.15em 0.5em;
	}

	.empty {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.empty a {
		color: var(--color-brand);
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
		display: grid;
		gap: var(--space-sm);
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
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	.assign-form {
		display: flex;
		gap: var(--space-xs);
		align-items: center;
	}

	.assign-form select {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font: inherit;
	}

	.assign-form button {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface);
		border: 1px solid var(--color-brand);
		color: var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
	}
</style>
