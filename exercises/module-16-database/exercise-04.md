---
module: 16
exercise: 4
title: Migration Workflow
difficulty: expert
estimated_time: 45
skills_tested:
  - schema evolution
  - migration generation
  - migration application
  - rollback strategy
  - data preservation during schema changes
---

# Exercise 16.4 — Migration Workflow

## Brief

Practice the database migration workflow by evolving the blog schema. Add a `tags` table, a many-to-many junction table `post_tags`, and a new `excerpt` column to the existing `posts` table. Generate Drizzle Kit migration files, understand what they contain, and learn how to manage schema evolution safely. This exercise teaches the migration lifecycle that every production database requires.

## Requirements

1. Add a `tagsTable` to the schema with: `id` (UUID), `name` (text, unique), `slug` (text, unique)
2. Add a `postTagsTable` junction table with: `postId` (UUID, FK to posts), `tagId` (UUID, FK to tags), composite primary key
3. Add an `excerpt` column to the existing `postsTable` (text, nullable — because existing rows will not have a value)
4. Define relations for the many-to-many relationship (posts to tags through post_tags)
5. Document the migration commands: `pnpm drizzle-kit generate` and `pnpm drizzle-kit migrate`
6. Create `src/routes/exercises/16-database/04/+page.svelte` showing the migration plan as a visual diff
7. Explain the difference between `push` (development) and `migrate` (production) in the exercise page
8. Show what a rollback strategy looks like (add a column is easy, drop a column requires a backup)
9. TypeScript strict mode — all new tables and relations must be fully typed
10. Style with PE7 tokens

## Constraints

- New columns on existing tables must be nullable or have defaults (never break existing data)
- The junction table must use a composite primary key
- No destructive migrations (DROP TABLE, DROP COLUMN) without documenting the risk

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A many-to-many relationship requires a junction table. The junction table has two foreign keys — one to each side of the relationship. Drizzle uses `primaryKey({ columns: [postTagsTable.postId, postTagsTable.tagId] })` for composite primary keys.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Adding a column to an existing table with data must be either nullable (`text('excerpt')`) or have a default (`text('excerpt').default('')`). If you make it `.notNull()` without a default, the migration will fail because existing rows cannot satisfy the constraint. Drizzle Kit's `generate` command reads your current schema and compares it to the last migration snapshot to produce the diff.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
export const tagsTable = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique()
});

export const postTagsTable = pgTable('post_tags', {
  postId: uuid('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tagsTable.id, { onDelete: 'cascade' })
}, (t) => [
  primaryKey({ columns: [t.postId, t.tagId] })
]);
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/server/db/schema.ts`** (additions)

```typescript
import { relations } from 'drizzle-orm';
import { pgTable, text, boolean, timestamp, uuid, primaryKey } from 'drizzle-orm/pg-core';

// ... existing postsTable with new excerpt column:
// Add to postsTable definition:
// excerpt: text('excerpt'),   // nullable — safe for existing rows

export const tagsTable = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique()
});

export const postTagsTable = pgTable(
  'post_tags',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsTable.id, { onDelete: 'cascade' })
  },
  (t) => [primaryKey({ columns: [t.postId, t.tagId] })]
);

export type Tag = typeof tagsTable.$inferSelect;
export type NewTag = typeof tagsTable.$inferInsert;

// Relations for many-to-many
export const tagsRelations = relations(tagsTable, ({ many }) => ({
  postTags: many(postTagsTable)
}));

export const postTagsRelations = relations(postTagsTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postTagsTable.postId],
    references: [postsTable.id]
  }),
  tag: one(tagsTable, {
    fields: [postTagsTable.tagId],
    references: [tagsTable.id]
  })
}));

// Update postsRelations to include postTags
// export const postsRelations = relations(postsTable, ({ many }) => ({
//   comments: many(commentsTable),
//   postTags: many(postTagsTable)
// }));
```

**`src/routes/exercises/16-database/04/+page.svelte`**

```svelte
<script lang="ts">
  interface MigrationStep {
    action: 'CREATE TABLE' | 'ALTER TABLE' | 'CREATE INDEX';
    target: string;
    sql: string;
    risk: 'safe' | 'caution' | 'dangerous';
    note: string;
  }

  const migrationPlan: MigrationStep[] = [
    {
      action: 'CREATE TABLE',
      target: 'tags',
      sql: `CREATE TABLE "tags" (\n  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,\n  "name" text NOT NULL UNIQUE,\n  "slug" text NOT NULL UNIQUE\n);`,
      risk: 'safe',
      note: 'New table — no existing data affected'
    },
    {
      action: 'CREATE TABLE',
      target: 'post_tags',
      sql: `CREATE TABLE "post_tags" (\n  "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,\n  "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,\n  PRIMARY KEY ("post_id", "tag_id")\n);`,
      risk: 'safe',
      note: 'Junction table for many-to-many — no existing data affected'
    },
    {
      action: 'ALTER TABLE',
      target: 'posts',
      sql: `ALTER TABLE "posts" ADD COLUMN "excerpt" text;`,
      risk: 'safe',
      note: 'Nullable column — existing rows get NULL. Safe because no NOT NULL constraint.'
    }
  ];

  interface WorkflowStep {
    command: string;
    description: string;
    when: string;
  }

  const pushVsMigrate: WorkflowStep[] = [
    {
      command: 'pnpm drizzle-kit push',
      description: 'Directly applies schema changes to the database. Fast but no migration history.',
      when: 'Development — rapid iteration, throwaway databases'
    },
    {
      command: 'pnpm drizzle-kit generate',
      description: 'Generates SQL migration files from schema diff. Creates versioned .sql files.',
      when: 'Before deployment — creates auditable migration files'
    },
    {
      command: 'pnpm drizzle-kit migrate',
      description: 'Applies pending migration files in order. Tracks which migrations have run.',
      when: 'Production — controlled, repeatable deployments'
    }
  ];
