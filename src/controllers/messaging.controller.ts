import { RequestWithUser } from '../types/users.js';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import {
  fetchConversationById,
  fetchMessagesByConversationId,
  listUserConversations,
} from '../services/messaging.service.js';
import { profile } from 'console';
import { formatConversationParticipants } from '../utils/index.js';

export const getAllConversations = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.user;

  try {
    const conversations = await listUserConversations(userId);

    conversations[0].participants?.map((p) => {
      console.log(p.user);
    });

    // format the conversations to remove unncessary data depend on the user role
    const clearedConversations = formatConversationParticipants(conversations);

    return res.status(200).json({
      success: true,
      message: "Successfully fetch user's conversations",
      data: clearedConversations,
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  try {
    const conversation = await fetchConversationById(id);

    return res.status(200).json({
      success: true,
      message: 'Successfully fetched the conversation' + id,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessagesByConversationId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  try {
    const messages = await fetchMessagesByConversationId(id);

    return res.status(200).json({
      success: true,
      message: 'Successfully fetched messages',
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
