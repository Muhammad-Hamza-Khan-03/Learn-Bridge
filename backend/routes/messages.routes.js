import express from "express"
import {
  getMessagesBetweenUsers,
  getSessionMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  getUserConversations,
  deleteSessionMessages,
  clearConversation
} from '../controllers/messages.controller.js'

// Import auth middleware
import { protect,authorize } from "../middlewares/auth.middleware.js"

const messageRouter = express.Router()

// All message routes are protected
messageRouter.use(protect)

// Get messages between users
messageRouter.get('/:userId', getMessagesBetweenUsers)

// Get messages for a specific session
messageRouter.get('/session/:sessionId', getSessionMessages)

// Send a new message
messageRouter.post('/', sendMessage)

// Mark messages as read
messageRouter.put('/read/:userId', markMessagesAsRead)

// Get unread message count
messageRouter.get('/unread', getUnreadMessageCount)

// Get user conversations
messageRouter.get('/conversations', getUserConversations)
messageRouter.delete('/session/:sessionId', deleteSessionMessages);
messageRouter.delete('/:userId/clear', clearConversation);

export default messageRouter