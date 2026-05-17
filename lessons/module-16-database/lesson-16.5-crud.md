---
module: 16
lesson: 16.5
title: CRUD with Drizzle
duration: 50 minutes
prerequisites:
  - Lesson 16.3 (schema definition)
  - Lesson 16.4 (migrations — understanding that tables exist)
  - TypeScript generics awareness (inferred return types)
learning_objectives:
  - Perform SELECT queries using db.select().from() with typed return values
  - Insert rows using db.insert().values() and retrieve the inserted record
  - Update rows using db.update().set().where() with conditional filtering
  - Delete rows using db.delete().where() with safety checks
  - Compose filter conditions using eq(), and(), or(), and like()
status: ready
---

# Lesson 16.5 — CRUD with Drizzle

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The four operations every database application needs

### 1.1 What the problem is

You have tables. Now you need to put data in, get data out, change data, and remove data. These four operations — **Create**, **Read**, **Update**, **Delete** — form the acronym CRUD, and they are the backbone of every database-backed application. A notes app creates notes, reads them for display, updates them when edited, and deletes them when the user chooses.

In raw SQL these operations are `INSERT`, `SELECT`, `UPDATE`, and `DELETE`. Drizzle provides a query builder API that maps 1:1 to these SQL statements while giving you full TypeScript autocompletion and type inference.

### 1.2 Read — selecting data

The most common operation. Drizzle's select API:

```typescript
import { db } from '$lib/server/db';
import { notes } from '$lib/server/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

// Select all notes
const allNotes = db.select().from(notes).all();
// Type: { id: number; title: string; content: string; userId: number; ... }[]

// Select with a WHERE clause
const userNotes = db.select().from(notes).where(eq(notes.userId, 1)).all();

// Select specific columns
const titles = db.select({ id: notes.id, title: notes.title }).from(notes).all();
// Type: { id: number; title: string }[]

// Order by
const recent = db.select().from(notes).orderBy(desc(notes.createdAt)).all();

// Limit
const firstFive = db.select().from(notes).limit(5).all();
```

Every query returns a typed array. The return type is inferred from your schema and the columns you select. No `any`, no manual type assertions.

### 1.3 Create — inserting data

```typescript
// Insert one row
db.insert(notes).values({
    title: 'My first note',
    content: 'Hello, database!',
    userId: 1
}).run();

// Insert and get the result back
const inserted = db.insert(notes).values({
    title: 'Another note',
    content: 'With content',
    userId: 1
}).returning().get();
// Type: { id: number; title: string; content: string; userId: number; ... }

// Insert multiple rows
db.insert(notes).values([
    { title: 'Note A', content: '', userId: 1 },
    { title: 'Note B', content: '', userId: 1 }
]).run();
```

The `.values()` method accepts the inferred insert type from your schema. TypeScript will error if you forget a required field (like `title` which has `notNull()` and no default) or provide the wrong type (like passing a string where an integer is expected).

`.returning()` tells SQLite to return the inserted row(s) including generated columns (like `id`). `.get()` returns a single object; `.all()` returns an array.

### 1.4 Update — modifying existing data

```typescript
// Update a specific note
db.update(notes)
    .set({ content: 'Updated content', updatedAt: new Date().toISOString() })
    .where(eq(notes.id, 5))
    .run();

// Update with returning
const updated = db.update(notes)
    .set({ title: 'New title' })
    .where(eq(notes.id, 5))
    .returning()
    .get();
```

The `.set()` method accepts a partial version of the schema — you only provide the columns you want to change. The `.where()` clause is critical: without it, the update applies to every row in the table.

### 1.5 Delete — removing data

```typescript
// Delete a specific note
db.delete(notes).where(eq(notes.id, 5)).run();

// Delete with returning (get the deleted row)
const deleted = db.delete(notes).where(eq(notes.id, 5)).returning().get();

// Delete all notes for a user
db.delete(notes).where(eq(notes.userId, 1)).run();
```

Like update, forgetting the `.where()` clause deletes every row. Drizzle does not prevent this — it is valid SQL. Always include a where clause unless you genuinely want to empty the table.

### 1.6 Filter operators — building WHERE clauses

Drizzle provides functions that map to SQL comparison operators:

```typescript
import { eq, ne, gt, gte, lt, lte, like, and, or, isNull, inArray } from 'drizzle-orm';

// Equality
eq(notes.userId, 1)        // WHERE user_id = 1

// Not equal
ne(notes.userId, 1)        // WHERE user_id != 1

// Comparison
gt(notes.id, 10)           // WHERE id > 10
lte(notes.id, 100)         // WHERE id <= 100

// Pattern matching
like(notes.title, '%svelte%')  // WHERE title LIKE '%svelte%'

// Combine with AND
and(eq(notes.userId, 1), like(notes.title, '%svelte%'))

// Combine with OR
or(eq(notes.userId, 1), eq(notes.userId, 2))

// NULL check
isNull(notes.content)      // WHERE content IS NULL

// IN array
inArray(notes.id, [1, 2, 3])  // WHERE id IN (1, 2, 3)
```

These functions are composable. You can nest `and()` inside `or()`, pass arrays of conditions, and build complex queries while TypeScript verifies that the column types match the comparison values.

## 2. Style it — The CRUD operations panel

The mini-build creates an interactive panel where the student can perform all four CRUD operations. PE7 styling:

- A tabbed interface with Create / Read / Update / Delete tabs, each with `min-block-size: 44px` for touch targets
- Active tab highlighted with `var(--color-brand)` bottom border
- Forms use the same field styling as Module 10: inputs with `var(--color-border)`, focus with `var(--color-brand)`
- Results displayed in a scrollable list with `var(--color-surface-2)` card backgrounds
- Per-page personality: `--color-brand: oklch(60% 0.22 145)` — a green tone suggesting data operations and success

## 3. Interact — Method chaining and the builder pattern

The TypeScript concept is the **builder pattern** — a design pattern where each method call returns a new object that exposes the next valid set of methods. Drizzle uses this extensively:

```typescript
db                              // DrizzleInstance
    .select()                   // SelectBuilder (can call .from)
    .from(notes)                // FromBuilder (can call .where, .orderBy, .limit)
    .where(eq(notes.userId, 1)) // WhereBuilder (can call .orderBy, .limit, .all)
    .orderBy(desc(notes.id))    // OrderByBuilder (can call .limit, .all)
    .limit(10)                  // LimitBuilder (can call .all, .get)
    .all();                     // Result: typed array
```

Each step narrows the available methods. You cannot call `.from()` after `.where()` because the `WhereBuilder` type does not expose a `from` method. TypeScript enforces this at compile time — you get autocompletion showing only the valid next steps.

This is different from string concatenation (`"SELECT * FROM " + table + " WHERE ..."`) where anything goes and mistakes are caught only at runtime. The builder pattern makes invalid queries impossible to construct.

## 4. Mini-build — Notes CRUD playground

**File:** `src/routes/modules/16-database/05-crud/+page.svelte`

This page provides a complete CRUD interface for notes: a form to create notes, a list showing all notes, inline edit buttons, and delete buttons. All operations go through the database and the page refreshes to show current state.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/16-database/05-crud`.

### DevTools verification

1. Create a note and check the Network tab. The form submits as a POST, the server processes it, and redirects back to the page with updated data.
2. Open `data/dev.db` with a SQLite viewer (or use the terminal: `sqlite3 data/dev.db "SELECT * FROM notes"`). Confirm your note exists in the actual database file.
3. Stop and restart `pnpm dev`. Reload the page. Your notes are still there — proving database persistence.
4. Check TypeScript: hover over the `data.notes` variable in your editor. It should show the full typed array shape inferred from the schema.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between <code>.run()</code>, <code>.get()</code>, and <code>.all()</code> at the end of a Drizzle query?</summary>

`.run()` executes the query without returning data — used for INSERT, UPDATE, DELETE when you do not need the affected rows back. `.get()` executes and returns a single row (or undefined if no match) — used with `.returning()` on insert/update or when you expect one result. `.all()` executes and returns an array of all matching rows — the standard choice for SELECT queries.
</details>

<details>
<summary><strong>Q2.</strong> What happens if you call <code>db.update(notes).set({ title: 'x' }).run()</code> without a <code>.where()</code> clause?</summary>

Every row in the `notes` table gets its `title` changed to `'x'`. This is valid SQL (`UPDATE notes SET title = 'x'`) and Drizzle does not prevent it. Always include a `.where()` clause on update and delete operations unless you intentionally want to affect all rows.
</details>

<details>
<summary><strong>Q3.</strong> How does TypeScript know which fields are required in <code>db.insert(notes).values({...})</code>?</summary>

Drizzle infers an insert type from the schema definition. Fields with `.primaryKey({ autoIncrement: true })`, `.default()`, or `.$defaultFn()` become optional (they have automatic values). All other `.notNull()` fields are required. TypeScript shows an error if you omit a required field or provide the wrong type.
</details>

<details>
<summary><strong>Q4.</strong> Write a Drizzle query that finds all notes whose title contains "svelte" belonging to user 1, ordered by newest first.</summary>

```typescript
const results = db.select()
    .from(notes)
    .where(and(
        eq(notes.userId, 1),
        like(notes.title, '%svelte%')
    ))
    .orderBy(desc(notes.createdAt))
    .all();
```
</details>

<details>
<summary><strong>Q5.</strong> Why does <code>.returning()</code> exist? When would you use it versus just calling <code>.run()</code>?</summary>

`.returning()` tells the database to send back the affected rows after the operation. Use it when you need the generated ID after an insert, or when you want to confirm what was actually changed/deleted. Use `.run()` when you do not need the result — for example, a bulk delete where you only care about success/failure, or an update where you already know the values you set.
</details>

## 6. Common mistakes

- **Forgetting `.all()` or `.get()` at the end of a select.** Without a terminator, the query is not executed — you get a query builder object, not results. If your variable shows `[object Object]` with strange properties instead of your data, you forgot to call `.all()`.
- **Using `==` instead of `eq()` in where clauses.** JavaScript's `==` operator does not work inside Drizzle's `.where()`. You must use the `eq()` function from `drizzle-orm`. Writing `.where(notes.id == 5)` compiles (it is valid JS returning a boolean) but produces wrong results.
- **Passing unsanitized user input to `like()` without escaping.** The `%` and `_` characters are wildcards in SQL LIKE patterns. If a user searches for "100%", you need to escape the percent sign. Drizzle does not auto-escape LIKE patterns — you must handle this yourself.
- **Assuming `.get()` always returns a value.** When no row matches the query, `.get()` returns `undefined`. If your code does `const note = db.select()...get(); console.log(note.title)`, it throws a "Cannot read properties of undefined" error when no match exists. Always check for `undefined` first.

## 7. What's next

Lesson 16.6 introduces relations — connecting tables with foreign keys, defining one-to-many and many-to-many relationships, and using Drizzle's relational query API to load related data in a single call.
