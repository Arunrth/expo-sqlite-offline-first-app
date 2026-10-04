import { useCallback, useRef, useState } from 'react';

import { getRoomMessages, saveMessage } from '@/db/database';
import type { ChatConnectionStatus, ChatIncomingMessage, ChatMessage, ChatOutgoingMessage } from '@/types/chat';

export function useChatSocket() {
  const [status, setStatus] = useState<ChatConnectionStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const usernameRef = useRef<string>('');
  const currentRoomIdRef = useRef<string>('');
  const currentRoomNameRef = useRef<string>('');

  const sendRaw = useCallback((payload: ChatOutgoingMessage) => {
    socketRef.current?.send(JSON.stringify(payload));
  }, []);

  const join = useCallback(
    async (url: string, room: string, username: string) => {
      socketRef.current?.close();
      usernameRef.current = username;
      const roomId = `${url.trim()}::${room.trim()}`;
      currentRoomIdRef.current = roomId;
      currentRoomNameRef.current = room;

      // Load cached offline message history from SQLite first
      try {
        const cached = await getRoomMessages(roomId);
        setMessages(cached);
      } catch (err) {
        console.error('Failed to load SQLite message cache:', err);
        setMessages([]);
      }

      setStatus('connecting');

      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus('connected');
        sendRaw({ type: 'join', room, username });
      };

      socket.onmessage = (event) => {
        const data: ChatIncomingMessage = JSON.parse(event.data);
        const message: ChatMessage =
          data.type === 'system'
            ? { id: `${data.ts}-${Math.random()}`, text: data.text, ts: data.ts, system: true, mine: false }
            : {
                id: data.id,
                text: data.text,
                ts: data.ts,
                system: false,
                mine: data.username === usernameRef.current,
                username: data.username,
              };

        setMessages((prev) => [message, ...prev]);

        // Save to SQLite offline database
        if (currentRoomIdRef.current) {
          saveMessage(currentRoomIdRef.current, currentRoomNameRef.current, message).catch((e) =>
            console.error('Failed to save message to SQLite:', e)
          );
        }
      };

      socket.onerror = () => setStatus('error');
      socket.onclose = () => setStatus('closed');
    },
    [sendRaw],
  );

  const send = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      sendRaw({ type: 'message', text: text.trim() });
    },
    [sendRaw],
  );

  const leave = useCallback(() => {
    sendRaw({ type: 'leave' });
    socketRef.current?.close();
    socketRef.current = null;
    setMessages([]);
    setStatus('idle');
  }, [sendRaw]);

  return { status, messages, join, send, leave };
}