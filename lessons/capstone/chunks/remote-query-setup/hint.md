---
chunk: remote-query-setup
level: 1
penalty: 0
---

# Remote Query Setup — Level 1 Hint (free)

Remote Functions are a SvelteKit 2.55+ feature that lets you declare a server function in a `.remote.ts` file and import it directly into a Svelte component. The framework handles the transport: the import resolves to a local function call on the server, and to a typed fetch call on the client.

A `query` is the read flavour. It behaves like `load()` for SSR but stays live on the client — you can re-invoke it without navigating, and SvelteKit updates the result in place. For a dashboard that needs a "refresh" button, that is exactly what you want.

Think about two things before you type:

1. **Where does the query function live?** Not in `+page.ts` — in a `.remote.ts` file. That is the signal to SvelteKit that this function is a Remote Function.
2. **How do you call it from the component?** With `await` inside the component body. Svelte 5.55 supports top-level `await` in `<script>` under the async components flag; the initial value is SSRed, and later re-invocations are client-side.
