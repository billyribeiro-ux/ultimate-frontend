<script lang="ts">
	const oldWay: string = 'Three files, two interfaces, one string-literal URL.';
	const newWay: string = 'One file, one function, zero string-literal URLs.';
</script>

<svelte:head>
	<title>Lesson 9B.1 · What Remote Functions are · Ultimate Frontend</title>
	<meta
		name="description"
		content="Why SvelteKit Remote Functions exist and the end-to-end type safety they provide over classic fetch/+server.ts patterns."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09b-remote">← Module 9B</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9B.1 · May 2026 paradigm</p>
		<h1>What Remote Functions are and why they exist</h1>
		<p class="lede">
			SvelteKit's newest answer to the "two codebases" problem. One file, both
			ends of the wire, end-to-end type safety.
		</p>
	</header>

	<article class="compare">
		<div class="compare__card compare__card--old">
			<p class="compare__label">The old way</p>
			<p class="compare__body">{oldWay}</p>
			<ul>
				<li><code>src/routes/api/posts/+server.ts</code></li>
				<li><code>interface PostDTO</code> on the server</li>
				<li><code>interface PostDTO</code> on the client</li>
				<li><code>fetch('/api/posts')</code> + manual types</li>
			</ul>
		</div>
		<div class="compare__card compare__card--new">
			<p class="compare__label">The May 2026 way</p>
			<p class="compare__body">{newWay}</p>
			<ul>
				<li><code>posts.remote.ts</code></li>
				<li><code>export const getPosts = query(...)</code></li>
				<li><code>import &#123; getPosts &#125;</code></li>
				<li>Return type flows to the caller for free</li>
			</ul>
		</div>
	</article>

	<aside class="explain">
		<h2>The four flavours</h2>
		<dl>
			<dt><code>query</code></dt>
			<dd>Reads dynamic data. Replaces GET endpoints and <code>load()</code>.</dd>
			<dt><code>form</code></dt>
			<dd>Progressively enhanced HTML forms with Valibot validation.</dd>
			<dt><code>command</code></dt>
			<dd>JS-only mutations — button clicks, optimistic updates.</dd>
			<dt><code>prerender</code></dt>
			<dd>Build-time static data that ships to a CDN.</dd>
		</dl>
	</aside>

	<aside class="explain">
		<h2>DevTools moment</h2>
		<p>
			Open the Network tab and reload this page. You will see exactly one
			request: the HTML document. No XHR calls. Module 9B is <em>about</em>
			that panel — from 9B.2 onward every lesson proves its concept by
			pointing to it.
		</p>
	</aside>
</section>

<style>
	/* Per-page personality for Module 9B: magenta — "new paradigm". */
	section {
		--color-brand: oklch(65% 0.25 330);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
			min-block-size: 44px;
			display: inline-flex;
			align-items: center;

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

	h1 {
		font-size: var(--text-2xl);
		margin-block-start: var(--space-xs);
	}

	.lede {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		max-inline-size: var(--prose-max);
	}

	.compare {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: 1fr;

		@media (min-width: 768px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.compare__card {
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		background: var(--color-surface-2);

		& ul {
			list-style: none;
			padding: 0;
			margin-block-start: var(--space-sm);
			display: grid;
			gap: var(--space-xs);
		}

		& li {
			font-size: var(--text-sm);
			color: var(--color-text-muted);
		}
	}

	.compare__card--new {
		border-color: var(--color-brand);
		box-shadow: var(--shadow-md);
		background: linear-gradient(
			135deg,
			var(--color-surface-2),
			oklch(from var(--color-brand) 95% 0.04 h)
		);
	}

	.compare__label {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.compare__body {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-block-start: var(--space-xs);
	}

	.explain {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);

		& h2 {
			font-size: var(--text-lg);
			margin-block-end: var(--space-sm);
		}

		& dt {
			font-weight: 600;
			margin-block-start: var(--space-sm);
		}

		& dd {
			margin: 0;
			color: var(--color-text-muted);
		}
	}
</style>
