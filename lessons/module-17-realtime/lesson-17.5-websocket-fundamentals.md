---
module: 17
lesson: 17.5
title: WebSocket fundamentals
duration: 50 minutes
prerequisites:
  - Lesson 17.1 — transport trade-offs
  - Module 10 — API endpoints
  - Module 9B — remote functions and Valibot validation
learning_objectives:
  - Explain the WebSocket handshake (HTTP upgrade) and what happens at the protocol level
  - Design a typed message protocol using discriminated unions for both client and server messages
  - Validate incoming WebSocket messages at runtime using Valibot schemas
  - Implement a WebSocket message handler that narrows types based on the discriminant field
  - Describe the ws package API (on Node) and when/why you need it versus the browser WebSocket API
status: ready
---

# Lesson 17.5 — WebSocket fundamentals

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This lesson focuses on the protocol, the message design, and runtime safety. The mini-build simulates a WebSocket connection (no real server) so you can focus on the client-side message handling pattern.

## 1. Concept — Full-duplex communication and typed message protocols

### 1.1 What the problem is

SSE solved server-to-client streaming. But some applications need the client to send frequent, low-latency messages back to the server too — not just occasional form submissions. A chat application sends a message every time the user presses Enter. A collaborative editor sends a change every keystroke. A multiplayer game sends position updates 30 times per second. Making a separate HTTP POST for each of these is too slow (connection overhead) and too wasteful (full HTTP headers per message).

WebSocket solves this by establishing a persistent, full-duplex connection. After the initial HTTP handshake upgrades the protocol, both sides can send messages at any time with minimal overhead — as little as 2 bytes of framing per message.

### 1.2 The upgrade handshake

A WebSocket connection starts as a normal HTTP request with special headers:

```http
GET /ws HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

The server responds with HTTP 101 (Switching Protocols):

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

After this handshake, the HTTP connection is "upgraded" — it is no longer HTTP. Both sides now speak the WebSocket frame protocol. The connection stays open until one side sends a close frame or the TCP connection drops.

### 1.3 The ws package on Node

The browser has a built-in `WebSocket` class for the client side. But Node.js does not have a built-in WebSocket *server*. The standard choice is the `ws` package — a fast, spec-compliant WebSocket implementation for Node.

```typescript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
    socket.on('message', (raw: Buffer) => {
        const text = raw.toString('utf-8');
        const msg = JSON.parse(text);
        // handle msg
    });

    socket.send(JSON.stringify({ type: 'welcome', payload: {} }));
});
```

In a SvelteKit context, you do not run `ws` on a separate port — you attach it to SvelteKit's own HTTP server via adapter-node's custom server setup. Lesson 17.6 covers this integration. For now, focus on the message handling pattern.

### 1.4 Designing a typed message protocol

The single most important design decision for any WebSocket application is the **message protocol**. Without structure, you end up with `JSON.parse(msg)` returning `any` and a cascade of `if (msg.type === 'chat')` checks with no type safety.

The solution is a **discriminated union**. Every message has a `type` field that TypeScript can narrow on:

```typescript
type WSClientMessage =
    | { type: 'chat:send'; payload: { text: string } }
    | { type: 'cursor:move'; payload: { x: number; y: number } }
    | { type: 'presence:join'; payload: { username: string } };
```

When you switch on `msg.type`, TypeScript automatically narrows `msg.payload` to the correct shape:

```typescript
switch (msg.type) {
    case 'chat:send':
        // TypeScript knows msg.payload is { text: string }
        broadcast(msg.payload.text);
        break;
    case 'cursor:move':
        // TypeScript knows msg.payload is { x: number; y: number }
        updateCursor(msg.payload.x, msg.payload.y);
        break;
}
```

This is the same pattern used in Redux actions, tRPC procedures, and every well-designed real-time protocol. It gives you exhaustive type checking — if you add a new message type to the union, TypeScript will error in every switch statement that does not handle it.

### 1.5 Runtime validation with Valibot

TypeScript types disappear at runtime. A malicious or buggy client can send `{ type: 'chat:send', payload: 42 }` — which satisfies no type but passes `JSON.parse` just fine. You need **runtime validation** to ensure incoming messages actually match your types.

Valibot (which you learned in Module 9B) is ideal for this:

```typescript
import * as v from 'valibot';

