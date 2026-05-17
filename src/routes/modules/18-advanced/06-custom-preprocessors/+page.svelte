<script lang="ts">
	let inputCode: string = $state('<section class="hero">\n  <IconStar size={24} />\n  <h1>Welcome</h1>\n  <IconHeart color="red" />\n  <p>Try adding more icons below.</p>\n  <IconSearch />\n</section>');

	let outputCode: string = $derived(simulatePreprocess(inputCode));

	function simulatePreprocess(content: string): string {
		const iconRegex = /<(Icon[A-Z]\w+)/g;
		const icons: string[] = [];
		let match: RegExpExecArray | null;

		while ((match = iconRegex.exec(content)) !== null) {
			if (!icons.includes(match[1])) {
				icons.push(match[1]);
			}
		}

		if (icons.length === 0) return content;

		const imports = icons
			.sort()
			.map((name) => "  import " + name + " from '$lib/icons/" + name + ".svelte';")
			.join('\n');

		return "<script lang=\"ts\">\n" + imports + "\n<\/script>\n\n" + content;
	}
</script>

<svelte:head>
	<title>18.6 — Custom Preprocessors · Advanced Patterns</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 18.6 · Mini-build</p>
		<h1>Custom Preprocessors</h1>
		<p class="lede">
			Build-time transformations that modify your code before the Svelte compiler sees it.
			Auto-imports, analytics injection, custom syntax sugar.
		</p>
	</header>

	<div class="panels">
		<section class="panel" aria-labelledby="input-heading">
			<h2 id="input-heading" class="panel__title">Developer Writes (Input)</h2>
			<label class="sr-only" for="code-input">Source code input</label>
			<textarea
				id="code-input"
				class="panel__code"
				bind:value={inputCode}
				rows={10}
				spellcheck={false}
			></textarea>
			<p class="panel__hint">Try adding <code>&lt;IconBell /&gt;</code> or <code>&lt;IconUser /&gt;</code></p>
		</section>

		<section class="panel panel--output" aria-labelledby="output-heading">
			<h2 id="output-heading" class="panel__title">Compiler Receives (Output)</h2>
			<pre class="panel__code panel__code--readonly"><code>{outputCode}</code></pre>
		</section>
	</div>

	<section class="explanation" aria-labelledby="how-heading">
		<h2 id="how-heading">How It Works</h2>
		<ol class="steps">
			<li>The preprocessor scans markup for <code>&lt;Icon[A-Z]...</code> patterns</li>
			<li>It collects unique icon component names into a Set</li>
			<li>It generates import statements for each detected icon</li>
			<li>It injects the imports into the script block (or creates one)</li>
			<li>The Svelte compiler receives the complete, import-ready code</li>
		</ol>
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

	.panels {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.panels {
			grid-template-columns: 1fr 1fr;
		}
	}

	.panel {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.panel--output {
		border-color: var(--color-brand);
	}

	.panel__title {
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-block-end: var(--space-sm);
	}

	.panel__code {
		inline-size: 100%;
		padding: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: var(--text-sm);
		line-height: 1.6;
		color: var(--color-text);
		resize: vertical;
		min-block-size: 12rem;
	}

	.panel__code--readonly {
		overflow-x: auto;
		white-space: pre;
		margin: 0;
	}

	.panel__hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-block-start: var(--space-xs);
	}

	.explanation {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.steps {
		padding-inline-start: var(--space-md);
		display: grid;
		gap: var(--space-sm);
		font-size: var(--text-sm);
	}

	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
