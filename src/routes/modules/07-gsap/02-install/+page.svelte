<!--
	Lesson 7.2 — Installing GSAP with pnpm and TypeScript types
	A status card that reads gsap.version to prove the install worked.
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';

	const version: string = gsap.version;

	$effect(() => {
		if (browser) {
			// eslint-disable-next-line no-console
			console.info(`[lesson 7.2] GSAP ${version} ready`);
		}
	});
</script>

<svelte:head>
	<title>Lesson 7.2 · Install GSAP · Ultimate Frontend</title>
	<meta name="description" content="Verifying GSAP is installed correctly by reading gsap.version." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.2 · Mini-build</p>
		<h1>GSAP installed and ready</h1>
		<p class="lead">
			Reading <code>gsap.version</code> proves the import, the bundler, and the TypeScript
			types all resolved correctly. Open the console to see a live log from this component.
		</p>
	</header>

	<article class="status-card">
		<div class="check" aria-hidden="true">✓</div>
		<div class="status-card__body">
			<h2>GSAP is installed</h2>
			<p>
				Version: <code>{version}</code>
			</p>
			<pre><code>import &#123; gsap &#125; from 'gsap';</code></pre>
			<p class="footnote">
				Types are bundled in <code>node_modules/gsap/types/</code>. Do not install
				<code>@types/gsap</code> — it is unnecessary and will conflict.
			</p>
		</div>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.13 180);
	}

	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lead {
		color: var(--color-text-muted);
		max-inline-size: 56ch;
	}

	.status-card {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-lg);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.check {
		display: grid;
		place-items: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: var(--radius-full);
		background: var(--color-success);
		color: var(--color-surface);
		font-size: var(--text-2xl);
		font-weight: 700;
	}

	.status-card__body h2 {
		margin: 0 0 var(--space-sm);
	}

	pre {
		margin: var(--space-sm) 0;
		padding: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		overflow-x: auto;
	}

	.footnote {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
</style>
