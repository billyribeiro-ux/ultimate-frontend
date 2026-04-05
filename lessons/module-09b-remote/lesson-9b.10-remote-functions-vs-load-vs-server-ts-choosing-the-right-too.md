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
