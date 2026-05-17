<!--
	Module 14 index — lists all 8 lessons with links to each mini-build route.
-->
<script lang="ts">
	type Lesson = {
		number: string;
		title: string;
		href: string;
	};

	const lessons: readonly Lesson[] = [
		{ number: '14.1', title: 'What Threlte is', href: '/modules/14-threlte/01-what-is-threlte' },
		{ number: '14.2', title: 'Scene fundamentals', href: '/modules/14-threlte/02-scene-fundamentals' },
		{ number: '14.3', title: 'Loading 3D models', href: '/modules/14-threlte/03-loading-models' },
		{ number: '14.4', title: 'Interactivity', href: '/modules/14-threlte/04-interactivity' },
		{ number: '14.5', title: 'Scroll-driven 3D scenes', href: '/modules/14-threlte/05-scroll-driven-3d' },
		{ number: '14.6', title: 'Post-processing', href: '/modules/14-threlte/06-post-processing' },
		{ number: '14.7', title: 'Physics with Rapier', href: '/modules/14-threlte/07-physics-rapier' },
		{ number: '14.8', title: 'Production 3D', href: '/modules/14-threlte/08-production-3d' }
	];
</script>

<svelte:head>
	<title>Module 14 · 3D with Threlte · Ultimate Frontend</title>
	<meta
		name="description"
		content="Eight lessons covering Threlte fundamentals, model loading, interactivity, scroll-driven scenes, post-processing, physics, and production optimization."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules">← All modules</a>
	</nav>

	<header>
		<p class="eyebrow">Module 14</p>
		<h1>3D with Threlte</h1>
		<p class="lead">
			Build production-ready 3D experiences in SvelteKit. From declarative scene setup through
			GLTF model loading, raycasting interactivity, scroll-driven animations, cinematic
			post-processing, physics simulation, and performance optimization for real users on real
			devices.
		</p>
	</header>

	<ol class="lessons" role="list">
		{#each lessons as lesson (lesson.number)}
			<li>
				<a class="lesson" href={lesson.href}>
					<span class="lesson__num">{lesson.number}</span>
					<span class="lesson__title">{lesson.title}</span>
					<span class="lesson__arrow" aria-hidden="true">→</span>
				</a>
			</li>
		{/each}
	</ol>

	<footer class="project">
		<h2>Module project</h2>
		<p>
			<strong>3D Product Showcase</strong> — a scroll-driven product page with GLTF model, interactive
			hotspots, bloom on hover, physics drop, lazy loading, and reduced-motion safety.
		</p>
	</footer>
</section>

<style>
	section {
		--color-brand: oklch(58% 0.2 250);
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
		max-inline-size: 60ch;
	}

	.lessons {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xs);
	}

	.lesson {
		display: grid;
		grid-template-columns: 3.5rem 1fr auto;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-md) var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text);
		min-block-size: 2.75rem;
		transition:
			transform var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.lesson:hover,
	.lesson:focus-visible {
		transform: translateX(4px);
		border-color: var(--color-brand);
	}

	.lesson__num {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		color: var(--color-brand);
		font-weight: 600;
	}

	.lesson__arrow {
		color: var(--color-text-muted);
	}

	.project {
		padding: var(--space-lg);
		border-top: 1px solid var(--color-border);
		margin-block-start: var(--space-xl);
	}

	.project h2 {
		margin: 0 0 var(--space-sm);
		color: var(--color-brand);
	}

	.project p {
		color: var(--color-text-muted);
		max-inline-size: 50ch;
	}
</style>
