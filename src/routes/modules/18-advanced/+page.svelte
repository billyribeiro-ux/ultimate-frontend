<script lang="ts">
	interface LessonLink {
		slug: string;
		number: string;
		title: string;
	}

	const lessons: LessonLink[] = [
		{ slug: '01-compound-components', number: '18.1', title: 'Compound components' },
		{ slug: '02-polymorphic-components', number: '18.2', title: 'Polymorphic components' },
		{ slug: '03-headless-components', number: '18.3', title: 'Headless components' },
		{ slug: '04-state-machines', number: '18.4', title: 'State machines with runes' },
		{ slug: '05-micro-frontends', number: '18.5', title: 'Micro-frontends with SvelteKit' },
		{ slug: '06-custom-preprocessors', number: '18.6', title: 'Custom preprocessors' },
		{ slug: '07-build-time-data', number: '18.7', title: 'Build-time data with Vite plugins' },
		{ slug: '08-advanced-typescript', number: '18.8', title: 'Advanced TypeScript patterns in Svelte' },
		{ slug: '09-performance-profiling', number: '18.9', title: 'Performance profiling and optimization' },
		{ slug: '10-monorepo-architecture', number: '18.10', title: 'Monorepo architecture' }
	];
</script>

<svelte:head>
	<title>Module 18 · Advanced Patterns & Architecture</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 18</p>
		<h1>Advanced Patterns & Architecture</h1>
		<p class="lede">
			Principal-engineer-level patterns for building scalable design systems,
			tooling, and multi-app architectures with Svelte 5 and SvelteKit.
		</p>
	</header>

	<nav aria-label="Module 18 lessons">
		<ol class="lesson-list">
			{#each lessons as lesson (lesson.slug)}
				<li>
					<a href="/modules/18-advanced/{lesson.slug}" class="lesson-link">
						<span class="lesson-link__number">{lesson.number}</span>
						<span class="lesson-link__title">{lesson.title}</span>
					</a>
				</li>
			{/each}
		</ol>
	</nav>
</section>

<style>
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 50ch;
	}

	.lesson-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.lesson-link {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text);
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.lesson-link:hover {
		border-color: var(--color-brand);
	}

	.lesson-link__number {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-brand);
		letter-spacing: 0.08em;
		min-inline-size: 3rem;
	}

	.lesson-link__title {
		font-size: var(--text-base);
		font-weight: 500;
	}
</style>
