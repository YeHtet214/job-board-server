import { Server as IOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { FRONTEND_URL } from './env.config.js';
import { verifyToken } from '../middleware/auth.middleware.js';

import {
  createMessage,
  listUserConversations,
  markConversationRead,
} from '../services/messaging.service.js'; // adjust import paths
import prisma from '../lib/prismaClient.js';
import {
  dispatchNotifications,
  handleOnConnection,
  handleOnDisconnect,
  messageSendController,
  notifyMessageReceiveController,
} from '@/controllers/socket.controller.js';
import { SendMessagePayload } from '@/types/messaging.js';
import { Message } from '@prisma/client';
import { AuthenticatedUser } from '@/types/users.js';

export type SocketDataType = Map<string, Set<string>> & {
  user?: AuthenticatedUser | null;
}; // userId -> set of socketIds for that user
export type socketToUserType = Map<string, string>; // socketId -> userId

const userSockets: SocketDataType = new Map();
const socketToUser: socketToUserType = new Map();

export function initSocketServer(httpServer: HTTPServer) {
  const io = new IOServer(httpServer, {
    cors: {
      origin: [FRONTEND_URL || 'http://localhost:5173'],
      credentials: true,
    },
  });

  // Handshake/auth middleware
  io.use(async (socket, next) => {
    try {
      const token = (socket.handshake.auth as any)?.token.split(' ')[1];

      if (!token) {
        // No token -> allow as guest
        (socket.data as any).user = null;
        return next();
      }
      const user = await verifyToken(token); // should throw if invalid
      socket.data.user = user as AuthenticatedUser;
      return next();
    } catch (err: any) {
      // invalid token -> reject connection
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user: AuthenticatedUser = socket.data.user;

    handleOnConnection(socket, io, user, userSockets);

    console.log('User: ', user);

    socket.on('updateNotiStatus', async (notisIds: string[]) => {
      console.log('Noti ids to update', notisIds);
    });

    // --- Send message flow ---
    socket.on(
      'chat:send',
      async (payload: SendMessagePayload, callback: (res: any) => void) => {
        try {
          const message: Message | null = await messageSendController({
            socket,
            io,
            payload,
            user,
            callback,
          });

          if (message) {
            // notify room participants about new message
            await notifyMessageReceiveController({
              message,
              receiverId: payload.receiverId,
              userSockets,
              senderName: user.userName,
              callback,
            });
          }
        } catch (err: any) {
          console.error('chat:send error:', err);
          callback({ ok: false, error: err.message });
        } finally {
          callback({ ok: true });
        }
      },
    );

    // --- Mark conversation read (update lastReadAt) ---
    // payload: { conversationId }
    socket.on(
      'chat:markRead',
      async (payload: any, ack?: (res: any) => void) => {
        try {
          if (!user) return ack?.({ ok: false, error: 'Auth required' });
          if (!payload?.conversationId)
            return ack?.({ ok: false, error: 'Missing conversationId' });

          await markConversationRead(payload.conversationId, user.userId);
          // notify room participants about read receipt
          io.to(payload.conversationId).emit('chat:read', {
            conversationId: payload.conversationId,
            userId: user.userId,
          });
          ack?.({ ok: true });
        } catch (err: any) {
          console.error('chat:markRead error:', err);
          ack?.({ ok: false, error: err.message });
        }
      },
    );

    // --- Typing indicators (volatile) ---
    socket.on('typing:start', (payload: any) => {
      if (!payload?.conversationId) return;
      socket
        .to(payload.conversationId)
        .volatile.emit('typing', {
          conversationId: payload.conversationId,
          from: user?.userId,
        });
    });
    socket.on('typing:stop', (payload: any) => {
      if (!payload?.conversationId) return;
      socket
        .to(payload.conversationId)
        .volatile.emit('typing:stop', {
          conversationId: payload.conversationId,
          from: user?.userId,
        });
    });

    // --- Disconnect cleanup ---
    socket.on('disconnect', (reason) => {
      handleOnDisconnect(socket, io, userSockets, socketToUser);
    });
  });

  return io;
}
