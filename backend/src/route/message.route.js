import express from 'express'
import protectedRoute from '../middleware/auth.middleware.js'
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  toggleReaction,
  getReactions,
  markAsSeen,
} from '../controller/message.controller.js'
import uploadMessage from '../middleware/uploadMessage.middleware.js'

const router = express.Router()

// Existing routes
router.get('/users', protectedRoute, getUsersForSidebar)
router.get('/:id', protectedRoute, getMessages)

router.post(
  '/send/:id',
  protectedRoute,
  uploadMessage.single('file'),
  sendMessage
)

// Reaction routes
router.post('/:messageId/reaction', protectedRoute, toggleReaction)
router.get('/:messageId/reactions', protectedRoute, getReactions)

// Mark as seen route
router.put('/:senderId/seen', protectedRoute, markAsSeen)

export default router