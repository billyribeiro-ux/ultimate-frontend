<script lang="ts">
	interface AuditItem {
		id: string;
		text: string;
		location: string;
		extracted: boolean;
		key: string | null;
	}

	let items: AuditItem[] = $state([
		{ id: '1', text: 'Welcome to our platform', location: 'hero heading', extracted: false, key: null },
		{ id: '2', text: 'Get started for free', location: 'hero button', extracted: false, key: null },
		{ id: '3', text: 'Pricing', location: 'nav link', extracted: false, key: null },
		{ id: '4', text: 'Loading...', location: 'spinner text', extracted: false, key: null },
		{ id: '5', text: 'No results found', location: 'search empty state', extracted: false, key: null },
		{ id: '6', text: 'Submit', location: 'form button', extracted: false, key: null },
		{ id: '7', text: 'Are you sure?', location: 'confirm dialog', extracted: false, key: null },
		{ id: '8', text: 'items in your cart', location: 'cart badge', extracted: false, key: null }
	]);

	let newText: string = $state('');
	let newLocation: string = $state('');

	function generateKey(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, '_')
			.replace(/^_|_$/g, '');
	}

	function extractItem(id: string): void {
		items = items.map((item) =>
			item.id === id
				? { ...item, extracted: true, key: generateKey(item.text) }
				: item
		);
	}

	function addItem(): void {
		if (!newText.trim()) return;
		const id: string = String(Date.now());
		items = [...items, {
			id,
			text: newText.trim(),
			location: newLocation.trim() || 'unknown',
			extracted: false,
			key: null
		}];
		newText = '';
		newLocation = '';
	}

	let extractedCount: number = $derived(items.filter((i) => i.extracted).length);
	let totalCount: number = $derived(items.length);
	let progress: number = $derived(totalCount > 0 ? extractedCount / totalCount : 0);
</script>

<svelte:head>
	<title>19.1 — What i18n Means · Internationalization</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 19.1 · Mini-build</p>
		<h1>i18n String Extraction Audit</h1>
		<p class="lede">
			Find every hardcoded string in your application and extract it
			into a translatable message key.
		</p>
	</header>

	<section class="progress-section" aria-label="Extraction progress">
		<div class="progress-header">
			<span class="progress-label">Extraction progress</span>
			<span class="progress-value">{extractedCount}/{totalCount}</span>
		</div>
		<div class="progress-track">
			<div
				class="progress-fill"
				style="inline-size: {progress * 100}%"
				role="progressbar"
				aria-valuenow={extractedCount}
				aria-valuemin={0}
				aria-valuemax={totalCount}
			></div>
		</div>
	</section>

	<section class="audit-list" aria-labelledby="strings-heading">
		<h2 id="strings-heading">Detected Strings</h2>
		<ul class="item-list">
			{#each items as item (item.id)}
				<li class="item" class:item--extracted={item.extracted}>
					<div class="item__content">
						<span class="item__text">{item.text}</span>
						<span class="item__location">{item.location}</span>
					</div>
					{#if item.extracted}
						<code class="item__key">{item.key}</code>
					{:else}
						<button class="btn btn--extract" onclick={() => extractItem(item.id)}>
							Extract
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	<section class="add-section" aria-labelledby="add-heading">
		<h2 id="add-heading">Add String</h2>
		<form class="add-form" onsubmit={(e) => { e.preventDefault(); addItem(); }}>
			<label class="field">
				<span class="field__label">Text</span>
				<input
					type="text"
					class="field__input"
					bind:value={newText}
					placeholder="e.g., Cancel"
				/>
			</label>
			<label class="field">
				<span class="field__label">Location</span>
				<input
					type="text"
					class="field__input"
					bind:value={newLocation}
					placeholder="e.g., modal footer"
				/>
			</label>
			<button type="submit" class="btn btn--primary">Add</button>
		</form>
	</section>

	{#if extractedCount > 0}
		<section class="output-section" aria-labelledby="output-heading">
			<h2 id="output-heading">Generated Message File</h2>
			<pre class="output-code"><code>{JSON.stringify(
	Object.fromEntries(
		items
			.filter(i => i.extracted && i.key)
			.map(i => [i.key, i.text])
	),
	null,
	2
)}</code></pre>
		</section>
	{/if}
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

	.progress-section {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		margin-block-end: var(--space-xs);
	}

	.progress-label {
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.progress-value {
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
		color: var(--color-text-muted);
	}

	.progress-track {
		block-size: 0.5rem;
		background: var(--color-surface);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.progress-fill {
		block-size: 100%;
		background: var(--color-brand);
		border-radius: var(--radius-full);
		transition: inline-size var(--dur-base) var(--ease-out);
	}

	.audit-list {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.item-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
		margin-block-start: var(--space-md);
	}

	.item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-inline-start: 3px solid var(--color-warning);
		border-radius: var(--radius-md);
	}

	.item--extracted {
		border-inline-start-color: var(--color-success);
		opacity: 0.8;
	}

	.item__content {
		display: grid;
		gap: 0.15rem;
	}

	.item__text {
		font-weight: 600;
		font-size: var(--text-sm);
	}

	.item__location {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.item__key {
		font-size: var(--text-xs);
		color: var(--color-success);
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		white-space: nowrap;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.btn:hover {
		border-color: var(--color-brand);
	}

	.btn--extract {
		font-size: var(--text-xs);
		padding: var(--space-xs) var(--space-sm);
		min-block-size: auto;
	}

	.btn--primary {
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-color: var(--color-brand);
	}

	.btn--primary:hover {
		background: var(--color-brand-dim);
	}

	.add-section {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.add-form {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
		align-items: end;
		margin-block-start: var(--space-md);
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

	.output-section {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.output-code {
		background: var(--color-surface);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		overflow-x: auto;
		font-size: var(--text-sm);
		margin-block-start: var(--space-md);
	}
</style>
