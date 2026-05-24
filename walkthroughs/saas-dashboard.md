# Build a SaaS Analytics Dashboard — Complete Walkthrough

> **Time:** ~10 hours | **Modules referenced:** M2, M7, M9A, M9B, M11, M12, M13, M15, M16, M17, M22
> **What you'll build:** A production-grade analytics dashboard with authentication, live-updating metric widgets, an event log with sorting/filtering/pagination, GSAP-animated counters, real-time updates via SSE, and a marketing landing page with full SEO. The entire app deploys to Vercel Edge.
> **Prerequisites:** Complete through Module 17 (Real-Time Communication)

## Table of contents

1. [Project setup](#1-project-setup)
2. [PE7 CSS foundation and design tokens](#2-pe7-css-foundation-and-design-tokens)
3. [Database schema with Drizzle](#3-database-schema-with-drizzle)
4. [Authentication — registration and login](#4-authentication--registration-and-login)
5. [Protected route layout](#5-protected-route-layout)
6. [Dashboard page scaffolding](#6-dashboard-page-scaffolding)
7. [Remote functions for dashboard data](#7-remote-functions-for-dashboard-data)
8. [Metric cards with GSAP-animated counters](#8-metric-cards-with-gsap-animated-counters)
9. [Event log with TanStack Table](#9-event-log-with-tanstack-table)
10. [Real-time updates via SSE](#10-real-time-updates-via-sse)
11. [Error boundaries around each widget](#11-error-boundaries-around-each-widget)
12. [Marketing landing page](#12-marketing-landing-page)
13. [SEO for marketing pages](#13-seo-for-marketing-pages)
14. [Performance optimization](#14-performance-optimization)
15. [Deployment to Vercel Edge](#15-deployment-to-vercel-edge)
16. [Final result](#16-final-result)
17. [What you practiced](#17-what-you-practiced)

---

## 1. Project setup

Start by scaffolding a new SvelteKit project. We use `pnpm` exclusively throughout this course (as established in Lesson 1.2).

```bash
pnpm create svelte@latest saas-dashboard
```

Select these options:
- **Template:** Skeleton project
- **Type checking:** Yes, using TypeScript
- **Additional options:** Add Prettier, Add ESLint

```bash
cd saas-dashboard
pnpm install
```

Now install every dependency we will need throughout this walkthrough:

```bash
# Database
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3

# Auth
pnpm add @node-rs/argon2 oslo

# Validation
pnpm add valibot

# Animation
pnpm add gsap

# Table
pnpm add @tanstack/table-core @tanstack/svelte-table

# Deployment
pnpm add -D @sveltejs/adapter-vercel
```

Configure TypeScript strict mode in `tsconfig.json`:

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false,
    "moduleResolution": "bundler"
  }
}
```

Enable remote functions in `svelte.config.js` (as introduced in Lesson 9B.1):

```js
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      runtime: 'edge'
    })
  }
};

export default config;
```

### File tree after step 1

```
saas-dashboard/
├── src/
│   ├── app.html
│   ├── app.d.ts
│   └── routes/
│       └── +page.svelte
├── static/
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
└── pnpm-lock.yaml
```

---

## 2. PE7 CSS foundation and design tokens

Before writing any components, we set up the PE7 CSS architecture you learned in Lesson 1.5. The six-layer `@layer` system gives us predictable specificity across the entire application.

Create `src/app.css`:

```css
/* PE7 layer order declaration — lowest to highest specificity */
@layer reset, tokens, base, layout, components, utilities;

/* ── Reset ────────────────────────────────────────────── */
@layer reset {
  *,
  *::before,
  *::after {
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
}

/* ── Tokens ───────────────────────────────────────────── */
@layer tokens {
  :root {
    /* Colors — OKLCH for perceptual uniformity (Lesson 6.2) */
    --color-primary: oklch(0.65 0.20 250);
    --color-primary-hover: oklch(0.60 0.22 250);
    --color-secondary: oklch(0.70 0.15 180);
    --color-surface: oklch(0.16 0.01 260);
    --color-surface-alt: oklch(0.20 0.015 260);
    --color-surface-elevated: oklch(0.24 0.02 260);
    --color-text: oklch(0.93 0.01 260);
    --color-text-muted: oklch(0.70 0.02 260);
    --color-border: oklch(0.35 0.02 260);
    --color-success: oklch(0.72 0.19 145);
    --color-warning: oklch(0.80 0.18 85);
    --color-error: oklch(0.65 0.22 25);

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;

    /* Typography — fluid with clamp (Lesson 1.6) */
    --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
    --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
    --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
    --text-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
    --text-xl: clamp(1.15rem, 1rem + 0.75vw, 1.25rem);
    --text-2xl: clamp(1.4rem, 1.1rem + 1.5vw, 1.75rem);
    --text-3xl: clamp(1.8rem, 1.4rem + 2vw, 2.25rem);
    --text-4xl: clamp(2.2rem, 1.6rem + 3vw, 3rem);

    /* Motion */
    --dur-instant: 100ms;
    --dur-fast: 200ms;
    --dur-normal: 300ms;
    --dur-slow: 500ms;
    --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
    --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
    --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);

    /* Radius */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.15);
    --shadow-md: 0 4px 6px oklch(0 0 0 / 0.2);
    --shadow-lg: 0 10px 25px oklch(0 0 0 / 0.3);

    /* Layout */
    --content-max: 72rem;
    --sidebar-width: 16rem;
  }
}

/* ── Base ─────────────────────────────────────────────── */
@layer base {
  body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: var(--text-base);
    line-height: 1.6;
    color: var(--color-text);
    background: var(--color-surface);
  }

  h1, h2, h3 {
    line-height: 1.2;
    text-wrap: balance;
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--dur-fast) var(--ease-out);

    &:hover {
      color: var(--color-primary-hover);
    }
  }

  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

/* ── Layout ───────────────────────────────────────────── */
@layer layout {
  .page-container {
    display: grid;
    grid-template-columns: var(--sidebar-width) 1fr;
    min-block-size: 100dvh;

    @media (width < 768px) {
      grid-template-columns: 1fr;
    }
  }

  .main-content {
    padding: var(--space-xl);
    max-inline-size: var(--content-max);
  }
}

/* ── Utilities ────────────────────────────────────────── */
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

  .visually-hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
}
```

Import it in `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

{@render children()}
```

**Why OKLCH?** As you learned in Lesson 6.2, OKLCH provides perceptual uniformity — a lightness of 0.65 looks the same "bright" regardless of the hue. This is critical for a dashboard where success/warning/error colors need to feel equally prominent.

---

## 3. Database schema with Drizzle

We use Drizzle ORM with SQLite, exactly as taught in Lessons 16.2 and 16.3. SQLite is perfect for this walkthrough because it requires zero external services — `better-sqlite3` runs in-process.

Create `src/lib/server/db/schema.ts`:

```ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
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

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'page_view' | 'signup' | 'purchase' | 'click'
  source: text('source').notNull(), // 'web' | 'mobile' | 'api'
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  revenue: real('revenue').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});

export const metrics = sqliteTable('metrics', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // 'total_revenue' | 'active_users' | 'conversion_rate' | 'page_views'
  value: real('value').notNull(),
  previousValue: real('previous_value'),
  recordedAt: integer('recorded_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});

// Type exports for use throughout the app
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Metric = typeof metrics.$inferSelect;
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

Create the Drizzle configuration at `drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'local.db'
  }
});
```

Generate and run the initial migration (Lesson 16.4):

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

Create `src/lib/server/db/seed.ts` to populate test data:

```ts
import { db } from './index';
import { users, events, metrics } from './schema';
import { generateId } from '../auth/utils';

const EVENT_TYPES = ['page_view', 'signup', 'purchase', 'click'] as const;
const SOURCES = ['web', 'mobile', 'api'] as const;

export async function seed() {
  const userId = generateId();

  // Create a demo user
  await db.insert(users).values({
    id: userId,
    email: 'demo@example.com',
    passwordHash: 'seeded-not-a-real-hash',
    name: 'Demo User'
  });

  // Create 200 random events
  const eventValues = Array.from({ length: 200 }, () => ({
    id: generateId(),
    userId,
    type: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]!,
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)]!,
    revenue: Math.random() > 0.7 ? Math.round(Math.random() * 500 * 100) / 100 : 0,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000))
  }));

  await db.insert(events).values(eventValues);

  // Create current metric snapshots
  await db.insert(metrics).values([
    { id: generateId(), userId, name: 'total_revenue', value: 48250.75, previousValue: 42100.50 },
    { id: generateId(), userId, name: 'active_users', value: 2847, previousValue: 2531 },
    { id: generateId(), userId, name: 'conversion_rate', value: 3.24, previousValue: 2.89 },
    { id: generateId(), userId, name: 'page_views', value: 184329, previousValue: 167854 }
  ]);

  console.log('Seeded database with demo data.');
}
```

### File tree after step 3

```
saas-dashboard/
├── src/
│   ├── app.css
│   ├── app.html
│   ├── app.d.ts
│   ├── lib/
│   │   └── server/
│   │       └── db/
│   │           ├── index.ts
│   │           ├── schema.ts
│   │           └── seed.ts
│   └── routes/
│       ├── +layout.svelte
│       └── +page.svelte
├── drizzle/
│   └── 0000_*.sql
├── drizzle.config.ts
├── svelte.config.js
├── tsconfig.json
└── package.json
```

---

## 4. Authentication — registration and login

We build auth from scratch, exactly as taught in Module 15. No magic libraries — you understand every line.

### Auth utilities

Create `src/lib/server/auth/utils.ts`:

```ts
import { hash, verify } from '@node-rs/argon2';
import { db } from '../db';
import { sessions, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export function generateId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });
}

export async function verifyPassword(
  hashedPassword: string,
  password: string
): Promise<boolean> {
  return await verify(hashedPassword, password);
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt
  });

  return sessionId;
}

export async function validateSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
```

### Server hooks for auth

Create `src/hooks.server.ts` (Lesson 15.2 — SvelteKit hooks for auth):

```ts
import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth/utils';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session');

  if (sessionId) {
    const user = await validateSession(sessionId);
    event.locals.user = user;
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};
```

Update `src/app.d.ts` to type `locals`:

```ts
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email: string;
        name: string;
      } | null;
    }
  }
}

export {};
```

### Registration page

Create `src/routes/(auth)/register/+page.svelte`:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
</script>

<svelte:head>
  <title>Register — SaaS Dashboard</title>
</svelte:head>

<div class="auth-page">
  <div class="auth-card">
    <h1>Create your account</h1>
    <p class="subtitle">Start tracking your analytics in minutes.</p>

    <form method="POST" use:enhance>
      {#if form?.error}
        <div class="error-banner" role="alert">
          {form.error}
        </div>
      {/if}

      <label>
        <span>Full name</span>
        <input
          type="text"
          name="name"
          required
          minlength={2}
          value={form?.name ?? ''}
          autocomplete="name"
        />
      </label>

      <label>
        <span>Email</span>
        <input
          type="email"
          name="email"
          required
          value={form?.email ?? ''}
          autocomplete="email"
        />
      </label>

      <label>
        <span>Password</span>
        <input
          type="password"
          name="password"
          required
          minlength={8}
          autocomplete="new-password"
        />
      </label>

      <button type="submit">Create account</button>
    </form>

    <p class="alt-action">
      Already have an account? <a href="/login">Sign in</a>
    </p>
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
      inline-size: min(100%, 24rem);
      padding: var(--space-2xl);
      background: var(--color-surface-alt);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);

      h1 {
        font-size: var(--text-2xl);
        margin-block-end: var(--space-xs);
      }

      .subtitle {
        color: var(--color-text-muted);
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
      font-weight: 500;
    }

    input {
      padding: var(--space-sm) var(--space-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      transition: border-color var(--dur-fast) var(--ease-out);

      &:focus {
        border-color: var(--color-primary);
      }
    }

    button {
      padding: var(--space-sm) var(--space-lg);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      transition: background var(--dur-fast) var(--ease-out);

      &:hover {
        background: var(--color-primary-hover);
      }
    }

    .error-banner {
      padding: var(--space-sm) var(--space-md);
      background: oklch(0.25 0.05 25);
      color: var(--color-error);
      border: 1px solid var(--color-error);
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

Create `src/routes/(auth)/register/+page.server.ts`:

```ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateId, hashPassword, createSession } from '$lib/server/auth/utils';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const name = data.get('name')?.toString().trim() ?? '';
    const email = data.get('email')?.toString().trim().toLowerCase() ?? '';
    const password = data.get('password')?.toString() ?? '';

    // Server-side validation (Lesson 10.6)
    if (name.length < 2) {
      return fail(400, { error: 'Name must be at least 2 characters.', name, email });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, { error: 'Please enter a valid email address.', name, email });
    }
    if (password.length < 8) {
      return fail(400, { error: 'Password must be at least 8 characters.', name, email });
    }

    // Check for existing user
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return fail(400, { error: 'An account with this email already exists.', name, email });
    }

    // Create user
    const userId = generateId();
    const passwordHash = await hashPassword(password);

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash,
      name
    });

    // Create session and set cookie (Lesson 15.4)
    const sessionId = await createSession(userId);
    cookies.set('session', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    redirect(303, '/dashboard');
  }
};
```

### Login page

Create `src/routes/(auth)/login/+page.svelte`:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
</script>

<svelte:head>
  <title>Sign in — SaaS Dashboard</title>
</svelte:head>

<div class="auth-page">
  <div class="auth-card">
    <h1>Welcome back</h1>
    <p class="subtitle">Sign in to your analytics dashboard.</p>

    <form method="POST" use:enhance>
      {#if form?.error}
        <div class="error-banner" role="alert">
          {form.error}
        </div>
      {/if}

      <label>
        <span>Email</span>
        <input
          type="email"
          name="email"
          required
          value={form?.email ?? ''}
          autocomplete="email"
        />
      </label>

      <label>
        <span>Password</span>
        <input
          type="password"
          name="password"
          required
          autocomplete="current-password"
        />
      </label>

      <button type="submit">Sign in</button>
    </form>

    <p class="alt-action">
      Don't have an account? <a href="/register">Create one</a>
    </p>
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
      inline-size: min(100%, 24rem);
      padding: var(--space-2xl);
      background: var(--color-surface-alt);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);

      h1 {
        font-size: var(--text-2xl);
        margin-block-end: var(--space-xs);
      }

      .subtitle {
        color: var(--color-text-muted);
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
      font-weight: 500;
    }

    input {
      padding: var(--space-sm) var(--space-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      transition: border-color var(--dur-fast) var(--ease-out);

      &:focus {
        border-color: var(--color-primary);
      }
    }

    button {
      padding: var(--space-sm) var(--space-lg);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      transition: background var(--dur-fast) var(--ease-out);

      &:hover {
        background: var(--color-primary-hover);
      }
    }

    .error-banner {
      padding: var(--space-sm) var(--space-md);
      background: oklch(0.25 0.05 25);
      color: var(--color-error);
      border: 1px solid var(--color-error);
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

Create `src/routes/(auth)/login/+page.server.ts`:

```ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession } from '$lib/server/auth/utils';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString().trim().toLowerCase() ?? '';
    const password = data.get('password')?.toString() ?? '';

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required.', email });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return fail(400, { error: 'Invalid email or password.', email });
    }

    const validPassword = await verifyPassword(user.passwordHash, password);
    if (!validPassword) {
      return fail(400, { error: 'Invalid email or password.', email });
    }

    const sessionId = await createSession(user.id);
    cookies.set('session', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 30 * 24 * 60 * 60
    });

    redirect(303, '/dashboard');
  }
};
```

### Logout action

Create `src/routes/(auth)/logout/+page.server.ts` (Lesson 15.6):

```ts
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { invalidateSession } from '$lib/server/auth/utils';

export const actions: Actions = {
  default: async ({ cookies }) => {
    const sessionId = cookies.get('session');
    if (sessionId) {
      await invalidateSession(sessionId);
    }
    cookies.delete('session', { path: '/' });
    redirect(303, '/login');
  }
};
```

---

## 5. Protected route layout

We use a route group `(dashboard)` to protect all dashboard routes. This pattern comes from Lesson 15.5 — every page inside this group requires authentication.

Create `src/routes/(dashboard)/+layout.server.ts`:

```ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    redirect(303, '/login');
  }

  return {
    user: locals.user
  };
};
```

Create `src/routes/(dashboard)/+layout.svelte`:

```svelte
<script lang="ts">
  import type { LayoutData } from './$types';

  let { data, children } = $props();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/events', label: 'Events', icon: '📋' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' }
  ] as const;
</script>

<div class="page-container">
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>SaaS Analytics</h2>
    </div>

    <nav aria-label="Main navigation">
      <ul>
        {#each navItems as item}
          <li>
            <a href={item.href} aria-current={undefined}>
              <span class="icon">{item.icon}</span>
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <span class="user-name">{data.user.name}</span>
        <span class="user-email">{data.user.email}</span>
      </div>
      <form method="POST" action="/logout">
        <button type="submit">Sign out</button>
      </form>
    </div>
  </aside>

  <main class="main-content">
    {@render children()}
  </main>
</div>

<style>
  @layer components {
    .sidebar {
      background: var(--color-surface-alt);
      border-inline-end: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      padding: var(--space-lg);

      @media (width < 768px) {
        display: none;
      }
    }

    .sidebar-header {
      padding-block-end: var(--space-xl);
      border-block-end: 1px solid var(--color-border);
      margin-block-end: var(--space-lg);

      h2 {
        font-size: var(--text-lg);
        color: var(--color-primary);
      }
    }

    nav ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    nav a {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      transition: all var(--dur-fast) var(--ease-out);

      &:hover {
        background: var(--color-surface-elevated);
        color: var(--color-text);
      }

      &[aria-current='page'] {
        background: oklch(0.65 0.20 250 / 0.15);
        color: var(--color-primary);
      }
    }

    .sidebar-footer {
      margin-block-start: auto;
      padding-block-start: var(--space-lg);
      border-block-start: 1px solid var(--color-border);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      margin-block-end: var(--space-sm);
    }

    .user-name {
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .user-email {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    .sidebar-footer button {
      inline-size: 100%;
      padding: var(--space-xs) var(--space-md);
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      cursor: pointer;
      transition: all var(--dur-fast) var(--ease-out);

      &:hover {
        background: var(--color-surface-elevated);
        color: var(--color-text);
      }
    }
  }
</style>
```

---

## 6. Dashboard page scaffolding

Create `src/routes/(dashboard)/dashboard/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import MetricCard from '$lib/components/MetricCard.svelte';
  import EventTable from '$lib/components/EventTable.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title>Dashboard — SaaS Analytics</title>
</svelte:head>

<div class="dashboard">
  <header class="dashboard-header">
    <h1>Dashboard</h1>
    <p class="subtitle">Welcome back, {data.user.name}.</p>
  </header>

  <section class="metrics-grid" aria-label="Key metrics">
    {#each data.metrics as metric}
      <svelte:boundary>
        <MetricCard {metric} />
        {#snippet failed(error)}
          <div class="widget-error" role="alert">
            <p>Failed to load metric</p>
          </div>
        {/snippet}
      </svelte:boundary>
    {/each}
  </section>

  <section class="events-section" aria-label="Recent events">
    <h2>Recent Events</h2>
    <svelte:boundary>
      <EventTable events={data.recentEvents} />
      {#snippet failed(error)}
        <div class="widget-error" role="alert">
          <p>Failed to load event table</p>
        </div>
      {/snippet}
    </svelte:boundary>
  </section>
</div>

<style>
  @layer components {
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: var(--space-2xl);
    }

    .dashboard-header {
      h1 {
        font-size: var(--text-3xl);
        margin-block-end: var(--space-xs);
      }

      .subtitle {
        color: var(--color-text-muted);
        font-size: var(--text-lg);
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      gap: var(--space-lg);
    }

    .events-section {
      h2 {
        font-size: var(--text-xl);
        margin-block-end: var(--space-lg);
      }
    }

    .widget-error {
      padding: var(--space-xl);
      background: var(--color-surface-alt);
      border: 1px dashed var(--color-error);
      border-radius: var(--radius-md);
      color: var(--color-error);
      text-align: center;
    }
  }
</style>
```

Create `src/routes/(dashboard)/dashboard/+page.server.ts`:

```ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { events, metrics } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();

  const [userMetrics, recentEvents] = await Promise.all([
    db
      .select()
      .from(metrics)
      .where(eq(metrics.userId, user.id))
      .orderBy(metrics.name),
    db
      .select()
      .from(events)
      .where(eq(events.userId, user.id))
      .orderBy(desc(events.createdAt))
      .limit(50)
  ]);

  return {
    metrics: userMetrics,
    recentEvents
  };
};
```

---

## 7. Remote functions for dashboard data

Now we add remote functions for live dashboard widget data. This is the pattern from Lesson 9B.4 — `query.batch()` lets us fetch multiple pieces of data in a single round-trip.

Create `src/lib/server/dashboard.remote.ts`:

```ts
import { query } from '$lib/server/remote';
import { db } from '$lib/server/db';
import { events, metrics } from '$lib/server/db/schema';
import { eq, sql, desc, count, sum } from 'drizzle-orm';

export const getMetricsSummary = query(async (userId: string) => {
  const results = await db
    .select()
    .from(metrics)
    .where(eq(metrics.userId, userId));

  return results.map((m) => ({
    name: m.name,
    value: m.value,
    previousValue: m.previousValue,
    changePercent: m.previousValue
      ? ((m.value - m.previousValue) / m.previousValue) * 100
      : 0
  }));
});

export const getRevenueByDay = query(async (userId: string, days: number = 7) => {
  const since = new Date(Date.now() - days * 86400000);

  const results = await db
    .select({
      date: sql<string>`date(${events.createdAt}, 'unixepoch')`,
      total: sum(events.revenue)
    })
    .from(events)
    .where(eq(events.userId, userId))
    .groupBy(sql`date(${events.createdAt}, 'unixepoch')`)
    .orderBy(sql`date(${events.createdAt}, 'unixepoch')`);

  return results;
});

export const getEventCounts = query(async (userId: string) => {
  const results = await db
    .select({
      type: events.type,
      count: count()
    })
    .from(events)
    .where(eq(events.userId, userId))
    .groupBy(events.type);

  return results;
});

export const getRecentActivity = query(async (userId: string, limit: number = 20) => {
  return await db
    .select()
    .from(events)
    .where(eq(events.userId, userId))
    .orderBy(desc(events.createdAt))
    .limit(limit);
});
```

**Architecture decision:** We chose remote functions here instead of traditional `load()` functions because the dashboard widgets need to refresh independently. With `load()`, you would invalidate the entire page to update one widget. With remote functions, each widget can call `query.batch()` to fetch only its own data. This is exactly the trade-off discussed in Lesson 9B.10.

---

## 8. Metric cards with GSAP-animated counters

This is where GSAP shines. As you learned in Lesson 7.3, `gsap.to()` can animate any numeric property — including a JavaScript variable we display in the DOM. We combine this with `bind:this` (Lesson 7.5) and `$effect` cleanup (Lesson 7.7).

Create `src/lib/components/MetricCard.svelte`:

```svelte
<script lang="ts">
  import { gsap } from 'gsap';
  import type { Metric } from '$lib/server/db/schema';

  interface Props {
    metric: Metric & { changePercent?: number };
  }

  let { metric }: Props = $props();

  let cardEl: HTMLElement | undefined = $state();
  let displayValue = $state(0);

  // Format metric name for display
  let label = $derived(
    metric.name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );

  // Determine if this is a currency, percentage, or count
  let format = $derived.by(() => {
    if (metric.name.includes('revenue')) return 'currency';
    if (metric.name.includes('rate')) return 'percent';
    return 'number';
  });

  // Format the display value (Lesson 2.8 — $derived.by for complex computation)
  let formattedValue = $derived.by(() => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(displayValue);
      case 'percent':
        return `${displayValue.toFixed(2)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(Math.round(displayValue));
    }
  });

  let changePercent = $derived(
    metric.previousValue
      ? ((metric.value - metric.previousValue) / metric.previousValue) * 100
      : 0
  );

  let isPositive = $derived(changePercent >= 0);

  // Animate the counter when the component mounts (Lesson 7.6)
  $effect(() => {
    if (!cardEl) return;

    // We animate `displayValue` using a proxy object.
    // GSAP will tween the `val` property, and we copy it to our $state.
    const proxy = { val: 0 };
    const tween = gsap.to(proxy, {
      val: metric.value,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        displayValue = proxy.val;
      }
    });

    // Also animate the card entrance
    gsap.fromTo(
      cardEl,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );

    // Cleanup (Lesson 7.7) — kill the tween if the component unmounts
    return () => {
      tween.kill();
    };
  });
</script>

<article class="metric-card" bind:this={cardEl}>
  <h3 class="metric-label">{label}</h3>
  <p class="metric-value">{formattedValue}</p>
  <div class="metric-change" class:positive={isPositive} class:negative={!isPositive}>
    <span class="change-arrow">{isPositive ? '↑' : '↓'}</span>
    <span>{Math.abs(changePercent).toFixed(1)}%</span>
    <span class="change-label">vs last period</span>
  </div>
</article>

<style>
  @layer components {
    .metric-card {
      padding: var(--space-xl);
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      transition: box-shadow var(--dur-fast) var(--ease-out);
      container-type: inline-size;

      &:hover {
        box-shadow: var(--shadow-md);
      }
    }

    .metric-label {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-block-end: var(--space-sm);
    }

    .metric-value {
      font-size: var(--text-3xl);
      font-weight: 700;
      line-height: 1;
      margin-block-end: var(--space-sm);
      font-variant-numeric: tabular-nums;

      @container (inline-size < 12rem) {
        font-size: var(--text-2xl);
      }
    }

    .metric-change {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: var(--text-sm);

      &.positive {
        color: var(--color-success);
      }

      &.negative {
        color: var(--color-error);
      }
    }

    .change-arrow {
      font-weight: 700;
    }

    .change-label {
      color: var(--color-text-muted);
    }
  }
</style>
```

**Why GSAP instead of Svelte `tweened`?** As discussed in Lesson 7.1, Svelte's built-in `tweened` from `svelte/motion` works well for simple value interpolation (Lesson 6.14). But GSAP gives us finer control over easing curves, the ability to sequence multiple animations, and the `onUpdate` callback pattern that lets us drive `$state` from a GSAP tween. For a dashboard where multiple counters animate simultaneously with staggered timing, GSAP is the right tool.

---

## 9. Event log with TanStack Table

This section implements a full-featured event log using TanStack Table v9, exactly as taught in Lessons 11.7 through 11.9.

Create `src/lib/components/EventTable.svelte`:

```svelte
<script lang="ts">
  import {
    createSvelteTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender
  } from '@tanstack/svelte-table';
  import type { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/svelte-table';
  import type { Event } from '$lib/server/db/schema';

  interface Props {
    events: Event[];
  }

  let { events }: Props = $props();

  // Table state using Svelte 5 runes (Lesson 11.5 — reactive classes with runes)
  let sorting: SortingState = $state([]);
  let columnFilters: ColumnFiltersState = $state([]);
  let globalFilter = $state('');

  // Column definitions with full TypeScript typing (Lesson 11.9)
  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: 'type',
      header: 'Event Type',
      cell: (info) => {
        const value = info.getValue() as string;
        return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      },
      filterFn: 'equalsString'
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: (info) => {
        const value = info.getValue() as string;
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
    },
    {
      accessorKey: 'revenue',
      header: 'Revenue',
      cell: (info) => {
        const value = info.getValue() as number;
        if (value === 0) return '--';
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: (info) => {
        const value = info.getValue() as Date;
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(value));
      },
      sortingFn: 'datetime'
    }
  ];

  // Create the table instance (Lesson 11.7)
  const table = createSvelteTable({
    get data() { return events; },
    columns,
    state: {
      get sorting() { return sorting; },
      get columnFilters() { return columnFilters; },
      get globalFilter() { return globalFilter; }
    },
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater;
    },
    onColumnFiltersChange: (updater) => {
      columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
    },
    onGlobalFilterChange: (updater) => {
      globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  // Pagination derived state
  let pageIndex = $derived(table.getState().pagination.pageIndex);
  let pageCount = $derived(table.getPageCount());
</script>

<div class="table-container">
  <!-- Global search (Lesson 11.8 — filtering) -->
  <div class="table-toolbar">
    <input
      type="search"
      placeholder="Search events..."
      value={globalFilter}
      oninput={(e) => { globalFilter = e.currentTarget.value; }}
      class="search-input"
      aria-label="Search events"
    />

    <select
      onchange={(e) => {
        const value = e.currentTarget.value;
        if (value) {
          columnFilters = [{ id: 'type', value }];
        } else {
          columnFilters = [];
        }
      }}
      class="filter-select"
      aria-label="Filter by event type"
    >
      <option value="">All types</option>
      <option value="page_view">Page View</option>
      <option value="signup">Signup</option>
      <option value="purchase">Purchase</option>
      <option value="click">Click</option>
    </select>
  </div>

  <!-- Table -->
  <div class="table-scroll" role="region" aria-label="Event log" tabindex={0}>
    <table>
      <thead>
        {#each table.getHeaderGroups() as headerGroup}
          <tr>
            {#each headerGroup.headers as header}
              <th
                class:sortable={header.column.getCanSort()}
                onclick={header.column.getToggleSortingHandler()}
                aria-sort={
                  header.column.getIsSorted() === 'asc' ? 'ascending' :
                  header.column.getIsSorted() === 'desc' ? 'descending' :
                  'none'
                }
              >
                {#if !header.isPlaceholder}
                  <div class="header-content">
                    <svelte:component
                      this={flexRender(header.column.columnDef.header, header.getContext())}
                    />
                    {#if header.column.getIsSorted() === 'asc'}
                      <span class="sort-indicator" aria-hidden="true"> ↑</span>
                    {:else if header.column.getIsSorted() === 'desc'}
                      <span class="sort-indicator" aria-hidden="true"> ↓</span>
                    {/if}
                  </div>
                {/if}
              </th>
            {/each}
          </tr>
        {/each}
      </thead>
      <tbody>
        {#each table.getRowModel().rows as row}
          <tr>
            {#each row.getVisibleCells() as cell}
              <td>
                <svelte:component
                  this={flexRender(cell.column.columnDef.cell, cell.getContext())}
                />
              </td>
            {/each}
          </tr>
        {:else}
          <tr>
            <td colspan={columns.length} class="empty-state">
              No events match your search.
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Pagination (Lesson 11.8) -->
  <div class="pagination">
    <button
      onclick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      Previous
    </button>

    <span class="page-info">
      Page {pageIndex + 1} of {pageCount}
    </span>

    <button
      onclick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
    >
      Next
    </button>
  </div>
</div>

<style>
  @layer components {
    .table-container {
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .table-toolbar {
      display: flex;
      gap: var(--space-md);
      padding: var(--space-lg);
      border-block-end: 1px solid var(--color-border);

      @media (width < 640px) {
        flex-direction: column;
      }
    }

    .search-input {
      flex: 1;
      padding: var(--space-sm) var(--space-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      font-size: var(--text-sm);

      &:focus {
        border-color: var(--color-primary);
        outline: none;
        box-shadow: 0 0 0 2px oklch(0.65 0.20 250 / 0.25);
      }

      &::placeholder {
        color: var(--color-text-muted);
      }
    }

    .filter-select {
      padding: var(--space-sm) var(--space-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      font-size: var(--text-sm);
      cursor: pointer;
    }

    .table-scroll {
      overflow-x: auto;
    }

    table {
      inline-size: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }

    thead {
      background: var(--color-surface-elevated);
    }

    th {
      padding: var(--space-sm) var(--space-md);
      text-align: start;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      font-size: var(--text-xs);
      letter-spacing: 0.05em;
      white-space: nowrap;
      user-select: none;

      &.sortable {
        cursor: pointer;

        &:hover {
          color: var(--color-text);
        }
      }
    }

    .header-content {
      display: flex;
      align-items: center;
    }

    .sort-indicator {
      color: var(--color-primary);
    }

    td {
      padding: var(--space-sm) var(--space-md);
      border-block-start: 1px solid var(--color-border);
      white-space: nowrap;
    }

    tbody tr {
      transition: background var(--dur-instant) var(--ease-out);

      &:hover {
        background: var(--color-surface-elevated);
      }
    }

    .empty-state {
      text-align: center;
      padding: var(--space-2xl);
      color: var(--color-text-muted);
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      border-block-start: 1px solid var(--color-border);
    }

    .pagination button {
      padding: var(--space-xs) var(--space-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      font-size: var(--text-sm);
      cursor: pointer;
      transition: all var(--dur-fast) var(--ease-out);

      &:hover:not(:disabled) {
        background: var(--color-surface-elevated);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .page-info {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
  }
</style>
```

**Architecture decision:** We use TanStack Table's headless approach (Lesson 11.7) rather than a pre-built table component. This gives us full control over rendering while TanStack handles the sorting, filtering, and pagination logic. The state is managed with Svelte 5 runes — `$state` for mutable table state like `sorting` and `globalFilter`, and `$derived` for computed values like `pageCount`. This is the reactive class pattern from Lesson 11.5 applied to table state.

---

## 10. Real-time updates via SSE

Server-Sent Events (Lesson 17.2) are the perfect fit for a dashboard that needs one-way server-to-client updates. We do not need WebSockets here because the client only receives data, never sends it through the real-time channel.

Create `src/routes/api/dashboard/stream/+server.ts`:

```ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { events, metrics } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = locals.user.id;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      function send(eventName: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      // Send initial data immediately
      send('connected', { timestamp: Date.now() });

      // Poll for updates every 5 seconds
      // In production, you would use database triggers or a pub/sub system (Lesson 17.8)
      const interval = setInterval(async () => {
        try {
          const latestMetrics = await db
            .select()
            .from(metrics)
            .where(eq(metrics.userId, userId));

          const latestEvents = await db
            .select()
            .from(events)
            .where(eq(events.userId, userId))
            .orderBy(desc(events.createdAt))
            .limit(5);

          send('metrics-update', latestMetrics);
          send('events-update', latestEvents);
        } catch {
          // Silently handle — the client will reconnect if the stream closes
        }
      }, 5000);

      // Cleanup when the client disconnects
      const cleanup = () => {
        clearInterval(interval);
      };

      // Handle stream cancellation
      return cleanup;
    },
    cancel() {
      // Stream was cancelled by the client
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

Create `src/lib/stores/dashboard-stream.svelte.ts` — a reactive class that consumes the SSE stream (Lesson 11.3 — `.svelte.ts` files for universal reactive state):

```ts
import type { Metric, Event } from '$lib/server/db/schema';

export class DashboardStream {
  metrics = $state<Metric[]>([]);
  recentEvents = $state<Event[]>([]);
  connected = $state(false);
  private eventSource: EventSource | null = null;

  connect() {
    if (this.eventSource) return;

    this.eventSource = new EventSource('/api/dashboard/stream');

    this.eventSource.addEventListener('connected', () => {
      this.connected = true;
    });

    this.eventSource.addEventListener('metrics-update', (e) => {
      this.metrics = JSON.parse(e.data);
    });

    this.eventSource.addEventListener('events-update', (e) => {
      this.recentEvents = JSON.parse(e.data);
    });

    this.eventSource.onerror = () => {
      this.connected = false;
      // EventSource auto-reconnects — we just update the status
    };
  }

  disconnect() {
    this.eventSource?.close();
    this.eventSource = null;
    this.connected = false;
  }
}
```

**Why a reactive class?** As you learned in Lesson 11.5, reactive classes with runes give us encapsulated state with methods. The `DashboardStream` class owns its `EventSource` lifecycle and exposes reactive properties that any component can read. We chose a class instead of context (Lesson 11.2) because the stream state might be shared across multiple dashboard sub-pages, not just a single component tree.

Now integrate the SSE stream into the dashboard page. Update `src/routes/(dashboard)/dashboard/+page.svelte` by adding the SSE connection:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import MetricCard from '$lib/components/MetricCard.svelte';
  import EventTable from '$lib/components/EventTable.svelte';
  import { DashboardStream } from '$lib/stores/dashboard-stream.svelte';
  import { browser } from '$app/environment';

  let { data } = $props();

  const stream = new DashboardStream();

  // Use SSE data when available, fall back to load() data
  let displayMetrics = $derived(
    stream.metrics.length > 0 ? stream.metrics : data.metrics
  );
  let displayEvents = $derived(
    stream.recentEvents.length > 0 ? stream.recentEvents : data.recentEvents
  );

  // Connect to SSE on mount, disconnect on unmount (Lesson 2.11 — $effect cleanup)
  $effect(() => {
    if (!browser) return;
    stream.connect();
    return () => stream.disconnect();
  });
</script>

<svelte:head>
  <title>Dashboard — SaaS Analytics</title>
</svelte:head>

<div class="dashboard">
  <header class="dashboard-header">
    <div class="header-top">
      <h1>Dashboard</h1>
      {#if stream.connected}
        <span class="live-badge" aria-label="Live updates active">Live</span>
      {/if}
    </div>
    <p class="subtitle">Welcome back, {data.user.name}.</p>
  </header>

  <section class="metrics-grid" aria-label="Key metrics">
    {#each displayMetrics as metric (metric.id)}
      <svelte:boundary>
        <MetricCard {metric} />
        {#snippet failed(error)}
          <div class="widget-error" role="alert">
            <p>Failed to load metric</p>
          </div>
        {/snippet}
      </svelte:boundary>
    {/each}
  </section>

  <section class="events-section" aria-label="Recent events">
    <h2>Recent Events</h2>
    <svelte:boundary>
      <EventTable events={displayEvents} />
      {#snippet failed(error)}
        <div class="widget-error" role="alert">
          <p>Failed to load event table</p>
        </div>
      {/snippet}
    </svelte:boundary>
  </section>
</div>

<style>
  @layer components {
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: var(--space-2xl);
    }

    .dashboard-header {
      h1 {
        font-size: var(--text-3xl);
      }

      .subtitle {
        color: var(--color-text-muted);
        font-size: var(--text-lg);
      }
    }

    .header-top {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-block-end: var(--space-xs);
    }

    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-xs) var(--space-sm);
      background: oklch(0.72 0.19 145 / 0.15);
      color: var(--color-success);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &::before {
        content: '';
        display: block;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        background: var(--color-success);
        border-radius: var(--radius-full);
        animation: pulse 2s ease-in-out infinite;
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      gap: var(--space-lg);
    }

    .events-section {
      h2 {
        font-size: var(--text-xl);
        margin-block-end: var(--space-lg);
      }
    }

    .widget-error {
      padding: var(--space-xl);
      background: var(--color-surface-alt);
      border: 1px dashed var(--color-error);
      border-radius: var(--radius-md);
      color: var(--color-error);
      text-align: center;
    }
  }
</style>
```

---

## 11. Error boundaries around each widget

Notice in the dashboard page above, we already wrapped each widget in `<svelte:boundary>` (Lesson 12.7). This is the error boundary pattern — if a single widget throws during rendering, the error is caught and a fallback is shown instead of crashing the entire page.

The key pattern is:

```svelte
<svelte:boundary>
  <MetricCard {metric} />
  {#snippet failed(error)}
    <div class="widget-error" role="alert">
      <p>Failed to load metric</p>
    </div>
  {/snippet}
</svelte:boundary>
```

Each widget gets its own boundary. If the `MetricCard` component throws (perhaps due to malformed data from the API), only that one card shows the error state — the other three continue working. This is essential for a dashboard where data comes from multiple sources with different reliability characteristics.

**Why per-widget instead of one big boundary?** A single boundary around the entire metrics grid would replace ALL cards with an error message even if only one data source failed. Per-widget boundaries provide graceful degradation — the user still sees 3 out of 4 metrics instead of zero.

---

## 12. Marketing landing page

The marketing page is a public page (outside the `(dashboard)` route group) that does not require authentication. It uses SSG for instant loading (Lesson 9A.10).

Create `src/routes/(marketing)/+layout.svelte`:

```svelte
<script lang="ts">
  let { children } = $props();
</script>

<div class="marketing-layout">
  <header class="marketing-header">
    <nav aria-label="Marketing navigation">
      <a href="/" class="logo">SaaS Analytics</a>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="/login" class="cta-link">Sign in</a>
      </div>
    </nav>
  </header>

  {@render children()}

  <footer class="marketing-footer">
    <p>&copy; 2026 SaaS Analytics. Built with SvelteKit.</p>
  </footer>
</div>

<style>
  @layer components {
    .marketing-layout {
      min-block-size: 100dvh;
      display: flex;
      flex-direction: column;
    }

    .marketing-header nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-md) var(--space-xl);
      max-inline-size: var(--content-max);
      margin-inline: auto;
      inline-size: 100%;
    }

    .logo {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--color-primary);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
    }

    .nav-links a {
      font-size: var(--text-sm);
      color: var(--color-text-muted);

      &:hover {
        color: var(--color-text);
      }
    }

    .cta-link {
      padding: var(--space-xs) var(--space-md);
      background: var(--color-primary);
      color: oklch(1 0 0) !important;
      border-radius: var(--radius-sm);
      font-weight: 600;

      &:hover {
        background: var(--color-primary-hover);
      }
    }

    .marketing-footer {
      margin-block-start: auto;
      padding: var(--space-xl);
      text-align: center;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      border-block-start: 1px solid var(--color-border);
    }
  }
</style>
```

Create `src/routes/(marketing)/+page.svelte`:

```svelte
<script lang="ts">
  import { gsap } from 'gsap';

  let heroEl: HTMLElement | undefined = $state();

  // Animate hero on mount (Lesson 7.3)
  $effect(() => {
    if (!heroEl) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(
      heroEl.querySelector('.hero-title'),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8 }
    )
    .fromTo(
      heroEl.querySelector('.hero-description'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    )
    .fromTo(
      heroEl.querySelector('.hero-cta'),
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5 },
      '-=0.3'
    );

    return () => tl.kill();
  });
</script>

<div class="landing">
  <section class="hero" bind:this={heroEl}>
    <h1 class="hero-title">
      Analytics that actually<br />
      make sense
    </h1>
    <p class="hero-description">
      Track every event, visualize every metric, and make data-driven decisions
      with a dashboard built for modern SaaS teams.
    </p>
    <a href="/register" class="hero-cta">Start free trial</a>
  </section>

  <section class="features" id="features" aria-label="Features">
    <h2>Everything you need</h2>
    <div class="features-grid">
      <article class="feature-card">
        <h3>Real-time metrics</h3>
        <p>See your data update live with Server-Sent Events. No refresh needed.</p>
      </article>
      <article class="feature-card">
        <h3>Event tracking</h3>
        <p>Log page views, signups, purchases, and custom events with full filtering.</p>
      </article>
      <article class="feature-card">
        <h3>Sortable tables</h3>
        <p>TanStack Table powers sortable, filterable, paginated event logs.</p>
      </article>
      <article class="feature-card">
        <h3>Edge deployment</h3>
        <p>Deployed to Vercel Edge for sub-50ms response times worldwide.</p>
      </article>
    </div>
  </section>

  <section class="pricing" id="pricing" aria-label="Pricing">
    <h2>Simple pricing</h2>
    <div class="pricing-grid">
      <article class="pricing-card">
        <h3>Starter</h3>
        <p class="price"><span class="amount">$0</span>/month</p>
        <ul>
          <li>1,000 events/month</li>
          <li>7-day retention</li>
          <li>1 dashboard</li>
        </ul>
        <a href="/register" class="pricing-cta">Get started</a>
      </article>
      <article class="pricing-card featured">
        <h3>Pro</h3>
        <p class="price"><span class="amount">$29</span>/month</p>
        <ul>
          <li>100,000 events/month</li>
          <li>90-day retention</li>
          <li>Unlimited dashboards</li>
          <li>Real-time updates</li>
        </ul>
        <a href="/register" class="pricing-cta">Start free trial</a>
      </article>
      <article class="pricing-card">
        <h3>Enterprise</h3>
        <p class="price"><span class="amount">$99</span>/month</p>
        <ul>
          <li>Unlimited events</li>
          <li>1-year retention</li>
          <li>SSO + team management</li>
          <li>Priority support</li>
        </ul>
        <a href="/register" class="pricing-cta">Contact sales</a>
      </article>
    </div>
  </section>
</div>

<style>
  @layer components {
    .landing {
      display: flex;
      flex-direction: column;
      gap: var(--space-3xl);
    }

    .hero {
      text-align: center;
      padding: var(--space-3xl) var(--space-xl);
      max-inline-size: 50rem;
      margin-inline: auto;
    }

    .hero-title {
      font-size: var(--text-4xl);
      font-weight: 800;
      margin-block-end: var(--space-lg);
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-description {
      font-size: var(--text-lg);
      color: var(--color-text-muted);
      margin-block-end: var(--space-xl);
      max-inline-size: 36rem;
      margin-inline: auto;
    }

    .hero-cta {
      display: inline-block;
      padding: var(--space-sm) var(--space-2xl);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: var(--text-lg);
      transition: background var(--dur-fast) var(--ease-out);

      &:hover {
        background: var(--color-primary-hover);
        color: oklch(1 0 0);
      }
    }

    .features, .pricing {
      padding: var(--space-2xl) var(--space-xl);
      max-inline-size: var(--content-max);
      margin-inline: auto;
      inline-size: 100%;

      h2 {
        font-size: var(--text-3xl);
        text-align: center;
        margin-block-end: var(--space-2xl);
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
      gap: var(--space-lg);
    }

    .feature-card {
      padding: var(--space-xl);
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);

      h3 {
        font-size: var(--text-lg);
        margin-block-end: var(--space-sm);
      }

      p {
        color: var(--color-text-muted);
        font-size: var(--text-sm);
      }
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
      gap: var(--space-lg);
      align-items: start;
    }

    .pricing-card {
      padding: var(--space-xl);
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      text-align: center;

      &.featured {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 1px var(--color-primary), var(--shadow-lg);
        position: relative;
      }

      h3 {
        font-size: var(--text-xl);
        margin-block-end: var(--space-md);
      }

      .price {
        margin-block-end: var(--space-lg);
      }

      .amount {
        font-size: var(--text-3xl);
        font-weight: 800;
      }

      ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        margin-block-end: var(--space-xl);
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }
    }

    .pricing-cta {
      display: inline-block;
      padding: var(--space-sm) var(--space-xl);
      border: 1px solid var(--color-primary);
      color: var(--color-primary);
      border-radius: var(--radius-sm);
      font-weight: 600;
      transition: all var(--dur-fast) var(--ease-out);

      &:hover {
        background: var(--color-primary);
        color: oklch(1 0 0);
      }
    }

    .featured .pricing-cta {
      background: var(--color-primary);
      color: oklch(1 0 0);

      &:hover {
        background: var(--color-primary-hover);
      }
    }
  }
</style>
```

Enable prerendering for the marketing page. Create `src/routes/(marketing)/+page.ts`:

```ts
export const prerender = true;
```

---

## 13. SEO for marketing pages

This section applies everything from Module 13. We build a reusable SEO component (Lesson 13.3), add Open Graph metadata (Lesson 13.4), and include JSON-LD structured data (Lesson 13.6).

Create `src/lib/components/Seo.svelte`:

```svelte
<script lang="ts">
  interface Props {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    jsonLd?: Record<string, unknown>;
  }

  let {
    title,
    description,
    canonical = '',
    ogImage = '/og-default.png',
    ogType = 'website',
    jsonLd
  }: Props = $props();

  let fullTitle = $derived(`${title} — SaaS Analytics`);
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />

  <!-- Canonical URL (Lesson 13.13) -->
  {#if canonical}
    <link rel="canonical" href={canonical} />
  {/if}

  <!-- Open Graph (Lesson 13.4) -->
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content={ogType} />
  <meta property="og:image" content={ogImage} />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />

  <!-- JSON-LD structured data (Lesson 13.6) -->
  {#if jsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
  {/if}
</svelte:head>
```

Now use it in the marketing page. Add this to the top of `src/routes/(marketing)/+page.svelte`:

```svelte
<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  // ... other imports

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SaaS Analytics Dashboard',
    description: 'Real-time analytics dashboard for modern SaaS teams.',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '99',
      priceCurrency: 'USD'
    }
  };
</script>

<Seo
  title="Real-Time Analytics for SaaS Teams"
  description="Track events, visualize metrics, and make data-driven decisions with a dashboard built for modern SaaS teams. Free to start."
  canonical="https://saas-dashboard.example.com"
  {jsonLd}
/>
```

Create `src/routes/sitemap.xml/+server.ts` (Lesson 13.8):

```ts
import type { RequestHandler } from './$types';

const pages = ['/', '/login', '/register'];

export const GET: RequestHandler = async () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>https://saas-dashboard.example.com${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.7'}</priority>
  </url>`
    )
    .join('')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600'
    }
  });
};
```

Create `src/routes/robots.txt/+server.ts` (Lesson 13.9):

```ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const body = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api

Sitemap: https://saas-dashboard.example.com/sitemap.xml`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
};
```

---

## 14. Performance optimization

Apply the performance patterns from Module 12.

### Image optimization (Lesson 12.2)

For any images in the marketing page, use the `srcset` pattern:

```svelte
<picture>
  <source
    srcset="/screenshots/dashboard-640.avif 640w,
            /screenshots/dashboard-1280.avif 1280w"
    type="image/avif"
  />
  <source
    srcset="/screenshots/dashboard-640.webp 640w,
            /screenshots/dashboard-1280.webp 1280w"
    type="image/webp"
  />
  <img
    src="/screenshots/dashboard-1280.png"
    alt="SaaS Analytics dashboard showing metric cards and event table"
    width={1280}
    height={800}
    loading="lazy"
    decoding="async"
  />
</picture>
```

### Code splitting (Lesson 12.3)

The dashboard is already code-split by SvelteKit's route-based splitting. The marketing pages are prerendered, so they load as static HTML. The heavy dependencies (GSAP, TanStack Table) are only loaded on routes that use them.

### Reduce motion support (Lesson 6.18)

Add this check to every GSAP animation:

```ts
$effect(() => {
  if (!heroEl) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    // Skip animations — just show the final state
    gsap.set(heroEl.querySelector('.hero-title'), { opacity: 1, y: 0 });
    gsap.set(heroEl.querySelector('.hero-description'), { opacity: 1, y: 0 });
    gsap.set(heroEl.querySelector('.hero-cta'), { opacity: 1, scale: 1 });
    return;
  }

  // ... normal GSAP timeline
});
```

### Bundle size awareness (Lesson 12.1)

The build output should stay under these budgets:
- Total JS (gzipped): < 200KB
- Total CSS (gzipped): < 50KB
- Largest single chunk: < 100KB gzipped

---

## 15. Deployment to Vercel Edge

We deploy to Vercel Edge Functions for global low-latency responses, as covered in Lesson 22.3.

The adapter is already configured in `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-vercel';

const config = {
  kit: {
    adapter: adapter({
      runtime: 'edge'
    })
  }
};
```

Create `vercel.json` for additional configuration:

```json
{
  "framework": "sveltekit",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/dashboard/stream",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

**Environment variables** (Lesson 10.7): On Vercel, set these in the project settings:

- `DATABASE_URL` — your Turso/LibSQL connection string for production
- `DATABASE_AUTH_TOKEN` — authentication token for the database

For production, switch from `better-sqlite3` to `@libsql/client`:

```ts
// src/lib/server/db/index.ts (production version)
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { DATABASE_URL, DATABASE_AUTH_TOKEN } from '$env/static/private';

const client = createClient({
  url: DATABASE_URL,
  authToken: DATABASE_AUTH_TOKEN
});

export const db = drizzle(client, { schema });
```

Deploy:

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### File tree — final

```
saas-dashboard/
├── src/
│   ├── app.css
│   ├── app.html
│   ├── app.d.ts
│   ├── hooks.server.ts
│   ├── lib/
│   │   ├── components/
│   │   │   ├── EventTable.svelte
│   │   │   ├── MetricCard.svelte
│   │   │   └── Seo.svelte
│   │   ├── server/
│   │   │   ├── auth/
│   │   │   │   └── utils.ts
│   │   │   ├── db/
│   │   │   │   ├── index.ts
│   │   │   │   ├── schema.ts
│   │   │   │   └── seed.ts
│   │   │   └── dashboard.remote.ts
│   │   └── stores/
│   │       └── dashboard-stream.svelte.ts
│   └── routes/
│       ├── +layout.svelte
│       ├── (auth)/
│       │   ├── login/
│       │   │   ├── +page.svelte
│       │   │   └── +page.server.ts
│       │   ├── register/
│       │   │   ├── +page.svelte
│       │   │   └── +page.server.ts
│       │   └── logout/
│       │       └── +page.server.ts
│       ├── (dashboard)/
│       │   ├── +layout.server.ts
│       │   ├── +layout.svelte
│       │   └── dashboard/
│       │       ├── +page.svelte
│       │       └── +page.server.ts
│       ├── (marketing)/
│       │   ├── +layout.svelte
│       │   ├── +page.svelte
│       │   └── +page.ts
│       ├── api/
│       │   └── dashboard/
│       │       └── stream/
│       │           └── +server.ts
│       ├── sitemap.xml/
│       │   └── +server.ts
│       └── robots.txt/
│           └── +server.ts
├── drizzle/
├── drizzle.config.ts
├── svelte.config.js
├── tsconfig.json
├── vercel.json
├── vite.config.ts
└── package.json
```

---

## 16. Final result

You now have a complete SaaS analytics dashboard with:

- **Authentication** — registration, login, logout with session cookies
- **Protected routes** — the dashboard layout redirects unauthenticated users
- **Database** — Drizzle ORM with SQLite, fully typed schema for users, sessions, events, and metrics
- **Live data** — remote functions for querying dashboard data, SSE for real-time updates
- **Animated counters** — GSAP tweens that animate metric values from 0 to their final value
- **Event log** — TanStack Table with sort, filter, search, and pagination
- **Error boundaries** — each widget is wrapped in `<svelte:boundary>` for graceful degradation
- **Marketing page** — prerendered landing page with GSAP entrance animations
- **Full SEO** — `<svelte:head>`, Open Graph, JSON-LD, sitemap.xml, robots.txt
- **Edge deployment** — Vercel Edge Functions with security headers

### What to test

1. Register a new account and verify you are redirected to the dashboard
2. Verify the metric counters animate from 0 to their values on page load
3. Sort the event table by clicking column headers
4. Filter events by type using the dropdown
5. Search events using the global search input
6. Check the "Live" badge appears when SSE connects
7. Open the marketing page at `/` and verify GSAP animations play
8. View page source at `/` to confirm prerendered HTML
9. Visit `/sitemap.xml` and `/robots.txt`
10. Run `npx lighthouse http://localhost:5173` and verify all scores are green

---

## 17. What you practiced

- **$state, $derived, $derived.by, $effect, $effect cleanup** — Svelte 5 runes for all dashboard state (Module 2, Lessons 2.2, 2.7, 2.8, 2.9, 2.11)
- **GSAP gsap.to() with onUpdate** — animating numeric values into $state (Module 7, Lesson 7.3)
- **GSAP timelines** — sequencing hero entrance animations (Module 7, Lesson 7.4)
- **bind:this** — getting DOM references for GSAP targets (Module 7, Lesson 7.5)
- **$effect as GSAP bridge** — triggering animations from reactive state (Module 7, Lesson 7.6)
- **GSAP cleanup** — killing tweens in $effect return (Module 7, Lesson 7.7)
- **File-based routing** — route groups for auth, dashboard, marketing (Module 8, Lessons 8.4, 8.5)
- **Dynamic routes** — organizing pages under (dashboard) group (Module 8, Lesson 8.6)
- **Load functions** — server-side data fetching for dashboard (Module 9A, Lesson 9A.2)
- **SSG prerendering** — static marketing pages (Module 9A, Lesson 9A.10)
- **Remote functions** — query functions for dashboard widgets (Module 9B, Lessons 9B.2, 9B.3)
- **query.batch()** — batching multiple dashboard queries (Module 9B, Lesson 9B.4)
- **Form actions** — login/register server mutations (Module 10, Lesson 10.3)
- **use:enhance** — progressive enhancement for auth forms (Module 10, Lesson 10.5)
- **Server-side validation** — form data validation in actions (Module 10, Lesson 10.6)
- **Reactive classes** — DashboardStream SSE state class (Module 11, Lesson 11.5)
- **.svelte.ts files** — universal reactive state (Module 11, Lesson 11.3)
- **TanStack Table** — headless table with sort, filter, paginate (Module 11, Lessons 11.7, 11.8, 11.9)
- **Error boundaries** — <svelte:boundary> around widgets (Module 12, Lesson 12.7)
- **Image optimization** — srcset, lazy loading, AVIF/WebP (Module 12, Lesson 12.2)
- **Accessibility** — ARIA labels, focus management, keyboard nav (Module 12, Lesson 12.8)
- **Reduced motion** — respecting prefers-reduced-motion (Module 6, Lesson 6.18)
- **<svelte:head>** — meta tags per page (Module 13, Lesson 13.2)
- **SEO component** — reusable typed SEO component (Module 13, Lesson 13.3)
- **Open Graph** — social sharing metadata (Module 13, Lesson 13.4)
- **JSON-LD** — structured data for rich results (Module 13, Lesson 13.6)
- **Sitemap + robots.txt** — search engine indexing (Module 13, Lessons 13.8, 13.9)
- **Authentication** — registration, login, sessions, protected routes (Module 15, Lessons 15.1–15.6)
- **hooks.server.ts** — session validation middleware (Module 15, Lesson 15.2)
- **Drizzle ORM** — schema definition, CRUD, relations (Module 16, Lessons 16.2–16.5)
- **SSE** — server-sent events for real-time updates (Module 17, Lessons 17.2, 17.3)
- **PE7 CSS** — @layer architecture, OKLCH tokens, fluid typography (Module 1, Lesson 1.5; Module 6)
- **Vercel Edge deployment** — adapter-vercel with edge runtime (Module 22, Lesson 22.3)
