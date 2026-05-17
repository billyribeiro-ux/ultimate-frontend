---
module: 12
lesson: 12.1
title: Performance fundamentals — Core Web Vitals
duration: 50 minutes
prerequisites:
  - Module 1 — the compile model
  - Module 8 — SvelteKit SSR
learning_objectives:
  - Name the three Core Web Vitals and their pass/fail thresholds
  - Explain what LCP, CLS, and INP measure and what causes each to fail
  - Measure a live page with Lighthouse and with Chrome DevTools Performance
  - Distinguish lab metrics from field metrics and know when to trust each
  - Read a Web Vitals panel and identify the single biggest win available
status: ready
---

# Lesson 12.1 — Performance fundamentals — Core Web Vitals

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Module 12 opens with the same three numbers Google uses to rank pages in search results. Every subsequent lesson is a technique for moving one of those numbers in the right direction.

## 1. Concept — Three numbers and the experience each one protects

### 1.1 The problem web vitals solve

Before Core Web Vitals, "performance" on the web meant whatever a developer felt like measuring. Some teams measured "time to first byte" and called it a day. Some measured "DOMContentLoaded". Some measured nothing at all. The result was that two different teams could both claim their site was fast while one loaded in 1.2 seconds and the other in 4.8. Users could tell the difference instantly; no engineering team could agree on a vocabulary for it.

Google's Chrome team shipped **Core Web Vitals** in 2020 as a small, specific, user-centred vocabulary. Three numbers. Each measures one moment of the user's real experience. Each has a specific, defensible threshold drawn from usability research. And — crucially — Google uses the scores as real ranking signals in its search results, which means that caring about them is no longer optional for anyone who wants their pages to be found.

The three numbers you must know by heart:

| Metric | Measures | Good | Needs work | Poor |
| --- | --- | --- | --- | --- |
| **LCP** (Largest Contentful Paint) | When the biggest visible thing appears | **≤ 2.5 s** | ≤ 4.0 s | > 4.0 s |
| **CLS** (Cumulative Layout Shift) | How much the page jumps around as it loads | **≤ 0.1** | ≤ 0.25 | > 0.25 |
| **INP** (Interaction to Next Paint) | How fast the page responds to clicks, taps, and key presses | **≤ 200 ms** | ≤ 500 ms | > 500 ms |

A page is considered "good" for Core Web Vitals only if it is in the green column on all three metrics at the 75th percentile of real users. The 75th percentile is important — it means three out of four of your users, not the lucky ones on fast laptops with fibre.

### 1.2 LCP — "when does the user see the point of this page?"

LCP measures the time from navigation start until the single largest contentful element inside the viewport finishes rendering. That element is usually a hero image, a headline, or a large block of body text. LCP answers the question: *when does the user see the thing they came here for?*

The causes of a bad LCP are almost always one of four:

1. **Slow server.** Your `load()` function waits three seconds for an API call before returning anything. Fix by parallelising data loads (Module 9A Lesson 9A.6) or by streaming (9A.9).
2. **Slow CSS.** A blocking stylesheet at the head of the document delays first paint. Fix by inlining critical CSS and deferring the rest. SvelteKit mostly does this for you.
3. **Render-blocking JavaScript.** A large bundle must parse before the page can render anything meaningful. Fix by code splitting (Lesson 12.3) and avoiding heavy third-party scripts in the critical path.
4. **An unoptimised hero image.** A 3 MB JPEG for a 1 200-pixel-wide hero. Fix with responsive images, modern formats, and `fetchpriority="high"` (Lesson 12.2).

### 1.3 CLS — "did the page jump while I was trying to click a button?"

CLS measures the sum of every unexpected layout shift that happens during a session. If the "subscribe" button you are about to click suddenly moves three inches down because an ad loaded above it and you accidentally click the ad instead, that is a layout shift. CLS quantifies how much of that happens.

The causes of bad CLS are almost always one of three:

1. **Images without `width` and `height` attributes.** Before the image loads, the browser reserves zero space. When the image arrives, the rest of the page leaps down. Fix by always specifying `width` and `height` (Lesson 12.2).
2. **Web fonts that swap.** A font loads, the text re-measures, and everything shifts. Fix with `font-display: optional` or by preloading the font.
3. **Late-injected ads, embeds, or banners.** The fix is to reserve space with `min-height` *before* the late content arrives, so the slot does not grow when it finally appears.

CLS is the cheapest of the three metrics to fix — most of the work is boring and mechanical — but beginners ignore it for years because it does not make the page feel slow; it only makes it feel broken.

### 1.4 INP — "when I tapped, when did something happen?"

INP replaced the older FID (First Input Delay) metric in March 2024 and is the hardest of the three to get green. It measures, for every interaction the user makes during the whole session, the time between the input event and the next frame painted after it. Google then reports something close to the *worst* interaction rather than a single lucky one. If any single click during the user's whole visit took 600 ms to respond, your INP is 600 ms.

