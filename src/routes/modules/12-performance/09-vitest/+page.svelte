<!--
	Lesson 12.9 — Vitest unit testing
	Instructional route: shows the test file code and the source code side-by-side.
	The actual tests live at src/lib/stores/cart.svelte.test.ts (do not run here).
-->
<script lang="ts">
	const cartTest = `import { flushSync } from 'svelte';
import { beforeEach, describe, it, expect } from 'vitest';
import { cart } from '$lib/stores/cart.svelte';

describe('CartStore', () => {
  beforeEach(() => {
    cart.clear();
    flushSync();
  });

  it('adds an item', () => {
    cart.add({ id: 'a', name: 'Torus', price: 19 });
    flushSync();
    expect(cart.count).toBe(1);
    expect(cart.total).toBe(19);
  });

  it('bumps quantity on duplicate add', () => {
    cart.add({ id: 'a', name: 'Torus', price: 19 });
    cart.add({ id: 'a', name: 'Torus', price: 19 });
    flushSync();
    expect(cart.count).toBe(2);
    expect(cart.items.length).toBe(1);
  });
});`;
</script>

<svelte:head>
	<title>Lesson 12.9 · Vitest unit testing · Ultimate Frontend</title>
	<meta
		name="description"
		content="A walkthrough of a Vitest test suite for a reactive class store, with the test file shown side-by-side with the source."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.9 · Mini-build</p>
		<h1>Unit tests for a reactive store</h1>
		<p class="lede">
			The tests below live in <code>src/lib/stores/cart.svelte.test.ts</code>. Run them with
			<code>pnpm vitest</code> once you add a Vitest config to the project.
		</p>
	</header>

	<article class="code">
		<h2>cart.svelte.test.ts</h2>
		<pre><code>{cartTest}</code></pre>
	</article>

	<aside class="tips">
		<h2>Three rules</h2>
		<ol>
			<li><code>flushSync()</code> before asserting on derived values.</li>
			<li>Reset singletons in <code>beforeEach</code>.</li>
			<li>Query by role or label — never by CSS class.</li>
		</ol>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 140);
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

	.code {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.code h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	pre {
		margin: 0;
		overflow-x: auto;
		font-size: var(--text-sm);
		line-height: 1.5;
	}

	pre code {
		background: none;
		padding: 0;
	}

	.tips {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}

	.tips h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	.tips ol {
		margin: 0;
		padding-inline-start: var(--space-md);
		display: grid;
		gap: var(--space-xs);
	}
</style>
