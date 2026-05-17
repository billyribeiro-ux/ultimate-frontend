---
module: 8
lesson: 8.2
title: What SSR actually is
duration: 45 minutes
prerequisites:
  - Lesson 8.1 — What SvelteKit adds to Svelte
  - Comfort opening browser DevTools (Network, Elements)
learning_objectives:
  - Explain what "Server-Side Rendering" actually means in concrete bytes
  - Open View Source and Inspect on the same page and explain the difference
  - Describe three reasons SSR matters for real users
  - Identify when SvelteKit is rendering on the server and when it is rendering on the client
  - Decide whether a page should be SSR, SSG or CSR (preview of Lesson 8.12)
status: ready
---

# Lesson 8.2 — What SSR actually is

## 1. Concept — The bytes that arrive first

### 1.1 The problem — an empty shell on a slow phone

Open any React app built with Create React App in 2019 and choose **View Page Source** in the browser. You will see something depressing:

```html
<!doctype html>
<html>
  <head>…</head>
  <body>
    <div id="root"></div>
    <script src="/static/js/main.abc123.js"></script>
  </body>
</html>
```

That is all the HTML there is. The entire visible page — every paragraph, every heading, every image — is missing. It does not exist yet. It will only exist after the browser downloads `main.abc123.js`, parses it, executes it, mounts the React tree, walks it, and writes the result into `<div id="root">`. On a fast desktop that takes maybe 200 milliseconds. On a mid-range Android phone on a 4G signal in a train tunnel, it can take several seconds, and during those seconds the user sees a blank white page.

Three groups of users are badly hurt by this. Real humans on slow connections see nothing. **Search engine crawlers** see nothing — Googlebot did not execute JavaScript for a long time, and while it now does, executing JavaScript costs Google real money and they crawl JS-heavy pages less often. **Social media scrapers** (Twitter, LinkedIn, iMessage link previews) still do not execute JavaScript, so your link preview is blank. That is bad for humans, bad for SEO, and bad for sharing.

Server-side rendering fixes all three problems with one idea.

### 1.2 What SSR actually is, in concrete bytes

**Server-side rendering means: the first HTTP response the server sends back already contains the final HTML of the page.** Not a shell, not an empty div, but the real paragraphs, headings, lists and form controls. The browser receives the response, parses the HTML, and can paint the page immediately — before any JavaScript runs.

Concretely, when a SvelteKit server gets a request for `/blog/hello`:

1. SvelteKit looks up the route `src/routes/blog/[slug]/+page.svelte`.
2. It runs the matching `load` function (on the server) to fetch the post.
3. It imports the `.svelte` component and calls Svelte's server-side renderer, which walks the component tree and produces a string of HTML.
4. It wraps that HTML in the full page (`<html>`, `<head>`, `<body>`, your layouts, your `<svelte:head>` tags) and sends it to the browser as the response body.
5. The browser receives that response, parses it, and paints. First Contentful Paint is instant.

The JavaScript bundle still downloads in parallel — but the user is already looking at the rendered page while it downloads. When the bundle finishes downloading, SvelteKit "hydrates" the page (Lesson 8.3) and interactivity starts working. The user never sees a blank screen.

### 1.3 View Source vs Inspect — your verification tool

Browsers give you two ways to look at the HTML of a page, and they are not the same thing.

- **View Page Source** (Cmd/Ctrl + U) shows you **the raw HTML the server sent** — the literal bytes that came over the wire. No JavaScript has run at this point. This is what Googlebot sees. This is what `curl` sees. This is what a Twitter link preview sees.
- **Inspect** (right-click → Inspect, or F12) shows you the **live DOM** — the result of parsing the HTML *and* running every piece of JavaScript that has executed so far. This is what a logged-in human sees after the page has finished hydrating.

**On a pure client-side app, View Source looks empty and Inspect looks full.** That gap is the problem.

**On a SvelteKit page, View Source and Inspect look almost identical.** That match is proof of SSR. There will be some small differences — Inspect might show a few extra attributes like `data-sveltekit-hydrated` — but every piece of user-visible content is in both.

### 1.4 Why SSR matters for real users

Three concrete benefits, not abstract ones:

1. **Core Web Vitals.** Google measures First Contentful Paint, Largest Contentful Paint and INP on real Chrome users and uses those numbers as ranking signals. SSR moves FCP and LCP from "after your JS runs" to "as soon as the HTML arrives". That is typically a 500 ms to 3000 ms improvement on mobile.
2. **SEO.** Every search engine and every social scraper sees the real content on the first byte. You do not have to opt into a prerendering service. You do not have to configure a crawler. You just get indexed.
3. **Perceived performance.** Even on fast networks, seeing content appear instantly feels dramatically faster than seeing a spinner for 300 ms and then content. SSR gives you the first impression for free.

