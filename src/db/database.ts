import * as SQLite from 'expo-sqlite';

import type { ChatMessage } from '@/types/chat';

export type SQLiteRoom = {
  id: string;
  url: string;
  room: string;
  username: string;
  lastJoinedAt: number;
};

const DB_NAME = 'socket_chat.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
  }
  return dbInstance;
}

export async function initDatabase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = getDatabase();
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        room TEXT NOT NULL,
        username TEXT NOT NULL,
        last_joined_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        room TEXT NOT NULL,
        username TEXT,
        text TEXT NOT NULL,
        ts INTEGER NOT NULL,
        system INTEGER NOT NULL,
        mine INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_messages_room ON messages (room_id, ts DESC);
    `);
  })();

  return initPromise;
}

export async function saveRoom(url: string, room: string, username: string): Promise<SQLiteRoom[]> {
  await initDatabase();
  const db = getDatabase();
  const id = `${url.trim()}::${room.trim()}`;
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO rooms (id, url, room, username, last_joined_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       username = excluded.username,
       last_joined_at = excluded.last_joined_at;`,
    [id, url.trim(), room.trim(), username.trim(), now]
  );

  return getAllRooms();
}

export async function getAllRooms(): Promise<SQLiteRoom[]> {
  await initDatabase();
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    url: string;
    room: string;
    username: string;
    last_joined_at: number;
  }>('SELECT id, url, room, username, last_joined_at FROM rooms ORDER BY last_joined_at DESC;');
  
  return rows.map((r) => ({
    id: r.id,
    url: r.url,
    room: r.room,
    username: r.username,
    lastJoinedAt: r.last_joined_at,
  }));
}

export async function deleteRoom(id: string): Promise<SQLiteRoom[]> {
  await initDatabase();
  const db = getDatabase();
  await db.runAsync('DELETE FROM messages WHERE room_id = ?;', [id]);
  await db.runAsync('DELETE FROM rooms WHERE id = ?;', [id]);
  return getAllRooms();
}

export async function clearAllData(): Promise<void> {
  await initDatabase();
  const db = getDatabase();
  await db.runAsync('DELETE FROM messages;');
  await db.runAsync('DELETE FROM rooms;');
}

export async function saveMessage(roomId: string, roomName: string, msg: ChatMessage): Promise<void> {
  await initDatabase();
  const db = getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO messages (id, room_id, room, username, text, ts, system, mine)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      msg.id,
      roomId,
      roomName,
      msg.username ?? null,
      msg.text,
      msg.ts || Date.now(),
      msg.system ? 1 : 0,
      msg.mine ? 1 : 0,
    ]
  );
}

export async function getRoomMessages(roomId: string, limit = 100): Promise<ChatMessage[]> {
  await initDatabase();
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    text: string;
    ts: number;
    system: number;
    mine: number;
    username?: string;
  }>(
    'SELECT id, text, ts, system, mine, username FROM messages WHERE room_id = ? ORDER BY ts DESC LIMIT ?;',
    [roomId, limit]
  );

  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    ts: r.ts,
    system: r.system === 1,
    mine: r.mine === 1,
    username: r.username ?? undefined,
  }));
}
