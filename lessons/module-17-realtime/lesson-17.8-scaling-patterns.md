---
module: 17
lesson: 17.8
title: Scaling patterns
duration: 50 minutes
prerequisites:
  - Lesson 17.7 — live chat implementation
  - Lesson 17.3 — SSE consumption and reconnection
learning_objectives:
  - Implement exponential backoff reconnection for both WebSocket and SSE failures
  - Use heartbeat/ping-pong to detect dead connections before the TCP timeout
  - Share a single connection across browser tabs using BroadcastChannel
  - Identify when self-hosted real-time is appropriate versus using a managed service
  - Implement connection pooling to limit resource consumption on the server
status: ready
---

# Lesson 17.8 — Scaling patterns

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This final lesson in Module 17 addresses the production concerns that separate a demo from a deployed application: reconnection, heartbeats, multi-tab coordination, and the build-vs-buy decision.

## 1. Concept — Making real-time reliable at scale

### 1.1 What the problem is

A WebSocket or SSE connection that works on localhost breaks in production. Networks are unreliable. Servers restart. Load balancers timeout idle connections. Users open the same app in five tabs, creating five connections that fight each other. A mobile user walks through a tunnel, loses connectivity for 30 seconds, and your app shows stale data without indication.

Scaling real-time is not about handling millions of connections (that is a server problem). It is about making every individual connection resilient, efficient, and well-behaved. This lesson covers the client-side and architectural patterns that achieve that.

### 1.2 Exponential backoff reconnection

When a connection drops, you want to reconnect. But reconnecting immediately — especially if a thousand clients all reconnect at the same time because your server restarted — creates a "thundering herd" that can crash the server again.

Exponential backoff solves this: each successive retry doubles the wait time, with randomised jitter to spread clients out:

```typescript
function calculateBackoff(attempt: number, baseMs: number = 1000, maxMs: number = 30000): number {
    const exponential = Math.min(baseMs * 2 ** attempt, maxMs);
    const jitter = exponential * (0.5 + Math.random() * 0.5); // 50-100% of exponential
    return jitter;
}
```

The sequence looks like: ~1s, ~2s, ~4s, ~8s, ~16s, ~30s (capped). Each value is randomised within a window, so a thousand clients spread their retries across the interval instead of all hitting at the same millisecond.

For SSE, the browser's `EventSource` has built-in reconnection, but it uses a fixed interval (the `retry:` field). If you need exponential backoff, you must close the `EventSource` and create a new one manually with a `setTimeout`:

```typescript
let attempt = 0;

function connect(): void {
    const source = new EventSource('/api/stream');
    
    source.addEventListener('open', () => { attempt = 0; });
    source.addEventListener('error', () => {
        source.close();
        const delay = calculateBackoff(attempt++);
        setTimeout(connect, delay);
    });
}
```

### 1.3 Heartbeat and ping-pong

TCP connections can "die" silently — a network device in the middle drops the connection without sending a FIN packet. Neither side knows the connection is dead until they try to send data. This is called a "half-open" connection.

The solution is a periodic heartbeat. The client sends a small message (a "ping") every N seconds. If no "pong" comes back within a timeout, the client assumes the connection is dead and reconnects.

```typescript
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const HEARTBEAT_TIMEOUT = 5000;   // 5 seconds to respond

let heartbeatTimer: ReturnType<typeof setInterval>;
let timeoutTimer: ReturnType<typeof setTimeout>;

function startHeartbeat(socket: WebSocket): void {
    heartbeatTimer = setInterval(() => {
        if (socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ type: 'ping' }));
        
        timeoutTimer = setTimeout(() => {
            // No pong received — connection is dead
            socket.close();
        }, HEARTBEAT_TIMEOUT);
    }, HEARTBEAT_INTERVAL);
}

// In message handler:
case 'pong':
    clearTimeout(timeoutTimer);
    break;
```

The WebSocket protocol also has built-in ping/pong frames (opcode 0x9 and 0xA). The `ws` library on Node sends these automatically if configured. But application-level ping/pong gives you more control and works even when intermediate proxies strip protocol-level pings.

### 1.4 BroadcastChannel for multi-tab coordination

A user opens your app in three browser tabs. Each tab creates its own WebSocket connection. Your server now serves three connections for one user, tripling resource consumption. Worse, the three tabs might show inconsistent state if they handle messages at slightly different times.

`BroadcastChannel` is a browser API that lets tabs on the same origin communicate:

