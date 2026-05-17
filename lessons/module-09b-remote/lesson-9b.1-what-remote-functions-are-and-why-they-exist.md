---
module: 9B
lesson: 9B.1
title: What Remote Functions are and why they exist
duration: 50 minutes
prerequisites:
  - Module 8 — SvelteKit routing, SSR, and hydration
  - Module 9A — classic `load()` functions
  - TypeScript generics (Module 1 — interfaces, Module 4 — `Promise<T>`)
learning_objectives:
  - Explain in your own words the "two codebases" problem that Remote Functions solve
  - List the four kinds of remote function and say when each is appropriate
  - Describe the end-to-end type safety guarantee a `.remote.ts` file provides
  - Identify what `experimental.remoteFunctions` in `svelte.config.js` turns on
  - Recognise April 2026 remote function syntax vs older `+server.ts` fetch-wrapper patterns
status: ready
---

# Lesson 9B.1 — What Remote Functions are and why they exist

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This lesson is the doorway into Module 9B. We will not write a real remote function yet; that comes in 9B.2. Here we frame the problem, introduce the vocabulary, and show the very simplest example so your eyes get used to the shape of a `.remote.ts` file.

## 1. Concept — The two codebases you used to have to write

### 1.1 The problem: every client call needs a matching server route

Until April 2026, every time you wanted the browser to read a piece of data from the server in SvelteKit, you had to write the same three things by hand.

1. A server file — usually `+server.ts` or `+page.server.ts` — that exported an HTTP handler. That handler pulled data from the database, ran permission checks, and returned `json(...)`.
2. A client call — usually `fetch('/api/posts')` — somewhere in your component, with manual error handling, manual status-code checking, and a manual `as` cast to tell TypeScript what the response body looked like.
3. A pair of matching TypeScript types: one `PostDTO` on the server, one `PostDTO` on the client, both of which had to stay in sync by human effort. If the server added a field, the client did not know until you remembered to update the interface.

This pattern works. React and Vue developers have lived with it for a decade. But it has four costs that compound every time you add a route.

- **Boilerplate.** The simplest "read a list of todos" feature takes three files and about 40 lines of code that do nothing except move JSON across the network.
- **Two sources of truth.** The server knows the real shape of the data; the client guesses. If the guesses drift, you get silent bugs — a field renamed from `createdAt` to `created_at` on the server will still *compile* on the client because TypeScript only sees your hand-written interface.
- **Manual validation.** Any data the client sends — a query parameter, a form field, a URL slug — must be validated on the server with a schema library, and that same schema almost always has to be duplicated on the client to get decent error messages.
- **Lost context.** The client code has no idea what routes exist. Renaming `/api/posts` to `/api/blog-posts` is a project-wide find-and-replace because the compiler cannot follow a string literal through a `fetch()` call.

### 1.2 The insight: what if the function *was* the API?

Remote Functions start from a different question. Instead of asking "how do I call the server?", they ask "what if calling the server looked exactly like calling a function?" You write an async function on the server, you import it from a Svelte component, and the SvelteKit compiler wires up the HTTP plumbing for you — at build time, with full types, with automatic validation, with one source of truth for the shape of the data.

A `.remote.ts` file is a file with a specific extension that SvelteKit recognises. When you build the project, SvelteKit scans every `.remote.ts` file and:

1. Keeps the original code on the **server**, where it runs with full access to your database, environment variables, and any node-only library you like.
2. Generates a **client stub** that, when imported in a `.svelte` file, does not actually contain your server logic. It contains a tiny wrapper that makes a `fetch` call to an auto-generated HTTP endpoint, serialises the arguments, deserialises the response, and returns the result as a typed value.

To your component, it *looks* like a direct function call. To the network, it is a normal HTTP request. The compiler handles the impedance mismatch.

### 1.3 The four flavours

Remote functions come in four shapes, each matching a job you used to do with a separate file or convention.

| Flavour      | Replaces                                    | When to use it                                                                 |
| ------------ | ------------------------------------------- | ------------------------------------------------------------------------------ |
| `query`      | `load()` + `+server.ts` GET handlers        | Reading dynamic data the browser can request at any time.                      |
| `form`       | `actions` export in `+page.server.ts`       | Submitting an HTML form, with progressive enhancement and validation.          |
| `command`    | `+server.ts` POST/PUT/DELETE handlers       | JS-only mutations (like button clicks) that are not tied to a `<form>` element. |
| `prerender`  | Static data during build                    | Data that changes at most once per deployment.                                 |

You will meet `query` in 9B.2, `form` in 9B.5, and `command` in 9B.7. `prerender` is a small variation on `query` that we touch on in 9B.10.

### 1.4 End-to-end type safety, in one sentence

This is the big promise: **the return type of your server function is the argument type of your client call, automatically, with zero duplication and zero `as` casts**.

If you write this on the server,

```ts
export const getPosts = query(async (): Promise<Post[]> => { ... });
```

