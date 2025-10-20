import { createDirectConversationWithMessage } from '@/services/socket.service';
import { SocketDataType, SocketUser } from '../config/socket.config';
import { Server, Socket } from 'socket.io';
import { SendMessagePayload } from '@/types/messaging';
import { AuthenticatedUser } from '@/types/users';
import { Message } from '@prisma/client';
import { io } from '..';
import { createNotification } from '@/services/messaging.service';

export function computeDirectKey(userA: string, userB: string) {
  const sorted = [userA, userB].sort();
  return `direct:${sorted[0]}:${sorted[1]}`;
}

export const handleOnConnection = (
  socket: Socket,
  io: Server,
  user: SocketUser,
  userSockets: SocketDataType,
) => {
  const userSocketSet = userSockets.get(user.userId) || new Set<string>();
  userSocketSet.add(socket.id); // Add new socket ID to the set [unique IDs]
  userSockets.set(user.userId, userSocketSet);

  io.emit('presence:update', { userId: user.userId, status: 'online' });
  socket.join(user.userId); // Join own room with userId for notifications
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

// export const handleJoinOwnRoomForNoti = async (
//   socket: Socket,
//   convId: string,
//   user: SocketUser,
//   ack?: any,
// ) => {
//   try {
//     const conv = await fetchConversationById(convId);

//     if (!conv) {
//       ack?.({ ok: false, error: 'Conversation not found' });
//       return;
//     }

//     // if direct (private) conversation, require the socket's user to be a participant
//     if (conv.isDirect) {
//       if (!user) {
//         ack?.({ ok: false, error: 'Not authenticated' });
//         return;
//       }
//       const isParticipant = conv.participants.some(
//         (p) => p.userId === user.userId,
//       );
//       if (!isParticipant) {
//         ack?.({ ok: false, error: 'Not a participant' });
//         return;
//       }
//     }

//     socket.join(roomId);
//     ack?.({ ok: true });
//   } catch (err: any) {
//     console.error('join error:', err);
//     ack?.({ ok: false, error: err.message });
//   }
// };

interface MessageSendProps {
  socket: Socket;
  io: Server;
  payload: SendMessagePayload;
  user: SocketUser;
  callback: (res: any) => void;
}

export const messageSendController = async (
  socket: Socket,
  io: Server,
  payload: SendMessagePayload,
  user: AuthenticatedUser,
  callback: (res: any) => void,
) => {
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
    const newMessage: Message | null = await createDirectConversationWithMessage({
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
  callback: (res: any) => void;
}

export const notifyMessageReceiveController = async ({
  message,
  receiverId,
  userSockets,
  callback,
}: NotifyMessageReceiveProps) => {
  try {
    const { conversationId: convId, senderId } = message;
    const receiverSockets = userSockets.get(receiverId);

    console.log("INside notify chekcing props=> ", "message: ", message,  " receiverId: ", receiverId, ", user sockets ", receiverSockets);

    if (receiverSockets && receiverSockets.size > 0) {
      // Receiver is online: ensure each socket joins the conversation (server-driven)
      for (const sid of receiverSockets) {
        io.to(sid).socketsJoin(convId); // join the receiver's socket to the conversation room
      }
    } else {
      // Receiver offline: persist a notification for later
      await createNotification(receiverId, 'New_Message', {
        conversationId: convId,
        messageId: message.id,
        snippet: message.body.slice(0, 200),
        senderId,
      });
    }

    // Send a notification event to receiver's personal room
    io.to(`${receiverId}`).emit('notification', {
      type: 'new_message',
      conversationId: convId,
      message: {
        id: message.id,
        senderId: message.senderId,
        body: message.body.slice(0, 200),
        createdAt: message.createdAt,
      },
    });

    callback({ ok: true, messageId: message.id, conversationId: convId });
  } catch (err: any) {
    console.error('notifyMessageReceiver error:', err);
    callback({ ok: false, error: err.message ?? 'server error' });
  }
};
