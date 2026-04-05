<!--
	Lesson 7.5 — bind:this — getting DOM element references in Svelte
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import { prefersReducedMotion } from 'svelte/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let card: HTMLElement | undefined = $state();
	let mountedAt: string = $state('(not yet)');

	$effect(() => {
		if (!card) return;
		mountedAt = new Date().toLocaleTimeString();
		if (reduced) {
			gsap.set(card, { y: 0, opacity: 1 });
		} else {
			gsap.from(card, { y: 40, opacity: 0, duration: 0.7, ease: 'power2.out' });
		}
	});
</script>

<svelte:head>
	<title>Lesson 7.5 · bind:this · Ultimate Frontend</title>
	<meta name="description" content="A card whose entrance is driven by gsap.from against a bind:this reference." />
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.5 · Mini-build</p>
		<h1>Card revealed by bind:this</h1>
		<p class="lead">
			The card below receives its animation via a direct DOM reference — no selector strings,
			no class coupling. The status row shows exactly when the ref became non-null.
		</p>
	</header>

	<article class="card" bind:this={card}>
		<h2>Typed element references</h2>
		<p>
			The variable <code>card</code> is typed as <code>HTMLElement | undefined</code>. Inside a
			<code>$effect</code>, we narrow it with <code>if (!card) return</code> and then pass the
			concrete element to GSAP. Refactor-safe and scope-safe.
		</p>
	</article>

	<dl class="status">
		<div>
			<dt>card ref</dt>
			<dd>{card ? '<article> element' : 'undefined'}</dd>
		</div>
		<div>
			<dt>mounted at</dt>
			<dd>{mountedAt}</dd>
		</div>
	</dl>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.19 30);
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

	.card {
		padding: var(--space-xl);
		background: linear-gradient(135deg, var(--color-brand), oklch(60% 0.16 30));
		color: var(--color-surface);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
	}

	.card h2 {
		margin: 0 0 var(--space-sm);
	}

	.status {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.status div {
		display: flex;
		flex-direction: column;
	}

	.status dt {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.status dd {
		margin: 0;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
	}
</style>
