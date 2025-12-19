import {
  createDirectConversationWithMessage,
  createNotification,
  CreateOfflineNotificationProp,
  getOfflineNotifications,
  updateNotificationStatus,
} from '../services/socket.service';
import { SocketDataType } from '../config/socket.config';
import { Server, Socket } from 'socket.io';
import {
  DirectMessageNotification,
  NotiStatusUpdate,
  RealTimeNoti,
  SendMessagePayload,
} from '../types/messaging';
import { AuthenticatedUser } from '../types/users';
import { Message, Notification, NotiStatus, NotiType } from '@prisma/client';
import { io } from '..';

export function computeDirectKey(userA: string, userB: string) {
  const sorted = [userA, userB].sort();
  return `direct:${sorted[0]}:${sorted[1]}`;
}

export const handleOnConnection = (
  socket: Socket,
  io: Server,
  user: AuthenticatedUser,
  userSockets: SocketDataType,
  socketToUser: Map<string, string>,
) => {
  const userSocketSet = userSockets.get(user.userId) || new Set<string>();
  userSocketSet.add(socket.id); // Add new socket ID to the set [unique IDs]
  userSockets.set(user.userId, userSocketSet);

  // Map socket ID to user ID for proper disconnect handling
  socketToUser.set(socket.id, user.userId);

  io.emit('presence:update', { userId: user.userId, status: 'online' });
  socket.join(user.userId); // Join own room with userId for notifications

  dispatchNotifications(socket);
};

export const handleOnDisconnect = (
  socket: Socket,
  io: Server,
  userSockets: SocketDataType,
  socketToUser: Map<string, string>,
) => {
  const userId = socketToUser.get(socket.id);

  if (userId) {
    const set = userSockets.get(userId);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) {
        userSockets.delete(userId);
        // user fully offline
        io.emit('presence:update', { userId: userId, status: 'offline' });
      } else {
        userSockets.set(userId, set);
      }
    }
  }

  socketToUser.delete(socket.id);
};

interface MessageSendProps {
  socket: Socket;
  io: Server;
  payload: SendMessagePayload;
  user: AuthenticatedUser;
  callback: (res: any) => void;
}

export const messageSendController = async ({
  payload,
  socket,
  io,
  user,
  callback,
}: MessageSendProps): Promise<Message | null> => {
  try {
    console.log('payload: ', payload);
    if (!payload) {
      callback({ ok: false, error: 'Empty message payload' });
      return null;
    }

    const senderId = user.userId;
    const receiverId = payload.receiverId;
    let convId = payload.conversationId;

    // Compute the direct key for 2 participants
    const directKey: string = computeDirectKey(senderId, receiverId);

    console.log("computed direct key", directKey);

    // If conversationId not provided, compute or get/create direct conversation
    const newMessage: Message | null =
      await createDirectConversationWithMessage({
        directKey,
        senderId,
        payload,
      });

    if (!newMessage) {
      callback({
        ok: false,
        error: 'Failed to create direct conversation with message',
      });
      return null;
    }

    convId = newMessage.conversationId;
    // Ensure sender socket is joined to the conversation room
    socket.join(convId);

    // Broadcast new message to the conversation room
    if (newMessage) {
      io.to(convId).emit('chat:new', {
        id: newMessage.id,
        conversationId: convId,
        senderId: newMessage.senderId,
        body: newMessage.body,
        meta: newMessage.meta,
        createdAt: newMessage.createdAt,
      });
    }

    return newMessage;
  } catch (err: any) {
    console.error('chat:send error:', err);
    callback({ ok: false, error: err.message ?? 'server error' });
    return null;
  }
};

interface NotifyMessageReceiveProps {
  message: Message;
  receiverId: string;
  userSockets: SocketDataType;
  senderName: string;
  callback: (res: any) => void;
}

/**
 * Notify a receiver of a new message by sending a notification event to their personal room (online/offline).
 * If the receiver is online, ensure each of their sockets joins the conversation room.
 * If the receiver is offline, persist a notification for later.
 */
export const notifyMessageReceiveController = async ({
  message,
  receiverId,
  userSockets,
  senderName,
  callback,
}: NotifyMessageReceiveProps) => {
  try {
    const { conversationId: convId } = message;
    const receiverSockets = userSockets.get(receiverId);
    const realTimeNoti: RealTimeNoti = {
      type: 'Realtime_Message' as NotiType,
      senderName,
      snippet: message.body.slice(0, 100),
      createdAt: message.createdAt,
    };

    if (receiverSockets && receiverSockets.size > 0) {
      // Receiver is online: ensure each socket joins the conversation (server-driven)
      for (const sid of receiverSockets) {
        io.to(sid).socketsJoin(convId); // join the receiver's socket to the conversation room
      }
    } else {
      // Receiver offline: persist a notification for later
      const data: CreateOfflineNotificationProp = {
        receiverId,
        type: 'New_Message' as NotiType,
        payload: {
          conversationId: convId,
          snippet: message.body.slice(0, 100),
          senderName,
        },
      };

      await createNotification(data);
    }

    // Send a notification event to receiver's personal room
    io.to(`${receiverId}`).emit('notification', realTimeNoti);

    callback({ ok: true, messageId: message.id, conversationId: convId });
  } catch (err: any) {
    console.error('notifyMessageReceiver error:', err);
    callback({ ok: false, error: err.message ?? 'server error' });
  }
};

export const dispatchNotifications = async (socket: Socket) => {
  try {
    const unreadNotis = await getOfflineNotifications(socket.data.user.userId);

    console.log('Get notifications: ', unreadNotis);

    socket.emit('notification:dispatch', unreadNotis);

    return unreadNotis;
  } catch (err: any) {
    console.error('dispatchNotifications error:', err);
    return [];
  }
};

export const handleNotiStatusUpdate = async (notis: NotiStatusUpdate) => {
  try {
    return await updateNotificationStatus(notis);

  } catch (err) {
    console.log("NotiStatus Update error: ", err)
  }
}
