import { poolPromise } from '../config/dbConfig.js';
import sql from 'mssql';

export const getAdminSediuDashboardStats = async (req, res) => {
  try {
    const sediuId = req.user?.sediu_id;

    if (!sediuId) {
      return res.status(400).json({ message: 'Sediul nu este definit pentru utilizator.' });
    }

    const pool = await poolPromise;

    const [angajati, mecanici, masiniActive, masiniInactive] = await Promise.all([
      pool.request().input('sediu_id', sql.Int, sediuId).query(`
        SELECT COUNT(*) AS total 
        FROM users 
        WHERE sediu_id = @sediu_id AND role IN ('angajat', 'angajat_curier', 'angajat_depozit')
      `),

      pool.request().input('sediu_id', sql.Int, sediuId).query(`
        SELECT COUNT(*) AS total 
        FROM users 
        WHERE sediu_id = @sediu_id AND role = 'mecanic'
      `),

      pool.request().input('sediu_id', sql.Int, sediuId).query(`
        SELECT COUNT(*) AS total 
        FROM flota
        
        WHERE sediu_id = @sediu_id AND status = 'activ'
      `),

      pool.request().input('sediu_id', sql.Int, sediuId).query(`
        SELECT COUNT(*) AS total 
        FROM flota
        WHERE sediu_id = @sediu_id AND status = 'inactiv'
      `),
    ]);

    res.status(200).json({
      angajati: angajati.recordset[0].total,
      mecanici: mecanici.recordset[0].total,
      masiniActive: masiniActive.recordset[0].total,
      masiniInactive: masiniInactive.recordset[0].total,
    });

  } catch (err) {
    console.error('Eroare dashboard admin_sediu:', err);
    res.status(500).json({ message: 'Eroare server la dashboard.' });
  }
};
