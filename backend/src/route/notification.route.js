import express from 'express';
import  protectedRoute  from '../middleware/auth.middleware.js';
import { getNotifications, markRead } from '../controller/notification.controller.js';

const router = express.Router();

router.use(protectedRoute);
router.get('/', getNotifications);
router.put('/:id/read', markRead);

export default router;