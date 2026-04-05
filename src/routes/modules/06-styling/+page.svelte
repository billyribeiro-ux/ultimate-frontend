<!--
	Module 6 index — lists all 18 lessons with links to each mini-build route.
-->
<script lang="ts">
	type Lesson = {
		number: string;
		title: string;
		href: string;
	};

	const lessons: readonly Lesson[] = [
		{ number: '6.1', title: 'PE7 @layer architecture in full depth', href: '/modules/06-styling/01-layer-architecture' },
		{ number: '6.2', title: 'OKLCH color system in depth', href: '/modules/06-styling/02-oklch-system' },
		{ number: '6.3', title: 'Design token system', href: '/modules/06-styling/03-design-tokens' },
		{ number: '6.4', title: 'Native CSS nesting in Svelte', href: '/modules/06-styling/04-css-nesting' },
		{ number: '6.5', title: 'Logical properties', href: '/modules/06-styling/05-logical-properties' },
		{ number: '6.6', title: 'Responsive layout — CSS Grid', href: '/modules/06-styling/06-grid-patterns' },
		{ number: '6.7', title: 'Responsive layout — Flexbox', href: '/modules/06-styling/07-flexbox-patterns' },
		{ number: '6.8', title: 'Container queries', href: '/modules/06-styling/08-container-queries' },
		{ number: '6.9', title: 'Per-page color personalities', href: '/modules/06-styling/09-color-personalities' },
		{ number: '6.10', title: 'CSS transitions with motion tokens', href: '/modules/06-styling/10-css-transitions' },
		{ number: '6.11', title: 'Svelte transition: directive', href: '/modules/06-styling/11-svelte-transitions' },
		{ number: '6.12', title: 'in: and out: asymmetric animations', href: '/modules/06-styling/12-in-out-transitions' },
		{ number: '6.13', title: 'animate:flip list reordering', href: '/modules/06-styling/13-animate-flip' },
		{ number: '6.14', title: 'Tween for value interpolation', href: '/modules/06-styling/14-tweened' },
		{ number: '6.15', title: 'Spring for physics-based motion', href: '/modules/06-styling/15-spring' },
		{ number: '6.16', title: 'Custom transition functions', href: '/modules/06-styling/16-custom-transitions' },
		{ number: '6.17', title: 'Transition parameters and stagger', href: '/modules/06-styling/17-stagger' },
		{ number: '6.18', title: 'Reduced motion for accessibility', href: '/modules/06-styling/18-reduced-motion' }
	];
</script>

<svelte:head>
	<title>Module 6 · Styling Mastery · Ultimate Frontend</title>
	<meta
		name="description"
		content="Eighteen lessons covering PE7 architecture, OKLCH, container queries, and the full Svelte animation system."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules">← All modules</a>
	</nav>

	<header>
		<p class="eyebrow">Module 6</p>
		<h1>Styling Mastery</h1>
		<p class="lead">
			PE7 in depth — <code>@layer</code>, OKLCH, fluid clamps, container queries, logical
			properties, CSS transitions, Svelte transitions, <code>svelte/motion</code>,
			<code>animate:flip</code>, custom transitions, and reduced-motion.
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
			<a href="/modules/06-styling/project">Animated Landing Page →</a>
		</p>
	</footer>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.2 110);
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

	.project a {
		color: var(--color-text);
		font-weight: 600;
	}
</style>
