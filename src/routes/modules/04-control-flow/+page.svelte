<!--
	Module 4 index — lists every lesson in Control Flow with a Ready pill.
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
			id: '4.1',
			number: '4.1',
			title: '#if — conditional rendering and JS boolean logic',
			href: '/modules/04-control-flow/01-if'
		},
		{
			id: '4.2',
			number: '4.2',
			title: ':else if and :else — multi-branch logic',
			href: '/modules/04-control-flow/02-else-if'
		},
		{
			id: '4.3',
			number: '4.3',
			title: '#each — array iteration and destructuring',
			href: '/modules/04-control-flow/03-each'
		},
		{
			id: '4.4',
			number: '4.4',
			title: '#each with keys — why keys matter',
			href: '/modules/04-control-flow/04-each-keys'
		},
		{
			id: '4.5',
			number: '4.5',
			title: 'Nested #each — iterating nested data',
			href: '/modules/04-control-flow/05-nested-each'
		},
		{
			id: '4.6',
			number: '4.6',
			title: '#key block — forcing re-renders',
			href: '/modules/04-control-flow/06-key-block'
		},
		{
			id: '4.7',
			number: '4.7',
			title: 'Promises and async/await — the JS async model',
			href: '/modules/04-control-flow/07-promises'
		},
		{
			id: '4.8',
			number: '4.8',
			title: "#await — Svelte's built-in async handling",
			href: '/modules/04-control-flow/08-await'
		},
		{
			id: '4.9',
			number: '4.9',
			title: 'Error handling with :catch and try/catch',
			href: '/modules/04-control-flow/09-catch'
		},
		{
			id: '4.10',
			number: '4.10',
			title: 'TypeScript with async — Promise<T> return types',
			href: '/modules/04-control-flow/10-typed-async'
		}
	];
</script>

<svelte:head>
	<title>Module 4 · Control Flow</title>
	<meta
		name="description"
		content="Module 4 of Ultimate Frontend: Svelte's logic blocks and the JavaScript async model that powers every data-loading scenario."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 4</p>
		<h1>Control Flow</h1>
		<p class="lede">
			Svelte's logic blocks — <code>#if</code>, <code>#each</code>, <code>#key</code>,
			<code>#await</code> — together with the JavaScript async model that makes every real
			data-loading page possible.
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
		--color-brand: oklch(66% 0.2 160);
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
