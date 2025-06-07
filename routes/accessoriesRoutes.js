import express from 'express';
import { getAllAccessories, createAccessory, updateAccessory, deleteAccessory } from '../controllers/accessoriesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutele pentru accesorii
router.get('/', protect, getAllAccessories); // Protejată: Obține toate accesoriile
router.post('/', protect, createAccessory); // Protejată: Creează un accesoriu nou
router.put('/:id', protect, updateAccessory); // Protejată: Actualizează un accesoriu
router.delete('/:id', protect, deleteAccessory); // Protejată: Șterge un accesoriu

export default router;
/*const express = require('express');
const {
    createAccessory,
    getAllAccessories,
    updateAccessory,
    deleteAccessory,
} = require('../controllers/accessoriesController');

const router = express.Router();

// Rute pentru accesorii
router.post('/', createAccessory); // Adaugă un accesoriu
router.get('/', getAllAccessories); // Obține toate accesoriile
router.put('/:id', updateAccessory); // Actualizează un accesoriu
router.delete('/:id', deleteAccessory); // Șterge un accesoriu

module.exports = router;
*/