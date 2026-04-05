<!--
	Module 8 index — SvelteKit Routing & Layouts.
	Lists every lesson in the module and links to the mini-build route.
	Pure typed constants, scoped styles, PE7 tokens.
-->
<script lang="ts">
	interface Lesson {
		id: string;
		number: string;
		title: string;
		href: string;
		summary: string;
	}

	const lessons: Lesson[] = [
		{
			id: '8-1',
			number: '8.1',
			title: 'What SvelteKit adds to Svelte',
			href: '/modules/08-routing/01-what-sveltekit-adds',
			summary: 'A feature map separating the Svelte compiler from the SvelteKit framework.'
		},
		{
			id: '8-2',
			number: '8.2',
			title: 'What SSR actually is',
			href: '/modules/08-routing/02-what-ssr-is',
			summary: 'Browser sees full HTML on first byte — View Source vs Inspect.'
		},
		{
			id: '8-3',
			number: '8.3',
			title: 'What Hydration actually is',
			href: '/modules/08-routing/03-what-hydration-is',
			summary: 'The handover from static HTML to live, interactive components.'
		},
		{
			id: '8-4',
			number: '8.4',
			title: 'File-based routing',
			href: '/modules/08-routing/04-file-based-routing',
			summary: 'How +page.svelte, +layout.svelte and +error.svelte become a URL tree.'
		},
		{
			id: '8-5',
			number: '8.5',
			title: 'Nested layouts & route groups',
			href: '/modules/08-routing/05-nested-layouts',
			summary: 'Shared shells, route groups (group), and when to break the layout chain.'
		},
		{
			id: '8-6',
			number: '8.6',
			title: 'Dynamic routes — [slug], [...rest], matchers',
			href: '/modules/08-routing/06-dynamic-routes',
			summary: 'Typed params via $app/types, optional segments, rest catch-alls.'
		},
		{
			id: '8-7',
			number: '8.7',
			title: '$app/state — reactive page state',
			href: '/modules/08-routing/07-app-state',
			summary: 'page.url, page.params, page.data, page.status — no stores, no $ prefix.'
		},
		{
			id: '8-8',
			number: '8.8',
			title: '$app/navigation — programmatic navigation',
			href: '/modules/08-routing/08-app-navigation',
			summary: 'goto, invalidate, preloadData, beforeNavigate, afterNavigate.'
		},
		{
			id: '8-9',
			number: '8.9',
			title: 'hooks.server.ts — request lifecycle',
			href: '/modules/08-routing/09-hooks-server',
			summary: 'handle, handleError, getRequestEvent, async reroute.'
		},
		{
			id: '8-10',
			number: '8.10',
			title: 'instrumentation.server.ts — OpenTelemetry',
			href: '/modules/08-routing/10-instrumentation',
			summary: 'Basic request tracing wired into every SvelteKit response.'
		},
		{
			id: '8-11',
			number: '8.11',
			title: 'Page transitions',
			href: '/modules/08-routing/11-page-transitions',
			summary: 'onNavigate() + View Transitions API + Svelte transitions.'
		},
		{
			id: '8-12',
			number: '8.12',
			title: 'Four rendering modes in depth',
			href: '/modules/08-routing/12-rendering-modes',
			summary: 'One app, four modes: SSR, SSG, CSR and hybrid.'
		}
	];
</script>

<svelte:head>
	<title>Module 8 · Routing & Layouts · Ultimate Frontend</title>
	<meta
		name="description"
		content="Module 8 — SvelteKit routing, SSR, hydration, layouts, dynamic routes, hooks and rendering modes."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules">← All modules</a>
	</nav>

	<header>
		<p class="eyebrow">Module 8</p>
		<h1>SvelteKit Routing &amp; Layouts</h1>
		<p class="lede">
			This module turns a collection of <code>.svelte</code> files into a real website. You will
			learn how URLs become pages, how the server ships HTML before JavaScript runs, how the
			browser takes over, and how SvelteKit gives you four rendering modes in one codebase.
		</p>
	</header>

	<ol class="lessons">
		{#each lessons as lesson (lesson.id)}
			<li class="lesson">
				<a class="lesson__link" href={lesson.href}>
					<span class="lesson__number">{lesson.number}</span>
					<span class="lesson__title">{lesson.title}</span>
					<span class="lesson__summary">{lesson.summary}</span>
				</a>
			</li>
		{/each}
	</ol>

	<aside class="project">
		<h2>Module project — Multi-Page Portfolio Site</h2>
		<p>
			Home, About, Projects and Blog pages sharing a layout, with dynamic blog post routes,
			typed params, SSG for posts, SSR for dynamic pages and cross-route page transitions.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 230);
	}

	.crumbs a {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-decoration: none;

		&:hover {
			color: var(--color-brand);
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

	.lesson__link {
		display: grid;
		gap: var(--space-xs);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		min-block-size: 44px;
		transition: transform var(--dur-fast) var(--ease-out);

		&:hover {
			transform: translateX(2px);
		}
	}

	.lesson__number {
		font-size: var(--text-xs);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
	}

	.lesson__title {
		font-size: var(--text-lg);
		font-weight: 600;
	}

	.lesson__summary {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.project {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		border-inline-start: 4px solid var(--color-brand);
	}

	.project h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}
</style>
