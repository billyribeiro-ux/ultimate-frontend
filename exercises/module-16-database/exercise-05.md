---
module: 16
exercise: 5
title: Transaction Safety
difficulty: principal
estimated_time: 60
skills_tested:
  - database transactions
  - atomic multi-table operations
  - rollback on failure
  - error handling in transactions
  - consistency guarantees
---

# Exercise 16.5 — Transaction Safety

## Brief

Build a "publish post" operation that must atomically: (1) update the post's `published` flag to `true`, (2) update the `updatedAt` timestamp, (3) insert tags that do not exist yet, (4) create `post_tags` junction entries, and (5) insert an activity log entry. If any step fails, the entire operation must roll back — you should never end up with a published post but missing tags, or tags without the junction entries. This exercise teaches transaction safety for multi-step database operations.

## Requirements

1. Create `src/lib/server/db/operations.ts` with a `publishPost` function
2. The function accepts: `postId: string`, `tagNames: string[]`
3. Wrap all operations in `db.transaction(async (tx) => { ... })`
4. Inside the transaction: (a) update the post to `published: true, updatedAt: new Date()`, (b) for each tag name, insert-or-find the tag, (c) create `post_tags` entries linking the post to each tag, (d) insert into an `activityLogTable` with `action: 'publish'`, `postId`, `timestamp`
5. Add an `activityLogTable` to the schema with: `id` (UUID), `action` (text), `postId` (UUID, FK), `createdAt` (timestamp)
6. Create `src/routes/exercises/16-database/05/+page.server.ts` with a `publish` form action that calls the function
7. Create `src/routes/exercises/16-database/05/+page.svelte` showing a post with a "Publish" button and tag input
8. Handle transaction failures gracefully — display a clear error message
9. Demonstrate a forced failure scenario (e.g., an invalid tag name) that triggers a rollback
10. Style with PE7 tokens

## Constraints

- All database writes must be inside the transaction — no writes outside `tx`
- Use `tx` (the transaction handle) for all queries, not `db`
- TypeScript strict mode with zero errors
- The tag upsert must handle the case where the tag already exists (ON CONFLICT or check-then-insert)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Drizzle transactions use `db.transaction(async (tx) => { ... })`. Inside the callback, use `tx` instead of `db` for all queries. If any query throws, the entire transaction is rolled back automatically. You can also manually call `tx.rollback()` to abort.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

