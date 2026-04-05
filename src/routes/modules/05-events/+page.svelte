<!--
    Module 5 index — full lesson listing, matches the Module 1 exemplar.
-->
<script lang="ts">
	interface Lesson {
		id: string;
		number: string;
		title: string;
		href: string | null;
	}

	const lessons: Lesson[] = [
		{ id: '5.1', number: '5.1', title: 'Event handlers in Svelte 5 (lowercase onclick)', href: '/modules/05-events/01-event-handlers' },
		{ id: '5.2', number: '5.2', title: 'JavaScript functions deeply — declarations, arrows, first-class values', href: '/modules/05-events/02-functions-deeply' },
		{ id: '5.3', number: '5.3', title: 'TypeScript event types', href: '/modules/05-events/03-typescript-event-types' },
		{ id: '5.4', number: '5.4', title: 'preventDefault and stopPropagation', href: '/modules/05-events/04-prevent-default-stop-propagation' },
		{ id: '5.5', number: '5.5', title: 'Forwarding events from child to parent', href: '/modules/05-events/05-forwarding-events' },
		{ id: '5.6', number: '5.6', title: 'Closures in event handlers', href: '/modules/05-events/06-closures' },
		{ id: '5.7', number: '5.7', title: 'Debouncing and throttling', href: '/modules/05-events/07-debouncing-throttling' },
		{ id: '5.8', number: '5.8', title: 'Custom events & the callback prop pattern (toasts)', href: '/modules/05-events/08-custom-events-toasts' },
		{ id: '5.9', number: '5.9', title: 'Touch events and mobile interaction (pointer events)', href: '/modules/05-events/09-touch-pointer-events' },
		{ id: '5.10', number: '5.10', title: 'Form accessibility and keyboard navigation', href: '/modules/05-events/10-form-a11y-keyboard' }
	];
</script>

<svelte:head>
	<title>Module 5 · Events & Interaction · Ultimate Frontend</title>
	<meta
		name="description"
		content="Module 5 of Ultimate Frontend: typed events, closures, debouncing, pointer events, and keyboard-accessible forms in Svelte 5."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules">← All modules</a>
	</nav>

	<header>
		<p class="eyebrow">Module 5</p>
		<h1>Events & Interaction</h1>
		<p class="lede">
			Lowercase event attributes, typed <code>MouseEvent</code> / <code>KeyboardEvent</code> /
			<code>PointerEvent</code>, callback props, closures, debouncing and throttling from scratch,
			touch and pointer unification, and fully keyboard-accessible forms. By the end of this module
			you can build an interaction layer that feels fast, types cleanly, and passes
			Lighthouse&nbsp;100 on accessibility.
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

	<section class="project" aria-labelledby="project-heading">
		<h2 id="project-heading">Module project</h2>
		<p><strong>Interactive Form with Live Validation.</strong></p>
		<p>
			A multi-field registration form that combines every Module&nbsp;5 concept: typed handlers,
			debounced async validation, callback-prop child components, closure-based helpers,
			pointer-friendly controls, full keyboard navigation, and an accessible submit flow with focus
			management.
		</p>
	</section>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 330);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;

			&:hover {
				color: var(--color-brand);
			}
		}
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

	.project {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);

		& h2 {
			font-size: var(--text-lg);
			margin-block-end: var(--space-sm);
		}

		& p + p {
			margin-block-start: var(--space-sm);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.lessons > li > a {
			transition: none;
		}
	}
</style>
