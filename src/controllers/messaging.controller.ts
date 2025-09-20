import { RequestWithUser } from '../types/users.js';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { fetchConversationById, fetchMessagesByConversationId, listUserConversations } from '../services/messaging.service.js';

export const getAllConversations = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.user;

  try {
    const conversations = await listUserConversations(userId);

    console.log("TEST: coversations fetch: ", conversations);

    return res.status(200).json({
      success: true,
      message: 'Successfully fetch user\'s conversations',
      data: conversations
    })
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const conversation = await fetchConversationById(id);

    console.log("TEST: coversation fetch: ", conversation);

    return res.status(200).json({
      success: true,
      message: 'Successfully fetched the conversation' + id,
      data: conversation
    })

  } catch(error) {
    next(error);
  }
}

export const getMessagesByConversationId = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const messages = await fetchMessagesByConversationId(id);

    return res.status(200).json({
      success: true,
      message: 'Successfully fetched messages',
      data: messages
    })
  } catch(error) {
    next(error);
  }
}