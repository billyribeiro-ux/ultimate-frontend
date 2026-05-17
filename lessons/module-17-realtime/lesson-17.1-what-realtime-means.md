---
module: 17
lesson: 17.1
title: What "real-time" means on the web
duration: 40 minutes
prerequisites:
  - Module 8 — SvelteKit routing
  - Module 9A — Data loading
  - Module 10 — API endpoints and forms
learning_objectives:
  - Define "real-time" in the context of web applications and explain why traditional request-response is insufficient
  - Compare polling, long-polling, Server-Sent Events, and WebSockets across latency, complexity, and resource cost
  - Choose the correct transport for a given use case based on concrete trade-offs
  - Explain why SSE is underrated and identify scenarios where it outperforms WebSockets
  - Draw a timeline diagram of each transport showing when data flows between client and server
status: ready
---

# Lesson 17.1 — What "real-time" means on the web

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This opening lesson establishes the vocabulary and mental model you will use for the entire module. No server code yet — we focus on understanding the problem and the four solutions the web platform offers.

## 1. Concept — The problem of stale data and four ways to solve it

### 1.1 What the problem is

Every web application you have built so far follows the same pattern: the browser sends a request, the server sends a response, and the connection closes. If the data on the server changes one second later, the browser has no idea. The page shows stale information until the user manually refreshes or navigates away and comes back.

For many applications — a blog, a documentation site, a portfolio — this is perfectly fine. The content does not change between page loads. But for a growing category of modern applications — chat, collaborative editing, live dashboards, stock tickers, multiplayer games, notification systems — stale data is not acceptable. Users expect to see changes the *moment* they happen, without lifting a finger.

This expectation is what we call **real-time communication** on the web. It does not mean "instantaneous" in the physics sense. It means: when a relevant event occurs on the server, the client learns about it within a human-perceptible threshold — typically under 200 milliseconds, which users perceive as "immediate."

The fundamental challenge is that HTTP was designed as a request-response protocol. The server cannot speak unless spoken to. To achieve real-time behaviour, we need one of four strategies, each with different trade-offs.

### 1.2 Strategy 1 — Polling

Polling is the brute-force approach. The client sets a `setInterval` and makes a fresh HTTP request every N seconds (say, every 5 seconds). If the server has new data, the response includes it. If not, the response is empty.

**Advantages:** Dead simple. Works everywhere. No special server infrastructure. You can implement it with a `setInterval` and a `fetch` call in ten lines.

**Disadvantages:** Wasteful. If you poll every 5 seconds and the data changes once a minute, 11 out of 12 requests are useless. Every request carries full HTTP headers — cookies, auth tokens, content-type — consuming bandwidth and server resources for nothing. And with a 5-second interval, you can be up to 5 seconds behind real time. Making the interval shorter helps latency but makes the waste worse.

**When to use it:** When real-time is not critical (acceptable latency of 5-30 seconds), the data changes infrequently, and you want zero server complexity. Checking for new email every 30 seconds is a reasonable use of polling.

### 1.3 Strategy 2 — Long-polling

Long-polling improves on polling by keeping the connection open. The client sends a request, and the server holds it open — does not respond — until either new data arrives or a timeout elapses (typically 30-60 seconds). When the server finally responds, the client immediately sends a new request, and the cycle repeats.

**Advantages:** Much lower latency than regular polling. The client learns about new data almost immediately because the server responds the moment data is ready. Far fewer wasted requests because each request results in meaningful data.

**Disadvantages:** Keeping many connections open consumes server memory. Each held request occupies a thread (or at minimum an open TCP connection) on the server. At scale — tens of thousands of concurrent users — this becomes expensive. Also, every response-reconnect cycle has a brief gap where new data could be missed, requiring careful sequencing with event IDs.

**When to use it:** When you need lower latency than polling but cannot use SSE or WebSockets (for example, behind a corporate proxy that blocks them). Long-polling was the standard before EventSource existed in browsers and is now rarely the best choice.

### 1.4 Strategy 3 — Server-Sent Events (SSE)

SSE is a standard HTTP response with `Content-Type: text/event-stream`. The server sends a stream of text-based events over a single, long-lived HTTP connection. The browser provides a built-in `EventSource` API that handles connection management, automatic reconnection, and event parsing for you.

**Advantages:** Uses plain HTTP — works through proxies, CDNs, and load balancers that understand HTTP. Automatic reconnection is built into the browser API. Extremely lightweight on the server because it is just a streaming HTTP response — no protocol upgrade, no frame parsing. You can implement it with a SvelteKit `+server.ts` that returns a `ReadableStream`.

