---
module: 16
lesson: 16.2
title: Installing Drizzle + SQLite
duration: 35 minutes
prerequisites:
  - Lesson 16.1 (understanding why a database is needed)
  - pnpm package management basics (Module 1)
  - TypeScript configuration awareness
learning_objectives:
  - Install drizzle-orm, better-sqlite3, drizzle-kit, and their type packages using pnpm
  - Create a drizzle.config.ts that points to the SQLite file and schema path
  - Establish a typed database connection using the drizzle() wrapper
  - Explain why better-sqlite3 is synchronous and how that benefits SvelteKit
  - Verify the database file is created and the connection works
status: ready
---

# Lesson 16.2 — Installing Drizzle + SQLite

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Setting up the Drizzle ORM toolchain

### 1.1 What the problem is

You have decided you need a database. But databases speak SQL, a language designed in the 1970s. You are writing TypeScript. The gap between these two worlds is where bugs hide: misspelled column names, wrong types, queries that return objects your code does not expect. You could write raw SQL strings and hope for the best, or you could use an **ORM** (Object-Relational Mapper) that bridges the gap with type safety.

### 1.2 Why Drizzle ORM

Drizzle is a TypeScript-first ORM that takes a unique position: it looks like SQL, it generates SQL, but it gives you full TypeScript autocompletion and type checking. Unlike heavier ORMs (Prisma, TypeORM) that invent their own query language, Drizzle's API maps 1:1 to SQL concepts. If you know `SELECT`, `INSERT`, `WHERE`, and `JOIN`, you already know Drizzle's API.

The four packages you need:

| Package | Purpose | Install type |
|---------|---------|-------------|
| `drizzle-orm` | The query builder and runtime | `dependencies` |
| `better-sqlite3` | The SQLite driver (C++ addon for Node.js) | `dependencies` |
| `drizzle-kit` | CLI tool for migrations and schema management | `devDependencies` |
| `@types/better-sqlite3` | TypeScript type declarations for the driver | `devDependencies` |

### 1.3 Why better-sqlite3 specifically

Node.js has several SQLite packages. `better-sqlite3` is the best choice for SvelteKit because it is **synchronous**. That sounds wrong — "isn't async always better in Node.js?" — but for SQLite running on the same machine, synchronous is actually faster. There is no network latency to wait for. The database file is on the same disk. A synchronous call avoids the overhead of promises and event-loop scheduling for an operation that completes in microseconds.

SvelteKit load functions and form actions already run on the server inside an async context. A synchronous database call inside an async function works perfectly — it blocks only the current request handler, not the entire event loop (because SvelteKit uses a worker model for handling requests).

### 1.4 The drizzle.config.ts file

Drizzle Kit (the CLI tool) needs a configuration file to know where your schema lives and where to put migrations:

```typescript
// drizzle.config.ts (project root)
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/lib/server/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: './data/dev.db'
    }
});
```

- `schema` — tells Drizzle Kit where your table definitions live
- `out` — where generated migration SQL files go
- `dialect` — which SQL dialect to generate (sqlite, postgresql, mysql)
- `dbCredentials.url` — path to the SQLite file for local development

### 1.5 The drizzle() connection

The database connection is created once and reused across all requests:

```typescript
// src/lib/server/db/index.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('data/dev.db');
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
```

The `{ schema }` argument enables Drizzle's relational query API (the `db.query.tableName` syntax you will use in Lesson 16.6). WAL (Write-Ahead Logging) mode improves concurrent read performance — multiple load functions can read simultaneously without blocking each other.

### 1.6 The `$lib/server/` convention

Notice the path: `src/lib/server/db/index.ts`. The `server` directory inside `$lib` is special in SvelteKit. Any file under `$lib/server/` can only be imported by server-side code (`+page.server.ts`, `+server.ts`, hooks). If a client-side file tries to import it, SvelteKit throws a build error. This is a security feature: database credentials and queries never leak to the browser.

## 2. Style it — The connection status indicator

The mini-build shows a "connection established" confirmation card. Styling follows PE7:

- A small status badge with `var(--color-success)` background and a pulsing dot (respecting `prefers-reduced-motion`)
- The card uses `var(--color-surface-2)` with `var(--radius-lg)` corners
- Database path displayed in `code` font with `var(--color-brand)` accent
- Per-page personality: `--color-brand: oklch(60% 0.2 250)` — a deep blue suggesting technical infrastructure

## 3. Interact — Module-level singletons in TypeScript

The TypeScript concept here is the **module singleton pattern**. When you write `export const db = drizzle(...)` at the top level of a module, Node.js executes that code exactly once — the first time any file imports from it. Every subsequent import receives the same `db` instance. This is not a class, not a factory, not a dependency injection container — it is simply how ES modules work.