const ChatSendSchema = v.object({
    type: v.literal('chat:send'),
    payload: v.object({
        text: v.pipe(v.string(), v.maxLength(1000))
    })
});

const WSClientMessageSchema = v.variant('type', [
    ChatSendSchema,
    CursorMoveSchema,
    PresenceJoinSchema
]);
```

`v.variant('type', [...])` is Valibot's discriminated union validator. It reads the `type` field first, then validates only the matching schema — efficient and precise.

On every incoming message:

```typescript
const result = v.safeParse(WSClientMessageSchema, JSON.parse(raw));
if (!result.success) {
    socket.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message' } }));
    return;
}
// result.output is correctly typed as WSClientMessage
```

### 1.6 Server messages follow the same pattern

The server sends a separate discriminated union back to clients:

```typescript
type WSServerMessage =
    | { type: 'chat:message'; payload: ChatMessagePayload }
    | { type: 'cursor:update'; payload: CursorUpdatePayload }
    | { type: 'presence:list'; payload: PresenceListPayload }
    | { type: 'error'; payload: ErrorPayload };
```

Both sides share the type definitions (in `$lib/realtime/types.ts`). The server validates incoming `WSClientMessage` and sends outgoing `WSServerMessage`. The client does the reverse. This symmetry makes the protocol self-documenting and prevents drift between client and server code.

## 2. Style it — A message inspector panel

The mini-build displays incoming simulated WebSocket messages in a scrollable inspector panel:

- Messages are displayed as color-coded cards by type (chat = blue, cursor = green, presence = purple, error = red)
- The panel has a dark background (`var(--color-surface-2)`) resembling a terminal/log viewer
- Timestamps are monospace, right-aligned
- Page personality: `oklch(60% 0.18 280)` — a purple suggesting network/protocol

## 3. Interact — Discriminated unions and exhaustive switch

The TypeScript concept is **exhaustive type narrowing** with a `switch` on the discriminant field.

The mistake:

```typescript
function handleMessage(msg: WSServerMessage): void {
    if (msg.type === 'chat:message') {
        // handle chat
    }
    // forgot to handle other types — no error!
}
```

The fix using an exhaustive switch:

```typescript
function handleMessage(msg: WSServerMessage): void {
    switch (msg.type) {
        case 'chat:message':
            addChatMessage(msg.payload);
            break;
        case 'cursor:update':
            updateCursor(msg.payload);
            break;
        case 'presence:list':
            setUsers(msg.payload.users);
            break;
        case 'error':
            showError(msg.payload.message);
            break;
        default: {
            const _exhaustive: never = msg;
            console.error('Unhandled message type', _exhaustive);
        }
    }
}
```

The `const _exhaustive: never = msg` line is the key. If you add a new type to `WSServerMessage` but forget to add a case, TypeScript will error because `msg` at that point is not `never` — it is the new unhandled type. This compile-time guarantee prevents silent bugs when protocols evolve.

## 4. Mini-build — Simulated WebSocket message inspector

**File:** `src/routes/modules/17-realtime/05-websocket-fundamentals/+page.svelte`

This mini-build simulates receiving WebSocket messages. A `setInterval` generates fake `WSServerMessage` objects every 1-3 seconds, and the component processes them through an exhaustive type handler, displaying each in a message log.

**Note:** No real WebSocket server is running. The simulation demonstrates the client-side message handling pattern — discriminated union narrowing, type-safe handlers, and error display. Lesson 17.6 shows how to connect to a real server.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/17-realtime/05-websocket-fundamentals`.

You will see a message inspector panel that fills with color-coded messages. Chat messages show text. Cursor updates show coordinates. Presence messages show user lists. Error messages show in red.

