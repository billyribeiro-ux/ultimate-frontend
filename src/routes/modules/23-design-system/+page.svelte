<script lang="ts">
	interface Lesson {
		id: string;
		number: string;
		title: string;
		href: string;
	}

	const lessons: Lesson[] = [
		{ id: '23.1', number: '23.1', title: 'What a design system is', href: '/modules/23-design-system/01-what-design-system-is' },
		{ id: '23.2', number: '23.2', title: 'Token pipeline', href: '/modules/23-design-system/02-token-pipeline' },
		{ id: '23.3', number: '23.3', title: 'Component API design', href: '/modules/23-design-system/03-component-api-design' },
		{ id: '23.4', number: '23.4', title: 'Documentation with Svelte', href: '/modules/23-design-system/04-documentation-svelte' },
		{ id: '23.5', number: '23.5', title: 'Visual regression in CI', href: '/modules/23-design-system/05-visual-regression-ci' },
		{ id: '23.6', number: '23.6', title: 'Versioning & changelogs', href: '/modules/23-design-system/06-versioning-changelogs' },
		{ id: '23.7', number: '23.7', title: 'Multi-theme architecture', href: '/modules/23-design-system/07-multi-theme-architecture' },
		{ id: '23.8', number: '23.8', title: 'Publishing & consumption', href: '/modules/23-design-system/08-publishing-consumption' }
	];
</script>

<svelte:head>
	<title>Module 23 · Design System Engineering · Ultimate Frontend</title>
	<meta
		name="description"
		content="Module 23 of Ultimate Frontend: build a production design system with tokens, documentation, theming, versioning, and publishing."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 23</p>
		<h1>Design System Engineering</h1>
		<p class="lede">
			By the end of this module you will have built a complete design system
			pipeline: from design tokens through component APIs, living documentation,
			visual regression testing, semantic versioning, multi-theme architecture,
			and npm publishing.
		</p>
	</header>

	<section aria-labelledby="lessons-heading">
		<h2 id="lessons-heading">Lessons</h2>
		<ol class="lessons">
			{#each lessons as lesson (lesson.id)}
				<li>
					<a href={lesson.href}>
						<span class="lesson__num">{lesson.number}</span>
						<span class="lesson__title">{lesson.title}</span>
						<span class="lesson__state lesson__state--ready">Ready</span>
					</a>
				</li>
			{/each}
		</ol>
	</section>
</section>

<style>
	section.page {
		--color-brand: oklch(65% 0.22 270);
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

	.lessons > li > a {
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
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.lessons > li > a:hover {
		border-color: var(--color-brand);
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

	@media (prefers-reduced-motion: reduce) {
		.lessons > li > a {
			transition: none;
		}
	}
</style>
