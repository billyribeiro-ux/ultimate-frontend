<script lang="ts">
	import { DEFAULT_SOURCE, extractStyleBlock } from './playground-data';

	let sourceCode: string = $state(DEFAULT_SOURCE);

	type OutputTab = 'js' | 'css' | 'ast';
	let activeTab: OutputTab = $state('js');

	let jsOutput: string = $derived.by(() => {
		try {
			const lines: string[] = [];
			lines.push('// Compiled output (simulated)');
			lines.push("import { template, text, append } from 'svelte/internal/client';");
			lines.push('');

			if (sourceCode.includes('$state')) {
				lines.push("import { source, get, set } from 'svelte/internal/client';");
				lines.push('');
			}

			lines.push('const root = template(`<button> </button>`);');
			lines.push('');
			lines.push('export default function Component($$anchor) {');

			if (sourceCode.includes('$state(')) {
				const stateMatch: RegExpMatchArray | null = sourceCode.match(/\$state\(([^)]*)\)/);
				const initialValue: string = stateMatch ? stateMatch[1] : '0';
				lines.push(`  let count = source(${initialValue});`);
				lines.push('');
				lines.push('  function increment() {');
				lines.push('    set(count, get(count) + 1);');
				lines.push('  }');
			}

			lines.push('');
			lines.push('  const button = root();');
			lines.push('  const text_node = button.firstChild;');
			lines.push('');
			lines.push('  button.addEventListener("click", increment);');
			lines.push('  text_node.data = `Clicks: ${get(count)}`;');
			lines.push('');
			lines.push('  append($$anchor, button);');
			lines.push('}');

			return lines.join('\n');
		} catch {
			return '// Compilation error — check your Svelte source';
		}
	});

	let cssOutput: string = $derived.by(() => {
		const rawCss: string | null = extractStyleBlock(sourceCode);
		if (rawCss === null) return '/* No style block found */';
		const hash: string = 'svelte-1a2b3c';

		return rawCss
			.replace(/([a-zA-Z.#][^{]*)\{/g, (match: string, selector: string) => {
				return `${selector.trim()}.${hash} {`;
			})
			.trim() + `\n\n/* Scoped with hash: ${hash} */`;
	});

	let astOutput: string = $derived.by(() => {
		return JSON.stringify({
			type: 'Root',
			html: {
				type: 'Fragment',
				children: [
					{
						type: 'Element',
						name: 'button',
						attributes: [
							{ type: 'EventHandler', name: 'click' }
						],
						children: [
							{ type: 'Text', data: 'Clicks: ' },
							{ type: 'MustacheTag', expression: 'count' }
						]
					}
				]
			},
			instance: {
				type: 'Script',
				content: '...'
			},
			css: {
				type: 'Style',
				content: '...'
			}
		}, null, 2);
	});

	let currentOutput: string = $derived(
		activeTab === 'js' ? jsOutput
		: activeTab === 'css' ? cssOutput
		: astOutput
	);
</script>

<svelte:head>
	<title>21.10 — The Svelte Playground · Vite, Vitest & The Svelte Playground</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 21.10 · Mini-build</p>
		<h1>Simplified Svelte REPL</h1>
		<p class="lede">
			Type Svelte source code and see the simulated compiled output.
			For the full experience, visit
			<a href="https://svelte.dev/playground" target="_blank" rel="noopener">
				svelte.dev/playground
			</a>.
		</p>
	</header>

	<div class="repl-layout">
		<section class="editor-section" aria-labelledby="source-heading">
			<h2 id="source-heading">Source (App.svelte)</h2>
			<textarea
				class="source-editor"
				bind:value={sourceCode}
				spellcheck="false"
				aria-label="Svelte source code editor"
			></textarea>
		</section>

		<section class="output-section" aria-labelledby="output-heading">
			<div class="output-tabs" role="tablist" aria-label="Output tabs">
				<button
					type="button"
					role="tab"
					class="output-tab"
					class:output-tab--active={activeTab === 'js'}
					aria-selected={activeTab === 'js'}
					onclick={() => { activeTab = 'js'; }}
				>
					JS Output
				</button>
				<button
					type="button"
					role="tab"
					class="output-tab"
					class:output-tab--active={activeTab === 'css'}
					aria-selected={activeTab === 'css'}
					onclick={() => { activeTab = 'css'; }}
				>
					CSS Output
				</button>
				<button
					type="button"
					role="tab"
					class="output-tab"
					class:output-tab--active={activeTab === 'ast'}
					aria-selected={activeTab === 'ast'}
					onclick={() => { activeTab = 'ast'; }}
				>
					AST
				</button>
			</div>
			<h2 id="output-heading" class="visually-hidden">Compiled Output</h2>
			<div class="output-code" role="tabpanel"><pre><code>{currentOutput}</code></pre></div>
		</section>
	</div>

	<article class="playground-link-card">
		<h2>Try the Official Svelte Playground</h2>
		<p>
			The official playground at svelte.dev/playground runs the real Svelte compiler
			in your browser. It supports multiple files, live preview, and shareable URLs.
		</p>
		<a
			href="https://svelte.dev/playground"
			target="_blank"
			rel="noopener"
			class="playground-btn"
		>
			Open Svelte Playground
		</a>
	</article>
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

	.lede a {
		color: var(--color-brand);
	}

	.repl-layout {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.repl-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.editor-section h2, .output-section h2 {
		font-size: var(--text-sm);
		font-weight: 600;
		margin-block-end: var(--space-xs);
	}

	.visually-hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.source-editor {
		inline-size: 100%;
		min-block-size: 20rem;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		resize: vertical;
		white-space: pre;
		tab-size: 2;
		line-height: 1.6;
	}

	.output-tabs {
		display: flex;
		gap: var(--space-xs);
		margin-block-end: var(--space-xs);
	}

	.output-tab {
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.output-tab--active {
		border-color: var(--color-brand);
		border-block-end: 2px solid var(--color-brand);
	}

	.output-code {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		min-block-size: 18rem;
	}

	.output-code pre {
		padding: var(--space-md);
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		overflow-x: auto;
		white-space: pre;
		margin: 0;
		line-height: 1.6;
	}

	.playground-link-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
	}

	.playground-link-card h2 {
		font-size: var(--text-lg);
	}

	.playground-link-card p {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.playground-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-sm) var(--space-lg);
		border: 2px solid var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--color-brand);
		text-decoration: none;
		min-block-size: 44px;
		transition: background var(--dur-fast) var(--ease-out);
		justify-self: start;
	}

	.playground-btn:hover {
		background: var(--color-surface);
	}
</style>
