# Module 17 — Realtime: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Two browser windows side by side to show realtime updates across clients. Terminal visible for server logs.

---

## Lesson 17.1 — What realtime means

**Duration:** 10 minutes
**Screen setup:** Slides for concepts, two browser windows showing synchronized data

### Hook (30 seconds)
"A user sends a message. Another user sees it instantly — without refreshing. Stock prices update every second. Notifications appear the moment they are created. Realtime means the server pushes data to the client without the client asking. No polling. No refresh."

### Demo sequence
1. **[0:30-2:30] Push vs pull** — Traditional: client requests, server responds. Realtime: server pushes when data changes.
2. **[2:30-5:00] Technologies** — SSE (Server-Sent Events), WebSockets, long polling. When to use each.
3. **[5:00-7:00] SvelteKit integration** — How to implement push in SvelteKit: SSE via server routes, WebSockets via adapters.
4. **[7:00-8:30] Build the mini-build** — Two-window demo: type in one window, appear in the other.
5. **[8:30-9:30] Edge case / gotcha** — "SSE is HTTP — it works through proxies and load balancers. WebSockets use a different protocol — some infrastructure blocks them."

### Key moments
- 0:30 — "Push, not pull"
- 2:30 — "SSE vs WebSocket vs polling"
- 5:00 — "SvelteKit integration"
- 7:00 — "Cross-window demo"
- 8:30 — "Infrastructure compatibility"

### Callout graphics
- Push vs pull timeline
- Technology comparison table
- Protocol compatibility matrix

### Outro (30 seconds)
"Realtime pushes data to clients. Next lesson: building an SSE server."

---

## Lesson 17.2 — SSE server

**Duration:** 11 minutes
**Screen setup:** Editor with SSE endpoint, browser showing events

### Hook (30 seconds)
"Server-Sent Events use a plain HTTP response that never closes. The server writes data whenever it wants. The browser receives it as events. One HTTP connection, unlimited messages, built into every browser."

### Demo sequence
1. **[0:30-2:30] SSE endpoint** — Create `+server.ts` with a readable stream. Set `Content-Type: text/event-stream`.
2. **[2:30-5:00] Event format** — `data: {json}\n\n`. Named events, IDs, retry hints. Show the raw event stream.
3. **[5:00-7:30] Heartbeat** — Send periodic heartbeat events to keep the connection alive through proxies.
4. **[7:30-9:30] Build the mini-build** — Clock server that sends the current time every second.
5. **[9:30-10:30] Edge case / gotcha** — "SSE connections are one-directional: server to client only. The client cannot send data back over the same connection — use fetch for that."

### Key moments
- 0:30 — "HTTP stream that stays open"
- 2:30 — "Event format"
- 5:00 — "Heartbeat for keep-alive"
- 7:30 — "Clock server"
- 9:30 — "One-directional"

### Callout graphics
- SSE connection diagram
- Event format reference
- Heartbeat pattern

### Outro (30 seconds)
"SSE pushes data over plain HTTP. Next lesson: consuming SSE in Svelte."

---

## Lesson 17.3 — Consuming SSE

**Duration:** 10 minutes
**Screen setup:** Editor with EventSource client code, browser showing live updates

### Hook (30 seconds)
"EventSource is the browser API for consuming SSE. Create one, listen for events, update your Svelte state. The connection reconnects automatically if it drops. Zero library needed."

### Demo sequence
1. **[0:30-2:30] EventSource API** — `new EventSource('/api/events')`. Listen with `onmessage`.
2. **[2:30-5:00] Parsing events** — Parse JSON data. Update $state. Show the UI updating live.
3. **[5:00-7:00] Cleanup** — Close the EventSource in the cleanup function of $effect. Prevent memory leaks.
4. **[7:00-8:30] Build the mini-build** — Live notification feed that shows new notifications as they arrive.
5. **[8:30-9:30] Edge case / gotcha** — "EventSource automatically reconnects with exponential backoff. But it re-requests from the beginning. Use the `Last-Event-ID` header to resume from where it left off."

