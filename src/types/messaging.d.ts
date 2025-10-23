import { Notification, NotiType } from '@prisma/client';

export type Conversation = {
  id: string;
  isDirect: boolean;
  directKey?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  messages?: Message[];
  lastMessage?: Message;
  participants: Participant[];
};

export type NormalizedConversation = {
  id: string;
  receipent: {
    id: string;
    email: string;
    name?: string;
    avatar?: string | null;
  } | null;
  updatedAt?: Date;
  mesages?: any[];
  lastMessage?: any;
  createdAt?: Date;
  unreadCount?: number;
};

export type Participant = {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: Date;
  lastReadAt: Date | null;
};

// export type Message = {
//   id: string;
//   conversationId: string;
//   senderId: string;
//   body: string;
//   meta?: any;
//   createdAt: Date | null;
//   deliveredAt: Date | null;
//   readAt: Date | null;
// };

export interface SendMessagePayload {
  conversationId: string;
  receiverId: string;
  body: string;
  meta?: any;
}

export interface CreateMessagePayload extends SendMessagePayload {
  senderId: string;
}

export interface DirectMessageNotification {
  type: NotiType;
  conversationId: string;
  message: {
    id: string;
    senderId: string;
    body: string;
    createdAt: Date;
  };
}

export type ClientToServerEvents = {
  join: (roomId: string) => void;
  'chat:send': (
    msg: { roomId: string; text: string; senderId: string },
    ack?: (
      res: { ok: true; id: string } | { ok: false; error: string },
    ) => void,
  ) => void;
};

export type ServerToClientEvents = {
  'chat:new': (msg: Message) => void;
};
