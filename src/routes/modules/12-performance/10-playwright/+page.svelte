<!--
	Lesson 12.10 — Playwright end-to-end testing
	Instructional route showing a Playwright test file.
-->
<script lang="ts">
	const homeTest = `import { test, expect } from '@playwright/test';

test('home page shows the course title', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /ultimate frontend/i })
  ).toBeVisible();
});

test('user can submit the contact form', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message').fill('I have questions.');
  await page.getByRole('button', { name: /send/i }).click();
  await expect(page.getByRole('status')).toContainText(/thank you/i);
});`;
</script>

<svelte:head>
	<title>Lesson 12.10 · Playwright · Ultimate Frontend</title>
	<meta
		name="description"
		content="A walkthrough of Playwright end-to-end tests that drive a real browser against a running SvelteKit app."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.10 · Mini-build</p>
		<h1>End-to-end tests that prove the journey</h1>
		<p class="lede">
			The tests below live in <code>tests/home.spec.ts</code>. Run them with
			<code>pnpm playwright test</code> once you have installed the browsers.
		</p>
	</header>

	<article class="code">
		<h2>tests/home.spec.ts</h2>
		<pre><code>{homeTest}</code></pre>
	</article>

	<aside class="pyramid">
		<h2>The test pyramid</h2>
		<p>
			For every one E2E test, you should have five to ten component tests and twenty to fifty
			unit tests. E2E tests are slow and scarce; they prove the assembled app works. Unit
			tests are fast and numerous; they prove the pieces work.
		</p>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 40);
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

	.pyramid {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}

	.pyramid h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}
</style>
