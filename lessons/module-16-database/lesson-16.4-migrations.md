---
module: 16
lesson: 16.4
title: Migrations
duration: 40 minutes
prerequisites:
  - Lesson 16.3 (schema definition with sqliteTable)
  - Understanding of drizzle.config.ts
  - Familiarity with CLI tools (pnpm commands)
learning_objectives:
  - Explain why migrations exist and what problem they solve
  - Generate a migration file from schema changes using drizzle-kit generate
  - Apply migrations to the database using drizzle-kit migrate
  - Describe the difference between migrations and schema push for prototyping
  - Read a generated SQL migration file and understand what it does
status: ready
---

# Lesson 16.4 — Migrations

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Evolving your database without losing data

### 1.1 What the problem is

Your schema is defined in TypeScript. Your database tables exist on disk. What happens when you add a new column to your schema file? Nothing — the database does not read your TypeScript. It still has the old structure. If your code tries to insert into a column that does not exist in the actual database, you get a runtime error.

You need a mechanism to **synchronize** changes in your schema definition with the actual database structure. This mechanism is called a **migration**.

### 1.2 What a migration is

A migration is a SQL file that describes a specific change to the database structure. "Add column `updated_at` to the `notes` table." "Create the `tags` table." "Add a unique constraint to `email`." Each migration is a single, ordered step in the evolution of your schema.

Migrations are:
- **Ordered** — they run in sequence (001, 002, 003...). The database tracks which ones have already run.
- **Idempotent in practice** — running a migration that has already been applied does nothing (the migration system skips it).
- **Versioned** — they live in your git repository alongside your code. When a teammate pulls your branch, they run migrations to bring their local database up to date.
- **One-directional** — in Drizzle, migrations go forward. If you need to undo a change, you write a new migration that reverses it.

### 1.3 The Drizzle Kit workflow

Drizzle Kit provides two commands for the migration workflow:

**`pnpm drizzle-kit generate`** — reads your current schema file (`src/lib/server/db/schema.ts`), compares it to the last known state, and generates a SQL migration file in the `drizzle/` folder. The file contains the exact SQL statements needed to transform the old schema into the new one.

**`pnpm drizzle-kit migrate`** — reads all migration files in the `drizzle/` folder and runs any that have not yet been applied to the database. It creates a special table (`__drizzle_migrations`) to track which migrations have already run.

The workflow when you change your schema:

1. Edit `schema.ts` — add a column, create a table, change a constraint.
2. Run `pnpm drizzle-kit generate` — Drizzle Kit diffs the schema and produces a `.sql` file.
3. Review the generated SQL — make sure it looks correct.
4. Run `pnpm drizzle-kit migrate` — the SQL runs against your database.
5. Commit both the schema change and the migration file to git.

### 1.4 What a generated migration file looks like

When you add a `tags` table to your schema and run `generate`, Drizzle Kit creates something like:

```sql
-- drizzle/0001_add_tags_table.sql
CREATE TABLE `tags` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `name` text NOT NULL
);
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);
```

This is plain SQL. You can read it, edit it if needed, and understand exactly what it will do to your database. There is no magic — just SQL commands in a file.

### 1.5 Schema push — the shortcut for prototyping

During rapid prototyping, generating migration files for every small tweak is tedious. Drizzle Kit offers a faster alternative:

**`pnpm drizzle-kit push`** — directly modifies the database to match your schema, without creating migration files. It is the "just make it match" button.

Use push when:
- You are experimenting locally and do not care about migration history
- You are willing to reset your data (push may drop and recreate tables)
- You have not committed to a schema yet

Use generate + migrate when:
- You are working in a team
- You need to preserve existing data
- You are preparing for production deployment
- You want a reviewable history of schema changes

In this course's mini-builds, we use `CREATE TABLE IF NOT EXISTS` in the `db/index.ts` file so everything "just works" without running migrations. But in the module project and in real applications, migrations are the professional approach.

### 1.6 Why the mini-builds skip migrations

The mini-build routes in this course use a pragmatic shortcut: the `db/index.ts` file contains `CREATE TABLE IF NOT EXISTS` statements that run when the module loads. This means `pnpm dev` always works without any setup steps. This is intentional — a student should never be blocked by a migration step when exploring a lesson.

Production code should not use this pattern. In production, you run migrations as part of your deployment pipeline. The lesson teaches the proper approach; the mini-builds use the convenient one.

## 2. Style it — Migration timeline visualization

The mini-build shows migrations as a vertical timeline. PE7 styling:

- Timeline uses a vertical line in `var(--color-border)` with nodes in `var(--color-brand)`
- Each migration is a card hanging off the timeline with `var(--color-surface-2)` background
- SQL code blocks use monospace font with `var(--color-surface)` background (dark mode aware)
- Status badges: "applied" in `var(--color-success)`, "pending" in `var(--color-warning)`
- Per-page personality: `--color-brand: oklch(68% 0.17 55)` — an amber tone suggesting change and evolution

