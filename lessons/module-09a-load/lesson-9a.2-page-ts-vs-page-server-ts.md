---
module: 9A
lesson: 9A.2
title: +page.ts vs +page.server.ts
duration: 50 minutes
prerequisites:
  - Lesson 9A.1 — What load functions are
learning_objectives:
  - Explain the difference between a universal and a server-only load
  - Pick the right file for a given data source
  - Understand which code ships to the browser and which does not
  - Combine +page.ts and +page.server.ts in the same route
  - Recognise server-only imports ($env/static/private, $lib/server/*)
status: ready
---

# Lesson 9A.2 — `+page.ts` vs `+page.server.ts`

## 1. Concept — Two places for load, two different audiences

### 1.1 The problem — some code cannot leave the server

Load functions let you put data fetching next to the page that needs it. Great. But data fetching comes in two flavours with incompatible requirements.

**Flavour one: public HTTP APIs.** You call `fetch('/api/posts')` or `fetch('https://api.open-meteo.com/...')`. This code can run anywhere — on the server or in the browser. Both have `fetch`, both can make HTTPS requests, both produce the same result.

**Flavour two: direct database or secret access.** You call `db.select().from(posts)` or you read `process.env.STRIPE_SECRET_KEY`. This code **must never run in the browser**. If it did, the secret key would ship in the JavaScript bundle and any attacker could read it, and the database connection string would be in the client code for the world to see.

SvelteKit solves this by giving you two files for load functions. **`+page.ts` is universal** — it runs on the server on the first request and in the browser on subsequent navigations. Whatever is in it ends up in your client bundle. **`+page.server.ts` is server-only** — it runs on the server for every request, never ships to the browser, and the bundle only contains the serialised JSON of its return value.

### 1.2 The rule

**If your load function imports anything server-only, it must live in `+page.server.ts`.** If it does not, it can live in either, and `+page.ts` is typically better because it avoids a round trip on client navigations.

Examples of server-only things:

- Any database client (`drizzle`, `prisma`, `kysely`, `better-sqlite3`)
- Any `$env/static/private` or `$env/dynamic/private` import (your secrets)
- Any `$lib/server/...` module (a convention that tells SvelteKit never to ship these to the client)
- Node builtins like `node:fs`, `node:crypto` (some of these now work in the browser too, but stick to `+page.server.ts` unless you are sure)

### 1.3 What happens on the wire

Consider a blog post fetched from the database. You put the query in `+page.server.ts`:

```ts
// +page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
    const post = await db.posts.findUnique({ where: { slug: params.slug } });
    return { post };
};
```

On the initial request SvelteKit runs this on the server, embeds the serialised `post` into the HTML, and sends it. On a client-side navigation to the same page, SvelteKit does *not* ship the database code to the browser — instead, it asks its own server endpoint for the JSON. The client never sees the database client, and the browser bundle is smaller.

### 1.4 Combining `+page.ts` and `+page.server.ts`

You can have both files for the same route. When both exist, the server load runs first, its result is passed to the universal load as the `data` argument, and the universal load returns the final merged data. This is the standard pattern for pages that need both private and public data:

```ts
// +page.server.ts
export const load: PageServerLoad = async () => {
    return { currentUser: await getCurrentUser() };
};
```

```ts
// +page.ts
export const load: PageLoad = async ({ data, fetch }) => {
    const stats = await fetch('/api/public-stats').then((r) => r.json());
    return { ...data, stats };
};
```

The final `data` prop in the page is `{ currentUser, stats }`. The `currentUser` came from the server-only load; the `stats` came from a public API the universal load fetched. Both are typed.

### 1.5 Which one should you prefer?

Some teams default to `+page.server.ts` for everything on the grounds that it is always safe. That is conservative but wastes a round trip on every client navigation — the browser has to ask the server for JSON instead of running the fetch directly.

The better rule is **use `+page.ts` whenever you can, and `+page.server.ts` when you must**. "Must" means the load touches a database, a secret, a file system, or any module under `$lib/server/`. The rule is checkable in review: look at the imports. If they all work in the browser, `+page.ts`. If any of them are server-only, `+page.server.ts`.

### 1.6 Why there is no `+page.client.ts`

You may wonder whether there is a client-only variant. There is not — `+page.ts` *is* the client-capable variant, and it also runs on the server so the initial HTML has the data. "Client-only" is not a load problem; it is an in-component problem, solved with `onMount` or `$effect`.

### 1.7 What April 2026 changes

Nothing in the file naming. The recommended pattern has been stable since SvelteKit 1.0. What did change is that `$lib/server/*` is now enforced more strictly — importing anything from `$lib/server` into `+page.ts` is a hard build error, not a warning. This closes a class of accidental leaks.

## 2. Style it — PE7 for a "two files, one result" diagram

The mini-build is a single page that has both `+page.ts` and `+page.server.ts`. Each file returns one field, and the component displays them side by side with a label saying where they came from. We give the page a warm teal personality (`oklch(68% 0.16 180)`).

## 3. Interact — combining two loads into one `data` prop

The universal load receives the server load's result and merges it with its own fields:

```ts
// +page.ts
export const load: PageLoad = async ({ data }) => {
    const clientOnly = `universal load ran at ${new Date().toISOString()}`;
    return { ...data, clientOnly };
};
```

The page component then reads both `data.fromServer` and `data.clientOnly` from the same typed prop. Students can see how the merge happens.

## 4. Mini-build — two files, one page

**Paths:**

- `src/routes/modules/09a-load/02-page-vs-server/+page.svelte`
- `src/routes/modules/09a-load/02-page-vs-server/+page.ts`
- `src/routes/modules/09a-load/02-page-vs-server/+page.server.ts`

### Prove the difference

1. Open the page. You see two labelled values: "From server load" and "From universal load".
2. Look at the DevTools Network tab on a client-side navigation back to this page (click Module 9A index, then come back). You will see a request for `__data.json` — that is SvelteKit asking the server for the server-load result. The universal load runs in the browser without a network round trip for its own code.
3. Try adding `console.log('server')` inside the server load and `console.log('client')` inside the universal load. The server log appears in your terminal (where `pnpm dev` is running). The client log appears in the browser DevTools console.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> When do you have to use <code>+page.server.ts</code> instead of <code>+page.ts</code>?</summary>

When your load function imports any server-only module: a database client, a secret from `$env/static/private`, anything under `$lib/server/*`, or a Node builtin that does not work in the browser. In those cases the code must not ship to the client, so it has to live in the server-only file.
</details>

<details>
<summary><strong>Q2.</strong> If a load only calls a public HTTP API, where should it live?</summary>

In `+page.ts`. It can run in the browser on client-side navigations without a round trip, which is faster than always going through the server.
</details>

<details>
<summary><strong>Q3.</strong> If both files exist, in what order do they run?</summary>

The server load runs first. Its return value is passed to the universal load as the `data` argument. The universal load then returns the final merged object that becomes the page's `data` prop.
</details>

<details>
<summary><strong>Q4.</strong> What is special about files under <code>$lib/server/</code>?</summary>

SvelteKit will refuse to let you import them from any file that runs in the browser — including `+page.ts`, `+layout.ts`, and any `.svelte` component. That convention prevents accidental secret leaks at build time.
</details>

<details>
<summary><strong>Q5.</strong> Is there a <code>+page.client.ts</code>?</summary>

No. `+page.ts` already runs in the client (and also on the server for the initial render). Code that should run only in the browser belongs inside `onMount` or a `$effect` inside the component.
</details>

## 6. Common mistakes

- **Importing a database client in `+page.ts`.** The build will fail or, worse, ship secrets to the browser. Move it to `+page.server.ts`.
- **Using `+page.server.ts` for all loads "to be safe".** Safe but wasteful — every client navigation now requires a server round trip for data that could have been fetched directly.
- **Forgetting to merge the server load's `data` in a universal load.** If you write `return { stats }` and ignore `data`, you lose everything the server load returned. Use `return { ...data, stats }`.
- **Assuming `+page.ts` never runs on the server.** It does — on the initial request, so SSR works. Code in `+page.ts` must be safe to run in both environments.

## 7. What's next

Lesson 9A.3 digs into the auto-generated `$types` module: where it comes from, what it exports, and why you never have to write an interface for `data` by hand.
