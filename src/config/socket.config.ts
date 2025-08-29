import express from 'express';
import { FRONTEND_URL } from './env.config.js';
import { Server } from "socket.io";
import { createServer } from "http";
import { verifyToken } from '../middleware/auth.middleware.js';
import { UnauthorizedError } from '../middleware/errorHandler.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer);

// Authentication middleware for Socket.io
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    throw new UnauthorizedError("Invalid authentication token");
  }
  
  try {
    // Verify token (implement your JWT logic here)
    const user = await verifyToken(token);
    socket.data.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.data.user);

  // Join user to their own room for private messages
  socket.join(`user_${socket.data.user.id}`);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// export { io, httpServer };