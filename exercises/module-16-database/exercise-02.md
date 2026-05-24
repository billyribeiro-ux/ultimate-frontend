---
module: 16
exercise: 2
title: Insert and Select
difficulty: intermediate
estimated_time: 20
skills_tested:
  - insert operations with Drizzle
  - select queries with filters
  - type-safe query results
  - server load integration
  - form action for data creation
---

# Exercise 16.2 — Insert and Select

## Brief

Build a page that displays a list of blog posts from the database and provides a form to create new posts. Use Drizzle ORM's type-safe insert and select operations inside SvelteKit server load functions and form actions. This exercise connects the schema you defined in Exercise 16.1 to real CRUD operations.

## Requirements

1. Create `src/routes/exercises/16-database/02/+page.server.ts` with a `load` function and a `create` action
2. The load function must select all posts ordered by `createdAt` descending
3. The form action must validate input, insert a new post, and return the created post
4. Create `src/routes/exercises/16-database/02/+page.svelte` with a post list and creation form
5. Display each post's title, slug, published status, and creation date
6. The creation form must have fields for title, content, and slug
7. Auto-generate the slug from the title (lowercase, hyphenated) with a manual override option
8. Show validation errors inline on the form
9. After successful creation, the new post must appear at the top of the list (use `invalidateAll` or rely on SvelteKit's default re-loading)
10. Style with PE7 tokens — use a card layout for posts

## Constraints

- All database operations must use Drizzle's query builder (no raw SQL)
- TypeScript strict mode — query results must be fully typed
- The insert must use the `NewPost` type from the schema
- Handle duplicate slug errors gracefully

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Use `db.select().from(postsTable).orderBy(desc(postsTable.createdAt))` for the select query. For insert, use `db.insert(postsTable).values(newPost).returning()` to get the inserted row back. The `.returning()` method gives you the full row including generated defaults.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

In the form action, extract form data, validate it with `validateNewPost`, then try the insert inside a try/catch. Unique constraint violations (duplicate slug) throw an error — catch it and return `fail(400, { error: 'Slug already exists' })`. Auto-generate the slug: `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// +page.server.ts
import { db } from '$lib/server/db';
import { postsTable } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load = async () => {
  const posts = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt));
  return { posts };
};
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/16-database/02/+page.server.ts`**

```typescript
import { fail } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { postsTable, validateNewPost } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const posts = await db
    .select()
    .from(postsTable)
    .orderBy(desc(postsTable.createdAt));

  return { posts };
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title')?.toString().trim() ?? '';
    const content = formData.get('content')?.toString().trim() ?? '';
    const slugInput = formData.get('slug')?.toString().trim() ?? '';
    const slug = slugInput || slugify(title);

    const result = validateNewPost({ title, content, slug });

    if (!result.valid) {
      return fail(400, {
        errors: result.errors,
        values: { title, content, slug }
      });
    }

    try {
      const [created] = await db
        .insert(postsTable)
        .values(result.data)
        .returning();

      return { success: true, post: created };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      if (message.includes('unique') || message.includes('duplicate')) {
        return fail(400, {
          errors: ['A post with this slug already exists. Choose a different slug.'],
          values: { title, content, slug }
        });
      }

      return fail(500, {
        errors: [`Database error: ${message}`],
        values: { title, content, slug }
      });
    }
  }
};
```

**`src/routes/exercises/16-database/02/+page.svelte`**

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  interface Post {
    id: string;
    title: string;
    content: string;
    slug: string;
    published: boolean;
    createdAt: Date;
  }

  interface Props {
    data: { posts: Post[] };
    form: {
      errors?: string[];
      values?: { title: string; content: string; slug: string };
      success?: boolean;
    } | null;
  }

  let { data, form }: Props = $props();

  let titleInput = $state(form?.values?.title ?? '');
  const autoSlug: string = $derived(
    titleInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  );
</script>

<main class="page">
  <h1>Blog Posts</h1>

  <section class="create-section">
    <h2>Create New Post</h2>

    {#if form?.success}
      <p class="success-msg">Post created successfully!</p>
    {/if}

    {#if form?.errors}
      <div class="error-box">
        {#each form.errors as error}
          <p>{error}</p>
        {/each}
      </div>
    {/if}

    <form method="POST" action="?/create" use:enhance>
      <div class="field">
        <label for="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          bind:value={titleInput}
        />
      </div>

      <div class="field">
        <label for="slug">Slug</label>
        <input
          id="slug"
          name="slug"
          type="text"
          placeholder={autoSlug}
          value={form?.values?.slug ?? ''}
        />
        <span class="hint">Leave empty to auto-generate from title</span>
      </div>

      <div class="field">
        <label for="content">Content</label>
        <textarea id="content" name="content" rows={4} required>{form?.values?.content ?? ''}</textarea>
      </div>

      <button type="submit" class="btn">Create Post</button>
    </form>
  </section>

  <section class="posts-section">
    <h2>All Posts ({data.posts.length})</h2>

    {#if data.posts.length === 0}
      <p class="empty">No posts yet. Create one above.</p>
    {:else}
      <div class="post-grid">
        {#each data.posts as post (post.id)}
          <article class="post-card">
            <div class="post-header">
              <h3>{post.title}</h3>
              <span class="status" class:published={post.published}>
                {post.published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p class="post-slug">/{post.slug}</p>
            <p class="post-excerpt">{post.content.slice(0, 120)}...</p>
            <time class="post-date">{new Date(post.createdAt).toLocaleDateString()}</time>
          </article>
        {/each}
      </div>
    {/if}
  </section>
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

  h2 {
    font-size: var(--text-lg);
    margin-block-end: var(--space-md);
  }

  .create-section {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin-block-end: var(--space-2xl);
  }

  .success-msg {
    font-size: var(--text-sm);
    color: var(--color-success);
    font-weight: 600;
    margin-block-end: var(--space-md);
  }

  .error-box {
    background: var(--color-surface);
    border: 1px solid var(--color-error);
    border-radius: var(--radius-md);
    padding: var(--space-sm);
    margin-block-end: var(--space-md);
  }

  .error-box p {
    font-size: var(--text-sm);
    color: var(--color-error);
  }

  form {
    display: grid;
    gap: var(--space-md);
  }

  .field {
    display: grid;
    gap: var(--space-xs);
  }

  label {
    font-size: var(--text-sm);
    font-weight: 600;
  }

  input, textarea {
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: inherit;
  }

  input:focus, textarea:focus {
    outline: 2px solid var(--color-brand);
    outline-offset: 1px;
  }

  .hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
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

  .posts-section h2 {
    border-block-end: 2px solid var(--color-brand);
    padding-block-end: var(--space-xs);
  }

  .empty {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: var(--space-xl);
    text-align: center;
  }

  .post-grid {
    display: grid;
    gap: var(--space-md);
    margin-block-start: var(--space-md);
  }

  .post-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
  }

  .post-header h3 {
    font-size: var(--text-base);
  }

  .status {
    font-size: var(--text-xs);
    padding: 0.1em 0.5em;
    border-radius: var(--radius-full);
    background: var(--color-surface);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
  }

  .status.published {
    background: var(--color-success);
    color: var(--color-surface);
    border-color: transparent;
  }

  .post-slug {
    font-size: var(--text-xs);
    color: var(--color-brand);
    font-family: monospace;
    margin-block: var(--space-xs);
  }

  .post-excerpt {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-sm);
  }

  .post-date {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }
</style>
```

### Explanation

This exercise connects the schema to real CRUD operations. The `db.select().from(postsTable)` query returns fully typed `Post[]` — no manual type casting needed because Drizzle infers the return type from the schema. The `.orderBy(desc(postsTable.createdAt))` call ensures newest posts appear first. The insert operation uses `.values(result.data).returning()` — the `.returning()` call is PostgreSQL-specific and gives you the complete inserted row including database-generated values like `id` and `createdAt`. The try/catch around the insert handles unique constraint violations gracefully — when a duplicate slug is submitted, PostgreSQL throws an error that includes "unique" or "duplicate" in the message. The `slugify` function auto-generates URL-friendly slugs from titles, and the form allows manual override. SvelteKit's default `use:enhance` behavior automatically re-runs the load function after a successful action, so the new post appears in the list without manual invalidation. The `$derived` rune on `autoSlug` updates the placeholder in real-time as the user types the title.
</details>