### Key moments
- 0:30 — "Browser-native API"
- 2:30 — "Parsing and updating state"
- 5:00 — "Cleanup and memory"
- 7:00 — "Notification feed"
- 8:30 — "Reconnection and resume"

### Callout graphics
- EventSource lifecycle
- Data flow: SSE → parse → $state → UI
- Reconnection behavior

### Outro (30 seconds)
"EventSource consumes SSE with automatic reconnection. Next lesson: building a notification feed."

---

## Lesson 17.4 — Notification feed

**Duration:** 11 minutes
**Screen setup:** Editor with notification system, browser showing live notifications

### Hook (30 seconds)
"A notification feed combines everything: SSE for delivery, $state for the list, $derived for the unread count, and transitions for appearance animations. This lesson builds a complete notification system."

### Demo sequence
1. **[0:30-2:30] Data model** — Notification interface: id, type, message, timestamp, read.
2. **[2:30-5:00] SSE integration** — Connect to the notification stream. Parse and prepend to the list.
3. **[5:00-7:30] UI** — Notification bell with unread count badge. Dropdown list with mark-as-read.
4. **[7:30-9:30] Build the mini-build** — Complete notification feed with live updates, unread count, and dismiss.
5. **[9:30-10:30] Edge case / gotcha** — "Notification lists can grow unbounded. Limit the client-side list to the most recent 50-100 items. Load older ones on demand."

### Key moments
- 0:30 — "Complete notification system"
- 2:30 — "SSE connection"
- 5:00 — "Bell and dropdown UI"
- 7:30 — "Full notification feed"
- 9:30 — "List size limits"

### Callout graphics
- Notification system architecture
- UI component breakdown
- List management strategy

### Outro (30 seconds)
"You have a complete notification system. Next lesson: WebSocket fundamentals."

---

## Lesson 17.5 — WebSocket fundamentals

**Duration:** 11 minutes
**Screen setup:** Slides for WebSocket protocol, editor with basic implementation

### Hook (30 seconds)
"SSE is one-directional: server to client. WebSockets are bidirectional: both sides send and receive. Chat, gaming, collaborative editing — any use case where both parties need to talk requires WebSockets."

### Demo sequence
1. **[0:30-2:30] WebSocket protocol** — Upgrade handshake from HTTP. Full-duplex communication. Show the protocol switch.
2. **[2:30-5:00] Browser API** — `new WebSocket('ws://...')`. onopen, onmessage, onclose, send(). Show the lifecycle.
3. **[5:00-7:30] Message patterns** — JSON messages with type fields. Request/response vs broadcast.
4. **[7:30-9:30] Build the mini-build** — Echo server: client sends message, server echoes it back.
5. **[9:30-10:30] Edge case / gotcha** — "WebSockets do not reconnect automatically. You must implement reconnection logic yourself — with exponential backoff."

### Key moments
- 0:30 — "Bidirectional communication"
- 2:30 — "Browser WebSocket API"
- 5:00 — "Message patterns"
- 7:30 — "Echo server"
- 9:30 — "No auto-reconnect"

### Callout graphics
- WebSocket handshake
- Lifecycle events
- Message type pattern

### Outro (30 seconds)
"WebSockets enable bidirectional communication. Next lesson: WebSockets in SvelteKit."

---

## Lesson 17.6 — WebSocket in SvelteKit

**Duration:** 11 minutes
**Screen setup:** Editor with SvelteKit WebSocket setup, browser with connection

### Hook (30 seconds)
"SvelteKit does not have built-in WebSocket support — but your deployment platform does. Vite's dev server supports WebSockets for development. Production adapters (Node, Bun) expose the HTTP server for WebSocket upgrades."

