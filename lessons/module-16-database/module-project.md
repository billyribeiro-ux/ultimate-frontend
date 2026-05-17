# Module 16 — Project: Full-Stack Notes App

## Overview

Replace the in-memory store from Module 10 with a real SQLite database powered by Drizzle ORM. The student builds a multi-user notes application with tags (many-to-many), full CRUD via form actions and remote functions, database migrations, and typed end-to-end data flow.

## Requirements

### Schema

- **users** — `id` (PK, autoincrement), `name` (text), `email` (text, unique), `createdAt` (text, ISO timestamp)
- **notes** — `id` (PK, autoincrement), `title` (text), `content` (text), `userId` (FK → users), `createdAt` (text), `updatedAt` (text)
- **tags** — `id` (PK, autoincrement), `name` (text, unique)
- **notes_tags** — `noteId` (FK → notes), `tagId` (FK → tags), composite PK

### Features

1. **List notes** — Load all notes for the current user via `+page.server.ts` load function, displaying title, preview of content, tags, and timestamp.
2. **Create note** — Form action with title + content + tag selection. Validates that title is non-empty. Inserts into `notes` and `notes_tags` within a transaction.
3. **Edit note** — Pre-fills form with existing data. Updates `notes` row and syncs `notes_tags` junction table. Sets `updatedAt`.
4. **Delete note** — Form action that removes the note and its junction rows in a transaction.
5. **Tag management** — Create new tags inline. Filter notes by tag using query parameters.
6. **Remote functions** — Expose the same CRUD as remote functions (`command` type) for client-side progressive enhancement.

### Technical constraints

- TypeScript strict — zero `any`, all database return types inferred from schema
- PE7 CSS — OKLCH tokens, mobile-first, 44px touch targets, scoped styles
- Progressive enhancement — works without JavaScript via form actions
- Transactions — all multi-table writes wrapped in `db.transaction()`
- Server-only imports — all database code under `$lib/server/`

### File structure

```
src/
├── lib/server/db/
│   ├── index.ts          — drizzle instance + CREATE TABLE IF NOT EXISTS
│   └── schema.ts         — table + relation definitions
├── routes/modules/16-database/
│   ├── +page.svelte      — module index
│   ├── 01-what-is-database/+page.svelte
│   ├── 02-installing-drizzle/+page.svelte
│   ├── 03-schema-definition/+page.svelte
│   ├── 04-migrations/+page.svelte
│   ├── 05-crud/+page.svelte
│   ├── 06-relations-joins/+page.svelte
│   ├── 07-load-functions/
│   │   ├── +page.server.ts
│   │   └── +page.svelte
│   └── 08-actions-remote/
│       ├── +page.server.ts
│       └── +page.svelte
drizzle.config.ts         — drizzle-kit configuration
```

### Stretch goals

- Add full-text search on note content using SQLite FTS5
- Implement optimistic UI updates with `$state` when using remote functions
- Add pagination with cursor-based approach (keyset pagination)
- Deploy to production with Turso/LibSQL adapter swap
