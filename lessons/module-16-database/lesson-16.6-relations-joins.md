---
module: 16
lesson: 16.6
title: Relations and joins
duration: 50 minutes
prerequisites:
  - Lesson 16.5 (CRUD operations with Drizzle)
  - Lesson 16.3 (schema with foreign keys)
  - Understanding of .references() column constraint
learning_objectives:
  - Define one-to-many relations using the relations() helper
  - Define many-to-many relations using a junction table and two relations() calls
  - Use db.query.tableName.findMany() with the with option to load related data
  - Explain how Drizzle translates relational queries into SQL JOINs
  - Build a query that loads notes with their user and tags in a single call
status: ready
---

# Lesson 16.6 — Relations and joins

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Connecting tables to model real-world relationships

### 1.1 What the problem is

Your notes app has a `notes` table and a `users` table. Each note belongs to a user (via `userId`). When you display a note, you want to show the author's name next to it. With plain CRUD from Lesson 16.5, you would need two separate queries:

```typescript
const note = db.select().from(notes).where(eq(notes.id, 1)).get();
const user = db.select().from(users).where(eq(users.id, note.userId)).get();
```

This works but scales poorly. Displaying a list of 50 notes means 51 queries (one for the list, one per user). This is the **N+1 problem** — one of the most common performance issues in database-backed applications.

The solution is a **join** — a single query that pulls data from multiple tables at once. But writing joins manually is verbose. Drizzle's **relations** system lets you declare relationships once in your schema and then load related data with a simple `with` option.

### 1.2 One-to-many: users have many notes

A one-to-many relationship means one record in table A is connected to many records in table B. One user can have many notes. In the database, this is represented by the foreign key `notes.user_id` pointing to `users.id`.

Drizzle's `relations()` helper declares this:

```typescript
import { relations } from 'drizzle-orm';
import { users, notes } from './schema';

export const usersRelations = relations(users, ({ many }) => ({
    notes: many(notes)
}));

export const notesRelations = relations(notes, ({ one }) => ({
    user: one(users, { fields: [notes.userId], references: [users.id] })
}));
```

The `many` side says "a user has many notes." The `one` side says "a note belongs to one user, linked by `notes.userId` referencing `users.id`." Both declarations are needed — Drizzle uses them together to understand the bidirectional relationship.

### 1.3 Many-to-many: notes have many tags, tags have many notes

Some relationships are not one-to-many. A note can have multiple tags ("work", "urgent", "svelte"). A tag can be on multiple notes. This is a **many-to-many** relationship.

Relational databases model many-to-many with a **junction table** (also called a "join table" or "pivot table"). The junction table has two foreign keys — one to each side:

```typescript
export const notesTags = sqliteTable('notes_tags', {
    noteId: integer('note_id').notNull().references(() => notes.id),
    tagId: integer('tag_id').notNull().references(() => tags.id)
});
```

Then you define relations on all three tables:

```typescript
export const notesRelations = relations(notes, ({ one, many }) => ({
    user: one(users, { fields: [notes.userId], references: [users.id] }),
    notesTags: many(notesTags)
}));

export const tagsRelations = relations(tags, ({ many }) => ({
    notesTags: many(notesTags)
}));

export const notesTagsRelations = relations(notesTags, ({ one }) => ({
    note: one(notes, { fields: [notesTags.noteId], references: [notes.id] }),
    tag: one(tags, { fields: [notesTags.tagId], references: [tags.id] })
}));
```

### 1.4 The relational query API — `db.query`

Once relations are declared, Drizzle unlocks the `db.query` API — a higher-level interface that loads related data with nested `with` clauses:

```typescript
// Load all notes with their author and tags
const notesWithRelations = db.query.notes.findMany({
    with: {
        user: true,
        notesTags: {
            with: {
                tag: true
            }
        }
    }
});
```

This returns:
```typescript
[
    {
        id: 1,
        title: 'My note',
        content: '...',
        userId: 1,
        user: { id: 1, name: 'Student', email: '...' },
        notesTags: [
            { noteId: 1, tagId: 1, tag: { id: 1, name: 'svelte' } },
            { noteId: 1, tagId: 2, tag: { id: 2, name: 'database' } }
        ]
    }
]
```

One call, all data included, fully typed. Drizzle translates this into efficient SQL JOINs under the hood.

### 1.5 findMany vs findFirst

- `db.query.notes.findMany({ ... })` — returns an array of all matching records
- `db.query.notes.findFirst({ where: eq(notes.id, 1), with: { user: true } })` — returns a single record or undefined

Both accept `where`, `with`, `orderBy`, `limit`, and `offset` options.

### 1.6 How this differs from the low-level select API

The `db.select().from()` API from Lesson 16.5 is the low-level builder — it maps directly to SQL and gives you full control. The `db.query` API is the high-level relational layer — it handles JOINs automatically based on your declared relations.

Use `db.query` when you need related data (notes with their tags). Use `db.select()` when you need raw SQL power (complex aggregations, subqueries, unions) or when you are not loading related records.

## 2. Style it — Relational data display

The mini-build shows notes with their tags displayed as pills and the author name as a subtle byline. PE7 styling:

