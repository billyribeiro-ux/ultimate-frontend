<script lang="ts">
	let name: string = $state('');
	let email: string = $state('');
	let result: { success: boolean; error?: string; status?: number } | null = $state(null);

	function simulateAction(): void {
		if (!name || name.length < 2) {
			result = { success: false, error: 'Name must be at least 2 characters', status: 400 };
			return;
		}
		if (!email || !email.includes('@')) {
			result = { success: false, error: 'Invalid email address', status: 400 };
			return;
		}
		result = { success: true };
	}

	let formDataPreview: string = $derived(
		`FormData {\n  name: "${name}"\n  email: "${email}"\n}`
	);

	let testAssertion: string = $derived.by(() => {
		if (!result) return '// Click "Run Test" to execute the action';
		if (result.success) return `expect(result).toEqual({ success: true });\n// PASS`;
		return `expect(result.status).toBe(${result.status});\n// ${result.error}\n// PASS`;
	});
</script>

<svelte:head>
	<title>20.6 — Testing Form Actions · Testing Deep Dive</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 20.6 · Mini-build</p>
		<h1>Form Action Test Simulator</h1>
		<p class="lede">
			Fill out a form, test the action handler, and see how validation
			success and failure map to test assertions.
		</p>
	</header>

	<div class="demo-layout">
		<section class="form-panel" aria-labelledby="form-heading">
			<h2 id="form-heading">Contact Form</h2>
			<form class="form" onsubmit={(e) => { e.preventDefault(); simulateAction(); }}>
				<label class="field">
					<span class="field__label">Name</span>
					<input type="text" class="field__input" bind:value={name} placeholder="Ada Lovelace" />
				</label>
				<label class="field">
					<span class="field__label">Email</span>
					<input type="email" class="field__input" bind:value={email} placeholder="ada@example.com" />
				</label>
				<button type="submit" class="btn btn--primary">Run Test</button>
			</form>
			{#if result}
				<div class="result" class:result--success={result.success} class:result--error={!result.success}>
					{#if result.success}
						<p>Action returned: <code>{'{ success: true }'}</code></p>
					{:else}
						<p>Action returned: <code>fail({result.status}, {'{ error: "' + result.error + '" }'})</code></p>
					{/if}
				</div>
			{/if}
		</section>

		<section class="test-panel" aria-labelledby="test-heading">
			<h2 id="test-heading">Test Output</h2>
			<h3 class="sub-heading">Constructed FormData</h3>
			<pre class="code-block"><code>{formDataPreview}</code></pre>
			<h3 class="sub-heading">Assertion</h3>
			<pre class="code-block"><code>{testAssertion}</code></pre>
		</section>
	</div>

	<section class="quick-tests" aria-labelledby="quick-heading">
		<h2 id="quick-heading">Quick Test Cases</h2>
		<div class="quick-buttons">
			<button class="btn" onclick={() => { name = 'Ada'; email = 'ada@example.com'; simulateAction(); }}>Valid input</button>
			<button class="btn" onclick={() => { name = 'A'; email = 'ada@example.com'; simulateAction(); }}>Short name</button>
			<button class="btn" onclick={() => { name = 'Ada'; email = 'not-email'; simulateAction(); }}>Invalid email</button>
			<button class="btn" onclick={() => { name = ''; email = ''; simulateAction(); }}>Empty fields</button>
		</div>
	</section>
</section>

<style>
	.eyebrow { font-size: var(--text-sm); color: var(--color-brand); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
	.lede { font-size: var(--text-lg); color: var(--color-text-muted); max-inline-size: 50ch; }
	.demo-layout { display: grid; gap: var(--space-md); }
	@media (min-width: 768px) { .demo-layout { grid-template-columns: 1fr 1fr; } }
	.form-panel, .test-panel, .quick-tests { padding: var(--space-lg); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.form { display: grid; gap: var(--space-md); }
	.field { display: grid; gap: var(--space-xs); }
	.field__label { font-size: var(--text-xs); font-weight: 600; color: var(--color-text-muted); }
	.field__input { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); font-size: var(--text-sm); min-block-size: 44px; }
	.btn { padding: var(--space-xs) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600; min-block-size: 44px; transition: border-color var(--dur-fast) var(--ease-out); }
	.btn:hover { border-color: var(--color-brand); }
	.btn--primary { background: var(--color-brand); color: oklch(100% 0 0); border-color: var(--color-brand); }
	.btn--primary:hover { background: var(--color-brand-dim); }
	.result { padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); margin-block-start: var(--space-md); font-size: var(--text-sm); }
	.result--success { background: oklch(90% 0.05 145 / 0.2); border: 1px solid var(--color-success); }
	.result--error { background: oklch(90% 0.05 25 / 0.2); border: 1px solid var(--color-error); }
	.sub-heading { font-size: var(--text-xs); font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-block-start: var(--space-md); }
	.code-block { background: var(--color-surface); padding: var(--space-md); border-radius: var(--radius-md); overflow-x: auto; font-size: var(--text-xs); line-height: 1.6; white-space: pre; margin-block-start: var(--space-xs); }
	.quick-buttons { display: flex; gap: var(--space-xs); flex-wrap: wrap; margin-block-start: var(--space-md); }
</style>
