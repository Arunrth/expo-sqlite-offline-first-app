import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  clearJoinedRooms,
  getJoinedRooms,
  JoinedRoom,
  removeJoinedRoom,
  saveJoinedRoom,
} from '@/utils/room-storage';

export function useJoinedRooms() {
  const [rooms, setRooms] = useState<JoinedRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await getJoinedRooms();
    setRooms(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const addRoom = async (input: { url: string; room: string; username: string }) => {
    const updated = await saveJoinedRoom(input);
    setRooms(updated);
  };

  const deleteRoom = async (id: string) => {
    const updated = await removeJoinedRoom(id);
    setRooms(updated);
  };

  const clearAll = async () => {
    await clearJoinedRooms();
    setRooms([]);
  };

  return { rooms, loading, addRoom, deleteRoom, clearAll, reload };
}
