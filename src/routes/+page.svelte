<script lang="ts">
	interface ModuleSummary {
		id: string;
		number: string;
		title: string;
		href: string;
		goal: string;
	}

	const modules: ModuleSummary[] = [
		{ id: '01', number: '1', title: 'The Foundation', href: '/modules/01-foundation', goal: 'First typed, styled, mobile-first Svelte component.' },
		{ id: '02', number: '2', title: 'Reactivity', href: '/modules/02-reactivity', goal: 'Master every rune: $state, $derived, $effect.' },
		{ id: '03', number: '3', title: 'Components & Props', href: '/modules/03-components', goal: 'Reusable, typed components with snippets.' },
		{ id: '04', number: '4', title: 'Control Flow', href: '/modules/04-control-flow', goal: 'Conditionals, loops, async UI with {#await}.' },
		{ id: '05', number: '5', title: 'Events & Interaction', href: '/modules/05-events', goal: 'Typed events, closures, debouncing, touch.' },
		{ id: '06', number: '6', title: 'Styling Mastery', href: '/modules/06-styling', goal: 'PE7 in depth + every Svelte animation API.' },
		{ id: '07', number: '7', title: 'GSAP & Threlte', href: '/modules/07-gsap', goal: 'Timelines, ScrollTrigger, and 3D with Threlte.' },
		{ id: '08', number: '8', title: 'Routing & Layouts', href: '/modules/08-routing', goal: 'SSR, hydration, nested layouts, hooks.' },
		{ id: '09a', number: '9A', title: 'Data Loading (load)', href: '/modules/09a-load', goal: 'Traditional load() with full type safety.' },
		{ id: '09b', number: '9B', title: 'Remote Functions', href: '/modules/09b-remote', goal: 'query, form, command, query.batch — April 2026.' },
		{ id: '10', number: '10', title: 'API Routes & Forms', href: '/modules/10-api-forms', goal: '+server.ts, form actions, progressive enhancement.' },
		{ id: '11', number: '11', title: 'State at Scale', href: '/modules/11-state', goal: 'Context, .svelte.ts stores, TanStack Table.' },
		{ id: '12', number: '12', title: 'Performance & Production', href: '/modules/12-performance', goal: 'Core Web Vitals, tests, 3D performance, deploy.' },
		{ id: '13', number: '13', title: 'SEO', href: '/modules/13-seo', goal: 'Structured data, E-E-A-T, 3D-aware SEO.' },
		{ id: '14', number: '14', title: '3D with Threlte', href: '/modules/14-threlte', goal: 'Declarative 3D: scenes, models, physics, production.' },
		{ id: '18', number: '18', title: 'Advanced Patterns', href: '/modules/18-advanced', goal: 'Compound, polymorphic, headless components, monorepos.' },
		{ id: '19', number: '19', title: 'Internationalization', href: '/modules/19-i18n', goal: 'i18n, ICU messages, Paraglide, RTL, locale routing.' },
		{ id: '20', number: '20', title: 'Testing Deep Dive', href: '/modules/20-testing', goal: 'Vitest, component tests, Playwright, CI/CD pipelines.' }
	];
</script>

<svelte:head>
	<title>Ultimate Frontend · Svelte 5 + SvelteKit 2 Course</title>
	<meta
		name="description"
		content="University-level Svelte 5 and SvelteKit 2 course using April 2026 syntax: runes, remote functions, PE7 CSS, GSAP, Threlte, full SEO."
	/>
</svelte:head>

<section class="page stack">
	<header class="hero">
		<p class="hero__eyebrow">Svelte 5 · SvelteKit 2 · April 2026 syntax</p>
		<h1 class="hero__title">Ultimate Frontend</h1>
		<p class="hero__lede">
			A complete university-level course that takes you from zero JavaScript to shipping
			production-grade SvelteKit applications. Every lesson follows the same atomic pattern:
			<em>concept</em>, <em>style it with PE7</em>, <em>interact</em>, <em>mini-build</em>.
		</p>
	</header>

	<section aria-labelledby="modules-heading">
		<h2 id="modules-heading">Modules</h2>
		<ul class="modules">
			{#each modules as m (m.id)}
				<li class="module-card">
					<a href={m.href} class="module-card__link">
						<span class="module-card__number">M{m.number}</span>
						<span class="module-card__title">{m.title}</span>
						<span class="module-card__goal">{m.goal}</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>
</section>

<style>
	.hero {
		padding-block: var(--space-xl);
	}

	.hero__eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-block-end: var(--space-sm);
	}

	.hero__title {
		font-size: var(--text-hero);
		line-height: 1;
		letter-spacing: -0.03em;
		color: var(--color-text);
	}

	.hero__lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		margin-block-start: var(--space-md);
		max-inline-size: 50ch;
	}

	.modules {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-md);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
	}

	.module-card {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition:
			transform var(--dur-base) var(--ease-expressive),
			border-color var(--dur-base) var(--ease-out);

		&:hover {
			transform: translateY(-2px);
			border-color: var(--color-brand);
		}
	}

	.module-card__link {
		display: grid;
		gap: var(--space-xs);
		padding: var(--space-md);
		text-decoration: none;
		color: inherit;
		min-block-size: 44px;
	}

	.module-card__number {
		font-size: var(--text-xs);
		color: var(--color-brand);
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.module-card__title {
		font-size: var(--text-lg);
		font-weight: 600;
	}

	.module-card__goal {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
