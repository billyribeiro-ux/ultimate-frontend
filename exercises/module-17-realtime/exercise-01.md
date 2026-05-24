---
module: 17
exercise: 1
title: SSE Endpoint
difficulty: beginner
estimated_time: 10
skills_tested:
  - ReadableStream construction
  - Server-Sent Events format
  - SvelteKit streaming responses
  - timer-based event emission
---

# Exercise 17.1 — SSE Endpoint

## Brief

Create a SvelteKit server endpoint that streams Server-Sent Events (SSE) to the client. The endpoint should emit a timestamp event every second. This exercise teaches the foundational pattern for all server-to-client real-time communication without WebSockets.

## Requirements

1. Create `src/routes/exercises/17-realtime/01/events/+server.ts` with a GET handler
2. Return a `Response` with a `ReadableStream` and `Content-Type: text/event-stream`
3. Emit an SSE-formatted event every second containing the current ISO timestamp
4. Each event must follow the SSE format: `data: {payload}\n\n`
5. Include an event `id` field that increments with each event
6. Set proper headers: `Cache-Control: no-cache`, `Connection: keep-alive`
7. Clean up the interval when the client disconnects (listen for the `AbortSignal`)
8. Create `src/routes/exercises/17-realtime/01/+page.svelte` that displays the latest timestamp
9. Style with PE7 tokens

## Constraints

- No WebSocket libraries — pure SSE using `ReadableStream`
- The stream must close cleanly when the client navigates away
- TypeScript strict mode with zero errors

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A Server-Sent Event stream is an HTTP response with `Content-Type: text/event-stream`. The body is a `ReadableStream` that writes text in the format `id: 1\ndata: {"time":"..."}\n\n`. Use `new ReadableStream({ start(controller) { ... } })` to create it.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Inside the `start` callback, use `setInterval` to enqueue events. Format each event as `id: ${counter}\ndata: ${JSON.stringify(payload)}\n\n`. Use `controller.enqueue(new TextEncoder().encode(text))` to send the data. Clean up with `event.request.signal.addEventListener('abort', ...)`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
export const GET: RequestHandler = async ({ request }) => {
  let counter = 0;
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const interval = setInterval(() => {
        counter++;
        const event = `id: ${counter}\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(event));
      }, 1000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
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
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/17-realtime/01/events/+server.ts`**

```typescript
import type { RequestHandler } from './$types';

interface TimeEvent {
  time: string;
  counter: number;
}

export const GET: RequestHandler = async ({ request }) => {
  let counter = 0;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: TimeEvent): void => {
        counter++;
        const payload = `id: ${counter}\nevent: tick\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      // Send an initial event immediately
      send({ time: new Date().toISOString(), counter: 0 });

      const interval = setInterval(() => {
        send({ time: new Date().toISOString(), counter });
      }, 1000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // Stream may already be closed
        }
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
```

**`src/routes/exercises/17-realtime/01/+page.svelte`**

```svelte
<script lang="ts">
  let latestTime = $state('Connecting...');
  let eventCount = $state(0);
  let connected = $state(false);

  $effect(() => {
    const source = new EventSource('/exercises/17-realtime/01/events');

    source.addEventListener('tick', (event: MessageEvent) => {
      const data: { time: string; counter: number } = JSON.parse(event.data);
      latestTime = new Date(data.time).toLocaleTimeString();
      eventCount = data.counter;
      connected = true;
    });

    source.onerror = () => {
      connected = false;
    };

    return () => {
      source.close();
    };
  });
</script>

<main class="page">
  <h1>Server-Sent Events</h1>
  <p class="intro">Real-time timestamps streamed from the server via SSE.</p>

  <div class="card">
    <div class="status" class:online={connected}>
      {connected ? 'Connected' : 'Disconnected'}
    </div>
    <p class="time">{latestTime}</p>
    <p class="count">Events received: {eventCount}</p>
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
    display: grid;
    place-items: center;
    min-block-size: 60vh;
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    text-align: center;
    min-inline-size: 16rem;
    box-shadow: var(--shadow-md);
  }

  .status {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-error);
    margin-block-end: var(--space-md);
  }

  .status.online { color: var(--color-success); }

  .time {
    font-size: var(--text-2xl);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--color-text);
  }

  .count {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-start: var(--space-sm);
  }
</style>
```

### Explanation

Server-Sent Events (SSE) use a persistent HTTP connection where the server writes text events in a specific format. The `ReadableStream` is the Web Streams API way to create an indefinitely-running response body. Each event must end with two newlines (`\n\n`) — this delimiter tells the browser's `EventSource` parser where one event ends and the next begins. The `id` field enables automatic reconnection: if the connection drops, `EventSource` sends a `Last-Event-ID` header so the server can resume from where it left off. The `request.signal` listener ensures the server cleans up the interval when the client navigates away — without this, the interval would leak memory. On the client side, `EventSource` handles reconnection automatically (with exponential backoff), making SSE more resilient than raw `fetch` streaming. The `$effect` cleanup function calls `source.close()` to prevent the connection from persisting during client-side navigation.
</details>
