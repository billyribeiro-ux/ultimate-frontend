<script lang="ts">
	import { createMachine } from '$lib/components/advanced/StateMachine.svelte';

	type FormState = 'step1' | 'step2' | 'step3' | 'submitting' | 'success' | 'error';
	type FormEvent = 'NEXT' | 'BACK' | 'SUBMIT' | 'SUCCESS' | 'ERROR' | 'RETRY';

	const form = createMachine<FormState, FormEvent>({
		initial: 'step1',
		states: {
			step1: { on: { NEXT: 'step2' } },
			step2: { on: { NEXT: 'step3', BACK: 'step1' } },
			step3: { on: { SUBMIT: 'submitting', BACK: 'step2' } },
			submitting: { on: { SUCCESS: 'success', ERROR: 'error' } },
			success: { on: {} },
			error: { on: { RETRY: 'step3' } }
		}
	});

	let name: string = $state('');
	let email: string = $state('');
	let theme: string = $state('light');
	let notifications: boolean = $state(true);

	const steps: string[] = ['Personal Info', 'Preferences', 'Confirm & Submit'];
	let currentStepIndex: number = $derived(
		form.current === 'step1' ? 0 :
		form.current === 'step2' ? 1 : 2
	);

	async function handleSubmit(): Promise<void> {
		form.send('SUBMIT');
		try {
			await new Promise<void>((resolve) => setTimeout(resolve, 1500));
			form.send('SUCCESS');
		} catch {
			form.send('ERROR');
		}
	}
</script>

