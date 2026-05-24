<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';

	type BumpType = 'patch' | 'minor' | 'major';

	interface ChangeEntry {
		id: string;
		description: string;
		bumpType: BumpType;
		component: string;
		breakingDetail: string;
	}

	interface VersionResult {
		current: string;
		next: string;
		bumpApplied: BumpType;
		changelog: string;
	}

	const pendingChanges: ChangeEntry[] = [
		{
			id: 'cs-001',
			description: 'Fix Button focus ring not visible in high-contrast mode',
			bumpType: 'patch',
			component: 'Button',
			breakingDetail: ''
		},
		{
			id: 'cs-002',
			description: 'Add loading prop to Card component',
			bumpType: 'minor',
			component: 'Card',
			breakingDetail: ''
		},
		{
			id: 'cs-003',
			description: 'Rename Input "type" prop to "variant"',
			bumpType: 'major',
			component: 'Input',
			breakingDetail: 'The "type" prop has been renamed to "variant". Update all <Input type="..."> usages to <Input variant="...">.'
		},
		{
			id: 'cs-004',
			description: 'Add Tooltip component',
			bumpType: 'minor',
			component: 'Tooltip',
			breakingDetail: ''
		},
		{
			id: 'cs-005',
			description: 'Fix Card padding inconsistency at sm breakpoint',
			bumpType: 'patch',
			component: 'Card',
			breakingDetail: ''
		}
	];

	let selectedBumps: SvelteMap<string, BumpType> = new SvelteMap(
		pendingChanges.map((ch: ChangeEntry) => [ch.id, ch.bumpType])
	);

	function getHighestBump(bumps: Map<string, BumpType>): BumpType {
		const values: BumpType[] = [...bumps.values()];
		if (values.includes('major')) return 'major';
		if (values.includes('minor')) return 'minor';
		return 'patch';
	}

	function incrementVersion(current: string, bump: BumpType): string {
		const parts: number[] = current.split('.').map(Number);
		if (bump === 'major') return `${parts[0] + 1}.0.0`;
		if (bump === 'minor') return `${parts[0]}.${parts[1] + 1}.0`;
		return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
	}

	const currentVersion: string = '1.4.2';

	let versionResult: VersionResult = $derived.by(() => {
		const bump: BumpType = getHighestBump(selectedBumps);
		const next: string = incrementVersion(currentVersion, bump);

		const grouped: Record<BumpType, ChangeEntry[]> = { major: [], minor: [], patch: [] };
		for (const change of pendingChanges) {
			const assignedBump: BumpType = selectedBumps.get(change.id) ?? change.bumpType;
			grouped[assignedBump].push(change);
		}

		let changelog: string = `# ${next}\n\n`;
		if (grouped.major.length > 0) {
			changelog += `## Breaking Changes\n\n`;
			for (const ch of grouped.major) {
				changelog += `- **${ch.component}:** ${ch.description}\n`;
				if (ch.breakingDetail) changelog += `  ${ch.breakingDetail}\n`;
			}
			changelog += '\n';
		}
		if (grouped.minor.length > 0) {
			changelog += `## Features\n\n`;
			for (const ch of grouped.minor) {
				changelog += `- **${ch.component}:** ${ch.description}\n`;
			}
			changelog += '\n';
		}
		if (grouped.patch.length > 0) {
			changelog += `## Bug Fixes\n\n`;
			for (const ch of grouped.patch) {
				changelog += `- **${ch.component}:** ${ch.description}\n`;
			}
			changelog += '\n';
		}

		return { current: currentVersion, next, bumpApplied: bump, changelog };
	});

	const bumpOptions: BumpType[] = ['patch', 'minor', 'major'];

	function handleBumpChange(changeId: string, newBump: BumpType): void {
		selectedBumps.set(changeId, newBump);
	}
</script>

