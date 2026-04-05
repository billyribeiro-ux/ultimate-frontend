<script lang="ts">
	import { uploadPhoto } from './upload.remote';

	let uploading: boolean = $state(false);

	function formatBytes(n: number): string {
		if (n < 1024) return `${n} B`;
		if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
		return `${(n / 1024 / 1024).toFixed(2)} MB`;
	}
</script>

<svelte:head>
	<title>Lesson 9B.6 · File upload streaming · Ultimate Frontend</title>
	<meta
		name="description"
		content="Upload photos with progress feedback via streaming form remote functions."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/09b-remote">← Module 9B</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 9B.6 · File uploads</p>
		<h1>Streaming file uploads</h1>
		<p class="lede">
			A caption and a photo, validated with <code>v.file</code>,
			<code>v.mimeType</code>, and <code>v.maxSize</code>.
		</p>
	</header>

	<form
		{...uploadPhoto.enhance(async ({ submit }) => {
			uploading = true;
			try {
				await submit();
			} finally {
				uploading = false;
			}
		})}
		enctype="multipart/form-data"
		class="drop"
		class:drop--busy={uploading}
	>
		<div class="field">
			<label for="caption">Caption</label>
			<input id="caption" {...uploadPhoto.fields.caption.as('text')} />
			{#each uploadPhoto.fields.caption.issues() as issue (issue.message)}
				<p class="err">{issue.message}</p>
			{/each}
		</div>

		<div class="field">
			<label for="photo">Photo (JPEG, PNG or WebP — under 5 MB)</label>
			<input id="photo" {...uploadPhoto.fields.photo.as('file')} accept="image/*" />
			{#each uploadPhoto.fields.photo.issues() as issue (issue.message)}
				<p class="err">{issue.message}</p>
			{/each}
		</div>

		<button type="submit" disabled={uploading}>
			{uploading ? 'Uploading…' : 'Upload photo'}
		</button>
	</form>

	{#if uploadPhoto.result?.ok}
		<p class="ok" role="status">
			Saved photo {uploadPhoto.result.last.id.slice(0, 8)} —
			{formatBytes(uploadPhoto.result.last.bytes)} ({uploadPhoto.result.count} total).
		</p>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(65% 0.18 150);
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
		padding: var(--space-lg);
		border: 2px dashed var(--color-brand);
		border-radius: var(--radius-lg);
		background: var(--color-surface-2);
		display: grid;
		gap: var(--space-md);
		max-inline-size: 36rem;
		transition: box-shadow var(--dur-base) var(--ease-out);
	}
	.drop--busy {
		box-shadow: 0 0 0 4px color-mix(in oklch, var(--color-brand) 30%, transparent);
		animation: pulse 1.4s var(--ease-in-out) infinite;
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
	}
	.field input[aria-invalid='true'] {
		border-color: var(--color-error);
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
	.err {
		color: var(--color-error);
		font-size: var(--text-sm);
		margin: 0;
	}
	.ok {
		color: var(--color-success);
		padding: var(--space-md);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-md);
	}
	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 0 0 4px color-mix(in oklch, var(--color-brand) 20%, transparent);
		}
		50% {
			box-shadow: 0 0 0 8px color-mix(in oklch, var(--color-brand) 30%, transparent);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.drop--busy {
			animation: none;
		}
	}
</style>