```typescript
const channel = new BroadcastChannel('realtime-sync');

// Tab 1 (the "leader" — holds the real connection)
socket.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    handleMessage(msg); // update own state
    channel.postMessage(msg); // forward to other tabs
});

// Tab 2, 3 (followers — no real connection)
channel.addEventListener('message', (event) => {
    handleMessage(event.data); // same handler, same state update
});
```

The pattern is **leader election**: one tab is the "leader" that holds the real connection. Other tabs receive updates via BroadcastChannel. If the leader tab closes, another tab promotes itself to leader and establishes the connection.

A simple leader election: each tab posts a "heartbeat" to the channel. If no heartbeat is received for 5 seconds, any listening tab can claim leadership.

### 1.5 Connection pooling

On the server, each WebSocket connection consumes memory (the socket buffer, the parsed message state, the user metadata). With thousands of connections, this adds up. Connection pooling strategies:

- **Limit connections per user.** If a user already has a connection, reject or close the old one when a new one arrives.
- **Idle timeout.** If no message is sent/received for 5 minutes, close the connection with a close frame. The client will reconnect when the user returns to the tab.
- **Room-based cleanup.** If a user is no longer in any active room/channel, close their connection proactively.

### 1.6 Build versus buy — managed services

At some scale or complexity, running your own WebSocket infrastructure becomes costly. Managed services handle the hard parts:

| Service | Strengths | Pricing model |
| --- | --- | --- |
| **Ably** | Global edge, protocol adapters, presence built-in | Per message + connection |
| **Pusher** | Simple API, good Svelte/JS SDK, channels/events model | Per message + connection |
| **Supabase Realtime** | PostgreSQL change notifications, good SvelteKit integration | Included in Supabase plan |
| **PartyKit / Cloudflare Durable Objects** | Edge computing, stateful workers, low latency | Per request + duration |

**When to self-host:** Your message volume is low (under 10,000 concurrent connections), you need full control over the protocol, your data is sensitive and cannot leave your infrastructure, or you are learning (this course).

**When to use managed:** You need global presence at edge locations, your volume exceeds what a single server handles, you do not want to build reconnection/scaling/monitoring infrastructure, or your team is small and wants to focus on features rather than infrastructure.

### 1.7 Graceful degradation

The most resilient real-time applications degrade gracefully:

1. Try WebSocket first (lowest latency, bidirectional)
2. If WebSocket fails (proxy blocks upgrade), fall back to SSE + fetch
3. If SSE fails (buffering proxy), fall back to long-polling
4. If everything fails, show a "reconnecting" banner and retry with backoff

This layered approach ensures the application works everywhere, even on restrictive networks, at the cost of slightly higher latency on degraded connections.

## 2. Style it — A connection health dashboard

The mini-build shows a connection health monitor:

- A reconnection state machine visualised with colored steps (connected → disconnected → backing off → reconnecting → connected)
- The backoff delay displayed as a countdown timer
- A multi-tab indicator showing which tab is the leader
- Page personality: `oklch(60% 0.15 170)` — a mature teal-green suggesting stability and production readiness

## 3. Interact — Exponential backoff with BroadcastChannel

The interactive concept is **combining exponential backoff with BroadcastChannel leader election**.

The mistake (no backoff, no coordination):

```typescript
// BUG: immediate reconnect storms + every tab reconnects independently
source.addEventListener('error', () => {
    connect(); // immediate retry — thundering herd!
});
```

The fix:

```typescript
const channel = new BroadcastChannel('realtime');
let isLeader: boolean = false;
let attempt: number = 0;

function connect(): void {
    if (!isLeader) return; // Only the leader connects
    
    const source = new EventSource('/api/stream');
    
    source.addEventListener('open', () => { attempt = 0; });
    source.addEventListener('message', (e) => {
        handleMessage(JSON.parse(e.data));
        channel.postMessage(JSON.parse(e.data)); // Forward to followers
    });
    source.addEventListener('error', () => {
        source.close();
        const delay = calculateBackoff(attempt++);
        setTimeout(connect, delay); // Exponential backoff
    });
}
```

This eliminates two problems at once: the thundering herd (backoff spreads retries) and the redundant connections (only the leader connects, others listen via BroadcastChannel).

## 4. Mini-build — Connection health monitor with backoff and multi-tab

**File:** `src/routes/modules/17-realtime/08-scaling-patterns/+page.svelte`

This mini-build demonstrates three patterns in one UI:

