<script lang="ts">
	interface Scenario {
		readonly q: string;
		readonly tool: string;
		readonly why: string;
	}

	const scenarios: Scenario[] = [
		{
			q: 'The blog post title must appear in Google results.',
			tool: 'load()',
			why: 'SSR-critical initial data. Needs to exist in the first HTML response.'
		},
		{
			q: 'A search box shows suggestions as the user types.',
			tool: 'query()',
			why: 'Dynamic, on-demand reads. Per-term caching is automatic.'
		},
		{
			q: 'A user clicks delete on a row in a table.',
			tool: 'command()',
			why: 'JS-only mutation with no form element. Pair with optimistic UI.'
		},
		{
			q: 'A registration form with email + password.',
			tool: 'form()',
			why: 'Works without JavaScript — important for account creation.'
		},
		{
			q: 'Stripe calls your webhook URL.',
			tool: '+server.ts',
			why: 'A third party needs a stable public URL and method.'
		},
		{
			q: 'Infinite scroll on a feed loads more items.',
			tool: 'query()',
			why: 'Dynamic, parameterized, lazy. Use a page-number argument.'
		},
		{
			q: 'A user uploads a profile picture.',
			tool: 'form()',
			why: 'Multipart form data + streaming + graceful degradation.'
		},
		{
			q: 'A "mark all as read" button on a notifications panel.',
			tool: 'command()',
			why: 'A single-click JS action; no form element involved.'
		},
		{
			q: 'A mobile app hits /api/v1/users on your server.',
			tool: '+server.ts',
			why: 'Public API for an external consumer. Document the URL.'
		},
		{
			q: 'The first 10 blog posts on the home page.',
			tool: 'load()',
			why: 'SSR-critical listing. Hydrate further pages with query().'
		}
	];
</script>

<svelte:head>
	<title>Lesson 9B.10 · Choosing the right tool · Ultimate Frontend</title>
	<meta
		name="description"
		content="Decision framework for picking between load(), query, form, command, and +server.ts in SvelteKit."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09b-remote">← Module 9B</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9B.10 · Decision framework</p>
		<h1>Pick the right tool</h1>
		<p class="lede">
			Four questions, five tools, one clear answer for every feature.
		</p>
	</header>

	<article class="table">
		<div class="row row--head">
			<div>Tool</div>
			<div>Job</div>
			<div>Use when…</div>
		</div>
		<div class="row">
			<div><code>load()</code></div>
			<div>SSR-critical initial data</div>
			<div>The data must be in the first HTML response.</div>
		</div>
		<div class="row">
			<div><code>query()</code></div>
			<div>Dynamic reads</div>
			<div>A component requests data at render or on interaction.</div>
		</div>
		<div class="row">
			<div><code>form()</code></div>
			<div>Progressive forms</div>
			<div>The user submits an HTML form; works without JS.</div>
		</div>
		<div class="row">
			<div><code>command()</code></div>
			<div>JS-only mutations</div>
			<div>Button clicks, keyboard shortcuts, menu actions.</div>
		</div>
		<div class="row">
			<div><code>+server.ts</code></div>
			<div>Public endpoints</div>
			<div>Webhooks, OAuth callbacks, public JSON APIs.</div>
		</div>
	</article>

	<h2 class="h2">Name the tool</h2>
	<ol class="quiz">
		{#each scenarios as s, i (i)}
			<li>
				<p class="quiz__q">{s.q}</p>
				<details>
					<summary>Reveal answer</summary>
					<p><strong>{s.tool}</strong> — {s.why}</p>
				</details>
			</li>
		{/each}
	</ol>
</section>

<style>
	section {
		--color-brand: oklch(55% 0.05 250);
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
	.h2 {
		font-size: var(--text-xl);
	}
	.table {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}
	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border-block-end: 1px solid var(--color-border);

		@media (min-width: 768px) {
			grid-template-columns: 10rem 12rem 1fr;
		}
	}
	.row:last-child {
		border-block-end: none;
	}
	.row--head {
		background: color-mix(in oklch, var(--color-brand) 10%, var(--color-surface));
		font-weight: 700;
	}
	.quiz {
		list-style: decimal;
		padding-inline-start: var(--space-lg);
		display: grid;
		gap: var(--space-sm);
	}
	.quiz li {
		padding: var(--space-sm);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.quiz__q {
		margin: 0 0 var(--space-xs);
		font-weight: 600;
	}
	details summary {
		cursor: pointer;
		color: var(--color-brand);
		min-block-size: 44px;
		display: inline-flex;
		align-items: center;
	}
</style>
