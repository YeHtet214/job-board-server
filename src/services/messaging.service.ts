import prisma from "../prisma/client.js";

export function computeDirectKey(userA: string, userB: string) {
  const sorted = [userA, userB].sort();
  return `direct:${sorted[0]}:${sorted[1]}`
}

export async function getOrCreateDirectConversation(userA: string, userB: string) {
  const directKey = computeDirectKey(userA, userB);

  const existing = await prisma.conversation.findUnique({
    where: { directKey },
    include: { participants: true }
  });
  if (existing) return existing;

  return await prisma.$transaction(async (tx) => {
    const recheck = await tx.conversation.findUnique({ where: { directKey } });
    if (recheck) return recheck;

    const conv = await tx.conversation.create({
      data: {
        isDirect: true,
        directKey,
        participants: {
          create: [
            { user: { connect: { id: userA } } },
            { user: { connect: { id: userB } } },
          ],
        },
      },
      include: { participants: true },
    });

    return conv;
  });
}

export async function createMessage(conversationId: string, senderId: string, body: string, meta?: any ) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      body,
      meta
    },
  });

  return message;
}

export async function listUserConversations(userId: string, limit = 50) {
  return await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      participants: { include: { user: true } },
      messages: { take: 1, orderBy: { createdAt: 'desc' }, include: { sender: true } }
    },
    take: limit
  })
}

export async function fetchMessages(conversationId: string, before?: Date, limit = 30) {
  const where: any = { conversationId };
  if (before) where.createdAt = { lt: before };
  const msgs = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return msgs.reverse(); // chronological order
}

export async function markConversationRead(conversationId: string, userId: string) {
  return prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}

export async function createNotification(userId: string, type: string, payload: any) {
  return prisma.notification.create({
    data: { userId, type, payload },
  });
}

export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}