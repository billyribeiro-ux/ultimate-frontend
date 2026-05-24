# Build a Real-Time Chat App — Complete Walkthrough

> **Time:** ~8 hours | **Modules referenced:** M2, M5, M11, M12, M15, M16, M17
> **What you'll build:** A real-time chat application with WebSocket connection management, session-based authentication, message history from a database, optimistic message sending, typing indicators via SSE, user presence (online/offline) tracking, keyboard accessibility, message reactions with `$state` arrays, and scroll anchoring with `$effect.pre`.
> **Prerequisites:** Complete through Module 17 (Real-Time Communication)

## Table of contents

1. [Project setup](#1-project-setup)
2. [PE7 CSS foundation](#2-pe7-css-foundation)
3. [Database schema](#3-database-schema)
4. [Authentication with sessions](#4-authentication-with-sessions)
5. [Chat room layout](#5-chat-room-layout)
6. [WebSocket server setup](#6-websocket-server-setup)
7. [WebSocket client connection manager](#7-websocket-client-connection-manager)
8. [Message history from database](#8-message-history-from-database)
9. [Sending messages with optimistic UI](#9-sending-messages-with-optimistic-ui)
10. [Typing indicators via SSE](#10-typing-indicators-via-sse)
11. [User presence — online/offline](#11-user-presence--onlineoffline)
12. [Message reactions with $state arrays](#12-message-reactions-with-state-arrays)
13. [Scroll anchoring with $effect.pre](#13-scroll-anchoring-with-effectpre)
14. [Keyboard accessibility](#14-keyboard-accessibility)
15. [Deployment](#15-deployment)
16. [Final result](#16-final-result)
17. [What you practiced](#17-what-you-practiced)

---

## 1. Project setup

```bash
pnpm create svelte@latest realtime-chat
```

Select: Skeleton project, TypeScript, Prettier + ESLint.

```bash
cd realtime-chat
pnpm install

# Database
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3

# Auth
pnpm add @node-rs/argon2

# Validation
pnpm add valibot

# WebSocket (for the custom server)
pnpm add ws
pnpm add -D @types/ws
```

Configure strict TypeScript:

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler"
  }
}
```

### File tree after step 1

```
realtime-chat/
├── src/
│   ├── app.html
│   ├── app.d.ts
│   └── routes/
│       └── +page.svelte
├── svelte.config.js
├── tsconfig.json
└── package.json
```

---

## 2. PE7 CSS foundation

Create `src/app.css` with a messaging-focused dark palette:

```css
@layer reset, tokens, base, layout, components, utilities;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  body {
    min-block-size: 100dvh;
    -webkit-font-smoothing: antialiased;
  }

  img, picture, video, canvas, svg {
    display: block;
    max-inline-size: 100%;
  }

  input, button, textarea, select {
    font: inherit;
    color: inherit;
  }

  ul, ol { list-style: none; }
}

@layer tokens {
  :root {
    /* Chat-focused dark palette — OKLCH */
    --color-primary: oklch(0.68 0.16 230);
    --color-primary-hover: oklch(0.62 0.18 230);
    --color-secondary: oklch(0.72 0.14 160);
    --color-surface: oklch(0.14 0.01 260);
    --color-surface-alt: oklch(0.18 0.015 260);
    --color-surface-elevated: oklch(0.22 0.02 260);
    --color-text: oklch(0.92 0.01 260);
    --color-text-muted: oklch(0.60 0.02 260);
    --color-border: oklch(0.28 0.015 260);
    --color-success: oklch(0.72 0.19 145);
    --color-error: oklch(0.65 0.22 25);
    --color-warning: oklch(0.80 0.18 85);

    /* Message bubble colors */
    --color-bubble-own: oklch(0.55 0.14 230);
    --color-bubble-other: oklch(0.22 0.02 260);

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;

    /* Typography */
    --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
    --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
    --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
    --text-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
    --text-xl: clamp(1.15rem, 1rem + 0.75vw, 1.25rem);
    --text-2xl: clamp(1.4rem, 1.1rem + 1.5vw, 1.75rem);

    /* Motion */
    --dur-instant: 100ms;
    --dur-fast: 200ms;
    --dur-normal: 300ms;
    --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
    --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);

    /* Radius & Shadow */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-full: 9999px;
    --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.2);
  }
}

@layer base {
  body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: var(--text-base);
    line-height: 1.5;
    color: var(--color-text);
    background: var(--color-surface);
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
  }

  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

@layer utilities {
  .sr-only {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
}
```

---

## 3. Database schema

Create `src/lib/server/db/schema.ts`:

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarColor: text('avatar_color').notNull().default('oklch(0.68 0.16 230)'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').default(''),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  roomId: text('room_id')
    .notNull()
    .references(() => rooms.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  editedAt: integer('edited_at', { mode: 'timestamp' })
});

export const reactions = sqliteTable('reactions', {
  id: text('id').primaryKey(),
  messageId: text('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  emoji: text('emoji').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});

// Relations (Lesson 16.6)
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  reactions: many(reactions)
}));

export const roomsRelations = relations(rooms, ({ many }) => ({
  messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  user: one(users, { fields: [messages.userId], references: [users.id] }),
  room: one(rooms, { fields: [messages.roomId], references: [rooms.id] }),
  reactions: many(reactions)
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  message: one(messages, { fields: [reactions.messageId], references: [messages.id] }),
  user: one(users, { fields: [reactions.userId], references: [users.id] })
}));

// Type exports
export type User = typeof users.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;
```

Create `src/lib/server/db/index.ts`:

```ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('local.db');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
```

Create `drizzle.config.ts` and run migrations:

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: { url: 'local.db' }
});
```

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

---

## 4. Authentication with sessions

Create `src/lib/server/auth.ts`:

```ts
import { hash, verify } from '@node-rs/argon2';
import { db } from './db';
import { sessions, users } from './db/schema';
import { eq } from 'drizzle-orm';

export function generateId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

const AVATAR_COLORS = [
  'oklch(0.68 0.16 230)', // blue
  'oklch(0.72 0.19 145)', // green
  'oklch(0.65 0.22 25)',  // red
  'oklch(0.80 0.18 85)',  // yellow
  'oklch(0.60 0.18 290)', // purple
  'oklch(0.72 0.14 160)', // teal
  'oklch(0.68 0.14 65)',  // amber
  'oklch(0.65 0.15 340)'  // pink
];

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]!;
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });
}

export async function verifyPassword(hashed: string, plain: string): Promise<boolean> {
  return await verify(hashed, plain);
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = generateId();
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  return sessionId;
}

export async function validateSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session || session.expiresAt < new Date()) {
    if (session) await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      avatarColor: users.avatarColor
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}

export async function invalidateSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
```

Create `src/hooks.server.ts`:

```ts
import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session');

  if (sessionId) {
    event.locals.user = await validateSession(sessionId);
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};
```

Update `src/app.d.ts`:

```ts
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        username: string;
        email: string;
        avatarColor: string;
      } | null;
    }
  }
}

export {};
```

Create `src/routes/register/+page.svelte`:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
</script>

<svelte:head>
  <title>Register — Chat</title>
</svelte:head>

<div class="auth-page">
  <div class="auth-card">
    <h1>Create account</h1>

    <form method="POST" use:enhance>
      {#if form?.error}
        <div class="error-banner" role="alert">{form.error}</div>
      {/if}

      <label>
        <span>Username</span>
        <input
          type="text"
          name="username"
          required
          minlength={3}
          maxlength={20}
          pattern="[a-zA-Z0-9_]+"
          value={form?.username ?? ''}
          autocomplete="username"
        />
      </label>

      <label>
        <span>Email</span>
        <input type="email" name="email" required value={form?.email ?? ''} autocomplete="email" />
      </label>

      <label>
        <span>Password</span>
        <input type="password" name="password" required minlength={8} autocomplete="new-password" />
      </label>

      <button type="submit">Create account</button>
    </form>

    <p class="alt-action">Already have an account? <a href="/login">Sign in</a></p>
  </div>
</div>

<style>
  @layer components {
    .auth-page {
      display: grid;
      place-items: center;
      min-block-size: 100dvh;
      padding: var(--space-lg);
    }

    .auth-card {
      inline-size: min(100%, 22rem);
      padding: var(--space-2xl);
      background: var(--color-surface-alt);
      border-radius: var(--radius-lg);

      h1 {
        font-size: var(--text-2xl);
        margin-block-end: var(--space-xl);
      }
    }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    label {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }

    input {
      padding: var(--space-sm) var(--space-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text);

      &:focus {
        border-color: var(--color-primary);
        outline: none;
      }
    }

    button {
      padding: var(--space-sm);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;

      &:hover { background: var(--color-primary-hover); }
    }

    .error-banner {
      padding: var(--space-sm);
      background: oklch(0.25 0.05 25);
      color: var(--color-error);
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
    }

    .alt-action {
      margin-block-start: var(--space-lg);
      text-align: center;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
  }
</style>
```

Create `src/routes/register/+page.server.ts`:

```ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateId, hashPassword, createSession, randomAvatarColor } from '$lib/server/auth';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get('username')?.toString().trim() ?? '';
    const email = data.get('email')?.toString().trim().toLowerCase() ?? '';
    const password = data.get('password')?.toString() ?? '';

    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return fail(400, { error: 'Username must be 3+ characters (letters, numbers, underscore).', username, email });
    }

    if (password.length < 8) {
      return fail(400, { error: 'Password must be at least 8 characters.', username, email });
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing) {
      return fail(400, { error: 'Username already taken.', username, email });
    }

    const userId = generateId();
    await db.insert(users).values({
      id: userId,
      username,
      email,
      passwordHash: await hashPassword(password),
      avatarColor: randomAvatarColor()
    });

    const sessionId = await createSession(userId);
    cookies.set('session', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 30 * 24 * 60 * 60
    });

    redirect(303, '/chat');
  }
};
```

Create login page similarly at `src/routes/login/+page.server.ts` and `+page.svelte` (following the same pattern as register, but verifying credentials instead of creating a user).

---

## 5. Chat room layout

Create `src/routes/chat/+layout.server.ts`:

```ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    redirect(303, '/login');
  }

  const rooms = await db.query.rooms.findMany({
    orderBy: (rooms, { asc }) => [asc(rooms.name)]
  });

  return {
    user: locals.user,
    rooms
  };
};
```

Create `src/routes/chat/+layout.svelte`:

```svelte
<script lang="ts">
  import '../../app.css';
  import type { LayoutData } from './$types';

  let { data, children } = $props();
</script>

<div class="chat-layout">
  <aside class="room-sidebar">
    <header class="sidebar-header">
      <h2>Rooms</h2>
    </header>

    <nav aria-label="Chat rooms">
      <ul class="room-list">
        {#each data.rooms as room (room.id)}
          <li>
            <a href="/chat/{room.id}" class="room-link">
              <span class="room-hash">#</span>
              <span class="room-name">{room.name}</span>
            </a>
          </li>
        {:else}
          <li class="empty-rooms">No rooms yet</li>
        {/each}
      </ul>
    </nav>

    <footer class="sidebar-footer">
      <div class="user-badge">
        <span
          class="avatar"
          style:background={data.user.avatarColor}
          aria-hidden="true"
        >
          {data.user.username.charAt(0).toUpperCase()}
        </span>
        <span class="username">{data.user.username}</span>
      </div>
      <form method="POST" action="/logout">
        <button type="submit" aria-label="Sign out">Sign out</button>
      </form>
    </footer>
  </aside>

  <main class="chat-main">
    {@render children()}
  </main>
</div>

<style>
  @layer components {
    .chat-layout {
      display: grid;
      grid-template-columns: 15rem 1fr;
      block-size: 100dvh;
      overflow: hidden;

      @media (width < 768px) {
        grid-template-columns: 1fr;
      }
    }

    .room-sidebar {
      background: var(--color-surface-alt);
      border-inline-end: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      overflow-y: auto;

      @media (width < 768px) { display: none; }
    }

    .sidebar-header {
      padding: var(--space-lg);
      border-block-end: 1px solid var(--color-border);

      h2 {
        font-size: var(--text-sm);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-text-muted);
      }
    }

    .room-list {
      padding: var(--space-sm);
      flex: 1;
    }

    .room-link {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      transition: all var(--dur-fast) var(--ease-out);

      &:hover {
        background: var(--color-surface-elevated);
        color: var(--color-text);
      }
    }

    .room-hash {
      color: var(--color-text-muted);
      font-weight: 600;
    }

    .sidebar-footer {
      padding: var(--space-md);
      border-block-start: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .avatar {
      display: grid;
      place-items: center;
      inline-size: 2rem;
      block-size: 2rem;
      border-radius: var(--radius-full);
      color: oklch(1 0 0);
      font-size: var(--text-xs);
      font-weight: 700;
    }

    .username {
      font-size: var(--text-sm);
      font-weight: 500;
    }

    .sidebar-footer button {
      padding: var(--space-xs) var(--space-sm);
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      font-size: var(--text-xs);
      cursor: pointer;

      &:hover { background: var(--color-surface-elevated); }
    }

    .chat-main {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
</style>
```

---

## 6. WebSocket server setup

SvelteKit does not natively support WebSockets on all adapters, but as of SvelteKit 2.60+ with Node adapter, you can use the `handleWebSocket` hook (Lesson 17.6). Here we create a WebSocket handler.

Create `src/lib/server/ws.ts`:

```ts
import { db } from './db';
import { messages } from './db/schema';
import { generateId } from './auth';

// In-memory connected clients map
const clients = new Map<string, Set<WebSocket>>();

// In-memory typing state
const typingUsers = new Map<string, Map<string, NodeJS.Timeout>>();

export interface WsMessage {
  type: 'chat' | 'typing' | 'stop-typing' | 'reaction' | 'presence';
  roomId: string;
  userId: string;
  username: string;
  content?: string;
  messageId?: string;
  emoji?: string;
  timestamp: number;
}

export function addClient(roomId: string, ws: WebSocket) {
  if (!clients.has(roomId)) {
    clients.set(roomId, new Set());
  }
  clients.get(roomId)!.add(ws);
}

export function removeClient(roomId: string, ws: WebSocket) {
  clients.get(roomId)?.delete(ws);
  if (clients.get(roomId)?.size === 0) {
    clients.delete(roomId);
  }
}

export function broadcast(roomId: string, data: WsMessage, exclude?: WebSocket) {
  const roomClients = clients.get(roomId);
  if (!roomClients) return;

  const payload = JSON.stringify(data);
  for (const ws of roomClients) {
    if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

export async function handleChatMessage(data: WsMessage) {
  if (!data.content?.trim()) return;

  const messageId = generateId();
  const now = new Date();

  // Persist to database (Lesson 16.5)
  await db.insert(messages).values({
    id: messageId,
    roomId: data.roomId,
    userId: data.userId,
    content: data.content.trim(),
    createdAt: now
  });

  // Broadcast to all clients in the room
  broadcast(data.roomId, {
    ...data,
    type: 'chat',
    messageId,
    timestamp: now.getTime()
  });
}

export function getOnlineUsers(roomId: string): number {
  return clients.get(roomId)?.size ?? 0;
}
```

Create the WebSocket endpoint. Create `src/routes/api/ws/+server.ts`:

```ts
import type { RequestHandler } from './$types';
import {
  addClient,
  removeClient,
  handleChatMessage,
  broadcast,
  type WsMessage
} from '$lib/server/ws';

// This is a simplified WebSocket handler.
// In production with SvelteKit 2.60+, use the handleWebSocket hook
// from hooks.server.ts (Lesson 17.6)

export const GET: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check for WebSocket upgrade
  const upgrade = request.headers.get('upgrade');
  if (upgrade?.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 });
  }

  // The actual WebSocket upgrade depends on the adapter.
  // With adapter-node, SvelteKit 2.60+ supports this natively.
  // See Lesson 17.6 for the production implementation.
  return new Response('WebSocket upgrade required', { status: 426 });
};
```

For development, we simulate WebSocket behavior through SSE and POST endpoints.

Create `src/routes/api/chat/[roomId]/messages/+server.ts`:

```ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { messages } from '$lib/server/db/schema';
import { generateId } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, params, locals }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { content } = await request.json();
  if (!content?.trim()) {
    return json({ error: 'Message cannot be empty' }, { status: 400 });
  }

  const messageId = generateId();
  const now = new Date();

  await db.insert(messages).values({
    id: messageId,
    roomId: params.roomId,
    userId: locals.user.id,
    content: content.trim(),
    createdAt: now
  });

  return json({
    id: messageId,
    roomId: params.roomId,
    userId: locals.user.id,
    content: content.trim(),
    createdAt: now.toISOString(),
    user: {
      id: locals.user.id,
      username: locals.user.username,
      avatarColor: locals.user.avatarColor
    }
  });
};
```

Create `src/routes/api/chat/[roomId]/stream/+server.ts` for SSE updates:

```ts
import type { RequestHandler } from './$types';

// SSE endpoint for real-time updates (Lesson 17.2)
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const roomId = params.roomId;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      // Send initial connection event
      send('connected', { roomId, userId: locals.user!.id });

      // Poll for new messages every 2 seconds
      // In production, use pub/sub or WebSocket (Lesson 17.8)
      let lastCheck = Date.now();

      const interval = setInterval(async () => {
        try {
          // This is a simplified polling approach.
          // Production would use database change notifications or WebSocket.
          send('heartbeat', { timestamp: Date.now() });
        } catch {
          // Silent — client will reconnect
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
};
```

---

## 7. WebSocket client connection manager

Create `src/lib/stores/chat.svelte.ts` — a reactive class that manages the connection to the chat room (Lesson 11.5):

```ts
export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarColor: string;
  };
  reactions: ChatReaction[];
  pending?: boolean; // Optimistic UI flag
}

export interface ChatReaction {
  emoji: string;
  users: string[];
}

export interface TypingUser {
  userId: string;
  username: string;
}

class ChatStore {
  messages = $state<ChatMessage[]>([]);
  typingUsers = $state<TypingUser[]>([]);
  onlineCount = $state(0);
  connected = $state(false);
  currentRoomId = $state('');

  private eventSource: EventSource | null = null;

  /**
   * Load initial message history and connect to SSE stream
   */
  async joinRoom(roomId: string) {
    this.currentRoomId = roomId;
    this.messages = [];
    this.typingUsers = [];

    // Fetch message history (Section 8)
    const res = await fetch(`/api/chat/${roomId}/history`);
    if (res.ok) {
      this.messages = await res.json();
    }

    // Connect to SSE stream (Lesson 17.3)
    this.eventSource = new EventSource(`/api/chat/${roomId}/stream`);

    this.eventSource.addEventListener('connected', () => {
      this.connected = true;
    });

    this.eventSource.addEventListener('new-message', (e) => {
      const msg: ChatMessage = JSON.parse(e.data);
      // Remove optimistic version if it exists
      this.messages = this.messages.filter((m) => !m.pending || m.id !== msg.id);
      this.messages = [...this.messages, msg];
    });

    this.eventSource.addEventListener('typing', (e) => {
      const data = JSON.parse(e.data);
      if (!this.typingUsers.some((u) => u.userId === data.userId)) {
        this.typingUsers = [...this.typingUsers, data];
      }
    });

    this.eventSource.addEventListener('stop-typing', (e) => {
      const data = JSON.parse(e.data);
      this.typingUsers = this.typingUsers.filter((u) => u.userId !== data.userId);
    });

    this.eventSource.onerror = () => {
      this.connected = false;
    };
  }

  /**
   * Send a message with optimistic UI (Lesson 11.10)
   */
  async sendMessage(content: string, currentUser: { id: string; username: string; avatarColor: string }) {
    const optimisticId = `optimistic-${Date.now()}`;

    // Add optimistic message immediately
    const optimistic: ChatMessage = {
      id: optimisticId,
      roomId: this.currentRoomId,
      userId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      user: currentUser,
      reactions: [],
      pending: true
    };

    this.messages = [...this.messages, optimistic];

    try {
      const res = await fetch(`/api/chat/${this.currentRoomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        const serverMsg: ChatMessage = await res.json();
        serverMsg.reactions = [];
        // Replace optimistic with server response
        this.messages = this.messages.map((m) =>
          m.id === optimisticId ? { ...serverMsg, pending: false } : m
        );
      } else {
        // Remove failed optimistic message
        this.messages = this.messages.filter((m) => m.id !== optimisticId);
      }
    } catch {
      this.messages = this.messages.filter((m) => m.id !== optimisticId);
    }
  }

  /**
   * Toggle a reaction on a message (Section 12)
   */
  toggleReaction(messageId: string, emoji: string, userId: string) {
    this.messages = this.messages.map((msg) => {
      if (msg.id !== messageId) return msg;

      const reactions = [...msg.reactions];
      const existing = reactions.find((r) => r.emoji === emoji);

      if (existing) {
        if (existing.users.includes(userId)) {
          existing.users = existing.users.filter((u) => u !== userId);
          if (existing.users.length === 0) {
            return { ...msg, reactions: reactions.filter((r) => r.emoji !== emoji) };
          }
        } else {
          existing.users = [...existing.users, userId];
        }
      } else {
        reactions.push({ emoji, users: [userId] });
      }

      return { ...msg, reactions };
    });
  }

  leaveRoom() {
    this.eventSource?.close();
    this.eventSource = null;
    this.connected = false;
    this.messages = [];
    this.typingUsers = [];
    this.currentRoomId = '';
  }
}

