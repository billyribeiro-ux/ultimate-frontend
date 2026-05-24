<script lang="ts">
	type Environment = 'development' | 'staging' | 'production';
	type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'live' | 'failed';

	interface PipelineDeployment {
		id: string;
		branch: string;
		commitHash: string;
		environment: Environment;
		status: DeploymentStatus;
		timestamp: number;
	}

	interface PromotionRecord {
		id: string;
		from: Environment;
		to: Environment;
		version: string;
		timestamp: number;
	}

	let deployments: Map<Environment, PipelineDeployment | null> = $state(
		new Map([
			['development', null],
			['staging', null],
			['production', null]
		])
	);
	let promotionHistory: PromotionRecord[] = $state([]);
	let versionCounter: number = $state(0);
	let buildingEnv: Environment | null = $state(null);

	function generateHash(): string {
		return Math.random().toString(36).substring(2, 9);
	}

	const environmentOrder: Environment[] = ['development', 'staging', 'production'];

	let canPromoteToStaging: boolean = $derived(
		deployments.get('development')?.status === 'live' && buildingEnv === null
	);

	let canPromoteToProduction: boolean = $derived(
		deployments.get('staging')?.status === 'live' && buildingEnv === null
	);

	async function simulateBuild(env: Environment, version: string): Promise<void> {
		buildingEnv = env;
		const deployment: PipelineDeployment = {
			id: crypto.randomUUID(),
			branch: env === 'development' ? 'feature/new-ui' : 'main',
			commitHash: generateHash(),
			environment: env,
			status: 'pending',
			timestamp: Date.now()
		};

		deployments.set(env, deployment);
		deployments = new Map(deployments);

		await new Promise<void>((r) => setTimeout(r, 500));
		deployment.status = 'building';
		deployments = new Map(deployments);

		await new Promise<void>((r) => setTimeout(r, 800));
		deployment.status = 'deploying';
		deployments = new Map(deployments);

		await new Promise<void>((r) => setTimeout(r, 500));
		deployment.status = 'live';
		deployments = new Map(deployments);

		buildingEnv = null;
	}

	async function deployToDev(): Promise<void> {
		versionCounter += 1;
		await simulateBuild('development', `v1.${versionCounter}.0`);
	}

	async function promoteToStaging(): Promise<void> {
		const dev: PipelineDeployment | null | undefined = deployments.get('development');
		if (!dev) return;
		promotionHistory = [{
			id: crypto.randomUUID(),
			from: 'development',
			to: 'staging',
			version: `v1.${versionCounter}.0`,
			timestamp: Date.now()
		}, ...promotionHistory];
		await simulateBuild('staging', `v1.${versionCounter}.0`);
	}

	async function promoteToProduction(): Promise<void> {
		const staging: PipelineDeployment | null | undefined = deployments.get('staging');
		if (!staging) return;
		promotionHistory = [{
			id: crypto.randomUUID(),
			from: 'staging',
			to: 'production',
			version: `v1.${versionCounter}.0`,
			timestamp: Date.now()
		}, ...promotionHistory];
		await simulateBuild('production', `v1.${versionCounter}.0`);
	}

	function statusLabel(dep: PipelineDeployment | null | undefined): string {
		if (!dep) return 'Empty';
		return dep.status.charAt(0).toUpperCase() + dep.status.slice(1);
	}
</script>

<svelte:head>
	<title>22.5 — Preview Deployments · DevOps & Edge Deployment</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 22.5 · Mini-build</p>
		<h1>Deployment Pipeline Visualizer</h1>
		<p class="lede">
			Deploy to development, promote through staging, and release to production.
			Watch the pipeline flow in real time.
		</p>
	</header>

	<div class="pipeline">
		{#each environmentOrder as env (env)}
			{@const deployment = deployments.get(env)}
			<div class="env-card" class:env-card--live={deployment?.status === 'live'}>
				<h2 class="env-card__name">{env}</h2>
				<p class="env-card__status">{statusLabel(deployment)}</p>
				{#if deployment}
					<p class="env-card__hash">{deployment.commitHash}</p>
				{/if}
			</div>
			{#if env !== 'production'}
				<div class="arrow" aria-hidden="true">
					<span class="arrow__icon">&rarr;</span>
				</div>
			{/if}
		{/each}
	</div>

	<div class="actions">
		<button type="button" class="btn btn--primary" onclick={deployToDev} disabled={buildingEnv !== null}>
			Deploy to Dev
		</button>
		<button type="button" class="btn btn--secondary" onclick={promoteToStaging} disabled={!canPromoteToStaging}>
			Promote to Staging
		</button>
		<button type="button" class="btn btn--secondary" onclick={promoteToProduction} disabled={!canPromoteToProduction}>
			Promote to Production
		</button>
	</div>

	{#if promotionHistory.length > 0}
		<section>
			<h2>Promotion History</h2>
			<ol class="history-list">
				{#each promotionHistory as record (record.id)}
					<li class="history-entry">
						<span class="history-entry__version">{record.version}</span>
						<span class="history-entry__flow">{record.from} &rarr; {record.to}</span>
						<time class="history-entry__time">{new Date(record.timestamp).toLocaleTimeString()}</time>
					</li>
				{/each}
			</ol>
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

	.pipeline {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--space-sm);
	}

	@media (min-width: 768px) {
		.pipeline {
			flex-direction: row;
			align-items: center;
		}
	}

	.env-card {
		flex: 1;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: center;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.env-card--live {
		border-color: var(--color-success);
		box-shadow: var(--shadow-md);
	}

	.env-card__name {
		font-size: var(--text-base);
		text-transform: capitalize;
	}

	.env-card__status {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-start: var(--space-xs);
	}

	.env-card__hash {
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-block-start: var(--space-xs);
	}

	.arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-xl);
		color: var(--color-text-muted);
	}

	.actions {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-md);
		font-weight: 600;
		font-size: var(--text-sm);
		min-block-size: 44px;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.btn--primary {
		background: var(--color-brand);
		color: oklch(100% 0 0);
	}

	.btn--primary:hover:not(:disabled) {
		background: var(--color-brand-dim);
	}

	.btn--secondary {
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.history-list {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.history-entry {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
	}

	.history-entry__version {
		font-weight: 700;
		color: var(--color-brand);
	}

	.history-entry__flow {
		flex: 1;
	}

	.history-entry__time {
		color: var(--color-text-muted);
		font-family: ui-monospace, monospace;
	}
</style>
