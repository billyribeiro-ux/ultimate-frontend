---
chunk: form-remote-validation
level: 2
penalty: medium
---

# Form Remote + Valibot — Level 2 Concept Reveal

A `form` Remote Function is a typed, server-only handler that you bind directly to a Svelte `<form>`. It receives the form data, validates it against a schema, and returns either a success result or a typed error object.

**Valibot** is the tiny schema library of choice in May 2026 — smaller than Zod, same ergonomics. A Valibot schema is a value you can use at runtime (`v.parse`, `v.safeParse`) and whose shape can be extracted as a TypeScript type (`v.InferOutput`).

### Pseudocode

```
// src/lib/server/contact.remote.ts
import { form } from '$app/server';
import * as v from 'valibot';

const contactSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    email: v.pipe(v.string(), v.email()),
    message: v.pipe(v.string(), v.minLength(10))
});

export const sendContact = form(contactSchema, async (input) => {
    // input is typed as { name: string; email: string; message: string }
    await saveToInbox(input);
    return { ok: true };
});
```

```
// contact/+page.svelte
import { sendContact } from '$lib/server/contact.remote';
import Input from '$lib/components/Input.svelte';
import Button from '$lib/components/Button.svelte';

<form {...sendContact}>
    <Input label="Name" name="name" value="" error={sendContact.errors?.name} />
    <Input label="Email" name="email" type="email" value="" error={sendContact.errors?.email} />
    <Input label="Message" name="message" value="" error={sendContact.errors?.message} />
    <Button type="submit">Send</Button>
</form>

{#if sendContact.result?.ok}
    <p>Thanks — we will reply within one business day.</p>
{/if}
```

### Two paths, one component

Without JS: the form posts normally, SvelteKit runs `sendContact`, re-renders the page with either the success result or the per-field errors in the initial HTML.

With JS: SvelteKit intercepts the submit, sends a typed request to the same function, patches the component's state with the response. The user never leaves the page.

### Connecting it to the capstone

This is the single write path in the capstone. If the student gets this chunk, they know every piece of the capstone's data story: `query` for reads, `command`/`form` for writes, `batch` for coalescing, and shared types for the entire thing.
