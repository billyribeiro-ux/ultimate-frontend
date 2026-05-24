---
module: 16
exercise: 1
title: Schema Definition
difficulty: beginner
estimated_time: 10
skills_tested:
  - table schema definition
  - column types and constraints
  - TypeScript type inference from schema
  - primary keys and defaults
---

# Exercise 16.1 — Schema Definition

## Brief

Define a database schema for a blog application using Drizzle ORM. The schema should include a `posts` table with proper column types, constraints, and defaults. Then use Drizzle's type inference to create TypeScript types for inserting and selecting posts. This exercise teaches the foundational pattern of schema-driven development where your database schema is the single source of truth for TypeScript types.

## Requirements

1. Create `src/lib/server/db/schema.ts` with a `posts` table definition
2. The table must have: `id` (UUID, primary key, default random), `title` (text, not null), `content` (text, not null), `slug` (text, unique, not null), `published` (boolean, default false), `createdAt` (timestamp, default now), `updatedAt` (timestamp, default now)
3. Export the table definition as `postsTable`
4. Use Drizzle's `$inferInsert` and `$inferSelect` to create inferred types
5. Export types `NewPost` (for inserts) and `Post` (for selects)
6. Create a simple validation function `validateNewPost(data: unknown): NewPost | { errors: string[] }` that checks required fields
7. Create `src/routes/exercises/16-database/01/+page.svelte` that displays the schema definition as documentation
8. Style with PE7 tokens

## Constraints

- No raw SQL strings — use only the Drizzle schema builder API
- TypeScript strict mode — the inferred types must pass without manual overrides
- All column constraints must be enforced at the schema level, not application level

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Drizzle ORM schemas are defined using `pgTable` (for PostgreSQL), `sqliteTable`, or `mysqlTable`. Each column is created with a function like `text('column_name')`, `boolean('column_name')`, or `timestamp('column_name')`. Chain `.notNull()`, `.default()`, and `.primaryKey()` for constraints.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The UUID primary key with a default uses `uuid('id').defaultRandom().primaryKey()`. Timestamps with defaults use `timestamp('created_at').defaultNow()`. Unique constraints use `.unique()`. Type inference works via `typeof postsTable.$inferInsert` and `typeof postsTable.$inferSelect`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

export const postsTable = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  // ... more columns
});

export type NewPost = typeof postsTable.$inferInsert;
export type Post = typeof postsTable.$inferSelect;
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/server/db/schema.ts`**

```typescript
import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

export const postsTable = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slug: text('slug').notNull().unique(),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export type NewPost = typeof postsTable.$inferInsert;
export type Post = typeof postsTable.$inferSelect;

interface ValidationSuccess {
  valid: true;
  data: NewPost;
}

interface ValidationFailure {
  valid: false;
  errors: string[];
}

export function validateNewPost(data: unknown): ValidationSuccess | ValidationFailure {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Input must be an object'] };
  }

  const record = data as Record<string, unknown>;

  if (typeof record.title !== 'string' || record.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }

  if (typeof record.content !== 'string' || record.content.trim().length === 0) {
    errors.push('Content is required and must be a non-empty string');
  }

  if (typeof record.slug !== 'string' || record.slug.trim().length === 0) {
    errors.push('Slug is required and must be a non-empty string');
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug as string)) {
    errors.push('Slug must be lowercase alphanumeric with hyphens only');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      title: (record.title as string).trim(),
      content: (record.content as string).trim(),
      slug: (record.slug as string).trim(),
      published: typeof record.published === 'boolean' ? record.published : false
    }
  };
}
```

**`src/routes/exercises/16-database/01/+page.svelte`**

```svelte
<script lang="ts">
  interface ColumnDoc {
    name: string;
    type: string;
    constraints: string[];
  }

  const columns: ColumnDoc[] = [
    { name: 'id', type: 'UUID', constraints: ['Primary Key', 'Default: random UUID'] },
    { name: 'title', type: 'TEXT', constraints: ['Not Null'] },
    { name: 'content', type: 'TEXT', constraints: ['Not Null'] },
    { name: 'slug', type: 'TEXT', constraints: ['Not Null', 'Unique'] },
    { name: 'published', type: 'BOOLEAN', constraints: ['Not Null', 'Default: false'] },
    { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['Not Null', 'Default: now()'] },
    { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['Not Null', 'Default: now()'] }
  ];
</script>

<main class="page">
  <h1>Posts Table Schema</h1>
  <p class="intro">Schema-driven development: the database schema is the single source of truth for TypeScript types.</p>

  <div class="schema-table">
    <table>
      <thead>
        <tr>
          <th>Column</th>
          <th>Type</th>
          <th>Constraints</th>
        </tr>
      </thead>
      <tbody>
        {#each columns as col}
          <tr>
            <td><code>{col.name}</code></td>
            <td><code>{col.type}</code></td>
            <td>
              {#each col.constraints as constraint}
                <span class="badge">{constraint}</span>
              {/each}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="types-card">
    <h2>Inferred Types</h2>
    <p><code>Post</code> — the shape of a row returned from SELECT (all fields required)</p>
    <p><code>NewPost</code> — the shape for INSERT (id, timestamps, and published are optional)</p>
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-sm);
  }

  .intro {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    margin-block-end: var(--space-xl);
  }

  .schema-table {
    overflow-x: auto;
    margin-block-end: var(--space-xl);
  }

  table {
    inline-size: 100%;
    border-collapse: collapse;
    font-size: var(--text-sm);
  }

  th {
    text-align: start;
    padding: var(--space-sm);
    border-block-end: 2px solid var(--color-brand);
    font-weight: 600;
  }

  td {
    padding: var(--space-sm);
    border-block-end: 1px solid var(--color-border);
    vertical-align: top;
  }

  code {
    font-size: var(--text-xs);
    background: var(--color-surface-2);
    padding: 0.1em 0.4em;
    border-radius: var(--radius-sm);
  }

  .badge {
    display: inline-block;
    font-size: var(--text-xs);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    padding: 0.1em 0.5em;
    border-radius: var(--radius-full);
    margin-inline-end: var(--space-xs);
    margin-block-end: var(--space-xs);
  }

  .types-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }

  .types-card h2 {
    font-size: var(--text-lg);
    margin-block-end: var(--space-md);
  }

  .types-card p {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-xs);
  }
</style>
```

### Explanation

This solution demonstrates schema-driven development with Drizzle ORM. The `pgTable` function defines the table structure, and each column function (`text`, `uuid`, `boolean`, `timestamp`) maps to a PostgreSQL column type. Constraints like `.notNull()`, `.unique()`, and `.default()` are enforced at the database level, not the application level — this means invalid data is rejected even if your application has bugs. The `$inferInsert` and `$inferSelect` types are the key innovation: instead of manually maintaining TypeScript interfaces that mirror your schema, Drizzle infers them automatically. `Post` (select type) has all fields required (the database always returns them), while `NewPost` (insert type) makes fields with defaults optional (you can omit `id`, `createdAt`, `published` and the database fills them in). The `validateNewPost` function demonstrates application-level validation on top of the schema constraints — you still want to validate before hitting the database to provide better error messages.
</details>
