---
module: 17
lesson: 17.6
title: WebSocket in SvelteKit
duration: 50 minutes
prerequisites:
  - Lesson 17.5 — WebSocket fundamentals
  - Module 8 — SvelteKit routing and adapters
learning_objectives:
  - Explain why WebSocket requires adapter-node and cannot run on serverless/edge platforms
  - Configure a Vite plugin that attaches a WebSocket server to the dev server for local development
  - Set up a production WebSocket handler using adapter-node's custom server entry point
  - Implement the connection lifecycle (open, message, close, error) with proper resource cleanup
  - Design a room/channel abstraction for broadcasting messages to subsets of connected clients
status: ready
---

# Lesson 17.6 — WebSocket in SvelteKit

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This lesson explains the architecture for running WebSocket alongside SvelteKit. The mini-build simulates the client connection to demonstrate the UI patterns — a real server requires `adapter-node` and the `ws` package, which are documented here but not installed in this project.

## 1. Concept — Running WebSocket alongside SvelteKit

### 1.1 What the problem is

SvelteKit's `+server.ts` files handle HTTP request-response cycles beautifully. But WebSocket is not HTTP after the initial handshake — it is a different protocol entirely. SvelteKit has no built-in way to handle WebSocket connections because its routing system is designed around HTTP request/response pairs that return a `Response` object.

This means you need to attach a WebSocket server at a layer below SvelteKit — on the raw HTTP server that SvelteKit's adapter exposes. This is only possible with **adapter-node** (which gives you access to the underlying Node.js HTTP server) or a custom adapter. Serverless platforms (Vercel Functions, Cloudflare Workers, Netlify Functions) and edge platforms do not support persistent WebSocket connections because they spin up and down per request.

### 1.2 Architecture overview

The architecture has three layers:

1. **The HTTP server** — created by Node.js (`http.createServer`). This handles normal HTTP requests (routed to SvelteKit) and WebSocket upgrade requests (routed to `ws`).
2. **SvelteKit's handler** — the `handler` exported by adapter-node's build output. It processes all normal HTTP requests.
3. **The WebSocket server** — a `ws` `WebSocketServer` instance that listens for `upgrade` events on the HTTP server.

```
                    ┌─── HTTP Request ───→ SvelteKit handler
Client ─── TCP ───→│
                    └─── Upgrade Request ─→ ws WebSocketServer
```

### 1.3 Development: Vite plugin approach

During development, Vite runs its own HTTP server. You need to hook into it to attach your WebSocket server. This is done via a Vite plugin:

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { WebSocketServer } from 'ws';
import { handleWSConnection } from './src/lib/server/ws-handler';

function webSocketPlugin() {
    return {
        name: 'websocket',
        configureServer(server) {
            if (!server.httpServer) return;
            
            const wss = new WebSocketServer({ noServer: true });
            
            server.httpServer.on('upgrade', (req, socket, head) => {
                if (req.url === '/ws') {
                    wss.handleUpgrade(req, socket, head, (ws) => {
                        handleWSConnection(ws);
                    });
                }
            });
        }
    };
}

export default defineConfig({
    plugins: [sveltekit(), webSocketPlugin()]
});
```

The `noServer: true` option tells `ws` not to create its own HTTP server — instead, you manually handle the `upgrade` event and delegate to `wss.handleUpgrade()`. The URL check (`req.url === '/ws'`) ensures only WebSocket requests to your designated path are handled.

### 1.4 Production: custom server entry

For production with adapter-node, you create a custom server file:

```typescript
// server.ts (production entry point)
import { handler } from './build/handler.js';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { handleWSConnection } from './src/lib/server/ws-handler.js';

const server = createServer(handler);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
    if (req.url === '/ws') {
        wss.handleUpgrade(req, socket, head, (ws) => {
            handleWSConnection(ws);
        });
    }
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

In adapter-node's `svelte.config.js`, you set `entryPoint: './server.ts'` to use this file instead of the default server.

### 1.5 The connection handler

The handler function manages each client's lifecycle:

