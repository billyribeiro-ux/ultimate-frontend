# Module 16 — Database with Drizzle: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Split-screen: editor (left), database viewer or terminal (right). Show SQL output when possible.

---

## Lesson 16.1 — What is database

**Duration:** 10 minutes
**Screen setup:** Slides for database concepts, editor for code examples

### Hook (30 seconds)
"Your SvelteKit app stores data in memory. Refresh the page — it is gone. A database persists data across requests, restarts, and deployments. Drizzle ORM gives you a type-safe, SQL-like API that makes database queries feel like writing TypeScript."

### Demo sequence
1. **[0:30-2:30] Why a database** — In-memory vs persistent storage. Show data disappearing on restart.
2. **[2:30-5:00] ORM overview** — What Drizzle does: TypeScript schema → SQL tables → type-safe queries.
3. **[5:00-7:00] Drizzle vs alternatives** — Drizzle vs Prisma: SQL-like vs abstracted. Performance and DX trade-offs.
4. **[7:00-8:30] Build the mini-build** — Architecture diagram: SvelteKit → Drizzle → PostgreSQL/SQLite.
5. **[8:30-9:30] Edge case / gotcha** — "Drizzle supports PostgreSQL, MySQL, and SQLite. Choose SQLite for development (file-based, no server). Use PostgreSQL for production."

### Key moments
- 0:30 — "Data that survives restarts"
- 2:30 — "Type-safe queries"
- 5:00 — "Drizzle vs Prisma"
- 7:00 — "Architecture diagram"
- 8:30 — "Database choice"

### Callout graphics
- Data persistence diagram
- Drizzle architecture
- ORM comparison table

### Outro (30 seconds)
"Drizzle gives you type-safe database access. Next lesson: installation."

---

## Lesson 16.2 — Installing Drizzle

**Duration:** 9 minutes
**Screen setup:** Terminal for installation, editor for config files

### Hook (30 seconds)
"Three packages, one config file, and you have a database. Drizzle's setup is minimal: install the ORM, the driver, and the kit. Configure the connection. You are ready to define your schema."

### Demo sequence
1. **[0:30-2:00] Installation** — `pnpm add drizzle-orm better-sqlite3` and `pnpm add -D drizzle-kit @types/better-sqlite3`.
2. **[2:00-4:00] Configuration** — Create `drizzle.config.ts`. Set the database path, schema location, and output directory.
3. **[4:00-6:00] Database client** — Create `src/lib/server/db.ts`. Initialize the Drizzle client with the SQLite driver.
4. **[6:00-7:30] Build the mini-build** — Verify the connection: run a simple query and log the result.
5. **[7:30-8:30] Edge case / gotcha** — "Put your database file in a gitignored directory. Never commit SQLite database files to version control."

### Key moments
- 0:30 — "Three packages"
- 2:00 — "drizzle.config.ts"
- 4:00 — "Database client"
- 6:00 — "Connection verification"
- 7:30 — "Gitignore the DB"

### Callout graphics
- Installation checklist
- Config file anatomy
- Project structure with DB

### Outro (30 seconds)
"Drizzle is installed and connected. Next lesson: schema definition."

---

## Lesson 16.3 — Schema definition

**Duration:** 11 minutes
**Screen setup:** Editor with schema file, generated SQL output

### Hook (30 seconds)
"Your database schema is a TypeScript file. Tables are objects, columns are functions, types are inferred. Change the schema, and Drizzle generates the SQL migration. No hand-written SQL for schema changes. Full type safety from schema to query."

### Demo sequence
1. **[0:30-2:30] Defining a table** — `sqliteTable()` with columns: id, name, email, createdAt. Show the TypeScript types.
2. **[2:30-5:00] Column types** — text, integer, real, blob. Primary keys, defaults, not null, unique constraints.
3. **[5:00-7:30] Multiple tables** — Users, posts, comments. Show how TypeScript infers the insert and select types.
4. **[7:30-9:30] Build the mini-build** — Blog schema: users, posts, tags, post_tags.
5. **[9:30-10:30] Edge case / gotcha** — "Always define a primary key. Drizzle does not add one automatically. Without a PK, you cannot update or delete specific rows."

