import jwt from 'jsonwebtoken';
import { poolPromise } from '../config/dbConfig.js';
import sql from 'mssql';

// Middleware pentru protecție autentificare
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Int, decoded.id)
                 .query('SELECT id, sediu_id FROM users WHERE id = @id');

            if (result.recordset.length === 0) {
                return res.status(401).json({ message: 'Nu ești autorizat. Utilizatorul nu a fost găsit.' });
            }

            req.user = result.recordset[0]; // Salvează utilizatorul complet (inclusiv id și role)
         
            console.log('User autentificat:', req.user); // DEBUGGING (poți să-l scoți după)
            next();
        } catch (error) {
            console.error('Eroare la verificarea token-ului:', error);
            res.status(401).json({ message: 'Nu ești autorizat. Token invalid.' });
        }
    } else {
        res.status(401).json({ message: 'Nu ești autorizat. Token lipsă.' });
    }
};

// Middleware pentru verificarea rolurilor
export const verifyRole = (requiredRole) => (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Nu ești autentificat.' });
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: 'Nu ai permisiunea necesară pentru a accesa această resursă.' });
        }

        next();
    } catch (err) {
        console.error('Eroare la verificarea rolului:', err);
        return res.status(401).json({ message: 'Acces neautorizat.' });
    }
};

export const verifyRoles = (allowedRoles) => (req, res, next) => {
  try {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Nu ai permisiunea necesară pentru a accesa această resursă.' });
    }
    next();
  } catch (err) {
    console.error('💥 Eroare la verificarea rolului:', err);
    return res.status(401).json({ message: 'Token invalid sau acces neautorizat.' });
  }
};

/*
import jwt from 'jsonwebtoken';
import { poolPromise } from '../config/dbConfig.js';
import sql from 'mssql';


// Middleware pentru protecție autentificare
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Int, decoded.id)
                .query('SELECT * FROM users WHERE id = @id');

            if (result.recordset.length === 0) {
                return res.status(401).json({ message: 'Nu ești autorizat. Utilizatorul nu a fost găsit.' });
            }

            req.user = result.recordset[0]; // Salvează utilizatorul în req
            next();
        } catch (error) {
            console.error('Eroare la verificarea token-ului:', error);
            res.status(401).json({ message: 'Nu ești autorizat. Token invalid.' });
        }
    } else {
        res.status(401).json({ message: 'Nu ești autorizat. Token lipsă.' });
    }
    console.log('Authorization header primit:', req.headers.authorization);

};

// Middleware pentru verificarea rolurilor
export const verifyRole = (requiredRole) => (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== requiredRole) {
            return res.status(403).json({ message: 'Nu ai permisiunea necesară pentru a accesa această resursă.' });
        }

        req.user = decoded; // Salvează informațiile userului în req
        next();
    } catch (err) {
        console.error('Eroare la verificarea rolului:', err);
        return res.status(401).json({ message: 'Token invalid sau acces neautorizat.' });
    }
};
*/