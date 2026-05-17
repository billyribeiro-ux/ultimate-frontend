---
module: 10
lesson: 10.1
title: +server.ts — building API endpoints
duration: 55 minutes
prerequisites:
  - Module 8 — routing
  - Lesson 9B.10 — when to reach for `+server.ts`
learning_objectives:
  - Create a `+server.ts` file inside a route folder
  - Export typed `GET`, `POST`, `PUT`, `DELETE` handlers
  - Use `json()` and `error()` helpers from `@sveltejs/kit`
  - Read query params, path params, headers, and request bodies
  - Choose `+server.ts` over a remote function only when a public URL is needed
status: ready
---

# Lesson 10.1 — `+server.ts` — building API endpoints

## 1. Concept — The tool you reach for when the caller is not your own UI

### 1.1 What `+server.ts` is

A `+server.ts` file turns a route folder into an HTTP endpoint. Instead of exporting a `+page.svelte` (which produces a page) or a `+page.ts` (which produces a `load` function), you export named functions for each HTTP method you want to support: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`. SvelteKit turns them into a stable, addressable URL that anyone on the internet can call.

```ts
// src/routes/api/greeting/+server.ts
import { json, error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
    const name = url.searchParams.get('name');
    if (!name) error(400, 'name is required');
    return json({ message: `Hello, ${name}!` });
};
```

The URL becomes `/api/greeting`, callable as `GET /api/greeting?name=Ada`, and the response is a normal `application/json` payload. Any HTTP client can hit it — `curl`, Postman, a mobile app, a webhook service — because there is nothing SvelteKit-specific about the protocol. This is both the strength and the weakness of `+server.ts`: it is universal, but it is also the most boilerplate-heavy way to expose data.

### 1.2 `json()` and `error()`

Two helpers do almost everything:

- **`json(value, init?)`** wraps a value in a `Response` with `Content-Type: application/json`. You can pass an optional `ResponseInit` for custom headers or status codes: `json({ ok: true }, { status: 201 })`.
- **`error(status, message)`** throws a `HttpError` that SvelteKit turns into the appropriate HTTP response. It short-circuits the handler and is the idiomatic way to say "this is a 404" or "this is a 400 bad request".

```ts
export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    if (typeof body?.title !== 'string') error(400, 'title must be a string');
    // save...
    return json({ id: '1', title: body.title }, { status: 201 });
};
```

### 1.3 The four parts of a `RequestEvent`

Inside a handler you receive a `RequestEvent` with the standard SvelteKit API:

- `url` — the parsed `URL` object. `url.searchParams.get('key')` reads query parameters.
- `params` — path parameters from the route pattern, e.g. `[id]` becomes `params.id`.
- `request` — the standard [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object. `await request.json()`, `await request.formData()`, `await request.text()` all work.
- `cookies`, `fetch`, `locals`, `platform` — same objects you already know from `load()`.

### 1.4 When to use `+server.ts` vs a remote function

We answered this in 9B.10, but it bears repeating: `+server.ts` is for **public URLs**. That includes:

- **Webhooks** — Stripe, GitHub, Twilio, etc. call your server at a URL you give them.
- **OAuth callbacks** — `/auth/callback/google` is a URL the provider hard-codes into your app registration.
- **Mobile/desktop app APIs** — a cross-platform client needs a stable URL it can call with regular HTTP tooling.
- **File downloads** — you want `Content-Disposition`, `Content-Type`, `Content-Length` control and a URL users can bookmark or share.

For everything else — an internal fetch between your Svelte component and your own server — a `query`, `form`, or `command` is faster to write, more type-safe, and fewer moving parts.

### 1.5 Pairing with dynamic routes

`+server.ts` works with dynamic route segments. A file at `src/routes/api/post/[slug]/+server.ts` matches `/api/post/anything`, and the handler receives `params.slug` as a string.

```ts
export const GET: RequestHandler = async ({ params }) => {
    const slug: string = params.slug;
    // ... read from storage
    return json({ slug });
};
```

### 1.6 What SvelteKit does under the hood

A `+server.ts` file follows a simple HTTP lifecycle with no special framework magic:

1. **Routing.** SvelteKit's router matches the incoming request URL and HTTP method to the correct `+server.ts` file and exported handler. A `GET` request to `/api/greeting` calls the `GET` export. A `POST` to the same URL calls the `POST` export.

2. **Handler invocation.** The handler receives a `RequestEvent` with the full request context: URL, params, headers, cookies, body, locals. The handler returns a standard web `Response` object.

3. **Response delivery.** SvelteKit sends the `Response` to the client. No serialisation, no devalue, no SSR. The response is exactly what your handler returned — headers, status, body.

4. **Content negotiation.** If a route has both `+page.svelte` and `+server.ts`, SvelteKit picks based on the `Accept` header. A browser requesting HTML gets the page. A `fetch` request with `Accept: application/json` gets the API handler. This lets you colocate a page and its API at the same URL.

Unlike load functions (which run before rendering and whose results are embedded in HTML), and unlike remote functions (which generate endpoints automatically), `+server.ts` handlers are raw HTTP. You control the response format, headers, status code, and caching directives completely.

### 1.7 The TypeScript angle

The auto-generated `RequestHandler` type from `./$types` constrains the `params` based on the route pattern:

```ts
// src/routes/api/post/[slug]/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    // params.slug is typed as `string` (from the [slug] folder)
    // params.id would be a TypeScript error (no [id] in the route)
    return json({ slug: params.slug });
};
```

If you import `RequestHandler` from `@sveltejs/kit` instead of `./$types`, `params` is typed as `Partial<Record<string, string>>` — you lose the route-specific inference. Always import from `./$types`.

For request body typing, TypeScript cannot help at the type level because `request.json()` returns `Promise<any>`. You must validate at runtime:

```ts
import * as v from 'valibot';

