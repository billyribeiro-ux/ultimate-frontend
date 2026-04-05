<!--
	Module 7 index — lists all 14 lessons with links to each mini-build route.
-->
<script lang="ts">
	type Lesson = {
		number: string;
		title: string;
		href: string;
	};

	const lessons: readonly Lesson[] = [
		{ number: '7.1', title: 'What GSAP is and when to reach for it', href: '/modules/07-gsap/01-what-is-gsap' },
		{ number: '7.2', title: 'Installing GSAP with pnpm', href: '/modules/07-gsap/02-install' },
		{ number: '7.3', title: 'gsap.to / from / fromTo', href: '/modules/07-gsap/03-to-from-fromto' },
		{ number: '7.4', title: 'GSAP Timelines', href: '/modules/07-gsap/04-timelines' },
		{ number: '7.5', title: 'bind:this — DOM element references', href: '/modules/07-gsap/05-bind-this' },
		{ number: '7.6', title: '$effect as the bridge', href: '/modules/07-gsap/06-effect-bridge' },
		{ number: '7.7', title: 'GSAP cleanup in $effect', href: '/modules/07-gsap/07-cleanup' },
		{ number: '7.8', title: 'Stagger animations', href: '/modules/07-gsap/08-stagger' },
		{ number: '7.9', title: 'ScrollTrigger with SvelteKit', href: '/modules/07-gsap/09-scrolltrigger' },
		{ number: '7.10', title: 'ScrollTrigger + navigation', href: '/modules/07-gsap/10-navigation' },
		{ number: '7.11', title: 'Svelte use: actions and attachments', href: '/modules/07-gsap/11-actions' },
		{ number: '7.12', title: 'Scroll reveal action', href: '/modules/07-gsap/12-reveal-action' },
		{ number: '7.13', title: 'GSAP + Svelte transitions together', href: '/modules/07-gsap/13-transitions-together' },
		{ number: '7.14', title: 'Introducing Threlte — 3D in Svelte', href: '/modules/07-gsap/14-threlte' }
	];
</script>

<svelte:head>
	<title>Module 7 · GSAP &amp; Threlte · Ultimate Frontend</title>
	<meta
		name="description"
		content="Fourteen lessons covering GSAP timelines, ScrollTrigger with SvelteKit, actions, and a first pass at Threlte 3D."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules">← All modules</a>
	</nav>

	<header>
		<p class="eyebrow">Module 7</p>
		<h1>GSAP &amp; Threlte</h1>
		<p class="lead">
			Where Svelte's built-in animation ends and professional motion begins. GSAP timelines,
			ScrollTrigger configured for SvelteKit navigation, reusable actions, and a first pass at
			3D with Threlte.
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
			<a href="/modules/07-gsap/project">Premium Marketing Page →</a>
		</p>
	</footer>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.22 15);
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
