import { poolPromise } from '../config/dbConfig.js';
import sql from 'mssql';

// ✅ Creează raport
export const createRaport = async (req, res) => {
  const { name, content, created_by } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('content', sql.NVarChar, content)
      .input('created_by', sql.Int, created_by)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO rapoarte (name, content, created_by, created_at)
        VALUES (@name, @content, @created_by, @created_at)
      `);

    res.status(201).json({ message: 'Raport creat cu succes.' });
  } catch (err) {
    console.error('Eroare la crearea raportului:', err);
    res.status(500).json({ message: 'Eroare server la crearea raportului.' });
  }
};

// ✅ Obține toate rapoartele
export const getAllRapoarte = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM rapoarte ORDER BY created_at DESC');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Eroare la încărcarea rapoartelor:', err);
    res.status(500).json({ message: 'Eroare server la încărcarea rapoartelor.' });
  }
};

// ✅ Șterge raport
export const deleteRaport = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM rapoarte WHERE id = @id');

    res.status(200).json({ message: 'Raport șters cu succes.' });
  } catch (err) {
    console.error('Eroare la ștergerea raportului:', err);
    res.status(500).json({ message: 'Eroare server la ștergerea raportului.' });
  }
};
