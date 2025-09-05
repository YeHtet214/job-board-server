import express from 'express';
import { FRONTEND_URL } from './env.config.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { verifyToken } from '../middleware/auth.middleware.js';
import { Message, PrivateMessagePayload } from '../types/socket.type.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
  // Heroku-specific configuration
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

// Authentication middleware for Socket.io
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token.split(' ')[1];

  console.log('Socket auth token:', token); // Debugging log

  if (!token) {
    socket.data.user = null; // Allow unauthenticated users
    return next();
  }

  try {
    const user = await verifyToken(token);
    console.log('Socket verified user:', user); // Debugging log
    socket.data.user = user;
    next();
  } catch (error: any) {
    next(error);
  }
});

const getRoomId = (senderId: string, receiverId: string) => {
  const roomId = [senderId, receiverId].sort();
  return `chat:${roomId[0]}:${roomId[1]}`;
}

io.on('connection', (socket) => {
  if (socket.data.user) {
    const userId = socket.data.user.id;
    socket.join(`user:${userId}`); // Join the user's own room to receive notifications and direct messages
    console.log(`user joined it's own room: user:${userId}`);

    socket.on('chat:send-private-message', (payload, ack) => {
      const { senderId, receiverId, message }: PrivateMessagePayload = payload;
      try {
        if (senderId !== userId) {
          throw new Error('Sender ID does not match authenticated user');
        }

        const room = getRoomId(senderId, receiverId);
        socket.join(room); // sender joins the room
        console.log(`user joined room: ${room}`);

        const msg: Message = {
          id: crypto.randomUUID(),
          roomId: room,
          message,
          senderId,
          receiverId,
          createdAt: new Date().toISOString(),
        };
        // Broadcast the message to the room
        io.to(room).emit('chat:new', msg);
        ack?.({ ok: true, id: msg.id });
        console.log(`Message sent to room ${room}:`, msg);
      } catch (error: any) {
          return ack?.({ ok: false, error: error.message });
      }
    })
  } else {
    console.log('An unauthenticated user connected');
    socket.on('chat:send', () => {
      console.log('Unauthenticated user attempted to send a message');
      socket.emit('error', 'You must log in to chat');
    });
    
  }

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

export { app, io, httpServer };
