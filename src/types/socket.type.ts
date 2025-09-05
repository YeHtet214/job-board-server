
export type Message = {
  id: string;
  roomId: string;
  message: string;
  senderId: string;
  receiverId: string;
  createdAt: string; // ISO
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