export const chat = new ChatStore();
```

**Architecture decision:** We chose a reactive class (Lesson 11.5) instead of context (Lesson 11.2) because the chat state needs to:
1. Survive page navigation between rooms
2. Be accessible from multiple components (message list, input box, sidebar)
3. Encapsulate the SSE/WebSocket connection lifecycle with methods

---

## 8. Message history from database

Create `src/routes/api/chat/[roomId]/history/+server.ts`:

```ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { messages, reactions } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Fetch last 100 messages with user and reactions (Lesson 16.6 — relations)
  const roomMessages = await db.query.messages.findMany({
    where: eq(messages.roomId, params.roomId),
    orderBy: [desc(messages.createdAt)],
    limit: 100,
    with: {
      user: true,
      reactions: {
        with: { user: true }
      }
    }
  });

  // Transform reactions into grouped format and reverse for chronological order
  const formatted = roomMessages
    .reverse()
    .map((msg) => {
      const groupedReactions = new Map<string, string[]>();

      for (const reaction of msg.reactions) {
        const existing = groupedReactions.get(reaction.emoji) ?? [];
        existing.push(reaction.user.username);
        groupedReactions.set(reaction.emoji, existing);
      }

      return {
        id: msg.id,
        roomId: msg.roomId,
        userId: msg.userId,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
        user: {
          id: msg.user.id,
          username: msg.user.username,
          avatarColor: msg.user.avatarColor
        },
        reactions: Array.from(groupedReactions, ([emoji, users]) => ({
          emoji,
          users
        }))
      };
    });

  return json(formatted);
};
```

---

## 9. Sending messages with optimistic UI

The optimistic UI pattern (Lesson 11.10) is already implemented in the `ChatStore.sendMessage()` method. The key insight: we add the message to the local `$state` array immediately with `pending: true`, then replace it with the server response when the POST completes.

Create the chat room page at `src/routes/chat/[roomId]/+page.server.ts`:

```ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { rooms } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, params.roomId)
  });

  if (!room) {
    error(404, { message: 'Room not found' });
  }

  return { room };
};
```

Create `src/routes/chat/[roomId]/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { chat } from '$lib/stores/chat.svelte';
  import { browser } from '$app/environment';
  import MessageList from '$lib/components/MessageList.svelte';
  import MessageInput from '$lib/components/MessageInput.svelte';
  import TypingIndicator from '$lib/components/TypingIndicator.svelte';

  let { data } = $props();

  // Join room on mount, leave on unmount (Lesson 2.11 — $effect cleanup)
  $effect(() => {
    if (!browser) return;
    chat.joinRoom(data.room.id);
    return () => chat.leaveRoom();
  });
