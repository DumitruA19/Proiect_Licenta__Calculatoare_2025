import { poolPromise } from '../config/dbConfig.js';
import sql from 'mssql';
import { containerClient } from '../config/azureBlobConfig.js';
import { v4 as uuidv4 } from 'uuid';
import { sendNotification } from './notificariController.js';

// 🔧 Upload image to Azure Blob Storage
const uploadImageToBlob = async (file) => {
  const blobName = `${uuidv4()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype },
  });
  return `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${blobName}`;
};


// ✅ Create Repair Request
// Curierul trimite cerere de reparație
export const createReparatie = async (req, res) => {
  const { masina_id, descriere, urgent, sediu_id } = req.body;
  const user_id = req.user.id;

  if (!masina_id || !descriere || !sediu_id) {
    return res.status(400).json({ message: 'Mașina, descriere și sediu_id sunt obligatorii.' });
  }

  try {
    const pool = await poolPromise;

    // 📝 Găsește numărul de înmatriculare
    const masinaResult = await pool.request()
      .input('id', sql.Int, masina_id)
      .query(`SELECT nr_inmatriculare FROM flota WHERE id = @id`);
    const nr_inmatriculare = masinaResult.recordset[0]?.nr_inmatriculare || 'Necunoscut';

    // 📝 Găsește numele curierului
    const userResult = await pool.request()
      .input('id', sql.Int, user_id)
      .query(`SELECT name FROM users WHERE id = @id`);
    const curier_nume = userResult.recordset[0]?.name || 'Necunoscut';

    // 🔥 Inserează cererea
    await pool.request()
      .input('masina_id', sql.Int, masina_id)
      .input('user_id', sql.Int, user_id)
      .input('status', sql.NVarChar, 'noua')
      .input('descriere', sql.NVarChar, descriere)
      .input('urgent', sql.Bit, urgent ? 1 : 0)
      .input('sediu_id', sql.Int, sediu_id)
      .input('start_date', sql.DateTime, new Date())
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO reparatii 
        (masina_id, user_id, status, descriere, urgent, sediu_id, start_date, created_at)
        VALUES 
        (@masina_id, @user_id, @status, @descriere, @urgent, @sediu_id, @start_date, @created_at)
      `);

    // 🔔 Notifică mecanicii
    const mecanici = await pool.request().query(`SELECT id FROM users WHERE role = 'mecanic'`);
    for (const mecanic of mecanici.recordset) {
      await sendNotification({
        recipient_id: mecanic.id,
        sender_id: user_id,
        type: 'reparatie_noua',
        message: `Mașina ${nr_inmatriculare} a fost raportată cu problema: "${descriere}".`,
      });
    }

    // 🔔 Notifică adminii
    const admins = await pool.request().query(`SELECT id FROM users WHERE role = 'admin'`);
    for (const admin of admins.recordset) {
      await sendNotification({
        recipient_id: admin.id,
        sender_id: user_id,
        type: 'reparatie_noua',
        message: `Curierul ${curier_nume} a raportat o problemă la mașina ${nr_inmatriculare}.`,
      });
    }

    res.status(201).json({ message: 'Cerere de reparație creată și notificări trimise.' });
  } catch (error) {
    console.error('💥 Eroare la creare reparație:', error.message);
    res.status(500).json({ message: 'Eroare server la creare reparație.' });
  }
};



