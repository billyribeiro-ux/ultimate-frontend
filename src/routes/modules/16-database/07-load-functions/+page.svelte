<script lang="ts">
	interface NoteWithUser {
		id: number;
		title: string;
		content: string;
		userId: number;
		createdAt: string;
		updatedAt: string;
		user: { id: number; name: string; email: string; createdAt: string };
	}

	interface PageData {
		notes: NoteWithUser[];
		totalCount: number;
	}

	let { data }: { data: PageData } = $props();

	function timeAgo(iso: string): string {
		const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}
</script>

<svelte:head>
	<title>Lesson 16.7 · Load functions · Ultimate Frontend</title>
	<meta
		name="description"
		content="Loading database records in a SvelteKit +page.server.ts load function with fully typed page data."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/16-database">← Module 16</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 16.7 · Mini-build</p>
		<h1>Database-backed notes list</h1>
		<p class="lede">
			This page loads notes from SQLite via a <code>+page.server.ts</code> load function.
			The data is server-rendered and typed end-to-end.
		</p>
	</header>

	<div class="stats-bar">
		<span class="stat">
			<strong>{data.totalCount}</strong> {data.totalCount === 1 ? 'note' : 'notes'} in database
		</span>
	</div>

	{#if data.notes.length === 0}
		<article class="empty-state">
			<h2>No notes found</h2>
			<p>
				The database is empty. Create notes in
				<a href="/modules/16-database/05-crud">Lesson 16.5</a> and they will appear here.
			</p>
		</article>
	{:else}
		<ul class="notes-list">
			{#each data.notes as note (note.id)}
				<li class="note-card">
					<h2 class="note-card__title">{note.title}</h2>
					{#if note.content}
						<p class="note-card__content">{note.content}</p>
					{/if}
					<footer class="note-card__meta">
						<span class="note-card__author">{note.user.name}</span>
						<time class="note-card__time" datetime={note.createdAt}>
							{timeAgo(note.createdAt)}
						</time>
					</footer>
				</li>
			{/each}
		</ul>
	{/if}

	<article class="explanation">
		<h2>How the data flows</h2>
		<ol class="flow-steps">
			<li>Browser requests <code>/modules/16-database/07-load-functions</code></li>
			<li>SvelteKit calls the <code>load</code> function in <code>+page.server.ts</code></li>
			<li>Load function calls <code>db.query.notes.findMany()</code></li>
			<li>Drizzle translates to SQL and queries <code>data/dev.db</code></li>
			<li>Typed results flow to this component as the <code>data</code> prop</li>
			<li>SvelteKit renders HTML on the server and sends it to the browser</li>
		</ol>
	</article>
</section>

<style>
	section.page {
		--color-brand: oklch(58% 0.2 220);
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

	.stats-bar {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.stat {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.stat strong {
		color: var(--color-brand);
	}

	.empty-state {
		padding: var(--space-xl);
		text-align: center;
		background: var(--color-surface-2);
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-lg);
	}

	.empty-state h2 {
		font-size: var(--text-lg);
		margin: 0 0 var(--space-sm);
	}

	.empty-state a {
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
		box-shadow: var(--shadow-sm);
	}

	.note-card__title {
		font-size: var(--text-base);
		margin: 0;
	}

	.note-card__content {
		margin: var(--space-xs) 0 0;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.note-card__meta {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-block-start: var(--space-sm);
		padding-block-start: var(--space-sm);
		border-block-start: 1px solid var(--color-border);
	}

	.note-card__author {
		font-size: var(--text-sm);
		font-weight: 500;
	}

	.note-card__time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-inline-start: auto;
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

	.flow-steps {
		padding-inline-start: var(--space-md);
	}

	.flow-steps li {
		padding-block: var(--space-xs);
		font-size: var(--text-sm);
	}
</style>