</script>

<svelte:head>
  <title>#{data.room.name} — Chat</title>
</svelte:head>

<div class="chat-room">
  <header class="room-header">
    <h1>
      <span class="hash">#</span> {data.room.name}
    </h1>
    {#if data.room.description}
      <p class="room-description">{data.room.description}</p>
    {/if}
    {#if chat.connected}
      <span class="status-dot connected" aria-label="Connected"></span>
    {:else}
      <span class="status-dot disconnected" aria-label="Reconnecting..."></span>
    {/if}
  </header>

  <MessageList
    messages={chat.messages}
    currentUserId={data.user.id}
  />

  <TypingIndicator users={chat.typingUsers} />

  <MessageInput
    roomId={data.room.id}
    user={data.user}
  />
</div>

<style>
  @layer components {
    .chat-room {
      display: flex;
      flex-direction: column;
      block-size: 100%;
      overflow: hidden;
    }

    .room-header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      border-block-end: 1px solid var(--color-border);
      flex-shrink: 0;

      h1 {
        font-size: var(--text-lg);

        .hash {
          color: var(--color-text-muted);
        }
      }

      .room-description {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }
    }

    .status-dot {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      border-radius: var(--radius-full);
      margin-inline-start: auto;

      &.connected { background: var(--color-success); }
      &.disconnected { background: var(--color-warning); }
    }
  }
</style>
```

---

## 10. Typing indicators via SSE

Create `src/lib/components/TypingIndicator.svelte`:

```svelte
<script lang="ts">
  import type { TypingUser } from '$lib/stores/chat.svelte';

  interface Props {
    users: TypingUser[];
  }

  let { users }: Props = $props();

  let text = $derived.by(() => {
    if (users.length === 0) return '';
    if (users.length === 1) return `${users[0]!.username} is typing...`;
    if (users.length === 2) return `${users[0]!.username} and ${users[1]!.username} are typing...`;
    return `${users[0]!.username} and ${users.length - 1} others are typing...`;
  });
</script>

<div class="typing-indicator" aria-live="polite" aria-atomic="true">
  {#if text}
    <div class="typing-content">
      <span class="dots" aria-hidden="true">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </span>
      <span class="typing-text">{text}</span>
    </div>
  {/if}
</div>

<style>
  @layer components {
    .typing-indicator {
      min-block-size: 1.5rem;
      padding-inline: var(--space-lg);
      flex-shrink: 0;
    }

    .typing-content {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .dots {
      display: flex;
      gap: 3px;
    }

    .dot {
      inline-size: 4px;
      block-size: 4px;
      border-radius: var(--radius-full);
      background: var(--color-text-muted);
      animation: bounce 1.4s infinite ease-in-out;

      &:nth-child(2) { animation-delay: 0.16s; }
      &:nth-child(3) { animation-delay: 0.32s; }
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    .typing-text {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
  }
</style>
```

Typing notifications are sent by the input component and received via the SSE stream. The `$derived.by` pattern (Lesson 2.8) computes the display text from the array of typing users.

---

## 11. User presence — online/offline

Presence is tracked via the SSE connection. When a user connects to the stream, they are online. When they disconnect, they go offline. Create `src/lib/components/OnlineUsers.svelte`:

```svelte
<script lang="ts">
  interface Props {
    count: number;
  }

  let { count }: Props = $props();
</script>

<div class="online-users" aria-label="{count} users online">
  <span class="indicator" aria-hidden="true"></span>
  <span class="count">{count} online</span>
</div>

<style>
  @layer components {
    .online-users {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    .indicator {
      inline-size: 6px;
      block-size: 6px;
      border-radius: var(--radius-full);
      background: var(--color-success);
    }
  }
</style>
```

---

## 12. Message reactions with $state arrays

Reactions use `$state` arrays (Lesson 2.4) within the `ChatMessage` type. The `toggleReaction` method in `ChatStore` demonstrates how to update a nested array inside `$state`.

Create `src/lib/components/MessageReactions.svelte`:

```svelte
<script lang="ts">
  import type { ChatReaction } from '$lib/stores/chat.svelte';
  import { chat } from '$lib/stores/chat.svelte';

  interface Props {
    messageId: string;
    reactions: ChatReaction[];
    currentUserId: string;
  }

  let { messageId, reactions, currentUserId }: Props = $props();

  const availableEmojis = ['👍', '❤️', '😂', '🎉', '🤔', '👀'];
  let showPicker = $state(false);

  function toggle(emoji: string) {
    chat.toggleReaction(messageId, emoji, currentUserId);
    showPicker = false;
  }
</script>

<div class="reactions-container">
  <!-- Existing reactions -->
  {#if reactions.length > 0}
    <div class="reaction-badges">
      {#each reactions as reaction (reaction.emoji)}
        <button
          class="reaction-badge"
          class:active={reaction.users.includes(currentUserId)}
          onclick={() => toggle(reaction.emoji)}
          aria-label="{reaction.emoji} ({reaction.users.length})"
        >
          <span class="emoji">{reaction.emoji}</span>
          <span class="count">{reaction.users.length}</span>
        </button>
      {/each}
    </div>
  {/if}

  <!-- Add reaction button -->
  <div class="add-reaction">
    <button
      class="add-btn"
      onclick={() => { showPicker = !showPicker; }}
      aria-label="Add reaction"
      aria-expanded={showPicker}
    >
      +
    </button>

    {#if showPicker}
      <div class="emoji-picker" role="listbox" aria-label="Choose reaction">
        {#each availableEmojis as emoji}
          <button
            class="emoji-option"
            onclick={() => toggle(emoji)}
            role="option"
            aria-label={emoji}
          >
            {emoji}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  @layer components {
    .reactions-container {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      margin-block-start: var(--space-xs);
    }

    .reaction-badges {
      display: flex;
      gap: var(--space-xs);
    }

    .reaction-badge {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 2px var(--space-sm);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      cursor: pointer;
      font-size: var(--text-xs);
      transition: all var(--dur-fast) var(--ease-out);

      &.active {
        background: oklch(0.68 0.16 230 / 0.15);
        border-color: var(--color-primary);
      }

      &:hover {
        background: var(--color-surface-elevated);
      }
    }

    .emoji { font-size: 0.875rem; }
    .count { font-variant-numeric: tabular-nums; }

    .add-reaction {
      position: relative;
    }

    .add-btn {
      inline-size: 1.5rem;
      block-size: 1.5rem;
      display: grid;
      place-items: center;
      background: transparent;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-full);
      color: var(--color-text-muted);
      cursor: pointer;
      font-size: var(--text-xs);
      opacity: 0;
      transition: opacity var(--dur-fast) var(--ease-out);
    }

    /* Show on message hover — parent must have .message-bubble:hover */
    :global(.message-bubble:hover) .add-btn {
      opacity: 1;
    }

    .emoji-picker {
      position: absolute;
      inset-block-end: 100%;
      inset-inline-start: 0;
      display: flex;
      gap: var(--space-xs);
      padding: var(--space-sm);
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      z-index: 10;
    }

    .emoji-option {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.125rem;
      padding: var(--space-xs);
      border-radius: var(--radius-sm);

      &:hover {
        background: var(--color-surface);
      }
    }
  }
</style>
```

---

## 13. Scroll anchoring with $effect.pre

This is one of the most important UX details in a chat app. As new messages arrive, we need to keep the scroll position pinned to the bottom — but only if the user is already scrolled to the bottom. If they have scrolled up to read history, we should not force them back down.

`$effect.pre` (Lesson 2.10) runs before the DOM updates, which is exactly when we need to measure scroll position.

Create `src/lib/components/MessageList.svelte`:

```svelte
<script lang="ts">
  import type { ChatMessage } from '$lib/stores/chat.svelte';
  import MessageReactions from './MessageReactions.svelte';

  interface Props {
    messages: ChatMessage[];
    currentUserId: string;
  }

  let { messages, currentUserId }: Props = $props();

  let scrollContainer: HTMLElement | undefined = $state();
  let shouldAutoScroll = $state(true);

  // Before the DOM updates with new messages, check if we should auto-scroll.
  // $effect.pre runs BEFORE the DOM update (Lesson 2.10).
  $effect.pre(() => {
    // Read `messages` to establish dependency
    messages;

    if (!scrollContainer) return;

    // If user is near the bottom (within 100px), auto-scroll to new messages
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    shouldAutoScroll = scrollHeight - scrollTop - clientHeight < 100;
  });

  // After the DOM updates, scroll to bottom if needed
  $effect(() => {
    // Read `messages` to re-run when messages change
    messages;

    if (shouldAutoScroll && scrollContainer) {
      // Use requestAnimationFrame to ensure DOM has rendered
      requestAnimationFrame(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      });
    }
  });

  // Group consecutive messages from the same user
  let groupedMessages = $derived.by(() => {
    const groups: { userId: string; messages: ChatMessage[] }[] = [];

    for (const msg of messages) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.userId === msg.userId) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ userId: msg.userId, messages: [msg] });
      }
    }

    return groups;
  });

  function formatTime(dateStr: string): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr));
  }
