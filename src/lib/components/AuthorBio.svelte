<!--
	AuthorBio — Module 13 Lesson 13.7.
	Renders a visible author card and emits a matching Person schema.
-->
<script lang="ts" module>
	export interface Author {
		name: string;
		role: string;
		bioUrl: string;
		image: string;
		sameAs: string[];
	}
</script>

<script lang="ts">
	import JsonLd from './JsonLd.svelte';

	const { author }: { author: Author } = $props();

	const personSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: author.name,
		jobTitle: author.role,
		image: author.image,
		url: author.bioUrl,
		sameAs: author.sameAs
	});
</script>

<JsonLd data={personSchema} />

<aside class="bio">
	<img class="bio__photo" src={author.image} alt="" width="64" height="64" />
	<div class="bio__body">
		<p class="bio__name"><a href={author.bioUrl}>{author.name}</a></p>
		<p class="bio__role">{author.role}</p>
		<ul class="bio__links">
			{#each author.sameAs as href (href)}
				<li><a {href} rel="me">{new URL(href).hostname}</a></li>
			{/each}
		</ul>
	</div>
</aside>

<style>
	.bio {
		display: flex;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.bio__photo {
		inline-size: 64px;
		block-size: 64px;
		border-radius: var(--radius-full);
		object-fit: cover;
		flex-shrink: 0;
	}

	.bio__name {
		font-weight: 600;
		margin: 0;
	}

	.bio__role {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.bio__links {
		list-style: none;
		padding: 0;
		margin: var(--space-xs) 0 0;
		display: flex;
		gap: var(--space-sm);
		font-size: var(--text-sm);
	}
</style>
