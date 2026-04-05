<script lang="ts">
	interface Lesson {
		id: string;
		number: string;
		title: string;
		href: string;
	}

	const lessons: Lesson[] = [
		{ id: '1.1', number: '1.1', title: 'What Svelte is and why it compiles', href: '/modules/01-foundation/01-what-is-svelte' },
		{ id: '1.2', number: '1.2', title: 'Project setup with pnpm + SvelteKit 2 + TypeScript strict', href: '/modules/01-foundation/02-project-setup' },
		{ id: '1.3', number: '1.3', title: 'The three blocks: script, markup, style', href: '/modules/01-foundation/03-three-blocks' },
		{ id: '1.4', number: '1.4', title: 'TypeScript type annotations on variables', href: '/modules/01-foundation/04-type-annotations' },
		{ id: '1.5', number: '1.5', title: 'PE7 CSS architecture: @layer, OKLCH, mobile-first', href: '/modules/01-foundation/05-pe7-architecture' },
		{ id: '1.6', number: '1.6', title: 'Fluid typography and spacing with clamp()', href: '/modules/01-foundation/06-fluid-clamp' },
		{ id: '1.7', number: '1.7', title: 'Scoped style blocks — how Svelte scopes CSS', href: '/modules/01-foundation/07-scoped-styles' },
		{ id: '1.8', number: '1.8', title: 'TypeScript interfaces — defining object shapes', href: '/modules/01-foundation/08-interfaces' },
		{ id: '1.9', number: '1.9', title: 'Template expressions with {} and directives', href: '/modules/01-foundation/09-template-expressions' }
	];
</script>

<svelte:head>
	<title>Module 1 · The Foundation · Ultimate Frontend</title>
	<meta
		name="description"
		content="Module 1 of Ultimate Frontend: your first typed, styled, mobile-first Svelte 5 component."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 1</p>
		<h1>The Foundation</h1>
		<p class="lede">
			By the end of this module you will have written your first typed, styled, mobile-first
			Svelte 5 component and you will understand the PE7 CSS architecture that every future
			module builds upon.
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
		--color-brand: oklch(70% 0.2 280);
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