## 3. Interact — File system operations and CLI tooling

The concept here is **code generation** — a pattern where a tool reads your source code and writes new source code as output. `drizzle-kit generate` is a code generator: it reads your TypeScript schema, diffs it against the last snapshot, and writes SQL files.

This is different from runtime code. The generated migration SQL is a build artifact — like compiled JavaScript or CSS. You review it, commit it, and it becomes part of your codebase. The generator runs once (at development time), not on every request.

Understanding code generation is important because modern tooling relies heavily on it: SvelteKit generates route types, TypeScript generates `.d.ts` files, and Drizzle generates migration SQL. The pattern is always the same: read a source of truth, produce derived files, commit the results.

```typescript
// The source of truth (you write this):
export const tags = sqliteTable('tags', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique()
});

// The generated artifact (drizzle-kit writes this):
// drizzle/0001_create_tags.sql
// CREATE TABLE `tags` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, ...);
```

If the generated output looks wrong, you fix the source of truth (the schema), not the generated file.

## 4. Mini-build — Migration status dashboard

**File:** `src/routes/modules/16-database/04-migrations/+page.svelte`

This page shows a simulated migration timeline with three migration entries (initial schema, add notes table, add tags). It illustrates the concept visually without requiring the student to actually run migration commands (since the mini-builds use CREATE TABLE IF NOT EXISTS).

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/16-database/04-migrations`.

### DevTools verification

1. Inspect the timeline CSS. The vertical line should use a pseudo-element with `var(--color-border)`.
2. Check the responsive behavior: on mobile, the timeline is left-aligned. On wider viewports, migration cards alternate left and right (if you implemented the stretch layout).
3. Verify that no actual database operations happen on this page — it is purely educational visualization.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What happens if you change your schema file but forget to run <code>drizzle-kit generate</code> and <code>drizzle-kit migrate</code>?</summary>

Your TypeScript code expects columns or tables that do not exist in the actual database. When a query tries to reference the missing column, SQLite throws a runtime error like `no such column: notes.updated_at`. Your types say the column exists, but the database disagrees. This is exactly the kind of mismatch migrations prevent.
</details>

<details>
<summary><strong>Q2.</strong> Why should you commit migration files to version control?</summary>

Migration files are the history of your database's evolution. When a teammate clones your repo, they run `drizzle-kit migrate` and their local database gets the same structure as yours. In CI/CD pipelines, the deployment runs migrations to update the production database. Without committed migration files, every developer would need to recreate the database from scratch, losing any data and making collaboration impossible.
</details>

<details>
<summary><strong>Q3.</strong> When would you use <code>drizzle-kit push</code> instead of <code>generate</code> + <code>migrate</code>?</summary>

During early prototyping when you are rapidly changing the schema and do not care about preserving data. Push directly modifies the database to match the schema without creating migration files. It may drop tables or columns to achieve the match. Once you settle on a schema and have real data to preserve, switch to the generate + migrate workflow.
</details>

<details>
<summary><strong>Q4.</strong> How does the migration system know which migrations have already been applied?</summary>

Drizzle Kit creates a special table called `__drizzle_migrations` in your database. Each time a migration runs successfully, a row is inserted with the migration's filename and timestamp. On subsequent `drizzle-kit migrate` calls, it reads this table and skips any migrations that already have entries.
</details>

<details>
<summary><strong>Q5.</strong> Why do the mini-build routes in this course use <code>CREATE TABLE IF NOT EXISTS</code> instead of proper migrations?</summary>

Mini-builds must "just work" when a student runs `pnpm dev` without any setup steps. Requiring students to run migration commands before seeing a lesson creates friction and potential for confusion. The `CREATE TABLE IF NOT EXISTS` approach ensures tables exist on first load. This is a development convenience — production applications should always use migrations for controlled, reviewable schema evolution.
</details>

## 6. Common mistakes

- **Editing generated migration files after they've been applied.** Once a migration has run against a database, editing the `.sql` file does nothing — the migration system marks it as "done" and never re-runs it. If you need to change something, create a new migration with `generate`.
- **Running `drizzle-kit push` in production.** Push can drop columns and tables to force-match the schema. In production, this destroys real user data. Always use generate + migrate for deployed databases, and automate it in your CI/CD pipeline.
- **Forgetting to generate after adding a table.** If you define a new table in `schema.ts` but skip `generate`, no migration file exists. The next `migrate` run does nothing because there is nothing new to run. The table simply does not exist in the database until you generate and apply the migration.
- **Not reviewing generated SQL.** Drizzle Kit usually generates correct SQL, but edge cases exist — especially with column renames (it may generate a DROP + CREATE instead of ALTER). Always read the generated file before applying it, especially when data preservation matters.

## 7. What's next

Lesson 16.5 teaches CRUD operations with Drizzle — select, insert, update, and delete using the type-safe query builder API with filter operators like `eq()`, `and()`, and `like()`.
