<!--
	Lesson 7.13 — GSAP + Svelte transitions together
	A modal whose entrance/exit is a Svelte transition, with a GSAP pulse on a
	nested badge element so the two systems never fight over the same property.
-->
<script lang="ts">
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { gsap } from 'gsap';
	import { prefersReducedMotion } from 'svelte/motion';
	import { DUR } from '$lib/motion';

	const reduced = $derived(prefersReducedMotion.current);

	let open: boolean = $state(false);
	let badge: HTMLElement | undefined = $state();

	$effect(() => {
		if (!badge) return;
		if (reduced) {
			gsap.set(badge, { scale: 1 });
			return;
		}
		const tween = gsap.to(badge, {
			scale: 1.08,
			duration: 1.1,
			ease: 'sine.inOut',
			repeat: -1,
			yoyo: true
		});
		return () => {
			tween.kill();
		};
	});
</script>

<svelte:head>
	<title>Lesson 7.13 · Both systems · Ultimate Frontend</title>
	<meta
		name="description"
		content="A modal using a Svelte transition on the outer element and GSAP on a nested badge — no conflict."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/07-gsap">← Module 7</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 7.13 · Mini-build</p>
		<h1>Svelte transition outside, GSAP loop inside</h1>
		<p class="lead">
			Open the modal. The outer element is owned by Svelte's <code>transition:scale</code>.
			The gold badge inside is owned by a GSAP pulse loop. Different elements = no conflict.
		</p>
	</header>

	<button type="button" class="primary" onclick={() => (open = !open)}>
		{open ? 'Close modal' : 'Open modal'}
	</button>

	{#if open}
		<article
			class="modal"
			transition:scale={{
				duration: reduced ? 0 : DUR.base,
				start: reduced ? 1 : 0.95,
				opacity: 0,
				easing: backOut
			}}
		>
			<header class="modal__head">
				<h2>Premium plan</h2>
				<span class="badge" bind:this={badge}>New</span>
			</header>
			<p>
				The badge pulses continuously via GSAP. The modal itself opens and closes via Svelte's
				built-in <code>transition:scale</code>. Neither interferes with the other because they
				own different DOM elements.
			</p>
			<button type="button" class="ghost" onclick={() => (open = false)}>Dismiss</button>
		</article>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(75% 0.16 65);
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

	.ghost {
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		min-block-size: 2.75rem;
	}

	.modal {
		padding: var(--space-xl);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		max-inline-size: 32rem;
	}

	.modal__head {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-block-end: var(--space-md);
	}

	.modal__head h2 {
		margin: 0;
	}

	.badge {
		display: inline-grid;
		place-items: center;
		padding: 0.25rem var(--space-sm);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: 700;
		letter-spacing: 0.05em;
	}
</style>
