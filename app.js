import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import usersRoutes from './routes/usersRoutes.js';
import flotaRoutes from './routes/flotaRoutes.js';
import sediuRoutes from './routes/sediuRoutes.js';
import reparatiiRoutes from './routes/reparatiiRoutes.js';
import accessoriesRoutes from './routes/accessoriesRoutes.js';
import cereriConcediuRoutes from './routes/cereriConcediuRoutes.js';
import pontajRoutes from './routes/pontajRoutes.js';
import flotaAccessoriesRoutes from './routes/flotaAccessoriesRoutes.js';
import notificariRoutes from './routes/notificariRoutes.js';
import adminGeneralRoutes from './routes/adminGeneralRoutes.js';
import { poolPromise } from './config/dbConfig.js';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/authRoutes.js';
import adminSediuRoutes from './routes/adminSediuRoutes.js';
import AngajatCurierDashboardRoutes from './routes/AngajatCurierDashboardRoutes.js';



dotenv.config();

const app = express();

// Middleware-uri
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test conexiunea la baza de date
(async () => {
    try {
        console.log('Connecting to database...');
        await poolPromise;
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
})();

// Înregistrarea rutelor existente
console.log('Registering routes...');
app.use('/api/users', usersRoutes);
app.use('/api/flota', flotaRoutes);
app.use('/api/sediu', sediuRoutes);
app.use('/api/reparatii', reparatiiRoutes);
app.use('/api/accessories', accessoriesRoutes);
app.use('/api/cereri-concediu', cereriConcediuRoutes);
app.use('/api/pontaj', pontajRoutes);
app.use('/api/flota-accessories', flotaAccessoriesRoutes);
app.use('/api/notificari', notificariRoutes);
app.use('/api/admin-general', adminGeneralRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', adminSediuRoutes);
app.use('/api/angajat-curier-dashboard', AngajatCurierDashboardRoutes);


// 🔐 Endpoint test pentru login funcțional
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  /*const user = {
    id: 1,
    email: "admin@example.com",
    password: "$2a$10$8AjW/X0o6zgnBa7CTJm72.HB.MKBDplu0H8vF5FbGCz7WX1pDCy.a", // parola: admin123
    role: "administrator_general"
  };*/

  if (!email || !password) {
    return res.status(400).json({ error: "Email și parolă sunt obligatorii." });
  }

  if (email !== user.email) {
    return res.status(401).json({ error: "Email inexistent!" });
  }

  //const bcrypt = require("bcryptjs");
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ error: "Parolă incorectă!" });
  }

  res.json({
    message: "Login reușit!",
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});


// Endpoint de test pentru resetare parolă
app.post("/api/reset-password", async (req, res) => {
    const { email } = req.body;

    if (email === "admin@example.com") {
        return res.json({ message: "Email trimis!" });
    } else {
        return res.status(400).json({ error: "Email inexistent!" });
    }
});

// Pornirea serverului
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
