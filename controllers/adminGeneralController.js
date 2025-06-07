import { poolPromise } from '../config/dbConfig.js';

// 1. Obține toate sediile
export const getAllSediis = async (req, res) => {
  try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
          SELECT id, name AS sediu_nume, location AS locatie, judet, created_at 
          FROM sediu
      `);
      res.status(200).json(result.recordset);
  } catch (error) {
      console.error('Eroare la preluarea sediilor:', error);
      res.status(500).json({ message: 'Eroare la preluarea sediilor.' });
  }
};


// 2. Obține toți angajații și administratorii
export const getAllEmployees = async (req, res) => {
  try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
          SELECT id, name AS nume_angajat, email, role, employee_type, sediu_id, is_active, phone 
          FROM users
      `);
      res.status(200).json(result.recordset);
  } catch (error) {
      console.error('Eroare la preluarea angajaților:', error);
      res.status(500).json({ message: 'Eroare la preluarea angajaților.' });
  }
};


// 3. Obține rapoarte de performanță pentru fiecare sediu
export const getPerformanceReports = async (req, res) => {
  try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
          SELECT s.name AS sediu_nume, 
                 COUNT(u.id) AS numar_angajati, 
                 COUNT(f.id) AS masini_active
          FROM sediu s
          LEFT JOIN users u ON u.sediu_id = s.id
          LEFT JOIN flota f ON f.sediu_id = s.id AND f.status = 'activ'
          GROUP BY s.name
      `);
      res.status(200).json(result.recordset);
  } catch (error) {
      console.error('Eroare la generarea rapoartelor de performanță:', error);
      res.status(500).json({ message: 'Eroare la generarea rapoartelor de performanță.' });
  }
};


