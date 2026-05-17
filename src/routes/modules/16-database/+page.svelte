<script lang="ts">
	interface Lesson {
		id: string;
		number: string;
		title: string;
		href: string;
	}

	const lessons: Lesson[] = [
		{ id: '16.1', number: '16.1', title: 'What a database is and why SvelteKit needs one', href: '/modules/16-database/01-what-is-database' },
		{ id: '16.2', number: '16.2', title: 'Installing Drizzle + SQLite', href: '/modules/16-database/02-installing-drizzle' },
		{ id: '16.3', number: '16.3', title: 'Schema definition', href: '/modules/16-database/03-schema-definition' },
		{ id: '16.4', number: '16.4', title: 'Migrations', href: '/modules/16-database/04-migrations' },
		{ id: '16.5', number: '16.5', title: 'CRUD with Drizzle', href: '/modules/16-database/05-crud' },
		{ id: '16.6', number: '16.6', title: 'Relations and joins', href: '/modules/16-database/06-relations-joins' },
		{ id: '16.7', number: '16.7', title: 'Database in SvelteKit load functions', href: '/modules/16-database/07-load-functions' },
		{ id: '16.8', number: '16.8', title: 'Database in form actions and remote functions', href: '/modules/16-database/08-actions-remote' }
	];
</script>

<svelte:head>
	<title>Module 16 · Database with Drizzle ORM · Ultimate Frontend</title>
	<meta
		name="description"
		content="Module 16 of Ultimate Frontend: connect SvelteKit to a real SQLite database using Drizzle ORM with full type safety."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 16</p>
		<h1>Database with Drizzle ORM</h1>
		<p class="lede">
			By the end of this module you will connect SvelteKit to a real SQLite database
			using Drizzle ORM — schema definitions, migrations, CRUD operations, relations,
			and typed end-to-end data flow from database to component.
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
		--color-brand: oklch(65% 0.19 195);
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
