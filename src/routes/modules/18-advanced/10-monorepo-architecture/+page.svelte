<script lang="ts">
	interface WorkspacePackage {
		name: string;
		type: 'app' | 'library' | 'config';
		dependencies: string[];
	}

	let packages: WorkspacePackage[] = $state([
		{ name: '@acme/tsconfig', type: 'config', dependencies: [] },
		{ name: '@acme/tokens', type: 'config', dependencies: [] },
		{ name: '@acme/utils', type: 'library', dependencies: ['@acme/tsconfig'] },
		{ name: '@acme/ui', type: 'library', dependencies: ['@acme/tokens', '@acme/utils', '@acme/tsconfig'] },
		{ name: '@acme/marketing', type: 'app', dependencies: ['@acme/ui', '@acme/tokens', '@acme/tsconfig'] },
		{ name: '@acme/dashboard', type: 'app', dependencies: ['@acme/ui', '@acme/utils', '@acme/tokens', '@acme/tsconfig'] }
	]);

	let selected: string | null = $state(null);

	let highlighted: Set<string> = $derived.by(() => {
		if (!selected) return new Set<string>();
		const result = new Set<string>([selected]);
		const pkg = packages.find((p) => p.name === selected);
		if (pkg) {
			for (const dep of pkg.dependencies) {
				result.add(dep);
			}
		}
		for (const p of packages) {
			if (p.dependencies.includes(selected)) {
				result.add(p.name);
			}
		}
		return result;
	});

	let selectedPkg: WorkspacePackage | undefined = $derived(
		packages.find((p) => p.name === selected)
	);

	function getTypeColor(type: WorkspacePackage['type']): string {
		switch (type) {
			case 'app': return 'var(--color-brand)';
			case 'library': return 'var(--color-success)';
			case 'config': return 'var(--color-warning)';
		}
	}

	function selectPackage(name: string): void {
		selected = selected === name ? null : name;
	}
</script>

<svelte:head>
	<title>18.10 — Monorepo Architecture · Advanced Patterns</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 18.10 · Mini-build</p>
		<h1>Monorepo Architecture</h1>
		<p class="lede">
			Organize multiple SvelteKit apps and shared packages in a single
			repository with pnpm workspaces and TypeScript project references.
		</p>
	</header>

	<div class="workspace-layout">
		<section class="graph" aria-labelledby="graph-heading">
			<h2 id="graph-heading">Workspace Packages</h2>
			<div class="package-grid">
				{#each packages as pkg (pkg.name)}
					<button
						class="package-card"
						class:package-card--selected={selected === pkg.name}
						class:package-card--highlighted={highlighted.has(pkg.name)}
						class:package-card--dimmed={selected !== null && !highlighted.has(pkg.name)}
						onclick={() => selectPackage(pkg.name)}
					>
						<span class="package-card__type" style="color: {getTypeColor(pkg.type)}">
							{pkg.type}
						</span>
						<span class="package-card__name">{pkg.name}</span>
						<span class="package-card__deps">
							{pkg.dependencies.length} dep{pkg.dependencies.length === 1 ? '' : 's'}
						</span>
					</button>
				{/each}
			</div>
		</section>

		<section class="details" aria-labelledby="details-heading">
			<h2 id="details-heading">Package Details</h2>
			{#if selectedPkg}
				<div class="detail-card">
					<h3 class="detail-card__name">{selectedPkg.name}</h3>
					<dl class="detail-list">
						<dt>Type</dt>
						<dd style="color: {getTypeColor(selectedPkg.type)}">{selectedPkg.type}</dd>
						<dt>Dependencies</dt>
						<dd>
							{#if selectedPkg.dependencies.length > 0}
								<ul class="dep-list">
									{#each selectedPkg.dependencies as dep}
										<li>{dep}</li>
									{/each}
								</ul>
							{:else}
								<em>None (leaf package)</em>
							{/if}
						</dd>
						<dt>Dependents</dt>
						<dd>
							{@const dependents = packages.filter(p => p.dependencies.includes(selectedPkg!.name))}
							{#if dependents.length > 0}
								<ul class="dep-list">
									{#each dependents as dep}
										<li>{dep.name}</li>
									{/each}
								</ul>
							{:else}
								<em>None (top-level)</em>
							{/if}
						</dd>
					</dl>
					<div class="package-json">
						<h4>package.json (excerpt)</h4>
						<pre><code>{JSON.stringify({
	name: selectedPkg.name,
	dependencies: Object.fromEntries(
		selectedPkg.dependencies.map(d => [d, 'workspace:*'])
	)
}, null, 2)}</code></pre>
					</div>
				</div>
			{:else}
				<p class="placeholder">Click a package to see its details and dependency configuration.</p>
			{/if}
		</section>
	</div>

	<section class="explanation" aria-labelledby="how-heading">
		<h2 id="how-heading">Key Concepts</h2>
		<ol class="steps">
			<li><strong>pnpm workspaces</strong> — symlink local packages, no publishing needed</li>
			<li><strong>workspace:*</strong> — protocol that resolves to the local version</li>
			<li><strong>TypeScript project references</strong> — cross-package type resolution</li>
			<li><strong>Layered dependencies</strong> — config at bottom, apps at top, no cycles</li>
			<li><strong>Turborepo caching</strong> — only rebuild packages that actually changed</li>
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

	.workspace-layout {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.workspace-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.graph, .details {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.package-grid {
		display: grid;
		gap: var(--space-sm);
		margin-block-start: var(--space-md);
	}

	.package-card {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		text-align: start;
		min-block-size: 44px;
		transition:
			border-color var(--dur-fast) var(--ease-out),
			opacity var(--dur-fast) var(--ease-out);
	}

	.package-card:hover {
		border-color: var(--color-brand);
	}

	.package-card--selected {
		border-color: var(--color-brand);
		background: var(--color-surface-2);
	}

	.package-card--highlighted:not(.package-card--selected) {
		border-color: var(--color-brand-dim);
	}

	.package-card--dimmed {
		opacity: 0.4;
	}

	.package-card__type {
		font-size: var(--text-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		min-inline-size: 4rem;
	}

	.package-card__name {
		font-weight: 600;
		font-size: var(--text-sm);
	}

	.package-card__deps {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.detail-card {
		margin-block-start: var(--space-md);
	}

	.detail-card__name {
		font-size: var(--text-lg);
		margin-block-end: var(--space-md);
	}

	.detail-list {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		font-size: var(--text-sm);
		margin-block-end: var(--space-md);
	}

	.detail-list dt {
		font-weight: 700;
		color: var(--color-text-muted);
	}

	.dep-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.dep-list li {
		font-size: var(--text-xs);
		background: var(--color-surface);
		padding: 0.15em 0.5em;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
	}

	.package-json {
		margin-block-start: var(--space-md);
	}

	.package-json h4 {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-block-end: var(--space-xs);
	}

	.package-json pre {
		background: var(--color-surface);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		font-size: var(--text-xs);
		overflow-x: auto;
		border: 1px solid var(--color-border);
	}

	.placeholder {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-start: var(--space-md);
		font-style: italic;
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
</style>
