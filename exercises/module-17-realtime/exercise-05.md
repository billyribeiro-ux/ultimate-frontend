---
module: 17
exercise: 5
title: Presence System
difficulty: principal
estimated_time: 60
skills_tested:
  - user presence tracking
  - heartbeat mechanism
  - online/offline detection
  - connection cleanup
  - multi-user state management
---

# Exercise 17.5 — Presence System

## Brief

Build a real-time presence system that tracks which users are currently online, when they were last active, and displays an "online users" panel that updates in real-time. The system uses heartbeats to detect stale connections and automatically marks users as offline after a timeout. This exercise teaches the infrastructure behind "who's online" features in collaborative applications.

## Requirements

1. Create a server-side presence store in `src/lib/server/presence.ts` that tracks connected users
2. Define a `PresenceEntry` type with `userId: string`, `name: string`, `lastSeen: Date`, `status: 'online' | 'idle' | 'offline'`
3. Create `src/routes/exercises/17-realtime/05/presence/+server.ts` with GET (SSE stream of presence updates) and POST (heartbeat/join/leave actions)
4. When a user joins, add them to the store and broadcast the updated list
5. Implement a heartbeat: the client sends a POST every 10 seconds; if no heartbeat is received for 30 seconds, mark the user as offline
6. Run a server-side cleanup interval that removes stale users
7. Create `src/routes/exercises/17-realtime/05/+page.svelte` with an online users panel
8. Show each user with a status indicator (green=online, yellow=idle, gray=offline)
9. Display a "You" indicator next to the current user
10. When the user navigates away (or closes the tab), send a leave event via `navigator.sendBeacon`
11. Allow the user to set their display name before joining
12. Style with PE7 tokens — use avatar-like circles with initials

## Constraints

- The presence store must handle concurrent connections safely
- TypeScript strict mode with zero errors
- Stale connections must be cleaned up to prevent ghost users
- The heartbeat must not prevent the page from being garbage collected

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Use a server-side `Map<string, PresenceEntry>` to track users. The SSE stream sends the full user list whenever it changes. Heartbeats are POST requests with `{ action: 'heartbeat', userId: '...' }`. A `setInterval` on the server checks for stale entries every 15 seconds.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The client sends three types of POST: `join` (with name), `heartbeat` (keep-alive), and `leave` (disconnect). The server broadcasts the presence list to all connected SSE clients whenever the list changes. Use `navigator.sendBeacon` in the `beforeunload` event for the leave message — it survives page unload.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// Server-side presence store
const users = new Map<string, PresenceEntry>();
const listeners = new Set<ReadableStreamDefaultController>();

function broadcast() {
  const list = Array.from(users.values());
  const event = `event: presence\ndata: ${JSON.stringify(list)}\n\n`;
  const encoded = new TextEncoder().encode(event);
  for (const controller of listeners) {
    try { controller.enqueue(encoded); } catch { listeners.delete(controller); }
  }
}

// Client-side heartbeat
$effect(() => {
  const interval = setInterval(() => {
    fetch('/exercises/17-realtime/05/presence', {
      method: 'POST',
      body: JSON.stringify({ action: 'heartbeat', userId }),
      headers: { 'Content-Type': 'application/json' }
    });
  }, 10000);
  return () => clearInterval(interval);
});
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/server/presence.ts`**

```typescript
export interface PresenceEntry {
  userId: string;
  name: string;
  lastSeen: Date;
  status: 'online' | 'idle' | 'offline';
}

const users = new Map<string, PresenceEntry>();
const listeners = new Set<ReadableStreamDefaultController>();

const IDLE_THRESHOLD = 20_000;   // 20 seconds
const OFFLINE_THRESHOLD = 30_000; // 30 seconds
const CLEANUP_INTERVAL = 15_000;  // 15 seconds

