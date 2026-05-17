---
module: 9A
lesson: 9A.9
title: Streaming with Promise returns — progressive rendering
duration: 55 minutes
prerequisites:
  - Lesson 9A.6 — Parallel data loading
  - Familiarity with the {#await} block
learning_objectives:
  - Return a Promise from load so it streams in instead of blocking the render
  - Render a streamed value with {#await value}...{:then}...{/await}
  - Combine awaited fast data with streamed slow data in the same load
  - Know which load (server or universal) supports streaming
  - Use streaming for real UX wins, not just because you can
status: ready
---

# Lesson 9A.9 — Streaming with `Promise` returns — progressive rendering

## 1. Concept — Fast bits first, slow bits later

### 1.1 The problem — one slow query blocks the whole page

A dashboard shows the user's name, a list of notifications, and a slow analytics chart that takes 900 ms to compute. If you `await` all three in your load, the HTTP response cannot start until the slow one finishes. The user stares at a blank screen for 900 ms even though 90 percent of the page could have been shown immediately.

Streaming fixes this. You still do three fetches, but you only `await` the fast ones. The slow one is returned as a raw **promise** — a value that is not yet resolved. SvelteKit sends the HTML for the fast parts right away, leaves a placeholder where the slow part will go, and streams the resolved value in after the rest of the body is already being painted. When the promise resolves, the browser slots the value into the placeholder and the page is done.

This is HTTP chunked transfer encoding plus a clever runtime that tells Svelte's `{#await}` block where to insert the late value.

### 1.2 How to return a promise from load

The trick is to **return the promise without awaiting it**:

```ts
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Fast: awaited, embedded in the initial HTML.
    const user = await fetchUser();

    // Slow: NOT awaited. The promise itself is in the returned object.
    const analytics = fetchAnalytics();

    return { user, analytics };
};
```

`analytics` is typed as `Promise<Analytics>`, and SvelteKit streams its resolved value to the client as soon as it is ready.

### 1.3 Rendering a streamed value with `{#await}`

```svelte
<script lang="ts">
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
</script>

<h1>Hello, {data.user.name}</h1>

{#await data.analytics}
    <div class="skeleton" aria-hidden="true"></div>
{:then analytics}
    <Chart data={analytics} />
{:catch error}
    <p>Could not load analytics: {error.message}</p>
{/await}
```

The `{#await}` block is the same one from Module 4, now used with a promise from the load data. Svelte renders the `skeleton` branch while the promise is pending, swaps to the `:then` branch when it resolves, and to `:catch` if it rejects. During SSR the skeleton is what ships in the initial HTML; the `:then` content arrives as a streamed chunk.

### 1.4 When streaming helps — and when it hurts

Streaming is a UX win when:

- **Part of the page is fast and part is slow.** The user sees the fast part immediately.
- **The slow part is optional.** If it fails to load, the rest of the page is still useful.
- **The page is critical to Core Web Vitals.** Streaming moves LCP forward because content paints earlier.

Streaming can *hurt* when:

- **Every piece of data is required for the page to make sense.** In that case the placeholder is just a spinner and you have gained nothing over a normal `await`.
- **The slow data is above the fold on a small screen.** The user still stares at a skeleton, just in a prettier wrapper.
- **The slow source is unreliable.** Errors are harder to communicate in a streamed section than in a full-page error.

### 1.5 Server load only

Streaming only works from `+page.server.ts` and `+layout.server.ts`. Universal loads cannot stream because they do not own the HTTP response — they are called by SvelteKit which then serialises the result. Server loads own the response chunk and can flush them as data arrives.

If you want to stream, the load must be server-only. If you want cookie-forwarding and deduplication, the load must be... also server-side or using the enhanced fetch. Streaming is the clearest signal that your load belongs in `+page.server.ts`.

### 1.6 Nested promises

You can return an object that itself contains promises at the top level:

```ts
return {
    user,
    feeds: {
        news: fetchNews(),
        stocks: fetchStocks()
    }
};
```

`data.feeds.news` and `data.feeds.stocks` are each a promise and can be awaited independently with their own `{#await}` block. Two streamed values, two placeholders, two separate reveal moments.

### 1.7 Streaming vs parallelism

They are complementary. Parallelism (Lesson 9A.6) ensures independent requests run at the same time, so the wall-clock time is the duration of the slowest one. Streaming means the browser does not wait even for the slowest one before painting the fast parts. A page can use both: three independent fetches in `Promise.all` (parallelism), plus one very slow optional call returned as a bare promise (streaming).

### 1.8 What SvelteKit does under the hood — a timeline diagram description

Understanding the HTTP-level mechanics makes streaming predictable. Here is a detailed timeline for a page with one awaited value and one streamed promise:

```
Load function executes:
  t=0ms    Start load
  t=5ms    fetchUser() starts
  t=50ms   fetchUser() resolves -> user object ready
  t=50ms   fetchAnalytics() starts (but NOT awaited)
  t=50ms   Load function returns { user: awaited, analytics: promise }

Server response begins:
  t=51ms   HTTP response starts (Transfer-Encoding: chunked)
  t=51ms   CHUNK 1: HTML head + body with user data rendered
           The {#await data.analytics} block renders its PENDING branch
           (the skeleton/loading state)
  t=51ms   Browser starts receiving and painting CHUNK 1
  t=100ms  Browser has rendered the page with user name + skeleton

Analytics resolves on the server:
  t=950ms  fetchAnalytics() resolves -> analytics data ready
  t=951ms  CHUNK 2: A <script> tag containing the serialised analytics data
           + instructions for Svelte to swap the pending branch for the
           resolved branch

Browser processes CHUNK 2:
  t=1000ms Browser executes the inline script
  t=1001ms Svelte's runtime replaces the skeleton with the real analytics chart
  t=1001ms Page is complete
```

The key insight is the **gap between t=100ms and t=1000ms**. Without streaming, the user sees nothing until t=1000ms (the server waits for analytics before sending any HTML). With streaming, the user sees real content at t=100ms and the slow data appears 900ms later. The Time to First Byte (TTFB) improves from ~950ms to ~50ms. LCP improves from ~1000ms to ~100ms (if the user content is above the fold).

The HTTP mechanism is **chunked transfer encoding**. The server sends the response in multiple chunks over the same TCP connection. The browser renders each chunk as it arrives. The second chunk contains a `<script>` that Svelte's runtime evaluates to update the DOM — replacing the `{#await}` pending branch with the resolved branch.

### 1.9 The TypeScript angle

When you return a bare promise from a server load, TypeScript knows the difference:

```ts
export const load: PageServerLoad = async () => {
    const user = await fetchUser();           // user: User (resolved)
    const analytics = fetchAnalytics();       // analytics: Promise<Analytics> (unresolved)
    return { user, analytics };
};
```

In the component, `data.user` is typed as `User` (immediately available), and `data.analytics` is typed as `Promise<Analytics>` (must be awaited). The `PageProps` type reflects this distinction. If you accidentally `await` the analytics call and then try to use `{#await data.analytics}`, TypeScript will warn you that `data.analytics` is `Analytics`, not `Promise<Analytics>` — you are awaiting a non-promise.

Conversely, if you forget the `await` on the user call, `data.user` becomes `Promise<User>` and you cannot read `data.user.name` directly. TypeScript catches both mistakes at compile time.

### 1.10 Comparison: streaming vs other loading patterns

| Pattern | TTFB | LCP | Data freshness | Complexity | SEO |
| --- | --- | --- | --- | --- | --- |
| Await everything | Slow (waits for slowest) | Slow | All data in initial HTML | Low | Good (all content in HTML) |
| Stream slow data | Fast (sends fast data first) | Fast (if fast data is above fold) | Fast data in HTML, slow data streams | Medium | Partial (skeleton for slow data) |
| Client-side fetch | Fast (empty HTML) | Slow (waits for fetch) | No data in HTML | Low | Bad (no content for crawlers) |
| Parallel + stream | Fast | Fast | Mixed | Medium-high | Partial |

> **In production sidebar.** Our e-commerce product page has three data sources: the product (fast, 30ms from cache), reviews (medium, 150ms from database), and "customers also bought" recommendations (slow, 800ms from ML service). We `await` the product, `await` the reviews (they are above the fold on mobile), and stream the recommendations. The result: TTFB is 35ms, LCP is 180ms (product image + reviews are painted), and the recommendation carousel slides in at ~900ms. Before streaming, TTFB was 850ms. The key decision: stream only data that is below the fold or truly optional. If the slow data is above the fold on any viewport, streaming just shows a skeleton where the user is looking, which is not better than waiting.

### 1.11 Common interview question

**Q: "Explain SvelteKit's streaming feature. When is it beneficial and when should you avoid it?"**

**Model answer:** SvelteKit streaming lets a server load return unresolved promises alongside resolved values. SvelteKit sends the HTML for resolved values immediately via chunked transfer encoding, renders `{#await}` pending branches for the promises, and streams the resolved values in later as additional chunks. It is beneficial when part of the page data is fast and part is slow, and the slow part is below the fold or optional. The user sees meaningful content immediately instead of waiting for everything. It should be avoided when the slow data is essential for SEO (crawlers may not wait for the stream), when the slow data is above the fold on small screens (the user just sees a skeleton), or when every piece of data is required for the page to make sense. Streaming only works from `+page.server.ts` and `+layout.server.ts` — universal loads cannot stream because they do not own the HTTP response.

## Deep Dive

**The `{:catch}` branch is your safety net.** A streamed promise can reject. If the analytics service is down, the promise rejects and the `{:catch error}` block renders in place of the skeleton. Without a `{:catch}` block, the skeleton stays forever — there is no automatic timeout. Always include a `{:catch}` branch in `{#await}` blocks for streamed data.

**Streaming and SEO.** Google's crawler (Googlebot) does execute JavaScript and can follow streamed content in many cases. However, the behavior is not guaranteed for all crawlers. Social media scrapers (Twitter, Facebook) typically do not wait for streamed content at all — they see the initial HTML only. If a piece of data must appear in social previews or in Google's snippet, await it rather than streaming it.

**Streaming multiple values.** You can stream several promises independently. Each resolves on its own timeline and each has its own `{#await}` block. The server sends a separate chunk for each resolution. This is perfect for dashboards with multiple widgets that load at different speeds.

**Nested streaming.** You can return an object whose nested fields are promises: `return { user, widgets: { chart: fetchChart(), table: fetchTable() } }`. Each nested promise streams independently. In the component, `data.widgets.chart` and `data.widgets.table` are each a `Promise` that you `{#await}` separately.

## Going Deeper

- **SvelteKit docs:** [Streaming with promises](https://svelte.dev/docs/kit/load#Streaming-with-promises) covers the API and edge cases.
- **Advanced pattern:** Combine streaming with `Promise.all` for partially parallel loads: `const [user, flags] = await Promise.all([fetchUser(), fetchFlags()]); const recs = fetchRecommendations(user.id); return { user, flags, recs };`. The fast data is parallel and awaited; the slow data is streamed.
- **Challenge:** Create a page that streams three promises with artificial delays (500ms, 1000ms, 2000ms). Open the browser's DevTools Network tab and look at the response as it arrives. Can you see the chunks arriving separately? (Hint: in Chrome DevTools, look at the "Timing" tab for the request — the "Content Download" will show the chunked arrival.)

## 2. Style it — PE7 for skeleton placeholders

The mini-build shows a fast greeting and a slow analytics value. While the slow value is streaming, we render a subtle shimmer skeleton. We use a cool teal personality (`oklch(70% 0.16 180)`). The skeleton animation respects `prefers-reduced-motion` via PE7's global override.

## 3. Interact — a deliberate sleep and a promise return

```ts
export const load: PageServerLoad = () => {
    const slow = new Promise<{ computed: number }>((resolve) => {
        setTimeout(() => resolve({ computed: Math.round(Math.random() * 1000) }), 1200);
    });
    return { fast: { message: 'this part is instant' }, slow };
};
```

The fast part ships immediately; the slow part streams in after 1.2 seconds.

## 4. Mini-build — instant header, streamed chart value

**Paths:**

- `src/routes/modules/09a-load/09-streaming/+page.svelte`
- `src/routes/modules/09a-load/09-streaming/+page.server.ts`

Open the page. The header appears instantly. Below it, a skeleton placeholder occupies the space where the slow value will go. After about a second the skeleton is replaced with the streamed value.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In one sentence, what is streaming in SvelteKit load?</summary>

Returning a promise (instead of an awaited value) from a server load, so SvelteKit can send the fast parts of the page immediately and stream the promise's resolved value in later when it resolves.
</details>

<details>
<summary><strong>Q2.</strong> Which file can you stream from: <code>+page.ts</code> or <code>+page.server.ts</code>?</summary>

Only `+page.server.ts` (and `+layout.server.ts`). Universal loads cannot stream because they do not own the HTTP response.
</details>

<details>
<summary><strong>Q3.</strong> How do you render a streamed value in the component?</summary>

With an `{#await promise}...{:then value}...{:catch error}{/await}` block. The pending branch is what ships in the initial HTML; the resolved branch is slotted in when the chunk arrives.
</details>

<details>
<summary><strong>Q4.</strong> When is streaming a bad idea?</summary>

When the slow data is required for the page to make sense, or is above the fold on a small screen. In those cases the placeholder gives you nothing over a plain `await` — the user still cannot use the page until the slow data arrives.
</details>

<details>
<summary><strong>Q5.</strong> Is streaming the same as parallelism?</summary>

No. Parallelism runs independent requests at the same time so the slowest determines total time. Streaming starts painting the response before any of them finish and delivers slow values as separate chunks. You can use both on the same page.
</details>

## 6. Common mistakes

- **Awaiting a value you meant to stream.** Once you write `const analytics = await fetchAnalytics()`, the load is blocked until it finishes. Remove the `await` and return the promise directly.
- **Using streaming in a universal load.** It cannot stream; the result is just a regular async value. Move the load to a server file.
- **Forgetting the `:catch` branch.** A streaming promise that rejects must have somewhere to render the error. Otherwise the skeleton stays forever.
- **Streaming data that is required for SEO.** Google will see the skeleton, not the real content, because crawlers do not always wait for streamed chunks.

## 7. What's next

Lesson 9A.10 covers the opposite end of the performance spectrum: static generation with `prerender = true` for content that does not need to be fetched at all after build time.
