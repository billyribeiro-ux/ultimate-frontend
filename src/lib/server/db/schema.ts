import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

// ─── Notes ───────────────────────────────────────────────────────────────────
export const notes = sqliteTable('notes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	content: text('content').notNull().default(''),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

// ─── Tags ────────────────────────────────────────────────────────────────────
export const tags = sqliteTable('tags', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique()
});

// ─── Junction: notes_tags (many-to-many) ─────────────────────────────────────
export const notesTags = sqliteTable('notes_tags', {
	noteId: integer('note_id')
		.notNull()
		.references(() => notes.id),
	tagId: integer('tag_id')
		.notNull()
		.references(() => tags.id)
});

// ─── Relations ───────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
	notes: many(notes)
}));

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
