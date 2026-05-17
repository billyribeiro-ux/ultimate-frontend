<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SafeUser } from '$lib/auth/types';

	interface Props {
		data: {
			user: SafeUser | null;
		};
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Lesson 15.6 · Logout</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 15.6 · Mini-build</p>
		<h1>Logout</h1>
	</header>

	{#if data.user}
		<article class="logout-card">
			<p>You are currently logged in as <strong>{data.user.email}</strong>.</p>
			<form method="POST" use:enhance>
				<button type="submit" class="logout-btn">Log out</button>
			</form>
		</article>
	{:else}
		<article class="logged-out-card">
			<h2>Session ended</h2>
			<p>You are not logged in.</p>
			<a href="/modules/15-auth/04-login" class="login-link">Go to login</a>
		</article>
	{/if}
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

	.logout-card {
		max-inline-size: 28rem;
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-md);
	}

	.logout-btn {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		font-weight: 600;
		font-size: var(--text-base);
		min-block-size: 44px;
		cursor: pointer;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.logout-btn:hover {
		background: oklch(95% 0.05 25);
	}

	.logged-out-card {
		max-inline-size: 28rem;
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
	}

	.login-link {
		display: inline-flex;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(98% 0 0);
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 600;
		min-block-size: 44px;
		justify-self: start;
	}

	@media (prefers-reduced-motion: reduce) {
		.logout-btn {
			transition: none;
		}
	}
</style>
