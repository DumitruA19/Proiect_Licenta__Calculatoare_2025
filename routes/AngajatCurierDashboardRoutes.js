import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAngajatDashboard } from '../controllers/AngajatCurierDashboardController.js';

const router = express.Router();

// Dashboard Angajat Curier
router.get('/angajat', protect, getAngajatDashboard);

export default router;
