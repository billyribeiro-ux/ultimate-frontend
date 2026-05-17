---
module: 4
lesson: 4.7
title: Promises and async/await — the JS async model
duration: 60 minutes
prerequisites:
  - Module 1 (TypeScript basics)
  - Lesson 4.2 (multi-branch logic)
learning_objectives:
  - Explain what a Promise is and why JavaScript needs one
  - Describe the three states a Promise can be in and the transitions between them
  - Use `fetch()` to make an HTTP request and read its JSON body
  - Write an `async` function that awaits a Promise and returns a value
  - Distinguish between synchronous code and microtask continuations at a beginner level
status: ready
---

# Lesson 4.7 — Promises and async/await: the JavaScript async model

## 1. Concept — Code that waits without blocking

### 1.1 The problem: fetching data without freezing the page

When your Svelte component needs a list of products from an API, it calls `fetch('/api/products')`. That function cannot return the data immediately, because the data lives on another computer, and the request might take 10 ms, 500 ms, or longer depending on the network. Meanwhile, the browser still has to respond to user clicks, redraw the page, run animations. If JavaScript sat on one line and *blocked* until the data came back, the entire tab would freeze.

JavaScript solves this with a model called **asynchronous execution**. The language gives you a way to say "start this work, and come back to me when it is done", without blocking anything else. The data arrives when it arrives, and your code runs a continuation once it has arrived. This is what **Promises** and `async`/`await` are for.

### 1.2 What a Promise is

A **Promise** is a JavaScript object that represents "a value that might not be here yet". It has three possible states:

1. **Pending.** The work is still in progress. The Promise has no value yet.
2. **Fulfilled.** The work finished successfully. The Promise now has a result value.
3. **Rejected.** The work failed. The Promise has an error.

A Promise starts pending. It transitions *once* to either fulfilled or rejected. It can never go back. Those three states and the one-way transition are the entire data model.

`fetch('/api/products')` returns a Promise. When the network responds with success, the Promise fulfils with a `Response` object. When the network fails, the Promise rejects with an error.

### 1.3 The old way: `.then()` and `.catch()`

Before `async`/`await`, you chained callbacks onto a Promise:

```ts
fetch('/api/products')
    .then((response) => response.json())
    .then((products) => { console.log(products); })
    .catch((error) => { console.error(error); });
```

Each `.then()` takes a function that receives the fulfilled value and returns either a new value or a new Promise. Errors skip down the chain to `.catch()`. This works, but long chains become hard to read, and error handling is awkward to interleave with control flow. Modern JavaScript gives you something better.

### 1.4 The modern way: `async`/`await`

An `async` function is a function that *implicitly returns a Promise*. Inside the function, you can use the `await` keyword in front of any Promise, and execution pauses on that line until the Promise settles. If it fulfils, `await` returns the value. If it rejects, `await` throws the error, which you can catch with a normal `try`/`catch`.

```ts
async function loadProducts(): Promise<Product[]> {
    const response: Response = await fetch('/api/products');
    const products: Product[] = await response.json();
    return products;
}
```

The code reads top-to-bottom like synchronous code, but the `await` lines do not block anything else in the browser. The function yields control while it waits, and any other JavaScript, animation, or user input keeps running. When the fetch finishes, the browser schedules the continuation, and execution picks up on the next line.

This is the form we use throughout the course. Treat `.then()` chains as legacy; reach for `async`/`await` by default.

### 1.5 Error handling

Because `await` throws on rejection, regular `try`/`catch` works:

```ts
async function loadProducts(): Promise<Product[]> {
    try {
        const response: Response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error: unknown) {
        console.error('Failed to load products:', error);
        throw error;
    }
}
```

Two things to note:

- `fetch` only rejects on *network* failures, not HTTP error codes. A 500 response is still a fulfilled Promise — it just has `response.ok === false`. You have to check that yourself and throw.
- After catching, you often want to re-throw so callers know the operation failed. Silencing an error with `catch` and continuing is a bug farm.