For the tag upsert, use `tx.insert(tagsTable).values({ name, slug }).onConflictDoNothing().returning()`. If the insert was skipped (tag exists), query for it with `tx.select().from(tagsTable).where(eq(tagsTable.slug, slug))`. Then use the tag ID to insert into `postTagsTable`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
export async function publishPost(postId: string, tagNames: string[]) {
  return db.transaction(async (tx) => {
    // 1. Update post
    await tx.update(postsTable)
      .set({ published: true, updatedAt: new Date() })
      .where(eq(postsTable.id, postId));

    // 2. Upsert tags
    for (const name of tagNames) {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const [tag] = await tx.insert(tagsTable)
        .values({ name, slug })
        .onConflictDoNothing()
        .returning();
      // If conflict, query for existing tag...
      // 3. Create junction entry
      await tx.insert(postTagsTable).values({ postId, tagId: tag.id }).onConflictDoNothing();
    }

    // 4. Activity log
    await tx.insert(activityLogTable).values({ action: 'publish', postId });
  });
}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/server/db/schema.ts`** (addition)

```typescript
export const activityLogTable = pgTable('activity_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  action: text('action').notNull(),
  postId: uuid('post_id')
    .notNull()
    .references(() => postsTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export type ActivityLogEntry = typeof activityLogTable.$inferSelect;
```

**`src/lib/server/db/operations.ts`**

```typescript
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
  postsTable,
  tagsTable,
  postTagsTable,
  activityLogTable
} from '$lib/server/db/schema';

interface PublishResult {
  success: true;
  tagCount: number;
}

interface PublishError {
  success: false;
  error: string;
  rolledBack: true;
}

export async function publishPost(
  postId: string,
  tagNames: string[]
): Promise<PublishResult | PublishError> {
  try {
    const result = await db.transaction(async (tx) => {
      // Step 1: Verify the post exists and update it
      const [updatedPost] = await tx
        .update(postsTable)
        .set({ published: true, updatedAt: new Date() })
        .where(eq(postsTable.id, postId))
        .returning();

      if (!updatedPost) {
        tx.rollback();
        // This line is unreachable — rollback throws — but satisfies TypeScript
        throw new Error('Post not found');
      }

      // Step 2: Upsert tags and create junction entries
      let tagCount = 0;
      for (const name of tagNames) {
        const trimmed = name.trim();
        if (!trimmed) continue;

        if (trimmed.length > 50) {
          throw new Error(`Tag name too long: "${trimmed}" (max 50 characters)`);
        }

        const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Try to insert the tag — if it exists, do nothing
        const inserted = await tx
          .insert(tagsTable)
          .values({ name: trimmed, slug })
          .onConflictDoNothing()
          .returning();

        // Get the tag ID (either from insert or existing)
        let tagId: string;
        if (inserted.length > 0) {
          tagId = inserted[0].id;
        } else {
          const [existing] = await tx
            .select()
            .from(tagsTable)
            .where(eq(tagsTable.slug, slug));
          tagId = existing.id;
        }

        // Create junction entry (ignore if already linked)
        await tx
          .insert(postTagsTable)
          .values({ postId, tagId })
          .onConflictDoNothing();

        tagCount++;
      }

      // Step 3: Activity log
      await tx.insert(activityLogTable).values({
        action: 'publish',
        postId
      });

      return { tagCount };
    });

    return { success: true, tagCount: result.tagCount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown transaction error';
    return { success: false, error: message, rolledBack: true };
  }
}
```

**`src/routes/exercises/16-database/05/+page.server.ts`**

```typescript
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { postsTable } from '$lib/server/db/schema';
import { publishPost } from '$lib/server/db/operations';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.published, false));

  return { draftPosts: posts };
};

