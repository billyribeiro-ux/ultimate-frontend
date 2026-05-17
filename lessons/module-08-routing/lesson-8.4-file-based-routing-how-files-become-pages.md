---
module: 8
lesson: 8.4
title: File-based routing — how files become pages
duration: 50 minutes
prerequisites:
  - Lesson 8.1 — What SvelteKit adds to Svelte
  - Lesson 8.2 — SSR
  - Lesson 8.3 — Hydration
learning_objectives:
  - Translate a folder tree in src/routes into a list of URLs
  - Explain the role of +page.svelte, +layout.svelte and +error.svelte
  - Create a nested page without touching any configuration file
  - Understand what happens when a URL has no matching route
  - Recognise which +file name belongs to which SvelteKit feature
status: ready
---

# Lesson 8.4 — File-based routing — how files become pages

## 1. Concept — The folder tree is the URL tree

### 1.1 The problem — configuration that duplicates the file system

In older frameworks you wrote a routing configuration by hand. Something like:

```ts
const routes = [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/blog', component: BlogIndex },
    { path: '/blog/:slug', component: BlogPost }
];
```

Two problems. First, every route is listed twice — once as a file somewhere on disk, and once in the config. If you rename the file you must also edit the config, and if you forget, the build still passes but the URL 404s. Second, the config quickly becomes the only place you can understand the shape of your site. In a large app the config file grows to hundreds of lines, imports hundreds of components, and becomes a bottleneck for merges.

File-based routing replaces the config with a convention. You do not list your routes; you place them. The folder structure *is* the route tree. To add a page you create one file. To delete a page you delete one folder. There is no configuration to keep in sync with reality, because the files *are* reality.

### 1.2 The core convention

Inside `src/routes`, every folder is a URL segment and every `+page.svelte` is a page at that URL.

| File                                    | URL                |
| --------------------------------------- | ------------------ |
| `src/routes/+page.svelte`               | `/`                |
| `src/routes/about/+page.svelte`         | `/about`           |
| `src/routes/blog/+page.svelte`          | `/blog`            |
| `src/routes/blog/hello/+page.svelte`    | `/blog/hello`      |
| `src/routes/blog/[slug]/+page.svelte`   | `/blog/:any-slug`  |

The filename is always exactly `+page.svelte`. The URL comes from the folder path. No configuration needed.

### 1.3 The `+` family of files

SvelteKit recognises a small set of special filenames. Every special filename starts with `+`, so they sort to the top of directory listings and never collide with your own component files.

- `+page.svelte` — **the page** that renders at this URL.
- `+page.ts` — **universal load**, runs on the server for SSR and then on the client for subsequent navigations. Module 9A.
- `+page.server.ts` — **server-only load**, runs only on the server. Use this for database calls and secrets.
- `+layout.svelte` — **layout** that wraps this folder and every descendant folder. Lesson 8.5.
- `+layout.ts` / `+layout.server.ts` — load data for the layout.
- `+error.svelte` — **error boundary** that renders when a load function throws or when a server hook returns an error. The nearest `+error.svelte` up the tree handles the error.
- `+server.ts` — **HTTP endpoint** for this route. Instead of rendering HTML, it exports `GET`, `POST`, etc. functions. Used for REST APIs inside your SvelteKit app.

A folder can contain several of these at the same time. A typical page folder looks like this:

```
src/routes/blog/[slug]/
├── +page.svelte       ← the component
├── +page.server.ts    ← the data loader
└── +error.svelte      ← what to show if the loader throws
```

### 1.4 What happens when nothing matches

If a URL does not match any `+page.svelte`, SvelteKit returns a 404. If you provide a `+error.svelte` at the root of `src/routes`, that component renders the 404 page. Otherwise SvelteKit's built-in error page renders. Lesson 9A.8 shows how to throw an explicit `error(404, 'Post not found')` from inside a load function for semantic 404s.

### 1.5 Case sensitivity and naming rules

Folder names are the literal URL segment. `src/routes/About` would become `/About`, which is a different URL from `/about`. Stick to lowercase, kebab-case folder names — it matches the convention of the URL and avoids surprises on case-sensitive filesystems like Linux servers.

Names starting with `[` are dynamic parameters (Lesson 8.6). Names wrapped in parentheses like `(marketing)` are route groups (Lesson 8.5) — they organise files without affecting the URL.



