<script lang="ts">
	interface DockerConfig {
		nodeVersion: string;
		port: number;
		healthCheckInterval: number;
		enablePrecompress: boolean;
		useNonRootUser: boolean;
		appName: string;
	}

	let config: DockerConfig = $state({
		nodeVersion: '22',
		port: 3000,
		healthCheckInterval: 30,
		enablePrecompress: true,
		useNonRootUser: true,
		appName: 'sveltekit-app'
	});

	const nodeVersions: string[] = ['20', '22', '24'];

	let dockerfile: string = $derived(generateDockerfile(config));
	let dockerignore: string = $derived(generateDockerignore());

	function generateDockerfile(cfg: DockerConfig): string {
		const lines: string[] = [
			`# Stage 1: Build`,
			`FROM node:${cfg.nodeVersion}-alpine AS builder`,
			`WORKDIR /app`,
			`COPY package.json pnpm-lock.yaml ./`,
			`RUN corepack enable && pnpm install --frozen-lockfile`,
			`COPY . .`,
			`RUN pnpm build`,
			``,
			`# Stage 2: Production`,
			`FROM node:${cfg.nodeVersion}-alpine`,
		];

		if (cfg.useNonRootUser) {
			lines.push(`RUN addgroup -S appgroup && adduser -S appuser -G appgroup`);
		}

		lines.push(
			`WORKDIR /app`,
			`COPY --from=builder /app/build ./build`,
			`COPY --from=builder /app/package.json ./`,
			`COPY --from=builder /app/node_modules ./node_modules`,
		);

		if (cfg.useNonRootUser) {
			lines.push(`USER appuser`);
		}

		lines.push(
			`ENV NODE_ENV=production`,
			`ENV HOST=0.0.0.0`,
			`ENV PORT=${cfg.port}`,
			`EXPOSE ${cfg.port}`,
			``,
			`HEALTHCHECK --interval=${cfg.healthCheckInterval}s --timeout=5s --start-period=10s --retries=3 \\`,
			`    CMD wget --no-verbose --tries=1 --spider http://localhost:${cfg.port}/api/health || exit 1`,
			``,
			`CMD ["node", "build/index.js"]`
		);

		return lines.join('\n');
	}

	function generateDockerignore(): string {
		return [
			'node_modules',
			'.git',
			'.gitignore',
			'.env',
			'.env.*',
			'*.md',
			'tests',
			'.svelte-kit',
			'build',
			'.DS_Store',
			'Dockerfile',
			'.dockerignore'
		].join('\n');
	}

	let activeTab: 'dockerfile' | 'dockerignore' = $state('dockerfile');
</script>

<svelte:head>
	<title>22.4 — Docker for SvelteKit · DevOps & Edge Deployment</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 22.4 · Mini-build</p>
		<h1>Docker Config Generator</h1>
		<p class="lede">
			Configure your Docker settings and see a production-ready Dockerfile
			and .dockerignore generated in real time.
		</p>
	</header>

	<div class="layout">
		<div class="config-panel">
			<h2>Configuration</h2>

			<label class="field">
				<span class="field__label">Node.js Version</span>
				<select bind:value={config.nodeVersion} class="field__input">
					{#each nodeVersions as version (version)}
						<option value={version}>Node {version}</option>
					{/each}
				</select>
			</label>

			<label class="field">
				<span class="field__label">Port</span>
				<input
					type="number"
					bind:value={config.port}
					min="1000"
					max="65535"
					class="field__input"
				/>
			</label>

			<label class="field">
				<span class="field__label">Health Check Interval (seconds)</span>
				<input
					type="number"
					bind:value={config.healthCheckInterval}
					min="5"
					max="120"
					class="field__input"
				/>
			</label>

			<label class="field field--checkbox">
				<input type="checkbox" bind:checked={config.enablePrecompress} />
				<span>Enable precompression (gzip + brotli)</span>
			</label>

			<label class="field field--checkbox">
				<input type="checkbox" bind:checked={config.useNonRootUser} />
				<span>Run as non-root user</span>
			</label>
		</div>

		<div class="output-panel">
			<div class="tab-bar">
				<button
					type="button"
					class="tab"
					class:tab--active={activeTab === 'dockerfile'}
					onclick={() => { activeTab = 'dockerfile'; }}
				>
					Dockerfile
				</button>
				<button
					type="button"
					class="tab"
					class:tab--active={activeTab === 'dockerignore'}
					onclick={() => { activeTab = 'dockerignore'; }}
				>
					.dockerignore
				</button>
			</div>
			<pre class="code-output"><code>{activeTab === 'dockerfile' ? dockerfile : dockerignore}</code></pre>
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

	.layout {
		display: grid;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.config-panel {
		display: grid;
		gap: var(--space-sm);
		align-content: start;
	}

	.field {
		display: grid;
		gap: var(--space-xs);
	}

	.field__label {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.field__input {
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		min-block-size: 44px;
	}

	.field--checkbox {
		flex-direction: row;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--text-sm);
	}

	.field--checkbox input {
		inline-size: 20px;
		block-size: 20px;
	}

	.tab-bar {
		display: flex;
		gap: var(--space-xs);
		margin-block-end: var(--space-sm);
	}

	.tab {
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.tab--active {
		border-color: var(--color-brand);
		color: var(--color-brand);
	}

	.code-output {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		overflow-x: auto;
		font-size: var(--text-sm);
		line-height: 1.6;
	}
</style>
