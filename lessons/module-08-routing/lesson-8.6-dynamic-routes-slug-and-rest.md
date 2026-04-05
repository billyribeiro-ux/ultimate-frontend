---
module: 8
lesson: 8.6
title: Dynamic routes — [slug], [...rest], matchers
duration: 55 minutes
prerequisites:
  - Lesson 8.4 — File-based routing
  - Lesson 8.5 — Nested layouts
learning_objectives:
  - Create a dynamic route segment with [param] syntax
  - Read a route parameter from page.params with full type safety
  - Write a rest parameter [...rest] for catch-all routes
  - Write an optional parameter [[lang]] for routes where the segment may be omitted
  - Use a param matcher to restrict a segment to a typed shape
status: ready
---

# Lesson 8.6 — Dynamic routes — [slug], [...rest], matchers

## 1. Concept — One folder, infinitely many URLs

### 1.1 The problem — you cannot create a folder for every blog post

A blog with five posts is easy. Five folders, five `+page.svelte` files. A blog with five hundred posts is not easy. Creating five hundred folders is absurd, and even if you did, adding a new post would require a code change and a deploy. The URL space is data-shaped, not file-shaped.

The solution is a **dynamic route segment**: a folder whose name is a placeholder matched at request time. SvelteKit reserves square brackets for this purpose. `src/routes/blog/[slug]/+page.svelte` is one file that matches `/blog/hello`, `/blog/svelte-5`, `/blog/anything-you-want`. The value between the slashes is extracted and passed to your code as `params.slug`.

### 1.2 The basic `[param]` pattern

```
src/routes/blog/[slug]/+page.svelte
```

This matches any single URL segment after `/blog/`. The page can read the value like this:

```svelte
<script lang="ts">
    import { page } from '$app/state';
    const slug: string = page.params.slug;
</script>

<h1>Post: {slug}</h1>
```

`page.params` is a plain object whose keys are the names of every dynamic segment in the matched route. Since SvelteKit 2.55, the shape of `params` is generated automatically into `$app/types`, so `page.params.slug` is a `string` with no manual typing needed. In older SvelteKit you had to import `PageProps` from `./$types`; the April 2026 version makes it truly zero-typing.

### 1.3 Rest parameters — `[...rest]` for catch-alls

Sometimes you need a segment to match **any number of slashes**, not just one. The classic example is a documentation site where `/docs/a`, `/docs/a/b`, and `/docs/a/b/c` should all route to the same page. A rest parameter does this:

```
src/routes/docs/[...path]/+page.svelte
```

`params.path` is now a string like `"a"`, `"a/b"`, or `"a/b/c"`. You can split it on `/` to get an array of segments. Rest parameters are how SvelteKit implements 404 pages (`src/routes/[...catchall]/+page.svelte` at the root catches everything no other route handles).

### 1.4 Optional parameters — `[[lang]]`

An optional parameter matches zero-or-one segment. The syntax is double brackets:

```
src/routes/[[lang]]/about/+page.svelte
```

This route matches both `/about` (no `lang`) and `/fr/about` (`lang === 'fr'`). When the segment is absent, `params.lang` is `undefined`. Use this for i18n or for features that are optionally scoped to a group.

### 1.5 Matchers — restricting a segment to a typed shape

By default a `[slug]` matches any non-empty string. You often want stricter matching — a numeric id, a lowercase-letter-only slug, a two-letter language code. Matchers let you enforce this at the routing layer.

A matcher is a function in `src/params/<name>.ts` that returns `true` or `false`:

```ts
// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^\d+$/.test(param);
```

Then use it in a route folder name with an `=`:

```
src/routes/users/[id=integer]/+page.svelte
```

Now `/users/42` matches but `/users/abc` does not — it falls through to the next route or to a 404. Matchers are strict, cheap, and play well with TypeScript.

### 1.6 Typed params in April 2026

Before SvelteKit 2.55, you had to import `PageProps` from the generated `./$types` module to get `params` typed. As of April 2026, typed params are exposed through `$app/types` and flow automatically into `page.params` from `$app/state`. The practical result: you do not write any type annotations for route params; you just read them, and TypeScript knows the shape from the file tree.

### 1.7 When to use which

