---
module: 16
lesson: 16.1
title: What a database is and why SvelteKit needs one
duration: 40 minutes
prerequisites:
  - Module 10 form actions and in-memory stores
  - Module 9a server-side load functions
  - Basic understanding of SvelteKit's server/client split
learning_objectives:
  - Explain why in-memory data disappears when a server restarts
  - Define what a database is and what ACID guarantees mean for your data
  - Compare SQL and NoSQL databases and justify choosing SQL for structured data
  - Identify the exact moment a SvelteKit app needs persistent storage
  - Describe how a database fits into the SvelteKit request lifecycle
status: ready
---

# Lesson 16.1 — What a database is and why SvelteKit needs one

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The in-memory array problem and the case for persistence

### 1.1 What the problem is

In Module 10 you built a notes app backed by a plain TypeScript array living inside a server file. It worked — form actions pushed new notes into the array, load functions read from it, and users saw their data on screen. But restart the dev server and everything vanishes. Deploy to production and your data lasts exactly until the next deploy, which on most platforms means seconds.

This is the **in-memory array problem**. Variables in a server process live only as long as that process runs. In serverless environments (Vercel, Cloudflare Workers, Netlify Functions) a new process can spawn on every single request, meaning your array is empty every time. Even on long-lived servers, a crash, a redeploy, or a scaling event wipes everything.

The fix is a **database** — a separate program whose sole job is to store data reliably and give it back when asked, regardless of what happens to your application server.

### 1.2 What a database actually is

A database is a program that runs alongside your application (or on a remote machine) and manages data on disk. When your SvelteKit server wants to save a note, it sends a command to the database. The database writes the data to a durable medium — an SSD, a distributed storage cluster, or a file on your laptop — and confirms the write succeeded. When your server wants to read that note back, it sends a query and gets structured results.

The key insight: the database is **separate** from your application process. Restarting SvelteKit does not restart the database. Deploying new code does not delete the database files. Scaling from one server to ten servers works because they all talk to the same database.

### 1.3 ACID — the four promises a database makes

Serious databases (the kind you want for real applications) guarantee four properties known by the acronym **ACID**:

- **Atomicity** — a group of operations either all succeed or all fail. If you insert a note and its tags together, you never end up with the note saved but the tags missing.
- **Consistency** — the database enforces rules you define. A "unique email" constraint means the database itself will reject a duplicate, even if your app has a bug.
- **Isolation** — two requests happening at the same time cannot corrupt each other's work. The database handles concurrency so your code does not have to.
- **Durability** — once the database says "write confirmed", the data survives power failures, crashes, and restarts. It is on disk, not in RAM.

A JavaScript array provides none of these guarantees. That is why you need a real database.

### 1.4 SQL vs NoSQL — and why this course chooses SQL

Databases come in two broad families:

**SQL databases** (SQLite, PostgreSQL, MySQL) store data in structured tables with columns and rows. You define a schema up front — "a note has a title column of type text and a user_id column of type integer". The database enforces this shape. Queries use SQL (Structured Query Language), a 50-year-old language specifically designed for asking questions about structured data.

**NoSQL databases** (MongoDB, Redis, DynamoDB) store data in more flexible shapes — JSON documents, key-value pairs, or wide-column stores. They sacrifice some structure for flexibility or specific performance characteristics.

For this course we use **SQLite**, which is a SQL database stored in a single file on disk. The reasons:

1. **Zero infrastructure.** No separate server to install or configure. The database is a file at `data/dev.db` in your project.
2. **Production-viable.** SQLite handles millions of reads per second. Turso (a cloud SQLite service) and LibSQL make it deployable at scale.
3. **Perfect for learning SQL.** The concepts transfer directly to PostgreSQL or MySQL when you need them.
4. **Typed end-to-end.** Drizzle ORM gives you TypeScript types derived directly from your schema, so your editor catches mismatches between code and database.

### 1.5 Where the database fits in SvelteKit's architecture

The request lifecycle with a database looks like this:

1. User visits `/notes` in the browser.
2. SvelteKit calls the `load` function in `+page.server.ts`.
3. The load function calls `db.select().from(notes)` — a Drizzle query.
4. Drizzle translates that call into SQL: `SELECT * FROM notes`.
5. SQLite reads the data from `data/dev.db` and returns rows.
6. Drizzle maps those rows into typed TypeScript objects.
7. The load function returns the objects as page data.
8. SvelteKit renders the page with the data and sends HTML to the browser.

For writes, the same pattern applies but inside form actions or remote functions: the user submits a form, SvelteKit calls your action, the action calls `db.insert()`, Drizzle translates to SQL, SQLite writes to disk, and the action returns success or failure.

All database code lives inside `$lib/server/` or in `+page.server.ts` files. It never runs in the browser. Drizzle and better-sqlite3 are server-only packages — SvelteKit's `$lib/server/` convention enforces this at build time.

### 1.6 The spectrum of persistence options

