<!--
	Module 9A index — Data Loading with traditional load() functions.
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
		{ id: '9a-1', number: '9A.1', title: 'What load functions are and why they exist', href: '/modules/09a-load/01-what-is-load', summary: 'The problem load solves: data that must exist before the component mounts.' },
		{ id: '9a-2', number: '9A.2', title: '+page.ts vs +page.server.ts', href: '/modules/09a-load/02-page-vs-server', summary: 'Universal loads run everywhere; server loads never leave the server.' },
		{ id: '9a-3', number: '9A.3', title: 'Auto-generated $types — end-to-end type safety', href: '/modules/09a-load/03-auto-types', summary: 'PageLoad, PageServerLoad, PageData — typed for free.' },
		{ id: '9a-4', number: '9A.4', title: 'fetch inside load — enhanced fetch', href: '/modules/09a-load/04-enhanced-fetch', summary: 'The fetch argument that dedupes requests and forwards cookies.' },
		{ id: '9a-5', number: '9A.5', title: 'Layout data and parent()', href: '/modules/09a-load/05-layout-data', summary: '+layout.ts, +layout.server.ts, parent(), page.data merging.' },
		{ id: '9a-6', number: '9A.6', title: 'Parallel data loading — Promise.all and the waterfall', href: '/modules/09a-load/06-parallel-loading', summary: 'Three sequential awaits vs one Promise.all.' },
		{ id: '9a-7', number: '9A.7', title: 'depends() and invalidate() — manual cache control', href: '/modules/09a-load/07-depends-invalidate', summary: 'Fine-grained cache keys for refreshing only what changed.' },
		{ id: '9a-8', number: '9A.8', title: 'Error handling — error() and redirect()', href: '/modules/09a-load/08-error-redirect', summary: 'Typed errors and redirects thrown from a load function.' },
		{ id: '9a-9', number: '9A.9', title: 'Streaming with Promise returns', href: '/modules/09a-load/09-streaming', summary: 'Return a Promise, render with {#await}, and stream slow data progressively.' },
		{ id: '9a-10', number: '9A.10', title: 'SSG — prerender = true and entries()', href: '/modules/09a-load/10-ssg-prerender', summary: 'Turn a dynamic route into static HTML at build time.' }
	];
</script>

<svelte:head>
	<title>Module 9A · Data Loading · Ultimate Frontend</title>
	<meta name="description" content="Module 9A — SvelteKit load functions, $types, parallel loading, streaming, and SSG." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules">← All modules</a>
	</nav>

	<header>
		<p class="eyebrow">Module 9A</p>
		<h1>Data Loading (traditional <code>load()</code>)</h1>
		<p class="lede">
			Load functions are SvelteKit's typed, cacheable, universal way to fetch data before a page
			renders. This module covers the full surface area: universal vs server loads, auto-generated
			types, layout data, parallel loading, streaming, errors, and static generation.
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
		<h2>Module project — Weather Dashboard</h2>
		<p>
			Real-time weather for three cities using the public Open-Meteo API. Parallel loads, typed
			interfaces, streaming for slow data, layout data for preferences, <code>depends</code> /
			<code>invalidate</code> for refresh, PE7 mobile-first UI.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 250);
	}

	.crumbs a {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-decoration: none;
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