<svelte:head>
	<title>18.4 — State Machines with Runes · Advanced Patterns</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 18.4 · Mini-build</p>
		<h1>State Machines with Runes</h1>
		<p class="lede">
			Explicit states and transitions prevent impossible UI combinations.
			No more boolean soup.
		</p>
	</header>

	<section class="demo" aria-labelledby="form-heading">
		<h2 id="form-heading">Multi-Step Form</h2>

		<div class="step-indicator" aria-label="Form progress">
			{#each steps as step, i (step)}
				<div class="step" class:step--active={i === currentStepIndex} class:step--done={i < currentStepIndex}>
					<span class="step__number">{i + 1}</span>
					<span class="step__label">{step}</span>
				</div>
				{#if i < steps.length - 1}
					<div class="step__connector" class:step__connector--done={i < currentStepIndex}></div>
				{/if}
			{/each}
		</div>

		{#if form.matches('step1')}
			<div class="form-panel">
				<h3>Step 1: Personal Info</h3>
				<label class="field">
					<span class="field__label">Name</span>
					<input type="text" class="field__input" bind:value={name} placeholder="Your name" />
				</label>
				<label class="field">
					<span class="field__label">Email</span>
					<input type="email" class="field__input" bind:value={email} placeholder="you@example.com" />
				</label>
			</div>
		{:else if form.matches('step2')}
			<div class="form-panel">
				<h3>Step 2: Preferences</h3>
				<label class="field">
					<span class="field__label">Theme</span>
					<select class="field__input" bind:value={theme}>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
						<option value="system">System</option>
					</select>
				</label>
				<label class="field field--checkbox">
					<input type="checkbox" bind:checked={notifications} />
					<span class="field__label">Enable notifications</span>
				</label>
			</div>
		{:else if form.matches('step3')}
			<div class="form-panel">
				<h3>Step 3: Confirm</h3>
				<dl class="summary">
					<dt>Name</dt><dd>{name || '(not provided)'}</dd>
					<dt>Email</dt><dd>{email || '(not provided)'}</dd>
					<dt>Theme</dt><dd>{theme}</dd>
					<dt>Notifications</dt><dd>{notifications ? 'Yes' : 'No'}</dd>
				</dl>
			</div>
		{:else if form.matches('submitting')}
			<div class="form-panel form-panel--center">
				<div class="spinner" aria-label="Submitting"></div>
				<p>Submitting your preferences...</p>
			</div>
		{:else if form.matches('success')}
			<div class="form-panel form-panel--success">
				<p class="success-icon" aria-hidden="true">&#10003;</p>
				<h3>Success!</h3>
				<p>Your preferences have been saved.</p>
			</div>
		{:else if form.matches('error')}
			<div class="form-panel form-panel--error">
				<p class="error-icon" aria-hidden="true">&#10007;</p>
				<h3>Something went wrong</h3>
				<p>Please try again.</p>
			</div>
		{/if}

		<div class="form-actions">
			{#if form.canSend('BACK')}
				<button class="btn btn--secondary" onclick={() => form.send('BACK')}>
					Back
				</button>
			{/if}
			{#if form.canSend('NEXT')}
				<button class="btn btn--primary" onclick={() => form.send('NEXT')}>
					Next
				</button>
			{/if}
			{#if form.canSend('SUBMIT')}
				<button class="btn btn--primary" onclick={handleSubmit}>
					Submit
				</button>
			{/if}
			{#if form.canSend('RETRY')}
				<button class="btn btn--primary" onclick={() => form.send('RETRY')}>
					Retry
				</button>
			{/if}
		</div>
	</section>

	<aside class="debugger" aria-labelledby="debug-heading">
		<h2 id="debug-heading">State Debugger</h2>
		<dl class="debug-info">
			<dt>Current state</dt>
			<dd><code>{form.current}</code></dd>
			<dt>Can go back?</dt>
			<dd>{form.canSend('BACK') ? 'Yes' : 'No'}</dd>
			<dt>Can go next?</dt>
			<dd>{form.canSend('NEXT') ? 'Yes' : 'No'}</dd>
			<dt>Can submit?</dt>
			<dd>{form.canSend('SUBMIT') ? 'Yes' : 'No'}</dd>
		</dl>
	</aside>
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

	.demo {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.step-indicator {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		margin-block-end: var(--space-lg);
	}

	.step {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.step__number {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 2rem;
		block-size: 2rem;
		border-radius: var(--radius-full);
		background: var(--color-border);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		font-weight: 700;
	}

	.step--active .step__number {
		background: var(--color-brand);
		color: var(--color-surface);
	}

	.step--done .step__number {
		background: var(--color-success);
		color: var(--color-surface);
	}

	.step__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		display: none;
	}

	@media (min-width: 480px) {
		.step__label {
			display: inline;
		}
	}

	.step__connector {
		flex: 1;
		block-size: 2px;
		background: var(--color-border);
		min-inline-size: 1rem;
	}

	.step__connector--done {
		background: var(--color-success);
	}

	.form-panel {
		padding: var(--space-lg);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		margin-block-end: var(--space-md);
	}

	.form-panel--center {
		text-align: center;
		display: grid;
		justify-items: center;
		gap: var(--space-md);
	}

	.form-panel--success {
		border-color: var(--color-success);
		text-align: center;
	}

	.form-panel--error {
		border-color: var(--color-error);
		text-align: center;
	}

	.success-icon {
		font-size: var(--text-2xl);
		color: var(--color-success);
	}

	.error-icon {
		font-size: var(--text-2xl);
		color: var(--color-error);
	}

	.field {
		display: grid;
		gap: var(--space-xs);
		margin-block-end: var(--space-md);
	}

	.field--checkbox {
		grid-template-columns: auto 1fr;
		align-items: center;
	}

	.field__label {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text);
	}

	.field__input {
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		color: var(--color-text);
	}

	.summary {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-sm) var(--space-md);
		font-size: var(--text-sm);
	}

	.summary dt {
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.form-actions {
		display: flex;
		gap: var(--space-sm);
		justify-content: flex-end;
	}

	.btn {
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		min-inline-size: 44px;
		font-size: var(--text-sm);
		font-weight: 600;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.btn--primary {
		background: var(--color-brand);
		color: var(--color-surface);
	}

	.btn--primary:hover {
		background: var(--color-brand-dim);
	}

	.btn--secondary {
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn--secondary:hover {
		background: var(--color-surface-2);
	}

	.spinner {
		inline-size: 2rem;
		block-size: 2rem;
		border: 3px solid var(--color-border);
		border-block-start-color: var(--color-brand);
		border-radius: var(--radius-full);
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.debugger {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.debug-info {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		font-size: var(--text-sm);
	}

	.debug-info dt {
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.debug-info code {
		font-weight: 700;
		color: var(--color-brand);
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
			border-block-start-color: var(--color-brand);
			opacity: 0.7;
		}
	}
</style>
