import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createFlota, 
  getFlota, 
  updateFlota, 
  deleteFlota, 
  assignCarToUser,
  handleDeleteImage,
    getFlotaAccessories
} from '../controllers/flotaController.js';

const router = express.Router();

router.post('/', protect, createFlota);
router.get('/', protect, getFlota);
router.patch('/:id', protect, updateFlota);
router.delete('/:id', protect, deleteFlota);
router.patch('/:id/assign', protect, assignCarToUser);
router.delete('/flota_img', protect, handleDeleteImage);
router.get('/flota_accessories', protect, getFlotaAccessories);
// 🔹 Endpoint pentru ștergerea unei imagini din flotă
export default router;
