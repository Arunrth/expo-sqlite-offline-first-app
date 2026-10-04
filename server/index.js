const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;

// room name -> set of joined sockets
const rooms = new Map();

function send(socket, payload) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function broadcast(room, payload, exclude) {
  for (const member of rooms.get(room) ?? []) {
    if (member !== exclude) send(member, payload);
  }
}

function removeFromRoom(socket) {
  const { room, username } = socket;
  if (!room || !rooms.has(room)) return;

  rooms.get(room).delete(socket);
  if (rooms.get(room).size === 0) {
    rooms.delete(room);
  } else {
    broadcast(room, { type: 'system', text: `${username} left`, ts: Date.now() });
  }
  socket.room = undefined;
}

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (socket) => {
  socket.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return send(socket, { type: 'system', text: 'Invalid message format', ts: Date.now() });
    }

    if (data.type === 'join') {
      const { room, username } = data;
      if (!room || !username) {
        return send(socket, { type: 'system', text: 'room and username are required', ts: Date.now() });
      }
      if (socket.room) removeFromRoom(socket);

      socket.room = room;
      socket.username = username;
      if (!rooms.has(room)) rooms.set(room, new Set());
      rooms.get(room).add(socket);

      broadcast(room, { type: 'system', text: `${username} joined`, ts: Date.now() }, socket);
      return;
    }

    if (data.type === 'message') {
      if (!socket.room) {
        return send(socket, { type: 'system', text: 'Join a room before sending messages', ts: Date.now() });
      }
      broadcast(socket.room, {
        type: 'message',
        id: crypto.randomUUID(),
        room: socket.room,
        username: socket.username,
        text: data.text,
        ts: Date.now(),
      });
      return;
    }

    if (data.type === 'leave') {
      removeFromRoom(socket);
    }
  });

  socket.on('close', () => removeFromRoom(socket));
});

console.log(`WebSocket chat server listening on ws://localhost:${PORT}`);