// Acceptă cerere
export const acceptReparatie = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const pool = await poolPromise;

    const reparatieResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT masina_id FROM reparatii WHERE id = @id AND status = 'noua'`);
    if (reparatieResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Cererea nu există sau a fost deja acceptată.' });
    }
    const masina_id = reparatieResult.recordset[0].masina_id;

    const masina = await pool.request()
      .input('id', sql.Int, masina_id)
      .query(`SELECT nr_inmatriculare FROM flota WHERE id = @id`);
    const nr_inmatriculare = masina.recordset[0]?.nr_inmatriculare || 'Necunoscut';

    const mecanic = await pool.request()
      .input('id', sql.Int, user_id)
      .query(`SELECT name FROM users WHERE id = @id`);
    const mecanic_nume = mecanic.recordset[0]?.name || 'Necunoscut';

    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, 'acceptata')
      .input('user_id', sql.Int, user_id)
      .query(`UPDATE reparatii SET status = @status, user_id = @user_id WHERE id = @id`);

    // 🔔 Notificare către admin
    const admins = await pool.request().query(`SELECT id FROM users WHERE role = 'admin'`);
    for (const admin of admins.recordset) {
      await sendNotification({
        recipient_id: admin.id,
        sender_id: user_id,
        type: 'reparatie_acceptata',
        message: `Mecanicul ${mecanic_nume} a acceptat cererea de reparație pentru mașina ${nr_inmatriculare}.`,
      });
    }

    res.status(200).json({ message: 'Cererea a fost acceptată.' });
  } catch (error) {
    console.error('💥 Eroare la acceptare:', error.message);
    res.status(500).json({ message: 'Eroare server la acceptare.' });
  }
};

// Respinge cerere
export const rejectReparatie = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const pool = await poolPromise;

    const check = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT status, masina_id FROM reparatii WHERE id = @id`);

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: 'Cererea nu există.' });
    }

    if (check.recordset[0].status !== 'noua') {
      return res.status(400).json({ message: 'Cererea a fost deja acceptată sau respinsă.' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, 'noua')  // sau 'respinsa' dacă preferi să o marchezi respinsă
      .query(`
        UPDATE reparatii
        SET status = @status
        WHERE id = @id
      `);

    // 🔔 Trimite notificare la admin
    const admins = await pool.request().query(`SELECT id FROM users WHERE role = 'admin'`);
    for (const admin of admins.recordset) {
      await sendNotification({
        recipient_id: admin.id,
        type: 'reparatie_refuzata',
        message: `Mecanicul ${user_id} a respins cererea de reparație pentru mașina ${check.recordset[0].masina_id}.`
      });
    }

    res.status(200).json({ message: 'Cererea de reparație a fost respinsă.' });
  } catch (err) {
    console.error('💥 Eroare la respingere:', err);
    res.status(500).json({ message: 'Eroare server la respingere.' });
  }
};



// ✅ Finalize Repair
// ✅ Finalizează reparația
export const finalizeReparatie = async (req, res) => {
  const { id } = req.params;
  const { parts_cost, manopera_cost } = req.body;

  try {
    const pool = await poolPromise;

    let newPartsImageUrl = null;
    let replacedPartsImageUrl = null;

    if (req.files?.newPartsImage?.[0]) {
      newPartsImageUrl = await uploadImageToBlob(req.files.newPartsImage[0]);
    }
    if (req.files?.replacedPartsImage?.[0]) {
      replacedPartsImageUrl = await uploadImageToBlob(req.files.replacedPartsImage[0]);
    }

    // finalizează reparatia
    await pool.request()
      .input('id', sql.Int, id)
      .input('end_date', sql.DateTime, new Date())
      .input('parts_cost', sql.Float, parts_cost || 0)
      .input('manopera_cost', sql.Float, manopera_cost || 0)
      .input('status', sql.NVarChar, 'finalizata')
      .input('new_parts_image_url', sql.NVarChar, newPartsImageUrl)
      .input('replaced_parts_image_url', sql.NVarChar, replacedPartsImageUrl)
      .query(`
        UPDATE reparatii
        SET end_date = @end_date,
            parts_cost = @parts_cost,
            manopera_cost = @manopera_cost,
            status = @status,
            new_parts_image_url = ISNULL(@new_parts_image_url, new_parts_image_url),
            replaced_parts_image_url = ISNULL(@replaced_parts_image_url, replaced_parts_image_url)
        WHERE id = @id
      `);

    // 📝 Trimite notificare la admin
    const admins = await pool.request().query(`SELECT id FROM users WHERE role = 'admin_sediu'`);
    for (const admin of admins.recordset) {
      await sendNotification({
        recipient_id: admin.id,
        type: 'reparatie_finalizata',
        message: `Reparația ${id} a fost finalizată.`,
      });
    }

    res.status(200).json({ message: 'Reparația a fost finalizată cu succes.' });
  } catch (error) {
    console.error('💥 Eroare la finalizarea reparației:', error.message);
    res.status(500).json({ message: 'Eroare server la finalizarea reparației.' });
  }
};


