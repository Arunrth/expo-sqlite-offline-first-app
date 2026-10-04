export type ChatOutgoingMessage =
  | { type: 'join'; room: string; username: string }
  | { type: 'message'; text: string }
  | { type: 'leave' };

export type ChatIncomingMessage =
  | { type: 'system'; text: string; ts: number }
  | { type: 'message'; id: string; room: string; username: string; text: string; ts: number };

export type ChatMessage = {
  id: string;
  text: string;
  ts: number;
  system: boolean;
  mine: boolean;
  username?: string;
};

export type ChatConnectionStatus = 'idle' | 'connecting' | 'connected' | 'closed' | 'error';
