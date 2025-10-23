import {
  createDirectConversationWithMessage,
  createNotification,
  getOfflineNotifications,
} from '@/services/socket.service';
import { SocketDataType } from '../config/socket.config';
import { Server, Socket } from 'socket.io';
import {
  DirectMessageNotification,
  SendMessagePayload,
} from '@/types/messaging';
import { AuthenticatedUser } from '@/types/users';
import { Message, NotiType } from '@prisma/client';
import { io } from '..';
import { CreateNotificationProp } from '@/services/messaging.service';

export function computeDirectKey(userA: string, userB: string) {
  const sorted = [userA, userB].sort();
  return `direct:${sorted[0]}:${sorted[1]}`;
}

export const handleOnConnection = (
  socket: Socket,
  io: Server,
  user: AuthenticatedUser,
  userSockets: SocketDataType,
) => {
  const userSocketSet = userSockets.get(user.userId) || new Set<string>();
  userSocketSet.add(socket.id); // Add new socket ID to the set [unique IDs]
  userSockets.set(user.userId, userSocketSet);

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

export const notifyMessageReceiveController = async ({
  message,
  receiverId,
  userSockets,
  senderName,
  callback,
}: NotifyMessageReceiveProps) => {
  try {
    const { conversationId: convId, senderId } = message;
    const receiverSockets = userSockets.get(receiverId);

    if (receiverSockets && receiverSockets.size > 0) {
      // Receiver is online: ensure each socket joins the conversation (server-driven)
      for (const sid of receiverSockets) {
        io.to(sid).socketsJoin(convId); // join the receiver's socket to the conversation room
      }
    } else {
      // Receiver offline: persist a notification for later
      const data: CreateNotificationProp = {
        receiverId,
        type: 'New_Message' as NotiType,
        payload: {
          conversationId: convId,
          messageId: message.id,
          snippet: message.body.slice(0, 200),
          senderName,
        },
      };

      await createNotification(data);
    }

    const directMessageNotiPayload: DirectMessageNotification = {
      type: 'New_Message',
      conversationId: convId,
      message: {
        id: message.id,
        senderId: message.senderId,
        body: message.body.slice(0, 200),
        createdAt: message.createdAt,
      },
    };

    // Send a notification event to receiver's personal room
    io.to(`${receiverId}`).emit('notification', directMessageNotiPayload);

    callback({ ok: true, messageId: message.id, conversationId: convId });
  } catch (err: any) {
    console.error('notifyMessageReceiver error:', err);
    callback({ ok: false, error: err.message ?? 'server error' });
  }
};

export const dispatchNotifications = async (socket: Socket) => {
  try {
    const pendingNotis = await getOfflineNotifications(socket.data.user.userId);

    console.log("Get notifications: ", pendingNotis);

    socket.emit('notification:dispatch', { notis: pendingNotis });

    return pendingNotis;
  } catch (err: any) {
    console.error('dispatchNotifications error:', err);
    return [];
  }
};
