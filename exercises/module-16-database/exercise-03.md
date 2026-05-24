---
module: 16
exercise: 3
title: Relations Query
difficulty: advanced
estimated_time: 30
skills_tested:
  - foreign key definitions
  - relation declarations
  - joined/nested queries
  - type-safe relation results
  - data modeling patterns
---

# Exercise 16.3 — Relations Query

## Brief

Extend the blog schema with a `comments` table that references the `posts` table via a foreign key. Define Drizzle relations between the two tables, then build a post detail page that loads a post with all its comments in a single query. This exercise teaches relational data modeling and the query patterns for fetching nested data.

## Requirements

1. Add a `commentsTable` to `src/lib/server/db/schema.ts` with: `id` (UUID), `postId` (UUID, foreign key to posts), `author` (text), `body` (text), `createdAt` (timestamp)
2. Define Drizzle relations: a post `hasMany` comments, a comment `belongsTo` a post
3. Create `src/routes/exercises/16-database/03/[slug]/+page.server.ts` that loads a post by slug with all comments
4. Use Drizzle's relational query API (`db.query.postsTable.findFirst({ with: { comments: true } })`)
5. Create `src/routes/exercises/16-database/03/[slug]/+page.svelte` that displays the post and its comments
6. Add a form action to submit a new comment on the post
7. Handle the case where the post does not exist (return 404)
8. Order comments by `createdAt` ascending (oldest first)
9. Create a listing page at `src/routes/exercises/16-database/03/+page.svelte` showing all posts with their comment counts
10. Style with PE7 tokens

## Constraints

- Use Drizzle's relational query API, not manual JOIN SQL
- TypeScript strict mode — nested types must be correctly inferred
- Foreign key constraints must be defined at the schema level
- The comment form must work without JavaScript

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Foreign keys in Drizzle are defined with `.references(() => postsTable.id)`. Relations are declared separately using the `relations` function: `export const postsRelations = relations(postsTable, ({ many }) => ({ comments: many(commentsTable) }))`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The relational query API uses `db.query.postsTable.findFirst({ where: eq(postsTable.slug, slug), with: { comments: { orderBy: [asc(commentsTable.createdAt)] } } })`. This returns a typed object with `comments` as a nested array. For the listing with counts, you can use `db.query.postsTable.findMany({ with: { comments: true } })` and compute `post.comments.length` in the template.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// schema.ts additions
export const commentsTable = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  author: text('author').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const postsRelations = relations(postsTable, ({ many }) => ({
  comments: many(commentsTable)
}));

export const commentsRelations = relations(commentsTable, ({ one }) => ({
  post: one(postsTable, { fields: [commentsTable.postId], references: [postsTable.id] })
}));
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/server/db/schema.ts`** (additions)

```typescript
import { relations } from 'drizzle-orm';
import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

// ... existing postsTable definition ...

export const commentsTable = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id')
    .notNull()
    .references(() => postsTable.id, { onDelete: 'cascade' }),
  author: text('author').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export type NewComment = typeof commentsTable.$inferInsert;
export type Comment = typeof commentsTable.$inferSelect;

export const postsRelations = relations(postsTable, ({ many }) => ({
  comments: many(commentsTable)
}));

export const commentsRelations = relations(commentsTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [commentsTable.postId],
    references: [postsTable.id]
  })
}));
```

**`src/routes/exercises/16-database/03/+page.server.ts`**

```typescript
import { db } from '$lib/server/db';
import { postsTable } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const posts = await db.query.postsTable.findMany({
    with: { comments: true },
    orderBy: (posts, { desc }) => [desc(posts.createdAt)]
  });

  return {
    posts: posts.map((p) => ({
      ...p,
      commentCount: p.comments.length
    }))
  };
};
```

**`src/routes/exercises/16-database/03/+page.svelte`**

```svelte
<script lang="ts">
  interface PostWithCount {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    createdAt: Date;
    commentCount: number;
  }

  interface Props {
    data: { posts: PostWithCount[] };
  }

  let { data }: Props = $props();
</script>

<main class="page">
  <h1>Posts with Comments</h1>

  <div class="post-list">
    {#each data.posts as post (post.id)}
      <a href="/exercises/16-database/03/{post.slug}" class="post-link">
        <article class="post-card">
          <h2>{post.title}</h2>
          <div class="meta">
            <span class="comment-count">{post.commentCount} comment{post.commentCount === 1 ? '' : 's'}</span>
            <time>{new Date(post.createdAt).toLocaleDateString()}</time>
          </div>
        </article>
      </a>
    {/each}
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
    margin-block-end: var(--space-xl);
  }

  .post-list {
    display: grid;
    gap: var(--space-md);
  }

  .post-link {
    text-decoration: none;
    color: inherit;
  }

  .post-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    transition: border-color var(--dur-fast) var(--ease-out);
  }

  .post-card:hover {
    border-color: var(--color-brand);
  }

  .post-card h2 {
    font-size: var(--text-base);
    margin-block-end: var(--space-sm);
  }

  .meta {
    display: flex;
    gap: var(--space-md);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .comment-count {
    font-weight: 600;
    color: var(--color-brand);
  }
</style>
```

**`src/routes/exercises/16-database/03/[slug]/+page.server.ts`**

```typescript
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { postsTable, commentsTable } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const post = await db.query.postsTable.findFirst({
    where: eq(postsTable.slug, params.slug),
    with: {
      comments: {
        orderBy: (comments, { asc }) => [asc(comments.createdAt)]
      }
    }
  });

  if (!post) {
    error(404, `Post not found: ${params.slug}`);
  }

  return { post };
};

