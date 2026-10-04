import {
  clearAllData,
  deleteRoom as deleteSQLiteRoom,
  getAllRooms,
  saveRoom as saveSQLiteRoom,
  SQLiteRoom,
} from '@/db/database';

export type JoinedRoom = SQLiteRoom;

export async function getJoinedRooms(): Promise<JoinedRoom[]> {
  try {
    return await getAllRooms();
  } catch (error) {
    console.error('Failed to load joined rooms from SQLite:', error);
    return [];
  }
}

export async function saveJoinedRoom(input: {
  url: string;
  room: string;
  username: string;
}): Promise<JoinedRoom[]> {
  try {
    return await saveSQLiteRoom(input.url, input.room, input.username);
  } catch (error) {
    console.error('Failed to save joined room to SQLite:', error);
    return [];
  }
}

export async function removeJoinedRoom(id: string): Promise<JoinedRoom[]> {
  try {
    return await deleteSQLiteRoom(id);
  } catch (error) {
    console.error('Failed to remove joined room from SQLite:', error);
    return [];
  }
}

export async function clearJoinedRooms(): Promise<void> {
  try {
    await clearAllData();
  } catch (error) {
    console.error('Failed to clear SQLite room data:', error);
  }
}