```typescript
// This runs ONCE, no matter how many files import `db`
const sqlite = new Database('data/dev.db');
export const db = drizzle(sqlite, { schema });
```

Why this matters: opening a database connection is expensive (file handles, memory allocation, WAL setup). You want exactly one connection shared across all request handlers. The module singleton gives you that for free.

The mistake to avoid: do not create the connection inside a function that runs per-request:

```typescript
// WRONG — opens a new database connection on every request
export function getDb() {
    const sqlite = new Database('data/dev.db'); // wasteful!
    return drizzle(sqlite, { schema });
}
```

This leaks file handles and eventually crashes your server. The top-level `export const db` pattern avoids this entirely.

## 4. Mini-build — Database connection verification page

**File:** `src/routes/modules/16-database/02-installing-drizzle/+page.svelte`

This page imports the database instance (via a server load function) and displays connection metadata: the database path, SQLite version, WAL mode status, and table count. It proves the installation works.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/16-database/02-installing-drizzle`.

### DevTools verification

1. Open the Network tab. The page is server-rendered — all database info is in the initial HTML response.
2. View the page source (Ctrl+U). Confirm that no JavaScript imports from `better-sqlite3` appear in the client bundle.
3. Check the terminal where `pnpm dev` runs. You should see no errors about `better-sqlite3` — it loads cleanly as a native addon.
4. Look in your project's file system: a `data/dev.db` file now exists. This is your database.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why are drizzle-kit and @types/better-sqlite3 installed as devDependencies rather than regular dependencies?</summary>

`drizzle-kit` is a CLI tool used only during development (to generate and run migrations). It is never imported by your application code at runtime. `@types/better-sqlite3` provides TypeScript type declarations that are used only at compile time — they produce no JavaScript output. Neither package needs to exist in the production deployment.
</details>

<details>
<summary><strong>Q2.</strong> Explain why better-sqlite3's synchronous API is not a problem in SvelteKit.</summary>

SQLite runs on the same machine as the Node.js process. A synchronous call to read or write completes in microseconds (no network round-trip). SvelteKit's request handlers are already async functions, so a synchronous database call inside them blocks only that particular handler's execution, not the event loop itself. For local-disk SQLite operations, the time spent is negligible compared to the network latency of sending the response.
</details>

<details>
<summary><strong>Q3.</strong> What does `sqlite.pragma('journal_mode = WAL')` do and why should you enable it?</summary>

WAL (Write-Ahead Logging) changes how SQLite handles concurrent access. Without WAL, a write operation blocks all readers. With WAL, readers can continue reading from the database while a write is in progress — they see the state from before the write started. This matters in SvelteKit because multiple load functions might query the database simultaneously (e.g., layout + page loads running in parallel).
</details>

<details>
<summary><strong>Q4.</strong> What happens if you accidentally import from `$lib/server/db` in a +page.svelte file?</summary>

SvelteKit's build step detects the illegal import and throws an error: "Cannot import $lib/server/db/index.ts into client-side code". The build fails and the dev server shows the error in the browser. This is a safety feature that prevents database credentials, connection logic, and server-only packages from being bundled into client JavaScript.
</details>

<details>
<summary><strong>Q5.</strong> Why is creating the database connection at the module's top level (as a singleton) better than creating it inside each request handler?</summary>

Opening a database connection involves file handle allocation, memory mapping, and WAL setup — relatively expensive operations. A module-level `export const db` runs this setup exactly once (when the module first loads) and reuses the same connection for every request. Creating a new connection per request wastes resources, leaks file handles over time, and can eventually crash the process with "too many open files" errors.
</details>

## 6. Common mistakes

- **Forgetting to create the `data/` directory.** The `db/index.ts` file in this project handles this with `mkdirSync('data', { recursive: true })`, but if you set up your own project without this line, `better-sqlite3` throws `SQLITE_CANTOPEN: unable to open database file`. Always ensure the parent directory exists before opening a SQLite database.
- **Not adding `data/` to `.gitignore`.** The SQLite database file contains actual data and grows over time. It should never be committed to version control. This project's `.gitignore` already includes `data/` — check yours does too.
- **Installing `sql.js` instead of `better-sqlite3`.** `sql.js` is a WebAssembly port of SQLite that runs in the browser. It is much slower and does not support WAL mode. For server-side SvelteKit, always use `better-sqlite3`, which is a native C++ addon compiled for your platform.
- **Putting `drizzle.config.ts` inside `src/`.** The config file must be at the project root (next to `package.json`) because `drizzle-kit` looks for it there by default. If you nest it deeper, the CLI will not find it and will use default settings that do not match your project structure.

## 7. What's next

Lesson 16.3 defines your first database schema using Drizzle's `sqliteTable` function — typed columns, primary keys, defaults, and timestamps that map directly to SQLite's type system.
