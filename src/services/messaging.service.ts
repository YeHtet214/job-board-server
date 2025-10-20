import { Message, NotiType } from '@prisma/client';
import prisma from '../lib/prismaClient';
import { Conversation, CreateMessagePayload } from '../types/messaging';

// Real Time Socket use function - handler on user send message

export async function createMessage(payload: CreateMessagePayload): Promise<Message> {
  return await prisma.message.create({
    data: {
      conversationId: payload.conversationId,
      senderId: payload.senderId,
      body: payload.body,
      meta: payload.meta
    },
  });
}

export async function listUserConversations(
  userId: string,
  limit = 50,
): Promise<Conversation[]> {
  
  return await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              profile: {
                select: { profileImageURL: true },
              },
              companies: {
                select: { logo: true },
              }
            },
          },
        },
      },
      messages: {
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { sender: true },
      },
    },
    take: limit,
  });
}

export async function fetchConversationById(id: string) {
  return await prisma.conversation.findUnique({
    where: { id },
  });
}

export async function fetchMessagesByConversationId(
  conversationId: string,
  before?: Date,
  limit = 30,
): Promise<Message[]> {
  const where: any = { conversationId };
  if (before) where.createdAt = { lt: before };
  const msgs = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return msgs.reverse(); // chronological order
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
) {
  return prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}

export async function createNotification(
  userId: string,
  type: NotiType,
  payload: any,
) {
  return prisma.notification.create({
    data: { userId, type, payload },
  });
}

export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}