INP is sensitive to main-thread work. Anything that blocks the main thread between an input and the next paint — a huge synchronous computation, a giant React diff, a blocking network request — raises INP. In the Svelte 5 world, you are already ahead of React here because Svelte has no virtual-DOM diffing step. But you can still hurt yourself with expensive `$effect` work, huge loops in event handlers, or a third-party script that blocks for hundreds of milliseconds at random.

Module 12 spends several lessons on INP-specific techniques: `$effect` hygiene (Lesson 12.4), memoisation with `$derived` (Lesson 12.5), lazy-loading the heavy stuff (Lesson 12.3), and the whole 3D performance lesson (12.12) which exists because WebGL canvases are a common INP disaster.

### 1.5 Measuring — lab versus field

There are two places a Core Web Vitals number can come from, and they sometimes disagree:

- **Lab metrics** come from a synthetic run, usually Lighthouse or Chrome DevTools' Performance panel, on a throttled CPU and network. They are repeatable, fast, and free. You run a lab audit while you are developing. Lighthouse's overall score is a weighted blend of LCP, CLS, INP (via Total Blocking Time), and a handful of other signals.
- **Field metrics** (also called RUM, real user monitoring) come from actual users on actual devices. Chrome's `web-vitals` library reports them to any endpoint you like; Google's CrUX (Chrome User Experience Report) aggregates them anonymously and publishes a dataset that PageSpeed Insights and Search Console read from. Field data is what Google uses for ranking.

Lab data is how you find problems. Field data is how you know if your fixes worked in the real world. Trust lab data during development; trust field data after deployment. They agree most of the time, but when they disagree, the field wins, because a real user on a real device is the only ground truth that matters.

### 1.6 The measurement workflow for this course

The short version:

1. **Start of a feature:** open Chrome DevTools → Lighthouse → "Analyse page load" on mobile. Note the current LCP, CLS, and INP.
2. **While building:** watch the Performance panel if you change anything that could affect INP (a new `$effect`, a big component, a heavy action handler). Look at the "Long tasks" row.
3. **Before merging:** run Lighthouse again. Confirm nothing has regressed.
4. **After deploying:** check PageSpeed Insights or Search Console's Core Web Vitals report after 28 days of real-user data. Adjust.

Every technique in Module 12 maps back to one or more of these three numbers. By the end of the module you will be able to look at a failing Lighthouse report and name the specific fix for each red box.

### 1.7 Why Svelte gives you a head start

Svelte's compiled architecture provides structural advantages for all three metrics:

- **LCP**: No runtime library to download. Svelte's SSR produces real HTML on first byte. Component code is small because the compiler generates targeted updates, not a generic diffing engine.
- **CLS**: Svelte's scoped CSS means styles are always colocated with their components. There is no FOUC (flash of unstyled content) from late-loading stylesheets. Server-rendered HTML has the correct classes from the start.
- **INP**: No virtual DOM diffing. When state changes, Svelte updates only the specific DOM nodes that depend on that state. A click handler that changes one number causes one text node update, not a full component re-render. This gives you dramatically lower interaction cost than React or Vue for equivalent UIs.

But Svelte does not make you immune. You can still hurt LCP with slow load functions, hurt CLS with unsized images, and hurt INP with expensive effects. The framework gives you a better starting position; the techniques in this module keep you in the green.

### 1.8 The three-metric triad and how they interact

The three metrics are not independent. Optimizing one can affect another:

- Inlining critical CSS (good for LCP) can increase HTML size, which slightly delays Time to First Byte.
- Lazy-loading images (good for LCP of above-fold content) can cause CLS if the image containers are not pre-sized.
- Code-splitting (good for INP by reducing hydration time) can increase LCP if the split chunk is needed for the largest content.
- Preloading fonts (good for CLS by preventing FOUT) increases initial transfer size, potentially slowing LCP.

The art of web performance is balancing these trade-offs. The green thresholds (LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms) are your targets. Any technique that moves one metric green without moving another red is a clear win. Module 12's lessons cover each technique with awareness of its cross-metric effects.

## Deep Dive

**Why this matters at scale.** Google uses Core Web Vitals as real ranking signals. A page that scores "poor" on any of the three metrics loses ranking position relative to competitors who score "good." For commercial sites, this translates directly to revenue: a study by Deloitte found that a 0.1s improvement in mobile speed increased conversion rates by 8.4% for retail sites. In a 20-route SvelteKit app, optimizing the 5 highest-traffic pages for Core Web Vitals can produce measurable traffic increases within 28 days (the CrUX reporting window). This is not theoretical — it is the primary reason performance engineering exists as a discipline.

**The mental model.** Think of the three metrics as three vital signs for a patient (your page). LCP is the heart rate — how quickly the page shows signs of life. CLS is the blood pressure — how stable and predictable the page's layout is. INP is the reflex response — how quickly the page responds when you poke it. A healthy page has all three in the green zone. A page with one metric in the red needs targeted treatment. A page with all three in the red needs triage: fix the worst one first (usually LCP, because it is the first thing users and crawlers notice).

