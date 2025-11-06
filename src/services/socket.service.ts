import prisma from '../lib/prismaClient';
import {
  Conversation,
  CreateMessagePayload,
  SendMessagePayload,
} from '@/types/messaging';
import { Message, Notification, NotiType } from '@prisma/client';
import { createMessage, getOwnerIdByCompanyId } from './messaging.service';
import { get } from 'http';

interface createDirectConversationProps {
  directKey: string;
  senderId: string;
  payload: SendMessagePayload;
}

export async function createDirectConversationWithMessage({
  directKey,
  senderId,
  payload,
}: createDirectConversationProps): Promise<Message | null> {
  try {
    const existingConversation = await prisma.conversation.findUnique({
      where: { directKey },
      include: { participants: true },
    });

    // If the conversation already exsists, just create the message and return
    if (existingConversation) {
      return await createMessage({ ...payload, conversationId: existingConversation.id, senderId });
    }

    let actualReceiverId = payload.receiverId;

    const ownerId = await getOwnerIdByCompanyId(payload.receiverId);

    if (ownerId) {
      actualReceiverId = ownerId;
    }

    return prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: {
          id: {
            in: [senderId, actualReceiverId],
          },
        },
      });

      if (users.length !== 2) {
        console.log("User not exists", users)
        return null;
      }

      const conv = await tx.conversation.create({
        data: {
          isDirect: true,
          directKey,
          participants: {
            create: [{ userId: senderId }, { userId: actualReceiverId }],
          },
          messages: {
            create: {
              senderId,
              body: payload.body,
              meta: payload.meta,
            },
          },
        },
        include: {
          messages: {
            take: 1,
          },
        },
      });

      return conv.messages[0];
    });
  } catch (err: any) {
    console.log(err);
    return null;
  }
}

export interface CreateOfflineNotificationProp {
  receiverId: string;
  type: NotiType;
  payload: {
    conversationId: string;
    snippet: string;
    senderName: string;
  };
}

export async function createNotification({
  receiverId,
  type,
  payload,
}: CreateOfflineNotificationProp): Promise<Notification> {

  const ownerId = await getOwnerIdByCompanyId(receiverId);

  if (ownerId) {
    receiverId = ownerId;
  }

  return await prisma.notification.create({
    data: {
      receiverId: ownerId || receiverId,
      type,
      payload,
    },
  });
}

export const getOfflineNotifications = async (
  receiverId: string,
): Promise<Omit<Notification, 'receiverId'>[]> => {
  return await prisma.notification.findMany({
    where: {
      receiverId,
      status: 'PENDING',
    },
    omit: { receiverId: true },
  });
};
