<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SafeUser } from '$lib/auth/types';

	interface OAuthStep {
		number: number;
		label: string;
		description: string;
	}

	const steps: OAuthStep[] = [
		{
			number: 1,
			label: 'Redirect to provider',
			description: 'User is sent to the authorization URL'
		},
		{ number: 2, label: 'User approves', description: 'Provider shows consent, user clicks Allow' },
		{
			number: 3,
			label: 'Callback with code',
			description: 'Provider redirects back with ?code=...'
		},
		{
			number: 4,
			label: 'Exchange code for token',
			description: 'Server POST to provider token endpoint'
		},
		{
			number: 5,
			label: 'Fetch user info',
			description: 'Server uses token to get profile data'
		},
		{ number: 6, label: 'Create session', description: 'Session cookie set, user is logged in' }
	];

	interface Props {
		data: {
			user: SafeUser | null;
			oauthComplete: boolean;
		};
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Lesson 15.7 · OAuth basics</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 15.7 · Mini-build</p>
		<h1>OAuth2 Authorization Code Flow</h1>
	</header>

	<article class="flow-card">
		<h2>The flow</h2>
		<ol class="flow-steps">
			{#each steps as step (step.number)}
				<li class="flow-step">
					<span class="step-num">{step.number}</span>
					<div class="step-content">
						<strong>{step.label}</strong>
						<p>{step.description}</p>
					</div>
				</li>
			{/each}
		</ol>
	</article>

	<article class="action-card">
		<h2>Try it (mock provider)</h2>
		{#if data.user}
			<p class="status status--success">
				Logged in as <strong>{data.user.email}</strong> via mock OAuth.
			</p>
			<a href="/modules/15-auth/06-logout" class="logout-link">Log out</a>
		{:else}
			<p>Click below to simulate the OAuth flow with a mock provider.</p>
			<form method="POST" action="?/initiate" use:enhance>
				<button type="submit" class="oauth-btn">Log in with Mock Provider</button>
			</form>
		{/if}
	</article>
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

	.flow-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.flow-steps {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
		margin-block-start: var(--space-sm);
	}

	.flow-step {
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: var(--space-sm);
		align-items: start;
		padding: var(--space-sm);
		border-radius: var(--radius-md);
	}

	.step-num {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: var(--color-brand);
		color: oklch(98% 0 0);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: 700;
	}

	.step-content p {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-start: var(--space-xs);
	}

	.action-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-md);
	}

	.oauth-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-weight: 600;
		font-size: var(--text-base);
		min-block-size: 44px;
		cursor: pointer;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.oauth-btn:hover {
		border-color: var(--color-brand);
	}

	.status--success {
		padding: var(--space-sm);
		background: oklch(95% 0.04 145);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}

	.logout-link {
		display: inline-flex;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 600;
		min-block-size: 44px;
		justify-self: start;
	}

	@media (prefers-reduced-motion: reduce) {
		.oauth-btn {
			transition: none;
		}
	}
</style>
