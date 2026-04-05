<script lang="ts">
	import { enhance } from '$app/forms';

	type FormResult =
		| {
				ok: true;
				caption: string;
				uploaded: { name: string; size: number; type: string };
		  }
		| { caption?: string; error?: string }
		| null;

	let { form }: { form: FormResult } = $props();

	let uploading: boolean = $state(false);
	let fileName: string = $state('');

	function onFileChange(e: Event): void {
		const input = e.currentTarget as HTMLInputElement;
		fileName = input.files?.[0]?.name ?? '';
	}

	function formatBytes(n: number): string {
		if (n < 1024) return `${n} B`;
		if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
		return `${(n / 1024 / 1024).toFixed(2)} MB`;
	}
</script>

<svelte:head>
	<title>Lesson 10.8 · File uploads · Ultimate Frontend</title>
	<meta
		name="description"
		content="File uploads through classic SvelteKit form actions with multipart/form-data and server-side validation."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/10-api-forms">← Module 10</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 10.8 · File uploads</p>
		<h1>Files via classic form actions</h1>
		<p class="lede">
			<code>multipart/form-data</code>, <code>FormData.get</code> returning a
			<code>File</code>, and server-side size + MIME validation.
		</p>
	</header>

	<form
		method="POST"
		enctype="multipart/form-data"
		class="drop"
		use:enhance={() => {
			uploading = true;
			return async ({ update, result }) => {
				await update();
				uploading = false;
				if (result.type === 'success') fileName = '';
			};
		}}
	>
		<div class="field">
			<label for="caption">Caption</label>
			<input
				id="caption"
				name="caption"
				type="text"
				value={form && 'caption' in form ? (form.caption ?? '') : ''}
			/>
		</div>

		<div class="field">
			<label for="photo" class="file-label">
				<span>{fileName || 'Choose a photo (JPEG, PNG, or WebP, under 5 MB)'}</span>
			</label>
			<input
				id="photo"
				name="photo"
				type="file"
				accept="image/jpeg,image/png,image/webp"
				class="file-input"
				onchange={onFileChange}
			/>
		</div>

		{#if form && 'error' in form && form.error}
			<p class="err" role="alert">{form.error}</p>
		{/if}

		<button type="submit" disabled={uploading}>
			{uploading ? 'Uploading…' : 'Upload'}
		</button>
	</form>

	{#if form && 'ok' in form && form.ok}
		<article class="result">
			<p class="result__ok" role="status">Uploaded {form.uploaded.name}</p>
			<dl>
				<dt>Size</dt>
				<dd>{formatBytes(form.uploaded.size)}</dd>
				<dt>Type</dt>
				<dd>{form.uploaded.type}</dd>
				<dt>Caption</dt>
				<dd>{form.caption || '—'}</dd>
			</dl>
		</article>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(70% 0.16 170);
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
	.drop {
		display: grid;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 2px dashed var(--color-brand);
		border-radius: var(--radius-lg);
		max-inline-size: 36rem;
	}
	.field {
		display: grid;
		gap: var(--space-xs);
	}
	.field label {
		font-weight: 600;
	}
	.field input[type='text'] {
		min-block-size: 44px;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}
	.file-label {
		display: flex;
		align-items: center;
		justify-content: center;
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 1px dashed var(--color-brand);
		border-radius: var(--radius-md);
		cursor: pointer;
		color: var(--color-text-muted);
		text-align: center;
	}
	.file-input {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		clip: rect(0 0 0 0);
	}
	.file-input:focus-visible + .file-label {
		outline: 2px solid var(--color-brand);
		outline-offset: 2px;
	}
	button[type='submit'] {
		min-block-size: 44px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(20% 0.02 170);
		border-radius: var(--radius-md);
		font-weight: 700;
		justify-self: start;
	}
	button[disabled] {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.err {
		color: var(--color-error);
		margin: 0;
	}
	.result {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-md);
	}
	.result__ok {
		color: var(--color-success);
		font-weight: 700;
		margin: 0 0 var(--space-sm);
	}
	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		margin: 0;
	}
	dt {
		font-weight: 600;
		color: var(--color-text-muted);
	}
	dd {
		margin: 0;
	}
</style>
