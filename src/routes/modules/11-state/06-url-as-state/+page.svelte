<!--
	Lesson 11.6 — URL as state
	Mini-build: a filter bar that writes to the URL on every change.
	The list below reflects whatever the URL currently says.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { members, type Member } from '$lib/stores/members';

	type Role = 'all' | Member['role'];
	type SortKey = 'name' | 'joined' | 'signals';

	const role = $derived<Role>((page.url.searchParams.get('role') ?? 'all') as Role);
	const q = $derived<string>(page.url.searchParams.get('q') ?? '');
	const sort = $derived<SortKey>((page.url.searchParams.get('sort') ?? 'name') as SortKey);

	const filtered = $derived.by(() => {
		const query = q.toLowerCase();
		const rows = members.filter((m) => {
			if (role !== 'all' && m.role !== role) return false;
			if (query && !`${m.name} ${m.email}`.toLowerCase().includes(query)) return false;
			return true;
		});
		return rows.toSorted((a, b) => {
			if (sort === 'signals') return b.signals - a.signals;
			if (sort === 'joined') return a.joined.localeCompare(b.joined);
			return a.name.localeCompare(b.name);
		});
	});

	let searchTimer: ReturnType<typeof setTimeout> | null = null;

	function updateParam(key: string, value: string, immediate: boolean = true): void {
		const url = new URL(page.url);
		if (value && value !== 'all') url.searchParams.set(key, value);
		else url.searchParams.delete(key);
		goto(url, { keepFocus: true, noScroll: true, replaceState: true });
	}

	function onSearchInput(event: Event): void {
		const value = (event.currentTarget as HTMLInputElement).value;
		if (searchTimer) clearTimeout(searchTimer);
		searchTimer = setTimeout(() => updateParam('q', value), 250);
	}

	function onRoleChange(event: Event): void {
		updateParam('role', (event.currentTarget as HTMLSelectElement).value);
	}

	function onSortChange(event: Event): void {
		updateParam('sort', (event.currentTarget as HTMLSelectElement).value);
	}
</script>

<svelte:head>
	<title>Lesson 11.6 · URL as state · Ultimate Frontend</title>
	<meta
		name="description"
		content="A filter bar that writes its state to the URL so every view is bookmarkable and shareable."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/11-state">← Module 11</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 11.6 · Mini-build</p>
		<h1>The URL is the state</h1>
		<p class="lede">
			Change a filter and watch the URL update. Copy the URL into a new tab — the filter is
			restored. Click back — the previous filter returns.
		</p>
	</header>

	<form class="filters" aria-label="Filter members">
		<label class="field">
			<span>Search</span>
			<input
				type="search"
				placeholder="Name or email"
				value={q}
				oninput={onSearchInput}
			/>
		</label>
		<label class="field">
			<span>Role</span>
			<select value={role} onchange={onRoleChange}>
				<option value="all">All roles</option>
				<option value="admin">Admin</option>
				<option value="editor">Editor</option>
				<option value="viewer">Viewer</option>
			</select>
		</label>
		<label class="field">
			<span>Sort</span>
			<select value={sort} onchange={onSortChange}>
				<option value="name">Name</option>
				<option value="joined">Joined</option>
				<option value="signals">Signals</option>
			</select>
		</label>
	</form>

	<p class="count" aria-live="polite">
		Showing {filtered.length} of {members.length} members
	</p>

	<ul class="rows">
		{#each filtered as member (member.id)}
			<li>
				<span class="name">{member.name}</span>
				<span class="email">{member.email}</span>
				<span class="role">{member.role}</span>
				<span class="signals">{member.signals}</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(72% 0.18 240);
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
			grid-template-columns: 2fr 1fr 1fr;
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

	.count {
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
			grid-template-columns: 1.5fr 2fr 1fr auto;
		}
	}

	.name {
		font-weight: 600;
	}

	.email {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.role {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-brand);
	}

	.signals {
		font-family: ui-monospace, monospace;
		font-weight: 700;
	}
</style>
