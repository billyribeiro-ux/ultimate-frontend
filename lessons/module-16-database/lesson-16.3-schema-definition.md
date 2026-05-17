---
module: 16
lesson: 16.3
title: Schema definition
duration: 45 minutes
prerequisites:
  - Lesson 16.2 (Drizzle installed and connected)
  - TypeScript interfaces and type annotations (Module 1)
  - Understanding of primary keys and foreign keys (conceptual)
learning_objectives:
  - Define a database table using sqliteTable with typed columns
  - Use text, integer, real, and blob column types correctly
  - Set primary keys with autoIncrement for unique row identification
  - Apply defaults and $defaultFn for automatic timestamps
  - Explain how Drizzle infers TypeScript types from schema definitions
status: ready
---

# Lesson 16.3 — Schema definition

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Describing your data's shape to the database

### 1.1 What the problem is

You have a database connection. But the database is empty — it has no tables, no columns, no structure. If you try to insert a note, SQLite will respond with "no such table: notes". You need to tell the database what kind of data you intend to store, what shape each record takes, and what rules to enforce. This description is called a **schema**.

In raw SQL you would write `CREATE TABLE notes (id INTEGER PRIMARY KEY, ...)`. That works, but it lives in a SQL string with no type checking. Misspell a column name and you discover the problem at runtime. Drizzle solves this by letting you define your schema in TypeScript. The schema file becomes the single source of truth for both your database structure and your TypeScript types.

### 1.2 The sqliteTable function

Every table in Drizzle starts with `sqliteTable`:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});
```

The first argument (`'users'`) is the actual table name in SQLite. The second argument is an object where each key is a column. The key name (like `createdAt`) becomes the property name in TypeScript. The string passed to `text('created_at')` or `integer('id')` is the actual column name in the database. This lets you use camelCase in TypeScript and snake_case in SQL — both communities stay happy.

### 1.3 Column types in SQLite

SQLite has a flexible type system compared to PostgreSQL or MySQL. Drizzle maps it to four core column builders:

| Drizzle function | SQLite affinity | TypeScript type | Use for |
|-----------------|-----------------|-----------------|---------|
| `text('col')` | TEXT | `string` | Names, emails, content, ISO timestamps |
| `integer('col')` | INTEGER | `number` | IDs, counts, booleans (0/1), foreign keys |
| `real('col')` | REAL | `number` | Prices, coordinates, percentages |
| `blob('col')` | BLOB | `Buffer` | Binary data (images, files) — rare in practice |

SQLite stores dates as TEXT (ISO strings) or INTEGER (Unix timestamps). This course uses TEXT with ISO format because it is human-readable in database tools and sorts correctly as a string.

### 1.4 Constraints — rules the database enforces

Constraints are method calls chained onto a column definition:

- `.notNull()` — the column cannot be empty. SQLite will reject any insert that omits it.
- `.unique()` — no two rows can have the same value in this column. Prevents duplicate emails.
- `.primaryKey()` — marks this column as the table's unique identifier.
- `{ autoIncrement: true }` — SQLite automatically assigns the next integer when you insert without providing an ID.
- `.default('value')` — SQLite uses this value if you omit the column during insert.
- `.$defaultFn(() => expr)` — Drizzle runs this JavaScript function to generate a default value at insert time. Unlike `.default()`, which runs in SQLite, `$defaultFn` runs in Node.js. Use it for dynamic values like timestamps.
- `.references(() => otherTable.id)` — creates a foreign key relationship. The database rejects values that do not exist in the referenced table.

### 1.5 How Drizzle infers TypeScript types from your schema

When you export `const users = sqliteTable(...)`, Drizzle produces two implicit types:

- **Insert type** — the shape required when inserting a new row. Columns with defaults or autoincrement become optional.
- **Select type** — the shape returned when querying. All columns are present.

You can extract these types explicitly:

```typescript
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from './schema';

type NewUser = InferInsertModel<typeof users>;
// { name: string; email: string; id?: number; createdAt?: string }

type User = InferSelectModel<typeof users>;
// { id: number; name: string; email: string; createdAt: string }
```

Notice that `id` and `createdAt` are optional in `NewUser` (they have defaults) but required in `User` (they always exist in a stored row). Drizzle figures this out from your schema definition — no manual type writing needed.

### 1.6 The schema file for this module's project

The Full-Stack Notes App uses four tables: `users`, `notes`, `tags`, and `notes_tags` (a junction table for the many-to-many relationship between notes and tags). You will build this schema incrementally — `users` in this lesson, `notes` in Lesson 16.5, and the tag tables in Lesson 16.6.

## 2. Style it — Schema visualization card

The mini-build renders a visual representation of the schema as a card grid. PE7 styling:

- Each table is a card with `var(--color-surface-2)` background and `var(--radius-lg)` corners
- Column names use monospace font. Types are color-coded: `var(--color-brand)` for text, `var(--color-success)` for integer
- Constraints shown as small badges with `var(--radius-full)` pill shape
- Cards stack vertically on mobile, grid side-by-side on `min-width: 768px`
- Per-page personality: `--color-brand: oklch(62% 0.2 310)` — a violet tone suggesting structure and definition

## 3. Interact — Type inference from object definitions

The TypeScript concept is **type inference from structured definitions**. Drizzle uses a pattern where the structure of a plain object (your column definitions) determines the resulting type. This is advanced generics at work, but you use it without writing generics yourself:

```typescript
// You write this:
export const notes = sqliteTable('notes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    content: text('content').notNull().default('')
});

