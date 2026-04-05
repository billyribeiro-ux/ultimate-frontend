<script lang="ts">
	import { enhance } from '$app/forms';

	interface Note {
		id: string;
		title: string;
		body: string;
		createdAt: Date;
	}
	interface Issue {
		field: string;
		message: string;
	}
	type FormResult =
		| {
				which: 'create';
				ok?: true;
				values?: { title: string; body: string };
				issues?: Issue[];
		  }
		| {
				which: 'update';
				ok?: true;
				id?: string;
				values?: { title: string; body: string };
				issues?: Issue[];
		  }
		| { which: 'remove'; ok?: true; issues?: Issue[] }
		| null;

	let { data, form }: { data: { notes: Note[] }; form: FormResult } = $props();

	let editingId: string | null = $state(null);

	function issueFor(f: FormResult, field: string): string | undefined {
		return f && 'issues' in f && f.issues ? f.issues.find((i) => i.field === field)?.message : undefined;
	}
</script>

<svelte:head>
	<title>Lesson 10.6 · Server-side validation · Ultimate Frontend</title>
	<meta
		name="description"
		content="Valibot validation inside form actions, typed errors via ActionData, and inline edit with value repopulation."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/10-api-forms">← Module 10</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 10.6 · Validation</p>
		<h1>Server-side validation with Valibot + <code>ActionData</code></h1>
		<p class="lede">
			The Notes app, part 4: add edit. Full CRUD, fully typed, fully
			validated.
		</p>
	</header>

	<form method="POST" action="?/create" class="composer" use:enhance>
		<div class="field">
			<label for="create-title">Title</label>
			<input
				id="create-title"
				name="title"
				value={form?.which === 'create' ? (form.values?.title ?? '') : ''}
				aria-invalid={!!issueFor(form, 'title')}
			/>
			{#if form?.which === 'create' && issueFor(form, 'title')}
				<p class="err">{issueFor(form, 'title')}</p>
			{/if}
		</div>
		<div class="field">
			<label for="create-body">Body</label>
			<textarea
				id="create-body"
				name="body"
				rows="3"
				aria-invalid={!!issueFor(form, 'body')}
				>{form?.which === 'create' ? (form.values?.body ?? '') : ''}</textarea
			>
			{#if form?.which === 'create' && issueFor(form, 'body')}
				<p class="err">{issueFor(form, 'body')}</p>
			{/if}
		</div>
		<button type="submit">Create note</button>
	</form>

	<ul class="notes">
		{#each data.notes as n (n.id)}
			<li class="note">
				{#if editingId === n.id}
					<form
						method="POST"
						action="?/update"
						class="edit"
						use:enhance={() => {
							return async ({ update, result }) => {
								await update();
								if (result.type === 'success') editingId = null;
							};
						}}
					>
						<input type="hidden" name="id" value={n.id} />
						<div class="field">
							<label for="edit-title-{n.id}">Title</label>
							<input
								id="edit-title-{n.id}"
								name="title"
								value={form?.which === 'update' && form.id === n.id
									? (form.values?.title ?? n.title)
									: n.title}
								aria-invalid={form?.which === 'update' && form.id === n.id && !!issueFor(form, 'title')}
							/>
							{#if form?.which === 'update' && form.id === n.id && issueFor(form, 'title')}
								<p class="err">{issueFor(form, 'title')}</p>
							{/if}
						</div>
						<div class="field">
							<label for="edit-body-{n.id}">Body</label>
							<textarea
								id="edit-body-{n.id}"
								name="body"
								rows="3"
								aria-invalid={form?.which === 'update' && form.id === n.id && !!issueFor(form, 'body')}
								>{form?.which === 'update' && form.id === n.id
									? (form.values?.body ?? n.body)
									: n.body}</textarea
							>
							{#if form?.which === 'update' && form.id === n.id && issueFor(form, 'body')}
								<p class="err">{issueFor(form, 'body')}</p>
							{/if}
						</div>
						<div class="edit__actions">
							<button type="submit">Save</button>
							<button type="button" class="ghost" onclick={() => (editingId = null)}>
								Cancel
							</button>
						</div>
					</form>
				{:else}
					<div class="note__content">
						<h2>{n.title}</h2>
						<p>{n.body}</p>
						<time>{new Date(n.createdAt).toLocaleString()}</time>
					</div>
					<div class="note__actions">
						<button class="ghost" onclick={() => (editingId = n.id)}>Edit</button>
						<form method="POST" action="?/remove" use:enhance>
							<input type="hidden" name="id" value={n.id} />
							<button type="submit" aria-label="Delete note">×</button>
						</form>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(60% 0.14 60);
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
	.composer,
	.edit {
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
	[aria-invalid='true'] {
		border-color: var(--color-error);
	}
	button {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-weight: 600;
	}
	.composer button[type='submit'],
	.edit__actions button[type='submit'] {
		background: var(--color-brand);
		color: oklch(20% 0.02 60);
		justify-self: start;
	}
	.ghost {
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}
	.edit__actions {
		display: flex;
		gap: var(--space-sm);
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
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		display: grid;
		gap: var(--space-sm);
	}
	.note__content h2 {
		font-size: var(--text-lg);
		margin: 0;
	}
	.note__content time {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
	.note__actions {
		display: flex;
		gap: var(--space-sm);
		justify-content: flex-end;
	}
	.note__actions button[type='submit'] {
		color: var(--color-error);
	}
</style>