```typescript
import type { WebSocket } from 'ws';
import type { WSClientMessage, WSServerMessage } from '$lib/realtime/types';

const connections = new Set<WebSocket>();

export function handleWSConnection(socket: WebSocket): void {
    connections.add(socket);
    
    // Send welcome
    send(socket, { type: 'presence:list', payload: { users: getUsers() } });
    
    socket.on('message', (raw: Buffer) => {
        const text = raw.toString('utf-8');
        const result = validateMessage(text);
        if (!result.success) {
            send(socket, { type: 'error', payload: { code: 'INVALID', message: result.error } });
            return;
        }
        routeMessage(socket, result.data);
    });
    
    socket.on('close', () => {
        connections.delete(socket);
        broadcast({ type: 'presence:left', payload: { userId: '...', username: '...' } });
    });
    
    socket.on('error', () => {
        connections.delete(socket);
    });
}

function send(socket: WebSocket, msg: WSServerMessage): void {
    if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(msg));
    }
}

function broadcast(msg: WSServerMessage, exclude?: WebSocket): void {
    const data = JSON.stringify(msg);
    for (const client of connections) {
        if (client !== exclude && client.readyState === client.OPEN) {
            client.send(data);
        }
    }
}
```

Key patterns: (1) Track connections in a `Set` for efficient add/remove/iterate. (2) Always check `readyState === OPEN` before sending — a socket can close between your decision to send and the actual send. (3) Broadcast excludes the sender to avoid echo.

### 1.6 Why not serverless?

Students often ask: "Can I use WebSocket on Vercel?" The answer is: not with standard WebSocket. Serverless functions are stateless and short-lived — they spin up per request and shut down after responding. A WebSocket connection needs to persist for minutes or hours. There is no function to keep alive.

Some platforms offer proprietary solutions: Cloudflare Durable Objects can hold WebSocket connections. Vercel offers an "Edge Runtime" with limited WebSocket support. But these are platform-specific and not portable. For this course, we use adapter-node, which is simple, standard, and deployable on any VPS, container, or PaaS that runs Node.js.

## 2. Style it — Connection status with server details

The mini-build shows a simulated WebSocket connection panel:

- A connection card shows the WebSocket URL, readyState, and message count
- A "send message" form with a text input and send button (44px touch targets)
- Messages appear in a two-column layout: sent (right-aligned, brand color) and received (left-aligned, surface-2)
- Page personality: `oklch(60% 0.18 280)` — the protocol purple from Lesson 17.5

## 3. Interact — The WebSocket readyState lifecycle

The concept is the **WebSocket lifecycle state machine**. A WebSocket has four states:

- `CONNECTING` (0) — connection attempt in progress
- `OPEN` (1) — connected, ready to send/receive
- `CLOSING` (2) — close frame sent, waiting for acknowledgement
- `CLOSED` (3) — connection is terminated

The mistake is sending messages before the connection is open:

```typescript
// BUG: socket might still be CONNECTING
const socket = new WebSocket('ws://localhost:3000/ws');
socket.send(JSON.stringify({ type: 'chat:send', payload: { text: 'hi' } }));
// Error: WebSocket is not open
```

The fix: wait for the `open` event before sending, or queue messages and flush on open:

```typescript
const socket = new WebSocket('ws://localhost:3000/ws');
const queue: string[] = [];

socket.addEventListener('open', () => {
    for (const msg of queue) {
        socket.send(msg);
    }
    queue.length = 0;
});

function send(msg: WSClientMessage): void {
    const data = JSON.stringify(msg);
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
    } else {
        queue.push(data);
    }
}
```

## 4. Mini-build — Simulated WebSocket connection panel

**File:** `src/routes/modules/17-realtime/06-websocket-sveltekit/+page.svelte`

This mini-build simulates a WebSocket connection lifecycle. Instead of connecting to a real server, it uses `setTimeout` to simulate the handshake delay, then `setInterval` to simulate incoming messages. Outgoing messages from the input field are "echoed" back after a short delay, simulating a server response.

