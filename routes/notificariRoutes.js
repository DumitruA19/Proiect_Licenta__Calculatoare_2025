import express from 'express';
import { createNotification, getNotifications } from '../controllers/notificariController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rute pentru notificări
router.post('/', protect, createNotification);
router.get('/:recipient_id', protect, getNotifications);

export default router;
