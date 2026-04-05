<script lang="ts">
	interface Note {
		id: string;
		title: string;
		body: string;
		createdAt: Date;
	}
	interface FormResult {
		missing?: 'title' | 'body';
		title?: string;
		body?: string;
		created?: string;
	}
	interface PageData {
		notes: Note[];
	}

	let { data, form }: { data: PageData; form: FormResult | null } = $props();
</script>

<svelte:head>
	<title>Lesson 10.3 · Form actions · Ultimate Frontend</title>
	<meta
		name="description"
		content="The classic SvelteKit actions export, working without JavaScript and re-rendering with fail() results."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/10-api-forms">← Module 10</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 10.3 · Form actions</p>
		<h1>The <code>actions</code> export — no JS required</h1>
		<p class="lede">
			The Notes app, part 1: create a note with a default action that
			degrades gracefully when JavaScript is unavailable.
		</p>
	</header>

	<form method="POST" class="composer">
		<div class="field">
			<label for="title">Title</label>
			<input
				id="title"
				name="title"
				value={form?.title ?? ''}
				aria-invalid={form?.missing === 'title'}
			/>
			{#if form?.missing === 'title'}<p class="err">Title is required</p>{/if}
		</div>
		<div class="field">
			<label for="body">Body</label>
			<textarea id="body" name="body" rows="3">{form?.body ?? ''}</textarea>
			{#if form?.missing === 'body'}<p class="err">Body is required</p>{/if}
		</div>
		<button type="submit">Create note</button>
	</form>

	{#if form?.created}
		<p class="ok" role="status">Created "{form.title}".</p>
	{/if}

	<ul class="notes">
		{#each data.notes as n (n.id)}
			<li>
				<h2>{n.title}</h2>
				<p>{n.body}</p>
				<time>{new Date(n.createdAt).toLocaleString()}</time>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(55% 0.18 230);
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
	[aria-invalid='true'] {
		border-color: var(--color-error);
	}
	.err {
		color: var(--color-error);
		font-size: var(--text-sm);
		margin: 0;
	}
	button[type='submit'] {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
		justify-self: start;
	}
	.ok {
		color: var(--color-success);
		padding: var(--space-md);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-md);
	}
	.notes {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-sm);
	}
	.notes li {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}
	.notes h2 {
		font-size: var(--text-lg);
		margin: 0;
	}
	.notes time {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
</style>
