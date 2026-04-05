---
module: 9B
lesson: 9B.6
title: File upload streaming in form remote functions
duration: 65 minutes
prerequisites:
  - Lesson 9B.5 — `form` remote functions
learning_objectives:
  - Add a `v.file()` field to a form schema
  - Set `enctype="multipart/form-data"` on the form
  - Access `formData` in the handler before large files finish uploading
  - Show a progress indicator while bytes are in flight
  - Decide which file validations belong on the client vs the server
status: ready
---

# Lesson 9B.6 — File upload streaming in form remote functions

## 1. Concept — Don't make the user stare at a blank page

### 1.1 The old way: load everything, then start

Classic form actions wait for the entire `request.formData()` promise to resolve before the handler runs. If the user uploads a 50 MB video on a 4G connection, the handler sits idle for a minute while bytes trickle in, then runs in a single burst. During that minute the UI has no idea how much has uploaded — the progress bar is guesswork.

### 1.2 Streaming form handlers

Remote `form` handlers can stream. The `formData` object passed to your handler is a streaming iterable: text fields resolve immediately (because they are small), and `File` fields resolve as the bytes finish arriving. This lets you validate text fields *before* the file upload completes, reject invalid submissions early, and give accurate progress feedback.

```ts
// src/routes/modules/09b-remote/06-file-upload/upload.remote.ts
import * as v from 'valibot';
import { form } from '$app/server';

const schema = v.object({
    caption: v.pipe(v.string(), v.maxLength(120)),
    photo: v.pipe(
        v.file('A photo is required'),
        v.mimeType(['image/jpeg', 'image/png', 'image/webp'], 'Unsupported image type'),
        v.maxSize(5 * 1024 * 1024, 'Photo must be under 5 MB')
    )
});

interface Upload {
    id: string;
    caption: string;
    bytes: number;
    type: string;
    uploadedAt: Date;
}

// Module-level log. Replace with real storage in production.
const uploads: Upload[] = [];

export const uploadPhoto = form(schema, async ({ caption, photo }) => {
    // At this point Valibot has validated caption AND the file.
    const bytes = photo.size;
    // Read the file if we need to process it:
    // const buf = new Uint8Array(await photo.arrayBuffer());
    uploads.push({
        id: crypto.randomUUID(),
        caption,
        bytes,
        type: photo.type,
        uploadedAt: new Date()
    });
    return { ok: true as const, count: uploads.length };
});
```

### 1.3 Client-side progress with a custom `enhance`

To show a progress bar you need the `XMLHttpRequest` `progress` event — `fetch` does not expose upload progress. SvelteKit's `enhance` method lets you take over the submission:

```svelte
<form
    {...uploadPhoto.enhance(async ({ form, data, submit }) => {
        uploading = true;
        try {
            await submit();
            form.reset();
        } finally {
            uploading = false;
        }
    })}
    enctype="multipart/form-data"
>
```

For a full progress bar, replace `submit()` with an `XMLHttpRequest` upload keyed to `uploadPhoto.action`. In the mini-build we keep it simple: we show an animated "Uploading…" indicator while `uploading === true`.

### 1.4 Which validations go where

- **Type and size limits** belong on the **server**. The client cannot be trusted to enforce them — a script could bypass the input element entirely.
- **Immediate UX feedback** (e.g. "that file is too big, pick another one") belongs on the **client**, using either the preflight schema (Lesson 9B.5) or a simple `onchange` handler that reads `input.files[0].size`.
- **Virus scanning, EXIF stripping, image resizing** belong on the **server**, typically after the handler accepts the file but before it is persisted to storage.

### 1.5 A note on memory

`await photo.arrayBuffer()` loads the entire file into RAM. For small images that is fine. For videos or archives you want to stream the file to disk with `photo.stream()` and a Node `Readable`. That pattern is Module 12 material; for now, use `arrayBuffer` with a 5 MB ceiling.

## 2. Style it — A drop zone and a progress state

Per-page brand is a fresh green. The drop zone uses `border: 2px dashed var(--color-brand)` and animates a gentle brand-tinted glow while `uploading` is true. All animation respects `prefers-reduced-motion`.

## 3. Interact — Streaming + progress

Write the wrong version first: `<input type="file" onchange={uploadViaFetch}>`, no progress, no validation, no preflight. The user clicks, sees nothing, wonders if it worked. Then replace it with the form remote function pattern: schema, `.as('file')`, custom `enhance`, visible pending state.

## 4. Mini-build — Caption + photo uploader

### File tree

```
src/routes/modules/09b-remote/06-file-upload/
├── +page.svelte       (drop zone + caption input + progress indicator)
└── upload.remote.ts   (form() with v.file, v.mimeType, v.maxSize)
```

### DevTools moment

1. Submit a valid JPEG under 5 MB. Watch the Network tab — you see a single multipart POST. The request has a `Content-Type: multipart/form-data; boundary=...` header.
2. Submit a 10 MB image. The preflight schema rejects it in the browser before any network request is made.
3. Submit a PDF. Same — the `v.mimeType` check fails before the server sees a byte.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What attribute must a <code>&lt;form&gt;</code> with a file input have?</summary>

`enctype="multipart/form-data"`. Without it, browsers only send the filename, not the file bytes.
</details>

<details>
<summary><strong>Q2.</strong> Why can't <code>fetch</code> show upload progress?</summary>

The `fetch` API does not expose upload progress events. To show a progress bar you must fall back to `XMLHttpRequest` and listen for the `upload.onprogress` event.
</details>

<details>
<summary><strong>Q3.</strong> Where should the authoritative "no files over 5 MB" rule live?</summary>

On the server — inside the Valibot schema passed to `form()`. Client-side checks are only a UX convenience.
</details>

<details>
<summary><strong>Q4.</strong> What are three Valibot validators useful for file uploads?</summary>

`v.file()`, `v.mimeType([...])`, and `v.maxSize(n)`. Chain them with `v.pipe` to enforce presence, type, and size.
</details>

<details>
<summary><strong>Q5.</strong> When should you avoid <code>await photo.arrayBuffer()</code>?</summary>

When the file is large enough to hurt server memory. Stream it to disk or object storage with `photo.stream()` instead.
</details>

## 6. Common mistakes

- **Forgetting `enctype="multipart/form-data"`.** The file input silently sends only the filename; the handler sees a string, not a `File`, and validation fails with a cryptic error.
- **Putting the size limit only on the client.** Anyone with DevTools can bypass it. Always mirror on the server.
- **Loading huge files into RAM.** `arrayBuffer()` is convenient for small uploads; for anything larger, use `.stream()` and write directly to disk or object storage.
- **Using `bind:files` on the file input while also spreading `.as('file')`.** Pick one; the form remote function takes care of wiring the input automatically.

## 7. What's next

Lesson 9B.7 introduces `command` — JS-only mutations that are perfect for buttons, menu actions, and optimistic UI.