### Demo sequence
1. **[0:30-2:30] Development setup** — Use Vite's WebSocket support in development.
2. **[2:30-5:00] Production setup** — Attach WebSocket handler to the HTTP server via the adapter.
3. **[5:00-7:30] Client integration** — Create a Svelte hook that manages the WebSocket connection, reconnection, and message handling.
4. **[7:30-9:30] Build the mini-build** — WebSocket connection with status indicator and message display.
5. **[9:30-10:30] Edge case / gotcha** — "WebSocket connections are stateful. If you deploy behind a load balancer, you need sticky sessions or a pub/sub layer to route messages to the right server."

### Key moments
- 0:30 — "SvelteKit + WebSockets"
- 2:30 — "Production adapter setup"
- 5:00 — "Client connection hook"
- 7:30 — "Connection status"
- 9:30 — "Load balancer challenges"

### Callout graphics
- Dev vs production WebSocket setup
- Connection hook architecture
- Load balancer topology

### Outro (30 seconds)
"WebSockets work in SvelteKit with adapter support. Next lesson: building live chat."

---

## Lesson 17.7 — Live chat

**Duration:** 12 minutes
**Screen setup:** Two browser windows with chat interface, editor with code

### Hook (30 seconds)
"Two users. Two browsers. Real-time chat. Messages appear instantly in both windows. This is the canonical real-time application — and it combines everything: WebSockets for transport, $state for messages, keyed each for rendering, and scroll management for UX."

### Demo sequence
1. **[0:30-3:00] Chat data model** — Message interface: id, sender, text, timestamp. Message list with $state.
2. **[3:00-5:30] WebSocket messaging** — Send messages via WebSocket. Receive and append to the list.
3. **[5:30-8:00] UI** — Message bubbles, auto-scroll to bottom, input with send button.
4. **[8:00-10:00] Build the mini-build** — Complete chat room with two-window demo.
5. **[10:00-11:30] Edge case / gotcha** — "Auto-scroll to the bottom on new messages — but only if the user is already at the bottom. If they are scrolling up to read history, do not steal their scroll position."

### Key moments
- 0:30 — "Real-time chat"
- 3:00 — "WebSocket messaging"
- 5:30 — "Chat UI patterns"
- 8:00 — "Two-window demo"
- 10:00 — "Smart auto-scroll"

### Callout graphics
- Chat architecture
- Message flow diagram
- Scroll management logic

### Outro (30 seconds)
"You built live chat. Last lesson: scaling real-time patterns."

---

## Lesson 17.8 — Scaling patterns

**Duration:** 11 minutes
**Screen setup:** Slides for architecture diagrams, editor for code patterns

### Hook (30 seconds)
"One server handles 1,000 WebSocket connections. You scale to three servers. Now a message sent to Server A needs to reach a client on Server B. Scaling real-time requires pub/sub, connection management, and graceful degradation."

### Demo sequence
1. **[0:30-2:30] The scaling problem** — Multiple servers, partitioned connections. Messages do not cross server boundaries.
2. **[2:30-5:00] Pub/Sub** — Redis Pub/Sub, NATS, or database-backed pub/sub. Messages broadcast across servers.
3. **[5:00-7:30] Connection management** — Track connections per user. Handle reconnection and state sync.
4. **[7:30-9:30] Build the mini-build** — Architecture diagram with pub/sub layer between servers.
5. **[9:30-10:30] Edge case / gotcha** — "Start with SSE. It scales easier (stateless HTTP) and handles 80% of real-time use cases. Only upgrade to WebSockets when you need bidirectional communication."

### Key moments
- 0:30 — "Multi-server challenge"
- 2:30 — "Pub/Sub for broadcast"
- 5:00 — "Connection tracking"
- 7:30 — "Scaling architecture"
- 9:30 — "SSE first, WebSocket when needed"

### Callout graphics
- Multi-server topology
- Pub/Sub message flow
- SSE vs WebSocket decision

### Outro (30 seconds)
"Scaling real-time requires pub/sub and careful architecture. Module 17 is complete — you can build real-time features from SSE to WebSocket chat to scaled deployments."

---
