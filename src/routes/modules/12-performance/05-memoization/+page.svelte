<!--
	Lesson 12.5 — Memoization with $derived.by
	Mini-build: a filtered + sorted + paginated list with a recompute counter.
-->
<script lang="ts">
	import { members, type Member } from '$lib/stores/members';

	let query = $state<string>('');
	let role = $state<'all' | Member['role']>('all');
	let pageIndex = $state<number>(0);
	let unrelated = $state<number>(0);
	let recomputeCount = $state<number>(0);

	const pageSize = 5;

	const visible = $derived.by(() => {
		recomputeCount += 1;
		const q = query.toLowerCase();
		const filtered = members.filter((m) => {
			if (role !== 'all' && m.role !== role) return false;
			if (q && !`${m.name} ${m.email}`.toLowerCase().includes(q)) return false;
			return true;
		});
		const sorted = filtered.toSorted((a, b) => a.name.localeCompare(b.name));
		const start = pageIndex * pageSize;
		return {
			page: sorted.slice(start, start + pageSize),
			totalPages: Math.max(Math.ceil(sorted.length / pageSize), 1),
			matched: sorted.length
		};
	});
</script>

<svelte:head>
	<title>Lesson 12.5 · Memoization · Ultimate Frontend</title>
	<meta
		name="description"
		content="A filter+sort+paginate pipeline using $derived.by, with a visible recompute counter to prove memoization."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/12-performance">← Module 12</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 12.5 · Mini-build</p>
		<h1>Recompute only when it matters</h1>
		<p class="lede">
			The list below is filtered, sorted, and paginated inside a single
			<code>$derived.by</code>. Click "unrelated counter" as many times as you like — the
			recompute count does not move.
		</p>
	</header>

	<div class="filters">
		<label class="field">
			<span>Search</span>
			<input
				type="search"
				value={query}
				oninput={(e) => {
					query = (e.currentTarget as HTMLInputElement).value;
					pageIndex = 0;
				}}
			/>
		</label>
		<label class="field">
			<span>Role</span>
			<select
				value={role}
				onchange={(e) => {
					role = (e.currentTarget as HTMLSelectElement).value as typeof role;
					pageIndex = 0;
				}}
			>
				<option value="all">All</option>
				<option value="admin">Admin</option>
				<option value="editor">Editor</option>
				<option value="viewer">Viewer</option>
			</select>
		</label>
	</div>

	<div class="meter" role="group" aria-label="Recompute tracking">
		<div class="pill">
			Recomputes: <strong>{recomputeCount}</strong>
		</div>
		<div class="pill">
			Unrelated counter: <strong>{unrelated}</strong>
		</div>
		<button type="button" onclick={() => (unrelated += 1)}>Increment unrelated</button>
	</div>

	<p class="status">
		Showing {visible.page.length} of {visible.matched} matches
	</p>

	<ul class="rows">
		{#each visible.page as member (member.id)}
			<li>
				<span class="name">{member.name}</span>
				<span class="role">{member.role}</span>
				<span class="email">{member.email}</span>
			</li>
		{/each}
	</ul>

	<nav class="pager" aria-label="Pagination">
		<button
			type="button"
			onclick={() => (pageIndex = Math.max(0, pageIndex - 1))}
			disabled={pageIndex === 0}
		>
			← Previous
		</button>
		<span>Page {pageIndex + 1} of {visible.totalPages}</span>
		<button
			type="button"
			onclick={() => (pageIndex = Math.min(visible.totalPages - 1, pageIndex + 1))}
			disabled={pageIndex >= visible.totalPages - 1}
		>
			Next →
		</button>
	</nav>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 190);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
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

	.filters {
		display: grid;
		gap: var(--space-sm);
		grid-template-columns: 1fr;

		@media (min-width: 480px) {
			grid-template-columns: 2fr 1fr;
		}
	}

	.field {
		display: grid;
		gap: var(--space-xs);
	}

	.field span {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.field input,
	.field select {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.meter {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: center;
	}

	.pill {
		padding: var(--space-xs) var(--space-md);
		min-block-size: 44px;
		display: inline-flex;
		align-items: center;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
	}

	.meter button {
		padding: var(--space-xs) var(--space-md);
		min-block-size: 44px;
		background: var(--color-brand);
		color: oklch(15% 0.02 190);
		border-radius: var(--radius-md);
		font-weight: 700;
	}

	.status {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.rows {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.rows li {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-xs) var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;

		@media (min-width: 768px) {
			grid-template-columns: 1.5fr auto 2fr;
		}
	}

	.name {
		font-weight: 600;
	}

	.role {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-brand);
	}

	.email {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.pager {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.pager button {
		padding: var(--space-xs) var(--space-md);
		min-block-size: 44px;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.pager button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
