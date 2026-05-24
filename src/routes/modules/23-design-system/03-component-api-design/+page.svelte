<script lang="ts">
	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	interface PropDefinition {
		name: string;
		type: string;
		defaultValue: string;
		required: boolean;
		description: string;
	}

	interface ComponentSpec {
		name: string;
		description: string;
		props: PropDefinition[];
	}

	const buttonSpec: ComponentSpec = {
		name: 'Button',
		description: 'A clickable element that triggers an action or navigates to a destination.',
		props: [
			{ name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", defaultValue: "'primary'", required: false, description: 'Visual style of the button.' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", required: false, description: 'Physical size scale.' },
			{ name: 'disabled', type: 'boolean', defaultValue: 'false', required: false, description: 'Prevents interaction when true.' },
			{ name: 'loading', type: 'boolean', defaultValue: 'false', required: false, description: 'Shows a loading indicator and disables the button.' },
			{ name: 'onclick', type: '(e: MouseEvent) => void', defaultValue: 'undefined', required: false, description: 'Click handler callback.' },
			{ name: 'children', type: 'Snippet', defaultValue: '—', required: true, description: 'Content rendered inside the button.' }
		]
	};

	let previewVariant: Variant = $state('primary');
	let previewSize: Size = $state('md');
	let previewDisabled: boolean = $state(false);
	let previewLoading: boolean = $state(false);
	let clickCount: number = $state(0);

	const variants: Variant[] = ['primary', 'secondary', 'ghost', 'danger'];
	const sizes: Size[] = ['sm', 'md', 'lg'];

	let generatedCode: string = $derived(
		`<Button\n  variant="${previewVariant}"\n  size="${previewSize}"${previewDisabled ? '\n  disabled' : ''}${previewLoading ? '\n  loading' : ''}\n>\n  Click me\n</Button>`
	);
</script>

<svelte:head>
	<title>23.3 — Component API Design · Design System Engineering</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 23.3 · Mini-build</p>
		<h1>Component API Playground</h1>
		<p class="lede">
			Configure a Button component's props and see how a well-designed
			API makes correct usage the easiest path.
		</p>
	</header>

	<div class="playground-layout">
		<div class="controls-panel">
			<h2>Props</h2>

			<fieldset class="control-group">
				<legend>variant</legend>
				<div class="radio-row">
					{#each variants as v (v)}
						<label class="radio-label">
							<input
								type="radio"
								name="variant"
								value={v}
								checked={previewVariant === v}
								onchange={() => { previewVariant = v; }}
							/>
							{v}
						</label>
					{/each}
				</div>
			</fieldset>

			<fieldset class="control-group">
				<legend>size</legend>
				<div class="radio-row">
					{#each sizes as s (s)}
						<label class="radio-label">
							<input
								type="radio"
								name="size"
								value={s}
								checked={previewSize === s}
								onchange={() => { previewSize = s; }}
							/>
							{s}
						</label>
					{/each}
				</div>
			</fieldset>

			<label class="checkbox-label">
				<input type="checkbox" bind:checked={previewDisabled} />
				disabled
			</label>

			<label class="checkbox-label">
				<input type="checkbox" bind:checked={previewLoading} />
				loading
			</label>
		</div>

		<div class="preview-panel">
			<h2>Preview</h2>
			<div class="preview-area">
				<button
					type="button"
					class="demo-btn demo-btn--{previewVariant} demo-btn--{previewSize}"
					disabled={previewDisabled || previewLoading}
					onclick={() => { clickCount += 1; }}
				>
					{#if previewLoading}
						<span class="spinner" aria-hidden="true"></span>
					{/if}
					Click me
				</button>
				<p class="click-info">Clicked {clickCount} {clickCount === 1 ? 'time' : 'times'}</p>
			</div>

			<h3>Generated code</h3>
			<pre class="code-block"><code>{generatedCode}</code></pre>
		</div>
	</div>

	<div class="prop-table-section">
		<h2>{buttonSpec.name} — Prop Table</h2>
		<p class="prop-table-desc">{buttonSpec.description}</p>

		<div class="table-wrap">
			<table class="prop-table">
				<thead>
					<tr>
						<th>Prop</th>
						<th>Type</th>
						<th>Default</th>
						<th>Required</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					{#each buttonSpec.props as prop (prop.name)}
						<tr>
							<td><code>{prop.name}</code></td>
							<td><code class="type-code">{prop.type}</code></td>
							<td><code>{prop.defaultValue}</code></td>
							<td>{prop.required ? 'Yes' : 'No'}</td>
							<td>{prop.description}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
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

	.playground-layout {
		display: grid;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.playground-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.controls-panel,
	.preview-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	.control-group {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-sm) var(--space-md);
		margin-block-end: var(--space-sm);
	}

	.control-group legend {
		font-weight: 600;
		font-size: var(--text-sm);
		padding-inline: var(--space-xs);
	}

	.radio-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.radio-label,
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.checkbox-label {
		margin-block-end: var(--space-xs);
	}

	.preview-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		margin-block-end: var(--space-md);
	}

	.demo-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		font-weight: 600;
		border: 2px solid transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: background var(--dur-fast) var(--ease-out),
		            border-color var(--dur-fast) var(--ease-out),
		            opacity var(--dur-fast) var(--ease-out);
	}

	.demo-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.demo-btn--sm { padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm); }
	.demo-btn--md { padding: var(--space-sm) var(--space-md); font-size: var(--text-base); }
	.demo-btn--lg { padding: var(--space-md) var(--space-lg); font-size: var(--text-lg); }

	.demo-btn--primary {
		background: var(--color-brand);
		color: oklch(100% 0 0);
	}

	.demo-btn--primary:hover:not(:disabled) {
		background: var(--color-brand-hover, var(--color-brand));
		filter: brightness(1.1);
	}

	.demo-btn--secondary {
		background: var(--color-surface-2);
		border-color: var(--color-brand);
		color: var(--color-brand);
	}

	.demo-btn--secondary:hover:not(:disabled) {
		background: var(--color-brand);
		color: oklch(100% 0 0);
	}

	.demo-btn--ghost {
		background: transparent;
		color: var(--color-brand);
	}

	.demo-btn--ghost:hover:not(:disabled) {
		background: var(--color-surface-2);
	}

	.demo-btn--danger {
		background: var(--color-error);
		color: oklch(100% 0 0);
	}

	.demo-btn--danger:hover:not(:disabled) {
		filter: brightness(1.1);
	}

	.spinner {
		display: inline-block;
		inline-size: 1em;
		block-size: 1em;
		border: 2px solid currentColor;
		border-block-start-color: transparent;
		border-radius: var(--radius-full);
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.click-info {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.code-block {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		line-height: 1.6;
		overflow-x: auto;
	}

	.prop-table-section {
		margin-block-start: var(--space-lg);
	}

	.prop-table-desc {
		color: var(--color-text-muted);
		margin-block-end: var(--space-md);
	}

	.table-wrap {
		overflow-x: auto;
	}

	.prop-table {
		inline-size: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.prop-table th,
	.prop-table td {
		padding: var(--space-sm);
		text-align: start;
		border-block-end: 1px solid var(--color-border);
	}

	.prop-table th {
		font-weight: 700;
		background: var(--color-surface-2);
	}

	.type-code {
		font-size: var(--text-xs);
		color: var(--color-brand);
	}

	h2 {
		margin-block-end: var(--space-sm);
	}

	h3 {
		margin-block: var(--space-md) var(--space-sm);
		font-size: var(--text-base);
	}
</style>