The trade-off is that SSR needs a server. `adapter-node`, `adapter-vercel`, `adapter-cloudflare` — all of these run JavaScript on a server at request time. If your host only serves static files, you cannot SSR; you must use **SSG** (Lesson 9A.10) instead, which is SSR done once at build time and cached as static HTML.

### 1.5 SSR is not the same as rendering slow data on the server

A common confusion: "if I SSR, does that mean every request waits for my database?" Only if you wrote it that way. SSR is about *where* the HTML is generated, not about *when* the data is fetched. You can combine SSR with caching, with streaming (`Promise` returns in load, Lesson 9A.9), or with full SSG. SvelteKit lets you pick the right mix per route.

### 1.6 The cost model of SSR

SSR is not free. It costs CPU time on your server for every request. Each request must:

1. Run the route's `load` function (possibly hitting a database or API).
2. Import and execute the component tree to produce an HTML string.
3. Serialize the load data into a `<script>` tag for hydration.
4. Send the complete response.

For a simple page, this takes 5-20ms on a modern server. For a complex page with many components and data, it can take 50-200ms. At high traffic, those milliseconds multiply. The mitigation strategies are:

- **Caching at the CDN or edge.** Many pages (marketing, blog posts) can be cached for minutes or hours, eliminating per-request server cost.
- **Streaming.** Send the shell immediately and stream the slow parts as they become ready (Lesson 9A.9).
- **SSG.** For pages that change rarely, generate at build time and serve as static files (Lesson 9A.10).
- **Partial prerendering.** Render the shell at build time, fill in per-user data at request time. This is emerging in SvelteKit's adapter ecosystem.

### 1.7 SSR and security boundaries

A critical point that beginners miss: code that runs during SSR has full server access. Your `load` function can read environment variables, query databases, access the filesystem. But the *rendered HTML* is sent to the browser, so any secret data included in the markup or serialized data is exposed to the client. SvelteKit's `+page.server.ts` (server-only load) serializes its return value with `devalue` and sends it to the client as JSON. If your load function returns `{ user: { email, internalNotes } }`, both fields are visible in the page source. Only return data that is safe for the requesting user to see.

## Deep Dive

**Why this matters at scale.** In a production app with 20 routes, SSR is the difference between a site that scores 90+ on Lighthouse Performance (for LCP and FCP) and one that scores 40. The reason is physics: no amount of JavaScript optimization can make a client-rendered page appear faster than the network round-trip to download and parse the JS bundle. SSR sidesteps the problem entirely — the HTML arrives pre-rendered, and the browser can paint immediately. For SEO-critical pages (anything that should appear in search results), SSR is non-negotiable. For authenticated dashboards, it is strongly recommended. The only pages where CSR is acceptable are those where SEO does not matter and the user is already authenticated with a loaded shell.