export const actions: Actions = {
  publish: async ({ request }) => {
    const formData = await request.formData();
    const postId = formData.get('postId')?.toString() ?? '';
    const tagsRaw = formData.get('tags')?.toString() ?? '';

    if (!postId) {
      return fail(400, { error: 'Post ID is required' });
    }

    const tagNames = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await publishPost(postId, tagNames);

    if (!result.success) {
      return fail(400, {
        error: result.error,
        rolledBack: true,
        values: { postId, tags: tagsRaw }
      });
    }

    return {
      published: true,
      tagCount: result.tagCount
    };
  }
};
```

**`src/routes/exercises/16-database/05/+page.svelte`**

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  interface DraftPost {
    id: string;
    title: string;
    slug: string;
    createdAt: Date;
  }

  interface Props {
    data: { draftPosts: DraftPost[] };
    form: {
      error?: string;
      rolledBack?: boolean;
      published?: boolean;
      tagCount?: number;
      values?: { postId: string; tags: string };
    } | null;
  }

  let { data, form }: Props = $props();
</script>

<main class="page">
  <h1>Publish with Transaction</h1>
  <p class="intro">Publishing a post atomically updates the post, creates tags, links them, and logs the action. If any step fails, everything rolls back.</p>

  {#if form?.published}
    <div class="result-card success">
      <h2>Published Successfully</h2>
      <p>Post published with {form.tagCount} tag{form.tagCount === 1 ? '' : 's'}. All operations completed atomically.</p>
    </div>
  {/if}

  {#if form?.error}
    <div class="result-card error">
      <h2>Transaction Failed</h2>
      <p>{form.error}</p>
      {#if form.rolledBack}
        <p class="rollback-notice">All changes have been rolled back. No data was modified.</p>
      {/if}
    </div>
  {/if}

  <section class="drafts">
    <h2>Draft Posts</h2>

    {#if data.draftPosts.length === 0}
      <p class="empty">No draft posts available. All posts are published.</p>
    {:else}
      {#each data.draftPosts as post (post.id)}
        <div class="draft-card">
          <div class="draft-info">
            <h3>{post.title}</h3>
            <p class="slug">/{post.slug}</p>
          </div>

          <form method="POST" action="?/publish" use:enhance class="publish-form">
            <input type="hidden" name="postId" value={post.id} />

            <div class="field">
              <label for="tags-{post.id}">Tags (comma-separated)</label>
              <input
                id="tags-{post.id}"
                name="tags"
                type="text"
                placeholder="svelte, tutorial, web"
              />
            </div>

            <button type="submit" class="btn-publish">Publish</button>
          </form>
        </div>
      {/each}
    {/if}
  </section>

  <section class="explainer">
    <h2>Transaction Guarantee</h2>
    <div class="steps-visual">
      <div class="tx-step">1. Update post to published</div>
      <div class="tx-connector">+</div>
      <div class="tx-step">2. Upsert tags</div>
      <div class="tx-connector">+</div>
      <div class="tx-step">3. Link post to tags</div>
      <div class="tx-connector">+</div>
      <div class="tx-step">4. Insert activity log</div>
      <div class="tx-connector">=</div>
      <div class="tx-step result">All or nothing</div>
    </div>
  </section>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-xs); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }

  .result-card {
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-block-end: var(--space-xl);
  }

  .result-card.success { background: var(--color-surface-2); border: 1px solid var(--color-success); }
  .result-card.error { background: var(--color-surface-2); border: 1px solid var(--color-error); }
  .result-card h2 { font-size: var(--text-base); margin-block-end: var(--space-xs); }
  .result-card p { font-size: var(--text-sm); color: var(--color-text-muted); }
  .rollback-notice { font-weight: 600; color: var(--color-warning); margin-block-start: var(--space-xs); }

  .drafts { margin-block-end: var(--space-2xl); }
  .empty { font-size: var(--text-sm); color: var(--color-text-muted); }

  .draft-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-block-end: var(--space-md);
  }

  .draft-info h3 { font-size: var(--text-base); }
  .slug { font-size: var(--text-xs); color: var(--color-brand); font-family: monospace; margin-block-end: var(--space-md); }

  .publish-form { display: flex; gap: var(--space-md); align-items: flex-end; flex-wrap: wrap; }
  .field { display: grid; gap: var(--space-xs); flex: 1; min-inline-size: 12rem; }
  label { font-size: var(--text-sm); font-weight: 600; }

  input {
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    background: var(--color-surface);
    color: var(--color-text);
  }

  .btn-publish {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-success);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: var(--text-sm);
    cursor: pointer;
    white-space: nowrap;
  }

  .explainer { margin-block-start: var(--space-xl); }

  .steps-visual {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
    justify-content: center;
  }

  .tx-step {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-xs);
    font-weight: 600;
  }

  .tx-step.result {
    background: var(--color-brand);
    color: var(--color-surface);
    border-color: transparent;
  }

  .tx-connector {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-text-muted);
  }
</style>
```

### Explanation

Transactions are the database's guarantee of atomicity — either all operations succeed or none do. The `db.transaction(async (tx) => { ... })` pattern gives you a `tx` handle that you must use for all queries inside the transaction. If any query throws an error, Drizzle automatically calls `ROLLBACK` and the database returns to its state before the transaction began. The `tx.rollback()` method allows you to manually abort the transaction. The tag upsert pattern (`onConflictDoNothing().returning()`) handles the case where a tag already exists — if the insert was a no-op, the returning array is empty, so you fall back to a SELECT query. The composite primary key on `post_tags` prevents duplicate links. The `activityLogTable` provides an audit trail. The try/catch wrapper around the transaction converts database errors into user-friendly result objects. In production, transactions are essential for any operation that spans multiple tables — without them, a crash mid-operation could leave your data in an inconsistent state (e.g., a post marked as published but with no tags linked).
</details>
