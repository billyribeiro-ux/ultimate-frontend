---
module: 10
lesson: 10.8
title: File uploads via form actions
duration: 55 minutes
prerequisites:
  - Lesson 10.5 — `use:enhance`
  - Lesson 10.6 — server-side validation
learning_objectives:
  - Add `enctype="multipart/form-data"` to a form
  - Read a `File` from `FormData` on the server
  - Validate file size and MIME type with Valibot
  - Return typed errors and repopulate the non-file fields on failure
  - Decide when to use classic actions vs the streaming remote form pattern from 9B.6
status: ready
---

# Lesson 10.8 — File uploads via form actions

## 1. Concept — The last piece of the classic form story

### 1.1 What changes with files

A text-only form submits as `application/x-www-form-urlencoded`: key-value pairs, tiny payload. A form with a file must use `multipart/form-data`: a structured payload that can contain binary data alongside text fields. The single attribute that makes this switch is `enctype` on the `<form>` element:

```svelte
<form method="POST" enctype="multipart/form-data">
    <input type="file" name="photo" />
    <input type="text" name="caption" />
    <button>Upload</button>
</form>
```

Forget `enctype` and the browser sends only the filename as a string. The handler sees no file. This is the most common file-upload bug in existence.

### 1.2 Reading a file in an action

Inside the action, `await request.formData()` returns a `FormData` object. Calling `data.get('photo')` returns a `File` (or `null`) when the input had a file. `File` is the web-standard file object — it has `name`, `size`, `type`, and methods like `arrayBuffer()` and `stream()`.

```ts
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const caption = data.get('caption');
        const photo = data.get('photo');

        if (!(photo instanceof File) || photo.size === 0) {
            return fail(400, { error: 'Photo is required' });
        }
        if (photo.size > 5 * 1024 * 1024) {
            return fail(400, { error: 'Photo must be under 5 MB' });
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) {
            return fail(400, { error: 'Unsupported image type' });
        }

        // const bytes = new Uint8Array(await photo.arrayBuffer());
        // write to storage...

        return {
            ok: true,
            uploaded: { name: photo.name, size: photo.size, type: photo.type },
            caption: typeof caption === 'string' ? caption : ''
        };
    }
};
```

### 1.3 You cannot repopulate a file input

After a failed submit, text fields can be restored from `form?.values`. A file input **cannot**. The browser does not allow JavaScript to set `<input type="file">` programmatically for security reasons, and `fail()` cannot round-trip binary data back to the client anyway. The user must pick the file again. You can, however, restore the caption and any other text fields.

### 1.4 When classic actions are the right choice for uploads

- The upload is small (under a couple of MB).
- You do not need per-byte progress.
- You want the no-JS fallback (for example, a profile picture upload in a settings page).

### 1.5 When to reach for remote form functions instead (Lesson 9B.6)

- You need upload progress.
- You want Valibot to validate the file automatically with `v.file`, `v.mimeType`, `v.maxSize`.
- Your app already uses remote functions for everything and the classic path would be an inconsistency.

The two patterns are interoperable — you can have classic actions for one form and a remote form for another on the same page. Pick per-feature.

## 2. Style it — A dropzone that falls back to a plain input

Per-page brand is a fresh mint. The `<input type="file">` is visually hidden but keyboard-accessible; a styled label covers it with a dashed border. Under `prefers-reduced-motion`, hover effects are suppressed.

## 3. Interact — Watch the multipart boundary

After submitting, open the request in DevTools and look at the `Content-Type` header. It will say `multipart/form-data; boundary=----WebKitFormBoundary...`. The body is a structured block of text fields separated by that boundary. This is the classic HTTP file upload format — unchanged since the 1990s, still the best tool for the job.

## 4. Mini-build — Avatar + caption uploader

### File tree

```
src/routes/modules/10-api-forms/08-file-uploads/
├── +page.svelte       (styled file input + caption + result card)
└── +page.server.ts    (default action: validates size + type, returns metadata)
```

### DevTools moment

1. Submit a JPEG under 5 MB. The form returns the file metadata.
2. Submit a 10 MB image. The form rejects it with "Photo must be under 5 MB" — the text caption remains filled, the file input must be re-selected.
3. Disable JavaScript. Submit the same form. The page reloads, the action runs, the validation still works. Progressive enhancement all the way down.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What <code>enctype</code> does a form with a file input need?</summary>

`multipart/form-data`. Without it, the browser sends only the filename, not the file bytes.
</details>

<details>
<summary><strong>Q2.</strong> What type does <code>FormData.get('photo')</code> return?</summary>

`File | null` when the input had a file; `string | null` when it was a text field. Always narrow before using.
</details>

<details>
<summary><strong>Q3.</strong> Why can't you repopulate a file input after a failed submit?</summary>

Browsers do not allow JavaScript to set `<input type="file">` programmatically for security reasons. The user must pick the file again.
</details>

<details>
<summary><strong>Q4.</strong> When is the remote form pattern (Lesson 9B.6) preferable?</summary>

When you need upload progress, or when your schema-based validation belongs in the remote function's first argument, or when the rest of the app already uses remote functions.
</details>

<details>
<summary><strong>Q5.</strong> Is a 5 MB limit enforced in the client enough?</summary>

No. The server must enforce it too — any client-side check can be bypassed by a determined user.
</details>

## 6. Common mistakes

- **Forgetting <code>enctype="multipart/form-data"</code>.** The #1 file-upload bug. The handler sees a string, not a File.
- **Using <code>instanceof File</code> in a library context without the global.** In SvelteKit's Node server, `File` is globally available. In unit tests you may need to import it from `node:buffer`.
- **Loading a large file into RAM with <code>arrayBuffer()</code>.** Works for small images; use <code>stream()</code> for anything larger.
- **Returning the file contents in the action's return value.** The return value is serialised into the page's <code>form</code> prop — do not put binary data in there.

## 7. What's next

Module 10 ends here. The next module (11 — State Management at Scale) takes the CRUD patterns you just learned and scales them across an entire application with context, `.svelte.ts` files, and URL-as-state.