### DevTools moment

1. Open the **Console** tab. Each message is logged with its type, proving the exhaustive switch handler processes every variant.
2. Open the **Sources** tab and set a breakpoint inside the switch statement. When it hits, hover over `msg.payload` — TypeScript (and the runtime) have narrowed it to the correct shape for that case.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What makes WebSocket different from making rapid HTTP POST requests?</summary>

WebSocket maintains a single persistent TCP connection after the initial handshake. Messages flow in both directions without the overhead of HTTP headers, TCP handshake, or TLS negotiation for each message. A rapid series of POST requests would each carry full HTTP headers (cookies, content-type, etc.) and potentially require new TCP connections, adding latency and bandwidth cost. WebSocket frame overhead is as low as 2-6 bytes versus hundreds of bytes for HTTP headers.
</details>

<details>
<summary><strong>Q2.</strong> Why do you need runtime validation (like Valibot) even though you have TypeScript types?</summary>

TypeScript types exist only at compile time and are erased in the JavaScript output. At runtime, `JSON.parse` returns `unknown` (or `any`). A malicious client, a buggy implementation, or a version mismatch can send data that does not match your type definitions. Runtime validation with Valibot catches these mismatches before they propagate through your application and cause cryptic errors far from the source.
</details>

<details>
<summary><strong>Q3.</strong> What does the <code>const _exhaustive: never = msg</code> pattern accomplish?</summary>

It creates a compile-time guarantee that every variant of the discriminated union is handled in the switch statement. If all cases are covered, the type of `msg` in the default branch is `never` (impossible), and the assignment succeeds. If a new variant is added to the union but not handled, `msg` in the default branch has that new type, which is not assignable to `never`, causing a TypeScript error. This turns forgotten cases into compile errors rather than runtime bugs.
</details>

<details>
<summary><strong>Q4.</strong> In the WebSocket handshake, what HTTP status code indicates a successful protocol upgrade?</summary>

HTTP 101 Switching Protocols. The server responds with this status plus `Upgrade: websocket` and `Connection: Upgrade` headers to confirm that the protocol has been switched. Any other status code (200, 403, 500) means the upgrade failed and the connection remains HTTP.
</details>

<details>
<summary><strong>Q5.</strong> Why is <code>v.variant('type', [...])</code> more efficient than validating each schema sequentially?</summary>

`v.variant` reads the discriminant field (`type`) first and uses it to select the correct schema from the array. It validates only one schema — the matching one. Sequential validation (try schema A, if it fails try schema B, etc.) validates against every schema until one passes, which is O(n) in the number of variants and produces confusing error messages when all fail. The variant approach is O(1) lookup plus one schema validation.
</details>

## 6. Common mistakes

- **Using `any` for parsed messages.** `const msg: any = JSON.parse(raw)` throws away all type safety. The whole point of the discriminated union is that TypeScript narrows `payload` for you — but only if the initial type is the union, not `any`. Always parse into the union type (after validation).
- **Forgetting to handle the `error` message type.** Servers send error messages when something goes wrong (invalid input, rate limit, auth failure). If your client-side handler does not have a case for `'error'`, the user never sees feedback about what went wrong. Always include an error case that displays the message.
- **Sending unserialised objects.** `socket.send({ type: 'chat:send', payload: { text: 'hi' } })` will not work — `send()` expects a string (or Buffer/ArrayBuffer). You must `JSON.stringify` before sending. This is a runtime error that TypeScript cannot catch because `send()` accepts multiple overloads.
- **Not namespacing message types.** Using `type: 'send'` or `type: 'update'` creates collisions as the protocol grows. Use namespaced types like `'chat:send'`, `'cursor:move'`, `'presence:join'`. The colon convention is a de facto standard across real-time protocols.

## 7. What's next

Lesson 17.6 shows you how to actually run a WebSocket server alongside SvelteKit — the adapter-node configuration, the Vite dev plugin, and the production handler setup.
