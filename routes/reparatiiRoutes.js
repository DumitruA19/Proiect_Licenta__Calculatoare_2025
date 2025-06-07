import express from 'express';
import { protect, verifyRoles, verifyRole } from '../middleware/authMiddleware.js';


import {
  createReparatie,
  acceptReparatie,
  finalizeReparatie,
  getAllReparatiiForSediu,
  getReparatiiForMecanic,
  getReparatiiByDay,
  getReparatiiByCurier,
  getReparatiiByMasina,
  deleteReparatie,
  getReparatiiDisponibile,
    rejectReparatie,
  getAcceptedRepairsForMecanic
} from '../controllers/reparatiiController.js';


const router = express.Router();


router.post('/', protect, verifyRoles(['angajat']), createReparatie);

router.patch('/:id/accepta', protect, verifyRole('mecanic'), acceptReparatie);
router.patch('/:id/finalizeaza', protect, verifyRole('mecanic'), finalizeReparatie);
router.delete('/:id', protect, verifyRole('admin'), deleteReparatie);
router.get('/sediu', protect, verifyRole('admin'), getAllReparatiiForSediu);
router.get('/mecanic', protect, verifyRole('mecanic'), getReparatiiForMecanic);
router.get('/ziua-curenta', protect, verifyRole('admin'), getReparatiiByDay);
router.get('/curier/:user_id', protect, verifyRole('admin'), getReparatiiByCurier);
router.get('/masina/:masina_id', protect, verifyRole('admin'), getReparatiiByMasina);
router.get('/mecanici/disponibile', protect, verifyRole('mecanic'), getReparatiiDisponibile);
router.patch('/:id/respingere', protect, verifyRole('mecanic'), rejectReparatie);
router.get('/reparatii/mecanic/acceptate', protect, verifyRole('mecanic'), getAcceptedRepairsForMecanic);

export default router;
