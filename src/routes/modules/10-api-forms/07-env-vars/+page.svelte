<script lang="ts">
	let { data }: { data: { publicSiteName: string; databaseHint: string } } = $props();
</script>

<svelte:head>
	<title>Lesson 10.7 · Environment variables · Ultimate Frontend</title>
	<meta
		name="description"
		content="The four $env modules in SvelteKit, private vs public, static vs dynamic, and the PUBLIC_ prefix rule."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/10-api-forms">← Module 10</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 10.7 · Environment</p>
		<h1>The four <code>$env</code> modules</h1>
		<p class="lede">Secrets on the server, knobs everywhere — with build-time guard rails.</p>
	</header>

	<table class="env">
		<thead>
			<tr>
				<th>Variable</th>
				<th>Module</th>
				<th>Value</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><code>PUBLIC_SITE_NAME</code></td>
				<td><code>$env/static/public</code></td>
				<td>{data.publicSiteName}</td>
			</tr>
			<tr>
				<td><code>DATABASE_URL</code></td>
				<td><code>$env/static/private</code></td>
				<td>
					<span class="secret" aria-label="Server only">{data.databaseHint}</span>
					<span class="tag">server only</span>
				</td>
			</tr>
		</tbody>
	</table>

	<aside class="explain">
		<h2>The four flavours, at a glance</h2>
		<ul>
			<li><code>$env/static/public</code> — build-time, browser-safe, <code>PUBLIC_*</code> only.</li>
			<li><code>$env/static/private</code> — build-time, server-only, any name.</li>
			<li><code>$env/dynamic/public</code> — run-time, browser-safe, <code>PUBLIC_*</code> only.</li>
			<li><code>$env/dynamic/private</code> — run-time, server-only, any name.</li>
		</ul>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(78% 0.14 85);
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
	.env {
		inline-size: 100%;
		border-collapse: collapse;
		background: var(--color-surface-2);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}
	.env th,
	.env td {
		padding: var(--space-sm) var(--space-md);
		text-align: start;
		border-block-end: 1px solid var(--color-border);
	}
	.env th {
		background: color-mix(in oklch, var(--color-brand) 12%, var(--color-surface));
		font-weight: 700;
	}
	.secret {
		font-family: ui-monospace, Menlo, monospace;
		background: var(--color-surface);
		padding: 0.1em 0.3em;
		border-radius: var(--radius-sm);
	}
	.tag {
		display: inline-block;
		margin-inline-start: var(--space-xs);
		padding: 0 var(--space-xs);
		background: var(--color-brand);
		color: oklch(20% 0.02 85);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: 700;
		text-transform: uppercase;
	}
	.explain {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}
	.explain h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}
	.explain ul {
		margin: 0;
		padding-inline-start: var(--space-md);
	}
</style>
