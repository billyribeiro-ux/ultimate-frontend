---
chunk: form-remote-validation
title: Form Remote + Valibot
module: 9B, 10
---

# Form Remote + Valibot — Brief

Build the capstone's contact form with a `form` Remote Function, server-side Valibot validation, and progressive enhancement.

## What to build

- `src/lib/server/contact.remote.ts` — exports a `form` Remote Function `sendContact` that takes a Valibot-validated schema (`name`, `email`, `message`).
- `src/routes/contact/+page.svelte` — a real HTML `<form>` that binds to the remote function. Uses `Input` and `Button` from the component library.
- Client shows inline per-field errors returned by the server when validation fails.
- On success, the page shows a "Thanks — we'll reply within one business day" confirmation and clears the form.

## Acceptance criteria

- Works with JavaScript disabled (the `<form>` still submits and the server renders the result).
- With JS enabled, submission is progressive — no full reload, the confirmation fades in.
- Valibot schema lives in one place and is reused for both validation and the TypeScript type.
- `email` must be a valid RFC 5322 email; `message` minimum 10 characters.

## How it connects to the capstone

This is the capstone's only write path. It proves the student can handle the end-to-end write flow — typed, validated, progressive. It uses the `Button` and `Input` components from `component-architecture` and lives in the `contact/+page.svelte` route stubbed in `page-routing-setup`.
