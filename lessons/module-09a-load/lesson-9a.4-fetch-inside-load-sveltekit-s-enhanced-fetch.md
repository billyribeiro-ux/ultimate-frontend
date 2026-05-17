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

### 1.7 What SvelteKit does under the hood

The enhanced fetch is not magic — it is a carefully engineered wrapper around the standard `fetch` API. Here is the internal lifecycle for a fetch call inside a server load during SSR:

**Step 1 — URL resolution.** Your load calls `fetch('/api/posts')`. The enhanced fetch detects a relative URL. Instead of making a network request to itself (which would require knowing its own origin, port, and protocol), SvelteKit calls the `+server.ts` handler for `/api/posts` *directly in-process*. The request never touches the network stack. This is why relative URLs "just work" on the server — they are function calls, not HTTP requests.

**Step 2 — Cookie forwarding.** SvelteKit reads the `cookie` header from the original incoming request and attaches it to the internal fetch. Your `/api/posts` handler sees `event.cookies` with the real user's session — even though the call came from a load function, not a browser. Without this forwarding, the API handler would think the request is unauthenticated.

**Step 3 — Deduplication.** SvelteKit maintains a per-request cache keyed by URL and request options. If another load function on the same render pass also calls `fetch('/api/posts')` with the same options, SvelteKit returns the same `Response` clone. One handler invocation, two consumers.

**Step 4 — Response recording.** The response body and headers are recorded. SvelteKit serialises them and embeds them into the HTML payload inside a `<script type="application/json" sveltekit:data-type="data">` tag (the exact attribute name may change between versions, but the concept is stable).

**Step 5 — Client-side replay.** During hydration, the client's enhanced fetch intercepts calls to the same URLs. Instead of making a real network request, it reads the embedded response from the DOM and returns it as a `Response` object. The component sees the same data it saw on the server, with zero network cost.

**During client-side navigation**, the enhanced fetch behaves differently:
- Relative URLs to your own endpoints are fetched over the network (the browser is now the caller).
- External URLs are fetched normally.
- There is no deduplication across navigations (each navigation is a fresh context).
- Responses are not embedded in HTML (there is no HTML to embed into during a client navigation).

### 1.8 The TypeScript angle

The enhanced fetch has the same signature as the global `fetch`, but TypeScript knows it is the enhanced version because the `PageLoad` or `PageServerLoad` type includes it as a specific property on the event:

```ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    // fetch is typed as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    // Identical signature to globalThis.fetch, but different runtime behavior.
    const res = await fetch('/api/posts');
    return { posts: await res.json() as Post[] };
};
```

The typing is intentionally identical to `globalThis.fetch` so that any existing fetch wrapper or utility function works without changes. The only difference is runtime behavior, not types. This means you can write a utility like `fetchJSON<T>(url: string): Promise<T>` that accepts either the enhanced or global fetch, and it will work correctly in both environments.

However, one TypeScript subtlety: `response.json()` always returns `Promise<any>`. You must assert or validate the type yourself. This is a limitation of the Fetch API spec, not SvelteKit. Remote functions (Module 9B) solve this by making the return type part of the function signature.

### 1.9 Comparison: enhanced fetch vs global fetch vs remote query

| Aspect | Enhanced `fetch` (in load) | Global `fetch` (in component) | Remote `query` |
| --- | --- | --- | --- |
| Relative URL resolution on server | In-process call | Needs absolute URL | Not applicable (RPC) |
| Cookie forwarding | Automatic | Manual | Automatic |
| Response deduplication | Yes (per request) | No | Yes (per argument) |
| Response inlining in HTML | Yes | No | Yes (during SSR) |
| Return type safety | Manual (`as` cast) | Manual (`as` cast) | Automatic (inferred) |
| Works in `onMount` | No (load only) | Yes | Yes |
| Works with external APIs | Yes | Yes | No (server functions only) |

> **In production sidebar.** We once debugged a production issue where a dashboard page loaded slowly despite fast API endpoints. The culprit: the developer had used `globalThis.fetch` instead of the event's `fetch` inside a `+page.server.ts` load. The load was making a network request to `http://localhost:3000/api/stats` — a full HTTP round trip to itself. On the server, this meant the request went out through the network stack, hit the OS's loopback interface, came back to the same Node process, ran the handler, and returned. Total cost: 15 ms instead of < 1 ms. Multiply by 5 such calls per page, and the load was 75 ms slower than it needed to be. Switching to `event.fetch('/api/stats')` eliminated 70 ms. The enhanced fetch's in-process call for relative URLs is not a convenience feature — it is a performance feature.

### 1.10 Common interview question

**Q: "What are the four advantages of SvelteKit's enhanced fetch over the global fetch, and when would you still use the global fetch?"**

**Model answer:** The enhanced fetch provides: (1) correct relative URL resolution on the server via in-process handler invocation, (2) automatic cookie forwarding from the incoming request, (3) request deduplication across loads in the same render pass, and (4) response inlining into the HTML so the client does not re-fetch during hydration. You would still use the global fetch when you need to make a request outside a load function — for example, in an `onMount` callback or a `$effect` that fetches data in response to a user action. The enhanced fetch only exists on the load event object and cannot be used elsewhere.

## Deep Dive

**Why response inlining changes the performance model.** Without inlining, SSR is slower than CSR for data-heavy pages. The server renders the HTML, the browser downloads it, then the browser re-fetches the same data to hydrate. With inlining, hydration is free — the data is already in the HTML. This is why SvelteKit pages feel "instant" on the first load: the browser is not making any fetch calls during hydration. The only cost is the slightly larger HTML payload (the embedded data), which is almost always worth the trade because a single TCP connection delivering a larger response is faster than two sequential requests (HTML then data).

**The `depends` integration.** Every URL fetched with the enhanced fetch is automatically registered as a dependency. If you later call `invalidate('/api/posts')`, SvelteKit knows which loads fetched that URL and re-runs them. You do not need to call `depends()` manually for URL-based invalidation — the enhanced fetch does it for you. Manual `depends()` is only needed for non-URL dependencies like custom string keys.

**Edge case: POST requests.** The enhanced fetch can make POST requests too, but they are not deduplicated (because POST is not idempotent). Cookie forwarding still applies. In-process resolution still applies. But the deduplication and inlining are skipped for any non-GET request.

## Going Deeper

- **SvelteKit docs:** [Loading data — Making fetch requests](https://svelte.dev/docs/kit/load#Making-fetch-requests) details every behavior of the enhanced fetch.
- **Advanced pattern:** Write a typed fetch wrapper that accepts the enhanced fetch as a parameter: `async function api<T>(fetch: typeof globalThis.fetch, path: string): Promise<T>`. This lets you unit-test the wrapper with a mock fetch and use the enhanced fetch in production.
- **Challenge:** In a load function, make two identical `fetch('/api/posts')` calls and log the response bodies. Are they the same object? (Hint: yes — the second call returns a clone of the first response. But `response.json()` can only be called once per `Response` object, so you need to clone before consuming.)

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
