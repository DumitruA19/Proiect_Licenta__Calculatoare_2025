import express from 'express';
import { createSediu, getAllSediu, updateSediu, deleteSediu } from '../controllers/sediuController.js';

const router = express.Router();

// Rute pentru sediu
router.post('/', createSediu); // Creează un sediu nou
router.get('/', getAllSediu); // Obține toate sediile
router.put('/:id', updateSediu); // Actualizează un sediu
router.delete('/:id', deleteSediu); // Șterge un sediu

export default router;






/*const express = require('express');
const { createSediu, getAllSediu, updateSediu, deleteSediu } = require('../controllers/sediuController');
//const { protect } = require('../middleware/authMiddleware'); // Middleware pentru autentificare

const router = express.Router();


router.post('/', createSediu); // Creează un sediu nou
router.get('/',  getAllSediu); // Obține toate sediile
router.put('/:id', updateSediu); // Actualizează un sediu
router.delete('/:id', deleteSediu); // Șterge un sediu

module.exports = router;*/