function broadcast(): void {
  const list = Array.from(users.values()).filter((u) => u.status !== 'offline');
  const event = `event: presence\ndata: ${JSON.stringify(list)}\n\n`;
  const encoded = new TextEncoder().encode(event);

  for (const controller of listeners) {
    try {
      controller.enqueue(encoded);
    } catch {
      listeners.delete(controller);
    }
  }
}

export function join(userId: string, name: string): void {
  users.set(userId, { userId, name, lastSeen: new Date(), status: 'online' });
  broadcast();
}

export function heartbeat(userId: string): void {
  const entry = users.get(userId);
  if (entry) {
    entry.lastSeen = new Date();
    entry.status = 'online';
    broadcast();
  }
}

export function leave(userId: string): void {
  users.delete(userId);
  broadcast();
}

export function getUsers(): PresenceEntry[] {
  return Array.from(users.values());
}

export function addListener(controller: ReadableStreamDefaultController): void {
  listeners.add(controller);
}

export function removeListener(controller: ReadableStreamDefaultController): void {
  listeners.delete(controller);
}

// Cleanup stale users periodically
setInterval(() => {
  const now = Date.now();
  let changed = false;

  for (const [id, entry] of users) {
    const elapsed = now - entry.lastSeen.getTime();

    if (elapsed > OFFLINE_THRESHOLD) {
      users.delete(id);
      changed = true;
    } else if (elapsed > IDLE_THRESHOLD && entry.status === 'online') {
      entry.status = 'idle';
      changed = true;
    }
  }

  if (changed) broadcast();
}, CLEANUP_INTERVAL);
```

**`src/routes/exercises/17-realtime/05/presence/+server.ts`**

```typescript
import type { RequestHandler } from './$types';
import { join, heartbeat, leave, getUsers, addListener, removeListener } from '$lib/server/presence';

