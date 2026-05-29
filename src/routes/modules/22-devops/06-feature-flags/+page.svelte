<script lang="ts">
	interface Flag {
		id: string;
		label: string;
		description: string;
		enabled: boolean;
		rolloutPercentage: number;
		source: 'cookie' | 'url-param' | 'percentage';
	}

	let flags: Flag[] = $state([
		{ id: 'new-header', label: 'New Header Design', description: 'Updated header with search and notifications', enabled: false, rolloutPercentage: 100, source: 'cookie' },
		{ id: 'dark-mode-beta', label: 'Dark Mode Beta', description: 'Enable dark mode toggle in settings', enabled: false, rolloutPercentage: 30, source: 'percentage' },
		{ id: 'analytics-v2', label: 'Analytics V2', description: 'New analytics tracking with enhanced events', enabled: true, rolloutPercentage: 100, source: 'cookie' },
		{ id: 'experimental-cache', label: 'Experimental Cache', description: 'Edge caching for API responses', enabled: false, rolloutPercentage: 10, source: 'percentage' }
	]);

	// Generate 20 simulated users for rollout visualization
	interface SimulatedUser {
		id: string;
		name: string;
		hash: number;
	}

	const simulatedUsers: SimulatedUser[] = Array.from({ length: 20 }, (_: unknown, i: number) => {
		const userId: string = `user-${String(i + 1).padStart(3, '0')}`;
		let hash: number = 0;
		for (let c: number = 0; c < userId.length; c++) {
			hash = ((hash << 5) - hash + userId.charCodeAt(c)) | 0;
		}
		return {
			id: userId,
			name: `User ${i + 1}`,
			hash: Math.abs(hash) % 100
		};
	});

	let selectedFlagIndex: number = $state(0);

	let selectedFlag: Flag = $derived(flags[selectedFlagIndex]);

	let usersInRollout: Set<string> = $derived(
		new Set(
			simulatedUsers
				.filter((u: SimulatedUser) => u.hash < selectedFlag.rolloutPercentage)
				.map((u: SimulatedUser) => u.id)
		)
	);

	let enabledCount: number = $derived(
		flags.filter((f: Flag) => f.enabled).length
	);

	function toggleFlag(index: number): void {
		flags[index].enabled = !flags[index].enabled;
	}

	function updateRollout(index: number, percentage: number): void {
		flags[index].rolloutPercentage = percentage;
	}
</script>

<svelte:head>
	<title>22.6 — Feature Flags · DevOps & Edge Deployment</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 22.6 · Mini-build</p>
		<h1>Feature Flag Dashboard</h1>
		<p class="lede">
			Toggle flags, adjust rollout percentages, and see the simulated effect
			on a user population.
		</p>
	</header>

	<p class="summary">{enabledCount} of {flags.length} flags enabled</p>

	<div class="flag-list">
		{#each flags as flag, index (flag.id)}
			<div
				class="flag-card"
				class:flag-card--enabled={flag.enabled}
				role="button"
				tabindex="0"
				onclick={() => { selectedFlagIndex = index; }}
				onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') selectedFlagIndex = index; }}
			>
				<div class="flag-card__header">
					<span class="flag-card__label">{flag.label}</span>
					<button
						type="button"
						class="toggle-switch"
						class:toggle-switch--on={flag.enabled}
						onclick={(e: MouseEvent) => { e.stopPropagation(); toggleFlag(index); }}
						aria-label="Toggle {flag.label}"
					>
						<span class="toggle-switch__thumb"></span>
					</button>
				</div>
				<p class="flag-card__desc">{flag.description}</p>
				<div class="flag-card__meta">
					<span class="flag-card__source">{flag.source}</span>
					<span class="flag-card__rollout">{flag.rolloutPercentage}%</span>
				</div>
				{#if selectedFlagIndex === index}
					<label class="rollout-control">
						<span>Rollout: {flag.rolloutPercentage}%</span>
						<input
							type="range"
							onclick={(e: MouseEvent) => e.stopPropagation()}
							min="0"
							max="100"
							value={flag.rolloutPercentage}
							oninput={(e: Event) => updateRollout(index, parseInt((e.target as HTMLInputElement).value, 10))}
						/>
					</label>
				{/if}
			</div>
		{/each}
	</div>

	<section class="user-grid-section">
		<h2>Simulated Users — {selectedFlag.label} ({selectedFlag.rolloutPercentage}%)</h2>
		<div class="user-grid">
			{#each simulatedUsers as user (user.id)}
				<div
					class="user-dot"
					class:user-dot--active={usersInRollout.has(user.id)}
					title="{user.name} (hash: {user.hash})"
				>
					<span class="user-dot__label">{user.name.split(' ')[1]}</span>
				</div>
			{/each}
		</div>
		<p class="user-grid__count">{usersInRollout.size} of {simulatedUsers.length} users would see this feature</p>
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

	.summary {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.flag-list {
		display: grid;
		gap: var(--space-sm);
	}

	.flag-card {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-border);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.flag-card--enabled {
		border-inline-start-color: var(--color-success);
	}

	.flag-card__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.flag-card__label {
		font-weight: 600;
		font-size: var(--text-base);
	}

	.toggle-switch {
		position: relative;
		inline-size: 48px;
		block-size: 28px;
		border-radius: var(--radius-full);
		background: var(--color-text-muted);
		padding: 2px;
		transition: background var(--dur-fast) var(--ease-out);
		min-block-size: 28px;
	}

	.toggle-switch--on {
		background: var(--color-brand);
	}

	.toggle-switch__thumb {
		display: block;
		inline-size: 24px;
		block-size: 24px;
		border-radius: var(--radius-full);
		background: oklch(100% 0 0);
		transition: transform var(--dur-fast) var(--ease-out);
	}

	.toggle-switch--on .toggle-switch__thumb {
		transform: translateX(20px);
	}

	.flag-card__desc {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-start: var(--space-xs);
	}

	.flag-card__meta {
		display: flex;
		gap: var(--space-sm);
		margin-block-start: var(--space-xs);
	}

	.flag-card__source, .flag-card__rollout {
		font-size: var(--text-xs);
		padding: 2px var(--space-xs);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
	}

	.rollout-control {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-block-start: var(--space-sm);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.rollout-control input {
		flex: 1;
	}

	.user-grid-section {
		margin-block-start: var(--space-md);
	}

	.user-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
		gap: var(--space-xs);
		margin-block-start: var(--space-sm);
	}

	.user-dot {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		border: 2px solid var(--color-border);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--color-text-muted);
		transition: background var(--dur-fast) var(--ease-out);
	}

	.user-dot--active {
		background: var(--color-brand);
		border-color: var(--color-brand);
		color: oklch(100% 0 0);
	}

	.user-grid__count {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-start: var(--space-sm);
	}
</style>
