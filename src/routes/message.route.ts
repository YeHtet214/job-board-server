import { RequestHandler, Router } from 'express';
import authorize from '../middleware/auth.middleware.js';
import { listUserConversations } from '../services/messaging.service.js';
import {
  getAllConversations,
  getConversationById,
  getMessagesByConversationId,
} from '../controllers/messaging.controller.js';

const MessagingRouter = Router();

MessagingRouter.use(authorize as RequestHandler);

MessagingRouter.get('/', getAllConversations as RequestHandler);
MessagingRouter.get('/:id', getConversationById as RequestHandler);
MessagingRouter.get(
  '/:id/messages',
  getMessagesByConversationId as RequestHandler,
);

export default MessagingRouter;
