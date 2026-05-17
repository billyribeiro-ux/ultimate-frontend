---
module: 17
lesson: 17.3
title: Consuming SSE in Svelte 5
duration: 45 minutes
prerequisites:
  - Lesson 17.2 — building an SSE endpoint
  - Module 2 — $state and $effect runes
learning_objectives:
  - Connect to an SSE endpoint using EventSource inside a Svelte 5 $effect
  - Update $state reactively from incoming SSE events with correct typing
  - Handle named events with addEventListener and type the MessageEvent payload
  - Implement cleanup logic in the $effect return function to close the connection on destroy
  - Detect and display reconnection state using EventSource readyState
status: ready
---

# Lesson 17.3 — Consuming SSE in Svelte 5

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. You built the SSE endpoint in Lesson 17.2. Now you learn the client-side pattern: how to consume that stream inside a Svelte 5 component using runes, with proper typing, error handling, and cleanup.

## 1. Concept — The EventSource API meets Svelte 5 reactivity

### 1.1 What the problem is

You have an SSE endpoint streaming data. Now you need a component that connects to it, parses each event, updates reactive state so the UI reflects the latest data, and cleans up the connection when the component is destroyed (user navigates away) or when a dependency changes (URL parameter updates). This sounds simple, but getting all the pieces right — typing, reconnection, cleanup, error display — requires understanding how `$effect` lifecycle interacts with the browser's `EventSource` API.

### 1.2 The EventSource API

The browser provides `EventSource` as a built-in constructor for SSE consumption. You pass it a URL and it handles everything: opening the connection, parsing the wire format, dispatching events, and — critically — reconnecting automatically if the connection drops.

```typescript
const source = new EventSource('/api/my-stream');
```

The object has three event listeners you care about:

- **`open`** — fires when the connection is established. Use it to set a "connected" state.
- **`error`** — fires when the connection fails or drops. The browser will automatically attempt to reconnect (after the `retry` interval the server specified). Use this to set a "reconnecting" or "disconnected" state.
- **`message`** — fires for events that have no `event:` field, or you can listen for named events with `addEventListener('eventName', handler)`.

The `readyState` property tells you the current connection status:
- `EventSource.CONNECTING` (0) — trying to connect
- `EventSource.OPEN` (1) — connected and receiving events
- `EventSource.CLOSED` (2) — permanently closed (you called `.close()`)

### 1.3 Integrating with $effect

In Svelte 5, side effects that need cleanup belong inside `$effect`. The pattern:

```typescript
$effect(() => {
    const source = new EventSource(url);
    
    source.addEventListener('myEvent', (event: MessageEvent<string>) => {
        const parsed: MyType = JSON.parse(event.data);
        myState = parsed; // updates $state
    });

    return () => {
        source.close(); // cleanup on destroy or re-run
    };
});
```

The return function is called when the component is destroyed or when the effect re-runs (because a dependency changed). This is where you close the connection. Without this, navigating away leaves an open connection that the browser eventually cleans up — but not before wasting resources and potentially causing errors.

### 1.4 Typing the event handler

`MessageEvent` is a generic type in TypeScript, but the `data` property is always a `string` when it comes from `EventSource` (the browser does not parse JSON for you). The pattern is:

```typescript
source.addEventListener('counter', (event: MessageEvent<string>) => {
    const data: CounterData = JSON.parse(event.data);
    // TypeScript now knows data.count is a number
});
```

Note: `MessageEvent<string>` is correct even though you might expect `MessageEvent<CounterData>`. The browser always delivers `event.data` as a raw string. You parse it yourself. This is where runtime validation (Valibot, covered in Lesson 17.5) becomes valuable — but for now, the type assertion after `JSON.parse` is acceptable because you control both the server and client.

### 1.5 Handling reconnection state

When the connection drops, `EventSource` fires an `error` event and enters the `CONNECTING` state. It will retry after the `retry` interval. You want your UI to reflect this:

```typescript
let status: 'connecting' | 'connected' | 'disconnected' = $state('connecting');

$effect(() => {
    const source = new EventSource(url);
    
    source.addEventListener('open', () => { status = 'connected'; });
    source.addEventListener('error', () => {
        status = source.readyState === EventSource.CLOSED ? 'disconnected' : 'connecting';
    });

    return () => { source.close(); status = 'disconnected'; };
});
```

The distinction between "connecting" (will retry) and "disconnected" (permanently closed) matters for UX. A "reconnecting..." indicator tells the user to wait; a "disconnected" indicator tells them to refresh.

### 1.6 What changed from Svelte 4

In Svelte 4, you would use `onMount` with a return function for cleanup, or `onDestroy`. In Svelte 5, `$effect` replaces both patterns because its return function handles cleanup and it automatically re-runs when dependencies change. If your SSE URL is derived from a route parameter, the effect re-runs when the parameter changes, closing the old connection and opening a new one — something that required manual wiring in Svelte 4.

## 2. Style it — A live counter with connection status

The mini-build shows a counter that increments every 2 seconds via SSE:

- The counter value uses `--text-2xl` with `font-variant-numeric: tabular-nums`
- A colored status badge shows the connection state: green for connected, amber for connecting, red for disconnected
- The "started at" timestamp below the counter provides context for how long the stream has been running
- Page personality: the same cool blue as 17.2 — `oklch(65% 0.15 230)` — maintaining visual continuity