then in any component that imports `getPosts`, the expression `await getPosts()` has type `Post[]` — not `unknown`, not `any`, not a hand-typed interface you have to keep in sync. Change the server's return type and every call site immediately has the new type. Delete a field and every component that used it immediately fails to compile. This is what "end-to-end type safety" means in practice.

### 1.5 How the compiler splits the file

The `.remote.ts` suffix is not just a naming convention — it is a build-time instruction. When SvelteKit's Vite plugin encounters a file ending in `.remote.ts`, it performs a code transform:

1. **Server bundle**: The original file is included as-is. All your database calls, environment variable reads, and node-only imports remain intact.
2. **Client bundle**: The original file is *replaced* with an auto-generated stub. Each exported function becomes a thin wrapper that serializes its arguments, sends a `fetch` request to a generated endpoint, deserializes the response, and returns the result. The stub has the exact same TypeScript signature as the original — so the client code compiles with the same types — but contains zero server logic.

This split is the magic that makes "import a server function and call it from a component" safe. The client never sees your database query. It only sees a function that returns a typed Promise.

### 1.6 What changed in April 2026

Remote Functions landed as a stable feature of SvelteKit 2.27 in late 2025 and have been iterated on through 2026. As of April 2026 they are still behind an experimental flag — not because they are unstable in the "might crash your site" sense, but because the Svelte team reserves the right to change the fine details (method names, option shapes) until they feel the API is perfect. In this course we embrace them wholeheartedly: they are the direction of travel, they are more type-safe than anything that came before, and by the time you finish the course they will be the default.

You turn them on by adding one option to `svelte.config.js`:

```js
kit: {
    experimental: {
        remoteFunctions: true
    }
}
```

This project already has that flag set. You do not need to touch it.

### 1.7 Security model

A critical point: every remote function becomes a publicly accessible HTTP endpoint. The compiler generates a URL for it, and anyone who discovers that URL can call the function with arbitrary arguments. This means:

- **Always validate inputs.** Use Valibot schemas (introduced in Lesson 9B.5) to validate every argument.
- **Always check authorization.** Read the user's session from cookies or headers and verify they have permission to perform the operation.
- **Never trust the client.** The typed arguments give you TypeScript safety at compile time, but at runtime the request could come from a malicious actor sending crafted JSON.

Remote functions do not magically make your server secure — they make the type-safe *happy path* effortless, while still requiring the same security discipline as any other endpoint.

## Deep Dive

**Why this matters at scale.** In a 20-route production app, the traditional pattern (manual `+server.ts` endpoints, manual `fetch` calls, manual type duplication) produces approximately 3x more code than remote functions for the same functionality. More code means more maintenance, more places for types to drift, and more surface area for bugs. A team that adopts remote functions from day one saves hundreds of lines per feature and eliminates the entire category of "client type does not match server type" bugs. The ROI is immediate and compounds with every new endpoint.