| Pattern           | Matches              | Example                     |
| ----------------- | -------------------- | --------------------------- |
| `[slug]`          | exactly one segment  | `/blog/hello`               |
| `[[lang]]`        | zero or one segment  | `/about`, `/fr/about`       |
| `[...rest]`       | zero or more         | `/docs/a/b/c`               |
| `[id=integer]`    | one matching segment | `/users/42` (not `/users/x`)|

## 2. Style it — PE7 for a URL sandbox

The mini-build renders the current route's parameters live. We give it an orange personality (`oklch(72% 0.18 55)`) and use a monospace font for the parameter values to make them look like machine output. Spacing and type come from PE7 tokens.

## 3. Interact — reading page.params

```svelte
<script lang="ts">
    import { page } from '$app/state';
    const slug: string = page.params.slug;
</script>
```

`page` is a reactive object from `$app/state`. Reading `page.params.slug` at the top level of the script gives you the value for *this* render; if the user navigates to a new `[slug]` the value changes and Svelte re-renders automatically. You do not subscribe to a store and you do not use the `$` prefix — that was `$app/stores`, the old API.

## 4. Mini-build — a live [slug] route

**Paths:**

- `src/routes/modules/08-routing/06-dynamic-routes/+page.svelte` — an index page with links
- `src/routes/modules/08-routing/06-dynamic-routes/[slug]/+page.svelte` — the dynamic page

The index page offers three demo slugs. Click any of them and the `[slug]` page renders, showing the captured parameter.

### Prove it

1. Visit `/modules/08-routing/06-dynamic-routes`. You see a list of links.
2. Click **svelte-5**. The URL becomes `/modules/08-routing/06-dynamic-routes/svelte-5` and the page displays `slug = "svelte-5"`.
3. Change `svelte-5` in the address bar to `anything-you-want` and press Enter. Same page, new value.
4. In DevTools, look at `page.params` logged in the console. It is a plain `{ slug: '...' }` object — no wrappers, no stores.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does <code>[slug]</code> match, and what does <code>[...slug]</code> match?</summary>

`[slug]` matches exactly one non-empty URL segment. `[...slug]` matches zero or more segments joined by slashes. The first is for single-segment placeholders like a blog post; the second is for catch-alls like documentation paths or 404 handlers.
</details>

<details>
<summary><strong>Q2.</strong> How do you read a dynamic route parameter in a page component?</summary>

Import `page` from `$app/state` and read `page.params.<paramName>`. The value is a string (or `undefined` for an optional parameter that was not provided).
</details>

<details>
<summary><strong>Q3.</strong> You want <code>/users/42</code> to match but not <code>/users/bob</code>. How?</summary>

Write a matcher function in `src/params/integer.ts` that returns `true` only for numeric strings, then rename the folder to `[id=integer]`. Requests with non-numeric ids will not match this route.
</details>

<details>
<summary><strong>Q4.</strong> In April 2026, do you need to import <code>PageProps</code> from <code>./$types</code> just to get a typed <code>params.slug</code>?</summary>

No. Typed params flow through `$app/types` into `page.params` automatically. You still need `./$types` for typing a load function's return, but for reading params you only import `page` from `$app/state`.
</details>

<details>
<summary><strong>Q5.</strong> What URL does <code>src/routes/[[lang]]/about/+page.svelte</code> match?</summary>

Both `/about` (lang is undefined) and any two-segment URL where the first segment is a non-empty string and the second is `about` — `/fr/about`, `/de/about`, etc. Optional parameters are the only way to match both "with prefix" and "without prefix" in one route.
</details>

## 6. Common mistakes

- **Reading `params` from the wrong place.** `params` lives on `page` (from `$app/state`), or on the `event` argument of a load function. It is not a top-level import.
- **Using `[...rest]` at the root of `src/routes` and accidentally catching every URL.** A root-level catch-all beats more specific routes only when they do not match first. Put it last and double-check.
- **Expecting a matcher to validate a segment's content.** Matchers are yes/no gatekeepers. They do not coerce types — `params.id` is still a `string`, even with `[id=integer]`. Coerce to `Number(params.id)` in your load function.
- **Using `$app/stores` and writing `$page.params.slug`.** That is the deprecated API. Use `page.params.slug` from `$app/state`.

## 7. What's next

Lesson 8.7 explores `$app/state` in depth — not just `params`, but `url`, `data`, `status` and `route` — all reactive, all read without a `$` prefix.
