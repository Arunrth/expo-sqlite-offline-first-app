import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { ChatRoom } from '@/components/chat/chat-room';
import { JoinChatForm } from '@/components/chat/join-chat-form';
import { ThemedView } from '@/components/themed-view';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { saveJoinedRoom } from '@/utils/room-storage';

export default function ChatScreen() {
  const params = useLocalSearchParams<{ url?: string; room?: string; username?: string }>();
  const { status, messages, join, send, leave } = useChatSocket();
  const [room, setRoom] = useState<string | null>(null);

  const handleJoin = (url: string, roomName: string, username: string) => {
    join(url, roomName, username);
    setRoom(roomName);
    saveJoinedRoom({ url, room: roomName, username });
  };

  useEffect(() => {
    if (params.url && params.room && params.username && !room) {
      handleJoin(params.url, params.room, params.username);
    }
  }, [params.url, params.room, params.username]);

  const handleLeave = () => {
    leave();
    setRoom(null);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {room ? (
        <ChatRoom room={room} status={status} messages={messages} onSend={send} onLeave={handleLeave} />
      ) : (
        <JoinChatForm onJoin={handleJoin} />
      )}
    </ThemedView>
  );
}