### 1.6 The event loop, briefly

JavaScript runs on a single main thread. Synchronous code runs top to bottom. When it hits an `await`, the function pauses and control returns to the event loop. The event loop runs pending tasks — rendering, user events, timers — until the awaited Promise settles. Then it resumes the paused function on the **microtask queue**, which runs before the next repaint. This model is why `await` does not freeze the page.

You do not need to master the event loop today. You need to know this much: **`await` pauses the function, not the page.** The browser continues to be responsive. When the Promise settles, your function resumes automatically.

### 1.7 Why Promises matter for SvelteKit load functions

You will encounter Promises everywhere in SvelteKit. Every `load` function is async. Every `fetch` call returns a Promise. Every remote function returns a Promise. The `{#await}` block (Lesson 4.8) renders different UI for each Promise state. Understanding Promises deeply here — their three states, their one-way transitions, their error handling — is the prerequisite for everything in Modules 9A, 9B, and 10.

In a load function, you will write `await fetch(...)` and the server will wait for the data before rendering HTML. In a component, you might start a fetch in response to a user action and render a loading state while it runs. In Module 9A Lesson 9A.9, you will return a *nested* Promise from a load function that SvelteKit streams to the browser progressively. All of these patterns depend on you being completely comfortable with the Promise model from this lesson.

### 1.8 Common patterns: parallel, sequential, and race

Three patterns you will use repeatedly with Promises:

**Sequential** — one after another, where B needs A's result:
```ts
const user = await fetchUser();
const posts = await fetchPosts(user.id);
```

**Parallel** — fire all at once, wait for all (Lesson 9A.6):
```ts
const [user, notifications] = await Promise.all([fetchUser(), fetchNotifs()]);
```

**Race** — take whoever finishes first:
```ts
const result = await Promise.race([fetchFast(), timeout(3000)]);
```

Each pattern serves a different need. Sequential when there are data dependencies. Parallel when the requests are independent (3x speed improvement). Race when you need a timeout or a fallback source. Module 9A Lesson 9A.6 covers parallel loading in depth.

### 1.9 Why this lesson before `{#await}`

Lesson 4.8 teaches Svelte's `{#await}` block, which renders different markup for pending / fulfilled / rejected states. `{#await}` takes a Promise as input — so before you can understand it, you need to know what a Promise *is* and how to produce one. That is what we just covered.

## Deep Dive

**Why this matters at scale.** In a production SvelteKit app with 20 routes, every route has at least one load function that makes at least one async call. A dashboard page might make five calls in parallel. A detail page might make two sequential calls. An admin page might submit forms, handle validation errors, and retry on transient failures — all asynchronously. If any developer on the team does not understand Promises deeply — does not understand that `fetch` resolves on 500, does not understand that forgotten `await` gives you a Promise object instead of a value, does not understand that parallel `Promise.all` is 3x faster than sequential awaits — the app accumulates performance bugs and silent failures that only manifest under real network conditions.

**The mental model.** A Promise is an envelope. When you call `fetch`, someone hands you a sealed envelope labeled "pending." You cannot open it yet. Eventually, the envelope becomes "fulfilled" (the letter is inside and you can read it) or "rejected" (the envelope contains an error notice). `await` is the act of sitting at your desk with the envelope, waiting for it to be openable. While you wait, you are idle but the rest of the office (the event loop) continues working. When the envelope opens, you read it and continue your work. You never have to poll the envelope — `await` takes care of the waiting.

**Edge cases.** A common mistake: starting a `fetch` inside a component without handling the case where the component unmounts before the fetch resolves. The old fetch resolves, tries to set state on a destroyed component, and either errors or causes a warning. The fix is `AbortController` in an `$effect` cleanup (Lesson 2.11). Another edge case: `JSON.parse` (called by `response.json()`) can throw if the response body is not valid JSON — for example, if the server returned an HTML error page. Always handle `.json()` failures explicitly. A third edge case: `fetch` in a server load function uses SvelteKit's enhanced fetch, which deduplicates identical requests and can read from the internal cache — behavior that does not exist in the browser.

