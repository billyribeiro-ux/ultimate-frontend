---
chunk: form-remote-validation
level: 3
penalty: high
---

# Form Remote + Valibot — Level 3 Code Reveal

**`src/lib/server/contact.remote.ts`**

```ts
import { form } from '$app/server';
import * as v from 'valibot';

const contactSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
	email: v.pipe(v.string(), v.email('Must be a valid email')),
	message: v.pipe(v.string(), v.minLength(10, 'Message must be at least 10 characters'))
});

export type ContactInput = v.InferOutput<typeof contactSchema>;

export const sendContact = form(contactSchema, async (input: ContactInput) => {
	// In a real app, persist or send to an inbox service.
	console.log('contact submission', input);
	return { ok: true, savedAt: new Date().toISOString() };
});
```

**`src/routes/contact/+page.svelte`**

```svelte
<script lang="ts">
	import { sendContact } from '$lib/server/contact.remote';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';

	let name = $state('');
	let email = $state('');
	let message = $state('');
</script>

<section class="page stack">
	<h1>Contact</h1>

	{#if sendContact.result?.ok}
		<p class="success">Thanks — we will reply within one business day.</p>
	{:else}
		<form {...sendContact} class="form stack">
			<Input label="Name" name="name" bind:value={name} error={sendContact.issues?.name?.[0]?.message} />
			<Input label="Email" name="email" type="email" bind:value={email} error={sendContact.issues?.email?.[0]?.message} />
			<Input label="Message" name="message" bind:value={message} error={sendContact.issues?.message?.[0]?.message} />
			<Button type="submit">{#snippet children()}Send{/snippet}</Button>
		</form>
	{/if}
</section>

<style>
	section { --color-brand: oklch(68% 0.2 320); }
	.form { max-inline-size: 32rem; }
	.success { padding: var(--space-md); background: var(--color-surface-2); border-inline-start: 4px solid var(--color-success); border-radius: var(--radius-md); }
</style>
```
