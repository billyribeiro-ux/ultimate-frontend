<script lang="ts" module>
	import * as v from 'valibot';

	// Preflight schema: lives in the component so the client can import it.
	// (Remote files cannot export schemas to client code.)
	export const preflightSchema = v.object({
		displayName: v.pipe(
			v.string(),
			v.minLength(2, 'Display name must be at least 2 characters'),
			v.maxLength(40, 'Display name must be at most 40 characters')
		),
		theme: v.picklist(['light', 'dark', 'system'], 'Pick a theme'),
		notifications: v.optional(v.boolean(), false)
	});
</script>

<script lang="ts">
	import { updateSettings } from './settings.remote';

	const fields = updateSettings.fields;
</script>

<svelte:head>
	<title>Lesson 9B.5 · form remote functions · Ultimate Frontend</title>
	<meta
		name="description"
		content="Progressively enhanced form handling with Valibot validation and inline field errors."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09b-remote">← Module 9B</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9B.5 · Forms</p>
		<h1><code>form</code> remote functions + Valibot</h1>
		<p class="lede">
			One schema, server-side source of truth, client-side preflight for
			instant feedback, and progressive enhancement for JS-off browsers.
		</p>
	</header>

	<form {...updateSettings.preflight(preflightSchema)} class="settings">
		<div class="field">
			<label for="name">Display name</label>
			<input id="name" {...fields.displayName.as('text')} />
			{#each fields.displayName.issues() as issue (issue.message)}
				<p class="err">{issue.message}</p>
			{/each}
		</div>

		<div class="field">
			<label for="theme">Theme</label>
			<select id="theme" {...fields.theme.as('select')}>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
				<option value="system">System</option>
			</select>
			{#each fields.theme.issues() as issue (issue.message)}
				<p class="err">{issue.message}</p>
			{/each}
		</div>

		<div class="field field--check">
			<label>
				<input {...fields.notifications.as('checkbox')} />
				Email me about new lessons
			</label>
		</div>

		<button type="submit" disabled={!!updateSettings.pending}>
			{updateSettings.pending ? 'Saving…' : 'Save settings'}
		</button>
	</form>

	{#if updateSettings.result?.ok}
		<p class="ok" role="status">
			Saved. Hello, {updateSettings.result.saved.displayName}.
		</p>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(55% 0.22 300);
	}
	.crumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: var(--text-sm);
		min-block-size: 44px;
		display: inline-flex;
		align-items: center;
	}
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.lede {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		max-inline-size: var(--prose-max);
	}
	.settings {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-md);
		max-inline-size: 32rem;
	}
	.field {
		display: grid;
		gap: var(--space-xs);
	}
	.field label {
		font-weight: 600;
	}
	.field input[type='text'],
	.field select {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}
	.field input[aria-invalid='true'],
	.field select[aria-invalid='true'] {
		border-color: var(--color-error);
	}
	.field--check label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-weight: 400;
		min-block-size: 44px;
	}
	.err {
		color: var(--color-error);
		font-size: var(--text-sm);
		margin: 0;
	}
	button[type='submit'] {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
	}
	button[disabled] {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.ok {
		color: var(--color-success);
		padding: var(--space-md);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-md);
	}
</style>
