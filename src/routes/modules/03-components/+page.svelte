<!--
	Module 3 index — lists every lesson in Components & Props with a Ready pill.
-->
<script lang="ts">
	interface Lesson {
		id: string;
		number: string;
		title: string;
		href: string | null;
	}

	const lessons: Lesson[] = [
		{
			id: '3.1',
			number: '3.1',
			title: 'What components are and why they exist',
			href: '/modules/03-components/01-what-are-components'
		},
		{
			id: '3.2',
			number: '3.2',
			title: '$props() — passing data into components',
			href: '/modules/03-components/02-props'
		},
		{
			id: '3.3',
			number: '3.3',
			title: 'TypeScript interfaces for props',
			href: '/modules/03-components/03-typed-props'
		},
		{
			id: '3.4',
			number: '3.4',
			title: 'Optional props and default values',
			href: '/modules/03-components/04-optional-props'
		},
		{
			id: '3.5',
			number: '3.5',
			title: '$bindable() — two-way data binding',
			href: '/modules/03-components/05-bindable'
		},
		{
			id: '3.6',
			number: '3.6',
			title: 'Snippets — {#snippet} and {@render}',
			href: '/modules/03-components/06-snippets'
		},
		{
			id: '3.7',
			number: '3.7',
			title: 'Passing snippets as props (Snippet<T>)',
			href: '/modules/03-components/07-snippet-props'
		},
		{
			id: '3.8',
			number: '3.8',
			title: 'Component composition patterns',
			href: '/modules/03-components/08-composition'
		},
		{
			id: '3.9',
			number: '3.9',
			title: 'CSS custom properties as the bridge',
			href: '/modules/03-components/09-css-variables-bridge'
		},
		{
			id: '3.10',
			number: '3.10',
			title: 'Responsive components with container queries',
			href: '/modules/03-components/10-container-queries'
		}
	];
</script>

<svelte:head>
	<title>Module 3 · Components & Props</title>
	<meta
		name="description"
		content="Module 3 of Ultimate Frontend: reusable typed Svelte 5 components with $props(), $bindable(), snippets, composition, and container queries."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 3</p>
		<h1>Components & Props</h1>
		<p class="lede">
			Reusable typed components are the foundation of every real Svelte app. This module
			teaches <code>$props()</code>, <code>$bindable()</code>, snippets, composition
			patterns, CSS custom properties as a bridge, and container queries.
		</p>
	</header>

	<section aria-labelledby="lessons-heading">
		<h2 id="lessons-heading">Lessons</h2>
		<ol class="lessons">
			{#each lessons as lesson (lesson.id)}
				<li>
					{#if lesson.href}
						<a href={lesson.href}>
							<span class="lesson__num">{lesson.number}</span>
							<span class="lesson__title">{lesson.title}</span>
							<span class="lesson__state lesson__state--ready">Ready</span>
						</a>
					{:else}
						<span class="lesson lesson--stub">
							<span class="lesson__num">{lesson.number}</span>
							<span class="lesson__title">{lesson.title}</span>
							<span class="lesson__state lesson__state--stub">Stub</span>
						</span>
					{/if}
				</li>
			{/each}
		</ol>
	</section>

	<p><a href="/modules">← All modules</a></p>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 30);
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

	.lessons {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.lessons > li > a,
	.lesson {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text);
		min-block-size: 44px;
	}

	.lessons > li > a {
		transition: border-color var(--dur-fast) var(--ease-out);

		&:hover {
			border-color: var(--color-brand);
		}
	}

	.lesson--stub {
		opacity: 0.6;
	}

	.lesson__num {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		color: var(--color-brand);
	}

	.lesson__state {
		font-size: var(--text-xs);
		padding: 0.15em 0.6em;
		border-radius: var(--radius-full);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.lesson__state--ready {
		background: var(--color-success);
		color: oklch(15% 0.02 145);
	}

	.lesson__state--stub {
		background: var(--color-border);
		color: var(--color-text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.lessons > li > a {
			transition: none;
		}
	}
</style>
