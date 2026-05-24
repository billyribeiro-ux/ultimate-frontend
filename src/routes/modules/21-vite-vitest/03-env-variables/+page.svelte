<script lang="ts">
	interface EnvVariable {
		id: string;
		key: string;
		value: string;
		source: string;
		isPublic: boolean;
		accessibleIn: ('server' | 'client')[];
	}

	let variables: EnvVariable[] = $state([
		{
			id: '1',
			key: 'DATABASE_URL',
			value: 'postgresql://localhost:5432/mydb',
			source: '.env',
			isPublic: false,
			accessibleIn: ['server']
		},
		{
			id: '2',
			key: 'PUBLIC_APP_NAME',
			value: 'Ultimate Frontend',
			source: '.env',
			isPublic: true,
			accessibleIn: ['server', 'client']
		},
		{
			id: '3',
			key: 'VITE_API_URL',
			value: 'http://localhost:8080',
			source: '.env.development',
			isPublic: true,
			accessibleIn: ['server', 'client']
		},
		{
			id: '4',
			key: 'SECRET_API_KEY',
			value: 'sk_live_abc123...',
			source: '.env.local',
			isPublic: false,
			accessibleIn: ['server']
		},
		{
			id: '5',
			key: 'PUBLIC_ANALYTICS_ID',
			value: 'GA-12345',
			source: '.env.production',
			isPublic: true,
			accessibleIn: ['server', 'client']
		}
	]);

	let newKey: string = $state('');
	let newValue: string = $state('');

	function addVariable(): void {
		if (!newKey.trim()) return;
		const isPublic: boolean = newKey.startsWith('PUBLIC_') || newKey.startsWith('VITE_');
		variables = [...variables, {
			id: String(Date.now()),
			key: newKey.trim(),
			value: newValue.trim() || '(empty)',
			source: '.env',
			isPublic,
			accessibleIn: isPublic ? ['server', 'client'] : ['server']
		}];
		newKey = '';
		newValue = '';
	}

	function removeVariable(id: string): void {
		variables = variables.filter((v: EnvVariable) => v.id !== id);
	}

	let serverVars: EnvVariable[] = $derived(
		variables.filter((v: EnvVariable) => v.accessibleIn.includes('server'))
	);

	let clientVars: EnvVariable[] = $derived(
		variables.filter((v: EnvVariable) => v.accessibleIn.includes('client'))
	);

	function getSecurityLevel(variable: EnvVariable): 'safe' | 'warning' | 'danger' {
		if (!variable.isPublic) return 'safe';
		if (variable.key.toLowerCase().includes('secret') || variable.key.toLowerCase().includes('password')) return 'danger';
		return 'warning';
	}
</script>

<svelte:head>
	<title>21.3 — Environment Variables · Vite, Vitest & The Svelte Playground</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 21.3 · Mini-build</p>
		<h1>Environment Variable Debugger</h1>
		<p class="lede">
			Add variables with different prefixes and see where they are accessible.
			Variables without PUBLIC_ or VITE_ prefix stay server-only.
		</p>
	</header>

	<form class="add-form" onsubmit={(e) => { e.preventDefault(); addVariable(); }}>
		<input
			type="text"
			class="add-form__input"
			placeholder="Variable name (e.g., PUBLIC_APP_NAME)"
			bind:value={newKey}
		/>
		<input
			type="text"
			class="add-form__input"
			placeholder="Value"
			bind:value={newValue}
		/>
		<button type="submit" class="btn">Add</button>
	</form>

	<div class="columns">
		<section class="column" aria-labelledby="server-heading">
			<h2 id="server-heading" class="column__title column__title--server">
				Server Only
			</h2>
			<p class="column__subtitle">$env/static/private &middot; $env/dynamic/private</p>
			<ul class="var-list">
				{#each serverVars as variable (variable.id)}
					<li class="var-card" class:var-card--private={!variable.isPublic}>
						<div class="var-card__header">
							<code class="var-card__key">{variable.key}</code>
							<button
								type="button"
								class="var-card__remove"
								aria-label="Remove {variable.key}"
								onclick={() => removeVariable(variable.id)}
							>
								x
							</button>
						</div>
						<span class="var-card__value">
							{variable.isPublic ? variable.value : '••••••••'}
						</span>
						<span class="var-card__source">{variable.source}</span>
					</li>
				{/each}
			</ul>
		</section>

		<section class="column" aria-labelledby="client-heading">
			<h2 id="client-heading" class="column__title column__title--client">
				Client Accessible
			</h2>
			<p class="column__subtitle">$env/static/public &middot; $env/dynamic/public</p>
			<ul class="var-list">
				{#each clientVars as variable (variable.id)}
					{@const security = getSecurityLevel(variable)}
					<li
						class="var-card"
						class:var-card--warning={security === 'warning'}
						class:var-card--danger={security === 'danger'}
					>
						<div class="var-card__header">
							<code class="var-card__key">{variable.key}</code>
							{#if security === 'danger'}
								<span class="var-card__badge var-card__badge--danger">EXPOSED</span>
							{/if}
						</div>
						<span class="var-card__value">{variable.value}</span>
						<span class="var-card__source">{variable.source}</span>
					</li>
				{/each}
			</ul>
		</section>
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

	.add-form {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.add-form__input {
		flex: 1;
		min-inline-size: 10rem;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		font-size: var(--text-sm);
		min-block-size: 44px;
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.btn:hover {
		border-color: var(--color-brand);
	}

	.columns {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.columns {
			grid-template-columns: 1fr 1fr;
		}
	}

	.column {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.column__title {
		font-size: var(--text-lg);
		font-weight: 700;
	}

	.column__title--server {
		color: var(--color-success);
	}

	.column__title--client {
		color: var(--color-warning);
	}

	.column__subtitle {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-block-end: var(--space-sm);
	}

	.var-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.var-card {
		padding: var(--space-sm);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		display: grid;
		gap: var(--space-xs);
	}

	.var-card--private {
		border-inline-start: 3px solid var(--color-success);
	}

	.var-card--warning {
		border-inline-start: 3px solid var(--color-warning);
	}

	.var-card--danger {
		border-inline-start: 3px solid var(--color-error);
	}

	.var-card__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.var-card__key {
		font-size: var(--text-sm);
		font-weight: 700;
	}

	.var-card__remove {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		min-block-size: 44px;
		min-inline-size: 44px;
		display: grid;
		place-items: center;
	}

	.var-card__badge {
		font-size: var(--text-xs);
		font-weight: 700;
		padding: 0.1em 0.4em;
		border-radius: var(--radius-sm);
	}

	.var-card__badge--danger {
		color: var(--color-error);
		border: 1px solid var(--color-error);
	}

	.var-card__value {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		word-break: break-all;
	}

	.var-card__source {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