**Note:** A real WebSocket server requires `adapter-node` and the `ws` package. This simulation demonstrates the UI patterns and state management you would use with a real connection. The lesson text above documents the full server setup.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/17-realtime/06-websocket-sveltekit`.

You will see a connection panel with a "Connect" button. Click it to simulate the handshake (brief CONNECTING state, then OPEN). Type a message and press Send — it appears on the right, and a simulated response appears on the left after 500ms.

### DevTools moment

1. Open the **Console** tab. The simulation logs state transitions: CONNECTING → OPEN, and message send/receive events.
2. In a real implementation, you would see the WebSocket connection in the **Network** tab under the "WS" filter. The Messages sub-tab shows individual frames with their payload — both sent (green arrow) and received (red arrow).

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why can't WebSocket run on serverless platforms like Vercel Functions?</summary>

Serverless functions are stateless and ephemeral — they spin up to handle a single request and shut down afterward. WebSocket connections are persistent and stateful — they stay open for the duration of the user's session (minutes to hours). There is no serverless function to keep alive for that duration. The connection would be terminated the moment the function's execution timeout is reached.
</details>

<details>
<summary><strong>Q2.</strong> What is the purpose of <code>noServer: true</code> when creating a <code>WebSocketServer</code>?</summary>

It tells the `ws` library not to create its own HTTP server or listen on its own port. Instead, you manually handle the HTTP `upgrade` event on an existing server and call `wss.handleUpgrade()` to complete the handshake. This is necessary when you want to share a single port with SvelteKit's HTTP handler — WebSocket upgrades go to `ws`, normal requests go to SvelteKit.
</details>

<details>
<summary><strong>Q3.</strong> What happens if you call <code>socket.send()</code> when <code>readyState</code> is CONNECTING?</summary>

The browser throws an `InvalidStateError` DOMException with the message "WebSocket is not open: readyState 0 (CONNECTING)." You must wait for the `open` event before sending, or implement a message queue that flushes when the connection opens.
</details>

<details>
<summary><strong>Q4.</strong> Why does the broadcast function exclude the sender?</summary>

If the sender receives their own message back, it appears as a duplicate in their UI. For example, in a chat, the user already sees their own message optimistically the moment they press Send. If the server broadcasts it back to them, they see it twice. Excluding the sender from broadcast prevents this echo. Some protocols intentionally include the sender (to confirm delivery) — but that requires the client to deduplicate.
</details>

<details>
<summary><strong>Q5.</strong> In the Vite plugin approach, why do you check <code>req.url === '/ws'</code> before handling the upgrade?</summary>

Vite's dev server uses the `upgrade` event internally for Hot Module Replacement (HMR). If you handle every upgrade request, you break Vite's HMR connection. The URL check ensures you only intercept upgrade requests intended for your WebSocket endpoint, letting Vite handle its own `/` or `/__vite_hmr` upgrades normally.
</details>

## 6. Common mistakes

- **Forgetting to check the URL on upgrade.** Handling all upgrade events breaks Vite's HMR in development. Always filter by URL path before calling `handleUpgrade`.
- **Not cleaning up on `close` and `error`.** If you add a socket to a `Set` on connection but never remove it on close/error, you accumulate dead references. Eventually, `broadcast` iterates over thousands of closed sockets, checking `readyState` on each. Always remove from the set in both `close` and `error` handlers.
- **Deploying to a serverless platform.** Students build WebSocket features locally with adapter-node, then deploy to Vercel with adapter-auto. The WebSocket code silently fails — no error, just no connection. Always verify your deployment target supports persistent connections before choosing WebSocket.
- **Sharing state across Vite restarts in dev.** The Vite plugin's `configureServer` runs on each dev server start. If your WebSocket state is in module-level variables, it resets on each file change that triggers a server restart. For production this is fine (the server rarely restarts). For dev, accept that connections reset or use an external store (Redis).

## 7. What's next

Lesson 17.7 puts it all together — a live chat with typed messages, optimistic send, auto-scroll, user presence, and the full client/server lifecycle.
