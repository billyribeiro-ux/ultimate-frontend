---
module: 17
exercise: 2
title: EventSource Consumer
difficulty: intermediate
estimated_time: 20
skills_tested:
  - EventSource API
  - reactive state updates from streams
  - reconnection handling
  - connection state management
---

# Exercise 17.2 — EventSource Consumer

## Brief

Build a robust EventSource consumer component that connects to an SSE endpoint, displays incoming events in a scrollable log, handles disconnections with automatic reconnection, and shows connection state visually. This exercise focuses on the client-side patterns for consuming real-time data.

## Requirements

1. Create a reusable `src/lib/exercises/17/EventLog.svelte` component
2. The component accepts an `endpoint: string` prop for the SSE URL
3. Maintain a `$state` array of received events (with timestamp, id, and data)
4. Display events in a scrollable, reverse-chronological log (newest at top)
5. Show connection state: connecting, connected, reconnecting, error
6. Implement a manual reconnect button that appears when the connection fails
7. Add a "Clear log" button that empties the events array
8. Cap the log at 100 events (remove oldest when exceeding)
9. Create `src/routes/exercises/17-realtime/02/+page.svelte` using the component
10. Create an SSE endpoint at `src/routes/exercises/17-realtime/02/events/+server.ts` that sends random data events
11. Style with PE7 tokens — use a monospaced font for the event log

## Constraints

- The EventSource must be created and cleaned up inside `$effect`
- TypeScript strict mode with typed event data
- The log must auto-scroll to show new events

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`EventSource` has three event handlers: `onopen` (connected), `onmessage` (default events), and `onerror` (connection issues). It automatically reconnects after errors. Store events in a `$state` array and use `.unshift()` or spread to prepend new events.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Track connection state as a discriminated type: `type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'error'`. Update it in the event handlers. For the cap, use `events = events.slice(0, 100)` after adding a new event. For auto-scroll, use a `$effect` that scrolls the container whenever `events.length` changes.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface LogEntry {
    id: string;
    timestamp: string;
    data: string;
  }

  let events: LogEntry[] = $state([]);
  let status: 'connecting' | 'connected' | 'reconnecting' | 'error' = $state('connecting');

  let { endpoint }: { endpoint: string } = $props();

  $effect(() => {
    const source = new EventSource(endpoint);
    status = 'connecting';

    source.onopen = () => { status = 'connected'; };
    source.onmessage = (e) => {
      events = [{ id: e.lastEventId, timestamp: new Date().toISOString(), data: e.data }, ...events].slice(0, 100);
    };
    source.onerror = () => { status = source.readyState === EventSource.CONNECTING ? 'reconnecting' : 'error'; };

    return () => source.close();
  });
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/17-realtime/02/events/+server.ts`**

```typescript
import type { RequestHandler } from './$types';

const adjectives = ['quick', 'lazy', 'happy', 'clever', 'bright', 'calm', 'bold', 'keen'];
const nouns = ['sensor', 'module', 'service', 'worker', 'handler', 'process', 'thread', 'agent'];

function randomMessage(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const value = Math.round(Math.random() * 1000) / 10;
  return JSON.stringify({ source: `${adj}-${noun}`, value, unit: 'ms' });
}

