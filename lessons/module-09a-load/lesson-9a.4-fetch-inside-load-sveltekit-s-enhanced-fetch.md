---
module: 9A
lesson: 9A.4
title: fetch inside load — SvelteKit's enhanced fetch
duration: 55 minutes
prerequisites:
  - Lesson 9A.1 — Load functions
  - Lesson 9A.3 — $types
  - Basic familiarity with fetch and JSON
learning_objectives:
  - Use the fetch argument on the load event instead of the global fetch
  - List four things SvelteKit's enhanced fetch does differently
  - Fetch a public API and display the result with typed response interfaces
  - Handle a failed fetch with error() from @sveltejs/kit
  - Recognise when to use the enhanced fetch and when it does not apply
status: ready
---

# Lesson 9A.4 — `fetch` inside load — SvelteKit's enhanced fetch

## 1. Concept — A smarter fetch that you get for free

### 1.1 The problem — four subtle things a plain fetch gets wrong in SSR

Inside a load function you often need to call an API. You might reach for the global `fetch` — it is a web standard, it works in Node and in browsers, what could go wrong? Four things, and all of them cost real performance:

1. **Absolute URLs everywhere.** A plain `fetch('/api/posts')` works in the browser because the browser knows the current origin. On the server during SSR, "the current origin" is ambiguous. You end up writing `fetch('http://localhost:5173/api/posts')` and hard-coding ports.
2. **No cookie forwarding.** If your API endpoint checks the user's session cookie, a plain server-side fetch does not carry any cookies. The endpoint sees an anonymous request and responds wrong.
3. **No deduplication.** If your load function fetches `/api/posts/hello` and a parent layout also fetches the same URL in its own load, that is two network requests for identical data. Nothing in a plain fetch knows about the other.
4. **Double round trips during hydration.** If the server fetched data for the initial render, the HTML already contains that data. But a plain client fetch would re-fetch the same URL anyway on hydration. Wasteful.

SvelteKit's answer is an **enhanced fetch** passed into your load function as one of the event arguments. It looks identical to the global fetch — same signature, same return type — but it fixes all four problems silently.

### 1.2 How to use it

```ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch('/api/posts/hello');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const post = await response.json();
    return { post };
};
```

The only difference from a plain fetch is the `{ fetch }` destructure. Always destructure it; always use this fetch inside a load, never the global one.

### 1.3 What the enhanced fetch does for you

1. **Relative URLs resolve correctly on the server.** `fetch('/api/posts')` on the server is rewritten to hit your own SvelteKit server without a network round trip — it runs the endpoint's handler in-process.
2. **Cookies are forwarded.** The `cookie` header from the incoming request is forwarded automatically, so your API endpoint sees the real user.
3. **Deduplication.** If two loads in the same request fetch the same URL, the enhanced fetch returns the same promise. One network call, two consumers.
4. **Inlining.** Responses fetched during SSR are embedded into the HTML payload. On hydration, the client's enhanced fetch sees a matching URL, reads the inlined data, and skips the network entirely.

You get all four for free just by using `event.fetch` instead of the global one.

### 1.4 Fetching a public API

The enhanced fetch does not magically make external APIs faster — it cannot, those calls still go over the real network. But inlining still applies: an external API response fetched on the server is embedded into the HTML, and the client does not re-fetch it during hydration.

The module project uses the public Open-Meteo API (`https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m`), which requires no API key and returns a fixed JSON shape:

```ts
interface OpenMeteoResponse {
    latitude: number;
    longitude: number;
    current: {
        time: string;
        temperature_2m: number;
    };
}
```

Typing the response lets you use it confidently in the component. Always write an interface for API responses you do not control; never rely on `any`.

### 1.5 Error handling inside load

If the API call fails, you have two options. The wrong one: let the error propagate unhandled. SvelteKit will render its default error page, but the error is technical and the user does not know what to do.

The right one: use the `error` helper from `@sveltejs/kit`:

```ts
import { error } from '@sveltejs/kit';

if (!response.ok) {
    throw error(response.status, 'Could not load the forecast. Please try again.');
}
```

