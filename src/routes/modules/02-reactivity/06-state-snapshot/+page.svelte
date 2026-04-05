<script lang="ts">
	interface Profile {
		name: string;
		email: string;
		tags: string[];
	}

	const profile: Profile = $state({
		name: 'Ada Lovelace',
		email: 'ada@example.org',
		tags: ['svelte', 'typescript']
	});

	let serialized: string = $state('');
	let importError: string = $state('');

	function exportToJson(): void {
		const plain = $state.snapshot(profile);
		serialized = JSON.stringify(plain, null, 2);
		importError = '';
	}

	function importFromJson(): void {
		importError = '';
		try {
			const parsed: unknown = JSON.parse(serialized);
			if (
				typeof parsed === 'object' &&
				parsed !== null &&
				'name' in parsed &&
				'email' in parsed &&
				'tags' in parsed
			) {
				const p = parsed as Profile;
				profile.name = p.name;
				profile.email = p.email;
				profile.tags = [...p.tags];
			} else {
				importError = 'JSON does not match Profile shape.';
			}
		} catch (err) {
			importError = err instanceof Error ? err.message : 'Invalid JSON';
		}
	}

	function logBoth(): void {
		console.log('Proxy:', profile);
		console.log('Snapshot:', $state.snapshot(profile));
	}
</script>

<svelte:head>
	<title>Lesson 2.6 · $state.snapshot · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.6 mini-build: export and import a reactive profile using $state.snapshot and JSON."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.6 · Mini-build</p>
		<h1>Snapshot, stringify, import</h1>
		<p class="lede">
			The textarea holds a plain-JS copy produced by <code>$state.snapshot</code>. Edit it
			and click Import to restore.
		</p>
	</header>

	<form class="panel" onsubmit={(e) => e.preventDefault()}>
		<label>
			<span>Name</span>
			<input type="text" bind:value={profile.name} />
		</label>
		<label>
			<span>Email</span>
			<input type="email" bind:value={profile.email} />
		</label>
	</form>

	<div class="actions">
		<button type="button" onclick={exportToJson}>Export → JSON</button>
		<button type="button" onclick={importFromJson}>Import ← JSON</button>
		<button type="button" onclick={logBoth}>console.log both</button>
	</div>

	<label class="code">
		<span>Serialized JSON</span>
		<textarea bind:value={serialized} rows="10"></textarea>
	</label>

	{#if importError}
		<p class="error" role="alert">{importError}</p>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 50);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;

			&:hover {
				color: var(--color-brand);
			}
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.panel {
		display: grid;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.panel label {
		display: grid;
		gap: var(--space-xs);
	}

	.panel span {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.panel input {
		padding-block: var(--space-sm);
		padding-inline: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.actions {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.actions button {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-md);
		font-weight: 600;
		min-block-size: 44px;
	}

	.code {
		display: grid;
		gap: var(--space-xs);
	}

	.code span {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.code textarea {
		padding: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		resize: vertical;
	}

	.error {
		padding: var(--space-sm) var(--space-md);
		background: oklch(95% 0.05 25);
		color: var(--color-error);
		border-inline-start: 4px solid var(--color-error);
		border-radius: var(--radius-md);
	}
</style>
