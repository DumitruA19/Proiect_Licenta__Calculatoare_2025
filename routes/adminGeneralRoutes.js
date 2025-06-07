import express from 'express';
import { protect, verifyRole } from '../middleware/authMiddleware.js';
import { getAllSediis, getAllEmployees, getPerformanceReports } from '../controllers/adminGeneralController.js';

const router = express.Router();

// Protejat cu autentificare și verificare de rol "admin_general"
router.get('/sediis', protect, verifyRole('admin'), getAllSediis);
router.get('/employees', protect, verifyRole('admin'), getAllEmployees);
router.get('/performance', protect, verifyRole('admin'), getPerformanceReports);

export default router;