// Drizzle infers this automatically:
// Select type: { id: number; title: string; content: string }
// Insert type: { title: string; id?: number; content?: string }
```

The key insight: `content` is required in the select type (it always has a value in the database) but optional in the insert type (it has a `.default('')`). This distinction prevents bugs — you cannot forget a required field when inserting, and you can always access every field when reading.

Compare this to manually defining interfaces:

```typescript
// Without Drizzle, you'd maintain two separate interfaces:
interface Note { id: number; title: string; content: string; }
interface NewNote { title: string; id?: number; content?: string; }

// These can drift out of sync with the actual database!
```

Drizzle eliminates that drift by deriving types from the schema definition itself.

## 4. Mini-build — Schema explorer page

**File:** `src/routes/modules/16-database/03-schema-definition/+page.svelte`

This page displays the current schema as a visual table diagram, showing each table's columns with their types, constraints, and defaults. It reads this information from the schema definition itself.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/16-database/03-schema-definition`.

### DevTools verification

1. Inspect the column type badges. Each should have a distinct color — confirming scoped class hashes are applied.
2. Check that the cards reflow: on a narrow viewport (mobile), they stack. At 768px+ they go side-by-side.
3. In the Elements panel, confirm that no database values are exposed — this page shows schema metadata, not actual data.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between the first argument to <code>sqliteTable</code> and the keys of the column definition object?</summary>

The first argument (`'users'`) is the actual table name stored in SQLite — it appears in raw SQL queries. The keys of the column object (`id`, `name`, `email`, `createdAt`) are the TypeScript property names used in your application code. The string passed to each column function (`'id'`, `'name'`, `'created_at'`) is the actual column name in the database. This allows camelCase in TypeScript and snake_case in SQL.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between <code>.default('hello')</code> and <code>.$defaultFn(() => 'hello')</code>?</summary>

`.default('hello')` sets a DEFAULT value in the SQLite schema itself — the database engine fills it in during INSERT. `.$defaultFn(() => 'hello')` runs a JavaScript function on the Node.js server at insert time — Drizzle calls the function and includes the result in the INSERT statement. Use `$defaultFn` for dynamic values like `new Date().toISOString()` that cannot be expressed as a static SQL default.
</details>

<details>
<summary><strong>Q3.</strong> Why does Drizzle make <code>id</code> optional in the insert type but required in the select type?</summary>

The `id` column has `primaryKey({ autoIncrement: true })`, which means SQLite automatically assigns the next integer if you omit it during insert. Therefore, providing an id is optional when creating a record. But every stored row always has an id (the database guarantees this), so the select type marks it as required — you can always access `row.id` after querying.
</details>

<details>
<summary><strong>Q4.</strong> What happens at the database level if you try to insert a row with a duplicate email into a column marked <code>.unique()</code>?</summary>

SQLite rejects the INSERT with a `UNIQUE constraint failed: users.email` error. Drizzle throws this as a JavaScript Error that you can catch. The row is not inserted. The database enforces uniqueness regardless of whether your application code checks for duplicates — this is the "Consistency" guarantee from ACID.
</details>

<details>
<summary><strong>Q5.</strong> Why does this course store timestamps as TEXT with ISO format rather than INTEGER with Unix timestamps?</summary>

ISO strings (`2026-05-17T14:30:00.000Z`) are human-readable when you inspect the database directly with tools like `sqlite3` CLI or DB Browser. They sort correctly as strings (lexicographic order matches chronological order for ISO format). They include timezone information. Unix timestamps require conversion to be human-readable and lose timezone context. The performance difference is negligible for the scales taught in this course.
</details>

## 6. Common mistakes

- **Using JavaScript property names as SQL column names.** Writing `integer('userId')` creates a column literally called `userId` in SQLite. Convention in SQL is snake_case: `integer('user_id')`. Keep the TypeScript key as `userId` for your app code but pass `'user_id'` to the column function.
- **Forgetting `.notNull()` on required fields.** SQLite allows NULL by default. If you omit `.notNull()`, Drizzle's TypeScript type becomes `string | null`, and you have to handle null checks everywhere you use that column. Add `.notNull()` on every column that must have a value.
- **Storing booleans as `text`.** SQLite does not have a native boolean type, but `integer` handles it perfectly — Drizzle maps `0` and `1` to `false` and `true` when you use `integer('col', { mode: 'boolean' })`. Do not store `'true'`/`'false'` strings.
- **Exporting the table but not the `const`.** You must `export const users = sqliteTable(...)`. If you forget `export`, other files cannot import the table for queries, and Drizzle Kit cannot find it for migrations.

## 7. What's next

Lesson 16.4 covers migrations — the disciplined process of evolving your schema over time without losing existing data, using `drizzle-kit generate` and `drizzle-kit migrate`.