</script>

<main class="page">
  <h1>Migration Plan</h1>
  <p class="intro">This page visualizes the migration that evolves our blog schema to support tags.</p>

  <section class="plan">
    <h2>Migration Steps</h2>
    {#each migrationPlan as step}
      <div class="step-card" data-risk={step.risk}>
        <div class="step-header">
          <span class="action">{step.action}</span>
          <span class="target">{step.target}</span>
          <span class="risk-badge">{step.risk}</span>
        </div>
        <pre class="sql"><code>{step.sql}</code></pre>
        <p class="note">{step.note}</p>
      </div>
    {/each}
  </section>

  <section class="workflow">
    <h2>push vs. migrate</h2>
    <div class="workflow-grid">
      {#each pushVsMigrate as item}
        <div class="workflow-card">
          <code class="cmd">{item.command}</code>
          <p class="desc">{item.description}</p>
          <p class="when"><strong>When:</strong> {item.when}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="rollback">
    <h2>Rollback Strategy</h2>
    <div class="rollback-grid">
      <div class="rollback-card safe">
        <h3>Safe to Reverse</h3>
        <ul>
          <li>ADD COLUMN (nullable) — just DROP COLUMN</li>
          <li>CREATE TABLE — just DROP TABLE</li>
          <li>CREATE INDEX — just DROP INDEX</li>
        </ul>
      </div>
      <div class="rollback-card dangerous">
        <h3>Requires Backup</h3>
        <ul>
          <li>DROP COLUMN — data is permanently lost</li>
          <li>DROP TABLE — all rows are permanently lost</li>
          <li>ALTER COLUMN TYPE — may lose precision</li>
          <li>ADD NOT NULL to existing column — may fail if NULLs exist</li>
        </ul>
      </div>
    </div>
  </section>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }

  .plan { margin-block-end: var(--space-2xl); }

  .step-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-block-end: var(--space-md);
  }

  .step-card[data-risk='caution'] { border-inline-start: 3px solid var(--color-warning); }
  .step-card[data-risk='dangerous'] { border-inline-start: 3px solid var(--color-error); }
  .step-card[data-risk='safe'] { border-inline-start: 3px solid var(--color-success); }

  .step-header { display: flex; gap: var(--space-sm); align-items: center; margin-block-end: var(--space-sm); }
  .action { font-size: var(--text-sm); font-weight: 700; color: var(--color-brand); }
  .target { font-size: var(--text-sm); font-weight: 600; }
  .risk-badge { font-size: var(--text-xs); padding: 0.1em 0.5em; border-radius: var(--radius-full); background: var(--color-surface); border: 1px solid var(--color-border); margin-inline-start: auto; }

  .sql { background: var(--color-surface); padding: var(--space-sm); border-radius: var(--radius-sm); overflow-x: auto; font-size: var(--text-xs); margin-block-end: var(--space-sm); }
  .note { font-size: var(--text-xs); color: var(--color-text-muted); }

  .workflow { margin-block-end: var(--space-2xl); }
  .workflow-grid { display: grid; gap: var(--space-md); }

  .workflow-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  .cmd { font-size: var(--text-sm); color: var(--color-brand); font-weight: 600; display: block; margin-block-end: var(--space-xs); }
  .desc { font-size: var(--text-sm); margin-block-end: var(--space-xs); }
  .when { font-size: var(--text-xs); color: var(--color-text-muted); }

  .rollback-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: var(--space-md); }

  .rollback-card {
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  .rollback-card.safe { background: var(--color-surface-2); border: 1px solid var(--color-success); }
  .rollback-card.dangerous { background: var(--color-surface-2); border: 1px solid var(--color-error); }

  .rollback-card h3 { font-size: var(--text-sm); margin-block-end: var(--space-sm); }
  .rollback-card ul { padding-inline-start: var(--space-md); }
  .rollback-card li { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-xs); }
</style>
```

### Explanation

This exercise focuses on the migration lifecycle rather than just writing schema code. In production, you never run `push` — you generate migration files that can be code-reviewed, version-controlled, and applied in order. The key insight about the `excerpt` column is that it must be nullable (no `.notNull()`) because existing rows in the `posts` table do not have an excerpt value — adding a NOT NULL column without a default to a table with data will cause the migration to fail. The many-to-many junction table (`post_tags`) uses a composite primary key to ensure a post-tag pair is unique and to avoid the overhead of a separate primary key column. The `onDelete: 'cascade'` on both foreign keys means deleting a post or tag automatically cleans up the junction table rows. The visual migration plan on the page helps developers understand what SQL will run before they execute it — this is the same mental model that `drizzle-kit generate` produces.
</details>