**Edge cases.** LCP measurement is tricky: the "largest contentful paint" element can change during loading. Initially it might be a heading, then an image loads and becomes the new LCP element. This means a fast heading paint followed by a slow image load gives you a *worse* LCP than the heading alone. The fix: ensure your LCP element loads early (preload images, inline critical CSS). CLS only counts shifts that are not user-initiated — scrolling that triggers an element to move does not count, but a lazy-loaded ad that pushes content down does. INP measures the *worst* interaction, not the average — one bad interaction in a 30-minute session defines your score.

**Performance implications.** Each metric has a specific budget. LCP: 2.5 seconds from navigation start to largest paint. That includes DNS resolution (~50ms), TCP connection (~50ms), TLS handshake (~50ms), server response time (~200ms for SSR), HTML download (~100ms), CSS download and parse (~100ms), image download (variable). The budget is tight on mobile. CLS: a cumulative score of 0.1 means approximately 10% of the viewport can shift once during the page's lifetime. A 50px shift on a 800px viewport = 0.0625 shift. INP: 200ms from event to paint means your handler + reactive updates + DOM write + paint must all complete in 200ms. On a 4x-throttled CPU (mobile simulation), that means your actual JS work budget is about 50ms.

**Connection to other modules.** Core Web Vitals provide the motivation for every optimization technique in Module 12: image optimization (12.2) for LCP, code splitting (12.3) for hydration/INP, effect performance (12.4) for INP, memoization (12.5) for INP, error boundaries (12.7) for graceful degradation, accessibility (12.8) which overlaps with CLS (focus management, skip links), and deployment (12.11) which affects TTFB. Module 13 (SEO) connects performance directly to search ranking. The capstone project targets green on all three metrics as a mandatory requirement.

## 2. Style it — A vitals dashboard

The mini-build renders a small "Core Web Vitals dashboard" with three cards (LCP, CLS, INP), each showing a fake measurement against its threshold with a PE7-coloured status pill. Per-page accent: `oklch(68% 0.2 140)` (metric green).

- Each card has a minimum 44px click target even though it does not need one, because touch-target parity is a PE7 rule.
- The status pill is red/amber/green via `var(--color-error)`, `var(--color-warning)`, `var(--color-success)`.
- `prefers-reduced-motion` removes the card hover scale.

## 3. Interact — Two fake measurements to reason about

The dashboard has two buttons: "simulate fast" sets all three values to their green state; "simulate slow" sets them to poor. Students see the pills change colour and read the explanatory copy underneath. It is deliberately not a real measurement — the point is to internalise the thresholds, not to collect data yet.

## 4. Mini-build — A vitals dashboard with thresholds

**File:** `src/routes/modules/12-performance/01-core-web-vitals/+page.svelte`

Three cards showing LCP, CLS, and INP with mock values that the student can toggle. Each card includes the threshold table and a short explanation of what the metric measures.

### DevTools moment

Open the real Lighthouse panel (Chrome DevTools → Lighthouse) and run a mobile audit against this page. Note the LCP, CLS, and INP. Compare them to the fake numbers in the dashboard. Every technique in the remaining eleven lessons is aimed at one of these three real numbers.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the green thresholds for LCP, CLS, and INP?</summary>

LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms. Measured at the 75th percentile of real users.
</details>

<details>
<summary><strong>Q2.</strong> What does INP measure and why is it harder than LCP?</summary>

INP measures the time from an input event (click, tap, key press) until the next frame paints afterwards, and it reports approximately the worst interaction of the whole session. It is harder than LCP because it depends on every piece of code that might run during an interaction — event handlers, effects, third-party scripts — not just the initial load.
</details>

<details>
<summary><strong>Q3.</strong> Why is specifying <code>width</code> and <code>height</code> on images a CLS fix?</summary>

Without those attributes, the browser reserves zero space for the image until it loads. When the image arrives, the rest of the page shifts down to accommodate it, and that shift counts toward CLS. With `width` and `height`, the browser reserves the correct aspect-ratio box immediately, so there is no shift.
</details>

<details>
<summary><strong>Q4.</strong> When lab and field metrics disagree, which do you trust?</summary>

Field. Real users on real devices are the ground truth; lab runs are approximations. Lab data is how you find problems during development, but field data is how you know your fix worked in production.
</details>

<details>
<summary><strong>Q5.</strong> Why is Svelte 5 already at an INP advantage compared to React?</summary>

Svelte has no virtual-DOM diffing step. An event handler that mutates reactive state triggers targeted updates directly, instead of re-rendering a tree and diffing. That work is cheaper on the main thread, which keeps interactions inside the 200 ms INP budget without extra tuning.
</details>

## 6. Common mistakes

- **Measuring on a MacBook Pro only.** Your users are on mid-range Androids with throttled networks. Always test in Lighthouse with "Mobile" selected.
- **Fixing LCP without checking CLS.** A faster hero that shifts the page when it arrives moves LCP the right direction and CLS the wrong direction. Verify both.
- **Treating Lighthouse as the final word.** Lighthouse is a lab tool. Use it in development; trust CrUX and your own RUM in production.
- **Assuming "no animation = green CLS".** Any late-injected element causes CLS, even without animation. Reserve space for every late element.

## 7. What's next

Lesson 12.2 tackles the single biggest LCP and CLS win for most sites: image optimisation.
