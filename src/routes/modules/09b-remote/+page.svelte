<script lang="ts">
	interface LessonLink {
		n: string;
		title: string;
		slug: string;
		blurb: string;
	}

	const lessons: LessonLink[] = [
		{
			n: '9B.1',
			title: 'What Remote Functions are',
			slug: '01-what-remote-functions-are',
			blurb: 'The two-codebases problem, end-to-end type safety, the four flavours.'
		},
		{
			n: '9B.2',
			title: 'query — reading data',
			slug: '02-query-reading-data',
			blurb: 'Your first .remote.ts file, awaited in a component, refreshable.'
		},
		{
			n: '9B.3',
			title: 'query with arguments',
			slug: '03-query-arguments',
			blurb: 'Valibot schemas, devalue for Date & Map, argument-based caching.'
		},
		{
			n: '9B.4',
			title: 'query.batch()',
			slug: '04-query-batch',
			blurb: 'Collapsing N+1 waterfalls into one HTTP round trip.'
		},
		{
			n: '9B.5',
			title: 'form remote functions',
			slug: '05-form-with-valibot',
			blurb: 'Progressively enhanced forms with Valibot + preflight validation.'
		},
		{
			n: '9B.6',
			title: 'File upload streaming',
			slug: '06-file-upload',
			blurb: 'v.file, v.mimeType, v.maxSize, and custom enhance for progress.'
		},
		{
			n: '9B.7',
			title: 'command — mutations',
			slug: '07-command-mutations',
			blurb: 'JS-only mutations and optimistic UI via .withOverride().'
		},
		{
			n: '9B.8',
			title: 'query.set + query.refresh',
			slug: '08-query-set',
			blurb: 'Single-flight mutations — one round trip, two deliveries.'
		},
		{
			n: '9B.9',
			title: 'Async SSR',
			slug: '09-async-ssr',
			blurb: '<svelte:boundary pending> and the road to top-level await.'
		},
		{
			n: '9B.10',
			title: 'Choosing the right tool',
			slug: '10-choosing-the-right-tool',
			blurb: 'load vs query vs form vs command vs +server.ts decision sheet.'
		}
	];
</script>

<svelte:head>
	<title>Module 9B · Remote Functions · Ultimate Frontend</title>
	<meta
		name="description"
		content="SvelteKit's April 2026 paradigm for type-safe client/server communication — query, form, command, and prerender."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules">← All modules</a>
	</nav>

	<header>
		<p class="eyebrow">Module 9B · April 2026</p>
		<h1>Remote Functions</h1>
		<p class="lede">
			Ten lessons on SvelteKit's newest paradigm for type-safe client/server
			communication. <code>query</code>, <code>form</code>,
			<code>command</code>, <code>query.batch</code>, streaming uploads,
			single-flight mutations, and async SSR.
		</p>
	</header>

	<ol class="lessons">
		{#each lessons as lesson (lesson.n)}
			<li>
				<a href="/modules/09b-remote/{lesson.slug}">
					<span class="n">{lesson.n}</span>
					<span class="t">{lesson.title}</span>
					<span class="b">{lesson.blurb}</span>
				</a>
			</li>
		{/each}
	</ol>

	<aside class="project">
		<p class="eyebrow">Module project</p>
		<h2>Real-Time Data Application</h2>
		<p>
			A live dashboard combining <code>query.batch()</code>, a
			<code>form</code> remote function with Valibot preflight,
			<code>command</code> mutations with optimistic UI, and async SSR
			skeletons. PE7 styled, fully typed, zero <code>any</code>.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(65% 0.25 330);
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
		counter-reset: lesson;
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
