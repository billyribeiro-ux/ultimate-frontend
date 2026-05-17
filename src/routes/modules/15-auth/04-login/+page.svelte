<script lang="ts">
	import { enhance } from '$app/forms';

	interface Props {
		form: {
			error?: string;
			email?: string;
		} | null;
	}

	let { form }: Props = $props();
</script>

<svelte:head>
	<title>Lesson 15.4 · Login</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 15.4 · Mini-build</p>
		<h1>Log in</h1>
	</header>

	<form method="POST" use:enhance class="login-form">
		{#if form?.error}
			<p class="form-error">{form.error}</p>
		{/if}

		<div class="field">
			<label for="email">Email</label>
			<input
				type="email"
				id="email"
				name="email"
				value={form?.email ?? ''}
				required
				autocomplete="email"
			/>
		</div>

		<div class="field">
			<label for="password">Password</label>
			<input
				type="password"
				id="password"
				name="password"
				required
				autocomplete="current-password"
			/>
		</div>

		<button type="submit">Log in</button>
	</form>

	<p class="register-link">
		No account? <a href="/modules/15-auth/03-registration">Register here</a>
	</p>
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

	.login-form {
		max-inline-size: 28rem;
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-md);
	}

	.field {
		display: grid;
		gap: var(--space-xs);
	}

	.field label {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.field input {
		width: 100%;
		padding: var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font-size: var(--text-base);
		min-block-size: 44px;
	}

	.field input:focus {
		outline: 2px solid var(--color-brand);
		outline-offset: 2px;
	}

	.form-error {
		padding: var(--space-sm);
		background: oklch(95% 0.05 25);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		font-size: var(--text-sm);
	}

	button[type='submit'] {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(98% 0 0);
		border: none;
		border-radius: var(--radius-md);
		font-weight: 600;
		font-size: var(--text-base);
		min-block-size: 44px;
		cursor: pointer;
		transition: background var(--dur-fast) var(--ease-out);
	}

	button[type='submit']:hover {
		background: var(--color-brand-dim);
	}

	.register-link {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.register-link a {
		color: var(--color-brand);
		font-weight: 600;
	}

	@media (prefers-reduced-motion: reduce) {
		button[type='submit'] {
			transition: none;
		}
	}
</style>