Before committing to a SQL database, it helps to see where it sits among the alternatives:

| Storage | Persistence | Structure | Best for |
|---------|-------------|-----------|----------|
| JavaScript variable | Process lifetime only | None | Caching, ephemeral state |
| File system (JSON) | Disk — survives restarts | Weak (whole file read/write) | Config, simple key-value |
| SQLite | Disk — survives everything | Strong (tables, constraints) | Apps with < 1M daily requests |
| PostgreSQL | Disk + replication | Strong + advanced features | Multi-server, high concurrency |
| Redis | Memory + optional disk | Key-value / data structures | Caching, sessions, queues |

SQLite occupies a sweet spot: it provides full ACID guarantees, SQL query power, and TypeScript type safety (via Drizzle), with zero infrastructure overhead. You do not outgrow it until you need concurrent writes from multiple server processes — at which point you graduate to PostgreSQL, keeping the same Drizzle code with a different dialect configuration.

### 1.7 How a database query actually executes

When your SvelteKit load function calls `db.select().from(notes).all()`, here is what happens at each layer:

1. **Drizzle** builds a SQL string: `SELECT * FROM notes`
2. **better-sqlite3** passes this string to the SQLite C library (compiled as a native Node.js addon)
3. **SQLite** parses the SQL, creates a query plan (which index to use, how to scan), and executes it against the B-tree data structures in the `.db` file
4. **SQLite** returns rows as C structures
5. **better-sqlite3** converts C structures to JavaScript objects
6. **Drizzle** maps the result to your TypeScript types (column names, type conversions)
7. **Your load function** receives a typed array like `{ id: number; title: string; ... }[]`

This entire process completes in microseconds for typical queries on a local SQLite file. There is no network hop, no connection pooling, no authentication — the database is a file on the same disk.

### 1.8 When NOT to use a database

Not every piece of state belongs in a database:

- **UI state** (which tab is active, whether a modal is open) — belongs in `$state`
- **Ephemeral server state** (rate limit counters, active WebSocket connections) — belongs in memory (acceptable to lose on restart)
- **Configuration** (environment variables, feature flags) — belongs in `.env` files or a config service
- **Large binary files** (images, videos, documents) — belong in object storage (S3, R2), with the database storing only the URL/path reference

The database is for **structured data that must survive process restarts and be queryable**. User accounts, notes, orders, relationships — these are database records. Transient counters, connection pools, and UI preferences are not.

## Deep Dive

**Why this matters at scale.** The decision of "what goes in the database versus what stays in memory" affects every aspect of your application's reliability. Data in the database survives crashes, deploys, scaling events, and hardware failures. Data in memory vanishes the moment anything goes wrong. Teams that put the wrong things in the database (ephemeral state, rendering cache) pay with unnecessary latency. Teams that keep the wrong things out of the database (user sessions, important counters) pay with data loss on every deploy.

**The mental model.** Think of the database as a filing cabinet and in-memory state as a whiteboard. The whiteboard is fast and convenient — you can sketch, erase, and rearrange instantly. But when you leave the office (server restarts), the whiteboard is wiped clean. The filing cabinet is slower to access (you must open drawers, flip through folders) but everything you put there stays permanently. Smart workers keep their current task on the whiteboard and their completed work in the cabinet.

**Edge cases.** SQLite's single-writer limitation means that if two requests try to write simultaneously, one must wait. For read-heavy workloads (typical of web applications), this is never a problem — WAL mode allows concurrent reads. For write-heavy workloads (e.g., logging every page view to the database), you may see "SQLITE_BUSY" errors under load. The solution is either write-batching (queue writes and flush periodically) or graduating to PostgreSQL. Another edge case: the `.db` file can become corrupted if the process is killed with `SIGKILL` during a write on a filesystem without journaling. WAL mode provides crash safety on modern filesystems.

**Performance.** SQLite reads complete in 5-50 microseconds for indexed lookups. That is 0.005-0.05 milliseconds — effectively instant compared to the 50-200ms network round-trips that dominate web response times. Even complex queries with JOINs across multiple tables typically complete in under 1ms for datasets under 100,000 rows. The performance ceiling you will hit first is write throughput (SQLite allows approximately 10,000-50,000 writes per second depending on transaction size), not read speed.

**Cross-module connections.** This lesson connects to Module 10 (in-memory stores — understanding why they are insufficient), Module 15 (auth — sessions and users need persistence), Module 9a (load functions — the database query lives inside load), and Module 17 (realtime — change notifications from the database can trigger SSE events to connected clients).

## 2. Style it — The database status card

For this lesson's mini-build we create a status card that shows whether the database is connected and how many records exist. The card uses PE7 tokens:

- Background `var(--color-surface-2)` with a `var(--color-brand)` left border to signal "system info"
- Status indicators use `var(--color-success)` for connected and `var(--color-error)` for disconnected
- Spacing uses `var(--space-md)` and `var(--space-lg)` for comfortable reading
- Touch-friendly layout with minimum 44px interactive areas
- Per-page color personality set via `--color-brand: oklch(65% 0.19 195)` — a teal tone suggesting data and reliability

## 3. Interact — Demonstrating the impermanence of in-memory data

The core TypeScript concept in this lesson is **module-level state lifetime**. When you declare a variable at the top level of a `.ts` file on the server, that variable lives as long as the Node.js process. Watch what happens:

```typescript
// src/routes/modules/16-database/01-what-is-database/_lib/memory-store.ts
let visitCount: number = 0;

export function increment(): number {
	visitCount += 1;
	return visitCount;
}

export function getCount(): number {
	return visitCount;
}
```

Every time you load the page, the count increases — it persists across requests because the module stays in memory. But restart the dev server (`Ctrl+C`, then `pnpm dev`) and the count resets to zero. This proves the problem: module-level state is volatile.

The fix is to delegate storage to something that survives process restarts. In the mini-build we show the count from both an in-memory variable and a database query side-by-side, and let the student restart the server to see the difference.

## 4. Mini-build — In-memory vs database persistence comparison

**File:** `src/routes/modules/16-database/01-what-is-database/+page.svelte`

This page shows two cards side-by-side: one backed by an in-memory counter (resets on restart) and one backed by a SQLite database row (persists across restarts). The student can click "Increment" on each and then restart the dev server to see the difference.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/16-database/01-what-is-database`.

### DevTools verification

1. Open DevTools Network tab and reload. Notice the page is server-rendered — the counts appear in the initial HTML.
2. Click "Increment" on both counters. The form submits, the page reloads, and both counts increase.
3. Stop the dev server (`Ctrl+C`) and restart it (`pnpm dev`). Reload the page.
4. The in-memory counter is back to 0. The database counter kept its value. This is persistence.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does data stored in a JavaScript array on the server disappear when you restart the process?</summary>

Variables declared in server modules live in the Node.js process memory (RAM). When the process stops — due to a restart, crash, deploy, or scaling event — the operating system reclaims that memory. The variable is re-initialized from scratch the next time the module loads, losing all accumulated state.
</details>

<details>
<summary><strong>Q2.</strong> Explain the "A" in ACID and give a practical example from a notes app.</summary>

Atomicity means a group of database operations either all succeed or all fail together. In a notes app, when you create a note with three tags, atomicity guarantees that either the note row and all three junction rows are saved, or none of them are. You never end up with a note that references tags that were not actually created.
</details>

<details>
<summary><strong>Q3.</strong> Why does this course choose SQLite over PostgreSQL for local development?</summary>

SQLite requires zero infrastructure — no separate server to install, no Docker container, no connection strings to configure. The database is a single file (`data/dev.db`) in the project directory. This removes an entire category of setup problems for students. The SQL concepts transfer directly to PostgreSQL when needed for production.
</details>

<details>
<summary><strong>Q4.</strong> In SvelteKit's architecture, which files are allowed to import database code and why?</summary>

Only server-side files: `+page.server.ts`, `+layout.server.ts`, `+server.ts`, and files under `$lib/server/`. These files run exclusively on the server. SvelteKit enforces this at build time — if a client-side file tries to import from `$lib/server/`, the build fails. This prevents database credentials and queries from being shipped to the browser.
</details>

<details>
<summary><strong>Q5.</strong> What would happen if two SvelteKit server instances (e.g., in a load-balanced deployment) both used an in-memory array for storage?</summary>

Each instance would have its own independent copy of the array. A note created by a request hitting instance A would not exist on instance B. Users would see inconsistent data depending on which server handled their request. A shared database solves this because all instances read from and write to the same source of truth.
</details>

## 6. Common mistakes

- **Assuming the dev server keeps data forever.** Students often forget that `pnpm dev` restarts automatically on config changes and sometimes on crashes. Even in development, relying on in-memory state leads to lost work and confusion during debugging sessions.
- **Trying to import database code in `+page.svelte`.** Drizzle and better-sqlite3 are server-only packages. If you import them in a `.svelte` file that runs in the browser, you get a build error: `Cannot use module 'better-sqlite3' in client-side code`. Always keep database imports in `+page.server.ts` or `$lib/server/` files.
- **Confusing SQLite (the engine) with the `.db` file.** SQLite is a library linked into your Node.js process — it is not a separate server. The `.db` file is just the storage format. If you delete the file, you lose data but SQLite itself is fine — it will create a new file on the next write.
- **Forgetting that serverless functions are ephemeral.** On platforms like Vercel, each request might run in a fresh process. An in-memory array is literally empty on every request in this environment. This is not a bug in the platform; it is the expected behavior that databases are designed to solve.

## 7. What's next

Lesson 16.2 installs Drizzle ORM and better-sqlite3, creates the configuration file, and establishes the database connection that every subsequent lesson will use.