## 3. Interact — $effect cleanup and the EventSource lifecycle

The interactive concept is **effect cleanup**. Here is the problem:

```typescript
// BUG: no cleanup — connection leaks when navigating away
$effect(() => {
    const source = new EventSource('/api/counter');
    source.addEventListener('counter', (e: MessageEvent<string>) => {
        count = JSON.parse(e.data).count;
    });
});
```

If the user navigates to another page, this component is destroyed. The `EventSource` is still open. The server keeps streaming. The event listener keeps firing (into nothing, since the component is gone). Over time, if the user navigates back and forth, you accumulate orphaned connections.

The fix:

```typescript
$effect(() => {
    const source = new EventSource('/api/counter');
    source.addEventListener('counter', (e: MessageEvent<string>) => {
        count = JSON.parse(e.data).count;
    });
    return () => source.close(); // cleanup!
});
```

Now when the component is destroyed *or* when the effect re-runs, the old connection is closed before a new one opens. This is the same pattern you use for `setInterval`, `addEventListener` on `window`, `IntersectionObserver`, and any other resource that needs explicit teardown.

## 4. Mini-build — Live counter consuming SSE with $state

**File:** `src/routes/modules/17-realtime/03-consuming-sse/+page.svelte`

The SSE endpoint at `src/routes/modules/17-realtime/03-consuming-sse/api/counter/+server.ts` streams an incrementing counter every 2 seconds. The page component connects, displays the counter, and shows connection status.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/17-realtime/03-consuming-sse`.

You will see a counter that starts at 0 and increments by 1 every 2 seconds. A status badge shows "Connected" in green. Navigate away and back — the counter resets because a new connection is established, proving cleanup works.

### DevTools moment

1. Open the **Console** tab. You should see no errors — particularly no "EventSource failed" messages.
2. Navigate to another page, then back. Open the **Network** tab and verify there is only ONE active `api/counter` request, not multiple accumulated connections.
3. In the **Network** tab, click the SSE request and look at the **EventStream** panel. You will see each event listed with its parsed `data` field, confirming the browser is correctly parsing the SSE format.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why must you call <code>source.close()</code> in the $effect return function?</summary>

Without calling `close()`, the EventSource connection remains open even after the component is destroyed. The server continues streaming events that nobody is listening to, wasting server resources and network bandwidth. Over repeated mounts/unmounts, you accumulate orphaned connections. The `$effect` return function is the cleanup hook — it runs when the component is destroyed or when the effect re-runs.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between listening for <code>'message'</code> and listening for a named event like <code>'counter'</code>?</summary>

The `'message'` event fires for SSE events that have no `event:` field in the wire format. If the server sends `event: counter` in the SSE data, the browser dispatches it as a named event that you listen for with `source.addEventListener('counter', handler)`. The generic `onmessage` handler will NOT receive named events — you must use `addEventListener` with the exact event name.
</details>

<details>
<summary><strong>Q3.</strong> If the SSE URL depends on a route parameter like <code>/api/stream/${id}</code>, what happens when the parameter changes?</summary>

Because the URL is read inside the `$effect`, it becomes a dependency of that effect. When the parameter (and therefore the URL) changes, Svelte 5 re-runs the effect. The return function fires first, closing the old connection, then the effect body runs again with the new URL, opening a fresh connection. This is automatic — no manual diffing needed.
</details>

<details>
<summary><strong>Q4.</strong> Why is <code>event.data</code> always a string even when the server sends JSON?</summary>

The SSE specification and the browser's EventSource implementation treat the `data:` field as raw text. The browser concatenates all `data:` lines for an event into a single string and sets `event.data` to that string. It does not attempt JSON parsing. You must call `JSON.parse(event.data)` yourself to get a typed object.
</details>

<details>
<summary><strong>Q5.</strong> What does <code>EventSource.readyState === 0</code> indicate, and how is it different from readyState 2?</summary>

ReadyState 0 (CONNECTING) means the EventSource is attempting to establish or re-establish a connection — it will retry automatically. ReadyState 2 (CLOSED) means the connection is permanently closed, typically because you called `.close()`. The UI should display "Reconnecting..." for state 0 and "Disconnected" for state 2, because state 0 implies recovery is happening automatically while state 2 implies user action is needed.
</details>

## 6. Common mistakes

- **Forgetting to return the cleanup function from $effect.** The most common bug. The component mounts, connects, works perfectly — but when the user navigates away and comes back, a second connection opens alongside the first. Repeat this 10 times and you have 10 open connections. Always return `() => source.close()`.
- **Using `onmessage` when the server sends named events.** If your server sends `event: counter`, the `source.onmessage` handler will never fire. You must use `source.addEventListener('counter', handler)`. This is a frequent source of "my events are not arriving" bugs.
- **Parsing `event.data` without error handling.** If the server ever sends malformed JSON (a bug, a partial write), `JSON.parse` throws and your entire event handler crashes. Wrap the parse in try/catch and log the error gracefully.
- **Assuming the connection never drops.** Mobile networks, laptop sleep, server restarts — the connection WILL drop. Always display connection status to the user and ensure your UI handles the "reconnecting" state gracefully rather than showing stale data without indication.

## 7. What's next

Lesson 17.4 builds a live notification feed — multiple notification types streaming via SSE, displayed as animated dismissable toasts with Svelte transitions and PE7 styling.
