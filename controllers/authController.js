import { poolPromise } from '../config/dbConfig.js';
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validare
  if (!email || !password) {
    return res.status(400).json({ error: 'Email și parolă sunt obligatorii.' });
  }

  try {
    const pool = await poolPromise;
    const trimmedEmail = email.trim().toLowerCase();

    const result = await pool.request()
      .input('email', sql.NVarChar, trimmedEmail)
      .query(`
        SELECT id, name, email, password, role, sediu_id
        FROM users
        WHERE LOWER(LTRIM(RTRIM(email))) = @email
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ error: 'Email inexistent!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Parolă incorectă!' });
    }

    // Creează token JWT cu rol și sediu
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        sediu_id: user.sediu_id || null
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '72h' }
    );

    // Trimite user info + token
    return res.status(200).json({
      message: 'Autentificare reușită!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sediu_id: user.sediu_id || null
      }
    });

  } catch (error) {
    console.error('Eroare autentificare:', error);
    return res.status(500).json({ error: 'Eroare server. Încearcă din nou.' });
  }
};
