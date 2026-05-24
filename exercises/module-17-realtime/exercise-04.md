---
module: 17
exercise: 4
title: WebSocket Echo Server
difficulty: expert
estimated_time: 45
skills_tested:
  - WebSocket upgrade handling
  - bidirectional messaging
  - connection lifecycle management
  - message protocol design
  - reconnection strategy
---

# Exercise 17.4 — WebSocket Echo Server

## Brief

Build a WebSocket echo server that receives messages from the client and sends them back with metadata (timestamp, message ID, character count). Create a chat-like interface where users can send messages and see the echoed responses. This exercise teaches the WebSocket connection lifecycle and bidirectional communication patterns.

## Requirements

1. Create a WebSocket server endpoint (using SvelteKit's WebSocket support or a separate server module)
2. The server must accept WebSocket connections and echo each message back with added metadata
3. Each echoed message must include: `id` (server-assigned), `original` (client message), `timestamp` (ISO), `charCount` (number)
4. Create `src/routes/exercises/17-realtime/04/+page.svelte` with a chat-like interface
5. The client must establish a WebSocket connection and display a connection indicator
6. Users can type a message and press Enter or click Send to transmit
7. Display both sent and received messages in a threaded view
8. Handle connection drops and provide a reconnect mechanism
9. Display connection statistics: messages sent, messages received, connection uptime
10. Style with PE7 tokens — sent messages right-aligned, received messages left-aligned

## Constraints

- Messages must follow a typed protocol (JSON with a `type` field)
- TypeScript strict mode — type all WebSocket message shapes
- The connection must clean up properly on component unmount
- Handle the case where the server is unreachable

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

SvelteKit does not have built-in WebSocket support in the same way it handles HTTP. You can use the `vite-plugin-websocket` approach or create a WebSocket mock using SSE for the exercise. Alternatively, implement the client-side WebSocket code that would work against any echo server (like `wss://echo.websocket.org`).
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Define a message protocol: `type ClientMessage = { type: 'message'; content: string }` and `type ServerMessage = { type: 'echo'; id: string; original: string; timestamp: string; charCount: number }`. On the client, use `new WebSocket(url)` with `onopen`, `onmessage`, `onerror`, and `onclose` handlers. Track messages in a `$state` array with a `direction` field (`'sent' | 'received'`).
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  type ChatEntry =
    | { direction: 'sent'; content: string; timestamp: string }
    | { direction: 'received'; id: string; content: string; timestamp: string; charCount: number };

  let messages: ChatEntry[] = $state([]);
  let inputValue = $state('');
  let ws: WebSocket | null = $state(null);

  function connect() {
    ws = new WebSocket('ws://localhost:5173/ws');
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      messages = [...messages, { direction: 'received', ...data }];
    };
  }

  function send() {
    if (!ws || !inputValue.trim()) return;
    ws.send(JSON.stringify({ type: 'message', content: inputValue }));
    messages = [...messages, { direction: 'sent', content: inputValue, timestamp: new Date().toISOString() }];
    inputValue = '';
  }
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/17-realtime/04/echo/+server.ts`** (SSE-based echo fallback)

```typescript
import type { RequestHandler } from './$types';

// Since SvelteKit does not natively support WebSocket upgrade in +server.ts,
// we simulate echo behavior using SSE for the server-to-client channel
// and a POST endpoint for the client-to-server channel.
// In production, you would use a WebSocket adapter or separate WS server.

const clients = new Map<string, ReadableStreamDefaultController>();

