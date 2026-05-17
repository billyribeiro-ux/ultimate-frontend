---
module: 10
exercise: 5
title: File Upload via Form Actions
difficulty: principal
estimated_time: 60
skills_tested:
  - multipart form data
  - file validation
  - preview before upload
  - progressive enhancement
---

# Exercise 10.5 — File Upload via Form Actions

## Brief

Build a profile picture upload form that validates file type and size on the server, shows a client-side preview before upload, handles the upload via form action, and displays the result. The form must work without JavaScript as a basic file upload.

## Requirements

1. Create `src/routes/profile/+page.server.ts` with a form action that accepts a file upload
2. Validate the file: max 2MB, only JPEG/PNG/WebP allowed
3. On invalid file, return `fail(400)` with a descriptive error
4. On success, convert the file to a base64 data URL and return it (simulating storage)
5. Create `src/routes/profile/+page.svelte` with a file input and preview area
6. Before upload, show a client-side preview using `URL.createObjectURL`
7. After upload, show the server-confirmed image
8. Include a drag-and-drop zone that falls back to a standard file input without JavaScript
9. Display file metadata (name, size, type) before upload

## Constraints

- Use `<form enctype="multipart/form-data">` for the upload
- Server validation must reject oversized or wrong-type files
- The drag-and-drop zone must be accessible (keyboard-operable)
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

In a form action, access the file with `const file = formData.get('avatar') as File`. Check `file.size` and `file.type` for validation. Convert to base64 with `Buffer.from(await file.arrayBuffer()).toString('base64')`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The client-side preview uses the `change` event on the file input: `URL.createObjectURL(input.files[0])`. The drag-and-drop zone listens for `dragover`, `dragleave`, and `drop` events. On `drop`, extract `e.dataTransfer.files[0]` and assign it to the file input programmatically.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// +page.server.ts
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const file = formData.get('avatar') as File;
if (!ALLOWED_TYPES.includes(file.type)) return fail(400, { error: 'Invalid file type' });
if (file.size > MAX_SIZE) return fail(400, { error: 'File too large (max 2MB)' });
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/profile/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024;

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file || file.size === 0) {
      return fail(400, { error: 'Please select a file' });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return fail(400, { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP` });
    }

    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      return fail(400, { error: `File too large: ${sizeMB}MB. Maximum: 2MB` });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return {
      success: true,
      imageUrl: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };
  }
};
```

```svelte
<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();

  let preview = $state<string | null>(null);
  let fileInfo = $state<{ name: string; size: string; type: string } | null>(null);
  let dragging = $state(false);
  let uploading = $state(false);
  let fileInput = $state<HTMLInputElement>();

  function handleFileSelect(file: File) {
    preview = URL.createObjectURL(file);
    fileInfo = {
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type
    };
  }

  function handleChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.[0]) handleFileSelect(input.files[0]);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    const file = e.dataTransfer?.files[0];
    if (file && fileInput) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      handleFileSelect(file);
    }
  }
</script>

<div class="profile-page">
  <h1>Upload Profile Picture</h1>

  <form method="POST" enctype="multipart/form-data"
    use:enhance={() => {
      uploading = true;
      return async ({ update }) => {
        uploading = false;
        preview = null;
        fileInfo = null;
        await update();
      };
    }}
  >
    <div class="drop-zone"
      class:dragging
      role="button"
      tabindex="0"
      ondragover={(e) => { e.preventDefault(); dragging = true; }}
      ondragleave={() => { dragging = false; }}
      ondrop={handleDrop}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInput?.click(); }}
      onclick={() => fileInput?.click()}
    >
      {#if preview}
        <img src={preview} alt="Preview" class="preview-img" />
      {:else}
        <div class="drop-prompt">
          <p class="drop-text">Drop an image here or click to browse</p>
          <p class="drop-hint">JPEG, PNG, or WebP - max 2MB</p>
        </div>
      {/if}

      <input bind:this={fileInput} type="file" name="avatar" accept="image/jpeg,image/png,image/webp"
        onchange={handleChange} class="visually-hidden" />
    </div>

    {#if fileInfo}
      <div class="file-meta">
        <span>{fileInfo.name}</span>
        <span>{fileInfo.size}</span>
        <span>{fileInfo.type}</span>
      </div>
    {/if}

    {#if form?.error}
      <div class="error-banner" role="alert">{form.error}</div>
    {/if}

    <button type="submit" class="upload-btn" disabled={uploading || !preview}>
      {uploading ? 'Uploading...' : 'Upload'}
    </button>
  </form>

  {#if form?.success}
    <div class="result">
      <h2>Upload Successful</h2>
      <img src={form.imageUrl} alt="Uploaded avatar" class="result-img" />
      <dl class="result-meta">
        <dt>File</dt><dd>{form.fileName}</dd>
        <dt>Size</dt><dd>{(form.fileSize / 1024).toFixed(1)} KB</dd>
        <dt>Type</dt><dd>{form.fileType}</dd>
      </dl>
    </div>
  {/if}
</div>

<style>
  .profile-page { max-inline-size: 28rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-xl); }

  .drop-zone {
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-2xl);
    text-align: center;
    cursor: pointer;
    transition: border-color 150ms ease, background 150ms ease;
    position: relative;
    min-block-size: 12rem;
    display: grid;
    place-items: center;
  }

  .drop-zone:hover, .drop-zone:focus-visible { border-color: oklch(55% 0.2 250); }
  .drop-zone.dragging { border-color: oklch(55% 0.2 250); background: oklch(95% 0.05 250); }

  .drop-text { font-size: var(--text-base); color: var(--color-text); margin-block-end: var(--space-xs); }
  .drop-hint { font-size: var(--text-sm); color: var(--color-text-muted); }

  .preview-img { max-inline-size: 100%; max-block-size: 12rem; border-radius: var(--radius-md); object-fit: cover; }

  .visually-hidden { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

  .file-meta { display: flex; gap: var(--space-md); font-size: var(--text-sm); color: var(--color-text-muted); margin-block-start: var(--space-sm); justify-content: center; }

  .error-banner { background: oklch(90% 0.1 25); color: oklch(35% 0.15 25); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); margin-block-start: var(--space-md); font-size: var(--text-sm); }

  .upload-btn { inline-size: 100%; padding: var(--space-sm); background: oklch(55% 0.2 250); color: white; border: none; border-radius: var(--radius-sm); font-size: var(--text-base); font-weight: 600; cursor: pointer; margin-block-start: var(--space-md); }
  .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .result { margin-block-start: var(--space-xl); text-align: center; }
  .result h2 { font-size: var(--text-lg); color: oklch(55% 0.2 145); margin-block-end: var(--space-md); }
  .result-img { inline-size: 8rem; block-size: 8rem; border-radius: var(--radius-full); object-fit: cover; border: 3px solid var(--color-border); margin-block-end: var(--space-md); }
  .result-meta { display: grid; grid-template-columns: 4rem 1fr; gap: var(--space-xs); text-align: start; font-size: var(--text-sm); }
  .result-meta dt { font-weight: 600; color: var(--color-text-muted); }
</style>
```

### Explanation

File uploads in SvelteKit use standard `multipart/form-data` encoding. The server action receives the file as a `File` object from `FormData`, which provides `.size`, `.type`, and `.arrayBuffer()`. Server-side validation is critical — never trust the client's file type check. The drag-and-drop zone enhances the experience but falls back to a standard file input without JavaScript. The `DataTransfer` API bridges drag-and-drop files to the native file input. In production, you would upload to cloud storage (S3, Cloudflare R2) instead of converting to base64.
</details>