export const GET: RequestHandler = async ({ request }) => {
  const stream = new ReadableStream({
    start(controller) {
      addListener(controller);

      // Send current state immediately
      const users = getUsers().filter((u) => u.status !== 'offline');
      const event = `event: presence\ndata: ${JSON.stringify(users)}\n\n`;
      controller.enqueue(new TextEncoder().encode(event));

      request.signal.addEventListener('abort', () => {
        removeListener(controller);
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

export const POST: RequestHandler = async ({ request }) => {
  const body: { action: 'join' | 'heartbeat' | 'leave'; userId: string; name?: string } = await request.json();

  switch (body.action) {
    case 'join':
      join(body.userId, body.name ?? 'Anonymous');
      break;
    case 'heartbeat':
      heartbeat(body.userId);
      break;
    case 'leave':
      leave(body.userId);
      break;
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

**`src/routes/exercises/17-realtime/05/+page.svelte`**

```svelte
<script lang="ts">
  interface PresenceUser {
    userId: string;
    name: string;
    lastSeen: string;
    status: 'online' | 'idle' | 'offline';
  }

  let onlineUsers: PresenceUser[] = $state([]);
  let nameInput = $state('');
  let joined = $state(false);
  let userId = $state('');

  function getInitials(name: string): string {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  async function handleJoin(): Promise<void> {
    if (!nameInput.trim()) return;
    userId = crypto.randomUUID();

    await fetch('/exercises/17-realtime/05/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', userId, name: nameInput.trim() })
    });

    joined = true;
  }

  $effect(() => {
    if (!joined) return;

    const source = new EventSource('/exercises/17-realtime/05/presence');

    source.addEventListener('presence', (e: MessageEvent) => {
      onlineUsers = JSON.parse(e.data);
    });

    // Heartbeat every 10 seconds
    const heartbeatInterval = setInterval(() => {
      fetch('/exercises/17-realtime/05/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'heartbeat', userId })
      });
    }, 10_000);

    // Leave on page unload
    const handleUnload = (): void => {
      navigator.sendBeacon(
        '/exercises/17-realtime/05/presence',
        new Blob(
          [JSON.stringify({ action: 'leave', userId })],
          { type: 'application/json' }
        )
      );
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      source.close();
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleUnload);
      // Send leave on client-side navigation
      fetch('/exercises/17-realtime/05/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave', userId })
      });
    };
  });
</script>

<main class="page">
  <h1>Presence System</h1>

  {#if !joined}
    <div class="join-card">
      <h2>Join the Room</h2>
      <p class="subtitle">Enter your name to appear in the presence list.</p>
      <form onsubmit={(e) => { e.preventDefault(); handleJoin(); }}>
        <input
          type="text"
          bind:value={nameInput}
          placeholder="Your name"
          required
        />
        <button type="submit" class="btn">Join</button>
      </form>
    </div>
  {:else}
    <div class="presence-panel">
      <h2>Online Users ({onlineUsers.length})</h2>

      <div class="user-list">
        {#each onlineUsers as user (user.userId)}
          <div class="user-row">
            <div class="avatar" data-status={user.status}>
              {getInitials(user.name)}
            </div>
            <div class="user-info">
              <span class="user-name">
                {user.name}
                {#if user.userId === userId}
                  <span class="you-badge">You</span>
                {/if}
              </span>
              <span class="user-status">{user.status}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-xl); }

  .join-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    max-inline-size: 24rem;
    margin-inline: auto;
    text-align: center;
  }

  .join-card h2 { font-size: var(--text-lg); margin-block-end: var(--space-xs); }
  .subtitle { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-lg); }

  .join-card form { display: flex; gap: var(--space-sm); }

  .join-card input {
    flex: 1; padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    background: var(--color-surface);
    color: var(--color-text);
  }

  .btn {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-brand);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
  }

  .presence-panel {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    max-inline-size: 24rem;
    margin-inline: auto;
  }

  .presence-panel h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }

  .user-list { display: grid; gap: var(--space-sm); }

  .user-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }

  .avatar {
    inline-size: 2.5rem;
    block-size: 2.5rem;
    border-radius: var(--radius-full);
    display: grid;
    place-items: center;
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-surface);
    background: var(--color-brand);
    position: relative;
  }

  .avatar::after {
    content: '';
    position: absolute;
    inset-block-end: 0;
    inset-inline-end: 0;
    inline-size: 0.6rem;
    block-size: 0.6rem;
    border-radius: var(--radius-full);
    border: 2px solid var(--color-surface);
  }

  .avatar[data-status='online']::after { background: var(--color-success); }
  .avatar[data-status='idle']::after { background: var(--color-warning); }
  .avatar[data-status='offline']::after { background: var(--color-text-muted); }

  .user-info { display: grid; gap: 0.1rem; }
  .user-name { font-size: var(--text-sm); font-weight: 600; }
  .user-status { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: capitalize; }

  .you-badge {
    font-size: var(--text-xs);
    background: var(--color-brand);
    color: var(--color-surface);
    padding: 0.1em 0.4em;
    border-radius: var(--radius-full);
    font-weight: 600;
    margin-inline-start: var(--space-xs);
  }
</style>
```

### Explanation

This exercise implements the core infrastructure behind collaborative presence features (seen in Figma, Google Docs, Slack). The server-side presence store is a `Map` that tracks each user's last heartbeat time. A cleanup interval runs every 15 seconds and transitions users through statuses: online (heartbeat < 20s ago), idle (20-30s), offline (> 30s, removed). The broadcast function sends the updated user list to all connected SSE listeners. The heartbeat mechanism is critical: without it, the server cannot distinguish between a user who is actively using the app and one who has lost their connection. The `navigator.sendBeacon` call in `beforeunload` is essential — regular `fetch` calls are cancelled during page unload, but `sendBeacon` is guaranteed to be sent. The `$effect` cleanup function handles client-side navigation (SvelteKit's routing), while `beforeunload` handles tab close and external navigation. Together, they ensure the user is removed from the presence list in all exit scenarios.
</details>
