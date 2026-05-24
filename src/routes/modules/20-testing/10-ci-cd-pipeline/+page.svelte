<script lang="ts">
	interface PipelineStep { name: string; duration: number; status: 'pending' | 'running' | 'passed' | 'failed'; }
	interface PipelineJob { name: string; steps: PipelineStep[]; dependsOn?: string; }

	let jobs: PipelineJob[] = $state([
		{ name: 'Unit & Integration', steps: [
			{ name: 'Checkout', duration: 2, status: 'pending' },
			{ name: 'Install pnpm', duration: 1, status: 'pending' },
			{ name: 'Install deps', duration: 8, status: 'pending' },
			{ name: 'Run Vitest', duration: 12, status: 'pending' },
			{ name: 'Upload coverage', duration: 2, status: 'pending' }
		]},
		{ name: 'E2E Tests', steps: [
			{ name: 'Checkout', duration: 2, status: 'pending' },
			{ name: 'Install pnpm', duration: 1, status: 'pending' },
			{ name: 'Install deps', duration: 8, status: 'pending' },
			{ name: 'Install Playwright', duration: 15, status: 'pending' },
			{ name: 'Run Playwright', duration: 45, status: 'pending' },
			{ name: 'Upload traces', duration: 3, status: 'pending' }
		]},
		{ name: 'Deploy', dependsOn: 'tests', steps: [
			{ name: 'Build', duration: 20, status: 'pending' },
			{ name: 'Deploy to Vercel', duration: 10, status: 'pending' }
		]}
	]);

	let isRunning: boolean = $state(false);
	let failStep: boolean = $state(false);

	function resetPipeline(): void {
		for (const job of jobs) {
			for (const step of job.steps) {
				step.status = 'pending';
			}
		}
		isRunning = false;
	}

	async function runPipeline(): Promise<void> {
		resetPipeline();
		isRunning = true;

		async function runJob(job: PipelineJob): Promise<boolean> {
			for (const step of job.steps) {
				step.status = 'running';
				await new Promise(r => setTimeout(r, 300));
				if (failStep && step.name === 'Run Vitest') {
					step.status = 'failed';
					return false;
				}
				step.status = 'passed';
			}
			return true;
		}

		const [unitResult, e2eResult] = await Promise.all([
			runJob(jobs[0]),
			runJob(jobs[1])
		]);

		if (unitResult && e2eResult) {
			await runJob(jobs[2]);
		} else {
			for (const step of jobs[2].steps) {
				step.status = 'pending';
			}
		}

		isRunning = false;
	}

	function getJobStatus(job: PipelineJob): string {
		if (job.steps.some(s => s.status === 'failed')) return 'failed';
		if (job.steps.some(s => s.status === 'running')) return 'running';
		if (job.steps.every(s => s.status === 'passed')) return 'passed';
		return 'pending';
	}
</script>

<svelte:head>
	<title>20.10 — CI/CD Pipeline · Testing Deep Dive</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 20.10 · Mini-build</p>
		<h1>CI Pipeline Simulator</h1>
		<p class="lede">
			Watch a GitHub Actions pipeline run: parallel test jobs,
			artifact uploads, and conditional deployment.
		</p>
	</header>

	<div class="pipeline-controls">
		<button class="btn btn--primary" onclick={runPipeline} disabled={isRunning}>
			{isRunning ? 'Running...' : 'Run Pipeline'}
		</button>
		<button class="btn" onclick={resetPipeline} disabled={isRunning}>Reset</button>
		<label class="toggle-label">
			<input type="checkbox" bind:checked={failStep} disabled={isRunning} />
			<span>Simulate failure</span>
		</label>
	</div>

	<div class="pipeline">
		{#each jobs as job (job.name)}
			{@const jobStatus = getJobStatus(job)}
			<section class="job" class:job--running={jobStatus === 'running'} class:job--passed={jobStatus === 'passed'} class:job--failed={jobStatus === 'failed'}>
				<h2 class="job__name">
					{job.name}
					{#if job.dependsOn}<span class="job__depends">needs: tests</span>{/if}
				</h2>
				<ul class="step-list">
					{#each job.steps as step (step.name)}
						<li class="step" class:step--running={step.status === 'running'} class:step--passed={step.status === 'passed'} class:step--failed={step.status === 'failed'}>
							<span class="step__icon">
								{#if step.status === 'passed'}OK
								{:else if step.status === 'failed'}FAIL
								{:else if step.status === 'running'}...
								{:else}-{/if}
							</span>
							<span class="step__name">{step.name}</span>
							<span class="step__duration">{step.duration}s</span>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>

	<section class="yaml-section" aria-labelledby="yaml-heading">
		<h2 id="yaml-heading">Generated Workflow</h2>
		<pre class="code-block"><code>{`name: Test Suite
on: [push, pull_request]

jobs:
  unit-and-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm vitest run --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: coverage, path: coverage/ }

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm exec playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: traces, path: test-results/ }

  deploy:
    needs: [unit-and-integration, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: pnpm build
      - run: echo "Deploy to production"`}</code></pre>
	</section>
</section>

<style>
	.eyebrow { font-size: var(--text-sm); color: var(--color-brand); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
	.lede { font-size: var(--text-lg); color: var(--color-text-muted); max-inline-size: 50ch; }
	.pipeline-controls { display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; }
	.toggle-label { display: flex; align-items: center; gap: var(--space-xs); font-size: var(--text-sm); }
	.btn { padding: var(--space-xs) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600; min-block-size: 44px; transition: border-color var(--dur-fast) var(--ease-out); }
	.btn:hover { border-color: var(--color-brand); }
	.btn:disabled { opacity: 0.4; cursor: not-allowed; }
	.btn--primary { background: var(--color-brand); color: oklch(100% 0 0); border-color: var(--color-brand); }
	.btn--primary:hover { background: var(--color-brand-dim); }
	.pipeline { display: grid; gap: var(--space-md); }
	@media (min-width: 768px) { .pipeline { grid-template-columns: 1fr 1fr 1fr; } }
	.job { padding: var(--space-md); background: var(--color-surface-2); border: 2px solid var(--color-border); border-radius: var(--radius-lg); transition: border-color var(--dur-fast) var(--ease-out); }
	.job--running { border-color: var(--color-brand); }
	.job--passed { border-color: var(--color-success); }
	.job--failed { border-color: var(--color-error); }
	.job__name { font-size: var(--text-sm); font-weight: 700; margin-block-end: var(--space-sm); }
	.job__depends { font-size: var(--text-xs); color: var(--color-text-muted); font-weight: 400; }
	.step-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.25rem; }
	.step { display: grid; grid-template-columns: auto 1fr auto; gap: var(--space-xs); padding: 0.25rem var(--space-xs); border-radius: var(--radius-sm); font-size: var(--text-xs); align-items: center; }
	.step--running { background: oklch(65% 0.22 270 / 0.1); }
	.step--passed { background: oklch(65% 0.18 145 / 0.1); }
	.step--failed { background: oklch(60% 0.22 25 / 0.1); }
	.step__icon { font-weight: 700; min-inline-size: 2rem; }
	.step--passed .step__icon { color: var(--color-success); }
	.step--failed .step__icon { color: var(--color-error); }
	.step--running .step__icon { color: var(--color-brand); }
	.step__duration { color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
	.yaml-section { padding: var(--space-lg); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.code-block { background: var(--color-surface); padding: var(--space-md); border-radius: var(--radius-md); overflow-x: auto; font-size: var(--text-xs); line-height: 1.6; white-space: pre; margin-block-start: var(--space-md); }
</style>
