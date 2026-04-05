<script lang="ts">
	interface Lesson {
		id: string;
		number: string;
		title: string;
		href: string;
	}

	const lessons: Lesson[] = [
		{ id: '2.1', number: '2.1', title: 'What state is and why it exists', href: '/modules/02-reactivity/01-what-is-state' },
		{ id: '2.2', number: '2.2', title: '$state with primitive types', href: '/modules/02-reactivity/02-state-primitives' },
		{ id: '2.3', number: '2.3', title: '$state with objects', href: '/modules/02-reactivity/03-state-objects' },
		{ id: '2.4', number: '2.4', title: '$state with arrays — JS array methods', href: '/modules/02-reactivity/04-state-arrays' },
		{ id: '2.5', number: '2.5', title: '$state.raw() — non-deep reactive state', href: '/modules/02-reactivity/05-state-raw' },
		{ id: '2.6', number: '2.6', title: '$state.snapshot() — serializing reactive state', href: '/modules/02-reactivity/06-state-snapshot' },
		{ id: '2.7', number: '2.7', title: '$derived() — pure functions introduced naturally', href: '/modules/02-reactivity/07-derived' },
		{ id: '2.8', number: '2.8', title: '$derived.by() — complex derived computations', href: '/modules/02-reactivity/08-derived-by' },
		{ id: '2.9', number: '2.9', title: '$effect() — side effects and the JS execution model', href: '/modules/02-reactivity/09-effect' },
		{ id: '2.10', number: '2.10', title: '$effect.pre() — pre-DOM-update effects', href: '/modules/02-reactivity/10-effect-pre' },
		{ id: '2.11', number: '2.11', title: '$effect cleanup — preventing memory leaks', href: '/modules/02-reactivity/11-effect-cleanup' },
		{ id: '2.12', number: '2.12', title: 'Reactivity with CSS — dynamic styles and class bindings', href: '/modules/02-reactivity/12-reactive-css' },
		{ id: '2.13', number: '2.13', title: 'TypeScript with reactive state', href: '/modules/02-reactivity/13-typescript-reactive' }
	];
</script>

<svelte:head>
	<title>Module 2 · Reactivity · Ultimate Frontend</title>
	<meta
		name="description"
		content="Module 2 of Ultimate Frontend: master every Svelte 5 rune — $state, $derived, $effect and their variants."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 2</p>
		<h1>Reactivity</h1>
		<p class="lede">
			Master every Svelte 5 rune — <code>$state</code>, <code>$state.raw</code>,
			<code>$state.snapshot</code>, <code>$derived</code>, <code>$derived.by</code>,
			<code>$effect</code>, <code>$effect.pre</code> — and the JavaScript data model that
			makes them work.
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

	<p><a href="/modules">← All modules</a></p>
</section>

<style>
	section.page {
		--color-brand: oklch(70% 0.2 160);
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