</script>

<div
  class="message-list"
  bind:this={scrollContainer}
  role="log"
  aria-label="Chat messages"
  aria-live="polite"
  tabindex={0}
>
  {#each groupedMessages as group}
    <div class="message-group">
      {#each group.messages as msg, i (msg.id)}
        {@const isOwn = msg.userId === currentUserId}
        {@const isFirst = i === 0}

        <div
          class="message-row"
          class:own={isOwn}
          class:pending={msg.pending}
        >
          {#if isFirst && !isOwn}
            <span
              class="avatar"
              style:background={msg.user.avatarColor}
              aria-hidden="true"
            >
              {msg.user.username.charAt(0).toUpperCase()}
            </span>
          {:else if !isOwn}
            <span class="avatar-spacer"></span>
          {/if}

          <div class="message-bubble">
            {#if isFirst}
              <div class="message-header">
                <strong class="sender-name">{msg.user.username}</strong>
                <time class="message-time" datetime={msg.createdAt}>
                  {formatTime(msg.createdAt)}
                </time>
              </div>
            {/if}

            <p class="message-content">{msg.content}</p>

            <MessageReactions
              messageId={msg.id}
              reactions={msg.reactions}
              {currentUserId}
            />
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-chat">
      <p>No messages yet. Say hello!</p>
    </div>
  {/each}
</div>

<style>
  @layer components {
    .message-list {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-md) var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .message-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .message-group + .message-group {
      margin-block-start: var(--space-md);
    }

    .message-row {
      display: flex;
      gap: var(--space-sm);
      align-items: flex-start;
      max-inline-size: 75%;

      &.own {
        align-self: flex-end;
        flex-direction: row-reverse;
      }

      &.pending {
        opacity: 0.6;
      }
    }

    .avatar {
      display: grid;
      place-items: center;
      inline-size: 2rem;
      block-size: 2rem;
      border-radius: var(--radius-full);
      color: oklch(1 0 0);
      font-size: var(--text-xs);
      font-weight: 700;
      flex-shrink: 0;
    }

    .avatar-spacer {
      inline-size: 2rem;
      flex-shrink: 0;
    }

    .message-bubble {
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-lg);
      background: var(--color-bubble-other);
      min-inline-size: 3rem;
      position: relative;

      .own & {
        background: var(--color-bubble-own);
      }
    }

    .message-header {
      display: flex;
      align-items: baseline;
      gap: var(--space-sm);
      margin-block-end: 2px;
    }

    .sender-name {
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .message-time {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    .message-content {
      font-size: var(--text-base);
      line-height: 1.5;
      word-break: break-word;
    }

    .empty-chat {
      flex: 1;
      display: grid;
      place-items: center;
      color: var(--color-text-muted);
    }
  }
</style>
```

**Why $effect.pre instead of $effect?** As you learned in Lesson 2.10, `$effect.pre` runs before the DOM updates. This is critical for scroll anchoring: we need to measure the scroll position *before* new messages are added to the DOM. If we measured in `$effect` (after the DOM update), the scroll position would already reflect the new content and our "near bottom" check would be inaccurate.

---

## 14. Keyboard accessibility

Create `src/lib/components/MessageInput.svelte` with full keyboard support (Lesson 5.10):

```svelte
<script lang="ts">
  import { chat } from '$lib/stores/chat.svelte';

  interface Props {
    roomId: string;
    user: {
      id: string;
      username: string;
      avatarColor: string;
    };
  }

  let { roomId, user }: Props = $props();

  let message = $state('');
  let inputEl: HTMLTextAreaElement | undefined = $state();
  let sending = $state(false);

  async function sendMessage() {
    const content = message.trim();
    if (!content || sending) return;

    sending = true;
    message = '';

    await chat.sendMessage(content, user);

    sending = false;

    // Return focus to input after sending (Lesson 12.8 — focus management)
    inputEl?.focus();
  }

  // Handle keyboard events (Lesson 5.10 — keyboard navigation)
  function handleKeydown(e: KeyboardEvent) {
    // Enter sends the message (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // Shift+Enter adds a newline (default textarea behavior)
  }

  // Notify typing status (Lesson 5.7 — debouncing)
  let typingTimeout: ReturnType<typeof setTimeout> | undefined;

  function handleInput() {
    // Send typing indicator
    fetch(`/api/chat/${roomId}/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ typing: true })
    }).catch(() => { /* silent */ });

    // Clear previous timeout and set a new one
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      fetch(`/api/chat/${roomId}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typing: false })
      }).catch(() => { /* silent */ });
    }, 2000);
  }
