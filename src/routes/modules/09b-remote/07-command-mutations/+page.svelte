<script lang="ts">
	import { fade } from 'svelte/transition';
	import { addNote, deleteNote, listNotes } from './notes.remote';

	let draft: string = $state('');
	let busy: boolean = $state(false);

	async function submit(e: SubmitEvent): Promise<void> {
		e.preventDefault();
		const text = draft.trim();
		if (!text) return;
		busy = true;
		try {
			await addNote(text);
			draft = '';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Lesson 9B.7 · command mutations · Ultimate Frontend</title>
	<meta
		name="description"
		content="Create, read, and delete notes with command remote functions and optimistic UI overrides."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09b-remote">← Module 9B</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9B.7 · Commands</p>
		<h1><code>command</code> — mutations without forms</h1>
		<p class="lede">
			A tiny notes app backed by in-memory state, with optimistic UI for
			delete actions.
		</p>
	</header>

	<form class="composer" onsubmit={submit}>
		<label class="sr" for="note">New note</label>
		<input
			id="note"
			bind:value={draft}
			placeholder="Write a note…"
			maxlength="200"
		/>
		<button type="submit" disabled={busy || !draft.trim()}>
			{busy ? 'Adding…' : 'Add'}
		</button>
	</form>

	{#await listNotes()}
		<p class="muted">Loading notes…</p>
	{:then notes}
		{#if notes.length === 0}
			<p class="muted">No notes yet. Add your first.</p>
		{:else}
			<ul class="notes">
				{#each notes as n (n.id)}
					<li class="note" out:fade={{ duration: 180 }}>
						<p class="note__text">{n.text}</p>
						<time class="note__time" datetime={n.createdAt.toISOString()}>
							{n.createdAt.toLocaleTimeString()}
						</time>
						<button
							class="note__del"
							aria-label="Delete note"
							onclick={async () => {
								await deleteNote(n.id);
							}}
						>
							×
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	{/await}
</section>

<style>
	section {
		--color-brand: oklch(75% 0.16 75);
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
	.muted {
		color: var(--color-text-muted);
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
	.composer {
		display: flex;
		gap: var(--space-sm);
		align-items: center;
	}
	.composer input {
		flex: 1;
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface-2);
	}
	.composer button {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(20% 0.02 75);
		border-radius: var(--radius-md);
		font-weight: 700;
	}
	.composer button[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.notes {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-sm);
	}
	.note {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: var(--space-sm);
		align-items: center;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}
	.note__text {
		margin: 0;
	}
	.note__time {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
	.note__del {
		min-block-size: 44px;
		min-inline-size: 44px;
		font-size: var(--text-lg);
		color: var(--color-error);
		border-radius: var(--radius-md);
	}
	.note__del:hover {
		background: color-mix(in oklch, var(--color-error) 15%, transparent);
	}
</style>
