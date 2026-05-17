<script lang="ts">
	let value: number = $state(1234567.89);
	let dateValue: string = $state('2026-05-17');
	let currencyCode: string = $state('USD');

	const locales: string[] = ['en', 'pt-BR', 'ar', 'de', 'ja'];

	const currencies: string[] = ['USD', 'BRL', 'EUR', 'JPY', 'SAR'];

	interface FormatRow {
		locale: string;
		decimal: string;
		currency: string;
		percent: string;
		dateLong: string;
		relative: string;
	}

	let date: Date = $derived(new Date(dateValue + 'T12:00:00Z'));

	let rows: FormatRow[] = $derived(
		locales.map((locale) => ({
			locale,
			decimal: new Intl.NumberFormat(locale).format(value),
			currency: new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(value),
			percent: new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(value / 10000000),
			dateLong: new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(date),
			relative: new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-3, 'day')
		}))
	);
</script>

<svelte:head>
	<title>19.5 — Formatting Dates &amp; Numbers · Internationalization</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 19.5 · Mini-build</p>
		<h1>Multi-locale Formatting</h1>
		<p class="lede">
			The same value looks different in every locale. Adjust the inputs
			and see how dates, numbers, and currencies adapt.
		</p>
	</header>

	<section class="controls" aria-labelledby="controls-heading">
		<h2 id="controls-heading" class="sr-only">Controls</h2>
		<label class="field">
			<span class="field__label">Number value</span>
			<input
				type="number"
				class="field__input"
				bind:value={value}
				step="0.01"
			/>
		</label>
		<label class="field">
			<span class="field__label">Date</span>
			<input
				type="date"
				class="field__input"
				bind:value={dateValue}
			/>
		</label>
		<label class="field">
			<span class="field__label">Currency</span>
			<select class="field__input" bind:value={currencyCode}>
				{#each currencies as cur}
					<option value={cur}>{cur}</option>
				{/each}
			</select>
		</label>
	</section>

	<section class="table-container" aria-labelledby="table-heading">
		<h2 id="table-heading">Formatting Comparison</h2>
		<div class="table-scroll">
			<table class="format-table">
				<thead>
					<tr>
						<th>Locale</th>
						<th>Decimal</th>
						<th>Currency</th>
						<th>Percent</th>
						<th>Date (long)</th>
						<th>Relative</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row (row.locale)}
						<tr>
							<td class="locale-cell">{row.locale}</td>
							<td class="number-cell">{row.decimal}</td>
							<td class="number-cell">{row.currency}</td>
							<td class="number-cell">{row.percent}</td>
							<td>{row.dateLong}</td>
							<td>{row.relative}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section class="explanation" aria-labelledby="api-heading">
		<h2 id="api-heading">Intl APIs Used</h2>
		<ol class="steps">
			<li><code>Intl.NumberFormat</code> — decimal separators, grouping, currency symbols</li>
			<li><code>Intl.DateTimeFormat</code> — locale-aware date rendering with <code>dateStyle</code></li>
			<li><code>Intl.RelativeTimeFormat</code> — "3 days ago" / "yesterday" in any language</li>
			<li>All zero-bundle-cost: built into every modern browser</li>
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
	}

	.field {
		display: grid;
		gap: var(--space-xs);
		flex: 1;
		min-inline-size: 10rem;
	}

	.field__label {
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

	.table-container {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.table-scroll {
		overflow-x: auto;
		margin-block-start: var(--space-md);
	}

	.format-table {
		inline-size: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.format-table th {
		text-align: start;
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: var(--space-xs) var(--space-sm);
		border-block-end: 2px solid var(--color-border);
		white-space: nowrap;
	}

	.format-table td {
		padding: var(--space-xs) var(--space-sm);
		border-block-end: 1px solid var(--color-border);
		white-space: nowrap;
	}

	.locale-cell {
		font-weight: 700;
		color: var(--color-brand);
	}

	.number-cell {
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
