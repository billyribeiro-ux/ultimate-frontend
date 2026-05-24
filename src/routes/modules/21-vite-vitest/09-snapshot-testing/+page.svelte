<script lang="ts">
	let expectedSnapshot: string = $state(
`<div class="product-card">
  <h3>Widget</h3>
  <p class="price">$42.00</p>
  <span class="badge badge--in-stock">In Stock</span>
</div>`
	);

	let receivedOutput: string = $state(
`<div class="product-card">
  <h3>Widget</h3>
  <p class="price">$42.00</p>
  <span class="badge badge--in-stock">In Stock</span>
</div>`
	);

	interface DiffLine {
		lineNumber: number;
		text: string;
		diffType: 'unchanged' | 'added' | 'removed';
	}

	let diffLines: DiffLine[] = $derived.by(() => {
		const expectedLines: string[] = expectedSnapshot.split('\n');
		const receivedLines: string[] = receivedOutput.split('\n');
		const maxLen: number = Math.max(expectedLines.length, receivedLines.length);
		const lines: DiffLine[] = [];

		for (let i: number = 0; i < maxLen; i++) {
			const exp: string = expectedLines[i] ?? '';
			const rec: string = receivedLines[i] ?? '';

			if (i >= receivedLines.length) {
				lines.push({ lineNumber: i + 1, text: exp, diffType: 'removed' });
			} else if (i >= expectedLines.length) {
				lines.push({ lineNumber: i + 1, text: rec, diffType: 'added' });
			} else if (exp !== rec) {
				lines.push({ lineNumber: i + 1, text: exp, diffType: 'removed' });
				lines.push({ lineNumber: i + 1, text: rec, diffType: 'added' });
			} else {
				lines.push({ lineNumber: i + 1, text: exp, diffType: 'unchanged' });
			}
		}

		return lines;
	});

	let isMatch: boolean = $derived(expectedSnapshot === receivedOutput);

	function updateSnapshot(): void {
		expectedSnapshot = receivedOutput;
	}

	function introduceChange(): void {
		receivedOutput = receivedOutput.replace('$42.00', '$42');
	}

	function resetReceived(): void {
		receivedOutput = expectedSnapshot;
	}
</script>

<svelte:head>
	<title>21.9 — Snapshot Testing · Vite, Vitest & The Svelte Playground</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 21.9 · Mini-build</p>
		<h1>Snapshot Comparison Viewer</h1>
		<p class="lede">
			Edit the "received" output and see how snapshot diffs are computed.
			Additions are highlighted in green, deletions in red.
		</p>
	</header>

	<div class="status-bar" aria-live="polite">
		{#if isMatch}
			<span class="status status--pass">Snapshot matches</span>
		{:else}
			<span class="status status--fail">Snapshot outdated - differences detected</span>
		{/if}
		<div class="status-actions">
			<button type="button" class="btn" onclick={introduceChange}>
				Simulate Change
			</button>
			<button type="button" class="btn" onclick={resetReceived}>
				Reset
			</button>
			{#if !isMatch}
				<button type="button" class="btn btn--update" onclick={updateSnapshot}>
					vitest --update
				</button>
			{/if}
		</div>
	</div>

	<div class="editor-layout">
		<section class="editor-panel" aria-labelledby="expected-heading">
			<h2 id="expected-heading">Expected (Snapshot)</h2>
			<pre class="code-block"><code>{expectedSnapshot}</code></pre>
		</section>

		<section class="editor-panel" aria-labelledby="received-heading">
			<h2 id="received-heading">Received (Current Output)</h2>
			<textarea
				class="code-editor"
				bind:value={receivedOutput}
				spellcheck="false"
				aria-label="Edit received output"
			></textarea>
		</section>
	</div>

	<section class="diff-section" aria-labelledby="diff-heading">
		<h2 id="diff-heading">Diff</h2>
		<pre class="diff-block">
			{#each diffLines as line (line.lineNumber + line.text + line.diffType)}
				<span
					class="diff-line"
					class:diff-line--added={line.diffType === 'added'}
					class:diff-line--removed={line.diffType === 'removed'}
				>{line.diffType === 'added' ? '+' : line.diffType === 'removed' ? '-' : ' '} {line.text}
</span>
			{/each}
		</pre>
	</section>
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

	.status-bar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.status {
		font-size: var(--text-sm);
		font-weight: 700;
	}

	.status--pass { color: var(--color-success); }
	.status--fail { color: var(--color-error); }

	.status-actions {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.btn {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.btn:hover {
		border-color: var(--color-brand);
	}

	.btn--update {
		border-color: var(--color-warning);
		color: var(--color-warning);
	}

	.editor-layout {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.editor-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.editor-panel h2 {
		font-size: var(--text-sm);
		font-weight: 600;
		margin-block-end: var(--space-xs);
	}

	.code-block {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		overflow-x: auto;
		white-space: pre;
		margin: 0;
	}

	.code-editor {
		inline-size: 100%;
		min-block-size: 12rem;
		padding: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		resize: vertical;
		white-space: pre;
		tab-size: 2;
	}

	.diff-section h2 {
		font-size: var(--text-sm);
		font-weight: 600;
		margin-block-end: var(--space-xs);
	}

	.diff-block {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		margin: 0;
		overflow-x: auto;
	}

	.diff-line {
		display: block;
	}

	.diff-line--added {
		background: color-mix(in oklch, var(--color-success) 15%, transparent);
		color: var(--color-success);
	}

	.diff-line--removed {
		background: color-mix(in oklch, var(--color-error) 15%, transparent);
		color: var(--color-error);
	}
</style>