**Disadvantages:** One-directional only — server to client. If the client needs to send data back, it must use a separate HTTP request (a normal `fetch` POST). Limited to text (no binary frames). Some older corporate proxies buffer responses and break the stream. Maximum of around 6 concurrent connections per domain in HTTP/1.1 (not an issue with HTTP/2).

**When to use it:** Notifications, live feeds, dashboards, progress updates, real-time search results — any scenario where data flows primarily from server to client. This is *most* real-time use cases. SSE is underrated because developers reach for WebSockets reflexively, even when SSE would be simpler, cheaper, and more reliable.

### 1.5 Strategy 4 — WebSockets

WebSockets start as an HTTP request that "upgrades" the connection to a different protocol entirely. Once upgraded, the connection is full-duplex: both client and server can send frames at any time, in either direction, without HTTP overhead. Messages are framed in a binary format with minimal headers (as few as 2 bytes of overhead per frame).

**Advantages:** True bidirectional communication. Lowest possible latency in both directions. Supports binary data. No HTTP overhead per message after the initial handshake. Ideal for scenarios with high-frequency messages in both directions.

**Disadvantages:** Requires a protocol upgrade — some proxies, CDNs, and serverless platforms do not support it. More complex to implement correctly (connection state management, heartbeats, reconnection logic you must write yourself). Cannot use standard HTTP middleware (compression, authentication, caching) after the upgrade. Harder to scale horizontally because connections are stateful.

**When to use it:** Chat applications, multiplayer games, collaborative editing with operational transforms, live cursor sharing — scenarios where the client sends frequent updates *and* the server sends frequent updates, and both need sub-100ms latency.

### 1.6 The decision framework

| Factor | Polling | Long-polling | SSE | WebSocket |
| --- | --- | --- | --- | --- |
| Latency | 1-30s | ~instant | ~instant | ~instant |
| Direction | Client-initiated | Client-initiated | Server→Client | Bidirectional |
| Server complexity | Low | Medium | Low | High |
| Browser support | Universal | Universal | All modern | All modern |
| Works behind proxies | Always | Usually | Usually | Sometimes not |
| Auto-reconnect | Manual | Manual | Built-in | Manual |
| Binary data | No | No | No | Yes |
| HTTP/2 multiplexing | Yes | Yes | Yes | No (separate TCP) |

The key insight most developers miss: **SSE covers 80% of real-time use cases** with 20% of the complexity of WebSockets. If data flows primarily from server to client — and the client occasionally sends actions via normal HTTP requests — SSE is almost always the right choice. WebSockets are necessary only when both directions need low-latency, high-frequency messaging.

### 1.7 What is different in 2026

In older tutorials you will find references to libraries like Socket.IO that wrap WebSockets with polling fallbacks. In 2026, every modern browser supports both `EventSource` (SSE) and `WebSocket` natively. You do not need a compatibility layer. Socket.IO still exists and is useful for its room/namespace abstractions and automatic reconnection, but it is no longer necessary for basic connectivity.

SvelteKit's `+server.ts` endpoints can return streaming responses natively, making SSE trivial to implement without any additional packages. For WebSockets, you need adapter-node and a small amount of custom server setup — something we will cover in Lesson 17.6.

## 2. Style it — A transport comparison card grid

The mini-build for this lesson is a visual comparison of the four transports. Each transport gets a card showing its key characteristics. We use the PE7 token system:

- Cards sit in a responsive grid: single column on mobile, 2x2 from `--bp-sm` up
- Each card uses `--color-surface-2` with a left border whose color indicates the transport's "suitability" — green for SSE (recommended default), blue for WebSocket, amber for long-polling, grey for polling
- Touch targets (the "Learn more" link at the bottom of each card) respect the 44px minimum
- The page personality color is a teal from the OKLCH gamut: `oklch(65% 0.15 200)` — evoking connectivity and flow

## 3. Interact — Visualising latency with a simulated timeline

The interactive concept in this lesson is **timing visualisation**. We simulate the four transports with `setInterval` and `setTimeout` to show how each one delivers data over a 10-second window:

- Polling: a new "response" dot appears every 2 seconds regardless of when data arrives
- Long-polling: the dot appears the moment data arrives, then a brief reconnect gap
- SSE: data appears instantly with no gaps
- WebSocket: data appears instantly, bidirectional arrows show both directions

The student sees a live timeline that populates as they watch, making the latency differences viscerally obvious. The key TypeScript concept: **discriminated unions for transport configuration**. Each transport simulator is configured with a typed object whose `type` field determines which simulation logic runs — the same pattern we will use for real messages in later lessons.

## 4. Mini-build — Real-time transport visualiser

**File:** `src/routes/modules/17-realtime/01-what-realtime-means/+page.svelte`

