<script lang="ts">
	import { getPost, listIds } from './post-by-id.remote';

	let selected: string = $state('welcome');

	function formatDate(d: Date): string {
		return d.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Lesson 9B.3 · Parameterized queries · Ultimate Frontend</title>
	<meta
		name="description"
		content="Parameterized query remote functions with Valibot argument validation and devalue serialisation of Date and Map."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09b-remote">← Module 9B</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9B.3 · Arguments</p>
		<h1>Parameterized <code>query</code> with Valibot</h1>
		<p class="lede">
			Arguments validated server-side, types inferred client-side, Dates and
			Maps intact.
		</p>
	</header>

	<form class="picker" onsubmit={(e) => e.preventDefault()}>
		<label for="post-select">Post</label>
		{#await listIds() then ids}
			<select id="post-select" bind:value={selected}>
				{#each ids as id (id)}
					<option value={id}>{id}</option>
				{/each}
			</select>
		{/await}
	</form>

	{#await getPost(selected)}
		<article class="post post--loading">Loading…</article>
	{:then post}
		<article class="post">
			<h2>{post.title}</h2>
			<p class="meta">Published {formatDate(post.publishedAt)}</p>
			<p>{post.body}</p>
			<ul class="tags">
				{#each [...post.tags.entries()] as [tag, count] (tag)}
					<li class="tag" style="--count: {count}">
						#{tag}<span class="tag__count">{count}</span>
					</li>
				{/each}
			</ul>
		</article>
	{:catch error}
		<p class="error" role="alert">{error.message}</p>
	{/await}
</section>

<style>
	section {
		--color-brand: oklch(55% 0.2 275);
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
	.picker {
		display: flex;
		gap: var(--space-sm);
		align-items: center;
	}
	.picker label {
		font-weight: 600;
	}
	.picker select {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface-2);
	}
	.post {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}
	.post h2 {
		font-size: var(--text-xl);
		margin: 0;
	}
	.meta {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: var(--space-xs) 0 var(--space-md);
	}
	.tags {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin-block-start: var(--space-md);
	}
	.tag {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-full);
		background: color-mix(in oklch, var(--color-brand) calc(var(--count) * 8%), var(--color-surface));
		color: var(--color-text);
		font-size: var(--text-sm);
		min-block-size: 44px;
	}
	.tag__count {
		font-weight: 700;
		color: var(--color-brand);
	}
	.post--loading {
		color: var(--color-text-muted);
	}
	.error {
		color: var(--color-error);
		padding: var(--space-md);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
	}
</style>
