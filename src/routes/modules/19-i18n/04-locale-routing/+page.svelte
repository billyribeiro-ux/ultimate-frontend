<script lang="ts">
	let currentLocale: string = $state('en');
	let currentPage: string = $state('home');

	const locales: Array<{ code: string; name: string; dir: 'ltr' | 'rtl' }> = [
		{ code: 'en', name: 'English', dir: 'ltr' },
		{ code: 'pt-BR', name: 'Portugues', dir: 'ltr' },
		{ code: 'ar', name: 'العربية', dir: 'rtl' }
	];

	const pages: string[] = ['home', 'pricing', 'blog'];

	const translations: Record<string, Record<string, { title: string; description: string }>> = {
		en: {
			home: { title: 'Welcome', description: 'Build something amazing with SvelteKit.' },
			pricing: { title: 'Choose your plan', description: 'Simple, transparent pricing for every team size.' },
			blog: { title: 'Latest posts', description: 'Insights, tutorials, and updates from our team.' }
		},
		'pt-BR': {
			home: { title: 'Bem-vindo', description: 'Construa algo incrivel com SvelteKit.' },
			pricing: { title: 'Escolha seu plano', description: 'Precos simples e transparentes para todos os tamanhos de equipe.' },
			blog: { title: 'Ultimos artigos', description: 'Insights, tutoriais e atualizacoes da nossa equipe.' }
		},
		ar: {
			home: { title: 'مرحبا', description: 'ابنِ شيئا مذهلا مع SvelteKit.' },
			pricing: { title: 'اختر خطتك', description: 'أسعار بسيطة وشفافة لكل حجم فريق.' },
			blog: { title: 'آخر المقالات', description: 'رؤى ودروس وتحديثات من فريقنا.' }
		}
	};

	let simulatedUrl: string = $derived(`/${currentLocale}/${currentPage}`);
	let direction: 'ltr' | 'rtl' = $derived(
		locales.find((l) => l.code === currentLocale)?.dir ?? 'ltr'
	);
	let content = $derived(translations[currentLocale]?.[currentPage]);
</script>

<svelte:head>
	<title>19.4 — Locale Routing · Internationalization</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 19.4 · Mini-build</p>
		<h1>Locale Routing Simulator</h1>
		<p class="lede">
			See how URL-prefix locale routing works: change the locale and the
			URL, content, and text direction all update together.
		</p>
	</header>

	<section class="url-bar" aria-label="Simulated URL">
		<span class="url-bar__protocol">https://example.com</span>
		<span class="url-bar__locale">/{currentLocale}</span>
		<span class="url-bar__path">/{currentPage}</span>
	</section>

	<div class="controls">
		<section class="control-group" aria-labelledby="locale-heading">
			<h2 id="locale-heading" class="control-group__title">Locale</h2>
			<div class="control-buttons">
				{#each locales as locale (locale.code)}
					<button
						class="locale-btn"
						class:locale-btn--active={currentLocale === locale.code}
						onclick={() => currentLocale = locale.code}
					>
						{locale.code}
						<span class="locale-btn__name">{locale.name}</span>
					</button>
				{/each}
			</div>
		</section>

		<section class="control-group" aria-labelledby="page-heading">
			<h2 id="page-heading" class="control-group__title">Page</h2>
			<div class="control-buttons">
				{#each pages as page (page)}
					<button
						class="page-btn"
						class:page-btn--active={currentPage === page}
						onclick={() => currentPage = page}
					>
						{page}
					</button>
				{/each}
			</div>
		</section>
	</div>

	<section class="preview" aria-labelledby="preview-heading" dir={direction}>
		<h2 id="preview-heading" class="sr-only">Page Preview</h2>
		<div class="preview__badge">
			dir="{direction}" · lang="{currentLocale}"
		</div>
		{#if content}
			<h3 class="preview__title">{content.title}</h3>
			<p class="preview__description">{content.description}</p>
		{/if}
	</section>

	<section class="explanation" aria-labelledby="how-heading">
		<h2 id="how-heading">How It Works</h2>
		<ol class="steps">
			<li>The <code>[locale]</code> dynamic route captures the first URL segment</li>
			<li>The layout <code>load()</code> validates the locale against available languages</li>
			<li>Paraglide sets the active language based on the URL prefix</li>
			<li>The locale switcher replaces the first path segment and navigates</li>
			<li>A cookie stores the preference for return visits</li>
		</ol>
	</section>
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

	.url-bar {
		display: flex;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
		overflow-x: auto;
	}

	.url-bar__protocol {
		color: var(--color-text-muted);
	}

	.url-bar__locale {
		color: var(--color-brand);
		font-weight: 700;
	}

	.url-bar__path {
		color: var(--color-text);
	}

	.controls {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 480px) {
		.controls {
			grid-template-columns: 1fr 1fr;
		}
	}

	.control-group__title {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-block-end: var(--space-sm);
	}

	.control-buttons {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.locale-btn, .page-btn {
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		transition: all var(--dur-fast) var(--ease-out);
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.locale-btn:hover, .page-btn:hover {
		border-color: var(--color-brand);
	}

	.locale-btn--active, .page-btn--active {
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-color: var(--color-brand);
	}

	.locale-btn__name {
		font-size: var(--text-xs);
		opacity: 0.8;
	}

	.preview {
		padding: var(--space-xl);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
	}

	.preview__badge {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		margin-block-end: var(--space-md);
	}

	.preview__title {
		font-size: var(--text-xl);
		margin-block-end: var(--space-sm);
	}

	.preview__description {
		color: var(--color-text-muted);
	}

	.explanation {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.steps {
		padding-inline-start: var(--space-md);
		display: grid;
		gap: var(--space-sm);
		font-size: var(--text-sm);
	}

	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