**Performance implications.** Every `await` in a sequential chain adds the full round-trip time of that request to the total load time. If your load function awaits three 200 ms requests sequentially, the page takes 600 ms to render. Switching to `Promise.all` brings it to 200 ms — a 3x improvement that directly affects LCP (Lesson 12.1). This is not a micro-optimization; it is the single biggest performance win available in most data-heavy pages. Network waterfalls are the number one cause of slow pages in SSR applications.

**Connection to other modules.** Promises appear in Module 9A (load functions), Module 9B (remote functions return Promises), Module 10 (form action submissions), Module 11 (optimistic UI awaits server confirmation), and Module 12 (streaming with Promise returns). Lesson 4.8 uses Promises directly in the `{#await}` template block. Module 9A Lesson 9A.6 covers `Promise.all` for parallel loading. Module 9A Lesson 9A.9 covers streaming with nested Promises. Every interaction between your app and the network passes through the Promise model taught in this lesson.

### 1.10 The TypeScript angle — typing async return values

An un-annotated async function that calls `res.json()` infers `Promise<any>` because `Response.json()` returns `Promise<any>`. This silently kills your type safety:

```ts
// Bad: infers Promise<any>
async function loadProducts() {
    const res = await fetch('/api/products');
    return res.json();
}

// Good: explicit return type
async function loadProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
```

The explicit `Promise<Product[]>` annotation ensures every caller gets typed data. A typo like `products[0].nme` becomes a compile error. Lesson 4.10 covers this in depth.

### 1.11 Common interview question

**Q: "You have three independent API calls to make for a page. Should you `await` them sequentially or use `Promise.all`? What is the performance difference?"**

