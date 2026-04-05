<!--
	Lesson 11.10 — Optimistic UI with rollback
	Mini-build: three posts with heart buttons. A mode selector controls
	whether the fake server always succeeds, fails randomly, or always fails.
-->
<script lang="ts">
	import { likes } from '$lib/stores/likes.svelte';

	type ServerMode = 'success' | 'random' | 'fail';

	interface Post {
		id: string;
		title: string;
		excerpt: string;
	}

	const posts: Post[] = [
		{
			id: 'p-01',
			title: 'Svelte compiles away',
			excerpt: 'Why a compiler beats a runtime on every mobile device.'
		},
		{
			id: 'p-02',
			title: 'Runes are explicit',
			excerpt: '$state, $derived, $effect — the three runes you will use every day.'
		},
		{
			id: 'p-03',
			title: 'Optimistic UI is a lie, honestly',
			excerpt: 'Lie to the user about success, then apologise if it did not come true.'
		}
	];

	// Seed the store so each post has an initial state.
	for (const post of posts) {
		likes.seed(post.id, { liked: false, count: Math.floor(Math.random() * 50) + 10 });
	}

	let mode = $state<ServerMode>('success');

	function fakeServer(): (liked: boolean) => Promise<boolean> {
		const currentMode = mode;
		return (liked: boolean) =>
			new Promise<boolean>((resolve) => {
				setTimeout(() => {
					if (currentMode === 'success') resolve(true);
					else if (currentMode === 'fail') resolve(false);
					else resolve(Math.random() > 0.3);
				}, 600);
			});
	}

	async function toggleLike(id: string): Promise<void> {
		await likes.toggle(id, fakeServer());
	}
</script>

<svelte:head>
	<title>Lesson 11.10 · Optimistic UI · Ultimate Frontend</title>
	<meta
		name="description"
		content="A heart button with optimistic UI and rollback. Includes a live-region error toast for accessibility."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/11-state">← Module 11</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 11.10 · Mini-build</p>
		<h1>Apply first, reconcile later</h1>
		<p class="lede">
			The heart flips instantly. The request goes out in parallel. If the fake server refuses,
			the store rolls back and the toast announces the failure.
		</p>
	</header>

	<label class="mode">
		<span>Fake server mode</span>
		<select value={mode} onchange={(e) => (mode = (e.currentTarget as HTMLSelectElement).value as ServerMode)}>
			<option value="success">Always succeed</option>
			<option value="random">Random (30% failure)</option>
			<option value="fail">Always fail</option>
		</select>
	</label>

	<ul class="posts">
		{#each posts as post (post.id)}
			{@const state = likes.get(post.id)}
			<li>
				<article>
					<h2>{post.title}</h2>
					<p>{post.excerpt}</p>
					<button
						type="button"
						class="heart"
						class:liked={state.liked}
						aria-pressed={state.liked}
						aria-label={state.liked ? 'Unlike' : 'Like'}
						onclick={() => toggleLike(post.id)}
					>
						<span aria-hidden="true">{state.liked ? '♥' : '♡'}</span>
						<span>{state.count}</span>
					</button>
				</article>
			</li>
		{/each}
	</ul>

	<div class="toast" role="status" aria-live="polite">
		{#if likes.lastError}
			<p>⚠ {likes.lastError}</p>
		{/if}
	</div>
</section>

<style>
	section {
		--color-brand: oklch(65% 0.22 15);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.mode {
		display: grid;
		gap: var(--space-xs);
		max-inline-size: 20rem;
	}

	.mode span {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.mode select {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.posts {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-md);
	}

	.posts article {
		display: grid;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.posts h2 {
		font-size: var(--text-lg);
		margin: 0;
	}

	.posts p {
		color: var(--color-text-muted);
		margin: 0;
	}

	.heart {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-md);
		min-block-size: 44px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		color: var(--color-text-muted);
		font-weight: 700;
		transition: transform var(--dur-fast) var(--ease-expressive);
	}

	.heart.liked {
		color: var(--color-brand);
		border-color: var(--color-brand);
		background: oklch(from var(--color-brand) 97% 0.03 h);
	}

	.heart:active {
		transform: scale(1.1);
	}

	.toast {
		min-block-size: 2rem;
	}

	.toast p {
		margin: 0;
		padding: var(--space-sm) var(--space-md);
		background: oklch(from var(--color-error) 96% 0.03 h);
		border-inline-start: 3px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
	}

	@media (prefers-reduced-motion: reduce) {
		.heart {
			transition: none;
		}
		.heart:active {
			transform: none;
		}
	}
</style>
