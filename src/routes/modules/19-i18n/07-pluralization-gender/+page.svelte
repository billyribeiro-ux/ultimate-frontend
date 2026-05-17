<script lang="ts">
	let locale: string = $state('en');
	let maxNumber: number = $state(30);
	let pluralType: 'cardinal' | 'ordinal' = $state('cardinal');

	const availableLocales: Array<{ code: string; name: string }> = [
		{ code: 'en', name: 'English' },
		{ code: 'pl', name: 'Polish' },
		{ code: 'ar', name: 'Arabic' },
		{ code: 'ru', name: 'Russian' },
		{ code: 'ja', name: 'Japanese' },
		{ code: 'fr', name: 'French' }
	];

	const categoryColors: Record<string, string> = {
		zero: 'var(--color-error)',
		one: 'var(--color-brand)',
		two: 'var(--color-warning)',
		few: 'var(--color-success)',
		many: 'var(--color-brand-dim)',
		other: 'var(--color-text-muted)'
	};

	interface CategorizedNumber {
		value: number;
		category: string;
	}

	let numbers: number[] = $derived(
		Array.from({ length: maxNumber + 1 }, (_, i) => i)
	);

	let categorized: CategorizedNumber[] = $derived.by(() => {
		const pr = new Intl.PluralRules(locale, { type: pluralType });
		return numbers.map((n) => ({ value: n, category: pr.select(n) }));
	});

	let usedCategories: string[] = $derived(
		[...new Set(categorized.map((c) => c.category))].sort()
	);
</script>

<svelte:head>
	<title>19.7 — Pluralization &amp; Gender · Internationalization</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 19.7 · Mini-build</p>
		<h1>Plural Rule Explorer</h1>
		<p class="lede">
			See how different languages categorize numbers into plural forms.
			Switch locales and watch the categories change.
		</p>
	</header>

	<section class="controls" aria-labelledby="controls-heading">
		<h2 id="controls-heading" class="sr-only">Controls</h2>
		<label class="field">
			<span class="field__label">Locale</span>
			<select class="field__input" bind:value={locale}>
				{#each availableLocales as loc}
					<option value={loc.code}>{loc.name} ({loc.code})</option>
				{/each}
			</select>
		</label>
		<label class="field">
			<span class="field__label">Range (0-N)</span>
			<input
				type="range"
				class="field__range"
				bind:value={maxNumber}
				min={10}
				max={120}
			/>
			<span class="field__value">{maxNumber}</span>
		</label>
		<fieldset class="field">
			<legend class="field__label">Type</legend>
			<div class="radio-group">
				<label>
					<input type="radio" bind:group={pluralType} value="cardinal" />
					Cardinal
				</label>
				<label>
					<input type="radio" bind:group={pluralType} value="ordinal" />
					Ordinal
				</label>
			</div>
		</fieldset>
	</section>

	<section class="legend" aria-label="Category legend">
		<h2 class="legend__title">
			{usedCategories.length} categor{usedCategories.length === 1 ? 'y' : 'ies'} for {locale} ({pluralType})
		</h2>
		<div class="legend__items">
			{#each usedCategories as category}
				<span class="legend__item">
					<span class="legend__dot" style="background: {categoryColors[category] ?? 'var(--color-text-muted)'}"></span>
					{category}
				</span>
			{/each}
		</div>
	</section>

	<section class="number-grid" aria-labelledby="grid-heading">
		<h2 id="grid-heading" class="sr-only">Number categories</h2>
		<div class="grid">
			{#each categorized as item (item.value)}
				<span
					class="number-badge"
					style="border-color: {categoryColors[item.category] ?? 'var(--color-text-muted)'}; color: {categoryColors[item.category] ?? 'var(--color-text-muted)'}"
					title="{item.value}: {item.category}"
				>
					{item.value}
				</span>
			{/each}
		</div>
	</section>

	<section class="explanation" aria-labelledby="how-heading">
		<h2 id="how-heading">Key Points</h2>
		<ol class="steps">
			<li><strong>English:</strong> 2 categories (one, other)</li>
			<li><strong>Polish:</strong> 3 categories (one, few, other) with non-obvious boundaries</li>
			<li><strong>Arabic:</strong> 6 categories (zero, one, two, few, many, other)</li>
			<li><strong>Japanese:</strong> 1 category (other) — no plural distinction</li>
			<li>All rules come from the Unicode CLDR via <code>Intl.PluralRules</code></li>
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

	.controls {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
		align-items: end;
	}

	.field {
		display: grid;
		gap: var(--space-xs);
		min-inline-size: 8rem;
		border: none;
		padding: 0;
	}

	.field__label, .field legend {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.field__input {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font-size: var(--text-sm);
		min-block-size: 44px;
	}

	.field__range {
		inline-size: 100%;
	}

	.field__value {
		font-size: var(--text-xs);
		font-variant-numeric: tabular-nums;
		color: var(--color-text-muted);
		text-align: end;
	}

	.radio-group {
		display: flex;
		gap: var(--space-sm);
		font-size: var(--text-sm);
	}

	.radio-group label {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.legend {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.legend__title {
		font-size: var(--text-sm);
		font-weight: 600;
		margin-block-end: var(--space-sm);
	}

	.legend__items {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.legend__item {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--text-sm);
	}

	.legend__dot {
		inline-size: 0.75rem;
		block-size: 0.75rem;
		border-radius: var(--radius-full);
	}

	.number-grid {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.number-badge {
		display: grid;
		place-items: center;
		min-inline-size: 3rem;
		padding: var(--space-xs);
		border: 2px solid;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
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
