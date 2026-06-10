import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = process.env.DATA_DIR || (fs.existsSync('/app/data') ? '/app/data' : path.resolve(__dirname, '..'));
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_file_id TEXT,
    file_unique_id TEXT,
    file_name TEXT,
    title TEXT,
    artist TEXT,
    type TEXT CHECK(type IN ('audio', 'video', 'document', 'image')) NOT NULL,
    mime_type TEXT,
    size INTEGER,
    duration INTEGER,
    thumbnail TEXT,
    telegram_message_id INTEGER,
    category TEXT,
    chat_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS playlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    media_id INTEGER NOT NULL,
    position INTEGER DEFAULT 0,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
  CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at);
`);

// Migration: add chat_id if missing (from older versions)
try {
  db.exec(`ALTER TABLE media ADD COLUMN chat_id TEXT;`);
} catch (e) {
  // Column likely already exists
}

export default db;
