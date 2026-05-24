<script lang="ts">
	type AdapterName = 'node' | 'vercel' | 'cloudflare' | 'netlify' | 'static';

	interface AdapterInfo {
		id: AdapterName;
		label: string;
		outputDescription: string;
		coldStart: string;
		runtime: string;
		configSnippet: string;
		features: string[];
	}

	const adapters: AdapterInfo[] = [
		{
			id: 'node',
			label: 'adapter-node',
			outputDescription: 'Standalone Node.js server with handler.js entry point',
			coldStart: 'None — always running',
			runtime: 'Full Node.js',
			configSnippet: `import adapter from '@sveltejs/adapter-node';\n\nexport default {\n  kit: {\n    adapter: adapter({\n      out: 'build',\n      precompress: true\n    })\n  }\n};`,
			features: ['Full Node.js API', 'WebSockets', 'File system access', 'Graceful shutdown', 'Docker-ready']
		},
		{
			id: 'vercel',
			label: 'adapter-vercel',
			outputDescription: 'Serverless and edge functions in .vercel/output',
			coldStart: '~250ms (serverless), ~0ms (edge)',
			runtime: 'Node.js or V8 isolate',
			configSnippet: `import adapter from '@sveltejs/adapter-vercel';\n\nexport default {\n  kit: {\n    adapter: adapter({\n      runtime: 'nodejs22.x',\n      regions: ['iad1']\n    })\n  }\n};`,
			features: ['ISR', 'Edge Functions', 'Image optimization', 'Analytics', 'Preview deployments']
		},
		{
			id: 'cloudflare',
			label: 'adapter-cloudflare',
			outputDescription: 'Single Workers script for 300+ edge locations',
			coldStart: '~0ms (V8 isolates)',
			runtime: 'V8 isolate (not Node.js)',
			configSnippet: `import adapter from '@sveltejs/adapter-cloudflare';\n\nexport default {\n  kit: {\n    adapter: adapter({\n      routes: { include: ['/*'], exclude: ['<all>'] }\n    })\n  }\n};`,
			features: ['KV storage', 'D1 database', 'R2 object storage', 'Durable Objects', '300+ edge locations']
		},
		{
			id: 'netlify',
			label: 'adapter-netlify',
			outputDescription: 'Netlify Functions in .netlify/functions-internal',
			coldStart: '~250ms (serverless)',
			runtime: 'Node.js or Deno',
			configSnippet: `import adapter from '@sveltejs/adapter-netlify';\n\nexport default {\n  kit: {\n    adapter: adapter({\n      edge: false,\n      split: false\n    })\n  }\n};`,
			features: ['Edge functions', 'Form handling', 'Identity', 'Preview deploys', 'Split testing']
		},
		{
			id: 'static',
			label: 'adapter-static',
			outputDescription: 'Plain HTML/CSS/JS files — no server runtime',
			coldStart: 'N/A — no server',
			runtime: 'None',
			configSnippet: `import adapter from '@sveltejs/adapter-static';\n\nexport default {\n  kit: {\n    adapter: adapter({\n      pages: 'build',\n      assets: 'build',\n      fallback: '404.html',\n      precompress: true\n    })\n  }\n};`,
			features: ['Zero server cost', 'CDN-ready', 'Maximum cacheability', 'Simplest deployment']
		}
	];

	let selectedAdapter: AdapterName = $state('node');

	let currentAdapter: AdapterInfo = $derived(
		adapters.find((a: AdapterInfo) => a.id === selectedAdapter) ?? adapters[0]
	);
</script>

<svelte:head>
	<title>22.1 — Adapter Deep Dive · DevOps & Edge Deployment</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 22.1 · Mini-build</p>
		<h1>Adapter Comparison Dashboard</h1>
		<p class="lede">
			Select a SvelteKit adapter to explore its output format, runtime,
			configuration, and platform features.
		</p>
	</header>

	<div class="adapter-grid">
		{#each adapters as adapter (adapter.id)}
			<button
				type="button"
				class="adapter-card"
				class:adapter-card--active={adapter.id === selectedAdapter}
				onclick={() => { selectedAdapter = adapter.id; }}
			>
				<span class="adapter-card__label">{adapter.label}</span>
				<span class="adapter-card__runtime">{adapter.runtime}</span>
			</button>
		{/each}
	</div>

	<article class="detail-panel" aria-live="polite">
		<h2 class="detail-panel__title">{currentAdapter.label}</h2>

		<dl class="detail-panel__info">
			<dt>Output</dt>
			<dd>{currentAdapter.outputDescription}</dd>
			<dt>Cold Start</dt>
			<dd>{currentAdapter.coldStart}</dd>
			<dt>Runtime</dt>
			<dd>{currentAdapter.runtime}</dd>
		</dl>

		<section class="detail-panel__features">
			<h3>Platform Features</h3>
			<ul>
				{#each currentAdapter.features as feature (feature)}
					<li>{feature}</li>
				{/each}
			</ul>
		</section>

		<section class="detail-panel__config">
			<h3>svelte.config.js</h3>
			<pre><code>{currentAdapter.configSnippet}</code></pre>
		</section>
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

	.adapter-grid {
		display: grid;
		gap: var(--space-sm);
		grid-template-columns: 1fr;
	}

	@media (min-width: 768px) {
		.adapter-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.adapter-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-align: start;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.adapter-card:hover {
		border-color: var(--color-brand);
	}

	.adapter-card--active {
		border-color: var(--color-brand);
		border-inline-start-width: 4px;
		box-shadow: var(--shadow-md);
	}

	.adapter-card__label {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text);
	}

	.adapter-card__runtime {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.detail-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	.detail-panel__title {
		font-size: var(--text-xl);
		margin-block-end: var(--space-md);
	}

	.detail-panel__info {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		margin-block-end: var(--space-md);
	}

	.detail-panel__info dt {
		font-weight: 600;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.detail-panel__info dd {
		margin: 0;
		font-size: var(--text-base);
	}

	.detail-panel__features ul {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.detail-panel__features li {
		background: var(--color-surface-2);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: 500;
	}

	.detail-panel__config pre {
		background: var(--color-surface-2);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		overflow-x: auto;
		font-size: var(--text-sm);
		line-height: 1.6;
	}

	h3 {
		margin-block: var(--space-md) var(--space-sm);
	}
</style>
