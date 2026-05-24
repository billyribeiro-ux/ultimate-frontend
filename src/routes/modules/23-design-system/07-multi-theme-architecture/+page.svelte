<script lang="ts">
	interface ThemeDefinition {
		id: string;
		name: string;
		tokens: Record<string, string>;
	}

	const themes: ThemeDefinition[] = [
		{
			id: 'light',
			name: 'Light',
			tokens: {
				'--theme-brand': 'oklch(65% 0.22 270)',
				'--theme-surface': 'oklch(98% 0.01 270)',
				'--theme-surface-2': 'oklch(94% 0.02 270)',
				'--theme-text': 'oklch(20% 0.02 270)',
				'--theme-text-muted': 'oklch(50% 0.03 270)',
				'--theme-border': 'oklch(85% 0.02 270)',
				'--theme-error': 'oklch(60% 0.22 25)'
			}
		},
		{
			id: 'dark',
			name: 'Dark',
			tokens: {
				'--theme-brand': 'oklch(72% 0.20 270)',
				'--theme-surface': 'oklch(18% 0.02 270)',
				'--theme-surface-2': 'oklch(25% 0.03 270)',
				'--theme-text': 'oklch(96% 0.01 270)',
				'--theme-text-muted': 'oklch(65% 0.02 270)',
				'--theme-border': 'oklch(35% 0.02 270)',
				'--theme-error': 'oklch(68% 0.20 25)'
			}
		},
		{
			id: 'brand-warm',
			name: 'Brand Warm',
			tokens: {
				'--theme-brand': 'oklch(65% 0.18 50)',
				'--theme-surface': 'oklch(97% 0.02 50)',
				'--theme-surface-2': 'oklch(92% 0.04 50)',
				'--theme-text': 'oklch(22% 0.02 50)',
				'--theme-text-muted': 'oklch(50% 0.04 50)',
				'--theme-border': 'oklch(84% 0.03 50)',
				'--theme-error': 'oklch(58% 0.22 20)'
			}
		},
		{
			id: 'high-contrast',
			name: 'High Contrast',
			tokens: {
				'--theme-brand': 'oklch(55% 0.28 270)',
				'--theme-surface': 'oklch(100% 0 0)',
				'--theme-surface-2': 'oklch(95% 0 0)',
				'--theme-text': 'oklch(0% 0 0)',
				'--theme-text-muted': 'oklch(25% 0 0)',
				'--theme-border': 'oklch(0% 0 0)',
				'--theme-error': 'oklch(50% 0.30 25)'
			}
		},
		{
			id: 'enterprise-gold',
			name: 'Enterprise Gold',
			tokens: {
				'--theme-brand': 'oklch(72% 0.14 85)',
				'--theme-surface': 'oklch(15% 0.02 85)',
				'--theme-surface-2': 'oklch(22% 0.03 85)',
				'--theme-text': 'oklch(95% 0.01 85)',
				'--theme-text-muted': 'oklch(65% 0.03 85)',
				'--theme-border': 'oklch(35% 0.03 85)',
				'--theme-error': 'oklch(65% 0.22 25)'
			}
		}
	];

	let activeThemeId: string = $state('light');

	let activeTheme: ThemeDefinition = $derived(
		themes.find((t: ThemeDefinition) => t.id === activeThemeId) ?? themes[0]
	);

	let cssOutput: string = $derived.by(() => {
		const lines: string[] = [`[data-theme="${activeTheme.id}"] {`];
		for (const [key, value] of Object.entries(activeTheme.tokens)) {
			lines.push(`  ${key}: ${value};`);
		}
		lines.push('}');
		return lines.join('\n');
	});

	function buildStyleString(tokens: Record<string, string>): string {
		return Object.entries(tokens)
			.map(([key, value]: [string, string]) => `${key}:${value}`)
			.join(';');
	}
</script>