**The mental model.** Remote functions are like a telephone. When you call a friend (invoke the function), you do not care about the telephone infrastructure (HTTP, serialization, routing). You speak words (pass typed arguments), your friend hears them (the server receives them), thinks (executes logic), and speaks back (returns a typed result). The telephone company (SvelteKit's compiler) handles everything in between — dialing, routing, encoding, decoding. You just talk. If the phone system were transparent (like a direct function call), you would forget it existed. That is the developer experience remote functions provide.

**Edge cases.** Remote functions serialize arguments and return values using `devalue`, which handles `Date`, `Map`, `Set`, `BigInt`, regular expressions, and cyclic references — but not class instances, functions, DOM nodes, or `Symbol`. If you try to return a class instance, `devalue` strips the prototype and you receive a plain object on the client. The fix: return plain data interfaces, and reconstruct class instances on the client if needed. Another edge case: if a remote function throws, the error is serialized and rethrown on the client. The stack trace points to the server code, which can be confusing in production — wrap critical calls in try/catch and return structured error objects instead of throwing.

**Performance implications.** Each remote function call is an HTTP request. Unlike load functions (which benefit from SvelteKit's internal routing and caching during SSR), remote function calls always go over the network when called from the client. This means each call has a minimum latency of one round trip (typically 20-100ms locally, 50-300ms in production). For this reason, `query.batch()` (Lesson 9B.4) is essential for list pages — it collapses N per-item calls into a single request. For mutations, the single-call model is fine because mutations are infrequent.

**Connection to other modules.** Remote functions complement Module 9A's load functions: loads run before the page renders (blocking), while remote functions run after the page is interactive (non-blocking). Module 10's form actions are the HTML-form equivalent. Module 11's optimistic UI wraps remote function calls with local state management. The capstone project uses all three patterns: load functions for initial page data, remote queries for dynamic widget updates, and remote commands for mutations. Understanding when to use each pattern is a principal-engineer-level architecture decision.

## 2. Style it — The lesson card that introduces Module 9B

The mini-build for this lesson is a single static card explaining what a remote function *would* look like, with no server call yet. PE7 rules still apply: per-page brand personality (a magenta this time to mark "Module 9B: new paradigm"), fluid spacing, scoped styles, mobile-first. We override `--color-brand` inside the page component so every descendant class — the badge, the link border, the code block accent — picks up the personality without `:global()`.

## 3. Interact — Looking at a remote function before writing one

Here is the smallest possible `.remote.ts` file. **Do not type this yet**; just read it.

```ts
// src/routes/demo/hello.remote.ts
import { query } from '$app/server';

export const helloFromServer = query(async (): Promise<string> => {
    return 'Hello from the server — the current time is ' + new Date().toISOString();
});
```

And the component that uses it:

```svelte
<script lang="ts">
    import { helloFromServer } from './hello.remote';
</script>

{#await helloFromServer()}
    Loading…
{:then message}
    <p>{message}</p>
{/await}
```

Three things to notice. First, the file name ends in `.remote.ts` — that is the signal to SvelteKit. Second, the client code *imports* the server function by name; it does not hand-write a URL. Third, the type of `message` inside the `{:then}` block is `string`, inferred from the server's return type. No interface declaration, no duplication.

## 4. Mini-build — A "What is a Remote Function?" lesson card

**File:** `src/routes/modules/09b-remote/01-what-remote-functions-are/+page.svelte`

This page is static — no remote call yet. Its job is to set the visual identity of Module 9B and give the student a side-by-side comparison of "old way" vs "new way" rendered as code blocks.

```svelte
<script lang="ts">
    const oldWay: string = 'Three files, two interfaces, one string literal URL.';
    const newWay: string = 'One file, one function, zero string literals.';
</script>

<svelte:head>
    <title>Lesson 9B.1 · Remote Functions · Ultimate Frontend</title>
    <meta name="description" content="Why SvelteKit Remote Functions exist and the end-to-end type safety they provide." />
</svelte:head>

<section class="page stack">
    <!-- breadcrumb, header, comparison cards, and a quote from the Svelte docs -->
</section>
```

### DevTools moment

Open this route in the browser, then look at the Network tab. You will see exactly one request: the HTML document. There are no XHR calls. This is deliberate — the lesson card is static because the *lesson itself* is about what remote functions are. Starting in 9B.2, the Network tab will be the single most important place to prove what remote functions do.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Explain the "two codebases" problem in your own words.</summary>

Without remote functions, every feature that talks to the server requires both server code (an HTTP handler) and client code (a `fetch` call), plus a pair of matching types that you maintain by hand. The two pieces share data but no code, so they can drift out of sync silently.
</details>

<details>
<summary><strong>Q2.</strong> What file extension does SvelteKit recognise as a remote function file?</summary>

`.remote.ts` (or `.remote.js`). That specific suffix is what tells the SvelteKit build system to split the file into a server half and an auto-generated client stub.
</details>

<details>
<summary><strong>Q3.</strong> List the four flavours of remote function and the job each replaces.</summary>

`query` replaces GET-style data reads and `load()`. `form` replaces the `actions` export for progressively enhanced HTML forms. `command` replaces POST/PUT/DELETE endpoints for JS-only mutations. `prerender` replaces build-time static data generation.
</details>

<details>
<summary><strong>Q4.</strong> What does "end-to-end type safety" actually give you in day-to-day coding?</summary>

The return type of the server function automatically becomes the type of the client expression. If the server's return type changes, every component that calls it is flagged by the compiler — no hand-written DTO interfaces, no `as` casts, no silent drift.
</details>

<details>
<summary><strong>Q5.</strong> Why are remote functions still behind an experimental flag in April 2026?</summary>

Not because they are unstable in production, but because the Svelte team reserves the right to refine method names and option shapes. The core design is settled and intended to become the default once the details are frozen.
</details>

## 6. Common mistakes

- **Naming the file `hello.ts` instead of `hello.remote.ts`.** Without the `.remote` segment in the filename, SvelteKit treats the file as an ordinary module. Your server code will ship to the client, environment variables will leak, and any node-only import will crash the browser bundle.
- **Trying to return a class instance, a function, or a DOM node from a query.** Return values are serialised with `devalue`, which handles JSON plus `Date`, `Map`, `Set`, `BigInt`, and custom transports — but not arbitrary JavaScript objects with methods. Return plain data; reconstruct behaviour on the client.
- **Assuming "server-only" means "unreachable".** Every remote function becomes an HTTP endpoint. Anyone can call it with crafted arguments. Always validate inputs and always enforce authorisation inside the handler, just like any other public endpoint.
- **Forgetting the experimental flag in `svelte.config.js`.** Without `kit.experimental.remoteFunctions: true`, the `.remote.ts` files are silently ignored and your imports resolve to `undefined` at runtime. In this repo the flag is already set.

## 7. What's next

Lesson 9B.2 has you write your very first `query` remote function, colocate it with a route, and watch it return real data across the network.
