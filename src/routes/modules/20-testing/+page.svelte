<script lang="ts">
	interface LessonLink {
		slug: string;
		number: string;
		title: string;
	}

	const lessons: LessonLink[] = [
		{ slug: '01-testing-philosophy', number: '20.1', title: 'Testing philosophy' },
		{ slug: '02-vitest-configuration', number: '20.2', title: 'Vitest configuration for SvelteKit' },
		{ slug: '03-unit-testing-stores', number: '20.3', title: 'Unit testing .svelte.ts stores' },
		{ slug: '04-component-testing', number: '20.4', title: 'Component testing with @testing-library/svelte' },
		{ slug: '05-async-components', number: '20.5', title: 'Testing async components' },
		{ slug: '06-form-actions-api', number: '20.6', title: 'Testing form actions and API routes' },
		{ slug: '07-playwright-fundamentals', number: '20.7', title: 'Playwright fundamentals' },
		{ slug: '08-e2e-flows', number: '20.8', title: 'E2E flows: auth, CRUD, navigation' },
		{ slug: '09-visual-regression', number: '20.9', title: 'Visual regression testing' },
		{ slug: '10-ci-cd-pipeline', number: '20.10', title: 'CI/CD testing pipeline' }
	];
</script>

<svelte:head>
	<title>Module 20 · Testing Deep Dive</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 20</p>
		<h1>Testing Deep Dive</h1>
		<p class="lede">
			Build a comprehensive testing strategy for SvelteKit applications:
			unit tests, component tests, E2E flows, visual regression, and CI/CD pipelines.
		</p>
	</header>

	<nav aria-label="Module 20 lessons">
		<ol class="lesson-list">
			{#each lessons as lesson (lesson.slug)}
				<li>
					<a href="/modules/20-testing/{lesson.slug}" class="lesson-link">
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
