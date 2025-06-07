import { poolPromise } from '../config/dbConfig.js';
import sql from 'mssql';

// ✅ Creează notificare (POST /api/notificari)
export const createNotification = async (req, res) => {
  const { recipient_id, type, message, link, sediu_id } = req.body;

  if (!recipient_id || !type || !message) {
    return res.status(400).json({ message: 'recipient_id, type și message sunt obligatorii.' });
  }

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('recipient_id', sql.Int, recipient_id)
      .input('type', sql.NVarChar, type)
      .input('message', sql.NVarChar, message)
      .input('link', sql.NVarChar, link || null) // 🔥 Adăugat link aici
      .input('status', sql.NVarChar, 'unread')
      .input('sediu_id', sql.Int, sediu_id || null)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO notificari 
        (recipient_id, type, message, link, status, sediu_id, created_at)
        VALUES 
        (@recipient_id, @type, @message, @link, @status, @sediu_id, @created_at)
      `);

    res.status(201).json({ message: 'Notificare creată cu succes.' });
  } catch (err) {
    console.error('💥 Eroare la crearea notificării:', err);
    res.status(500).json({ message: 'Eroare server la crearea notificării.' });
  }
};

// ✅ Obține notificările pentru un utilizator (GET /api/notificari/:recipient_id)
export const getNotifications = async (req, res) => {
  let { recipient_id } = req.params;
  recipient_id = parseInt(recipient_id, 10);

  if (isNaN(recipient_id)) {
    return res.status(400).json({ message: 'recipient_id invalid.' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('recipient_id', sql.Int, recipient_id)
      .query(`
        SELECT id, recipient_id, type, message, link, status, sediu_id, created_at
        FROM notificari
        WHERE recipient_id = @recipient_id
        ORDER BY created_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('💥 Eroare la încărcarea notificărilor:', err);
    res.status(500).json({ message: 'Eroare server la încărcarea notificărilor.' });
  }
};

// ✅ Funcție auxiliară pentru trimiterea notificărilor din alte controalere
export const sendNotification = async ({ recipient_id, type, message, link = null, sediu_id = null }) => {
  if (!recipient_id || !type || !message) {
    console.error('⚠️ Parametri lipsă la sendNotification:', { recipient_id, type, message });
    return;
  }

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('recipient_id', sql.Int, recipient_id)
      .input('type', sql.NVarChar, type)
      .input('message', sql.NVarChar, message)
      .input('link', sql.NVarChar, link || null) // 🔥 Adăugat link aici
      .input('status', sql.NVarChar, 'unread')
      .input('sediu_id', sql.Int, sediu_id)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO notificari 
        (recipient_id, type, message, link, status, sediu_id, created_at)
        VALUES 
        (@recipient_id, @type, @message, @link, @status, @sediu_id, @created_at)
      `);
  } catch (err) {
    console.error('💥 Eroare la sendNotification:', err);
  }
};
