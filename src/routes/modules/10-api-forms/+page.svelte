<script lang="ts">
	interface LessonLink {
		n: string;
		title: string;
		slug: string;
		blurb: string;
	}

	const lessons: LessonLink[] = [
		{
			n: '10.1',
			title: '+server.ts endpoints',
			slug: '01-server-endpoints',
			blurb: 'Typed GET/POST handlers, json() and error() helpers, RequestEvent.'
		},
		{
			n: '10.2',
			title: 'TypeScript in API routes',
			slug: '02-typescript-in-api',
			blurb: 'RequestHandler generics, ./$types, Valibot for runtime safety.'
		},
		{
			n: '10.3',
			title: 'Form actions — the actions export',
			slug: '03-form-actions',
			blurb: '+page.server.ts, default action, fail() + redirect(), no JS required.'
		},
		{
			n: '10.4',
			title: 'Named actions',
			slug: '04-named-actions',
			blurb: '?/create, ?/remove, formaction on buttons, discriminated unions.'
		},
		{
			n: '10.5',
			title: 'use:enhance',
			slug: '05-use-enhance',
			blurb: 'Progressive enhancement with typed SubmitFunction and pending state.'
		},
		{
			n: '10.6',
			title: 'Validation + ActionData',
			slug: '06-validation-actiondata',
			blurb: 'Valibot inside actions, typed errors, inline edit, value repopulation.'
		},
		{
			n: '10.7',
			title: 'Environment variables',
			slug: '07-env-vars',
			blurb: 'The four $env modules, PUBLIC_ prefix, build-time guard rails.'
		},
		{
			n: '10.8',
			title: 'File uploads',
			slug: '08-file-uploads',
			blurb: 'multipart/form-data, File from FormData, server-side size + MIME checks.'
		}
	];
</script>

<svelte:head>
	<title>Module 10 · API Routes & Forms · Ultimate Frontend</title>
	<meta
		name="description"
		content="Classic SvelteKit server patterns — +server.ts endpoints, form actions, progressive enhancement, environment variables, file uploads."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules">← All modules</a>
	</nav>

	<header>
		<p class="eyebrow">Module 10 · Classic patterns</p>
		<h1>API Routes &amp; Forms</h1>
		<p class="lede">
			Eight lessons on the stable, progressive-enhancement-first SvelteKit
			server patterns. <code>+server.ts</code> endpoints, the
			<code>actions</code> export, <code>use:enhance</code>,
			<code>ActionData</code>, environment variables, and file uploads.
		</p>
	</header>

	<ol class="lessons">
		{#each lessons as lesson (lesson.n)}
			<li>
				<a href="/modules/10-api-forms/{lesson.slug}">
					<span class="n">{lesson.n}</span>
					<span class="t">{lesson.title}</span>
					<span class="b">{lesson.blurb}</span>
				</a>
			</li>
		{/each}
	</ol>

	<aside class="project">
		<p class="eyebrow">Module project</p>
		<h2>Full CRUD Note-Taking App</h2>
		<p>
			A complete notes app with create, edit, delete, file attachments, and a
			public JSON feed via <code>+server.ts</code>. Works without JavaScript;
			progressively enhances with <code>use:enhance</code> when JS is
			available.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(60% 0.18 220);
	}
	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: var(--text-sm);
		min-block-size: 44px;
		display: inline-flex;
		align-items: center;
	}
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.lede {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		max-inline-size: var(--prose-max);
	}
	.lessons {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-sm);
	}
	.lessons a {
		display: grid;
		grid-template-columns: 4rem 1fr;
		gap: var(--space-xs) var(--space-md);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		min-block-size: 44px;
		transition: transform var(--dur-fast) var(--ease-out);
	}
	.lessons a:hover {
		transform: translateX(2px);
		border-inline-start-width: 8px;
	}
	.n {
		color: var(--color-brand);
		font-weight: 700;
		font-family: ui-monospace, Menlo, monospace;
	}
	.t {
		font-weight: 600;
	}
	.b {
		grid-column: 2;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
	.project {
		padding: var(--space-lg);
		background: linear-gradient(135deg, var(--color-surface-2), oklch(from var(--color-brand) 92% 0.05 h));
		border: 1px solid var(--color-brand);
		border-radius: var(--radius-lg);
	}
	.project h2 {
		font-size: var(--text-xl);
		margin-block: var(--space-xs) var(--space-sm);
	}
	@media (prefers-reduced-motion: reduce) {
		.lessons a {
			transition: none;
		}
		.lessons a:hover {
			transform: none;
		}
	}
</style>
