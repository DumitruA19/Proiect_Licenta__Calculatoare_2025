import express from 'express';
import { getAllUsers, createUser, loginUser, updateUser, deactivateUser, deleteUser, resetPassword } from '../controllers/usersController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

// Rutele pentru utilizatori
router.get('/', protect, getAllUsers); // Protejată: Obține toți utilizatorii
router.post('/', protect, createUser); // Creează un utilizator nou, protejat
router.post('/login', loginUser); // Autentificare utilizator
router.put('/:id', protect, updateUser); // Protejată: Actualizează un utilizator
router.delete('/:id', protect, deactivateUser); // Protejată: Dezactivează un utilizator (sau putem folosi deleteUser pentru a șterge definitiv)
router.delete('/delete/:id', protect, deleteUser); // Protejată: Șterge un utilizator definitiv
router.get('/reset-password/:token', resetPassword); // Resetare parolă

export default router;