export const actions: Actions = {
  comment: async ({ request, params }) => {
    const formData = await request.formData();
    const author = formData.get('author')?.toString().trim() ?? '';
    const body = formData.get('body')?.toString().trim() ?? '';

    if (!author || !body) {
      return fail(400, {
        error: 'Author and comment body are required',
        values: { author, body }
      });
    }

    // Find the post by slug to get its ID
    const post = await db.query.postsTable.findFirst({
      where: eq(postsTable.slug, params.slug)
    });

    if (!post) {
      error(404, 'Post not found');
    }

    await db.insert(commentsTable).values({
      postId: post.id,
      author,
      body
    });

    return { success: true };
  }
};
```

**`src/routes/exercises/16-database/03/[slug]/+page.svelte`**

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  interface Comment {
    id: string;
    author: string;
    body: string;
    createdAt: Date;
  }

  interface Post {
    id: string;
    title: string;
    content: string;
    slug: string;
    createdAt: Date;
    comments: Comment[];
  }

  interface Props {
    data: { post: Post };
    form: {
      error?: string;
      values?: { author: string; body: string };
      success?: boolean;
    } | null;
  }

  let { data, form }: Props = $props();
</script>

<main class="page">
  <a href="/exercises/16-database/03" class="back-link">Back to all posts</a>

  <article class="post">
    <h1>{data.post.title}</h1>
    <time class="post-date">{new Date(data.post.createdAt).toLocaleDateString()}</time>
    <div class="post-content">{data.post.content}</div>
  </article>

  <section class="comments-section">
    <h2>Comments ({data.post.comments.length})</h2>

    {#if data.post.comments.length === 0}
      <p class="empty">No comments yet. Be the first to comment.</p>
    {:else}
      <div class="comment-list">
        {#each data.post.comments as comment (comment.id)}
          <div class="comment">
            <div class="comment-header">
              <strong>{comment.author}</strong>
              <time>{new Date(comment.createdAt).toLocaleDateString()}</time>
            </div>
            <p>{comment.body}</p>
          </div>
        {/each}
      </div>
    {/if}

    <form method="POST" action="?/comment" use:enhance class="comment-form">
      <h3>Add a Comment</h3>

      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}

      {#if form?.success}
        <p class="success">Comment posted!</p>
      {/if}

      <div class="field">
        <label for="author">Your Name</label>
        <input id="author" name="author" type="text" required value={form?.values?.author ?? ''} />
      </div>

      <div class="field">
        <label for="body">Comment</label>
        <textarea id="body" name="body" rows={3} required>{form?.values?.body ?? ''}</textarea>
      </div>

      <button type="submit" class="btn">Post Comment</button>
    </form>
  </section>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  .back-link {
    font-size: var(--text-sm);
    color: var(--color-brand);
    text-decoration: none;
    display: inline-block;
    margin-block-end: var(--space-lg);
  }

  .post h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-xs);
  }

  .post-date {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .post-content {
    margin-block-start: var(--space-lg);
    font-size: var(--text-base);
    line-height: 1.7;
    color: var(--color-text);
  }

  .comments-section {
    margin-block-start: var(--space-2xl);
    border-block-start: 1px solid var(--color-border);
    padding-block-start: var(--space-xl);
  }

  .comments-section h2 {
    font-size: var(--text-lg);
    margin-block-end: var(--space-md);
  }

  .empty {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .comment-list {
    display: grid;
    gap: var(--space-md);
    margin-block-end: var(--space-xl);
  }

  .comment {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-block-end: var(--space-xs);
    font-size: var(--text-sm);
  }

  .comment-header time {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .comment p {
    font-size: var(--text-sm);
    color: var(--color-text);
  }

  .comment-form {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: grid;
    gap: var(--space-md);
  }

  .comment-form h3 {
    font-size: var(--text-base);
  }

  .error { font-size: var(--text-sm); color: var(--color-error); }
  .success { font-size: var(--text-sm); color: var(--color-success); }

  .field { display: grid; gap: var(--space-xs); }
  label { font-size: var(--text-sm); font-weight: 600; }

  input, textarea {
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: inherit;
  }

  .btn {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-brand);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    justify-self: start;
  }
</style>
```

### Explanation

This exercise introduces relational data modeling. The `commentsTable` has a `postId` foreign key with `onDelete: 'cascade'` — meaning when a post is deleted, all its comments are automatically removed by the database. The Drizzle `relations` declarations tell the query builder how tables connect: `many(commentsTable)` on the post side and `one(postsTable)` on the comment side with explicit field-to-reference mapping. The relational query API (`db.query.postsTable.findFirst({ with: { comments: true } })`) performs the JOIN automatically and returns a nested, fully-typed result — `post.comments` is typed as `Comment[]`. The listing page demonstrates a common pattern: loading related data and computing aggregates (comment count). The detail page uses a dynamic `[slug]` route parameter, and the comment form action looks up the post by slug to get its ID before inserting. The `error(404, ...)` call returns a proper 404 page when the post does not exist.
</details>
