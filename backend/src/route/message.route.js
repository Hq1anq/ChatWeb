import express from 'express'
import protectedRoute from '../middleware/auth.middleware.js'
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
} from '../controller/message.controller.js'
import uploadMessage from '../middleware/uploadMessage.middleware.js'

const router = express.Router()

router.get('/users', protectedRoute, getUsersForSidebar)
router.get('/:id', protectedRoute, getMessages)

router.post(
  '/send/:id',
  protectedRoute,
  uploadMessage.single('file'),
  sendMessage
)

export default router