- Tag pills use `var(--radius-full)` with a light `var(--color-brand)` background at 15% opacity
- Author byline in `var(--color-text-muted)` with `var(--text-sm)` size
- Notes list uses a card layout with consistent spacing `var(--space-md)`
- Relationship lines (in the schema diagram) use SVG with `var(--color-border)` strokes
- Per-page personality: `--color-brand: oklch(63% 0.2 280)` — a purple tone suggesting connections and networks

## 3. Interact — Nested object types and the `with` pattern

The TypeScript concept is **nested type inference**. When you use `db.query.notes.findMany({ with: { user: true } })`, the return type automatically includes the nested `user` property typed according to the `users` schema. You do not write this type manually — Drizzle infers it from the combination of your schema definitions and the `with` options you pass.

```typescript
// Without `with`, the type is flat:
const flat = db.query.notes.findMany();
// Type: { id: number; title: string; content: string; userId: number; ... }[]

// With `with: { user: true }`, the type gains a nested object:
const nested = db.query.notes.findMany({ with: { user: true } });
// Type: { id: number; title: string; ...; user: { id: number; name: string; email: string; ... } }[]
```

This is conditional typing in action — the shape of the options object determines the shape of the result. Drizzle achieves this with advanced TypeScript generics, but you benefit from it without writing any generics yourself.

The practical consequence: hover over your variable in the editor and see the exact nested shape. Destructure confidently. Access `note.user.name` knowing it exists and is typed as `string`.

## 4. Mini-build — Notes with relations explorer

**File:** `src/routes/modules/16-database/06-relations-joins/+page.svelte`

This page loads notes with their user and tags using the relational query API. It displays them in a rich card format showing the nested data. The student can create tags, assign them to notes, and see the many-to-many relationship in action.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/16-database/06-relations-joins`.

### DevTools verification

1. Check the Network tab when loading. Only one server request fetches the page — all related data comes in a single load.
2. In your editor, hover over the `data.notes` prop. The type should show the nested structure with `user` and `notesTags` included.
3. Create a tag and assign it to multiple notes. The tag appears on each note's card — proving the many-to-many relationship works.
4. Open `data/dev.db` in a SQLite viewer and inspect the `notes_tags` table. Each row is a single relationship link between a note and a tag.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the N+1 problem and how do relations solve it?</summary>

The N+1 problem occurs when loading a list of N items requires 1 query for the list plus N additional queries to load related data for each item (e.g., fetching each note's author separately). Relations solve it by letting you declare relationships and then load all related data in a single query using JOINs — one SQL statement retrieves everything.
</details>

<details>
<summary><strong>Q2.</strong> Why does a many-to-many relationship require a junction table?</summary>

A relational database column can hold only one value per row. You cannot store "multiple tag IDs" in a single column of the notes table. The junction table creates individual rows for each link — one row per note-tag pair. This way, a note can have many tags (many rows in the junction where noteId matches) and a tag can be on many notes (many rows where tagId matches).
</details>

<details>
<summary><strong>Q3.</strong> In the relations definition, why must both sides (one and many) be declared?</summary>

Drizzle needs to know the complete picture to resolve queries from either direction. The `many(notes)` on users lets you write `db.query.users.findMany({ with: { notes: true } })`. The `one(users, { fields, references })` on notes lets you write `db.query.notes.findMany({ with: { user: true } })`. Without both, Drizzle would not know the join columns for one of the directions.
</details>

<details>
<summary><strong>Q4.</strong> What is the difference between <code>db.select().from(notes)</code> and <code>db.query.notes.findMany()</code>?</summary>

`db.select().from(notes)` is the low-level SQL builder — you manually construct the query, write your own JOINs, and get flat result rows. `db.query.notes.findMany()` is the relational API — it uses your declared `relations()` to automatically JOIN and nest related data. Use the relational API when you need connected data; use the select builder for complex queries that don't fit the relational model.
</details>

<details>
<summary><strong>Q5.</strong> If you add <code>with: { notesTags: { with: { tag: true } } }</code> to a findMany query, describe the shape of the returned data.</summary>

Each note object contains a `notesTags` array. Each element in that array has the junction table columns (`noteId`, `tagId`) plus a nested `tag` object with the full tag data (`id`, `name`). This two-level nesting is how many-to-many relationships appear — you traverse through the junction table to reach the related tags.
</details>

## 6. Common mistakes

- **Forgetting to pass `{ schema }` when creating the drizzle instance.** The `db.query` relational API only works if you pass your schema to `drizzle(sqlite, { schema })`. Without it, `db.query` is undefined and you get a runtime error: "Cannot read properties of undefined (reading 'notes')".
- **Declaring relations without exporting them.** Relations must be exported from the schema file and included in the schema object passed to `drizzle()`. If you define `const notesRelations = relations(...)` without `export`, Drizzle cannot discover the relationship.
- **Confusing `.references()` (schema constraint) with `relations()` (query helper).** `.references(() => users.id)` on a column creates a foreign key constraint in the database (enforced by SQLite). `relations()` tells Drizzle's query API how to JOIN tables. You need both — the foreign key for data integrity, and the relation for convenient querying.
- **Expecting junction table data to be flattened.** When loading notes with tags through a junction table, the result includes the junction rows (`notesTags`) as an intermediate array. The tags are nested inside. You need to map through: `note.notesTags.map(nt => nt.tag)` to get a flat array of tags.

## 7. What's next

Lesson 16.7 brings the database into SvelteKit's load functions — using `+page.server.ts` to query the database and pass typed results to your page components.
