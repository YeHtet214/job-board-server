import prisma from '../lib/prismaClient';
import {
  Conversation,
  CreateMessagePayload,
  SendMessagePayload,
} from '@/types/messaging';
import { Message } from '@prisma/client';
import { createMessage } from './messaging.service';

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
    return await prisma.$transaction(async (tx) => {
      const existingConversation = await tx.conversation.findUnique({
        where: { directKey },
        include: { participants: true },
      });

      // If the conversation already exsists, just create the message and return
      if (existingConversation) {
        return await createMessage({ ...payload, senderId });
      }

      const conv = await tx.conversation.create({
        data: {
          isDirect: true,
          directKey,
          participants: {
            create: [
              { user: { connect: { id: senderId } } },
              { user: { connect: { id: payload.receiverId } } },
            ],
          },
        },
      });

      const message: Message = await tx.message.create({
        data: {
          conversationId: conv.id,
          senderId,
          body: payload.body,
          meta: payload.meta,
        },
      });

      if (!message) {
        return null;
      }

      return message;
    });
  } catch (err: any) {
    console.log(err);
    return null;
  }
}

export const GetPendingNotis = async (userId: string) => {
  return await prisma.notification.findMany({
    where: { userId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });
};
