import AsyncStorage from '@react-native-async-storage/async-storage';

export type JoinedRoom = {
  id: string;
  url: string;
  room: string;
  username: string;
  lastJoinedAt: number;
};

const ROOMS_KEY = '@socket_app_joined_rooms';

export async function getJoinedRooms(): Promise<JoinedRoom[]> {
  try {
    const raw = await AsyncStorage.getItem(ROOMS_KEY);
    if (!raw) return [];
    const rooms: JoinedRoom[] = JSON.parse(raw);
    return rooms.sort((a, b) => b.lastJoinedAt - a.lastJoinedAt);
  } catch (error) {
    console.error('Failed to load joined rooms:', error);
    return [];
  }
}

export async function saveJoinedRoom(input: {
  url: string;
  room: string;
  username: string;
}): Promise<JoinedRoom[]> {
  try {
    const current = await getJoinedRooms();
    const id = `${input.url.trim()}::${input.room.trim()}`;
    
    const existingFiltered = current.filter((r) => r.id !== id);
    const updatedRoom: JoinedRoom = {
      id,
      url: input.url.trim(),
      room: input.room.trim(),
      username: input.username.trim(),
      lastJoinedAt: Date.now(),
    };

    const updatedList = [updatedRoom, ...existingFiltered];
    await AsyncStorage.setItem(ROOMS_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (error) {
    console.error('Failed to save joined room:', error);
    return [];
  }
}

export async function removeJoinedRoom(id: string): Promise<JoinedRoom[]> {
  try {
    const current = await getJoinedRooms();
    const updatedList = current.filter((r) => r.id !== id);
    await AsyncStorage.setItem(ROOMS_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (error) {
    console.error('Failed to remove joined room:', error);
    return [];
  }
}

export async function clearJoinedRooms(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ROOMS_KEY);
  } catch (error) {
    console.error('Failed to clear rooms:', error);
  }
}
