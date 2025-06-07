import { poolPromise } from '../config/dbConfig.js';
import sql from 'mssql';

export const submitMasina = async (req, res) => {
  const { user_id, masina_id } = req.body;
  console.log('🔍 Date primite la selectare mașină:', { user_id, masina_id });

  if (!user_id || !masina_id) {
    return res.status(400).json({ message: 'User ID și Mașină ID sunt obligatorii.' });
  }

  try {
    const pool = await poolPromise;

    // 🔧 Update flota
    await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('masina_id', sql.Int, masina_id)
      .query(`
        UPDATE flota
        SET user_id = @user_id
        WHERE id = @masina_id
      `);

    // 🔎 Caută dacă există rând pontaj pentru ziua curentă
    const existing = await pool.request()
  .input('user_id', sql.Int, user_id)
  .input('masina_id', sql.Int, masina_id)
  .query(`
    SELECT id FROM pontaj
    WHERE user_id = @user_id AND masina_id = @masina_id
      AND DATEDIFF(DAY, ISNULL(start_time, created_at), GETDATE()) = 0
      AND end_time IS NULL
  `);


    if (existing.recordset.length === 0) {
      // 🔥 Dacă nu există — INSERT rând gol
      await pool.request()
        .input('user_id', sql.Int, user_id)
        .input('masina_id', sql.Int, masina_id)
        .input('type', sql.NVarChar, 'selectare')
        .input('created_at', sql.DateTime, new Date())
        .query(`
          INSERT INTO pontaj (user_id, masina_id, type, created_at)
          VALUES (@user_id, @masina_id, @type, @created_at)
        `);

      console.log('✅ INSERT pontaj executat pentru selectare');
    } else {
      console.log('ℹ️ Rând pontaj existent — NU s-a mai inserat.');
    }

    res.status(200).json({ message: 'Mașina selectată și pontaj verificat.' });
  } catch (error) {
    console.error('💥 Eroare la selectarea mașinii:', error);
    res.status(500).json({ message: 'Eroare server la selectarea mașinii.' });
  }
};



// 📌 Pontaj START și FINAL
export const submitStart = async (req, res) => {
  const { user_id, sediu_id, masina_id, start_time, km_start } = req.body;
  console.log('🔍 Date primite la START:', { user_id, sediu_id, masina_id, start_time, km_start });

  if (!user_id || !sediu_id || !masina_id || !start_time || !km_start) {
    return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii (start).' });
  }

  try {
    const pool = await poolPromise;
    const todayString = new Date().toISOString().split('T')[0];
    const startDateTime = new Date(`${todayString}T${start_time}`);

    // 🔎 Caută dacă există rând pontaj pentru ziua curentă
    const existing = await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('masina_id', sql.Int, masina_id)
      .query(`
        SELECT id FROM pontaj
        WHERE user_id = @user_id AND masina_id = @masina_id
          AND DATEDIFF(DAY, ISNULL(start_time, created_at), GETDATE()) = 0
      `);

    if (existing.recordset.length > 0) {
      const pontajId = existing.recordset[0].id;

      // 🔧 UPDATE pe rândul EXISTENT
      await pool.request()
        .input('id', sql.Int, pontajId)
        .input('start_time', sql.DateTime, startDateTime)
        .input('km_start', sql.Int, km_start)
        .input('sediu_id', sql.Int, sediu_id)
        .query(`
          UPDATE pontaj
          SET start_time = @start_time,
              km_start = @km_start,
              sediu_id = @sediu_id,
              type = 'start'
          WHERE id = @id
        `);

      console.log('✅ START pontaj actualizat');
    } else {
      // 🚨 Dacă nu există rând — userul trebuie să selecteze mașina întâi
      return res.status(404).json({ message: 'Pontaj lipsă — selectează mai întâi mașina.' });
    }

    res.status(200).json({ message: 'Pontaj START salvat cu succes.' });
  } catch (error) {
    console.error('💥 Eroare la START:', error);
    res.status(500).json({ message: 'Eroare server la pontaj START.' });
  }
};



// 📌 Pontaj FINAL
export const submitFinal = async (req, res) => {
  const { user_id, sediu_id, masina_id, end_time, km_end } = req.body;
  console.log('🔍 Date primite la FINAL:', { user_id, sediu_id, masina_id, end_time, km_end });

  if (!user_id || !sediu_id || !masina_id || !end_time || !km_end) {
    return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii (final).' });
  }

  try {
    const pool = await poolPromise;
    const todayString = new Date().toISOString().split('T')[0];
    const endDateTime = new Date(`${todayString}T${end_time}`);

    // 🔎 Verifică existența START
    const checkStart = await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('masina_id', sql.Int, masina_id)
      .query(`
        SELECT id, km_start FROM pontaj
        WHERE user_id = @user_id AND masina_id = @masina_id
          AND CAST(start_time AS DATE) = CAST(GETDATE() AS DATE)
      `);

    if (checkStart.recordset.length === 0) {
      return res.status(404).json({ message: 'Nu există pontaj START pentru astăzi.' });
    }

    const km_start = checkStart.recordset[0].km_start;
    if (km_end < km_start) {
      return res.status(400).json({ message: 'Km final nu poate fi mai mic decât km start.' });
    }

    // 🔧 Update rând existent
    await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('masina_id', sql.Int, masina_id)
      .input('end_time', sql.DateTime, endDateTime)
      .input('km_end', sql.Int, km_end)
      .query(`
        UPDATE pontaj
        SET end_time = @end_time, km_end = @km_end
        WHERE user_id = @user_id AND masina_id = @masina_id
          AND CAST(start_time AS DATE) = CAST(GETDATE() AS DATE)
      `);

    console.log('✅ FINAL pontaj actualizat');

    // 🔥 Bonus: reset flota
    await pool.request()
      .input('masina_id', sql.Int, masina_id)
      .query(`
        UPDATE flota
        SET user_id = NULL
        WHERE id = @masina_id
      `);

    console.log('✅ Utilizator flota resetat');

    res.status(200).json({ message: 'Pontaj FINAL salvat cu succes.' });
  } catch (error) {
    console.error('💥 Eroare la FINAL:', error);
    res.status(500).json({ message: 'Eroare server la pontaj FINAL.' });
  }
};

// Combustibil - actualizare pontaj
export const submitCombustibil = async (req, res) => {
  const { user_id, sediu_id, masina_id, fuel_used, fuel_price } = req.body;
  console.log('🔍 Date primite la COMBUSTIBIL:', { user_id, sediu_id, masina_id, fuel_used, fuel_price });

  if (!user_id || !sediu_id || !masina_id || !fuel_used) {
    return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii (combustibil).' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
  .input('user_id', sql.Int, user_id)
  .input('masina_id', sql.Int, masina_id)
  .input('fuel_used', sql.Float, fuel_used)
  .input('fuel_price', sql.Float, fuel_price || 0)
  .query(`
    UPDATE pontaj
    SET 
      fuel_used = @fuel_used,
      fuel_price = @fuel_price
    WHERE user_id = @user_id AND masina_id = @masina_id
      AND CAST(ISNULL(start_time, created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Romance Standard Time') AS DATE) = CAST(GETDATE() AS DATE)

  `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Nu există pontaj START pentru astăzi.' });
    }

    console.log('✅ COMBUSTIBIL pontaj actualizat');
    res.status(200).json({ message: 'Combustibil adăugat cu succes la pontaj.' });
  } catch (error) {
    console.error('💥 Eroare la COMBUSTIBIL:', error);
    res.status(500).json({ message: 'Eroare server la pontaj combustibil.' });
  }
};
