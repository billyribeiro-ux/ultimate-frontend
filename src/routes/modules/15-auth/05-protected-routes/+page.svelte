<script lang="ts">
	import type { SafeUser } from '$lib/auth/types';

	interface Props {
		data: {
			user: SafeUser;
			sessionExpiresAt: string;
		};
	}

	let { data }: Props = $props();

	const memberSince: string = $derived(
		new Date(data.user.createdAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<svelte:head>
	<title>Lesson 15.5 · Protected routes</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 15.5 · Mini-build</p>
		<h1>Welcome, {data.user.name}</h1>
	</header>

	<article class="dashboard-card">
		<h2>Your account</h2>
		<dl class="account-info">
			<dt>Email</dt>
			<dd>{data.user.email}</dd>

			<dt>Member since</dt>
			<dd>{memberSince}</dd>

			<dt>Session expires</dt>
			<dd class="mono">{data.sessionExpiresAt}</dd>
		</dl>
	</article>

	<article class="protected-badge">
		<p>
			This page is protected. If you were not authenticated, you would have been redirected to
			the <a href="/modules/15-auth/04-login">login page</a>.
		</p>
	</article>

	<nav class="auth-nav">
		<a href="/modules/15-auth/06-logout" class="logout-link">Log out</a>
	</nav>
</section>

<style>
	section.page {
		--color-brand: oklch(65% 0.18 160);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.dashboard-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}

	.account-info {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		margin-block-start: var(--space-sm);
	}

	.account-info dt {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		min-block-size: 44px;
		display: flex;
		align-items: center;
	}

	.account-info dd {
		margin: 0;
		display: flex;
		align-items: center;
		min-block-size: 44px;
	}

	.mono {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
	}

	.protected-badge {
		padding: var(--space-md);
		background: oklch(95% 0.04 145);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-md);
	}

	.protected-badge p {
		font-size: var(--text-sm);
		color: var(--color-text);
	}

	.protected-badge a {
		color: var(--color-brand);
		font-weight: 600;
	}

	.auth-nav {
		display: flex;
		gap: var(--space-md);
	}

	.logout-link {
		display: inline-flex;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.logout-link:hover {
		border-color: var(--color-brand);
	}

	@media (prefers-reduced-motion: reduce) {
		.logout-link {
			transition: none;
		}
	}
</style>
