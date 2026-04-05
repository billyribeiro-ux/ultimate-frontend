# Module 10 Project — Full CRUD Note-Taking App

**Brief:** build a complete note-taking app that exercises every classic SvelteKit server pattern. The app must be fully functional with JavaScript disabled — that is the acceptance criterion that separates this project from any JS-first SPA. Every form must progressively enhance with `use:enhance` when JS is available, and every action must re-validate with Valibot on the server.

## Target feature set

1. **List notes.** The main page shows every note, sorted by newest first. Initial render happens via a `+page.server.ts` `load()` so crawlers and JS-off users see the same content.
2. **Create notes.** A form at the top of the page creates a new note with `title` + `body`. Named action `?/create`. `use:enhance` shows a pending state.
3. **Edit notes.** Each note has an **Edit** button that flips the card into an inline form targeting the `?/update` action. Cancel reverts without a network call.
4. **Delete notes.** Each note has a delete button that submits a tiny form to `?/remove`. Optimistic UI via `use:enhance`'s post-submit callback.
5. **Server-side validation.** Every action parses `FormData` through a Valibot schema and returns typed errors via `fail()`. The component renders per-field errors from the `form?.issues` array and repopulates text fields from `form?.values`.
6. **Attachments.** Notes can optionally have one image attachment, uploaded through a file input with `enctype="multipart/form-data"`, validated for MIME and size on the server.
7. **Public JSON feed.** A `+server.ts` endpoint at `/api/notes.json` returns the current notes list as JSON. This is the only part of the app that uses `+server.ts` — and it exists precisely because it is a public URL third parties might consume.
8. **Environment variables.** A `PUBLIC_APP_NAME` (`$env/static/public`) is displayed in the header, and a `DATABASE_URL` placeholder (`$env/static/private`) is read inside `+page.server.ts` but never leaked to the client.

## Required file shape

```
src/routes/projects/10-notes-app/
├── +page.svelte                # list + create + inline edit + delete
├── +page.server.ts             # actions: create, update, remove; load for list
├── api/notes.json/+server.ts   # public JSON feed (GET only)
└── _lib/
    ├── notes-store.ts          # in-memory store (replace with db in production)
    └── note-schema.ts          # shared Valibot schema reused across actions
```

## Progressive enhancement acceptance test

The project must pass this test:

1. Open the app in a browser.
2. Open DevTools Command Menu and run **Disable JavaScript**.
3. Reload the page.
4. Create a note, edit a note, delete a note, upload an attachment.
5. Every operation must succeed with a full-page reload and visible validation errors for invalid input.
6. Re-enable JavaScript. Every operation must succeed **without** a full-page reload and with pending-state UI.

A single failure at step 5 is a project failure.

## PE7 requirements

- Per-project color personality.
- Fluid spacing/typography from tokens only.
- Mobile-first responsive layout — the list is one column on mobile, two on tablet.
- `aria-invalid` on all form fields via conditional attribute bindings.
- 44 px minimum touch target on buttons.
- `prefers-reduced-motion` suppresses the inline-edit flip animation.

## TypeScript requirements

- Strict mode, zero `any`.
- A single `Note` interface defined once, imported from `_lib/notes-store.ts` by every file that needs it.
- A single Valibot schema in `_lib/note-schema.ts`, used by every action.
- `form` prop typed as a discriminated union with a `which` field on every return value.

## Deliverables

- All files above in `src/routes/projects/10-notes-app`.
- A short README at `lessons/module-10-api-forms/project/README.md` explaining how to run the project and which lesson each feature maps to.
- Every `.svelte` file validated with `svelte-autofixer`.
- Lighthouse mobile Accessibility score 100.

## Grading rubric

| Criterion                                  | Weight |
| ------------------------------------------ | ------ |
| No-JS acceptance test passes end-to-end    | 25%    |
| Valibot validates every action input      | 15%    |
| `use:enhance` with pending state on all forms | 15%    |
| Public JSON feed via `+server.ts`         | 10%    |
| `$env` modules used correctly (pub vs priv) | 10%    |
| File upload validation on the server      | 10%    |
| PE7 + a11y compliance                     | 15%    |