</script>

<div class="message-input-container">
  <div class="input-wrapper">
    <textarea
      bind:this={inputEl}
      bind:value={message}
      oninput={handleInput}
      onkeydown={handleKeydown}
      placeholder="Type a message..."
      rows={1}
      class="message-textarea"
      aria-label="Message input"
      disabled={!chat.connected}
    ></textarea>

    <button
      class="send-btn"
      onclick={sendMessage}
      disabled={!message.trim() || sending || !chat.connected}
      aria-label="Send message"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>

  <p class="input-hint">
    Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for new line
  </p>
</div>

<style>
  @layer components {
    .message-input-container {
      padding: var(--space-md) var(--space-lg);
      border-block-start: 1px solid var(--color-border);
      flex-shrink: 0;
    }

    .input-wrapper {
      display: flex;
      gap: var(--space-sm);
      align-items: flex-end;
    }

    .message-textarea {
      flex: 1;
      padding: var(--space-sm) var(--space-md);
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text);
      resize: none;
      min-block-size: 2.5rem;
      max-block-size: 8rem;
      line-height: 1.5;
      transition: border-color var(--dur-fast) var(--ease-out);

      &:focus {
        border-color: var(--color-primary);
        outline: none;
      }

      &::placeholder {
        color: var(--color-text-muted);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .send-btn {
      display: grid;
      place-items: center;
      inline-size: 2.5rem;
      block-size: 2.5rem;
      background: var(--color-primary);
      color: oklch(1 0 0);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background var(--dur-fast) var(--ease-out);
      flex-shrink: 0;

      &:hover:not(:disabled) {
        background: var(--color-primary-hover);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .input-hint {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      margin-block-start: var(--space-xs);

      kbd {
        padding: 0 var(--space-xs);
        background: var(--color-surface-elevated);
        border: 1px solid var(--color-border);
        border-radius: 3px;
        font-size: var(--text-xs);
        font-family: inherit;
      }
    }
  }
</style>
```

### Accessibility features implemented (Lesson 12.8):

- **`role="log"`** on the message list — tells screen readers this is a log region
- **`aria-live="polite"`** — new messages are announced without interrupting the current reading
- **`aria-label`** on all interactive elements — the send button, input, emoji picker
- **`role="listbox"` and `role="option"`** on the emoji picker
- **Keyboard navigation** — Enter to send, Shift+Enter for newline, Escape to close emoji picker
- **Focus management** — focus returns to the input after sending a message
- **`tabindex={0}`** on the scroll container — allows keyboard scrolling
- **`<kbd>` elements** — keyboard shortcut hints styled appropriately

---

## 15. Deployment

The chat app requires a persistent server for WebSocket/SSE connections. Use `adapter-node`:

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      out: 'build'
    })
  }
};
```

```bash
pnpm build
node build/index.js
```

For production, consider:
- **Database**: Switch from `better-sqlite3` to Turso/LibSQL or PostgreSQL
- **WebSocket scaling**: Use Redis pub/sub for multi-server broadcasting (Lesson 17.8)
- **Presence**: Use Redis for tracking online users across servers

### File tree — final

```
realtime-chat/
├── src/
│   ├── app.css
│   ├── app.html
│   ├── app.d.ts
│   ├── hooks.server.ts
│   ├── lib/
│   │   ├── components/
│   │   │   ├── MessageInput.svelte
│   │   │   ├── MessageList.svelte
│   │   │   ├── MessageReactions.svelte
│   │   │   ├── OnlineUsers.svelte
│   │   │   └── TypingIndicator.svelte
│   │   ├── server/
│   │   │   ├── auth.ts
│   │   │   ├── db/
│   │   │   │   ├── index.ts
│   │   │   │   └── schema.ts
│   │   │   └── ws.ts
│   │   └── stores/
│   │       └── chat.svelte.ts
│   └── routes/
│       ├── +layout.svelte
│       ├── register/
│       │   ├── +page.svelte
│       │   └── +page.server.ts
│       ├── login/
│       │   ├── +page.svelte
│       │   └── +page.server.ts
│       ├── chat/
│       │   ├── +layout.svelte
│       │   ├── +layout.server.ts
│       │   └── [roomId]/
│       │       ├── +page.svelte
│       │       └── +page.server.ts
│       └── api/
│           └── chat/
│               └── [roomId]/
│                   ├── history/
│                   │   └── +server.ts
│                   ├── messages/
│                   │   └── +server.ts
│                   └── stream/
│                       └── +server.ts
├── drizzle/
├── drizzle.config.ts
├── svelte.config.js
└── package.json
```

---

## 16. Final result

You have a complete real-time chat application with:

- **WebSocket/SSE communication** — real-time message delivery
- **Session-based auth** — registration, login, logout with cookie sessions
- **Message history** — last 100 messages loaded from SQLite database
- **Optimistic UI** — messages appear instantly, then sync with server
- **Typing indicators** — animated dots when other users are typing
- **User presence** — online/offline status tracking
- **Message reactions** — emoji reactions with toggle behavior
- **Scroll anchoring** — auto-scroll to bottom for new messages, preserved position when reading history
- **Keyboard accessibility** — Enter to send, ARIA roles, focus management

### What to test

1. Register two accounts in separate browser windows
2. Send messages and watch them appear in real-time
3. Verify the optimistic message shows immediately (slightly transparent)
4. Check that the typing indicator appears when the other user types
5. Add a reaction to a message and toggle it off
6. Scroll up in the message history, then verify new messages do not force-scroll
7. Scroll back to the bottom and verify auto-scroll resumes
8. Test keyboard navigation — Tab through elements, Enter to send

---

## 17. What you practiced

- **$state with primitives** — message text, boolean flags (Module 2, Lesson 2.2)
- **$state with arrays** — messages array, reactions array (Module 2, Lesson 2.4)
- **$derived** — computed typing indicator text, message grouping (Module 2, Lesson 2.7)
- **$derived.by** — complex message grouping logic, typing text (Module 2, Lesson 2.8)
- **$effect** — SSE connection lifecycle, scroll-to-bottom (Module 2, Lesson 2.9)
- **$effect.pre** — measuring scroll position before DOM update (Module 2, Lesson 2.10)
- **$effect cleanup** — disconnecting from SSE on unmount (Module 2, Lesson 2.11)
- **Event handlers** — onclick, onkeydown, oninput (Module 5, Lesson 5.1)
- **Keyboard navigation** — Enter/Shift+Enter, focus management (Module 5, Lesson 5.10)
- **Debouncing** — typing indicator timeout (Module 5, Lesson 5.7)
- **Closures in event handlers** — reaction toggles, message context (Module 5, Lesson 5.6)
- **.svelte.ts files** — ChatStore reactive class (Module 11, Lesson 11.3)
- **Reactive classes with runes** — encapsulated chat state (Module 11, Lesson 11.5)
- **Optimistic UI** — immediate message display before server confirmation (Module 11, Lesson 11.10)
- **Accessibility** — ARIA roles, keyboard nav, focus management (Module 12, Lesson 12.8)
- **Authentication** — registration, login, sessions (Module 15, Lessons 15.3, 15.4)
- **Protected routes** — layout-level auth guard (Module 15, Lesson 15.5)
- **Drizzle schema** — users, rooms, messages, reactions with relations (Module 16, Lessons 16.3, 16.6)
- **Drizzle queries** — message history with joins (Module 16, Lesson 16.5)
- **Database in load functions** — room data, message history (Module 16, Lesson 16.7)
- **SSE server** — real-time event streaming (Module 17, Lesson 17.2)
- **Consuming SSE** — EventSource in reactive class (Module 17, Lesson 17.3)
- **WebSocket fundamentals** — full-duplex communication design (Module 17, Lesson 17.5)
- **WebSocket in SvelteKit** — server handler pattern (Module 17, Lesson 17.6)
- **Scaling patterns** — pub/sub for multi-server (Module 17, Lesson 17.8)
- **PE7 CSS** — @layer architecture, OKLCH tokens (Module 1, Lesson 1.5; Module 6)
