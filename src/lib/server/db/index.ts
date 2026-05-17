import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const DB_PATH = resolve('data/dev.db');

// Ensure the data directory exists
mkdirSync(resolve('data'), { recursive: true });

const sqlite = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
sqlite.pragma('journal_mode = WAL');

// Create tables if they don't exist (dev convenience — production uses migrations)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS notes_tags (
    note_id INTEGER NOT NULL REFERENCES notes(id),
    tag_id INTEGER NOT NULL REFERENCES tags(id),
    PRIMARY KEY (note_id, tag_id)
  );

  -- Seed a default user if none exists
  INSERT OR IGNORE INTO users (id, name, email) VALUES (1, 'Student', 'student@example.com');
`);

export const db = drizzle(sqlite, { schema });