<svelte:head>
	<title>23.7 — Multi-theme Architecture · Design System Engineering</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 23.7 · Mini-build</p>
		<h1>Theme Switcher</h1>
		<p class="lede">
			Switch between five themes and see how CSS custom property cascading
			changes every element's appearance from a single data attribute.
		</p>
	</header>

	<div class="theme-selector">
		{#each themes as theme (theme.id)}
			<button
				type="button"
				class="theme-btn"
				class:theme-btn--active={theme.id === activeThemeId}
				onclick={() => { activeThemeId = theme.id; }}
			>
				<span
					class="theme-swatch"
					style:background={theme.tokens['--theme-brand']}
				></span>
				{theme.name}
			</button>
		{/each}
	</div>

	<div class="preview-and-code">
		<div
			class="theme-preview"
			style={buildStyleString(activeTheme.tokens)}
		>
			<div class="preview-surface">
				<h2 class="preview-heading">Dashboard</h2>
				<p class="preview-muted">Welcome back. Here's your overview.</p>

				<div class="preview-cards">
					<div class="preview-card">
						<h3>Revenue</h3>
						<p class="preview-value">$12,340</p>
						<p class="preview-muted">+14% from last month</p>
					</div>
					<div class="preview-card">
						<h3>Users</h3>
						<p class="preview-value">1,205</p>
						<p class="preview-muted">+23 today</p>
					</div>
				</div>

				<div class="preview-actions">
					<button type="button" class="preview-btn preview-btn--primary">Save changes</button>
					<button type="button" class="preview-btn preview-btn--secondary">Cancel</button>
					<button type="button" class="preview-btn preview-btn--danger">Delete</button>
				</div>

				<div class="preview-input-group">
					<label class="preview-label">
						Email
						<input type="text" class="preview-input" value="user@example.com" />
					</label>
					<label class="preview-label">
						<span>Password</span>
						<input type="password" class="preview-input preview-input--error" value="short" />
						<span class="preview-error">Must be at least 8 characters</span>
					</label>
				</div>
			</div>
		</div>

		<div class="code-panel">
			<h2>Generated CSS</h2>
			<pre class="code-output"><code>{cssOutput}</code></pre>

			<h3>Token Values</h3>
			<div class="token-list">
				{#each Object.entries(activeTheme.tokens) as [tokenName, tokenValue] (tokenName)}
					<div class="token-row">
						<span
							class="token-swatch"
							style:background={tokenValue}
						></span>
						<code class="token-name">{tokenName}</code>
						<code class="token-value">{tokenValue}</code>
					</div>
				{/each}
			</div>
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

	.theme-selector {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.theme-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-md);
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 36px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.theme-btn:hover {
		border-color: var(--color-brand);
	}

	.theme-btn--active {
		border-color: var(--color-brand);
		box-shadow: var(--shadow-sm);
	}

	.theme-swatch {
		display: block;
		inline-size: 1rem;
		block-size: 1rem;
		border-radius: var(--radius-full);
		border: 1px solid oklch(70% 0 0);
	}

	.preview-and-code {
		display: grid;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.preview-and-code {
			grid-template-columns: 1fr 1fr;
		}
	}

	.theme-preview {
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.preview-surface {
		padding: var(--space-lg);
		background: var(--theme-surface);
		color: var(--theme-text);
		border: 1px solid var(--theme-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-md);
	}

	.preview-heading {
		font-size: var(--text-lg);
		margin: 0;
	}

	.preview-muted {
		font-size: var(--text-sm);
		color: var(--theme-text-muted);
	}

	.preview-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-sm);
	}

	.preview-card {
		padding: var(--space-md);
		background: var(--theme-surface-2);
		border: 1px solid var(--theme-border);
		border-radius: var(--radius-md);
	}

	.preview-card h3 {
		font-size: var(--text-sm);
		color: var(--theme-text-muted);
		margin: 0 0 var(--space-xs);
	}

	.preview-value {
		font-size: var(--text-lg);
		font-weight: 700;
		margin: 0 0 var(--space-xs);
	}

	.preview-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.preview-btn {
		padding: var(--space-xs) var(--space-md);
		border: 2px solid transparent;
		border-radius: var(--radius-md);
		font-weight: 600;
		font-size: var(--text-sm);
		min-block-size: 36px;
	}

	.preview-btn--primary {
		background: var(--theme-brand);
		color: oklch(100% 0 0);
	}

	.preview-btn--secondary {
		background: transparent;
		border-color: var(--theme-brand);
		color: var(--theme-brand);
	}

	.preview-btn--danger {
		background: var(--theme-error);
		color: oklch(100% 0 0);
	}

	.preview-input-group {
		display: grid;
		gap: var(--space-sm);
	}

	.preview-label {
		display: grid;
		gap: var(--space-xs);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.preview-input {
		padding: var(--space-xs) var(--space-sm);
		background: var(--theme-surface);
		border: 1px solid var(--theme-border);
		border-radius: var(--radius-sm);
		color: var(--theme-text);
		font-size: var(--text-sm);
	}

	.preview-input--error {
		border-color: var(--theme-error);
	}

	.preview-error {
		font-size: var(--text-xs);
		color: var(--theme-error);
	}

	.code-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	.code-output {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-block-start: 3px solid var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		line-height: 1.6;
		overflow-x: auto;
	}

	.token-list {
		display: grid;
		gap: var(--space-xs);
	}

	.token-row {
		display: grid;
		grid-template-columns: 1.5rem 1fr 1fr;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--text-xs);
	}

	.token-swatch {
		display: block;
		inline-size: 1.5rem;
		block-size: 1.5rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
	}

	.token-name {
		color: var(--color-brand);
	}

	.token-value {
		color: var(--color-text-muted);
	}

	h2 {
		margin-block-end: var(--space-sm);
	}

	h3 {
		margin-block: var(--space-md) var(--space-sm);
		font-size: var(--text-base);
	}
</style>
