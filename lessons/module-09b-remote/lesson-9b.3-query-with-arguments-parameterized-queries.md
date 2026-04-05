---
module: 9B
lesson: 9B.3
title: query with arguments — parameterized queries
duration: 55 minutes
prerequisites:
  - Lesson 9B.2 — `query` basics
  - Module 1 — TypeScript strict
learning_objectives:
  - Add a single argument to a `query()` handler
  - Validate the argument with a Valibot schema
  - Understand why validation is mandatory for exposed endpoints
  - Explain how devalue serialises `Date` and `Map` across the wire
  - Use argument-based caching — different args, different cache slots
status: ready
---

# Lesson 9B.3 — `query` with arguments — parameterized queries

## 1. Concept — Not every query asks for everything

### 1.1 The problem: "give me *that* one"

A zero-argument query is the "give me the list" query. But most real queries are targeted: give me the post with this slug, the user with this id, the weather for this city. The browser needs a way to send an argument to the server, and the server needs a way to trust that argument before it hits the database.

`query` accepts an **optional first argument**: a schema that describes the shape of its input. The schema is any [Standard Schema](https://standardschema.dev) validator — Valibot and Zod both qualify. We use **Valibot** throughout this course because it is smaller, tree-shakable, and its TypeScript inference is excellent.

```ts
// src/routes/modules/09b-remote/03-query-arguments/post-by-id.remote.ts
import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { query } from '$app/server';

export interface Post {
    readonly id: string;
    readonly title: string;
    readonly body: string;
    readonly tags: Map<string, number>; // tag -> use count
    readonly publishedAt: Date;
}

const store = new Map<string, Post>([
    ['welcome', {
        id: 'welcome',
        title: 'Welcome',
        body: 'Hello there.',
        tags: new Map([['intro', 3], ['svelte', 7]]),
        publishedAt: new Date('2026-04-01')
    }]
]);

export const getPost = query(v.string(), async (id): Promise<Post> => {
    const post = store.get(id);
    if (!post) error(404, `No post with id "${id}"`);
    return post;
});
```

Three details matter.

- The first argument to `query()` is a **Valibot schema** (`v.string()`). If the client sends anything that fails this schema — a number, an object, a `null` — SvelteKit rejects the request with a 400 before your handler runs.
- The handler's parameter type is *inferred* from the schema. Inside `async (id) =>`, TypeScript knows `id: string`. Use `v.InferInput<typeof schema>` if you need to name the type elsewhere.
- Throwing `error(404, ...)` from `@sveltejs/kit` is the idiomatic way to signal "not found" — it becomes a 404 HTTP response and, on the client, a rejected promise whose `.catch` block can render a friendly message.

### 1.2 Why validation is not optional

A remote function is an HTTP endpoint. Anyone on the internet can call it with whatever JSON body they like. If your handler treats `id` as a trusted string and hands it to `db.sql\`SELECT * FROM post WHERE id = ${id}\``, you have SQL injection. If your handler treats it as a filename and opens `fs.readFile(id)`, you have a directory-traversal vulnerability. **A schema on every argument is the minimum bar for a safe remote function.**

If you genuinely know what you are doing and need to skip validation (you almost never do), pass the literal string `'unchecked'` instead of a schema:

```ts
export const riskyQuery = query('unchecked', async (arg: { id: string }) => {
    /* you now own the type safety */
});
```

### 1.3 Devalue, in more depth

The return value of `getPost` contains a `Date` (`publishedAt`) and a `Map` (`tags`). Neither survives `JSON.stringify`:

```ts
JSON.stringify(new Date()) // "2026-04-01T00:00:00.000Z" — now a string
JSON.stringify(new Map())  // "{}" — empty object
```

`devalue` serialises both correctly. On the client side of the wire, `post.publishedAt instanceof Date` is `true` and `post.tags instanceof Map` is `true`. This is why remote functions feel like calling a local function: the *types* survive.

`devalue` handles:

- `Date`, `RegExp`, `Map`, `Set`, `BigInt`, `NaN`, `Infinity`, `-0`, `undefined`
- Cyclic references
- Anything you register with a custom transport hook (advanced, Module 12)

### 1.4 Caching by argument

Query results are cached by argument. `getPost('welcome')` and `getPost('goodbye')` are two different cache entries. Calling `getPost('welcome')` twice on the same page returns the same promise — no duplicate network request. Valibot normalises object arguments (sorts keys), so `getPosts({ limit: 10, offset: 0 })` and `getPosts({ offset: 0, limit: 10 })` hit the same slot.

## 2. Style it — A post detail card with tag chips

Per-page brand this lesson is a deep indigo. The tag chips use `color-mix()` to fade the brand colour by tag frequency — a tiny use of data-driven CSS that proves the `Map<string, number>` survived the trip.

## 3. Interact — Schema-first thinking

Write the schema *before* the handler. If the schema is hard to write, your argument is probably too complex. A good query argument is a primitive, an object of primitives, or a small array. Anything else is a smell that you want a `command` or `form` instead.

```ts
const idSchema = v.pipe(v.string(), v.minLength(1), v.maxLength(64));
export const getPost = query(idSchema, async (id) => { /* ... */ });

// Types flow:
type Id = v.InferInput<typeof idSchema>; // string
```

## 4. Mini-build — Select a post, see its detail

### File tree

```
src/routes/modules/09b-remote/03-query-arguments/
├── +page.svelte          (select UI, renders selected post)
└── post-by-id.remote.ts  (getPost query with Valibot schema)
```

The page shows a `<select>` of post ids. Changing the selection updates `$state`, and the markup re-awaits `getPost(selected)`. Different ids are cached independently, so switching back and forth is instant after the first visit.

### DevTools moment

1. Open Network → Fetch/XHR.
2. Select a post. One request fires.
3. Select another. One more request.
4. Select the first post again. **No new request** — it's cached.
5. Inspect the response payload. Look for the `T` markers in the devalue payload — those are the typed hints that say "this is a Date" or "this is a Map".

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why must you pass a Valibot schema as the first argument to a parameterized query?</summary>

Because the query becomes an exposed HTTP endpoint, and any caller can send arbitrary data. The schema acts as a firewall — SvelteKit rejects ill-formed requests with a 400 before your handler runs.
</details>

<details>
<summary><strong>Q2.</strong> Name three types that survive devalue but not <code>JSON.stringify</code>.</summary>

`Date`, `Map`, and `BigInt` (any three of: `Date`, `Map`, `Set`, `RegExp`, `BigInt`, `NaN`, `Infinity`, `undefined`, cyclic references).
</details>

<details>
<summary><strong>Q3.</strong> What is the cache key for <code>getPost('welcome')</code> vs <code>getPost('goodbye')</code>?</summary>

They are two independent cache entries. Query results are keyed by their (normalised) argument, so different arguments yield different entries.
</details>

<details>
<summary><strong>Q4.</strong> How do you signal "not found" from inside a query handler?</summary>

Call `error(404, message)` imported from `@sveltejs/kit`. It becomes a 404 HTTP response, which on the client manifests as a rejected promise that `{:catch}` blocks and error boundaries can handle.
</details>

<details>
<summary><strong>Q5.</strong> When is <code>'unchecked'</code> the right choice for a query?</summary>

Almost never. It is a deliberate escape hatch for cases where you own the validation yourself and understand the security implications. Default to a schema.
</details>

## 6. Common mistakes

- **Writing the schema on both sides.** You only write it once — inside the `.remote.ts` file. The client gets type inference for free.
- **Using `z.string()` from Zod without realising the course picked Valibot.** Both work, but mixing styles across files is confusing. Stick to Valibot.
- **Validating with a `typeof` check inside the handler instead of a schema.** You lose the 400 response, you lose type inference, and you lose the ability for Svelte DevTools to display the schema.
- **Hand-converting the returned `Date` with `new Date(post.publishedAt)`.** It is already a `Date`. You would be constructing a `Date` from another `Date`, which works by accident but is wasted code.

## 7. What's next

Lesson 9B.4 meets the N+1 problem head-on with `query.batch()`, which collapses many simultaneous calls into one server round trip.