## Going Deeper

**Official documentation:**
- [SvelteKit docs: Routing](https://svelte.dev/docs/kit/routing)
- [SvelteKit docs: +page](https://svelte.dev/docs/kit/routing#page)
- [SvelteKit docs: +layout](https://svelte.dev/docs/kit/routing#layout)

**Advanced pattern:** Create a new route by adding a folder with `+page.svelte`. Navigate to it. Delete the folder. Observe the 404.

**Challenge question:** (Combines Lessons 8.4, 8.5, and 8.6) Build a mini documentation site with a root layout, a docs layout, and 3 documentation pages. Add a `[slug]` dynamic route for individual doc pages. Create a root `+error.svelte` for 404s.

## 2. Style it — PE7 for a route tree visualiser

The mini-build renders a tree of folders and their URLs side by side. We give the page a teal personality (`oklch(72% 0.16 190)`). Folders are indented with `padding-inline-start` based on depth; URLs align to the right of each row. The tree uses a monospace font for the file paths, which makes the indentation read like a real directory listing.

## 3. Interact — modelling the tree with a typed union

```svelte
<script lang="ts">
    interface RouteNode {
        name: string;
        url: string | null;
        depth: number;
        kind: 'file' | 'folder';
    }
</script>
```

`kind` is a union type so classes can branch on it without string typos. `url` is `string | null` because folders have no URL of their own.

## 4. Mini-build — the route tree visualiser

**Path:** `src/routes/modules/08-routing/04-file-based-routing/+page.svelte`

Open `/modules/08-routing/04-file-based-routing`. You will see a directory-like listing with file paths on the left and the URL they produce on the right.

### Prove it yourself

1. Create a sibling folder `src/routes/modules/08-routing/04-file-based-routing/playground/+page.svelte` with one line of content.
2. Save. Vite hot-reloads.
3. Navigate to `/modules/08-routing/04-file-based-routing/playground`. The new page renders — you did not touch any config.
4. Delete the folder. The URL 404s.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> How many files do you edit to add a new page at <code>/contact</code>?</summary>

One. You create `src/routes/contact/+page.svelte`. There is no config to update.
</details>

<details>
<summary><strong>Q2.</strong> What is the URL for <code>src/routes/blog/2026/april/+page.svelte</code>?</summary>

`/blog/2026/april`. Each folder name becomes a URL segment; `+page.svelte` marks the endpoint.
</details>

<details>
<summary><strong>Q3.</strong> Why does every SvelteKit special filename start with <code>+</code>?</summary>

To make the convention unambiguous and to sort SvelteKit-owned files to the top of directory listings. Your own component files never start with `+`, so `Button.svelte` and `+page.svelte` can live in the same folder without confusion.
</details>

<details>
<summary><strong>Q4.</strong> What is the difference between <code>+page.ts</code> and <code>+page.server.ts</code>?</summary>

`+page.ts` is a universal load — it runs on the server for the initial render and on the client for client-side navigations. `+page.server.ts` is server-only — it always runs on the server and can import server-only code (database clients, secrets). Module 9A covers the trade-off in detail.
</details>

<details>
<summary><strong>Q5.</strong> You navigate to a URL that has no matching folder. What does SvelteKit do?</summary>

It returns a 404. If a `+error.svelte` exists at an ancestor folder (or at the root of `src/routes`), that component renders the 404 page; otherwise SvelteKit's built-in error page renders.
</details>

## 6. Common mistakes

- **Naming the file `page.svelte` without the `+`.** SvelteKit only recognises `+page.svelte`. A file named `page.svelte` is just a regular component and does not become a route.
- **Putting the page component at the folder level, not inside a subfolder.** A page at `/blog` must be at `src/routes/blog/+page.svelte`, not `src/routes/blog.svelte`. Folders, not dotted files.
- **Mixing uppercase and lowercase folder names.** `src/routes/About` works locally on macOS and 404s on Linux. Always use lowercase.
- **Forgetting that route groups like `(marketing)` do not include the group in the URL.** `src/routes/(marketing)/about/+page.svelte` is still `/about`.

## 7. What's next

Lesson 8.5 adds layouts: files that wrap multiple pages in a shared shell, with nested layouts and route groups.
