import prisma from '../lib/prismaClient';
import {
  NotiStatusUpdate,
  SendMessagePayload,
} from '../types/messaging';
import { Message, Notification, NotiStatus, NotiType } from '@prisma/client';
import { createMessage, getOwnerIdByCompanyId } from './messaging.service';

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
      status: {
        in: [NotiStatus.PENDING, NotiStatus.DELIVERED],
      },
    },
    omit: { receiverId: true },
  });
};

export const updateNotificationStatus = async (notis: NotiStatusUpdate) => {
  return await prisma.notification.updateMany({
    where: {
      id: {
        in: notis.ids.map(id => id),
      },
    },
    data: {
      status: {
        set: notis.status,
      },
    },
  });
}

/**
 * Notify employer when a job seeker applies for their job posting
 */
export const notifyEmployerOfApplication = async ({
  applicationId,
  jobId,
  jobTitle,
  applicantId,
  applicantName,
  employerId,
}: {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  employerId: string;
}): Promise<Notification> => {
  // Create notification for employer
  return await prisma.notification.create({
    data: {
      receiverId: employerId,
      type: NotiType.Job_Application,
      payload: {
        applicationId,
        jobId,
        jobTitle,
        applicantName,
        applicantId,
      },
    },
  });
};

/**
 * Notify job seeker when their application status is updated
 */
export const notifyApplicantOfStatusUpdate = async ({
  applicationId,
  jobId,
  jobTitle,
  companyName,
  applicantId,
  newStatus,
}: {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicantId: string;
  newStatus: string;
}): Promise<Notification> => {
  // Create notification for applicant
  return await prisma.notification.create({
    data: {
      receiverId: applicantId,
      type: NotiType.Application_Status_Update,
      payload: {
        applicationId,
        jobId,
        jobTitle,
        companyName,
        status: newStatus,
      },
    },
  });
};