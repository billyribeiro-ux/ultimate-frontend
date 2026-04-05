<!--
	Lesson 1.1 — What Svelte is and why it compiles
	Mini-build: a styled "Hello World" using typed constants, OKLCH tokens,
	scoped styles, and zero interactivity. The purpose is to prove three things:
	  1. Svelte components have three blocks: <script lang="ts">, markup, <style>.
	  2. TypeScript runs in the script block with strict mode on day one.
	  3. PE7 tokens flow into scoped styles without any :global() escape hatches.

	Open DevTools → Elements. You will see the compiled output: every class
	in this file has a hash suffix added by Svelte so it cannot collide with
	any other component's styles. That is scoped CSS without a pre-processor,
	without BEM, without a runtime.
-->
<script lang="ts">
	// TypeScript constants. We annotate them explicitly here so the student can
	// SEE the types even though TS would infer them from the literals.
	// Module 1 teaches: string, number, boolean.
	const courseName: string = 'Ultimate Frontend';
	const lessonNumber: number = 1;
	const isUniversityLevel: boolean = true;
</script>

<svelte:head>
	<title>Lesson 1.1 · What Svelte is · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 1.1 mini-build: a typed, OKLCH-styled Hello World component demonstrating Svelte's compile-time model."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/01-foundation">← Module 1</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 1.1 · Mini-build</p>
		<h1>Hello from a compiled component</h1>
	</header>

	<article class="greeting-card">
		<p class="greeting-card__label">Course</p>
		<p class="greeting-card__value">{courseName}</p>

		<p class="greeting-card__label">Lesson number</p>
		<p class="greeting-card__value">{lessonNumber}</p>

		<p class="greeting-card__label">University level?</p>
		<p class="greeting-card__value">{isUniversityLevel ? 'Yes' : 'No'}</p>
	</article>

	<aside class="explain">
		<h2>What is happening here?</h2>
		<p>
			This page is a <code>.svelte</code> file. When you save it, Svelte's compiler turns it
			into a tiny JavaScript module and a tiny CSS file. The browser never downloads a
			framework runtime — it downloads your component directly.
		</p>
		<p>
			Open your browser's DevTools and look at the <code>&lt;p&gt;</code> elements above.
			Every class name has a hash appended to it (something like
			<code>greeting-card__label svelte-abc123</code>). That hash is how Svelte guarantees
			your styles never leak out of this file and never collide with another component.
		</p>
		<p>
			Read the full lesson here:
			<a href="/lessons/module-01-foundation/lesson-1.1-what-is-svelte">
				lesson-1.1-what-is-svelte.md
			</a>
		</p>
	</aside>
</section>

<style>
	/*
	 * Per-page color personality — demonstrating Lesson 6.9 technique at a
	 * beginner level. We override a single token and every descendant picks it
	 * up through normal cascade. No :global() needed.
	 */
	section {
		--color-brand: oklch(68% 0.2 200);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;

			&:hover {
				color: var(--color-brand);
			}
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	h1 {
		font-size: var(--text-2xl);
		margin-block-start: var(--space-xs);
	}

	.greeting-card {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xs) var(--space-md);
		padding: var(--space-lg);
		background: linear-gradient(
			135deg,
			var(--color-surface-2),
			oklch(from var(--color-brand) 95% 0.04 h)
		);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);

		/* Mobile-first: stack label + value. Desktop: two columns. */
		@media (min-width: 480px) {
			grid-template-columns: 10rem 1fr;
			align-items: baseline;
		}
	}

	.greeting-card__label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.greeting-card__value {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.explain {
		padding: var(--space-md);
		border-inline-start: 3px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);

		& h2 {
			font-size: var(--text-lg);
			margin-block-end: var(--space-sm);
		}

		& p + p {
			margin-block-start: var(--space-sm);
		}
	}
</style>