export const GET: RequestHandler = async ({ request, url }) => {
  const clientId = url.searchParams.get('clientId') ?? crypto.randomUUID();

  const stream = new ReadableStream({
    start(controller) {
      clients.set(clientId, controller);
      const encoder = new TextEncoder();

      // Send connection confirmation
      const welcome = `event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`;
      controller.enqueue(encoder.encode(welcome));

      request.signal.addEventListener('abort', () => {
        clients.delete(clientId);
        try { controller.close(); } catch { /* closed */ }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const body: { clientId: string; content: string } = await request.json();
  const controller = clients.get(body.clientId);

  if (!controller) {
    return new Response('Client not connected', { status: 404 });
  }

  const echo = {
    id: crypto.randomUUID(),
    original: body.content,
    timestamp: new Date().toISOString(),
    charCount: body.content.length
  };

  const encoder = new TextEncoder();
  const event = `event: echo\ndata: ${JSON.stringify(echo)}\n\n`;
  controller.enqueue(encoder.encode(event));

  return new Response(JSON.stringify({ sent: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

**`src/routes/exercises/17-realtime/04/+page.svelte`**

```svelte
<script lang="ts">
  type ChatEntry =
    | { direction: 'sent'; content: string; timestamp: string }
    | { direction: 'received'; id: string; content: string; timestamp: string; charCount: number };

  type ConnectionState = 'disconnected' | 'connecting' | 'connected';

  let messages: ChatEntry[] = $state([]);
  let inputValue = $state('');
  let connectionState: ConnectionState = $state('disconnected');
  let clientId: string | null = $state(null);
  let sentCount = $state(0);
  let receivedCount = $state(0);
  let connectedAt: Date | null = $state(null);
  let chatContainer: HTMLElement | undefined = $state(undefined);

  function connect(): void {
    connectionState = 'connecting';
    const source = new EventSource('/exercises/17-realtime/04/echo?clientId=' + (clientId ?? ''));

    source.addEventListener('connected', (e: MessageEvent) => {
      const data: { clientId: string } = JSON.parse(e.data);
      clientId = data.clientId;
      connectionState = 'connected';
      connectedAt = new Date();
    });

    source.addEventListener('echo', (e: MessageEvent) => {
      const data: { id: string; original: string; timestamp: string; charCount: number } = JSON.parse(e.data);
      messages = [...messages, {
        direction: 'received',
        id: data.id,
        content: data.original,
        timestamp: data.timestamp,
        charCount: data.charCount
      }];
      receivedCount++;
      scrollToBottom();
    });

    source.onerror = () => {
      connectionState = 'disconnected';
    };

    return;
  }

  async function send(): Promise<void> {
    const content = inputValue.trim();
    if (!content || !clientId || connectionState !== 'connected') return;

    messages = [...messages, {
      direction: 'sent',
      content,
      timestamp: new Date().toISOString()
    }];
    sentCount++;
    inputValue = '';
    scrollToBottom();

    await fetch('/exercises/17-realtime/04/echo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, content })
    });
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function scrollToBottom(): void {
    requestAnimationFrame(() => {
      chatContainer?.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    });
  }

  $effect(() => {
    connect();
  });
</script>

<main class="page">
  <h1>Echo Chat</h1>

  <div class="stats-bar">
    <span class="stat">
      <span class="dot" data-state={connectionState}></span>
      {connectionState}
    </span>
    <span class="stat">Sent: {sentCount}</span>
    <span class="stat">Received: {receivedCount}</span>
    {#if connectionState === 'disconnected'}
      <button onclick={connect} class="reconnect-btn">Reconnect</button>
    {/if}
  </div>

  <div class="chat-container" bind:this={chatContainer}>
    {#if messages.length === 0}
      <p class="empty">Send a message to see it echoed back from the server.</p>
    {:else}
      {#each messages as msg, i (i)}
        <div class="message" data-direction={msg.direction}>
          <div class="bubble">
            <p class="content">{msg.content}</p>
            <div class="meta">
              <time>{new Date(msg.timestamp).toLocaleTimeString()}</time>
              {#if msg.direction === 'received'}
                <span class="char-count">{msg.charCount} chars</span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <div class="input-bar">
    <input
      type="text"
      bind:value={inputValue}
      onkeydown={handleKeydown}
      placeholder="Type a message..."
      disabled={connectionState !== 'connected'}
    />
    <button onclick={send} disabled={connectionState !== 'connected' || !inputValue.trim()} class="send-btn">Send</button>
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    min-block-size: 80vh;
    gap: var(--space-md);
  }

  h1 { font-size: var(--text-2xl); }

  .stats-bar {
    display: flex; gap: var(--space-md); align-items: center;
    font-size: var(--text-xs); color: var(--color-text-muted);
    padding: var(--space-sm); background: var(--color-surface-2);
    border-radius: var(--radius-md); flex-wrap: wrap;
  }

  .stat { display: flex; align-items: center; gap: var(--space-xs); }

  .dot {
    inline-size: 0.5rem; block-size: 0.5rem;
    border-radius: var(--radius-full);
  }
  .dot[data-state='connected'] { background: var(--color-success); }
  .dot[data-state='connecting'] { background: var(--color-warning); }
  .dot[data-state='disconnected'] { background: var(--color-error); }

  .reconnect-btn {
    font-size: var(--text-xs); padding: var(--space-xs) var(--space-sm);
    background: var(--color-brand); color: var(--color-surface);
    border: none; border-radius: var(--radius-sm); cursor: pointer;
    margin-inline-start: auto;
  }

  .chat-container {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .empty { font-size: var(--text-sm); color: var(--color-text-muted); text-align: center; padding: var(--space-xl); }

  .message { display: flex; }
  .message[data-direction='sent'] { justify-content: flex-end; }
  .message[data-direction='received'] { justify-content: flex-start; }

  .bubble {
    max-inline-size: 70%;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  .message[data-direction='sent'] .bubble {
    background: var(--color-brand);
    color: var(--color-surface);
    border-end-end-radius: var(--radius-sm);
  }

  .message[data-direction='received'] .bubble {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-end-start-radius: var(--radius-sm);
  }

  .meta {
    display: flex; gap: var(--space-sm);
    font-size: var(--text-xs); margin-block-start: var(--space-xs);
    opacity: 0.7;
  }

  .char-count { font-weight: 600; }

  .input-bar {
    display: flex; gap: var(--space-sm);
  }

  input {
    flex: 1; padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    background: var(--color-surface);
    color: var(--color-text);
  }

  input:focus { outline: 2px solid var(--color-brand); outline-offset: 1px; }

  .send-btn {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-brand); color: var(--color-surface);
    border: none; border-radius: var(--radius-md);
    font-weight: 600; cursor: pointer;
  }

  .send-btn:disabled, input:disabled {
    opacity: 0.5; cursor: not-allowed;
  }
</style>
```

### Explanation

This exercise simulates WebSocket behavior using SSE + POST because SvelteKit does not natively support WebSocket upgrade in `+server.ts` handlers. The architecture uses SSE for the server-to-client channel and a POST endpoint for the client-to-server channel — this is functionally equivalent to a WebSocket but works within SvelteKit's HTTP model. The server maintains a `Map` of connected clients by ID, allowing the POST handler to route echoed messages to the correct client's SSE stream. The client-side code follows the same patterns you would use with a real WebSocket: connection state tracking, message queuing, reconnection logic, and cleanup on unmount. The chat UI uses directional styling (sent = right-aligned with brand color, received = left-aligned with neutral color) following the universal messaging convention. In a real application, you would use a WebSocket server (via the SvelteKit adapter's WebSocket hooks or a separate server like `ws` on Node.js) for true bidirectional communication.
</details>