### Key moments
- 0:30 — "Schema in TypeScript"
- 2:30 — "Column types"
- 5:00 — "Multiple tables"
- 7:30 — "Blog schema"
- 9:30 — "Primary keys are mandatory"

### Callout graphics
- Schema to SQL mapping
- Column type reference
- Inferred TypeScript types

### Outro (30 seconds)
"Your schema defines the database structure. Next lesson: migrations."

---

## Lesson 16.4 — Migrations

**Duration:** 10 minutes
**Screen setup:** Terminal with migration commands, editor showing migration files

### Hook (30 seconds)
"You add a column. You rename a table. You create an index. Each change needs a migration — a versioned SQL file that transforms the database from the old schema to the new one. Drizzle Kit generates these migrations from your TypeScript schema diffs."

### Demo sequence
1. **[0:30-2:30] Generating a migration** — `pnpm drizzle-kit generate`. Show the generated SQL file.
2. **[2:30-5:00] Running migrations** — `pnpm drizzle-kit push` for development. Migration runner for production.
3. **[5:00-7:00] Schema changes** — Add a column, remove a column, rename. Generate new migration.
4. **[7:00-8:30] Build the mini-build** — Three-step migration: initial schema, add column, add index.
5. **[8:30-9:30] Edge case / gotcha** — "Destructive migrations (dropping columns) lose data. In production, prefer a two-step approach: mark as deprecated, migrate data, then remove."

### Key moments
- 0:30 — "Versioned schema changes"
- 2:30 — "Running migrations"
- 5:00 — "Evolving the schema"
- 7:00 — "Three-step migration"
- 8:30 — "Destructive migration safety"

### Callout graphics
- Migration lifecycle
- generate vs push
- Safe migration pattern

### Outro (30 seconds)
"Migrations version your database schema. Next lesson: CRUD operations."

---

## Lesson 16.5 — CRUD

**Duration:** 11 minutes
**Screen setup:** Editor with query code, database viewer showing results

### Hook (30 seconds)
"Create, Read, Update, Delete — the four operations every data-driven app needs. Drizzle's query API reads like SQL but writes like TypeScript. Full autocomplete, type inference, and compile-time error checking."

### Demo sequence
1. **[0:30-2:30] Create** — `db.insert(users).values({ name, email })`. Show the insert and return the new record.
2. **[2:30-5:00] Read** — `db.select().from(users).where(eq(users.id, id))`. Show filtering, ordering, limiting.
3. **[5:00-7:00] Update** — `db.update(users).set({ name: 'New Name' }).where(eq(users.id, id))`.
4. **[7:00-9:00] Delete** — `db.delete(users).where(eq(users.id, id))`. Soft delete pattern.
5. **[9:00-10:00] Build the mini-build** — Full CRUD for a task list.
6. **[10:00-10:30] Edge case / gotcha** — "Always use `.where()` with update and delete. Without it, you update or delete ALL rows."

### Key moments
- 0:30 — "Create"
- 2:30 — "Read with filters"
- 5:00 — "Update"
- 7:00 — "Delete"
- 10:00 — "WHERE is mandatory"

### Callout graphics
- CRUD operation reference
- Query builder chain
- Where clause importance

### Outro (30 seconds)
"CRUD operations give you full data manipulation. Next lesson: relations and joins."

---

## Lesson 16.6 — Relations & joins

**Duration:** 11 minutes
**Screen setup:** Editor with relation queries, database viewer showing joined data

### Hook (30 seconds)
"Users have posts. Posts have comments. Comments belong to users. Relations connect tables, and joins query across them. Drizzle's relation API lets you define these connections in TypeScript and query them with full type safety."

