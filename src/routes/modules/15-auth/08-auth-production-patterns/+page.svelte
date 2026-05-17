<script lang="ts">
	import type { SafeUser } from '$lib/auth/types';

	interface Props {
		data: {
			user: SafeUser | null;
			sessionExpiresAt: string | null;
			loginAttemptsRemaining: number;
			maxAttempts: number;
			csrfProtected: boolean;
		};
	}

	let { data }: Props = $props();

	function formatExpiry(iso: string | null): string {
		if (!iso) return 'No active session';
		const expiry: Date = new Date(iso);
		const now: Date = new Date();
		const diffMs: number = expiry.getTime() - now.getTime();
		if (diffMs <= 0) return 'Session expired';
		const hours: number = Math.floor(diffMs / (1000 * 60 * 60));
		const minutes: number = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m remaining`;
	}
</script>

<svelte:head>
	<title>Lesson 15.8 · Auth production patterns</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 15.8 · Mini-build</p>
		<h1>Production auth patterns</h1>
	</header>

	<article class="pattern-card">
		<h2>Rate limiting</h2>
		<div class="rate-limit">
			<div class="rate-bar" role="progressbar" aria-valuenow={data.maxAttempts - data.loginAttemptsRemaining} aria-valuemin={0} aria-valuemax={data.maxAttempts}>
				<div
					class="rate-fill"
					style="width: {((data.maxAttempts - data.loginAttemptsRemaining) / data.maxAttempts) * 100}%"
				></div>
			</div>
			<p class="rate-label">
				{data.loginAttemptsRemaining} of {data.maxAttempts} attempts remaining
			</p>
		</div>
		<p class="pattern-desc">
			After {data.maxAttempts} failed login attempts, the IP is blocked for 15 minutes.
		</p>
	</article>

	<article class="pattern-card">
		<h2>Session expiry</h2>
		<p class="expiry-display">
			{#if data.user}
				{formatExpiry(data.sessionExpiresAt)}
			{:else}
				Not logged in
			{/if}
		</p>
		<p class="pattern-desc">
			Default sessions last 24 hours. With "remember me," they extend to 30 days.
		</p>
	</article>

	<article class="pattern-card">
		<h2>CSRF protection</h2>
		<div class="csrf-status">
			<span class="csrf-badge">Active</span>
			<p>SvelteKit's Origin check protects all form actions automatically.</p>
		</div>
	</article>

	<article class="pattern-card">
		<h2>Remember me</h2>
		<div class="remember-demo">
			<label class="remember-label">
				<input type="checkbox" disabled checked />
				<span>Keep me logged in for 30 days</span>
			</label>
		</div>
		<p class="pattern-desc">
			Extends both the cookie maxAge and the server session duration.
		</p>
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

	.pattern-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
	}

	.pattern-desc {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.rate-limit {
		display: grid;
		gap: var(--space-xs);
	}

	.rate-bar {
		height: 8px;
		background: var(--color-border);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.rate-fill {
		height: 100%;
		background: var(--color-success);
		border-radius: var(--radius-full);
		transition: width var(--dur-base) var(--ease-out);
	}

	.rate-label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.expiry-display {
		font-family: ui-monospace, monospace;
		font-size: var(--text-lg);
		font-weight: 600;
	}

	.csrf-status {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.csrf-badge {
		font-size: var(--text-xs);
		padding: 0.2em 0.8em;
		border-radius: var(--radius-full);
		background: var(--color-success);
		color: oklch(15% 0.02 145);
		font-weight: 600;
	}

	.csrf-status p {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.remember-demo {
		padding: var(--space-sm);
	}

	.remember-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-block-size: 44px;
		cursor: default;
	}

	.remember-label input[type='checkbox'] {
		width: 20px;
		height: 20px;
		accent-color: var(--color-brand);
	}

	@media (prefers-reduced-motion: reduce) {
		.rate-fill {
			transition: none;
		}
	}
</style>
