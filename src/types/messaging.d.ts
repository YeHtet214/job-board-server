export type Conversation = {
  id: string;
  isDirect: boolean;
  directKey?: string | null;
  createdAt: Date;
  participants?: Participant[];
}

export type Participant = {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: Date;
  lastReadAt: Date | null;
  user: User;
}

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  meta?: any;
  createdAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
};

export type PrivateMessagePayload = {
  senderId: string;
  receiverId: string;
  message: string;
};

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

/** Socket.io Types END */