### Demo sequence
1. **[0:30-2:30] Defining relations** — `relations()` function connecting users to posts (one-to-many).
2. **[2:30-5:00] Querying relations** — `db.query.users.findFirst({ with: { posts: true } })`. Show nested data.
3. **[5:00-7:30] Join queries** — `db.select().from(posts).innerJoin(users, eq(posts.authorId, users.id))`. Show SQL-level joins.
4. **[7:30-9:30] Build the mini-build** — Blog with author profiles and post counts using relational queries.
5. **[9:30-10:30] Edge case / gotcha** — "Relations in Drizzle are for the query API only — they do not create foreign key constraints. Define foreign keys separately in the schema."

### Key moments
- 0:30 — "Connected data"
- 2:30 — "Relational queries"
- 5:00 — "SQL joins"
- 7:30 — "Blog with authors"
- 9:30 — "Relations vs foreign keys"

### Callout graphics
- Relation diagram
- Query API vs join API
- Foreign key declaration

### Outro (30 seconds)
"Relations and joins connect your data. Next lesson: database in load functions."

---

## Lesson 16.7 — Load functions with database

**Duration:** 10 minutes
**Screen setup:** Editor with load function querying DB, browser showing page

### Hook (30 seconds)
"Your load function queries the database directly. No API endpoint in between. No fetch call. The load function runs on the server, queries Drizzle, and returns the data to the page component. The shortest path from database to UI."

### Demo sequence
1. **[0:30-2:30] Direct queries** — `+page.server.ts` load function calls `db.select()` directly. Show data in the page.
2. **[2:30-5:00] Dynamic routes** — `/blog/[slug]` load function queries by slug. Handle not-found with error(404).
3. **[5:00-7:00] Performance** — Query only what you need. Select specific columns. Show the SQL output.
4. **[7:00-8:30] Build the mini-build** — Blog listing and detail pages powered by database queries.
5. **[8:30-9:30] Edge case / gotcha** — "Load functions should return serializable data. Drizzle results are plain objects — they serialize fine. But Date objects may need conversion to strings."

### Key moments
- 0:30 — "DB to UI directly"
- 2:30 — "Dynamic route queries"
- 5:00 — "Select optimization"
- 7:00 — "Blog pages"
- 8:30 — "Serialization"

### Callout graphics
- Direct query flow
- Column selection
- Serialization rules

### Outro (30 seconds)
"Load functions query the database directly. Last lesson: form actions and remote functions with database."

---

## Lesson 16.8 — Actions and remote functions with database

**Duration:** 11 minutes
**Screen setup:** Editor with form action writing to DB, browser showing form

### Hook (30 seconds)
"Read data in load functions. Write data in form actions and remote functions. This separation keeps your data flow predictable: load functions query, actions mutate. Drizzle provides type-safe inserts, updates, and deletes in both patterns."

### Demo sequence
1. **[0:30-2:30] Form action insert** — Form submits, action validates, inserts into DB. Show the new record.
2. **[2:30-5:00] Remote function mutation** — Like button calls a remote function that updates the like count.
3. **[5:00-7:30] Transactions** — Multi-step mutations in a transaction. Rollback on failure.
4. **[7:30-9:30] Build the mini-build** — Blog CMS: create post (form action), like post (remote function), with transactions.
5. **[9:30-10:30] Edge case / gotcha** — "Always validate and sanitize input before database operations. Drizzle uses parameterized queries (SQL injection safe), but application-level validation is still required."

### Key moments
- 0:30 — "Load reads, actions write"
- 2:30 — "Remote function mutations"
- 5:00 — "Transactions"
- 7:30 — "Blog CMS"
- 9:30 — "Input validation"

### Callout graphics
- Read/write separation
- Transaction flow
- Validation pipeline

### Outro (30 seconds)
"Actions and remote functions handle database writes. Module 16 is complete — you can build database-backed SvelteKit applications with Drizzle."

---