<svelte:head>
	<title>23.6 — Versioning & Changelogs · Design System Engineering</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 23.6 · Mini-build</p>
		<h1>Changeset Simulator</h1>
		<p class="lede">
			Classify each change as patch, minor, or major. Watch the
			version number and changelog update in real time.
		</p>
	</header>

	<div class="version-badge">
		<span class="version-current">{versionResult.current}</span>
		<span class="version-arrow">&#8594;</span>
		<span class="version-next">{versionResult.next}</span>
		<span class="version-bump version-bump--{versionResult.bumpApplied}">
			{versionResult.bumpApplied}
		</span>
	</div>

	<div class="changeset-layout">
		<div class="changes-panel">
			<h2>Pending Changesets</h2>
			{#each pendingChanges as change (change.id)}
				<div class="change-card">
					<div class="change-header">
						<span class="change-component">{change.component}</span>
						<span class="change-id">{change.id}</span>
					</div>
					<p class="change-desc">{change.description}</p>
					{#if change.breakingDetail}
						<p class="change-breaking">{change.breakingDetail}</p>
					{/if}
					<fieldset class="bump-picker">
						<legend class="sr-only">Version bump for {change.id}</legend>
						{#each bumpOptions as bump (bump)}
							<label class="bump-label bump-label--{bump}">
								<input
									type="radio"
									name="bump-{change.id}"
									value={bump}
									checked={selectedBumps.get(change.id) === bump}
									onchange={() => handleBumpChange(change.id, bump)}
								/>
								{bump}
							</label>
						{/each}
					</fieldset>
				</div>
			{/each}
		</div>

		<div class="changelog-panel">
			<h2>Generated Changelog</h2>
			<pre class="changelog-output"><code>{versionResult.changelog}</code></pre>
		</div>
	</div>
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

	.sr-only {
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

	.version-badge {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-surface-2);
		border-radius: var(--radius-lg);
		font-family: ui-monospace, monospace;
	}

	.version-current {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
	}

	.version-arrow {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
	}

	.version-next {
		font-size: var(--text-xl, 1.5rem);
		font-weight: 700;
		color: var(--color-text);
	}

	.version-bump {
		font-size: var(--text-xs);
		font-weight: 700;
		padding: 0.2em 0.6em;
		border-radius: var(--radius-full);
		text-transform: uppercase;
	}

	.version-bump--patch {
		background: oklch(85% 0.1 145);
		color: oklch(30% 0.1 145);
	}

	.version-bump--minor {
		background: oklch(85% 0.12 250);
		color: oklch(30% 0.1 250);
	}

	.version-bump--major {
		background: oklch(85% 0.1 25);
		color: oklch(30% 0.1 25);
	}

	.changeset-layout {
		display: grid;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.changeset-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.changes-panel h2,
	.changelog-panel h2 {
		margin-block-end: var(--space-md);
	}

	.change-card {
		padding: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		margin-block-end: var(--space-sm);
	}

	.change-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-block-end: var(--space-xs);
	}

	.change-component {
		font-weight: 700;
		font-size: var(--text-sm);
		color: var(--color-brand);
	}

	.change-id {
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.change-desc {
		font-size: var(--text-sm);
		margin-block-end: var(--space-sm);
	}

	.change-breaking {
		font-size: var(--text-xs);
		color: oklch(55% 0.2 25);
		padding: var(--space-xs);
		background: oklch(95% 0.03 25);
		border-radius: var(--radius-sm);
		margin-block-end: var(--space-sm);
	}

	.bump-picker {
		display: flex;
		gap: var(--space-sm);
		border: none;
		padding: 0;
	}

	.bump-label {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		text-transform: uppercase;
	}

	.bump-label--patch { color: oklch(45% 0.12 145); }
	.bump-label--minor { color: oklch(45% 0.15 250); }
	.bump-label--major { color: oklch(50% 0.18 25); }

	.changelog-output {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-block-start: 3px solid var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		line-height: 1.6;
		overflow-x: auto;
		white-space: pre-wrap;
		min-block-size: 300px;
	}
</style>
