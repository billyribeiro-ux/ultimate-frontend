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

### 1.5 What SvelteKit does under the hood — the network tab for a parameterized query

When you call `getPost('welcome')` from a component, the client stub does the following:

1. **Serialise the argument.** The string `'welcome'` is passed through `devalue.stringify()`. For a simple string this is trivial, but for objects, `devalue` normalises key order so `{ limit: 10, offset: 0 }` and `{ offset: 0, limit: 10 }` produce identical serialised forms. This is why cache hits work regardless of property order.

2. **Check the cache.** The cache key is `[functionId, serialisedArgument]`. If a cached entry exists and is not stale, the cached promise is returned. No network request.

3. **Send the request.** If no cache entry exists, the stub sends a `POST` to the function's endpoint (e.g., `/_remote/getPost-x7y8z9`). The request body is the serialised argument. The `Content-Type` is `application/x-devalue`.

4. **Server validates.** SvelteKit's runtime receives the request, deserialises the argument with `devalue.parse()`, and passes it through the Valibot schema. If validation fails, a 400 response is returned with the validation issues. The handler never runs.

5. **Handler executes.** If validation passes, the handler receives the typed, validated argument. It runs your logic and returns a value.

6. **Response serialised.** The return value goes through `devalue.stringify()`. `Date`, `Map`, `Set`, `BigInt`, and cyclic references are all preserved. The response is sent back.

7. **Client deserialises.** The stub parses the response with `devalue.parse()`. The result is a fully typed value with all special types preserved.

In the Network tab, you will see the request as a POST to a hashed URL. The request payload is the devalue-serialised argument. The response payload contains type markers (like `[-1,"Date","2026-04-01T00:00:00.000Z"]`) that the parser uses to reconstruct the original types.

### 1.6 Comparison: Valibot vs Zod for remote function schemas

| Aspect | Valibot | Zod |
| --- | --- | --- |
| Bundle size | ~1 KB per schema (tree-shakable) | ~13 KB minimum (not tree-shakable) |
| TypeScript inference | Excellent (`v.InferInput`, `v.InferOutput`) | Excellent (`z.infer`) |
| Standard Schema compliant | Yes | Yes (v3.24+) |
| Pipe syntax | `v.pipe(v.string(), v.minLength(1))` | `z.string().min(1)` |
| Error messages | `v.minLength(1, 'Custom message')` | `.min(1, 'Custom message')` |
| Async validation | Supported | Supported |
| File validation | `v.file()`, `v.mimeType()`, `v.maxSize()` | Via `.refine()` |
| Learning curve | Slightly steeper (functional style) | Slightly easier (method chaining) |
| Used in this course | Yes | No (but works as a drop-in) |

Both Valibot and Zod implement the Standard Schema interface, which means SvelteKit's remote functions accept either. The course uses Valibot because its tree-shakable architecture means you only pay for the validators you import — a 50-field form schema might add 2 KB with Valibot and 13+ KB with Zod.

### 1.7 The TypeScript angle

The schema-first approach means your handler's parameter type is **derived from the schema**, not hand-written:

```ts
const postIdSchema = v.pipe(
    v.string(),
    v.minLength(1, 'ID cannot be empty'),
    v.maxLength(64, 'ID too long'),
    v.regex(/^[a-z0-9-]+$/, 'ID must be lowercase alphanumeric with hyphens')
);

// The type is inferred from the schema:
type PostId = v.InferInput<typeof postIdSchema>; // string

export const getPost = query(postIdSchema, async (id) => {
    // id is typed as string — inferred from the schema
    // At runtime, id is guaranteed to be a non-empty string of 1-64 chars
    // matching the regex. No additional validation needed.
    const post = store.get(id);
    if (!post) error(404, `No post with id "${id}"`);
    return post;
});
```

On the client side, TypeScript enforces the same type:

```svelte
<script lang="ts">
    import { getPost } from './post-by-id.remote';
    // getPost expects a string argument
    // getPost(123)  <-- TypeScript error: number is not string
    // getPost()     <-- TypeScript error: expected 1 argument
</script>
```

For object arguments, the inference is richer:

```ts
const searchSchema = v.object({
    query: v.string(),
    limit: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)), 20),
    offset: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)), 0)
});

export const searchPosts = query(searchSchema, async (params) => {
    // params is typed as { query: string; limit: number; offset: number }
    // Default values from v.optional are applied by Valibot
});
```

> **In production sidebar.** We use parameterized queries for every data read in our app. The Valibot schemas caught 12 invalid argument patterns during development that would have become runtime errors in production — things like passing `undefined` instead of a string, sending a negative page number, and submitting a slug with spaces. Each would have been a silent bug in a hand-written `fetch` call. The schema validation turns runtime mysteries into build-time errors and 400 responses with clear messages.

### 1.8 Common interview question

**Q: "Why must you validate arguments to remote functions even though TypeScript already checks the types at compile time?"**

**Model answer:** TypeScript types are erased at runtime. They protect you during development but provide zero guarantee about the actual data that arrives over the network. A remote function is an HTTP endpoint — anyone can call it with `curl`, a browser extension, or a crafted fetch request. The arguments in the request body can be anything: wrong types, missing fields, SQL injection strings, excessively large payloads. A Valibot schema validates the runtime data before your handler touches it, rejecting malformed requests with a 400 status. TypeScript and Valibot are complementary: TypeScript catches your own mistakes at compile time; Valibot catches the outside world's mistakes at runtime.

## Deep Dive

**Argument-based cache keys in detail.** The cache is a `Map<string, Promise<T>>` where the key is the `devalue`-serialised argument. This means:
- `getPost('welcome')` and `getPost('welcome')` hit the same cache entry (same serialised string).
- `getPost('welcome')` and `getPost('goodbye')` are different entries.
- For object arguments, `devalue` normalises key order, so `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` produce the same key.
- `undefined` and missing properties are distinct from `null`. Be consistent.

**Schema composition.** Valibot schemas are composable. You can build complex argument validators from simple pieces:

```ts
const dateRange = v.object({
    from: v.pipe(v.string(), v.isoDate()),
    to: v.pipe(v.string(), v.isoDate())
});

const paginatedDateRange = v.intersect([
    dateRange,
    v.object({ limit: v.optional(v.number(), 20), offset: v.optional(v.number(), 0) })
]);
```

This is the "schema-first" design philosophy: define the data shape once, use it for validation, type inference, and documentation.

## Going Deeper

- **Valibot docs:** [Getting started](https://valibot.dev/guides/introduction/) covers the full API.
- **Advanced pattern:** Create a shared schemas module (`src/lib/schemas/`) that exports reusable validators. Import them in both `.remote.ts` files (for server validation) and components (for preflight validation). One schema, two uses, zero drift.
- **Challenge:** Write a query with an object argument that includes a `Date` field: `v.object({ since: v.date() })`. Call it from a component with `getPostsSince({ since: new Date('2026-01-01') })`. Inspect the network request body. Can you see the `Date` serialised in `devalue` format? On the server, is `since` a real `Date` object? (Answer: yes to both — `devalue` preserves `Date` across the wire.)

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
