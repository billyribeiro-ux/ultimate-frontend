<script lang="ts">
	import { enhance } from '$app/forms';

	interface Props {
		form: {
			error?: string;
			errors?: { email?: string; name?: string; password?: string };
			email?: string;
			name?: string;
			success?: boolean;
		} | null;
	}

	let { form }: Props = $props();
</script>

<svelte:head>
	<title>Lesson 15.3 · Registration</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 15.3 · Mini-build</p>
		<h1>Register</h1>
	</header>

	{#if form?.success}
		<article class="success-card">
			<h2>Account created</h2>
			<p>You can now <a href="/modules/15-auth/04-login">log in</a>.</p>
		</article>
	{:else}
		<form method="POST" use:enhance class="register-form">
			{#if form?.error}
				<p class="form-error">{form.error}</p>
			{/if}

			<div class="field">
				<label for="name">Name</label>
				<input
					type="text"
					id="name"
					name="name"
					value={form?.name ?? ''}
					required
					autocomplete="name"
				/>
				{#if form?.errors?.name}
					<p class="field-error">{form.errors.name}</p>
				{/if}
			</div>

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
				{#if form?.errors?.email}
					<p class="field-error">{form.errors.email}</p>
				{/if}
			</div>

			<div class="field">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					minlength="8"
					autocomplete="new-password"
				/>
				{#if form?.errors?.password}
					<p class="field-error">{form.errors.password}</p>
				{/if}
			</div>

			<button type="submit">Create account</button>
		</form>
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

	.register-form {
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

	.field-error {
		font-size: var(--text-xs);
		color: var(--color-error);
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

	.success-card {
		max-inline-size: 28rem;
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-lg);
	}

	.success-card a {
		color: var(--color-brand);
		font-weight: 600;
	}

	@media (prefers-reduced-motion: reduce) {
		button[type='submit'] {
			transition: none;
		}
	}
</style>
