<script lang="ts">
	interface LessonLink {
		slug: string;
		number: string;
		title: string;
	}

	const lessons: LessonLink[] = [
		{ slug: '01-what-i18n-means', number: '19.1', title: 'What i18n means and why it\'s hard' },
		{ slug: '02-message-extraction-icu', number: '19.2', title: 'Message extraction and ICU MessageFormat' },
		{ slug: '03-paraglide-sveltekit', number: '19.3', title: 'Paraglide.js with SvelteKit' },
		{ slug: '04-locale-routing', number: '19.4', title: 'Locale routing strategies' },
		{ slug: '05-formatting-dates-numbers', number: '19.5', title: 'Formatting dates, numbers, and currencies' },
		{ slug: '06-rtl-bidirectional', number: '19.6', title: 'RTL and bidirectional text' },
		{ slug: '07-pluralization-gender', number: '19.7', title: 'Pluralization and gender' },
		{ slug: '08-i18n-seo-performance', number: '19.8', title: 'i18n SEO and performance' }
	];
</script>

<svelte:head>
	<title>Module 19 · Internationalization (i18n)</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 19</p>
		<h1>Internationalization (i18n)</h1>
		<p class="lede">
			Build production-ready multi-language applications with locale-aware
			formatting, RTL layout, ICU pluralization, and SEO hreflang.
		</p>
	</header>

	<nav aria-label="Module 19 lessons">
		<ol class="lesson-list">
			{#each lessons as lesson (lesson.slug)}
				<li>
					<a href="/modules/19-i18n/{lesson.slug}" class="lesson-link">
						<span class="lesson-link__number">{lesson.number}</span>
						<span class="lesson-link__title">{lesson.title}</span>
					</a>
				</li>
			{/each}
		</ol>
	</nav>
</section>

<style>
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 50ch;
	}

	.lesson-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.lesson-link {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text);
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.lesson-link:hover {
		border-color: var(--color-brand);
	}

	.lesson-link__number {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-brand);
		letter-spacing: 0.08em;
		min-inline-size: 3rem;
	}

	.lesson-link__title {
		font-size: var(--text-base);
		font-weight: 500;
	}
</style>
