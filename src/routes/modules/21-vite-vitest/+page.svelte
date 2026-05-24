<script lang="ts">
	interface LessonLink {
		slug: string;
		number: string;
		title: string;
	}

	const lessons: LessonLink[] = [
		{ slug: '01-what-vite-does', number: '21.1', title: 'What Vite actually does' },
		{ slug: '02-vite-config', number: '21.2', title: 'vite.config.ts in depth' },
		{ slug: '03-env-variables', number: '21.3', title: 'Environment variables and modes' },
		{ slug: '04-plugin-system', number: '21.4', title: 'The plugin system' },
		{ slug: '05-hmr-dev-experience', number: '21.5', title: 'HMR and the dev experience' },
		{ slug: '06-build-analysis', number: '21.6', title: 'Build analysis and optimization' },
		{ slug: '07-vitest-fundamentals', number: '21.7', title: 'Vitest fundamentals' },
		{ slug: '08-mocking-spying', number: '21.8', title: 'Mocking and spying' },
		{ slug: '09-snapshot-testing', number: '21.9', title: 'Snapshot and inline snapshot testing' },
		{ slug: '10-svelte-playground', number: '21.10', title: 'The Svelte Playground and REPL' }
	];
</script>

<svelte:head>
	<title>Module 21 · Vite, Vitest & The Svelte Playground</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 21</p>
		<h1>Vite, Vitest & The Svelte Playground</h1>
		<p class="lede">
			Demystify the build tooling that has been running silently since Lesson 1.2.
			Learn to configure Vite, write plugins, master Vitest testing, and leverage the
			Svelte Playground for rapid prototyping and documentation.
		</p>
	</header>

	<nav aria-label="Module 21 lessons">
		<ol class="lesson-list">
			{#each lessons as lesson (lesson.slug)}
				<li>
					<a href="/modules/21-vite-vitest/{lesson.slug}" class="lesson-link">
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
