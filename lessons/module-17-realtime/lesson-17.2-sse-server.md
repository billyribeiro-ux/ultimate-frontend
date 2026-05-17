---
module: 17
lesson: 17.2
title: Server-Sent Events with SvelteKit
duration: 45 minutes
prerequisites:
  - Lesson 17.1 — transport trade-offs
  - Module 10 — +server.ts endpoints
learning_objectives:
  - Create a SvelteKit +server.ts endpoint that returns a text/event-stream response
  - Construct a ReadableStream that emits properly formatted SSE events
  - Use the event, data, id, and retry fields of the SSE wire format correctly
  - Implement abort signal cleanup to avoid memory leaks when clients disconnect
  - Test an SSE endpoint with curl and verify the event stream format
status: ready
---

# Lesson 17.2 — Server-Sent Events with SvelteKit

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This lesson takes you from "I know what SSE is in theory" to "I have a working SSE endpoint streaming live data from my SvelteKit server."

## 1. Concept — Streaming events from a +server.ts endpoint

### 1.1 What the problem is

You want your SvelteKit application to push data to the browser the moment it becomes available on the server. In Lesson 17.1, you learned that Server-Sent Events are the right choice when data flows primarily from server to client. But how do you actually create an SSE endpoint in SvelteKit?

The answer is surprisingly simple: a `+server.ts` GET handler that returns a `Response` with `Content-Type: text/event-stream` and a body that is a `ReadableStream`. SvelteKit does not need any special plugin or package for this — it is standard web platform APIs all the way down.

### 1.2 The SSE wire format

Before writing code, you need to understand exactly what bytes travel over the wire. An SSE stream is plain UTF-8 text. Each event is a block of lines, separated from the next event by a blank line (`\n\n`). Each line within an event has a field name, a colon, a space, and a value:

```
event: time
id: 42
retry: 3000
data: {"iso":"2026-05-17T12:00:00Z","unix":1779264000000}

```

The four fields you can use:

- **`data:`** — The payload. This is the only required field. If the data is multi-line, each line gets its own `data:` prefix and the browser concatenates them with newlines.
- **`event:`** — The event type. If omitted, the browser fires a generic `message` event. If present, the browser fires a named event (e.g., `time`) and you listen with `source.addEventListener('time', handler)`.
- **`id:`** — A unique identifier for this event. The browser remembers the last ID it received. If the connection drops and reconnects, the browser sends a `Last-Event-ID` header so the server can resume from where the client left off.
- **`retry:`** — A number in milliseconds telling the browser how long to wait before reconnecting after a disconnect. The browser respects this automatically.

Lines starting with `:` are comments — the browser ignores them. You can use them as keep-alive pings to prevent proxies from closing idle connections:

```
: ping

```

### 1.3 Building the endpoint in SvelteKit

A SvelteKit `+server.ts` file exports HTTP method handlers. For SSE, you export a `GET` handler because the browser's `EventSource` API always makes a GET request. The handler creates a `ReadableStream`, wraps it in a `Response` with the correct headers, and returns it.

The critical headers:

- `Content-Type: text/event-stream` — tells the browser this is an SSE stream
- `Cache-Control: no-cache` — prevents caching of the stream
- `Connection: keep-alive` — keeps the TCP connection open (HTTP/1.1)
- `X-Accel-Buffering: no` — tells nginx/reverse proxies not to buffer the response

Inside the stream, you use a `TextEncoder` to convert your formatted event strings into `Uint8Array` chunks that the `ReadableStream` controller can enqueue.

### 1.4 Cleanup and the AbortSignal

When a client disconnects (closes the tab, navigates away, or loses network), the stream's `cancel()` method is called. This is your opportunity to clean up: stop timers, release database connections, unsubscribe from event buses. Without proper cleanup, disconnected clients leave orphaned intervals and event listeners consuming server memory indefinitely.

The pattern used in this course's `createSSEStream` helper (in `$lib/realtime/sse.ts`) passes an `AbortSignal` to the generator function. When the client disconnects, the signal is aborted, breaking the generator's loop naturally.

### 1.5 What is different from older approaches

Older Node.js SSE implementations used `res.write()` directly on the raw HTTP response object. In SvelteKit, you never touch the raw response — you return a standard `Response` object with a `ReadableStream` body. This works identically in development (Vite), in production (any adapter), and even on edge runtimes that support streaming. The web platform abstraction is the key advantage.

Some tutorials you may find online import `node:stream` or use Express-specific APIs. These do not apply to SvelteKit. Stick to `ReadableStream` and you will be portable across every deployment target.

## 2. Style it — A live clock display

The mini-build displays the server time streamed via SSE. The clock is styled as a large, centered display with a monospace font:

- The time digits use `--text-2xl` for prominence, with `font-variant-numeric: tabular-nums` so digits do not jump around as values change
- A subtle pulse animation on the colon separator indicates the stream is active (respecting `prefers-reduced-motion`)
- The connection status badge below the clock uses `--color-success` when connected and `--color-error` when disconnected
- Page personality: a cool blue — `oklch(65% 0.15 230)` — evoking precision and continuity

## 3. Interact — ReadableStream and the TextEncoder

The TypeScript concept in this lesson is **`ReadableStream<Uint8Array>`** — the web standard for representing a stream of bytes that can be consumed incrementally.