The file renders four horizontal timeline lanes. Each lane simulates one transport delivering five data events over 10 seconds. Dots appear on each lane at the moment data "arrives" at the client, making the timing differences visible at a glance.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/17-realtime/01-what-realtime-means`.

You will see four labeled lanes (Polling, Long-polling, SSE, WebSocket). Over 10 seconds, colored dots appear on each lane showing when data would reach the client. Polling dots are evenly spaced. Long-polling dots cluster near the actual event times with small gaps. SSE and WebSocket dots appear at the exact event time.

### DevTools moment

Open the **Performance** tab in DevTools, hit record, and watch for 10 seconds. You will see the `setInterval` callbacks firing. Notice that no real network requests are made — this is a pure simulation. In the next lesson (17.2), we will make real SSE requests and you will see the `text/event-stream` response in the Network tab.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> A dashboard shows live server metrics that update every second. Users never send data back through the real-time channel — they just watch. Which transport would you choose and why?</summary>

Server-Sent Events. The data flows in one direction only (server to client), the update frequency (1/second) is well within SSE's capabilities, and SSE requires no protocol upgrade, works through CDNs and proxies, and handles reconnection automatically. WebSocket would work but adds unnecessary complexity for a unidirectional stream.
</details>

<details>
<summary><strong>Q2.</strong> Explain in your own words why long-polling is rarely the best choice in 2026.</summary>

Long-polling was invented as a workaround before browsers supported EventSource and WebSocket natively. It achieves low latency but at the cost of holding many connections open and introducing reconnect gaps. In 2026, all modern browsers support SSE and WebSocket, so there is almost never a reason to use long-polling unless you are behind infrastructure that actively blocks both SSE (buffering proxies) and WebSocket (no upgrade support), which is increasingly rare.
</details>

<details>
<summary><strong>Q3.</strong> What does "full-duplex" mean in the context of WebSockets, and how does it differ from SSE?</summary>

Full-duplex means both the client and the server can send messages independently at any time on the same connection, without waiting for the other side. SSE is half-duplex in the sense that only the server sends events over the stream; the client must use a separate HTTP request to send data back. The distinction matters when both sides need to send high-frequency messages — chat input, cursor positions, game state — where the overhead of separate HTTP requests for client-to-server communication would be unacceptable.
</details>

<details>
<summary><strong>Q4.</strong> A polling client checks every 5 seconds. An event occurs 1 second after the last poll. What is the maximum and average latency the user experiences before seeing that event?</summary>

Maximum latency is 5 seconds (the full interval minus nothing — the event happened just after a poll, so the client waits almost the entire next interval). Average latency is 2.5 seconds (half the polling interval, assuming events are uniformly distributed in time). This is the fundamental problem with polling: latency is bounded by the interval, and reducing the interval wastes more resources.
</details>

<details>
<summary><strong>Q5.</strong> Why does SSE work through HTTP proxies and CDNs more reliably than WebSocket?</summary>

SSE uses a standard HTTP response with a specific Content-Type (`text/event-stream`). Proxies and CDNs understand HTTP and can pass the response through without special handling (though some buffering proxies need the `X-Accel-Buffering: no` header). WebSocket requires an HTTP 101 Upgrade response that switches to an entirely different protocol. Many proxies, load balancers, and CDNs do not support protocol upgrades, and will either block the connection or silently drop it after a timeout.
</details>

## 6. Common mistakes

- **Reaching for WebSocket by default.** The most common mistake is choosing WebSocket for a problem that only needs server-to-client streaming. If your "real-time" feature is a notification feed, a live counter, or a dashboard — and the client sends actions via normal button clicks / form submissions — SSE is simpler, more reliable, and easier to scale.
- **Confusing "real-time" with "instant."** Students sometimes expect zero latency. Network physics impose a floor: a round trip from New York to London takes ~70ms minimum. Real-time means "fast enough that humans perceive it as immediate" — under 200ms for most interactions, under 50ms for cursor tracking.
- **Polling with too-short intervals.** Setting `setInterval` to 100ms to "make it real-time" creates 10 requests per second per client. With 1000 concurrent users, that is 10,000 requests per second to your server — most returning empty responses. This is a denial-of-service attack on your own infrastructure.
- **Ignoring reconnection.** Networks drop. Laptops sleep. Mobile devices switch from Wi-Fi to cellular. Any real-time connection will be interrupted. If you do not handle reconnection gracefully — with backoff, with event ID resumption — your users see stale data after every brief interruption and blame your app.

## 7. What's next

Lesson 17.2 builds your first real SSE endpoint in a SvelteKit `+server.ts` file — a live clock that streams the server time every second, complete with typed events and proper headers.
