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

### 1.6 What SvelteKit does under the hood — the streaming form data pipeline

File upload streaming in remote form functions involves a more sophisticated pipeline than text-only forms. Here is the full lifecycle:

**Client-side:**

1. The user selects a file and clicks "Upload".
2. The Svelte attachment intercepts the submit.
3. A `FormData` object is constructed from all named inputs, including the `File` object from the file input.
4. The attachment sends a `fetch` POST with the `FormData` as the body. The browser automatically sets `Content-Type: multipart/form-data; boundary=...` and chunks the upload.
5. Unlike text-only forms, file uploads cannot use the preflight to validate the file on the server before the upload starts. However, client-side preflight can check `file.size` and `file.type` before sending, preventing obviously invalid uploads from ever leaving the browser.

**Server-side (streaming):**

1. The server receives the multipart request. Instead of waiting for the entire body to arrive before processing, SvelteKit can begin parsing the multipart stream immediately.
2. Text fields arrive first (they are small). SvelteKit's runtime can validate them via the Valibot schema while file bytes are still in transit.
3. If a text field fails validation, the server can reject the request early — before the file upload completes. This saves bandwidth: a 50 MB upload is aborted mid-stream instead of completing before the server says "your caption was too short."
4. Once all fields (including files) have arrived, the full Valibot schema validates the `File` object's metadata: `v.mimeType()` checks the MIME type, `v.maxSize()` checks the byte count.
5. The handler receives the validated data. `photo` is a `File` object with full access to its contents via `arrayBuffer()`, `stream()`, or `text()`.

### 1.7 The TypeScript angle

Valibot's file validators have precise TypeScript types:

```ts
const schema = v.object({
    caption: v.pipe(v.string(), v.maxLength(120)),
    photo: v.pipe(
        v.file('A photo is required'),        // type: File
        v.mimeType(['image/jpeg', 'image/png', 'image/webp'], 'Unsupported type'),
        v.maxSize(5 * 1024 * 1024, 'Too large')
    )
});

type FormInput = v.InferInput<typeof schema>;
// { caption: string; photo: File }
```

In the handler, `photo` is typed as `File`. This is the web-standard `File` class with methods like:
- `photo.name: string` — the original filename
- `photo.size: number` — size in bytes
- `photo.type: string` — MIME type
- `photo.arrayBuffer(): Promise<ArrayBuffer>` — full contents
- `photo.stream(): ReadableStream<Uint8Array>` — streaming contents
- `photo.text(): Promise<string>` — contents as UTF-8 text (rarely useful for binary files)

The type system prevents you from accidentally treating the `File` as a string (which is what happens without `enctype="multipart/form-data"` — the browser sends the filename as a string).

### 1.8 Comparison: remote form upload vs classic action upload vs dedicated upload endpoint

| Aspect | Remote `form()` upload | Classic form action upload | `+server.ts` upload endpoint |
| --- | --- | --- | --- |
| Validation | Valibot schema (automatic) | Manual `instanceof File` checks | Manual validation |
| Type safety | `v.file()` -> `File` type | Manual narrowing | Manual narrowing |
| Progressive enhancement | Yes (standard POST fallback) | Yes | No (JS-only) |
| Upload progress | Via custom `enhance` / XHR | Via custom `enhance` / XHR | Via XHR directly |
| Early rejection | Yes (text fields validated before file finishes) | No (all data arrives before handler) | Depends on implementation |
| Streaming to disk | Via `photo.stream()` in handler | Via `photo.stream()` | Via `request.body` |

> **In production sidebar.** Our app handles profile photo uploads (< 2 MB) and document uploads (up to 50 MB). We use remote `form()` for profile photos — the Valibot schema enforces `v.maxSize(2 * 1024 * 1024)` and `v.mimeType(['image/jpeg', 'image/png'])`, and the handler stores the file in S3. For document uploads, we use a dedicated `+server.ts` endpoint with `request.body` streaming directly to cloud storage, because loading a 50 MB file into memory with `arrayBuffer()` would crash the server process. The rule: use remote `form()` for uploads under 10 MB where you need the full Valibot validation pipeline. Use a streaming `+server.ts` endpoint for large files where memory efficiency is critical.

### 1.9 Common interview question

**Q: "A user uploads a 10 MB file via a form. What happens if the caption field is invalid? How does the streaming approach differ from the traditional approach?"**

**Model answer:** In the traditional approach (classic form actions), the server calls `await request.formData()`, which waits for the entire request body — including the 10 MB file — to arrive before parsing. The handler then discovers the caption is invalid and returns a `fail(400)`. The user waited for the full upload, wasted 10 MB of bandwidth, and gets an error. In the streaming approach (remote `form()` functions), the server can parse the multipart stream incrementally. Text fields arrive first. SvelteKit can validate the caption against the Valibot schema while file bytes are still in transit. If the caption fails validation, the server rejects the request immediately and closes the connection — the remaining file bytes are never received. This saves bandwidth and gives the user faster feedback. Even better: a client-side preflight schema can catch the invalid caption before any network request, preventing the upload entirely.

## Deep Dive

**The `arrayBuffer()` vs `stream()` decision.** For files under ~10 MB, `await photo.arrayBuffer()` is simple and fast. The entire file loads into memory, you process it (resize, hash, validate contents), and write it to storage. For files over 10 MB, `photo.stream()` returns a `ReadableStream<Uint8Array>` that you can pipe directly to disk, S3, or another destination without loading the whole file into memory. Node.js example:

```ts
import { createWriteStream } from 'node:fs';
import { Writable } from 'node:stream';

const writable = createWriteStream(`/uploads/${photo.name}`);
const nodeWritable = Writable.toWeb(writable);
await photo.stream().pipeTo(nodeWritable);
```

This pattern handles files of arbitrary size with constant memory usage.

**EXIF data and security.** Uploaded images often contain EXIF metadata including GPS coordinates, camera model, and timestamps. For privacy, strip EXIF before storing. Libraries like `sharp` (Node.js) can do this during the image processing step. This is server-side work — never trust the client to strip metadata.

## Going Deeper

- **SvelteKit docs:** [Remote functions — form](https://svelte.dev/docs/kit/remote-functions#form) covers file upload patterns.
- **Advanced pattern:** Implement a resumable upload by splitting the file into chunks on the client, sending each chunk as a separate request, and reassembling on the server. This is complex but necessary for files over 100 MB on unreliable connections.
- **Challenge:** Upload an image, read it with `arrayBuffer()`, compute its SHA-256 hash with `crypto.subtle.digest()`, and return the hash as part of the form result. Verify the hash matches by computing it independently in the browser before upload.

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
