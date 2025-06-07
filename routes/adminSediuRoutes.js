import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAdminSediuDashboardStats } from '../controllers/adminSediuController.js';

const router = express.Router();

router.get('/dashboard/admin-sediu', protect, getAdminSediuDashboardStats);

export default router;
