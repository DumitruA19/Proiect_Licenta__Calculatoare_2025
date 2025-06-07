import express from 'express';
import { submitMasina, submitStart, submitFinal, submitCombustibil } from '../controllers/pontajController.js';

const router = express.Router();

router.post('/masina', submitMasina);
router.post('/start', submitStart);
router.post('/final', submitFinal);
router.post('/combustibil', submitCombustibil);

export default router;