// ✅ Alte GET și DELETE rămân la fel (nu implică schimbări legate de users)


export const getReparatiiByDay = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .query(`
        SELECT r.*, f.nr_inmatriculare
        FROM reparatii r
        JOIN flota f ON r.masina_id = f.id
        WHERE CAST(r.created_at AS DATE) = CAST(GETDATE() AS DATE)
        ORDER BY r.created_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('💥 Eroare la obținerea reparațiilor pe ziua curentă:', error.message);
    res.status(500).json({ message: 'Eroare server la obținerea reparațiilor pe ziua curentă.' });
  }
};

export const getReparatiiByCurier = async (req, res) => {
  const { user_id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT r.*, f.nr_inmatriculare
        FROM reparatii r
        JOIN flota f ON r.masina_id = f.id
        WHERE r.user_id = @user_id
        ORDER BY r.created_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('💥 Eroare la obținerea reparațiilor pentru curier:', error.message);
    res.status(500).json({ message: 'Eroare server la obținerea reparațiilor pentru curier.' });
  }
};

export const getReparatiiByMasina = async (req, res) => {
  const { masina_id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('masina_id', sql.Int, masina_id)
      .query(`
        SELECT r.*, u.nume AS curier_nume, f.nr_inmatriculare
        FROM reparatii r
        JOIN users u ON r.user_id = u.id
        JOIN flota f ON r.masina_id = f.id
        WHERE r.masina_id = @masina_id
        ORDER BY r.created_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('💥 Eroare la obținerea reparațiilor pentru mașină:', error.message);
    res.status(500).json({ message: 'Eroare server la obținerea reparațiilor pentru mașină.' });
  }
};
export const deleteReparatie = async (req, res) => {
  try {
    // Dummy code: de implementat după
    res.status(200).json({ message: 'Delete reparatie implementat cu succes.' });
  } catch (error) {
    console.error('💥 Eroare la deleteReparatie:', error);
    res.status(500).json({ message: 'Eroare server la deleteReparatie.' });
  }
};
// ✅ Admin — reparații pentru sediu
export const getAllReparatiiForSediu = async (req, res) => {
  const { sediu_id } = req.query;

  if (!sediu_id) {
    return res.status(400).json({ message: 'sediu_id este obligatoriu.' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('sediu_id', sql.Int, sediu_id)
      .query(`
        SELECT r.*, u.nume AS curier_nume, f.nr_inmatriculare
        FROM reparatii r
        JOIN users u ON r.user_id = u.id
        JOIN flota f ON r.masina_id = f.id
        WHERE r.sediu_id = @sediu_id
        ORDER BY r.created_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('💥 Eroare la getAllReparatiiForSediu:', error.message);
    res.status(500).json({ message: 'Eroare server la getAllReparatiiForSediu.' });
  }
};

// ✅ Mecanic — reparații asignate
export const getReparatiiForMecanic = async (req, res) => {
  const user_id = req.user.id;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT r.*, u.name AS curier_nume, f.nr_inmatriculare
        FROM reparatii r
        JOIN users u ON r.user_id = u.id
        JOIN flota f ON r.masina_id = f.id
        WHERE r.user_id = @user_id AND r.status != 'finalizata'
        ORDER BY r.created_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('💥 Eroare la getReparatiiForMecanic:', error.message);
    res.status(500).json({ message: 'Eroare server la getReparatiiForMecanic.' });
  }
};
// 🔧 Reparatii disponibile pentru mecanici
export const getReparatiiDisponibile = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT r.*, f.nr_inmatriculare, u.name AS curier_nume
        FROM reparatii r
        JOIN flota f ON r.masina_id = f.id
        JOIN users u ON r.user_id = u.id
        WHERE r.status = 'noua'
        ORDER BY r.created_at DESC
      `);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('💥 Eroare la getReparatiiDisponibile:', error.message);
    res.status(500).json({ message: 'Eroare server la getReparatiiDisponibile.' });
  }
};
export const createReparatieByAdmin = async (req, res) => {
  const { masina_id, descriere, urgent, sediu_id } = req.body;
  const admin_id = req.user.id;

  if (!masina_id || !descriere || !sediu_id) {
    return res.status(400).json({ message: 'Mașina, descriere și sediu_id sunt obligatorii.' });
  }

  try {
    const pool = await poolPromise;

    const masina = await pool.request()
      .input('id', sql.Int, masina_id)
      .query(`SELECT nr_inmatriculare FROM flota WHERE id = @id`);
    const nr_inmatriculare = masina.recordset[0]?.nr_inmatriculare || 'Necunoscut';

    const admin = await pool.request()
      .input('id', sql.Int, admin_id)
      .query(`SELECT name FROM users WHERE id = @id`);
    const admin_nume = admin.recordset[0]?.name || 'Necunoscut';

    await pool.request()
      .input('masina_id', sql.Int, masina_id)
      .input('user_id', sql.Int, admin_id)
      .input('status', sql.NVarChar, 'noua')
      .input('descriere', sql.NVarChar, descriere)
      .input('urgent', sql.Bit, urgent ? 1 : 0)
      .input('sediu_id', sql.Int, sediu_id)
      .input('start_date', sql.DateTime, new Date())
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO reparatii 
        (masina_id, user_id, status, descriere, urgent, sediu_id, start_date, created_at)
        VALUES 
        (@masina_id, @user_id, @status, @descriere, @urgent, @sediu_id, @start_date, @created_at)
      `);

    // 🔔 Notificare către mecanici
    const mecanici = await pool.request()
      .input('sediu_id', sql.Int, sediu_id)
      .query(`SELECT id FROM users WHERE role = 'mecanic' AND sediu_id = @sediu_id`);
    for (const mecanic of mecanici.recordset) {
      await sendNotification({
        recipient_id: mecanic.id,
        sender_id: admin_id,
        type: 'reparatie_noua',
        message: `Adminul ${admin_nume} a cerut repararea mașinii ${nr_inmatriculare}.`,
      });
    }

    // 🔔 Notificare către admin
    await sendNotification({
      recipient_id: admin_id,
      sender_id: admin_id,
      type: 'reparatie_confirmare',
      message: `Cererea de reparație pentru mașina ${nr_inmatriculare} a fost trimisă.`,
    });

    res.status(201).json({ message: 'Cerere de reparație creată și notificări trimise.' });
  } catch (error) {
    console.error('💥 Eroare la creare reparație de admin:', error.message);
    res.status(500).json({ message: 'Eroare server la creare reparație.' });
  }
};


// ✅ Cereri acceptate pentru mecanic
// ✅ Cereri acceptate pentru mecanic — dropdown pentru finalizare
// ✅ Cereri acceptate pentru mecanic — corectare filtrare
// ✅ Cereri acceptate pentru mecanic
export const getAcceptedRepairsForMecanic = async (req, res) => {
  const mecanic_id = req.user.id;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('user_id', sql.Int, mecanic_id)
      .query(`
        SELECT r.id, r.masina_id, r.descriere, r.status, f.nr_inmatriculare
        FROM reparatii r
        JOIN flota f ON r.masina_id = f.id
        WHERE r.status = 'acceptata' AND r.user_id = @user_id
        ORDER BY r.created_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('💥 Eroare la getAcceptedRepairsForMecanic:', error.message);
    res.status(500).json({ message: 'Eroare server la obținerea reparațiilor acceptate.' });
  }
};