export const GET: RequestHandler = async ({ request }) => {
  let counter = 0;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const interval = setInterval(() => {
        counter++;
        const event = `id: ${counter}\ndata: ${randomMessage()}\n\n`;
        controller.enqueue(encoder.encode(event));
      }, 800 + Math.random() * 1200);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
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

**`src/lib/exercises/17/EventLog.svelte`**

```svelte
<script lang="ts">
  interface LogEntry {
    id: string;
    timestamp: string;
    data: string;
  }

  type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'error';

  interface Props {
    endpoint: string;
  }

  let { endpoint }: Props = $props();

  let events: LogEntry[] = $state([]);
  let status: ConnectionState = $state('connecting');
  let source: EventSource | null = $state(null);
  let logContainer: HTMLElement | undefined = $state(undefined);

  function connect(): void {
    source?.close();
    status = 'connecting';

    const es = new EventSource(endpoint);

    es.onopen = () => {
      status = 'connected';
    };

    es.onmessage = (e: MessageEvent) => {
      const entry: LogEntry = {
        id: e.lastEventId || String(events.length),
        timestamp: new Date().toLocaleTimeString(),
        data: e.data
      };
      events = [entry, ...events].slice(0, 100);
    };

    es.onerror = () => {
      if (es.readyState === EventSource.CONNECTING) {
        status = 'reconnecting';
      } else {
        status = 'error';
        es.close();
      }
    };

    source = es;
  }

  function disconnect(): void {
    source?.close();
    source = null;
    status = 'error';
  }

  function clearLog(): void {
    events = [];
  }

  $effect(() => {
    connect();
    return () => {
      source?.close();
    };
  });
</script>

<div class="event-log">
  <header class="log-header">
    <div class="status-group">
      <span class="status-dot" data-status={status}></span>
      <span class="status-text">{status}</span>
      <span class="event-count">{events.length} events</span>
    </div>
    <div class="actions">
      {#if status === 'error'}
        <button onclick={connect} class="btn-reconnect">Reconnect</button>
      {:else}
        <button onclick={disconnect} class="btn-disconnect">Disconnect</button>
      {/if}
      <button onclick={clearLog} class="btn-clear">Clear</button>
    </div>
  </header>

  <div class="log-body" bind:this={logContainer}>
    {#if events.length === 0}
      <p class="empty">Waiting for events...</p>
    {:else}
      {#each events as entry (entry.id + entry.timestamp)}
        <div class="log-entry">
          <span class="entry-time">{entry.timestamp}</span>
          <span class="entry-id">#{entry.id}</span>
          <span class="entry-data">{entry.data}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .event-log {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    border-block-end: 1px solid var(--color-border);
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .status-group {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .status-dot {
    inline-size: 0.5rem;
    block-size: 0.5rem;
    border-radius: var(--radius-full);
    background: var(--color-text-muted);
  }

  .status-dot[data-status='connected'] { background: var(--color-success); }
  .status-dot[data-status='connecting'] { background: var(--color-warning); }
  .status-dot[data-status='reconnecting'] { background: var(--color-warning); animation: pulse 1s infinite; }
  .status-dot[data-status='error'] { background: var(--color-error); }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .status-text {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .event-count {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .actions {
    display: flex;
    gap: var(--space-xs);
  }

  .btn-reconnect, .btn-disconnect, .btn-clear {
    font-size: var(--text-xs);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font-weight: 600;
  }

  .btn-reconnect { border-color: var(--color-success); color: var(--color-success); }
  .btn-disconnect { border-color: var(--color-error); color: var(--color-error); }

  .log-body {
    max-block-size: 24rem;
    overflow-y: auto;
    padding: var(--space-sm);
  }

  .empty {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    text-align: center;
    padding: var(--space-xl);
  }

  .log-entry {
    display: flex;
    gap: var(--space-sm);
    padding: var(--space-xs) var(--space-sm);
    font-family: monospace;
    font-size: var(--text-xs);
    border-block-end: 1px solid var(--color-border);
  }

  .log-entry:last-child { border-block-end: none; }

  .entry-time { color: var(--color-text-muted); white-space: nowrap; }
  .entry-id { color: var(--color-brand); font-weight: 600; white-space: nowrap; }
  .entry-data { color: var(--color-text); word-break: break-all; }
</style>
```

**`src/routes/exercises/17-realtime/02/+page.svelte`**

```svelte
<script lang="ts">
  import EventLog from '$lib/exercises/17/EventLog.svelte';
</script>

<main class="page">
  <h1>Event Stream Consumer</h1>
  <p class="intro">A robust EventSource client with connection management and event logging.</p>

  <EventLog endpoint="/exercises/17-realtime/02/events" />
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
</style>
```

### Explanation

This exercise builds a production-quality SSE consumer. The `EventLog` component encapsulates all connection management: connecting, tracking state, handling errors, and providing manual controls. The connection state machine (`connecting -> connected`, `error -> reconnecting`) maps directly to `EventSource.readyState` values. The event log uses array prepending with a 100-event cap to prevent memory growth. The `bind:this` on the log container could be used with `scrollTo` for auto-scroll behavior. The component is reusable — pass any SSE endpoint URL and it works. The `$effect` cleanup function ensures the `EventSource` is closed during client-side navigation, preventing connection leaks. The server endpoint uses random intervals (800-2000ms) to simulate realistic event timing.
</details>