1. **Exponential backoff** — a simulated connection that drops periodically, showing the increasing delay between retries
2. **Heartbeat** — a ping/pong indicator showing when heartbeats are sent and acknowledged
3. **BroadcastChannel** — detects whether this tab is the leader and shows messages from other tabs

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/17-realtime/08-scaling-patterns`.

You will see a dashboard with three panels. The backoff panel simulates disconnection every 10 seconds, showing the retry countdown. The heartbeat panel sends a ping every 3 seconds (simulated). Open a second browser tab to the same URL — one tab will claim leadership, and the other will show "Follower" status receiving forwarded messages.

### DevTools moment

1. Open the **Console** tab. You will see log entries for backoff delays, heartbeat pings/pongs, and BroadcastChannel messages.
2. Open the **Application** tab and look under "Background Services" > "BroadcastChannel" (some browsers show this). You can see messages flowing between tabs.
3. Close the leader tab and watch the follower tab promote itself — it claims leadership and starts "connecting" (simulated).

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why add random jitter to exponential backoff instead of using exact powers of two?</summary>

Without jitter, all clients that disconnected at the same time (e.g., due to a server restart) would retry at exactly the same moments — 1s, 2s, 4s, 8s — because they all use the same formula. This "thundering herd" can crash the server again. Jitter randomises each client's retry time within a window, spreading the load so the server sees a gradual ramp of reconnections rather than a spike.
</details>

<details>
<summary><strong>Q2.</strong> What is a "half-open" TCP connection and why does heartbeat detect it?</summary>

A half-open connection occurs when one side believes the connection is alive but the other side has closed it (or a network device in between has dropped it) without sending a proper FIN/RST packet. Neither side receives an error. A heartbeat detects this by requiring a response within a timeout — if the ping gets no pong, the connection is dead regardless of what the TCP state machine believes. The client can then close and reconnect.
</details>

<details>
<summary><strong>Q3.</strong> How does BroadcastChannel leader election prevent redundant connections?</summary>

Only the leader tab opens a real WebSocket/SSE connection to the server. Other tabs (followers) receive data forwarded through the BroadcastChannel. This reduces server connections from N (one per tab) to 1 (one per user). If the leader tab closes, a follower promotes itself and opens the connection. The server sees one connection per user regardless of how many tabs are open.
</details>

<details>
<summary><strong>Q4.</strong> When would you choose Ably or Pusher over a self-hosted WebSocket server?</summary>

When you need global edge presence (servers in every region with low latency), when your concurrent connection count exceeds what a single server can handle (tens of thousands+), when you do not want to build and maintain reconnection/scaling/monitoring infrastructure, or when your team is small and the cost of managed service is less than the engineering time to build equivalent infrastructure. Also when you need features like channel permissions, message history, and analytics out of the box.
</details>

<details>
<summary><strong>Q5.</strong> What is "graceful degradation" in the context of real-time connections?</summary>

It means trying the best transport first (WebSocket) and falling back to progressively simpler alternatives if it fails: SSE + fetch if WebSocket upgrade is blocked, long-polling if SSE is buffered, and a "reconnecting" state with periodic polling as the last resort. The application still functions at every level — just with higher latency. The user always sees data, never a blank screen, regardless of network constraints.
</details>

## 6. Common mistakes

- **No maximum on backoff delay.** Without a cap (`maxMs`), the backoff delay grows forever — 1s, 2s, 4s ... 256s, 512s. A user waiting 8 minutes for a reconnect attempt will have closed the tab long ago. Cap at 30 seconds (or whatever your use case tolerates).
- **Heartbeat interval too short.** Sending a ping every second wastes bandwidth and battery on mobile. 30 seconds is a good default for most applications. Only reduce it for latency-critical applications (games, live trading).
- **Not electing a new leader when the leader tab closes.** If the leader tab closes without gracefully notifying followers, the followers wait forever for messages that will never come. Implement a periodic heartbeat from leader to followers via BroadcastChannel. If followers do not receive a heartbeat within N seconds, one of them promotes itself.
- **Ignoring the `retry:` field in SSE when using custom backoff.** If you implement custom backoff by closing and re-creating the EventSource, the browser's built-in retry (from the `retry:` field) never fires because you closed the source before it could retry. This is intentional — your custom logic replaces the built-in retry. But if you accidentally leave the EventSource open AND use your own reconnection logic, you get double-connections.

## 7. What's next

This completes Module 17. Your module project — the **Live Collaboration Board** — combines everything: SSE for notifications, WebSocket for cursor sharing, typed messages, Valibot validation, exponential backoff, presence indicators, and BroadcastChannel coordination. See `module-project.md` for the full specification.
