import { useCallback, useRef, useState } from 'react';

import type { ChatConnectionStatus, ChatIncomingMessage, ChatMessage, ChatOutgoingMessage } from '@/types/chat';

export function useChatSocket() {
  const [status, setStatus] = useState<ChatConnectionStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const usernameRef = useRef<string>('');

  const sendRaw = useCallback((payload: ChatOutgoingMessage) => {
    socketRef.current?.send(JSON.stringify(payload));
  }, []);

  const join = useCallback(
    (url: string, room: string, username: string) => {
      socketRef.current?.close();
      usernameRef.current = username;
      setMessages([]);
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