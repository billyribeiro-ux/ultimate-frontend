<!--
	Lesson 12.12 — 3D performance with Threlte
	Mini-build: a lazy-loaded 3D hero that:
	  1. Lives in its own chunk (dynamic import)
	  2. Only loads when scrolled into view (IntersectionObserver via use:intersect)
	  3. Renders a poster image instead if prefers-reduced-motion is on
	  4. Unmounts when scrolled off-screen
	  5. Is fully SSR-safe — the import is never called on the server because
	     shouldLoad starts false and only flips inside a browser-only event.
-->
<script lang="ts">
	import { intersect } from '$lib/actions/intersect.svelte';
	import { browser } from '$app/environment';

	let shouldLoad = $state<boolean>(false);
	let canvasVisible = $state<boolean>(false);
	let reducedMotion = $state<boolean>(false);

	$effect(() => {
		if (!browser) return;
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mq.matches;
		const onChange = (event: MediaQueryListEvent): void => {
			reducedMotion = event.matches;
		};
		mq.addEventListener('change', onChange);
		return () => {
			mq.removeEventListener('change', onChange);
		};
	});

	function onEnter(): void {
		canvasVisible = true;
		shouldLoad = true;
	}

	function onLeave(): void {
		canvasVisible = false;
	}

	// Inline SVG poster so the page ships with a static fallback without
	// requiring a real binary asset in the repo.
	const posterDataUri: string =
		'data:image/svg+xml;utf8,' +
		encodeURIComponent(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
				<defs>
					<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stop-color="#4b5dff" />
						<stop offset="1" stop-color="#1a1f5a" />
					</linearGradient>
				</defs>
				<rect width="1600" height="900" fill="url(#g)" />
				<circle cx="800" cy="450" r="180" fill="none" stroke="#8ea0ff" stroke-width="40" opacity="0.8" />
				<circle cx="800" cy="450" r="180" fill="none" stroke="#c8d1ff" stroke-width="8" />
				<text x="800" y="820" text-anchor="middle" font-family="system-ui" font-size="42" fill="#c8d1ff">3D hero (reduced-motion poster)</text>
			</svg>`
		);
</script>

<svelte:head>
	<title>Lesson 12.12 · 3D performance · Ultimate Frontend</title>
	<meta
		name="description"
		content="A lazy-loaded Threlte 3D hero that clamps DPR, uses frameloop demand, pauses off-screen, and falls back to a poster image under prefers-reduced-motion."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.12 · Mini-build</p>
		<h1>A 3D hero that behaves</h1>
		<p class="lede">
			Scroll down. The canvas only downloads when it enters the viewport. It unmounts when it
			leaves. And if you have reduced motion enabled, you get a still poster instead.
		</p>
	</header>

	<div class="spacer">
		<p>Scroll down to trigger the hero…</p>
	</div>

	<div
		class="hero"
		use:intersect={{ onEnter, onLeave, threshold: 0.15 }}
	>
		{#if reducedMotion}
			<img
				class="poster"
				src={posterDataUri}
				alt="Static poster of the 3D hero scene"
				width="1600"
				height="900"
				loading="eager"
				fetchpriority="high"
			/>
		{:else if shouldLoad && canvasVisible && browser}
			{#await import('./Scene.svelte')}
				<div class="placeholder">Loading 3D scene…</div>
			{:then { default: Scene }}
				<Scene />
			{:catch error}
				<div class="placeholder error">
					Scene failed to load: {error.message}
				</div>
			{/await}
		{:else}
			<div class="placeholder">Scene will load when scrolled into view.</div>
		{/if}
	</div>

	<aside class="guards">
		<h2>Guards applied</h2>
		<ul>
			<li>Dynamic <code>import('./Scene.svelte')</code> — not in initial chunk.</li>
			<li><code>use:intersect</code> — only loads when visible.</li>
			<li>Unmounts on <code>onLeave</code> — frees GPU memory.</li>
			<li><code>dpr=&#123;[1, 2]&#125;</code> inside Scene — caps retina cost.</li>
			<li><code>frameloop="demand"</code> — no idle renders.</li>
			<li><code>prefers-reduced-motion</code> → static poster image.</li>
			<li>SSR-safe — <code>shouldLoad</code> starts false, <code>browser</code> guard.</li>
		</ul>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 260);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
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

	.spacer {
		block-size: 60vh;
		display: grid;
		place-items: center;
		color: var(--color-text-muted);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
	}

	.hero {
		inline-size: 100%;
		aspect-ratio: 16 / 9;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: linear-gradient(135deg, oklch(30% 0.08 260), oklch(18% 0.05 280));
	}

	.poster {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.placeholder {
		inline-size: 100%;
		block-size: 100%;
		display: grid;
		place-items: center;
		color: oklch(90% 0.02 260);
		font-size: var(--text-lg);
	}

	.placeholder.error {
		color: var(--color-error);
	}

	.guards {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}

	.guards h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	.guards ul {
		margin: 0;
		padding-inline-start: var(--space-md);
		display: grid;
		gap: var(--space-xs);
	}
</style>
