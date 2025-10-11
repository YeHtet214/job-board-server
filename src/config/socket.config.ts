import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { FRONTEND_URL } from './env.config.js';
import { verifyToken } from '../middleware/auth.middleware.js';

import {
  computeDirectKey,
  getOrCreateDirectConversation,
  createMessage,
  listUserConversations,
  createNotification,
  markConversationRead,
} from "../services/messaging.service.js"; // adjust import paths
import prisma from "../lib/prismaClient.js";

type SocketUser = { userId: string; email?: string } | null;

// In-memory presence maps (single instance)
/**
 * userId -> set of socketIds for that user
 */
const userSockets = new Map<string, Set<string>>();

/**
 * socketId -> userId
 */
const socketToUser = new Map<string, string>();

export function initSocketServer(httpServer: HTTPServer) {
  const io = new IOServer(httpServer, {
    cors: {
      origin: [FRONTEND_URL || "http://localhost:5173"],
      credentials: true,
    },
    // transports: ['websocket', 'polling'], // optionally configure
  });

  // --- Optional: Redis adapter for multi-instance scaling ---
  // import { createAdapter } from '@socket.io/redis-adapter'
  // const pubClient = createClient({ url: process.env.REDIS_URL }); await pubClient.connect();
  // const subClient = pubClient.duplicate(); await subClient.connect();
  // io.adapter(createAdapter(pubClient, subClient));

  // Handshake/auth middleware: optional auth (guests allowed)
  io.use(async (socket, next) => {
    try {
      const token = (socket.handshake.auth as any)?.token.split(' ')[1] as string | undefined;

      console.log("Token is ", token);

      if (!token) {
        // No token -> allow as guest
        (socket.data as any).user = null;
        return next();
      }
      const user = await verifyToken(token); // should throw if invalid
      (socket.data as any).user = user as SocketUser;
      return next();
    } catch (err: any) {
      // invalid token -> reject connection
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const user = (socket.data as any).user as SocketUser;
    console.log("socket connected:", socket.id, "user:", user?.userId ?? "guest");

    // console.log("User Sockets: ", userSockets)
    // console.log("SocketToUser: ", socketToUser);

    // Don't clear the maps - this breaks presence tracking for multiple connections

    // Track presence
    if (user) {
      const set = userSockets.get(user.userId) ?? new Set<string>();
      set.add(socket.id);
      userSockets.set(user.userId, set);
      socketToUser.set(socket.id, user.userId);

      // join personal notification room
      socket.join(`user:${user.userId}`);

      // Optionally auto-join recent conversations (be careful if user has thousands)
      try {
        const convs = await listUserConversations(user.userId, 10);
        for (const c of convs) {
          socket.join(c.id);
        }
      } catch (err) {
        console.error("auto-join convs failed:", err);
      }

      // Notify presence to others (optional)
      io.emit("presence:update", { userId: user.userId, status: "online" });
    }

    // --- Secure join handler: validate membership before letting a socket join a conversation ---
    socket.on("join", async (roomId: string, ack?: (res: any) => void) => {
      try {
        // find conversation
        const conv = await prisma.conversation.findUnique({
          where: { id: roomId },
          include: { participants: true },
        });

        if (!conv) {
          ack?.({ ok: false, error: "Conversation not found" });
          return;
        }

        // if direct (private) conversation, require the socket's user to be a participant
        if (conv.isDirect) {
          if (!user) {
            ack?.({ ok: false, error: "Not authenticated" });
            return;
          }
          const isParticipant = conv.participants.some((p) => p.userId === user.userId);
          if (!isParticipant) {
            ack?.({ ok: false, error: "Not a participant" });
            return;
          }
        }

        socket.join(roomId);
        ack?.({ ok: true });
      } catch (err: any) {
        console.error("join error:", err);
        ack?.({ ok: false, error: err.message });
      }
    });

    // --- Send message flow ---
    // payload: { senderId, receiverId, text, meta? } OR { conversationId, text, meta? }
    socket.on("chat:send", async (payload: any, ack?: (res: any) => void) => {
      try {
        console.log('payload: ', payload)
        if (!payload) {
          return ack?.({ ok: false, error: "Empty payload" });
        }

        const senderId = user!.userId as string;
        let convId = payload.conversationId as string | undefined;

        // If conversationId not provided, compute or get/create direct conversation
        if (!convId) {
          const receiverId = payload.receiverId as string;
          if (!receiverId) return ack?.({ ok: false, error: "Missing receiverId" });

          const conv = await getOrCreateDirectConversation(senderId, receiverId);
          if (!conv) return;
          convId = conv.id;
        } else {
          // Optional: ensure conversation exists and sender is a participant
          const conv = await prisma.conversation.findUnique({
            where: { id: convId },
            include: { participants: true },
          });
          if (!conv) return ack?.({ ok: false, error: "Conversation not found" });
          const isParticipant = conv.participants.some((p) => p.userId === senderId);
          if (!isParticipant) return ack?.({ ok: false, error: "Sender is not a participant of the conversation" });
        }

        // Persist message
        const message = await createMessage(convId, senderId, payload.text, payload.meta ?? null);

        // Ensure sender socket is joined to the conversation room
        socket.join(convId);

        // Broadcast new message to the conversation room
        io.to(convId).emit("chat:new", {
          id: message.id,
          conversationId: convId,
          senderId: message.senderId,
          body: message.body,
          meta: message.meta,
          createdAt: message.createdAt,
        });

        // Determine the receiver(s) to notify (for direct chat there will be one other participant)
        // Find participants excluding sender
        const participants = await prisma.conversationParticipant.findMany({
          where: { conversationId: convId, NOT: { userId: senderId } },
          select: { userId: true },
        });

        for (const p of participants) {
          const receiverId = p.userId;
          const sockets = userSockets.get(receiverId);
          if (sockets && sockets.size > 0) {
            // Receiver is online: ensure each socket joins the conversation (server-driven)
            for (const sid of sockets) {
              // join the socket to the conversation room (idempotent)
              io.to(sid).socketsJoin(convId);
            }

            // Send a notification event to receiver's personal room
            io.to(`user:${receiverId}`).emit("notification", {
              type: "new_message",
              conversationId: convId,
              message: {
                id: message.id,
                senderId: message.senderId,
                body: message.body.slice(0, 200),
                createdAt: message.createdAt,
              },
            });

            // Optionally mark deliveredAt for this message (not implemented here)
          } else {
            // Receiver offline: persist a notification for later
            await createNotification(receiverId, "new_message", {
              conversationId: convId,
              messageId: message.id,
              snippet: message.body.slice(0, 200),
              senderId,
            });
          }
        }

        ack?.({ ok: true, messageId: message.id, conversationId: convId });
      } catch (err: any) {
        console.error("chat:send error:", err);
        ack?.({ ok: false, error: err.message ?? "server error" });
      }
    });

    // --- Mark conversation read (update lastReadAt) ---
    // payload: { conversationId }
    socket.on("chat:markRead", async (payload: any, ack?: (res: any) => void) => {
      try {
        if (!user) return ack?.({ ok: false, error: "Auth required" });
        if (!payload?.conversationId) return ack?.({ ok: false, error: "Missing conversationId" });

        await markConversationRead(payload.conversationId, user.userId);
        // notify room participants about read receipt
        io.to(payload.conversationId).emit("chat:read", { conversationId: payload.conversationId, userId: user.userId });
        ack?.({ ok: true });
      } catch (err: any) {
        console.error("chat:markRead error:", err);
        ack?.({ ok: false, error: err.message });
      }
    });

    // --- Typing indicators (volatile) ---
    socket.on("typing:start", (payload: any) => {
      if (!payload?.conversationId) return;
      socket.to(payload.conversationId).volatile.emit("typing", { conversationId: payload.conversationId, from: user?.userId });
    });
    socket.on("typing:stop", (payload: any) => {
      if (!payload?.conversationId) return;
      socket.to(payload.conversationId).volatile.emit("typing:stop", { conversationId: payload.conversationId, from: user?.userId });
    });

    // --- Disconnect cleanup ---
    socket.on("disconnect", (reason) => {
      const uid = socketToUser.get(socket.id);
      if (uid) {
        const set = userSockets.get(uid);

        console.log("userSockets size before delete: ", userSockets.size)
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) {
            userSockets.delete(uid);
            // user fully offline
            io.emit("presence:update", { userId: uid, status: "offline" });
          } else {
            userSockets.set(uid, set);
          }
        }
        socketToUser.delete(socket.id);
      }
      console.log("socket disconnected:", socket.id, "reason:", reason);
    });
  });

  return io;
}


