# Build a Full Blog Platform — Complete Walkthrough

> **Time:** ~8 hours | **Modules referenced:** M2, M9A, M9B, M10, M13, M15, M16, M18
> **What you'll build:** A full-featured blog platform with Markdown rendering, an authenticated admin panel for creating and editing posts, CRUD via form actions, a Drizzle database with posts/tags/authors, a comment system powered by remote functions, a dynamic sitemap and RSS feed, prerendered post pages with `entries()`, and full-text search using `$derived.by` filtering.
> **Prerequisites:** Complete through Module 18 (Advanced Patterns)

## Table of contents

1. [Project setup](#1-project-setup)
2. [PE7 CSS foundation](#2-pe7-css-foundation)
3. [Database schema with Drizzle](#3-database-schema-with-drizzle)
4. [Authentication for the admin panel](#4-authentication-for-the-admin-panel)
5. [Admin panel layout and dashboard](#5-admin-panel-layout-and-dashboard)
6. [CRUD for posts via form actions](#6-crud-for-posts-via-form-actions)
7. [Markdown rendering in Svelte](#7-markdown-rendering-in-svelte)
8. [Public blog pages](#8-public-blog-pages)
9. [Prerendered post pages with entries()](#9-prerendered-post-pages-with-entries)
10. [Comment system with remote functions](#10-comment-system-with-remote-functions)
11. [Full-text search with $derived.by](#11-full-text-search-with-derivedby)
12. [Dynamic sitemap and RSS feed](#12-dynamic-sitemap-and-rss-feed)
13. [SEO optimization](#13-seo-optimization)
14. [Deployment](#14-deployment)
15. [Final result](#15-final-result)
16. [What you practiced](#16-what-you-practiced)

---

## 1. Project setup

```bash
pnpm create svelte@latest blog-platform
```

Select: Skeleton project, TypeScript, Prettier + ESLint.

```bash
cd blog-platform
pnpm install

# Database
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3

# Auth
pnpm add @node-rs/argon2

# Validation
pnpm add valibot

# Markdown
pnpm add marked
pnpm add -D @types/marked
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
blog-platform/
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

Create `src/app.css` with a warm, readable blog aesthetic:

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
    /* Warm readable palette — OKLCH (Lesson 6.2) */
    --color-primary: oklch(0.55 0.15 240);
    --color-primary-hover: oklch(0.50 0.17 240);
    --color-secondary: oklch(0.60 0.10 30);
    --color-surface: oklch(0.99 0.003 90);
    --color-surface-alt: oklch(1 0 0);
    --color-surface-elevated: oklch(0.97 0.005 85);
    --color-text: oklch(0.18 0.02 60);
    --color-text-muted: oklch(0.45 0.02 60);
    --color-border: oklch(0.90 0.008 70);
    --color-success: oklch(0.65 0.18 145);
    --color-error: oklch(0.60 0.22 25);

    /* Admin panel darker surface */
    --color-admin-surface: oklch(0.15 0.015 250);
    --color-admin-surface-alt: oklch(0.19 0.02 250);
    --color-admin-text: oklch(0.92 0.01 250);
    --color-admin-text-muted: oklch(0.65 0.02 250);
    --color-admin-border: oklch(0.30 0.02 250);

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;

    /* Typography — optimized for long reading (Lesson 1.6) */
    --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
    --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
    --text-base: clamp(0.95rem, 0.9rem + 0.25vw, 1.0625rem);
    --text-lg: clamp(1.05rem, 0.95rem + 0.5vw, 1.1875rem);
    --text-xl: clamp(1.2rem, 1.05rem + 0.75vw, 1.375rem);
    --text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 1.875rem);
    --text-3xl: clamp(1.9rem, 1.5rem + 2vw, 2.5rem);
    --text-4xl: clamp(2.4rem, 1.8rem + 3vw, 3.25rem);

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
    --shadow-sm: 0 1px 3px oklch(0 0 0 / 0.06);
    --shadow-md: 0 4px 12px oklch(0 0 0 / 0.08);

    /* Layout */
    --content-max: 42rem;
    --page-max: 72rem;
  }
}

@layer base {
  body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: var(--text-base);
    line-height: 1.7;
    color: var(--color-text);
    background: var(--color-surface);
  }

  h1, h2, h3, h4 {
    line-height: 1.2;
    text-wrap: balance;
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--dur-fast) var(--ease-out);

    &:hover { color: var(--color-primary-hover); }
  }

  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

@layer layout {
  .container {
    max-inline-size: var(--page-max);
    margin-inline: auto;
    padding-inline: var(--space-lg);
  }

  .prose-container {
    max-inline-size: var(--content-max);
    margin-inline: auto;
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

## 3. Database schema with Drizzle

Our blog needs four tables: authors, posts, tags (many-to-many), and comments. This is a more complex schema than the SaaS dashboard — it demonstrates relations and joins (Lesson 16.6).

Create `src/lib/server/db/schema.ts`:

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ── Authors ──────────────────────────────────────────────
export const authors = sqliteTable('authors', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  bio: text('bio').default(''),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});

// ── Sessions ─────────────────────────────────────────────
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  authorId: text('author_id')
    .notNull()
    .references(() => authors.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// ── Posts ─────────────────────────────────────────────────
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  content: text('content').notNull().default(''),
  coverImage: text('cover_image'),
  authorId: text('author_id')
    .notNull()
    .references(() => authors.id),
  status: text('status', { enum: ['draft', 'published'] })
    .notNull()
    .default('draft'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});

// ── Tags ─────────────────────────────────────────────────
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique()
});

// ── Post-Tag join table ──────────────────────────────────
export const postTags = sqliteTable('post_tags', {
  postId: text('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  tagId: text('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' })
});

// ── Comments ─────────────────────────────────────────────
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  authorName: text('author_name').notNull(),
  authorEmail: text('author_email').notNull(),
  content: text('content').notNull(),
  approved: integer('approved', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});

// ── Relations (Lesson 16.6) ──────────────────────────────
export const authorsRelations = relations(authors, ({ many }) => ({
  posts: many(posts)
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(authors, {
    fields: [posts.authorId],
    references: [authors.id]
  }),
  postTags: many(postTags),
  comments: many(comments)
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags)
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id]
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id]
  })
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id]
  })
}));

// ── Type exports ─────────────────────────────────────────
export type Author = typeof authors.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Comment = typeof comments.$inferSelect;
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

Create `drizzle.config.ts`:

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

## 4. Authentication for the admin panel

We reuse the auth pattern from Module 15. Only registered authors can access the admin panel.

Create `src/lib/server/auth.ts`:

```ts
import { hash, verify } from '@node-rs/argon2';
import { db } from './db';
import { sessions, authors } from './db/schema';
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

export async function verifyPassword(hashed: string, plain: string): Promise<boolean> {
  return await verify(hashed, plain);
}

export async function createSession(authorId: string): Promise<string> {
  const sessionId = generateId();
  await db.insert(sessions).values({
    id: sessionId,
    authorId,
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

  const [author] = await db
    .select({ id: authors.id, email: authors.email, name: authors.name })
    .from(authors)
    .where(eq(authors.id, session.authorId))
    .limit(1);

  return author ?? null;
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
    event.locals.author = await validateSession(sessionId);
  } else {
    event.locals.author = null;
  }

  return resolve(event);
};
```

Update `src/app.d.ts`:

```ts
declare global {
  namespace App {
    interface Locals {
      author: {
        id: string;
        email: string;
        name: string;
      } | null;
    }
  }
}

export {};
```

Create `src/routes/admin/login/+page.svelte`:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
</script>

<svelte:head>
  <title>Admin Login — Blog Platform</title>
</svelte:head>

<div class="login-page">
  <div class="login-card">
    <h1>Admin Login</h1>

    <form method="POST" use:enhance>
      {#if form?.error}
        <div class="error-banner" role="alert">{form.error}</div>
      {/if}

      <label>
        <span>Email</span>
        <input type="email" name="email" required autocomplete="email" />
      </label>

      <label>
        <span>Password</span>
        <input type="password" name="password" required autocomplete="current-password" />
      </label>

      <button type="submit">Sign in</button>
    </form>
  </div>
</div>

<style>
  @layer components {
    .login-page {
      display: grid;
      place-items: center;
      min-block-size: 100dvh;
      background: var(--color-admin-surface);
    }

    .login-card {
      inline-size: min(100%, 22rem);
      padding: var(--space-2xl);
      background: var(--color-admin-surface-alt);
      border-radius: var(--radius-lg);
      color: var(--color-admin-text);

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
      color: var(--color-admin-text-muted);
    }

    input {
      padding: var(--space-sm) var(--space-md);
      background: var(--color-admin-surface);
      border: 1px solid var(--color-admin-border);
      border-radius: var(--radius-sm);
      color: var(--color-admin-text);
    }

    button {
      padding: var(--space-sm);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
    }

    .error-banner {
      padding: var(--space-sm);
      background: oklch(0.25 0.05 25);
      color: var(--color-error);
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
    }
  }
</style>
```

Create `src/routes/admin/login/+page.server.ts`:

```ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { authors } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession } from '$lib/server/auth';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString().trim().toLowerCase() ?? '';
    const password = data.get('password')?.toString() ?? '';

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required.' });
    }

    const [author] = await db
      .select()
      .from(authors)
      .where(eq(authors.email, email))
      .limit(1);

    if (!author) {
      return fail(400, { error: 'Invalid credentials.' });
    }

    const valid = await verifyPassword(author.passwordHash, password);
    if (!valid) {
      return fail(400, { error: 'Invalid credentials.' });
    }

    const sessionId = await createSession(author.id);
    cookies.set('session', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 30 * 24 * 60 * 60
    });

    redirect(303, '/admin');
  }
};
```

---

## 5. Admin panel layout and dashboard

Create `src/routes/admin/+layout.server.ts` — this protects all admin routes (Lesson 15.5):

```ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Allow access to the login page
  if (url.pathname === '/admin/login') {
    return {};
  }

  if (!locals.author) {
    redirect(303, '/admin/login');
  }

  return { author: locals.author };
};
```

Create `src/routes/admin/+layout.svelte`:

```svelte
<script lang="ts">
  import type { LayoutData } from './$types';

  let { data, children } = $props();

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/posts', label: 'Posts' },
    { href: '/admin/tags', label: 'Tags' },
    { href: '/admin/comments', label: 'Comments' }
  ] as const;
</script>

{#if data.author}
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2>Blog Admin</h2>
      </div>

      <nav aria-label="Admin navigation">
        <ul>
          {#each navItems as item}
            <li>
              <a href={item.href}>{item.label}</a>
            </li>
          {/each}
        </ul>
      </nav>

      <div class="sidebar-footer">
        <span class="author-name">{data.author.name}</span>
        <form method="POST" action="/admin/logout">
          <button type="submit">Sign out</button>
        </form>
      </div>
    </aside>

    <main class="admin-main">
      {@render children()}
    </main>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  @layer components {
    .admin-layout {
      display: grid;
      grid-template-columns: 14rem 1fr;
      min-block-size: 100dvh;
      background: var(--color-admin-surface);
      color: var(--color-admin-text);

      @media (width < 768px) {
        grid-template-columns: 1fr;
      }
    }

    .admin-sidebar {
      background: var(--color-admin-surface-alt);
      border-inline-end: 1px solid var(--color-admin-border);
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;

      @media (width < 768px) { display: none; }
    }

    .sidebar-header {
      padding-block-end: var(--space-lg);
      border-block-end: 1px solid var(--color-admin-border);
      margin-block-end: var(--space-lg);

      h2 {
        font-size: var(--text-base);
        color: var(--color-primary);
      }
    }

    nav ul {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    nav a {
      display: block;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-sm);
      color: var(--color-admin-text-muted);
      font-size: var(--text-sm);
      transition: all var(--dur-fast) var(--ease-out);

      &:hover {
        background: var(--color-admin-surface);
        color: var(--color-admin-text);
      }
    }

    .sidebar-footer {
      margin-block-start: auto;
      padding-block-start: var(--space-lg);
      border-block-start: 1px solid var(--color-admin-border);

      .author-name {
        display: block;
        font-size: var(--text-sm);
        margin-block-end: var(--space-sm);
      }

      button {
        inline-size: 100%;
        padding: var(--space-xs) var(--space-sm);
        background: transparent;
        border: 1px solid var(--color-admin-border);
        border-radius: var(--radius-sm);
        color: var(--color-admin-text-muted);
        font-size: var(--text-sm);
        cursor: pointer;

        &:hover { background: var(--color-admin-surface); }
      }
    }

    .admin-main {
      padding: var(--space-xl);
      overflow-y: auto;
    }
  }
</style>
```

Create `src/routes/admin/+page.server.ts` for the dashboard:

```ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posts, comments } from '$lib/server/db/schema';
import { eq, count, and } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  const [postCounts] = await db
    .select({
      total: count(),
      published: count(
        and(eq(posts.status, 'published'))
      )
    })
    .from(posts);

  const [commentCounts] = await db
    .select({
      total: count(),
      pending: count(
        and(eq(comments.approved, false))
      )
    })
    .from(comments);

  const recentPosts = await db.query.posts.findMany({
    limit: 5,
    orderBy: (posts, { desc }) => [desc(posts.updatedAt)],
    with: { author: true }
  });

  return {
    stats: {
      totalPosts: postCounts?.total ?? 0,
      publishedPosts: postCounts?.published ?? 0,
      totalComments: commentCounts?.total ?? 0,
      pendingComments: commentCounts?.pending ?? 0
    },
    recentPosts
  };
};
```

Create `src/routes/admin/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  let { data } = $props();
</script>

<svelte:head>
  <title>Dashboard — Blog Admin</title>
</svelte:head>

<div class="admin-dashboard">
  <h1>Dashboard</h1>

  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-value">{data.stats.totalPosts}</span>
      <span class="stat-label">Total Posts</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{data.stats.publishedPosts}</span>
      <span class="stat-label">Published</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{data.stats.totalComments}</span>
      <span class="stat-label">Comments</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{data.stats.pendingComments}</span>
      <span class="stat-label">Pending Review</span>
    </div>
  </div>

  <section class="recent-posts">
    <h2>Recent Posts</h2>
    {#if data.recentPosts.length > 0}
      <ul>
        {#each data.recentPosts as post (post.id)}
          <li>
            <a href="/admin/posts/{post.id}/edit">{post.title}</a>
            <span class="post-status" class:published={post.status === 'published'}>
              {post.status}
            </span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty">No posts yet. <a href="/admin/posts/new">Create your first post.</a></p>
    {/if}
  </section>
</div>

<style>
  @layer components {
    .admin-dashboard {
      h1 {
        font-size: var(--text-2xl);
        margin-block-end: var(--space-xl);
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      gap: var(--space-md);
      margin-block-end: var(--space-2xl);
    }

    .stat-card {
      padding: var(--space-lg);
      background: var(--color-admin-surface-alt);
      border: 1px solid var(--color-admin-border);
      border-radius: var(--radius-md);
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: var(--text-3xl);
      font-weight: 700;
      margin-block-end: var(--space-xs);
    }

    .stat-label {
      font-size: var(--text-sm);
      color: var(--color-admin-text-muted);
    }

    .recent-posts {
      h2 {
        font-size: var(--text-xl);
        margin-block-end: var(--space-md);
      }

      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-sm) var(--space-md);
        border-block-end: 1px solid var(--color-admin-border);

        a { color: var(--color-admin-text); }
      }

      .post-status {
        font-size: var(--text-xs);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-full);
        background: oklch(0.45 0.02 60 / 0.2);
        color: var(--color-admin-text-muted);

        &.published {
          background: oklch(0.65 0.18 145 / 0.2);
          color: var(--color-success);
        }
      }

      .empty {
        color: var(--color-admin-text-muted);
        padding: var(--space-xl);
        text-align: center;
      }
    }
  }
</style>
```

---

## 6. CRUD for posts via form actions

This is the core of the admin panel. We implement full Create, Read, Update, Delete using form actions (Lesson 10.3) with Valibot validation (Lesson 10.6).

Create `src/lib/schemas/post.ts`:

```ts
import * as v from 'valibot';

export const postSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1, 'Title is required.')),
  slug: v.pipe(
    v.string(),
    v.minLength(1, 'Slug is required.'),
    v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only.')
  ),
  excerpt: v.pipe(v.string(), v.maxLength(300, 'Excerpt must be under 300 characters.')),
  content: v.pipe(v.string(), v.minLength(1, 'Content is required.')),
  status: v.picklist(['draft', 'published']),
  tags: v.string() // Comma-separated tag names
});

export type PostFormData = v.InferOutput<typeof postSchema>;
```

Create `src/routes/admin/posts/new/+page.svelte`:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import PostEditor from '$lib/components/admin/PostEditor.svelte';

  let { form } = $props();
</script>

<svelte:head>
  <title>New Post — Blog Admin</title>
</svelte:head>

<div class="editor-page">
  <h1>New Post</h1>
  <PostEditor action="/admin/posts/new" errors={form?.errors} values={form?.data} />
</div>

<style>
  @layer components {
    .editor-page h1 {
      font-size: var(--text-2xl);
      margin-block-end: var(--space-xl);
    }
  }
</style>
```

Create `src/routes/admin/posts/new/+page.server.ts`:

```ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import * as v from 'valibot';
import { postSchema } from '$lib/schemas/post';
import { db } from '$lib/server/db';
import { posts, tags, postTags } from '$lib/server/db/schema';
import { generateId } from '$lib/server/auth';
import { eq } from 'drizzle-orm';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.author) {
      return fail(401, { error: 'Not authenticated.' });
    }

    const formData = await request.formData();
    const rawData = {
      title: formData.get('title')?.toString() ?? '',
      slug: formData.get('slug')?.toString() ?? '',
      excerpt: formData.get('excerpt')?.toString() ?? '',
      content: formData.get('content')?.toString() ?? '',
      status: formData.get('status')?.toString() ?? 'draft',
      tags: formData.get('tags')?.toString() ?? ''
    };

    const result = v.safeParse(postSchema, rawData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.issues) {
        const path = issue.path?.[0]?.key;
        if (typeof path === 'string') errors[path] = issue.message;
      }
      return fail(400, { errors, data: rawData });
    }

    const postId = generateId();
    const now = new Date();

    // Insert the post (Lesson 16.5 — CRUD with Drizzle)
    await db.insert(posts).values({
      id: postId,
      slug: result.output.slug,
      title: result.output.title,
      excerpt: result.output.excerpt,
      content: result.output.content,
      authorId: locals.author.id,
      status: result.output.status as 'draft' | 'published',
      publishedAt: result.output.status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now
    });

    // Handle tags — create if not exists, then link
    const tagNames = result.output.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    for (const tagName of tagNames) {
      const tagSlug = tagName.replace(/\s+/g, '-');
      const existing = await db
        .select()
        .from(tags)
        .where(eq(tags.slug, tagSlug))
        .limit(1);

      let tagId: string;
      if (existing.length > 0) {
        tagId = existing[0]!.id;
      } else {
        tagId = generateId();
        await db.insert(tags).values({ id: tagId, name: tagName, slug: tagSlug });
      }

      await db.insert(postTags).values({ postId, tagId });
    }

    redirect(303, '/admin/posts');
  }
};
```

Create the shared post editor component at `src/lib/components/admin/PostEditor.svelte`:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  interface Props {
    action: string;
    errors?: Record<string, string> | null;
    values?: Record<string, string> | null;
  }

  let { action, errors = null, values = null }: Props = $props();

  let title = $state(values?.title ?? '');

  // Auto-generate slug from title (Lesson 2.7 — $derived)
  let autoSlug = $derived(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  );

  let slugManuallyEdited = $state(false);
  let slugValue = $state(values?.slug ?? '');

  let displaySlug = $derived(slugManuallyEdited ? slugValue : autoSlug);
</script>

<form method="POST" {action} use:enhance class="post-editor">
  <div class="editor-main">
    <label class="field">
      <span>Title</span>
      <input
        type="text"
        name="title"
        bind:value={title}
        required
        placeholder="Post title"
      />
      {#if errors?.title}
        <span class="field-error">{errors.title}</span>
      {/if}
    </label>

    <label class="field">
      <span>Slug</span>
      <input
        type="text"
        name="slug"
        value={displaySlug}
        oninput={(e) => {
          slugManuallyEdited = true;
          slugValue = e.currentTarget.value;
        }}
        required
        placeholder="post-slug"
      />
      {#if errors?.slug}
        <span class="field-error">{errors.slug}</span>
      {/if}
    </label>

    <label class="field">
      <span>Excerpt</span>
      <textarea
        name="excerpt"
        rows={3}
        placeholder="Brief description for SEO and post previews"
      >{values?.excerpt ?? ''}</textarea>
      {#if errors?.excerpt}
        <span class="field-error">{errors.excerpt}</span>
      {/if}
    </label>

    <label class="field">
      <span>Content (Markdown)</span>
      <textarea
        name="content"
        rows={20}
        required
        placeholder="Write your post in Markdown..."
        class="content-editor"
      >{values?.content ?? ''}</textarea>
      {#if errors?.content}
        <span class="field-error">{errors.content}</span>
      {/if}
    </label>
  </div>

  <div class="editor-sidebar">
    <div class="sidebar-section">
      <label class="field">
        <span>Status</span>
        <select name="status">
          <option value="draft" selected={values?.status !== 'published'}>Draft</option>
          <option value="published" selected={values?.status === 'published'}>Published</option>
        </select>
      </label>
    </div>

    <div class="sidebar-section">
      <label class="field">
        <span>Tags (comma-separated)</span>
        <input
          type="text"
          name="tags"
          value={values?.tags ?? ''}
          placeholder="svelte, tutorial, css"
        />
      </label>
    </div>

    <button type="submit" class="publish-btn">Save post</button>
  </div>
</form>

<style>
  @layer components {
    .post-editor {
      display: grid;
      grid-template-columns: 1fr 16rem;
      gap: var(--space-xl);

      @media (width < 768px) {
        grid-template-columns: 1fr;
      }
    }

    .editor-main {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      font-size: var(--text-sm);
      color: var(--color-admin-text-muted);
    }

    input, textarea, select {
      padding: var(--space-sm) var(--space-md);
      background: var(--color-admin-surface);
      border: 1px solid var(--color-admin-border);
      border-radius: var(--radius-sm);
      color: var(--color-admin-text);
      font-size: var(--text-base);

      &:focus {
        border-color: var(--color-primary);
        outline: none;
      }
    }

    .content-editor {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: var(--text-sm);
      line-height: 1.6;
      resize: vertical;
      min-block-size: 24rem;
    }

    .editor-sidebar {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    .sidebar-section {
      padding: var(--space-lg);
      background: var(--color-admin-surface-alt);
      border: 1px solid var(--color-admin-border);
      border-radius: var(--radius-md);
    }

    .publish-btn {
      padding: var(--space-sm) var(--space-lg);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;

      &:hover { background: var(--color-primary-hover); }
    }

    .field-error {
      color: var(--color-error);
      font-size: var(--text-xs);
    }
  }
</style>
```

Create the posts list page at `src/routes/admin/posts/+page.server.ts`:

```ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  const allPosts = await db.query.posts.findMany({
    orderBy: (posts, { desc }) => [desc(posts.updatedAt)],
    with: { author: true }
  });

  return { posts: allPosts };
};
```

Create `src/routes/admin/posts/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  let { data } = $props();
</script>

<svelte:head>
  <title>Posts — Blog Admin</title>
</svelte:head>

<div class="posts-page">
  <header class="page-header">
    <h1>Posts</h1>
    <a href="/admin/posts/new" class="new-post-btn">New post</a>
  </header>

  <div class="posts-list">
    {#each data.posts as post (post.id)}
      <div class="post-row">
        <div class="post-info">
          <a href="/admin/posts/{post.id}/edit" class="post-title">{post.title}</a>
          <span class="post-meta">
            by {post.author.name} &middot;
            {new Date(post.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <span class="post-status" class:published={post.status === 'published'}>
          {post.status}
        </span>
      </div>
    {:else}
      <p class="empty">No posts yet.</p>
    {/each}
  </div>
</div>

<style>
  @layer components {
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-block-end: var(--space-xl);

      h1 { font-size: var(--text-2xl); }
    }

    .new-post-btn {
      padding: var(--space-sm) var(--space-lg);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: var(--text-sm);
    }

    .post-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-md);
      border-block-end: 1px solid var(--color-admin-border);
    }

    .post-title {
      display: block;
      color: var(--color-admin-text);
      font-weight: 600;
    }

    .post-meta {
      font-size: var(--text-xs);
      color: var(--color-admin-text-muted);
    }

    .post-status {
      font-size: var(--text-xs);
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-full);
      background: oklch(0.45 0.02 60 / 0.2);
      color: var(--color-admin-text-muted);

      &.published {
        background: oklch(0.65 0.18 145 / 0.2);
        color: var(--color-success);
      }
    }

    .empty {
      text-align: center;
      padding: var(--space-2xl);
      color: var(--color-admin-text-muted);
    }
  }
</style>
```

Create the logout action at `src/routes/admin/logout/+page.server.ts`:

```ts
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { invalidateSession } from '$lib/server/auth';

export const actions: Actions = {
  default: async ({ cookies }) => {
    const sessionId = cookies.get('session');
    if (sessionId) await invalidateSession(sessionId);
    cookies.delete('session', { path: '/' });
    redirect(303, '/admin/login');
  }
};
```

---

## 7. Markdown rendering in Svelte

We use the `marked` library for Markdown parsing. In a production blog, you might use MDsveX (Lesson 18.6) to write Markdown files that compile directly into Svelte components.

Create `src/lib/utils/markdown.ts`:

```ts
import { marked } from 'marked';

// Configure marked for security and quality
marked.setOptions({
  gfm: true,
  breaks: false
});

export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}

/**
 * Extract a plain-text excerpt from Markdown content.
 * Used for auto-generating excerpts and search indexing.
 */
export function extractText(markdown: string, maxLength: number = 160): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '')        // Remove inline code
    .replace(/[#*_~\[\]()>!|-]/g, '') // Remove Markdown syntax
    .replace(/\n+/g, ' ')           // Collapse newlines
    .trim()
    .slice(0, maxLength);
}
```

---

## 8. Public blog pages

Create `src/routes/(blog)/+layout.svelte`:

```svelte
<script lang="ts">
  import '../../app.css';

  let { children } = $props();
</script>

<header class="blog-header">
  <nav class="container header-nav" aria-label="Blog navigation">
    <a href="/" class="logo">The Blog</a>
    <div class="nav-links">
      <a href="/">Posts</a>
      <a href="/tags">Tags</a>
      <a href="/search">Search</a>
    </div>
  </nav>
</header>

<main>
  {@render children()}
</main>

<footer class="blog-footer">
  <div class="container">
    <p>&copy; {new Date().getFullYear()} The Blog. Powered by SvelteKit.</p>
  </div>
</footer>

<style>
  @layer components {
    .blog-header {
      border-block-end: 1px solid var(--color-border);
    }

    .header-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-block: var(--space-md);
    }

    .logo {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--color-text);
    }

    .nav-links {
      display: flex;
      gap: var(--space-lg);

      a {
        font-size: var(--text-sm);
        color: var(--color-text-muted);

        &:hover { color: var(--color-text); }
      }
    }

    .blog-footer {
      margin-block-start: var(--space-3xl);
      padding: var(--space-xl) 0;
      border-block-start: 1px solid var(--color-border);
      text-align: center;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  }
</style>
```

Create `src/routes/(blog)/+page.server.ts`:

```ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  const publishedPosts = await db.query.posts.findMany({
    where: eq(posts.status, 'published'),
    orderBy: [desc(posts.publishedAt)],
    with: {
      author: true,
      postTags: {
        with: { tag: true }
      }
    }
  });

  return { posts: publishedPosts };
};
```

Create `src/routes/(blog)/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import Seo from '$lib/components/Seo.svelte';

  let { data } = $props();
</script>

<Seo
  title="The Blog"
  description="Thoughts on web development, Svelte, and building for the modern web."
/>

<div class="container prose-container">
  <header class="blog-title">
    <h1>The Blog</h1>
    <p>Thoughts on building for the web.</p>
  </header>

  <div class="post-list">
    {#each data.posts as post (post.id)}
      <article class="post-preview">
        <time datetime={post.publishedAt?.toISOString() ?? ''}>
          {post.publishedAt
            ? new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }).format(post.publishedAt)
            : 'Draft'}
        </time>
        <h2>
          <a href="/blog/{post.slug}">{post.title}</a>
        </h2>
        {#if post.excerpt}
          <p>{post.excerpt}</p>
        {/if}
        <div class="post-meta">
          <span>By {post.author.name}</span>
          {#if post.postTags.length > 0}
            <div class="tag-list">
              {#each post.postTags as pt}
                <a href="/tags/{pt.tag.slug}" class="tag">{pt.tag.name}</a>
              {/each}
            </div>
          {/if}
        </div>
      </article>
    {:else}
      <p class="empty">No posts published yet.</p>
    {/each}
  </div>
</div>

<style>
  @layer components {
    .blog-title {
      padding: var(--space-3xl) 0 var(--space-2xl);
      text-align: center;

      h1 { font-size: var(--text-4xl); }
      p { color: var(--color-text-muted); font-size: var(--text-lg); }
    }

    .post-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2xl);
      padding-block-end: var(--space-3xl);
    }

    .post-preview {
      padding-block-end: var(--space-2xl);
      border-block-end: 1px solid var(--color-border);

      time {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      h2 {
        font-size: var(--text-2xl);
        margin-block: var(--space-sm);

        a {
          color: var(--color-text);
          &:hover { color: var(--color-primary); }
        }
      }

      p {
        color: var(--color-text-muted);
        line-height: 1.7;
      }
    }

    .post-meta {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-block-start: var(--space-sm);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }

    .tag-list {
      display: flex;
      gap: var(--space-xs);
    }

    .tag {
      padding: 0.125rem var(--space-sm);
      background: oklch(0.55 0.15 240 / 0.08);
      color: var(--color-primary);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
    }

    .empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--color-text-muted);
    }
  }
</style>
```

---

## 9. Prerendered post pages with entries()

For published posts, we use SSG with `entries()` (Lesson 9A.10) so that every post page is prerendered at build time. This gives us zero TTFB and perfect SEO.

Create `src/routes/(blog)/blog/[slug]/+page.server.ts`:

```ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
  const post = await db.query.posts.findFirst({
    where: and(
      eq(posts.slug, params.slug),
      eq(posts.status, 'published')
    ),
    with: {
      author: true,
      postTags: { with: { tag: true } },
      comments: true
    }
  });

  if (!post) {
    error(404, { message: 'Post not found' });
  }

  // Only show approved comments
  const approvedComments = post.comments.filter((c) => c.approved);

  return {
    post,
    comments: approvedComments
  };
};

// Prerender all published posts (Lesson 9A.10)
export async function entries() {
  const publishedPosts = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.status, 'published'));

  return publishedPosts.map((p) => ({ slug: p.slug }));
}

export const prerender = true;
```

Create `src/routes/(blog)/blog/[slug]/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { renderMarkdown } from '$lib/utils/markdown';
  import Seo from '$lib/components/Seo.svelte';
  import CommentSection from '$lib/components/CommentSection.svelte';

  let { data } = $props();
  let post = $derived(data.post);
  let htmlContent = $derived(renderMarkdown(post.content));

  let jsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Blog'
    }
  });
</script>

<Seo
  title={post.title}
  description={post.excerpt}
  canonical={`https://blog.example.com/blog/${post.slug}`}
  ogType="article"
  {jsonLd}
/>

<article class="container prose-container blog-post">
  <header class="post-header">
    <a href="/" class="back-link">&larr; All posts</a>

    <h1>{post.title}</h1>

    <div class="post-meta">
      <span>By {post.author.name}</span>
      <time datetime={post.publishedAt?.toISOString() ?? ''}>
        {post.publishedAt
          ? new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }).format(post.publishedAt)
          : ''}
      </time>
    </div>

    {#if post.postTags.length > 0}
      <div class="post-tags">
        {#each post.postTags as pt}
          <a href="/tags/{pt.tag.slug}" class="tag">{pt.tag.name}</a>
        {/each}
      </div>
    {/if}
  </header>

  <div class="prose">
    {@html htmlContent}
  </div>

  <CommentSection postId={post.id} comments={data.comments} />
</article>

<style>
  @layer components {
    .blog-post {
      padding-block: var(--space-2xl) var(--space-3xl);
    }

    .back-link {
      display: inline-block;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      margin-block-end: var(--space-xl);

      &:hover { color: var(--color-primary); }
    }

    .post-header {
      margin-block-end: var(--space-2xl);
      padding-block-end: var(--space-xl);
      border-block-end: 1px solid var(--color-border);

      h1 {
        font-size: var(--text-4xl);
        margin-block-end: var(--space-md);
      }
    }

    .post-meta {
      display: flex;
      gap: var(--space-md);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      margin-block-end: var(--space-md);
    }

    .post-tags {
      display: flex;
      gap: var(--space-xs);
    }

    .tag {
      padding: 0.125rem var(--space-sm);
      background: oklch(0.55 0.15 240 / 0.08);
      color: var(--color-primary);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
    }
  }

  /* Prose styles for Markdown-rendered content */
  .prose :global(h2) {
    font-size: var(--text-2xl);
    margin-block: var(--space-2xl) var(--space-md);
  }

  .prose :global(h3) {
    font-size: var(--text-xl);
    margin-block: var(--space-xl) var(--space-sm);
  }

  .prose :global(p) {
    margin-block-end: var(--space-md);
    line-height: 1.8;
  }

  .prose :global(pre) {
    padding: var(--space-lg);
    background: oklch(0.15 0.015 250);
    color: oklch(0.92 0.01 250);
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin-block: var(--space-lg);
    font-size: var(--text-sm);
    line-height: 1.6;
  }

  .prose :global(code) {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }

  .prose :global(:not(pre) > code) {
    padding: 0.125rem 0.375rem;
    background: oklch(0.55 0.15 240 / 0.08);
    border-radius: var(--radius-sm);
    font-size: 0.9em;
  }

  .prose :global(ul), .prose :global(ol) {
    padding-inline-start: var(--space-xl);
    margin-block: var(--space-md);
  }

  .prose :global(li) {
    margin-block-end: var(--space-sm);
    line-height: 1.7;
  }

  .prose :global(blockquote) {
    border-inline-start: 3px solid var(--color-primary);
    padding-inline-start: var(--space-lg);
    margin-block: var(--space-lg);
    color: var(--color-text-muted);
    font-style: italic;
  }
</style>
```

---

## 10. Comment system with remote functions

Comments use remote functions (Lesson 9B.7 — command remote functions) for mutations and traditional load data for the initial comment list.

Create `src/lib/components/CommentSection.svelte`:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Comment } from '$lib/server/db/schema';

  interface Props {
    postId: string;
    comments: Comment[];
  }

  let { postId, comments }: Props = $props();

  let showForm = $state(false);
  let submitted = $state(false);
</script>

<section class="comments-section" aria-label="Comments">
  <h2>Comments ({comments.length})</h2>

  {#if comments.length > 0}
    <div class="comments-list">
      {#each comments as comment (comment.id)}
        <article class="comment">
          <header class="comment-header">
            <strong>{comment.authorName}</strong>
            <time datetime={comment.createdAt.toISOString()}>
              {new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }).format(comment.createdAt)}
            </time>
          </header>
          <p>{comment.content}</p>
        </article>
      {/each}
    </div>
  {:else}
    <p class="no-comments">No comments yet. Be the first to share your thoughts.</p>
  {/if}

  {#if submitted}
    <div class="success-message" role="alert">
      <p>Thank you! Your comment has been submitted for review.</p>
    </div>
  {:else if showForm}
    <form
      method="POST"
      action="/blog/{postId}?/comment"
      use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === 'success') {
            submitted = true;
          }
          await update();
        };
      }}
      class="comment-form"
    >
      <input type="hidden" name="postId" value={postId} />

      <div class="form-row">
        <label>
          <span>Name</span>
          <input type="text" name="authorName" required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" name="authorEmail" required />
        </label>
      </div>

      <label>
        <span>Comment</span>
        <textarea name="content" rows={4} required></textarea>
      </label>

      <button type="submit">Submit comment</button>
    </form>
  {:else}
    <button class="add-comment-btn" onclick={() => { showForm = true; }}>
      Leave a comment
    </button>
  {/if}
</section>

<style>
  @layer components {
    .comments-section {
      margin-block-start: var(--space-3xl);
      padding-block-start: var(--space-2xl);
      border-block-start: 1px solid var(--color-border);

      h2 {
        font-size: var(--text-xl);
        margin-block-end: var(--space-lg);
      }
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
      margin-block-end: var(--space-xl);
    }

    .comment {
      padding: var(--space-lg);
      background: var(--color-surface-elevated);
      border-radius: var(--radius-md);
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-block-end: var(--space-sm);

      time {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }
    }

    .comment p {
      line-height: 1.7;
      color: var(--color-text-muted);
    }

    .no-comments {
      color: var(--color-text-muted);
      margin-block-end: var(--space-lg);
    }

    .comment-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      padding: var(--space-xl);
      background: var(--color-surface-elevated);
      border-radius: var(--radius-md);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);

      @media (width < 640px) { grid-template-columns: 1fr; }
    }

    label {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      font-size: var(--text-sm);
    }

    input, textarea {
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);

      &:focus {
        border-color: var(--color-primary);
        outline: none;
      }
    }

    button[type='submit'] {
      align-self: start;
      padding: var(--space-sm) var(--space-lg);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
    }

    .add-comment-btn {
      padding: var(--space-sm) var(--space-lg);
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      cursor: pointer;

      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    }

    .success-message {
      padding: var(--space-lg);
      background: oklch(0.65 0.18 145 / 0.08);
      color: var(--color-success);
      border-radius: var(--radius-md);
      text-align: center;
    }
  }
</style>
```

---

## 11. Full-text search with $derived.by

The search page fetches all published posts and filters them client-side using `$derived.by` (Lesson 2.8). For a small-to-medium blog, this is more responsive than server-side search because there is no round-trip delay per keystroke.

Create `src/routes/(blog)/search/+page.server.ts`:

```ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  const publishedPosts = await db.query.posts.findMany({
    where: eq(posts.status, 'published'),
    orderBy: [desc(posts.publishedAt)],
    with: { author: true }
  });

  return { posts: publishedPosts };
};
```

Create `src/routes/(blog)/search/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import Seo from '$lib/components/Seo.svelte';

  let { data } = $props();
  let query = $state('');

  // Client-side full-text search with $derived.by (Lesson 2.8)
  let results = $derived.by(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return data.posts.filter((post) => {
      const searchable = [
        post.title,
        post.excerpt,
        post.content,
        post.author.name
      ]
        .join(' ')
        .toLowerCase();

      // Support multi-word search — all terms must match
      const terms = q.split(/\s+/);
      return terms.every((term) => searchable.includes(term));
    });
  });
</script>

<Seo title="Search" description="Search blog posts." />

<div class="container prose-container">
  <header class="search-header">
    <h1>Search</h1>
    <input
      type="search"
      placeholder="Search posts..."
      bind:value={query}
      autofocus
      aria-label="Search posts"
      class="search-input"
    />
  </header>

  {#if query.trim()}
    <p class="results-count">
      {results.length} result{results.length === 1 ? '' : 's'}
    </p>

    <div class="results-list">
      {#each results as post (post.id)}
        <article class="result">
          <h2><a href="/blog/{post.slug}">{post.title}</a></h2>
          <p>{post.excerpt}</p>
        </article>
      {:else}
        <p class="empty">No posts match your search.</p>
      {/each}
    </div>
  {:else}
    <p class="hint">Start typing to search all posts.</p>
  {/if}
</div>

<style>
  @layer components {
    .search-header {
      padding: var(--space-3xl) 0 var(--space-xl);

      h1 {
        font-size: var(--text-3xl);
        margin-block-end: var(--space-lg);
      }
    }

    .search-input {
      inline-size: 100%;
      padding: var(--space-md);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--text-lg);

      &:focus {
        border-color: var(--color-primary);
        outline: none;
      }
    }

    .results-count {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      margin-block-end: var(--space-lg);
    }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
      padding-block-end: var(--space-3xl);
    }

    .result {
      padding-block-end: var(--space-xl);
      border-block-end: 1px solid var(--color-border);

      h2 {
        font-size: var(--text-xl);
        margin-block-end: var(--space-sm);

        a {
          color: var(--color-text);
          &:hover { color: var(--color-primary); }
        }
      }

      p {
        color: var(--color-text-muted);
        line-height: 1.7;
      }
    }

    .empty, .hint {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--color-text-muted);
    }
  }
</style>
```

**Why client-side search?** For a blog with hundreds of posts, the dataset is small enough to send to the client and filter with `$derived.by`. This gives instant results as the user types — no network latency. For a blog with thousands of posts, you would switch to a server-side search endpoint (SQLite FTS5 or a dedicated search index like Meilisearch).

---

## 12. Dynamic sitemap and RSS feed

Create `src/routes/sitemap.xml/+server.ts` (Lesson 13.8):

```ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
  const publishedPosts = await db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt })
    .from(posts)
    .where(eq(posts.status, 'published'));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://blog.example.com</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://blog.example.com/search</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  ${publishedPosts
    .map(
      (post) => `
  <url>
    <loc>https://blog.example.com/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'max-age=3600' }
  });
};
```

Create `src/routes/feed.xml/+server.ts` for the RSS feed:

```ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
  const publishedPosts = await db.query.posts.findMany({
    where: eq(posts.status, 'published'),
    orderBy: [desc(posts.publishedAt)],
    limit: 20,
    with: { author: true }
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Blog</title>
    <link>https://blog.example.com</link>
    <description>Thoughts on web development, Svelte, and the modern web.</description>
    <language>en</language>
    <atom:link href="https://blog.example.com/feed.xml" rel="self" type="application/rss+xml"/>
    ${publishedPosts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://blog.example.com/blog/${post.slug}</link>
      <description>${escapeXml(post.excerpt)}</description>
      <author>${escapeXml(post.author.email)} (${escapeXml(post.author.name)})</author>
      <pubDate>${post.publishedAt?.toUTCString() ?? ''}</pubDate>
      <guid isPermaLink="true">https://blog.example.com/blog/${post.slug}</guid>
    </item>`
      )
      .join('')}
  </channel>
</rss>`.trim();

  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml', 'Cache-Control': 'max-age=3600' }
  });
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

---

## 13. SEO optimization

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

  let fullTitle = $derived(`${title} — Blog Platform`);
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if canonical}
    <link rel="canonical" href={canonical} />
  {/if}
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content={ogType} />
  <meta property="og:image" content={ogImage} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <link rel="alternate" type="application/rss+xml" title="Blog RSS Feed" href="/feed.xml" />
  {#if jsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
  {/if}
</svelte:head>
```

---

## 14. Deployment

The blog platform requires a server (for admin actions, comments, and search). Use `adapter-node` or `adapter-vercel`:

```bash
pnpm build
node build/index.js
```

For production, switch to Turso/LibSQL for the database (as covered in Lesson 16.2).

### File tree — final

```
blog-platform/
├── src/
│   ├── app.css
│   ├── app.html
│   ├── app.d.ts
│   ├── hooks.server.ts
│   ├── lib/
│   │   ├── components/
│   │   │   ├── CommentSection.svelte
│   │   │   ├── Seo.svelte
│   │   │   └── admin/
│   │   │       └── PostEditor.svelte
│   │   ├── schemas/
│   │   │   └── post.ts
│   │   ├── server/
│   │   │   ├── auth.ts
│   │   │   └── db/
│   │   │       ├── index.ts
│   │   │       └── schema.ts
│   │   └── utils/
│   │       └── markdown.ts
│   └── routes/
│       ├── +layout.svelte
│       ├── (blog)/
│       │   ├── +layout.svelte
│       │   ├── +page.svelte
│       │   ├── +page.server.ts
│       │   ├── blog/
│       │   │   └── [slug]/
│       │   │       ├── +page.svelte
│       │   │       └── +page.server.ts
│       │   └── search/
│       │       ├── +page.svelte
│       │       └── +page.server.ts
│       ├── admin/
│       │   ├── +layout.svelte
│       │   ├── +layout.server.ts
│       │   ├── +page.svelte
│       │   ├── +page.server.ts
│       │   ├── login/
│       │   │   ├── +page.svelte
│       │   │   └── +page.server.ts
│       │   ├── logout/
│       │   │   └── +page.server.ts
│       │   └── posts/
│       │       ├── +page.svelte
│       │       ├── +page.server.ts
│       │       └── new/
│       │           ├── +page.svelte
│       │           └── +page.server.ts
│       ├── sitemap.xml/
│       │   └── +server.ts
│       └── feed.xml/
│           └── +server.ts
├── drizzle/
├── drizzle.config.ts
├── svelte.config.js
└── package.json
```

---

## 15. Final result

You have a complete blog platform with:

- **Markdown rendering** — `marked` library for rich content display
- **Admin panel** — authenticated dashboard with post stats and quick actions
- **CRUD for posts** — create, edit (via form actions), delete with Valibot validation
- **Database** — Drizzle ORM with authors, posts, tags (many-to-many), and comments
- **Comment system** — public comment submission with moderation queue
- **Dynamic sitemap** — auto-generated XML sitemap from published posts
- **RSS feed** — full RSS 2.0 feed with Atom link
- **Prerendered posts** — SSG with `entries()` for published content
- **Full-text search** — instant client-side filtering with `$derived.by`
- **SEO** — Article JSON-LD, Open Graph, canonical URLs

### What to test

1. Log into the admin panel and create a post
2. Publish the post and verify it appears on the public blog
3. Submit a comment and check it enters the moderation queue
4. Search for posts using the search page
5. Visit `/sitemap.xml` and `/feed.xml`
6. View page source on a blog post to see JSON-LD Article schema

---

## 16. What you practiced

- **$state, $derived, $derived.by** — form state, search filtering, computed slugs (Module 2, Lessons 2.2, 2.7, 2.8)
- **$effect** — reactive side effects for UI state (Module 2, Lesson 2.9)
- **Load functions** — fetching posts, comments, stats (Module 9A, Lesson 9A.2)
- **SSG with entries()** — prerendering published post pages (Module 9A, Lesson 9A.10)
- **Remote functions** — comment submission (Module 9B, Lesson 9B.7)
- **Form actions** — CRUD mutations for posts (Module 10, Lesson 10.3)
- **Named actions** — comment action on post pages (Module 10, Lesson 10.4)
- **use:enhance** — progressive enhancement (Module 10, Lesson 10.5)
- **Server-side validation** — Valibot schema enforcement (Module 10, Lesson 10.6)
- **<svelte:head>** — per-page meta tags (Module 13, Lesson 13.2)
- **JSON-LD** — Article structured data (Module 13, Lesson 13.6)
- **Dynamic sitemap** — auto-generated from database (Module 13, Lesson 13.8)
- **Authentication** — session-based admin login (Module 15, Lessons 15.2, 15.4)
- **Protected routes** — layout-level auth guard (Module 15, Lesson 15.5)
- **Drizzle schema** — posts, tags, authors, comments with relations (Module 16, Lessons 16.3, 16.6)
- **Drizzle CRUD** — insert, select, update, delete (Module 16, Lesson 16.5)
- **Database in load functions** — querying posts for pages (Module 16, Lesson 16.7)
- **Database in form actions** — creating/updating posts (Module 16, Lesson 16.8)
- **Custom preprocessors** — Markdown rendering (Module 18, Lesson 18.6)
- **PE7 CSS** — @layer architecture, OKLCH tokens, fluid typography (Module 1, Lesson 1.5)
