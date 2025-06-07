import { poolPromise } from '../config/dbConfig.js';
import sql from 'mssql';

// 📊 Dashboard Angajat Curier
export const getAngajatDashboard = async (req, res) => {
  const { id: user_id, sediu_id } = req.user;

  try {
    const pool = await poolPromise;

    // 1️⃣ Status Pontaj Azi
    const today = new Date();
    const todayDateOnly = today.toISOString().split('T')[0];

    const pontajResult = await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('sediu_id', sql.Int, sediu_id)
      .input('today', sql.DateTime, todayDateOnly)
      .query(`
        SELECT TOP 1 * 
        FROM pontaj
        WHERE user_id = @user_id
          AND sediu_id = @sediu_id
          AND CONVERT(date, start_time) = @today
      `);

    const pontatAstazi = pontajResult.recordset.length > 0;

    // 2️⃣ Mașină Utilizată Azi
let masina = '—';
if (pontajResult.recordset.length > 0) {
  const masinaId = pontajResult.recordset[0].masina_id;  // <-- modificat aici!
  const masinaResult = await pool.request()
    .input('masina_id', sql.Int, masinaId)
    .input('sediu_id', sql.Int, sediu_id)
    .query(`
      SELECT id, nr_inmatriculare, marca, model
      FROM flota
      WHERE id = @masina_id
        AND sediu_id = @sediu_id
    `);

  if (masinaResult.recordset.length > 0) {
    const m = masinaResult.recordset[0];
    masina = `${m.nr_inmatriculare} (${m.marca} ${m.model})`;
  }
}

    // 3️⃣ KM Azi
    let kmAzi = 0;
    if (pontajResult.recordset.length > 0) {
      const pontaj = pontajResult.recordset[0];
      if (pontaj.km_start !== null && pontaj.km_end !== null) {
        kmAzi = pontaj.km_end - pontaj.km_start;
      }
    }

    // 4️⃣ Ore Lucrate Azi
    let oreLucrate = 0;
    if (pontajResult.recordset.length > 0) {
      const pontaj = pontajResult.recordset[0];
      if (pontaj.start_time && pontaj.end_time) {
        const start = new Date(pontaj.start_time);
        const end = new Date(pontaj.end_time);
        const diffMs = end - start;
        oreLucrate = Math.round(diffMs / (1000 * 60 * 60)); // ore întregi
      }
    }

    // 5️⃣ Combustibil folosit Azi
    let combustibil = 0;
    if (pontajResult.recordset.length > 0) {
      const pontaj = pontajResult.recordset[0];
      if (pontaj.fuel_used !== null) {
        combustibil = pontaj.fuel_used;
      }
    }

    // Trimite răspunsul către frontend
    res.status(200).json({
      pontatAstazi,
      masina,
      kmAzi,
      oreLucrate,
      combustibil
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ message: 'Eroare server la dashboard angajat.' });
  }
};
