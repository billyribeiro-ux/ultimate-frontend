<script lang="ts">
	type TabId = 'preview' | 'code' | 'props' | 'guidelines';

	interface DocTab {
		id: TabId;
		label: string;
	}

	interface PropDoc {
		name: string;
		type: string;
		defaultValue: string;
		required: boolean;
		description: string;
	}

	interface ComponentDoc {
		name: string;
		description: string;
		usage: string;
		doList: string[];
		dontList: string[];
		props: PropDoc[];
	}

	const tabs: DocTab[] = [
		{ id: 'preview', label: 'Preview' },
		{ id: 'code', label: 'Code' },
		{ id: 'props', label: 'Props' },
		{ id: 'guidelines', label: 'Guidelines' }
	];

	const components: ComponentDoc[] = [
		{
			name: 'Button',
			description: 'A clickable element that triggers an action or navigates to a destination. Supports multiple variants and sizes with built-in loading and disabled states.',
			usage: `<Button variant="primary" size="md" onclick={handleClick}>\n  Save changes\n</Button>`,
			doList: [
				'Use a verb or verb phrase as the label: "Save", "Delete account"',
				'Use primary variant for the single most important action',
				'Provide an accessible label when using icon-only buttons',
				'Show a loading state during async operations'
			],
			dontList: [
				'Use more than one primary button per section',
				'Use a button when a link is more appropriate (navigation)',
				'Disable without explaining why via a tooltip',
				'Put long sentences inside a button'
			],
			props: [
				{ name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", defaultValue: "'primary'", required: false, description: 'Visual style of the button.' },
				{ name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", required: false, description: 'Physical size scale.' },
				{ name: 'disabled', type: 'boolean', defaultValue: 'false', required: false, description: 'Prevents interaction.' },
				{ name: 'loading', type: 'boolean', defaultValue: 'false', required: false, description: 'Shows spinner and disables.' },
				{ name: 'onclick', type: '(e: MouseEvent) => void', defaultValue: 'undefined', required: false, description: 'Click handler.' },
				{ name: 'children', type: 'Snippet', defaultValue: '—', required: true, description: 'Button content.' }
			]
		},
		{
			name: 'Input',
			description: 'A text input field with optional label, helper text, and error messaging. Integrates with form validation via data attributes.',
			usage: `<Input\n  label="Email"\n  type="email"\n  placeholder="you@example.com"\n  error={errors.email}\n/>`,
			doList: [
				'Always provide a visible label or aria-label',
				'Show inline validation errors below the field',
				'Use placeholder text as a hint, not a replacement for the label',
				'Group related inputs in a fieldset with a legend'
			],
			dontList: [
				'Use placeholder as the only label',
				'Validate on every keystroke — wait for blur',
				'Change the input height to differ from other form controls',
				'Use red color as the only error indicator'
			],
			props: [
				{ name: 'label', type: 'string', defaultValue: "''", required: true, description: 'Visible label text.' },
				{ name: 'type', type: "'text' | 'email' | 'password' | 'search' | 'url'", defaultValue: "'text'", required: false, description: 'HTML input type.' },
				{ name: 'placeholder', type: 'string', defaultValue: "''", required: false, description: 'Placeholder hint.' },
				{ name: 'error', type: 'string | undefined', defaultValue: 'undefined', required: false, description: 'Error message to display.' },
				{ name: 'disabled', type: 'boolean', defaultValue: 'false', required: false, description: 'Prevents interaction.' },
				{ name: 'value', type: 'string', defaultValue: "''", required: false, description: 'Current input value (bindable).' }
			]
		},
		{
			name: 'Card',
			description: 'A surface container that groups related content. Supports elevated, outlined, and flat visual treatments.',
			usage: `<Card variant="elevated">\n  <h3>Card title</h3>\n  <p>Card content goes here.</p>\n</Card>`,
			doList: [
				'Use elevation to indicate interactivity or importance',
				'Keep content concise — cards are scannable units',
				'Maintain consistent padding across card variants',
				'Use semantic headings inside cards'
			],
			dontList: [
				'Nest cards inside other cards',
				'Mix different card variants in the same grid',
				'Use cards for long-form content — use sections instead',
				'Apply shadows to flat-variant cards'
			],
			props: [
				{ name: 'variant', type: "'elevated' | 'outlined' | 'flat'", defaultValue: "'elevated'", required: false, description: 'Visual treatment.' },
				{ name: 'padding', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", required: false, description: 'Internal spacing.' },
				{ name: 'children', type: 'Snippet', defaultValue: '—', required: true, description: 'Card content.' }
			]
		}
	];

	let selectedComponentIdx: number = $state(0);
	let activeTabId: TabId = $state('preview');

	let selectedComponent: ComponentDoc = $derived(components[selectedComponentIdx]);
</script>

<svelte:head>
	<title>23.4 — Documentation with Svelte · Design System Engineering</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 23.4 · Mini-build</p>
		<h1>Living Documentation</h1>
		<p class="lede">
			Browse a component documentation site that renders live previews,
			prop tables, and usage guidelines — all from a single data source.
		</p>
	</header>

	<nav class="component-nav" aria-label="Component navigation">
		{#each components as comp, idx (comp.name)}
			<button
				type="button"
				class="nav-btn"
				class:nav-btn--active={idx === selectedComponentIdx}
				onclick={() => { selectedComponentIdx = idx; activeTabId = 'preview'; }}
			>
				{comp.name}
			</button>
		{/each}
	</nav>

	<div class="doc-panel">
		<div class="tab-bar" role="tablist">
			{#each tabs as tab (tab.id)}
				<button
					type="button"
					role="tab"
					class="tab"
					class:tab--active={tab.id === activeTabId}
					aria-selected={tab.id === activeTabId}
					onclick={() => { activeTabId = tab.id; }}
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<div class="tab-content" role="tabpanel" aria-live="polite">
			{#if activeTabId === 'preview'}
				<div class="preview-section">
					<h2>{selectedComponent.name}</h2>
					<p class="comp-desc">{selectedComponent.description}</p>

					<div class="live-preview">
						{#if selectedComponent.name === 'Button'}
							<button type="button" class="demo-btn demo-btn--primary demo-btn--md">Primary</button>
							<button type="button" class="demo-btn demo-btn--secondary demo-btn--md">Secondary</button>
							<button type="button" class="demo-btn demo-btn--ghost demo-btn--md">Ghost</button>
							<button type="button" class="demo-btn demo-btn--danger demo-btn--md">Danger</button>
						{:else if selectedComponent.name === 'Input'}
							<div class="demo-input-group">
								<label class="demo-label">
									Email
									<input type="email" class="demo-input" placeholder="you@example.com" />
								</label>
								<label class="demo-label">
									Password
									<input type="password" class="demo-input demo-input--error" value="short" />
									<span class="demo-error">Must be at least 8 characters</span>
								</label>
							</div>
						{:else if selectedComponent.name === 'Card'}
							<div class="demo-cards">
								<div class="demo-card demo-card--elevated">
									<h3>Elevated</h3>
									<p>Shadow conveys depth</p>
								</div>
								<div class="demo-card demo-card--outlined">
									<h3>Outlined</h3>
									<p>Border conveys boundary</p>
								</div>
								<div class="demo-card demo-card--flat">
									<h3>Flat</h3>
									<p>Background only</p>
								</div>
							</div>
						{/if}
					</div>
				</div>

			{:else if activeTabId === 'code'}
				<div class="code-section">
					<h2>Usage</h2>
					<pre class="code-block"><code>{selectedComponent.usage}</code></pre>
				</div>

			{:else if activeTabId === 'props'}
				<div class="props-section">
					<h2>Props</h2>
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
								{#each selectedComponent.props as prop (prop.name)}
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

			{:else if activeTabId === 'guidelines'}
				<div class="guidelines-section">
					<h2>Usage Guidelines</h2>
					<div class="guideline-columns">
						<div class="guideline-col guideline-col--do">
							<h3>Do</h3>
							<ul>
								{#each selectedComponent.doList as item (item)}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
						<div class="guideline-col guideline-col--dont">
							<h3>Don't</h3>
							<ul>
								{#each selectedComponent.dontList as item (item)}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
			{/if}
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

	.component-nav {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.nav-btn {
		padding: var(--space-xs) var(--space-md);
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-full);
		font-weight: 600;
		font-size: var(--text-sm);
		color: var(--color-text);
		min-block-size: 36px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.nav-btn:hover {
		border-color: var(--color-brand);
	}

	.nav-btn--active {
		background: var(--color-brand);
		border-color: var(--color-brand);
		color: oklch(100% 0 0);
	}

	.doc-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.tab-bar {
		display: flex;
		border-block-end: 1px solid var(--color-border);
		background: var(--color-surface-2);
	}

	.tab {
		padding: var(--space-sm) var(--space-md);
		background: transparent;
		border: none;
		border-block-end: 2px solid transparent;
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text-muted);
		min-block-size: 44px;
		transition: color var(--dur-fast) var(--ease-out),
		            border-color var(--dur-fast) var(--ease-out);
	}

	.tab:hover {
		color: var(--color-text);
	}

	.tab--active {
		color: var(--color-brand);
		border-block-end-color: var(--color-brand);
	}

	.tab-content {
		padding: var(--space-lg);
	}

	.comp-desc {
		color: var(--color-text-muted);
		margin-block-end: var(--space-md);
	}

	.live-preview {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
		align-items: center;
		justify-content: center;
	}

	.demo-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		font-weight: 600;
		border: 2px solid transparent;
		border-radius: var(--radius-md);
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-base);
		min-block-size: 44px;
		transition: filter var(--dur-fast) var(--ease-out);
	}

	.demo-btn--primary {
		background: var(--color-brand);
		color: oklch(100% 0 0);
	}

	.demo-btn--secondary {
		background: var(--color-surface);
		border-color: var(--color-brand);
		color: var(--color-brand);
	}

	.demo-btn--ghost {
		background: transparent;
		color: var(--color-brand);
	}

	.demo-btn--danger {
		background: var(--color-error);
		color: oklch(100% 0 0);
	}

	.demo-btn:hover {
		filter: brightness(1.1);
	}

	.demo-input-group {
		display: grid;
		gap: var(--space-md);
		inline-size: 100%;
		max-inline-size: 20rem;
	}

	.demo-label {
		display: grid;
		gap: var(--space-xs);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.demo-input {
		padding: var(--space-sm);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		color: var(--color-text);
	}

	.demo-input--error {
		border-color: var(--color-error);
	}

	.demo-error {
		font-size: var(--text-xs);
		color: var(--color-error);
	}

	.demo-cards {
		display: grid;
		gap: var(--space-md);
		inline-size: 100%;
	}

	@media (min-width: 768px) {
		.demo-cards {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}

	.demo-card {
		padding: var(--space-md);
		border-radius: var(--radius-md);
	}

	.demo-card--elevated {
		background: var(--color-surface);
		box-shadow: var(--shadow-md);
	}

	.demo-card--outlined {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
	}

	.demo-card--flat {
		background: var(--color-surface-2);
	}

	.demo-card h3 {
		font-size: var(--text-base);
		margin-block-end: var(--space-xs);
	}

	.demo-card p {
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

	.guideline-columns {
		display: grid;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.guideline-columns {
			grid-template-columns: 1fr 1fr;
		}
	}

	.guideline-col h3 {
		font-size: var(--text-base);
		margin-block-end: var(--space-sm);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.guideline-col--do h3 {
		background: oklch(85% 0.1 145);
		color: oklch(25% 0.08 145);
	}

	.guideline-col--dont h3 {
		background: oklch(85% 0.1 25);
		color: oklch(25% 0.08 25);
	}

	.guideline-col ul {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.guideline-col li {
		padding: var(--space-xs) var(--space-sm);
		font-size: var(--text-sm);
		background: var(--color-surface-2);
		border-radius: var(--radius-sm);
	}

	h2 {
		margin-block-end: var(--space-sm);
	}

	h3 {
		margin-block: var(--space-md) var(--space-sm);
		font-size: var(--text-base);
	}
</style>
