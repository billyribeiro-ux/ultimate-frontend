---
module: 9B
lesson: 9B.10
title: Remote functions vs load() vs +server.ts — choosing the right tool
duration: 45 minutes
prerequisites:
  - Lessons 9B.1–9B.9
  - Module 9A — `load()` functions
  - Module 10.1 (forthcoming) — `+server.ts` endpoints
learning_objectives:
  - State the one-sentence job of each tool: `load`, `query`, `form`, `command`, `+server.ts`
  - Pick the right tool for five concrete scenarios
  - Explain why `+server.ts` still exists in an API-routes-last world
  - Combine remote functions with `load()` for initial SSR-critical data
  - Recognise when a feature is so unusual that none of the tools fit
status: ready
---

# Lesson 9B.10 — Remote functions vs `load()` vs `+server.ts` — choosing the right tool

## 1. Concept — Four tools, one decision

### 1.1 Why there are still four tools

In April 2026 SvelteKit gives you four distinct ways to talk to the server from a page: the classic `load()` function, the three remote function flavours (`query`, `form`, `command`), and the original `+server.ts` endpoint. This can feel like too many options. In practice each has a **single clear job** and picking between them comes down to two questions:

1. *Who* is calling this? (SvelteKit's own rendering pipeline, a component, an HTML form, a third party?)
2. *When* is it called? (Before the page renders, from user interaction, by a webhook?)

### 1.2 The decision table

| Tool               | Who calls it                          | When                                   | Type safety | Default for…                                           |
| ------------------ | ------------------------------------- | --------------------------------------- | ----------- | ------------------------------------------------------ |
| `load()`           | SvelteKit's routing                   | Before the page renders                 | Full        | Initial, SSR-critical data the page cannot exist without. |
| `query()`          | Your components                       | During render or on interaction         | Full        | Dynamic reads, interactive filters, lazy data.         |
| `form()`           | `<form>` submissions                  | User submits                            | Full        | Progressively enhanced HTML forms.                     |
| `command()`        | Your event handlers                   | Button clicks, JS-only actions          | Full        | Mutations without a `<form>` element.                  |
| `+server.ts`       | Anything (including third parties)    | On HTTP request                         | Hand-rolled | Public APIs, webhooks, file downloads, OAuth callbacks. |

### 1.3 Five scenarios

1. **"The post page needs the post's title in the HTML for SEO."** That is *initial, SSR-critical data*. Put the fetch in a `+page.ts` `load()`. Remote functions can work here via top-level `await` (9B.9), but until async SSR is stable, `load()` is the safer default.

2. **"Typing in a search box shows suggestions."** That is *interactive, on-demand data*. Use a `query()` with an argument. The search term becomes the argument; Svelte caches results per query.

3. **"A user clicks 'delete' on a todo."** That is *a JS-driven mutation*. Use a `command()`. The delete button is not a `<form>` and progressive enhancement is unnecessary — nobody deletes a todo without JavaScript.

4. **"The user signs up via an email + password form."** That is a *form the user could submit without JS*. Use a `form()`. The server validates and logs the user in; the form still works if JavaScript fails to load, which matters for account creation more than almost anything else.

5. **"A third-party payment provider calls you back at `/webhooks/stripe`."** That is *a public HTTP endpoint called by code you do not control*. Use `+server.ts`. Remote functions are generated URLs with hashed paths; a webhook needs a stable, documented URL, a specific method, and precise control over response headers.

### 1.4 Combining `load()` with remote functions

The two are complementary. A common shape for a list page:

- `+page.ts` `load()` returns the first N items (SSR-critical, indexable).
- `query()` fetches additional pages as the user scrolls.
- `command()` or `form()` handles item mutations.

The `load()` hydrates the initial state; the query takes over for dynamic interaction. There is no conflict — each answers a different question.

### 1.5 The hidden cost of `+server.ts`

Writing a `+server.ts` handler costs you:

- A hand-written TypeScript interface for the response body.
- A hand-written interface for the request body.
- Manual validation with Valibot (or your own checks).
- Hand-rolled error handling with `error()` and `json()`.
- A stable URL that you and every caller must agree on.

You pay that cost *on purpose* when you need a public URL. You should not pay it internally, for UI-only features, because remote functions do all of that work for you.

### 1.6 What SvelteKit does under the hood — the full request lifecycle for each tool

Understanding the internal mechanics of each tool makes the choice obvious:

**`load()` lifecycle:** Request -> SvelteKit router matches route -> Layout loads fire (parallel unless `parent()` is called) -> Page load fires -> All results serialised with `devalue` -> HTML rendered server-side -> HTML + data shipped to browser -> Hydration reads embedded data -> No client fetch.

**`query()` lifecycle (SSR):** Component renders during SSR -> `{#await query()}` triggers in-process handler call -> Handler runs on server -> Result serialised with `devalue` -> Result embedded in HTML -> Hydration reads embedded data.

**`query()` lifecycle (client navigation):** Component renders client-side -> Client stub sends `POST` to generated endpoint -> Server runs handler -> Response serialised -> Client deserialises -> Cache updated -> Component re-renders.

**`form()` lifecycle (with JS):** User submits form -> Attachment intercepts -> Preflight validates (optional) -> `fetch` POST to generated endpoint -> Server validates with schema -> Handler runs -> Response with result -> Client updates `result` and `issues()`.

**`command()` lifecycle:** Event handler calls `command(arg)` -> Client stub sends `POST` -> Server validates -> Handler runs -> `.refresh()` / `.set()` calls attach query updates -> Response with command result + query updates -> Client updates everything.

**`+server.ts` lifecycle:** Any HTTP client sends request to stable URL -> SvelteKit matches route -> Handler function for that method runs -> Returns a `Response` object -> Sent to client.

The pattern is clear: `load()` and `query()` are read paths optimized for SSR and caching. `form()` and `command()` are write paths optimized for mutations. `+server.ts` is the raw HTTP path for external consumers.

### 1.7 The TypeScript angle — a unified type safety comparison

| Tool | Input types | Output types | Route params | End-to-end guarantee |
| --- | --- | --- | --- | --- |
| `load()` | Event auto-typed via `PageLoad` | Return -> `PageProps.data` | Auto from folder name | Full (via `$types`) |
| `query()` | Schema -> handler param | Return -> client call site | N/A | Full (via schema + return type) |
| `form()` | Schema -> handler param | Return -> `.result` | N/A | Full (via schema + return type) |
| `command()` | Schema -> handler param | Return -> `await` result | N/A | Full (via schema + return type) |
| `+server.ts` | `RequestEvent` (params auto-typed) | Must return `Response` | Auto from folder name | Partial (hand-written response types) |

The key insight: remote functions provide automatic end-to-end type safety. `+server.ts` does not — you must manually write response type interfaces and keep them in sync with the handler. This is the primary reason to prefer remote functions for internal UI calls.

### 1.8 The extended decision flowchart

Here is a text-based decision tree you can use for every new feature:

```
START: "I need to get/send data to the server"
  |
  Q1: "Is the caller my own SvelteKit UI?"
  |-- NO  --> +server.ts (the caller needs a stable URL)
  |-- YES --> continue
      |
      Q2: "Is this a READ or a WRITE?"
      |-- READ -->
      |   |
      |   Q3: "Must the data be in the initial HTML for SEO?"
      |   |-- YES --> load() in +page.ts or +page.server.ts
      |   |-- NO  --> query() in .remote.ts
      |
      |-- WRITE -->
          |
          Q4: "Is this an HTML form the user could submit without JS?"
          |-- YES --> form() in .remote.ts (or classic action in +page.server.ts)
          |-- NO  --> command() in .remote.ts
```

### 1.9 Comparison: remote functions vs tRPC vs GraphQL

| Aspect | SvelteKit Remote Functions | tRPC | GraphQL |
| --- | --- | --- | --- |
| Type safety | Full (compiler-generated) | Full (schema-based) | Partial (codegen required) |
| Bundle overhead | ~0 KB (built-in) | ~5-10 KB | ~30-50 KB (client + parser) |
| Schema language | Valibot/Zod (JS/TS) | Zod (JS/TS) | GraphQL SDL |
| Batching | `query.batch()` | Built-in | Built-in |
| Subscriptions | Not built-in | Via WebSockets | Via WebSockets |
| Framework coupling | SvelteKit-only | Any framework | Any framework |
| Learning curve | Low (just functions) | Medium (routers, procedures) | High (schema, resolvers, queries) |
| Progressive enhancement | Yes (`form()`) | No | No |
| Best for | SvelteKit apps | Full-stack TypeScript | Multi-client APIs |

> **In production sidebar.** We evaluated all three for a new SvelteKit project. tRPC was appealing but added 8 KB to our client bundle and required a separate router setup. GraphQL was overkill — we have one client (our SvelteKit frontend) and no need for client-specified queries. Remote functions won because they are built into SvelteKit, add zero bundle overhead, and provide the same type safety as tRPC with less ceremony. The only feature we missed was subscriptions (for real-time updates), which we solved with a separate SSE endpoint in `+server.ts`. For a SvelteKit-only project, remote functions are the right default.

### 1.10 Common interview question

**Q: "You are architecting a SvelteKit application with a product catalog, a shopping cart, user authentication, and a Stripe webhook. Which tool would you use for each feature and why?"**

**Model answer:** Product catalog pages: `load()` in `+page.server.ts` for the product list and detail pages — the data must be in the initial HTML for SEO and Google Shopping indexing. Shopping cart: `query()` for reading the cart contents (it updates dynamically as items are added), `command()` for add/remove/update mutations (these are button clicks, not HTML forms), with `withOverride` for optimistic quantity updates. User authentication: `form()` for the login and registration forms — they must work without JavaScript for accessibility and resilience. The login form uses a Valibot schema for email/password validation. Stripe webhook: `+server.ts` at `/api/webhooks/stripe` — Stripe sends POST requests to a stable URL that you register in their dashboard. The handler must verify the webhook signature, process the event, and return a 200. No remote function can do this because the caller is not your UI.

## Deep Dive

**The "progressive disclosure of complexity" principle.** The four tools form a progression from simple to complex:

1. `load()` is the simplest — one function, one return, one `data` prop. No validation needed because the inputs come from SvelteKit's own routing (params, URL, cookies).
2. `query()` adds an argument and a cache. Validation is optional but recommended.
3. `form()` adds HTML form binding, progressive enhancement, and per-field validation. More ceremony, more features.
4. `command()` adds mutation semantics, optimistic UI, and single-flight query updates. The most powerful, the most complex.

Start every feature with the simplest tool that works. If `load()` is enough, stop there. Only reach for `command()` when you need its specific capabilities.

**Combining all four in one page.** A well-architected product page might use:
- `load()` for the product data (SSR, SEO)
- `query()` for the review list (lazy-loaded, paginated)
- `form()` for the "Write a review" form (progressive enhancement)
- `command()` for the "Add to cart" button (optimistic UI)

Each tool handles exactly the use case it was designed for.

## Going Deeper

- **SvelteKit docs:** [Remote functions](https://svelte.dev/docs/kit/remote-functions) for the full remote function API, [Loading data](https://svelte.dev/docs/kit/load) for load functions, [Routing — server](https://svelte.dev/docs/kit/routing#server) for `+server.ts`.
- **Advanced pattern:** Create a decision tree component that renders as an interactive flowchart. Each node asks a question (Q1-Q4 above) and the user clicks their answer to arrive at the recommended tool. Print it and pin it next to your monitor.
- **Challenge:** Take an existing page that uses `+server.ts` for an internal API call and refactor it to use a remote `query()`. Measure the before/after: how many files did you delete? How many type interfaces did you remove? Did any bugs surface during the migration?

## 2. Style it — A decision tree as a card

A single card with a branching flowchart rendered as nested lists. Per-page brand is the slate grey that says "reference material". Minimal animation — this is a page students return to.

## 3. Interact — Name the tool

Given a one-line feature description, name the tool. We embed a static list of ten scenarios in the mini-build with the answer under a `<details>` element. The reader commits before revealing.

## 4. Mini-build — A printable decision sheet

### File tree

```
src/routes/modules/09b-remote/10-choosing-the-right-tool/
└── +page.svelte    (static decision tree + quiz scenarios)
```

No remote functions here; the page is pure markup. It lives in the `09b-remote` module as a reference you come back to whenever you start a new feature.

### DevTools moment

This page has no network calls and no JS-driven state. Open the Performance panel instead, record a reload, and confirm the LCP is under 500 ms on a fast connection. This lesson is about *decisions*, not code — and the decision sheet itself should be lightning fast to open.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Which tool would you use for the page title that appears in Google search results?</summary>

`load()`. The data must exist in the HTML on the first response for crawlers to see it. (Once async SSR is stable, a top-level `await` on a `query()` can do the same job.)
</details>

<details>
<summary><strong>Q2.</strong> Which tool would you use for a "favourite" heart button next to each tweet?</summary>

`command()`. It is a JS-only mutation with no `<form>` wrapper. Pair it with a `withOverride` optimistic update.
</details>

<details>
<summary><strong>Q3.</strong> Why not use <code>+server.ts</code> for everything?</summary>

Because it is the most boilerplate-heavy option. You write request types, response types, validation, error handling, and URL strings by hand. Remote functions collapse all of that into a typed function call.
</details>

<details>
<summary><strong>Q4.</strong> What is a webhook, and which tool handles it?</summary>

A webhook is an HTTP request your server receives from a third party (Stripe, GitHub, Twilio). You need a stable, public URL and control over the response. `+server.ts` is the right tool.
</details>

<details>
<summary><strong>Q5.</strong> Can <code>load()</code> and <code>query()</code> coexist on the same page?</summary>

Yes, and they often should. `load()` handles initial SSR data; `query()` handles dynamic interaction. The two do not overlap.
</details>

## 6. Common mistakes

- **Rewriting every `load()` as a `query()`.** If the data is SSR-critical and needs to be in the initial HTML response, `load()` is still the clearest answer until async SSR is stable.
- **Using `command()` for forms that should work without JS.** Account creation, payment, and consent flows deserve `form()` for progressive enhancement.
- **Using `+server.ts` for internal UI calls.** You are paying all of the cost and getting none of the benefit of remote functions.
- **Avoiding `+server.ts` when you genuinely need a public endpoint.** Webhooks, OAuth callbacks, and public JSON APIs should live in `+server.ts`. Do not try to force them into `command()`.

## 7. What's next

Module 10 opens with `+server.ts` endpoints themselves — the one tool in the table we have not built with yet. You will learn exactly when they earn their keep.
