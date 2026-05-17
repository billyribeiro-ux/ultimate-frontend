<script lang="ts">
	interface FlowStep { id: number; action: string; code: string; pageState: string; assertion: string; }
	let steps: FlowStep[] = $state([
		{ id: 1, action: 'Navigate to login', code: "await page.goto('/login');", pageState: 'Login form visible', assertion: "await expect(page).toHaveURL('/login');" },
		{ id: 2, action: 'Fill email', code: "await page.getByLabel('Email').fill('ada@example.com');", pageState: 'Email field filled', assertion: "await expect(page.getByLabel('Email')).toHaveValue('ada@example.com');" },
		{ id: 3, action: 'Fill password', code: "await page.getByLabel('Password').fill('password123');", pageState: 'Password field filled', assertion: "await expect(page.getByLabel('Password')).toHaveValue('password123');" },
		{ id: 4, action: 'Click sign in', code: "await page.getByRole('button', { name: 'Sign in' }).click();", pageState: 'Redirecting...', assertion: "await expect(page).toHaveURL('/dashboard');" },
		{ id: 5, action: 'Verify dashboard', code: "// Auto-navigated to dashboard", pageState: 'Dashboard with welcome message', assertion: "await expect(page.getByText('Welcome, Ada')).toBeVisible();" }
	]);

	let currentStep: number = $state(0);
	let isRunning: boolean = $state(false);

	function nextStep(): void {
		if (currentStep < steps.length - 1) currentStep += 1;
	}

	function prevStep(): void {
		if (currentStep > 0) currentStep -= 1;
	}

	function resetFlow(): void { currentStep = 0; }

	let current: FlowStep = $derived(steps[currentStep]);
</script>

<svelte:head>
	<title>20.8 — E2E Flows · Testing Deep Dive</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 20.8 · Mini-build</p>
		<h1>E2E Flow Step-Through</h1>
		<p class="lede">
			Walk through a complete authentication E2E test step by step.
			See the action, page state, and assertion at each point.
		</p>
	</header>

	<section class="flow-timeline" aria-label="Test flow timeline">
		<div class="timeline">
			{#each steps as step, i (step.id)}
				<button
					class="timeline__step"
					class:timeline__step--active={i === currentStep}
					class:timeline__step--done={i < currentStep}
					onclick={() => currentStep = i}
				>
					{step.id}
				</button>
			{/each}
		</div>
	</section>

	<div class="step-layout">
		<section class="page-state" aria-labelledby="state-heading">
			<h2 id="state-heading">Page State</h2>
			<div class="state-preview">
				<p class="state-action">{current.action}</p>
				<p class="state-display">{current.pageState}</p>
			</div>
		</section>

		<section class="code-panel" aria-labelledby="code-heading">
			<h2 id="code-heading">Test Code</h2>
			<div class="code-blocks">
				<h3 class="sub-heading">Action</h3>
				<pre class="code-block"><code>{current.code}</code></pre>
				<h3 class="sub-heading">Assertion</h3>
				<pre class="code-block code-block--assertion"><code>{current.assertion}</code></pre>
			</div>
		</section>
	</div>

	<div class="nav-buttons">
		<button class="btn" onclick={prevStep} disabled={currentStep === 0}>Previous</button>
		<span class="step-indicator">Step {currentStep + 1} of {steps.length}</span>
		<button class="btn btn--primary" onclick={nextStep} disabled={currentStep === steps.length - 1}>Next</button>
		<button class="btn" onclick={resetFlow}>Reset</button>
	</div>
</section>

<style>
	.eyebrow { font-size: var(--text-sm); color: var(--color-brand); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
	.lede { font-size: var(--text-lg); color: var(--color-text-muted); max-inline-size: 50ch; }
	.timeline { display: flex; gap: var(--space-xs); justify-content: center; padding: var(--space-md); }
	.timeline__step { inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--radius-full); border: 2px solid var(--color-border); font-weight: 700; font-size: var(--text-sm); transition: all var(--dur-fast) var(--ease-out); display: grid; place-items: center; }
	.timeline__step--active { border-color: var(--color-brand); background: var(--color-brand); color: oklch(100% 0 0); }
	.timeline__step--done { border-color: var(--color-success); color: var(--color-success); }
	.step-layout { display: grid; gap: var(--space-md); }
	@media (min-width: 768px) { .step-layout { grid-template-columns: 1fr 1fr; } }
	.page-state, .code-panel { padding: var(--space-lg); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.state-preview { min-block-size: 8rem; display: grid; place-items: center; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-lg); margin-block-start: var(--space-md); text-align: center; }
	.state-action { font-size: var(--text-sm); color: var(--color-brand); font-weight: 600; margin-block-end: var(--space-sm); }
	.state-display { font-size: var(--text-base); }
	.sub-heading { font-size: var(--text-xs); font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-block-start: var(--space-md); margin-block-end: var(--space-xs); }
	.code-block { background: var(--color-surface); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); overflow-x: auto; font-size: var(--text-xs); line-height: 1.6; white-space: pre; }
	.code-block--assertion { border-inline-start: 3px solid var(--color-success); }
	.nav-buttons { display: flex; align-items: center; gap: var(--space-sm); justify-content: center; flex-wrap: wrap; }
	.step-indicator { font-size: var(--text-sm); color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
	.btn { padding: var(--space-xs) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600; min-block-size: 44px; transition: border-color var(--dur-fast) var(--ease-out); }
	.btn:hover { border-color: var(--color-brand); }
	.btn:disabled { opacity: 0.4; cursor: not-allowed; }
	.btn--primary { background: var(--color-brand); color: oklch(100% 0 0); border-color: var(--color-brand); }
	.btn--primary:hover { background: var(--color-brand-dim); }
</style>