**The mental model.** SSR is like a restaurant that prepares your plate in the kitchen (server) and brings it to your table ready to eat (browser). CSR is like a restaurant that brings you a bag of raw ingredients (JS bundle) and a recipe card (component code), and you cook the meal at your table (browser). The first method means you eat faster. The second means the kitchen does less work but the table (your user's phone) does all the cooking. On a powerful device the difference is small. On a mid-range phone with a slow connection, the difference is the user waiting 3 seconds to see food vs. seeing it immediately.

**Edge cases.** SSR runs your component code in a Node.js environment where `window`, `document`, `navigator`, `localStorage`, and all browser APIs are undefined. Any top-level code that references these will crash SSR. The safe patterns are: (1) put browser-only code in `onMount` or `$effect`, (2) guard with `import { browser } from '$app/environment'`, (3) use `+page.server.ts` for truly server-only logic. Another edge case: SSR does not run `$effect` blocks, `onMount` callbacks, or event handlers. Only the synchronous render path executes on the server. This means the server-rendered HTML reflects the initial state, not any state that effects or mount callbacks would set.

**Performance implications.** SSR's impact on Core Web Vitals is dramatic. LCP improves by 500-3000ms on mobile because the largest content element is in the initial HTML, not waiting for JS execution. CLS improves because server-rendered elements have their final dimensions from the start. INP is neutral — SSR does not affect interaction responsiveness once the page is hydrated. The cost is server CPU time, which scales linearly with traffic. For high-traffic pages, SSG (prerendering) eliminates that cost entirely.

**Connection to other modules.** SSR was previewed in Module 1 (compiled output). This lesson (8.2) explains the mechanism. Lesson 8.3 covers hydration (making SSR'd pages interactive). Module 9A teaches load functions (the server-side data-fetching layer). Module 12 connects SSR to LCP optimization. Module 13 connects SSR to SEO (crawlers see the full HTML). Every architectural decision in the course — from token-based styling to typed load functions — is designed to work correctly across both server and client environments.

## 2. Style it — PE7 for a "proof" page

The mini-build is a card that displays the server's render timestamp. We give it a calm green personality (`oklch(70% 0.18 150)`) because the message is positive — *look, SSR works*. The timestamp uses `ui-monospace` to make it look like a machine value. Every spacing token and color token comes from PE7.

## 3. Interact — rendering a value that came from the server

The only interactive element is the server timestamp. It is not a rune, not reactive, not even re-rendered on the client:

```svelte
<script lang="ts">
    const renderedAt: string = new Date().toISOString();
</script>

<time datetime={renderedAt}>{renderedAt}</time>
```

`new Date()` runs once, on the server, when the page is rendered. Its value is baked into the HTML string. When the browser hydrates, Svelte does *not* run this line again (it would produce a new timestamp, and a hydration mismatch — see Lesson 8.3). Open DevTools → Network → Doc → Response, and you will see the exact timestamp in the HTML body.

## 4. Mini-build — View Source vs Inspect

**File:** `src/routes/modules/08-routing/02-what-ssr-is/+page.svelte`

The route already exists in the repository. Open `/modules/08-routing/02-what-ssr-is` in your browser and follow the DevTools script below.

### Prove SSR in four steps

1. **Open the page.** `pnpm dev` is running.
2. **View Source** (Cmd/Ctrl + U on most browsers). Search the HTML for the text *"rendered on the server"*. It is there. That sentence was never typed into a string by JavaScript in your browser — it was written into the HTTP response body on the server.
3. **Inspect** the `<time>` element. The `datetime` attribute and text content are the exact same ISO string that was in View Source. It has not changed.
4. **Reload the page twice.** The timestamp is different every time. That proves the value is generated per request on the server. It is not a build-time constant.

### Where did the HTML come from?

Open DevTools → Network. Click the top row (the HTML document). Go to the **Response** tab. You are looking at the literal bytes the SvelteKit server sent. Scroll through them. Every `<p>`, every class, every attribute is already there. No JavaScript has run yet. That is SSR.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In your own words, what does "Server-Side Rendering" mean?</summary>

It means the HTML of a page is generated on the server, so the first HTTP response the browser receives already contains the final rendered markup. The browser can paint immediately, before any JavaScript is parsed or executed.
</details>

<details>
<summary><strong>Q2.</strong> Why does View Source look different from Inspect on a pure client-side React app but identical on a SvelteKit page?</summary>

View Source shows the raw HTML from the server; Inspect shows the live DOM after JavaScript has run. A pure client-side app sends an empty shell from the server, so View Source is empty, and only Inspect (post-JS) shows content. SvelteKit sends the rendered HTML from the server, so View Source already contains the content and Inspect looks almost identical.
</details>

<details>
<summary><strong>Q3.</strong> Name three users or tools that benefit from SSR.</summary>

(1) Humans on slow mobile connections — they see content instantly instead of a blank screen. (2) Search engine crawlers — they read the final HTML without having to execute JavaScript. (3) Social media link previews (Twitter, LinkedIn, iMessage) — they can parse the `<meta>` tags and visible content from the HTML directly.
</details>

<details>
<summary><strong>Q4.</strong> If you reload an SSR page three times and the timestamp changes each time, what does that prove?</summary>

It proves the HTML is being regenerated on the server per request. If the timestamp were baked in at build time (SSG), it would be identical on every reload. If it were set on the client, it would change on reload but View Source would show an empty placeholder.
</details>

<details>
<summary><strong>Q5.</strong> Does SSR mean the server is slow because it waits for data?</summary>

Not by itself. SSR only describes *where* the HTML is generated. Whether the server waits for slow data is a separate decision — you can cache, you can stream partial HTML with `Promise` returns from `load` (Lesson 9A.9), or you can avoid slow calls entirely by prerendering (Lesson 9A.10).
</details>

## 6. Common mistakes

- **Assuming "SSR" means the page re-renders on the server on every keystroke.** SSR only happens on the initial navigation to a URL. Once the page is hydrated, subsequent interactions are client-side.
- **Looking at Inspect and declaring "SSR works".** Inspect shows the post-JS DOM, which is always full. The only valid proof of SSR is **View Source**, which shows the pre-JS HTML.
- **Calling `document` or `window` in a top-level `<script>`.** That code will run on the server during SSR, where `document` is undefined, and your page will crash. Browser-only code belongs inside `onMount` or inside a `$effect` block.
- **Thinking SSR is incompatible with `adapter-static`.** It is not. With `adapter-static`, SvelteKit runs SSR once at build time for every page and saves the result as a `.html` file. That is SSG (Lesson 9A.10), and it is SSR minus the request-time part.

## 7. What's next

Lesson 8.3 follows the handover from static HTML to live, interactive components — the step called hydration — and shows what happens when it goes wrong.