**Model answer:** Use `Promise.all` for independent requests. Sequential `await` takes the *sum* of all request times — three 200ms requests take 600ms. `Promise.all` starts all three concurrently and takes the *maximum* time — three 200ms requests take ~200ms, a 3x improvement. Use sequential `await` only when request B needs the result of request A (a data dependency). For page load functions, this is often the single biggest performance optimisation available: converting a waterfall of sequential awaits into a parallel `Promise.all`. In SvelteKit, the `load` function specifically benefits from this pattern — faster load means faster LCP (Largest Contentful Paint).

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/kit/load](https://svelte.dev/docs/kit/load) — SvelteKit load functions that return Promises.
- [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) — the full Promise API reference.
- [developer.mozilla.org/en-US/docs/Web/API/Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) — the Fetch API reference.

**Advanced pattern: `Promise.allSettled` for resilient dashboards.** When loading multiple widgets on a dashboard, you do not want one failing widget to crash the entire page:

```ts
const results = await Promise.allSettled([
    loadUserStats(),
    loadRevenue(),
    loadNotifications()
]);

// results[0].status === 'fulfilled' → use results[0].value
// results[1].status === 'rejected'  → show error in revenue widget
```

`Promise.allSettled` waits for all promises to settle (fulfilled or rejected) and returns an array of outcome objects. Each widget can independently show its data or its error, without affecting the others.

**Challenge question (combines Lesson 4.7 + Lesson 2.9 + Lesson 2.11):** Write an `$effect` that fetches data from an API whenever a `query` state variable changes. Include: (1) an `AbortController` for cancellation, (2) cleanup that aborts on re-run, (3) error handling that ignores `AbortError`. Explain the race condition this prevents — what happens if the user types "sv" and then quickly types "svelte" without the abort?

## 2. Style it — A loading skeleton and a data grid

The mini-build renders a "Load products" button. On click, it triggers an async function that fetches a small JSON file from `static/products.json` and displays the result. While the request is in flight, the page shows a PE7-styled skeleton (shimmering placeholder bars). On success, the skeleton is replaced by a real grid. On failure, an error panel appears. All three states are visible; all three are styled with tokens; none of them jank the layout because each has the same padding and radius.

## 3. Interact — Call the function two ways

Start with the happy path: load the real products file, watch the skeleton, watch the grid appear. Then click the "Load (will fail)" button which targets a URL that returns 404. `response.ok` is false, your code throws, the catch branch runs, and the error panel appears with the real error message. Open the Network panel while you do this — the failing request is clearly visible with a red 404 status.

## 4. Mini-build — A typed async loader

### File

`src/routes/modules/04-control-flow/07-promises/+page.svelte`

We will *not* use `{#await}` yet — that is Lesson 4.8. Today we drive the four states (idle, loading, success, error) manually with `$state`, exactly the way you did in Lesson 4.2, so the *JavaScript* side of the async story is the focus.

### Key excerpt

```svelte
<script lang="ts">
    interface Product { id: string; name: string; price: number; }
    type Status = 'idle' | 'loading' | 'success' | 'error';

    let status: Status = $state('idle');
    let products: Product[] = $state([]);
    let errorMessage: string = $state('');

    async function load(): Promise<void> {
        status = 'loading';
        errorMessage = '';
        try {
            const res: Response = await fetch('/products.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            products = await res.json();
            status = 'success';
        } catch (err: unknown) {
            errorMessage = err instanceof Error ? err.message : 'Unknown error';
            status = 'error';
        }
    }
</script>
```

### DevTools verification

1. Open the Network panel.
2. Click **Load products**. You will see a request to `/products.json` with status 200 and a small JSON payload.
3. Watch the UI switch from *idle* to *loading* (the skeleton) to *success* (the product grid).
4. In the Sources panel, find your `load` function and add a breakpoint on the `await fetch(...)` line. Click the button again. Execution pauses at the `await`. Resume and watch it step through `res.ok`, `res.json()`, and the final `status = 'success'`.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the three states of a Promise and how does it transition between them?</summary>

Pending, fulfilled, and rejected. A Promise starts pending and transitions exactly once, either to fulfilled (with a value) or to rejected (with an error). It cannot change states after settling.
</details>

<details>
<summary><strong>Q2.</strong> Does `await` freeze the browser while it waits?</summary>

No. `await` pauses only the function it is in. The main thread continues handling rendering, user events, animations, and any other JavaScript.
</details>

<details>
<summary><strong>Q3.</strong> Why does `fetch` not reject on a 500 response?</summary>

Because a 500 is still a valid HTTP response — the server answered. `fetch` only rejects on *network* failures. Checking `response.ok` is how you handle HTTP error codes.
</details>

<details>
<summary><strong>Q4.</strong> Why do we prefer `async`/`await` to `.then()` chains?</summary>

Readability. `async`/`await` lets you write asynchronous code that reads top-to-bottom like synchronous code, with normal `try`/`catch` for errors.
</details>

<details>
<summary><strong>Q5.</strong> An async function always returns what?</summary>

A `Promise<T>`, where `T` is the type of the return expression. Even returning `undefined` becomes `Promise<void>`.
</details>

## 6. Common mistakes

- **Forgetting to `await`.** `const res = fetch(url)` gives you a Promise, not a Response. You probably meant `const res = await fetch(url)`.
- **Forgetting to check `response.ok`.** Your app silently shows "no data" on every HTTP error instead of the real failure.
- **Catching and ignoring.** `catch { }` hides bugs. If you catch, act.
- **Mixing `.then()` and `await` in the same function.** Pick one style per function.

## 7. What's next

Lesson 4.8 introduces `{#await}`, Svelte's built-in block for rendering pending, fulfilled, and rejected states of a Promise without any manual `$state` bookkeeping.