Here is the problem: you have strings (your formatted SSE events), but `ReadableStream` deals in `Uint8Array` (raw bytes). The bridge is `TextEncoder`:

```typescript
const encoder = new TextEncoder();
const bytes: Uint8Array = encoder.encode('data: hello\n\n');
```

The mistake students make is trying to enqueue a string directly into the stream controller:

```typescript
// WRONG — TypeError: chunk is not a Uint8Array
controller.enqueue('data: hello\n\n');
```

The fix is always to encode first:

```typescript
// CORRECT
controller.enqueue(encoder.encode('data: hello\n\n'));
```

This pattern — creating a `ReadableStream`, encoding strings to bytes, and enqueueing them — is fundamental to any streaming response in modern JavaScript, not just SSE. You will use it again when you build streaming AI responses, file downloads, and CSV exports.

## 4. Mini-build — A live server clock via SSE

**File:** `src/routes/modules/17-realtime/02-sse-server/+page.svelte`

The SSE endpoint is at `src/routes/modules/17-realtime/02-sse-server/api/time/+server.ts` (already provided). It streams the current server time every second with an incrementing `id` field and a `retry: 3000` instruction.

The page component connects to this endpoint using `EventSource`, displays the time, and shows a connection status indicator.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/17-realtime/02-sse-server`.

You will see a large clock that updates every second with the server time, plus a green "Connected" badge below it.

### Test with curl

Open a terminal and run:

```bash
curl -N http://localhost:5173/modules/17-realtime/02-sse-server/api/time
```

You will see raw SSE events scrolling:

```
id: 0
event: time
retry: 3000
data: {"iso":"2026-05-17T12:00:00.000Z","unix":1779264000000}

id: 1
event: time
data: {"iso":"2026-05-17T12:00:01.000Z","unix":1779264001000}
```

### DevTools moment

1. Open the **Network** tab in DevTools.
2. Reload the page. Find the request to `api/time`.
3. Click it and look at the **EventStream** tab (Chrome) or **Response** tab (Firefox). You will see the individual events listed with their `id`, `event`, and `data` fields parsed and displayed.
4. Notice the response headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`.
5. Close the tab and check the terminal where your dev server runs — the server should log no errors, confirming clean disconnection handling.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does the SSE endpoint use a GET handler and not POST?</summary>

The browser's `EventSource` API always makes a GET request to establish the SSE connection. It does not support other HTTP methods. This is by design: SSE is for reading a stream of events from the server, not for sending data to it. If you need to send data to the server, use a separate `fetch` POST request.
</details>

<details>
<summary><strong>Q2.</strong> What happens if you omit the `Content-Type: text/event-stream` header?</summary>

The browser will not treat the response as an event stream. The `EventSource` API will fire an `error` event and close the connection because it expects the `text/event-stream` content type. The raw text might still be readable via `fetch`, but you lose all the built-in EventSource features: automatic reconnection, event parsing, and the `Last-Event-ID` mechanism.
</details>

<details>
<summary><strong>Q3.</strong> Why is `X-Accel-Buffering: no` included in the response headers?</summary>

Nginx (and some other reverse proxies) buffer response bodies by default before forwarding them to the client. For a streaming response, this means events pile up in a buffer and are delivered in batches rather than immediately. The `X-Accel-Buffering: no` header tells nginx to disable buffering for this response, ensuring events flow through to the client the moment they are generated.
</details>

<details>
<summary><strong>Q4.</strong> If the client disconnects and reconnects, how does the server know which events the client has already seen?</summary>

The browser automatically includes a `Last-Event-ID` header in the reconnection request, containing the `id` value of the last event it successfully received. The server can read this header from the request and resume the stream from that point forward, avoiding duplicate delivery.
</details>

<details>
<summary><strong>Q5.</strong> Why do you need a `TextEncoder` when enqueuing data into a `ReadableStream`?</summary>

A `ReadableStream<Uint8Array>` (which is what HTTP response bodies use) deals in raw bytes, not strings. `TextEncoder.encode()` converts a JavaScript string into a `Uint8Array` of UTF-8 bytes. Without this conversion, the stream controller throws a TypeError because it cannot accept string chunks directly.
</details>

## 6. Common mistakes

- **Forgetting the double newline.** Each SSE event must end with `\n\n` (two newlines). A single newline separates fields within one event; the double newline signals the end of the event. If you forget, the browser waits forever for the event to "finish" and never fires the event handler.
- **Not handling client disconnection.** If your generator function has a `while (true)` loop without checking an abort signal, it will keep running after the client disconnects, leaking memory on the server. Always check `signal.aborted` in your loop condition or use a `try/catch` around `await delay(ms, signal)`.
- **Using `res.write()` instead of `ReadableStream`.** Tutorials from Express or raw Node.js use `response.write()`. In SvelteKit you never have access to the raw response object. You must return a `Response` with a `ReadableStream` body. This is actually better because it works on edge runtimes too.
- **Setting `Cache-Control` to anything other than `no-cache`.** If a CDN or browser caches the SSE response, the client receives stale data from cache instead of a live connection to the server. Always set `Cache-Control: no-cache` on event streams.

## 7. What's next

Lesson 17.3 shows you how to consume this SSE endpoint in a Svelte 5 component — connecting with `EventSource` inside `$effect`, updating `$state` from the stream, handling typed events, and cleaning up on component destroy.
