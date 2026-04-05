<!--
	Lesson 6.16 — Custom transition functions
	A hero reveal using two custom transitions: a CSS-based curtain wipe on the
	hero card and a tick-based typewriter on the headline text.
-->
<script lang="ts">
	import { curtain, typewriter } from '$lib/transitions/curtain';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let mounted: boolean = $state(false);

	function toggle(): void {
		mounted = !mounted;
	}
</script>

<svelte:head>
	<title>Lesson 6.16 · Custom transitions · Ultimate Frontend</title>
	<meta name="description" content="Two custom Svelte transitions: a curtain reveal and a typewriter text effect." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/06-styling">← Module 6</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 6.16 · Mini-build</p>
		<h1>Hero reveal with two custom transitions</h1>
		<p class="lead">
			The hero card uses a custom CSS-based <code>curtain</code> transition. The headline below
			uses a custom <code>tick</code>-based <code>typewriter</code> transition. Toggle to replay.
		</p>
	</header>

	<button class="primary" type="button" onclick={toggle}>
		{mounted ? 'Reset' : 'Enter'}
	</button>

	{#if mounted}
		<article
			class="hero"
			transition:curtain={{ duration: reduced ? 0 : 700 }}
		>
			<p class="hero__tag">Case Study</p>
			<h2 class="hero__title">Tokens, not magic numbers</h2>
			<p class="hero__body">
				PE7 architecture keeps every motion, colour, and spacing decision in one file.
				When the team ships a redesign, they change tokens — not components.
			</p>
		</article>

		{#if !reduced}
			<h2 class="typewriter-line" transition:typewriter={{ speed: 1.2 }}>
				Every character of this headline is being printed one frame at a time.
			</h2>
		{:else}
			<h2 class="typewriter-line">
				Every character of this headline is being printed one frame at a time.
			</h2>
		{/if}
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(45% 0.18 265);
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

	.primary {
		align-self: flex-start;
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: var(--color-surface);
		font-weight: 600;
		min-block-size: 2.75rem;
	}

	.hero {
		padding: var(--space-xl);
		background: linear-gradient(
			135deg,
			var(--color-brand),
			oklch(from var(--color-brand) 60% 0.12 h)
		);
		color: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
	}

	.hero__tag {
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.75;
	}

	.hero__title {
		font-size: var(--text-2xl);
		margin-block: var(--space-xs) var(--space-md);
	}

	.hero__body {
		max-inline-size: 60ch;
		color: oklch(98% 0.01 265);
	}

	.typewriter-line {
		font-size: var(--text-xl);
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		color: var(--color-brand);
	}
</style>
