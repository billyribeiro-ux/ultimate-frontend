<script lang="ts">
	import { getPosts } from './posts.remote';

	function formatDate(d: Date): string {
		return d.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Lesson 9B.2 · query remote functions · Ultimate Frontend</title>
	<meta
		name="description"
		content="Your first SvelteKit query remote function — colocated, typed, devalue-serialised."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09b-remote">← Module 9B</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9B.2 · Reading data</p>
		<h1>Your first <code>query</code></h1>
		<p class="lede">
			A <code>.remote.ts</code> file colocated with the route, imported directly
			into the component, typed end-to-end.
		</p>
	</header>

	<div class="actions">
		<button class="btn" onclick={() => getPosts().refresh()}>
			Refresh from server
		</button>
	</div>

	{#await getPosts()}
		<ul class="posts" aria-busy="true">
			{#each { length: 3 } as _, i (i)}
				<li class="post post--skeleton">
					<span class="skeleton skeleton--title"></span>
					<span class="skeleton skeleton--meta"></span>
				</li>
			{/each}
		</ul>
	{:then posts}
		<ul class="posts">
			{#each posts as post (post.id)}
				<li class="post">
					<h2>{post.title}</h2>
					<p class="meta">
						by {post.author} · {formatDate(post.publishedAt)}
					</p>
				</li>
			{/each}
		</ul>
	{:catch error}
		<p class="error" role="alert">Could not load posts: {error.message}</p>
	{/await}
</section>

<style>
	section {
		--color-brand: oklch(70% 0.16 200);
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

	.actions {
		display: flex;
		gap: var(--space-sm);
	}

	.btn {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
		transition: transform var(--dur-fast) var(--ease-out);

		&:hover {
			transform: translateY(-1px);
		}
	}

	.posts {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.post {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}

	.post h2 {
		font-size: var(--text-lg);
		margin: 0;
	}

	.meta {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: var(--space-xs) 0 0;
	}

	.skeleton {
		display: block;
		background: linear-gradient(
			90deg,
			var(--color-surface-2),
			oklch(from var(--color-brand) 92% 0.04 h),
			var(--color-surface-2)
		);
		background-size: 200% 100%;
		border-radius: var(--radius-sm);
		animation: pulse 1.6s var(--ease-in-out) infinite;
	}

	.skeleton--title {
		block-size: 1.2rem;
		inline-size: 70%;
	}

	.skeleton--meta {
		block-size: 0.9rem;
		inline-size: 40%;
		margin-block-start: var(--space-xs);
	}

	.post--skeleton {
		background: var(--color-surface-2);
	}

	.error {
		color: var(--color-error);
		padding: var(--space-md);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
	}

	@keyframes pulse {
		0%,
		100% {
			background-position: 200% 0;
		}
		50% {
			background-position: -200% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton {
			animation: none;
		}
	}
</style>