`error(status, message)` throws a typed error SvelteKit recognises. It stops the load, renders the nearest `+error.svelte`, and the `page.error` object contains the message. Lesson 9A.8 goes deeper on error handling.

### 1.6 When the enhanced fetch does not apply

If you call a fetch inside a component (inside `onMount` or a `$effect`), you get the plain global fetch. The enhanced fetch lives on the load event only. Data-fetching logic that needs inlining and deduplication belongs in load, not in the component.

## 2. Style it — PE7 for a weather card

The mini-build shows the current temperature for Berlin from Open-Meteo. We give the card a cool blue personality (`oklch(70% 0.16 210)`) and format the temperature with one decimal place. The card has a 44px minimum tap target on mobile.

## 3. Interact — calling an external API with the enhanced fetch

```ts
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

interface Forecast {
    latitude: number;
    longitude: number;
    current: {
        time: string;
        temperature_2m: number;
    };
}

export const load: PageLoad = async ({ fetch }) => {
    const url =
        'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m';
    const response = await fetch(url);
    if (!response.ok) {
        throw error(response.status, 'Failed to load forecast');
    }
    const data: Forecast = await response.json();
    return { forecast: data };
};
```

## 4. Mini-build — a live weather card

**Paths:**

- `src/routes/modules/09a-load/04-enhanced-fetch/+page.svelte`
- `src/routes/modules/09a-load/04-enhanced-fetch/+page.ts`

Open the page. You will see "Berlin" and a temperature in degrees Celsius. On first load the fetch happens on the server and the value is baked into the HTML. On navigations within the app it happens in the browser.

### Prove it

1. Open DevTools → Network.
2. Full reload the page (Cmd/Ctrl + R). You will **not** see a request to `api.open-meteo.com` in the Network panel — because the fetch ran on the server and its response was inlined into the HTML.
3. Navigate away to another lesson and back. Now the Network panel **does** show `api.open-meteo.com`, because the enhanced fetch ran client-side this time.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why do you destructure <code>{ fetch }</code> from the load event instead of using the global <code>fetch</code>?</summary>

Because the destructured version is SvelteKit's enhanced fetch: it resolves relative URLs correctly on the server, forwards cookies, deduplicates identical requests, and inlines server responses into the HTML so the client does not re-fetch them during hydration. The global fetch does none of those.
</details>

<details>
<summary><strong>Q2.</strong> What happens if two load functions in the same request fetch the same URL?</summary>

The enhanced fetch returns the same promise to both callers, so only one network request is made. Without the enhanced fetch you would hit the network twice.
</details>

<details>
<summary><strong>Q3.</strong> What is response inlining?</summary>

SvelteKit embeds any response fetched on the server into the HTML it sends to the browser. When the enhanced fetch runs on the client during hydration, it recognises the URL and reads the data from the embedded payload instead of making a network request. That eliminates the double-fetch problem.
</details>

<details>
<summary><strong>Q4.</strong> How do you throw a user-visible error from a failed fetch in load?</summary>

`import { error } from '@sveltejs/kit'` and call `throw error(status, message)`. SvelteKit stops the load, renders the nearest `+error.svelte`, and exposes the error as `page.error`.
</details>

<details>
<summary><strong>Q5.</strong> Can you use the enhanced fetch inside <code>onMount</code>?</summary>

No. It only exists on the load event. Inside a component lifecycle hook, you have the plain global fetch. If you need inlining and deduplication, move the data fetching into a load function.
</details>

## 6. Common mistakes

- **Using the global `fetch` inside load.** It works locally but loses inlining and cookie forwarding in production.
- **Not checking `response.ok`.** A 404 is not a JavaScript error — it is a successful fetch with a 404 status. Always check `ok` before parsing the body.
- **Hard-coding absolute URLs to your own API.** Use a relative `/api/posts/...` path; the enhanced fetch resolves it correctly on both server and client.
- **Typing the response as `any`.** Write an interface matching the API's documented shape. If the API shape changes, TypeScript tells you immediately.

## 7. What's next

Lesson 9A.5 introduces layout loads — data that applies to many pages — and the `parent()` helper that lets a child load read what its parent returned.
