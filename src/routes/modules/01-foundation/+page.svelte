<script lang="ts">
	interface Lesson {
		id: string;
		number: string;
		title: string;
		href: string | null; // null = stub (no route yet)
	}

	const lessons: Lesson[] = [
		{ id: '1.1', number: '1.1', title: 'What Svelte is and why it compiles', href: '/modules/01-foundation/01-what-is-svelte' },
		{ id: '1.2', number: '1.2', title: 'Project setup with pnpm + SvelteKit 2 + TypeScript strict', href: null },
		{ id: '1.3', number: '1.3', title: 'The three blocks: script, markup, style', href: null },
		{ id: '1.4', number: '1.4', title: 'TypeScript type annotations on variables', href: null },
		{ id: '1.5', number: '1.5', title: 'PE7 CSS architecture: @layer, OKLCH, mobile-first', href: null },
		{ id: '1.6', number: '1.6', title: 'Fluid typography and spacing with clamp()', href: null },
		{ id: '1.7', number: '1.7', title: 'Scoped style blocks — how Svelte scopes CSS', href: null },
		{ id: '1.8', number: '1.8', title: 'TypeScript interfaces — defining object shapes', href: null },
		{ id: '1.9', number: '1.9', title: 'Template expressions with {} and {@const}', href: null }
	];
</script>

<svelte:head>
	<title>Module 1 · The Foundation</title>
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
</section>

<style>
	/* Per-page color personality (Module 1 = brand violet, Lesson 1.9 technique). */
	section {
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
</style>