const CreateGreeting = v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    language: v.optional(v.picklist(['en', 'es', 'de']), 'en')
});

export const POST: RequestHandler = async ({ request }) => {
    const raw: unknown = await request.json().catch(() => null);
    const result = v.safeParse(CreateGreeting, raw);
    if (!result.success) {
        return json({ errors: result.issues }, { status: 400 });
    }
    // result.output is typed as { name: string; language: 'en' | 'es' | 'de' }
    return json({ greeting: `Hello, ${result.output.name}!` }, { status: 201 });
};
```

### 1.8 Comparison: +server.ts vs remote functions vs classic REST frameworks

| Aspect | `+server.ts` | Remote function | Express/Fastify |
| --- | --- | --- | --- |
| Type safety | Params auto-typed, body manual | Full (schema + return type) | Fully manual |
| Validation | Manual (Valibot recommended) | Automatic (Valibot schema) | Manual (middleware) |
| URL | Explicit (folder path) | Auto-generated (hashed) | Explicit (route definition) |
| Response format | Any (JSON, text, binary, stream) | JSON/devalue only | Any |
| Who can call it | Anyone (public URL) | Your SvelteKit UI only | Anyone (public URL) |
| Middleware | Via hooks.server.ts | N/A (handled by framework) | Via middleware chain |
| File download support | Full (Content-Disposition, streaming) | No | Full |

> **In production sidebar.** We maintain 8 `+server.ts` endpoints in our SvelteKit app. Five are webhooks (Stripe, GitHub, Sendgrid, Twilio, a CMS), two are file download endpoints (PDF invoice, CSV export), and one is an OAuth callback. All other server communication — about 40 endpoints worth — uses remote functions. The ratio tells the story: `+server.ts` is for external consumers and special HTTP needs. Remote functions handle everything internal. If you find yourself writing more than a handful of `+server.ts` files, ask whether some of them could be remote functions instead.

### 1.9 Common interview question

**Q: "When would you use a `+server.ts` endpoint in SvelteKit instead of a remote function or a form action?"**

**Model answer:** `+server.ts` is the right choice when you need a stable, public HTTP URL that external systems can call. Three concrete scenarios: (1) Webhooks — Stripe, GitHub, and other services POST to a URL you register with them; they cannot call a remote function. (2) OAuth callbacks — identity providers redirect to a URL in your app; that URL must be stable and documented. (3) File downloads — you need full control over `Content-Type`, `Content-Disposition`, and streaming binary data. (4) Cross-platform APIs — if a mobile app or third-party consumer needs to call your server, they use standard HTTP, not SvelteKit's RPC protocol. For any data exchange between your own SvelteKit frontend and your own server, remote functions are more type-safe, less boilerplate, and fewer files.

## Deep Dive

**Content negotiation between pages and API.** A route can have both `+page.svelte` and `+server.ts`. SvelteKit uses the `Accept` header to decide which to serve. A browser navigation (which sends `Accept: text/html`) gets the page. A `fetch('/api/greeting', { headers: { Accept: 'application/json' } })` gets the API. This is elegant but rarely used in practice — most teams put API routes under an `/api/` prefix for clarity.

**Streaming responses.** `+server.ts` handlers can return streaming responses for large payloads:

```ts
export const GET: RequestHandler = async () => {
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(new TextEncoder().encode('chunk 1'));
            setTimeout(() => {
                controller.enqueue(new TextEncoder().encode('chunk 2'));
                controller.close();
            }, 1000);
        }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/plain' } });
};
```

This is useful for server-sent events (SSE), large file downloads, or real-time log streaming.

**CORS headers.** If your `+server.ts` endpoint is called from a different origin (cross-origin), you need CORS headers. Add them in the handler or in `hooks.server.ts`:

```ts
export const GET: RequestHandler = async () => {
    return json({ data: '...' }, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST'
        }
    });
};
```

For preflight requests, export an `OPTIONS` handler that returns the CORS headers with a 204 status.

## Going Deeper

- **SvelteKit docs:** [Routing — server](https://svelte.dev/docs/kit/routing#server) covers `+server.ts` in detail.
- **Advanced pattern:** Create a typed API client utility that mirrors your `+server.ts` endpoints. Export response type interfaces from the `+server.ts` file and import them in the client utility for type-safe `fetch` calls.
- **Challenge:** Create a `+server.ts` endpoint that returns a CSV file with proper `Content-Type: text/csv` and `Content-Disposition: attachment; filename="data.csv"` headers. Visit the URL in a browser — does it download the file? Now call it with `fetch` from a component — can you read the CSV text?

## 2. Style it — A small API console page

This lesson's mini-build has two parts: a `+server.ts` endpoint at `/api/greeting`, and a `+page.svelte` that calls it with `fetch` and renders the response. Per-page brand is a dusty rose to distinguish Module 10 from Module 9B.

## 3. Interact — Read the request, write the response

The hands-on part is making the endpoint *work*. Write the handler, type `curl 'http://localhost:5173/api/greeting?name=Grace'` in a terminal, and see the JSON. Then build a tiny client UI that calls the same URL and renders the message.

## 4. Mini-build — Hello-world HTTP endpoint

### File tree

```
src/routes/modules/10-api-forms/01-server-endpoints/
├── +page.svelte               (client that calls the endpoint)
└── api/greeting/+server.ts    (the endpoint itself)
```

Because `+server.ts` files work anywhere in the `routes/` tree, we can colocate the endpoint under the lesson directory for clarity.

### DevTools moment

1. Visit the page. Click the **Call endpoint** button. In the Network tab you see a `GET` request to the colocated `api/greeting` URL.
2. Click again with an empty name input. The endpoint responds with a 400; the page shows the error message.
3. Open `/modules/10-api-forms/01-server-endpoints/api/greeting?name=You` directly in the browser. You see the raw JSON response — the URL is as public as any other.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What file name turns a route folder into an API endpoint?</summary>

`+server.ts` (or `.js`). The exported functions — `GET`, `POST`, `PUT`, etc. — each become a handler for that HTTP method.
</details>

<details>
<summary><strong>Q2.</strong> Difference between <code>json({ ok: true })</code> and <code>error(400, '...')</code>?</summary>

`json()` returns a successful `Response` with a JSON body. `error()` *throws* an `HttpError` that SvelteKit turns into the given status code and short-circuits the handler.
</details>

<details>
<summary><strong>Q3.</strong> How do you read a query parameter from inside a handler?</summary>

Use `url.searchParams.get('key')` on the `RequestEvent`.
</details>

<details>
<summary><strong>Q4.</strong> Which is more type-safe: a remote function or a <code>+server.ts</code> endpoint?</summary>

The remote function, by a wide margin. Its return type automatically flows to the caller. A `+server.ts` handler's response body is typed only as much as your hand-written interfaces say it is.
</details>

<details>
<summary><strong>Q5.</strong> Name three scenarios where <code>+server.ts</code> is the right choice.</summary>

Webhooks, OAuth callbacks, and public APIs consumed by clients that cannot use remote functions (mobile apps, third parties, curl).
</details>

## 6. Common mistakes

- **Using `+server.ts` for internal UI fetches.** You pay the boilerplate cost for no benefit. Remote functions exist to solve exactly this.
- **Returning a raw object from the handler.** You must return a `Response` — use `json()` to wrap data.
- **Forgetting to throw `error()` on invalid input.** Returning a 200 with `{ ok: false }` makes HTTP caching and external tooling cry. Use the right status code.
- **Not typing the handler as `RequestHandler`.** Without the type, TypeScript cannot catch mistakes in the event shape, and `params` turns into `Record<string, string>` with no route-specific inference.

## 7. What's next

Lesson 10.2 deepens the type story: `RequestHandler<Params, OutputBody, InputBody>` and route-aware generics.
