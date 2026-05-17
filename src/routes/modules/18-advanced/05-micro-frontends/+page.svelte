<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface User {
		id: string;
		name: string;
		email: string;
		role: string;
	}

	const users: User[] = [
		{ id: '1', name: 'Alice Chen', email: 'alice@example.com', role: 'Engineer' },
		{ id: '2', name: 'Bob Martinez', email: 'bob@example.com', role: 'Designer' },
		{ id: '3', name: 'Carol Johnson', email: 'carol@example.com', role: 'Product Manager' }
	];

	let currentUser: User = $state(users[0]);
	let eventLog: string[] = $state([]);

	function emitLogin(user: User): void {
		currentUser = user;
		const event = new CustomEvent('auth:login', {
			detail: { userId: user.id, name: user.name, email: user.email }
		});
		window.dispatchEvent(event);
		eventLog = [...eventLog, `[AuthApp] emitted auth:login for ${user.name}`].slice(-5);
	}

	function handleAuthEvent(e: Event): void {
		const detail = (e as CustomEvent<{ userId: string; name: string }>).detail;
		eventLog = [...eventLog, `[DashboardApp] received auth:login: ${detail.name}`].slice(-5);
	}

	onMount(() => {
		window.addEventListener('auth:login', handleAuthEvent);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('auth:login', handleAuthEvent);
		}
	});
</script>

<svelte:head>
	<title>18.5 — Micro-Frontends · Advanced Patterns</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 18.5 · Mini-build</p>
		<h1>Micro-Frontends with SvelteKit</h1>
		<p class="lede">
			Independent apps sharing tokens and communicating through typed events.
			The architecture for teams greater than five.
		</p>
	</header>

	<nav class="shell-nav" aria-label="Simulated shell navigation">
		<span class="shell-nav__brand">MyApp Shell</span>
		<a href="#auth-app" class="shell-nav__link">Auth</a>
		<a href="#dashboard-app" class="shell-nav__link">Dashboard</a>
		<span class="shell-nav__user">{currentUser.name}</span>
	</nav>

	<div class="app-grid">
		<section class="app-panel" id="auth-app" aria-labelledby="auth-heading">
			<h2 id="auth-heading" class="app-panel__title">Auth Micro-Frontend</h2>
			<p class="app-panel__description">Simulates an independent auth application. Selecting a user fires a CustomEvent.</p>
			<div class="user-list">
				{#each users as user (user.id)}
					<button
						class="user-card"
						class:user-card--active={user.id === currentUser.id}
						onclick={() => emitLogin(user)}
					>
						<span class="user-card__name">{user.name}</span>
						<span class="user-card__role">{user.role}</span>
					</button>
				{/each}
			</div>
		</section>

		<section class="app-panel" id="dashboard-app" aria-labelledby="dash-heading">
			<h2 id="dash-heading" class="app-panel__title">Dashboard Micro-Frontend</h2>
			<p class="app-panel__description">Listens for auth events and updates the greeting. Independent deploy.</p>
			<div class="dashboard-content">
				<h3 class="dashboard-greeting">Welcome, {currentUser.name}</h3>
				<dl class="dashboard-info">
					<dt>Email</dt><dd>{currentUser.email}</dd>
					<dt>Role</dt><dd>{currentUser.role}</dd>
					<dt>User ID</dt><dd><code>{currentUser.id}</code></dd>
				</dl>
			</div>
		</section>
	</div>

	<aside class="event-log" aria-labelledby="log-heading">
		<h2 id="log-heading">Event Log</h2>
		<ul class="log-list">
			{#each eventLog as entry (entry)}
				<li class="log-entry"><code>{entry}</code></li>
			{/each}
			{#if eventLog.length === 0}
				<li class="log-entry log-entry--empty">No events yet. Click a user above.</li>
			{/if}
		</ul>
	</aside>
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

	.shell-nav {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.shell-nav__brand {
		font-weight: 700;
		font-size: var(--text-sm);
		color: var(--color-brand);
	}

	.shell-nav__link {
		font-size: var(--text-sm);
		min-block-size: 44px;
		display: inline-flex;
		align-items: center;
		padding-inline: var(--space-sm);
	}

	.shell-nav__user {
		margin-inline-start: auto;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.app-grid {
		display: grid;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.app-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.app-panel {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.app-panel__title {
		font-size: var(--text-lg);
		font-weight: 700;
		margin-block-end: var(--space-xs);
	}

	.app-panel__description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-end: var(--space-md);
	}

	.user-list {
		display: grid;
		gap: var(--space-sm);
	}

	.user-card {
		display: grid;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		text-align: start;
		cursor: pointer;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.user-card:hover {
		border-color: var(--color-brand);
	}

	.user-card--active {
		border-color: var(--color-brand);
		background: var(--color-brand);
		color: var(--color-surface);
	}

	.user-card__name {
		font-weight: 600;
		font-size: var(--text-sm);
	}

	.user-card__role {
		font-size: var(--text-xs);
		opacity: 0.8;
	}

	.dashboard-content {
		padding: var(--space-md);
		background: var(--color-surface);
		border-radius: var(--radius-md);
	}

	.dashboard-greeting {
		font-size: var(--text-lg);
		margin-block-end: var(--space-md);
	}

	.dashboard-info {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		font-size: var(--text-sm);
	}

	.dashboard-info dt {
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.event-log {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.log-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
	}

	.log-entry {
		font-size: var(--text-xs);
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
	}

	.log-entry--empty {
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
