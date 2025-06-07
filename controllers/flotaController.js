import { poolPromise } from '../config/dbConfig.js';
import sql from 'mssql';
import { containerClient } from '../config/azureBlobConfig.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const upload = multer().array('images', 4);

// 🔹 Upload imagine în Azure Blob Storage
const uploadImageToBlob = async (file) => {
  const blobName = `${uuidv4()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    return `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${blobName}`;
  } catch (error) {
    console.error('Eroare la upload imagine:', error.message);
    throw new Error('Failed to upload image');
  }
};

// 🔹 Creează o mașină
export const createFlota = [
  upload,
  async (req, res) => {
    try {
      const { marca, model, nr_inmatriculare, serie_sasiu, fuel_type, status, user_id } = req.body;
      const accessories = JSON.parse(req.body.accessories || '[]');
      const sediu_id = req.user?.sediu_id;

      if (!marca || !model || !nr_inmatriculare || !serie_sasiu || !sediu_id || !fuel_type || !status) {
        return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii.' });
      }

      const pool = await poolPromise;
      const result = await pool.request()
        .input('marca', sql.NVarChar, marca)
        .input('model', sql.NVarChar, model)
        .input('nr_inmatriculare', sql.NVarChar, nr_inmatriculare)
        .input('serie_sasiu', sql.NVarChar, serie_sasiu)
        .input('sediu_id', sql.Int, sediu_id)
        .input('fuel_type', sql.NVarChar, fuel_type)
        .input('status', sql.NVarChar, status)
        .input('user_id', sql.Int, user_id || null)
        .query(`
          INSERT INTO flota (marca, model, nr_inmatriculare, serie_sasiu, sediu_id, fuel_type, status, user_id, created_at)
          OUTPUT INSERTED.id
          VALUES (@marca, @model, @nr_inmatriculare, @serie_sasiu, @sediu_id, @fuel_type, @status, @user_id, GETDATE())
        `);

      const masina_id = result.recordset[0].id;

      // 🔥 Upload images (dacă există)
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const imageUrl = await uploadImageToBlob(file);
          await pool.request()
            .input('masina_id', sql.Int, masina_id)
            .input('image_url', sql.NVarChar, imageUrl)
            .query(`
              INSERT INTO flota_img (masina_id, image_url, created_at)
              VALUES (@masina_id, @image_url, GETDATE())
            `);
        }
      }

      // 🔥 Adaugă accesoriile selectate în flota_accessories
     // 🛠️ După ce ai inserat mașina și ai obținut masina_id:
if (req.body.accessories && Array.isArray(req.body.accessories)) {
  for (const accId of req.body.accessories) {
    await pool.request()
      .input('masina_id', sql.Int, masina_id)
      .input('accessory_id', sql.Int, accId)
      .input('is_checked', sql.Bit, 1)
      .input('sediu_id', sql.Int, sediu_id)
      .query(`
        INSERT INTO flota_accessories (masina_id, accessory_id, is_checked, sediu_id)
        VALUES (@masina_id, @accessory_id, @is_checked, @sediu_id)
      `);
  }
}


      res.status(201).json({ message: 'Mașina a fost adăugată cu succes.' });
    } catch (error) {
      console.error('Eroare la crearea mașinii:', error);
      res.status(500).json({ message: 'Eroare server la adăugarea mașinii.' });
    }
  }
];


// 🔹 Obține toate mașinile filtrate
export const getFlota = async (req, res) => {
  try {
    const sediu_id = req.user?.sediu_id;
    const { user_id } = req.query;

    if (!sediu_id) {
      return res.status(400).json({ message: 'Sediu_id lipsă din token.' });
    }

    const pool = await poolPromise;

    const query = `
      SELECT f.*, 
             u.name as angajat_asignat,
             img.image_url as imagine_principala
      FROM flota f
      LEFT JOIN users u ON f.user_id = u.id
      OUTER APPLY (
        SELECT TOP 1 fi.image_url 
        FROM flota_img fi 
        WHERE fi.masina_id = f.id 
        ORDER BY fi.created_at ASC
      ) img
      WHERE f.sediu_id = @sediu_id
      ${user_id ? 'AND f.user_id = @user_id' : ''}
      ORDER BY f.created_at DESC
    `;

    const request = pool.request().input('sediu_id', sql.Int, sediu_id);
    if (user_id) request.input('user_id', sql.Int, user_id);
    const result = await request.query(query);

    for (let car of result.recordset) {
      // 🔥 Adaugă accesoriile cu id și is_checked
      const accResult = await pool.request()
        .input('masina_id', sql.Int, car.id)
        .query(`
          SELECT fa.accessory_id, a.name, fa.is_checked
          FROM flota_accessories fa
          JOIN accessories a ON fa.accessory_id = a.id
          WHERE fa.masina_id = @masina_id
        `);
      car.accessories = accResult.recordset.map(row => ({
        id: row.accessory_id,
        name: row.name,
        is_checked: row.is_checked
      }));

      // 🔥 Adaugă toate imaginile
      const imgResult = await pool.request()
        .input('masina_id', sql.Int, car.id)
        .query(`
          SELECT image_url
          FROM flota_img
          WHERE masina_id = @masina_id
          ORDER BY created_at ASC
        `);
      car.images = imgResult.recordset.map(row => row.image_url);
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Eroare la obținerea mașinilor:', err);
    res.status(500).json({ message: 'Eroare server la obținerea mașinilor.' });
  }
};


// 🔹 Actualizează o mașină
export const updateFlota = [
  upload,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        marca, 
        model, 
        nr_inmatriculare, 
        serie_sasiu, 
        fuel_type, 
        status, 
        user_id, 
        selectedAccessories 
      } = req.body;

      const pool = await poolPromise;

      // 🔹 Update mașină
      await pool.request()
        .input('id', sql.Int, id)
        .input('marca', sql.NVarChar, marca || null)
        .input('model', sql.NVarChar, model || null)
        .input('nr_inmatriculare', sql.NVarChar, nr_inmatriculare || null)
        .input('serie_sasiu', sql.NVarChar, serie_sasiu || null)
        .input('fuel_type', sql.NVarChar, fuel_type || null)
        .input('status', sql.NVarChar, status || null)
        .input('user_id', sql.Int, user_id && user_id !== '' ? parseInt(user_id) : null)
        .query(`
          UPDATE flota
          SET marca = ISNULL(@marca, marca),
              model = ISNULL(@model, model),
              nr_inmatriculare = ISNULL(@nr_inmatriculare, nr_inmatriculare),
              serie_sasiu = ISNULL(@serie_sasiu, serie_sasiu),
              fuel_type = ISNULL(@fuel_type, fuel_type),
              status = ISNULL(@status, status),
              user_id = ISNULL(@user_id, user_id)
          WHERE id = @id
        `);

      // 🔹 Update imagini (optional)
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const imageUrl = await uploadImageToBlob(file);
          await pool.request()
            .input('masina_id', sql.Int, id)
            .input('image_url', sql.NVarChar, imageUrl)
            .query(`
              INSERT INTO flota_img (masina_id, image_url, created_at)
              VALUES (@masina_id, @image_url, GETDATE())
            `);
        }
      }

      // 🔹 Update accesorii
     // 🛠️ Înainte de return:
if (req.body.accessories && Array.isArray(req.body.accessories)) {
  // Sterge vechile legături
  await pool.request()
    .input('masina_id', sql.Int, id)
    .query(`DELETE FROM flota_accessories WHERE masina_id = @masina_id`);
  
  // Adaugă noile accesorii selectate
  for (const accId of req.body.accessories) {
    await pool.request()
      .input('masina_id', sql.Int, id)
      .input('accessory_id', sql.Int, accId)
      .input('is_checked', sql.Bit, 1)
      .input('sediu_id', sql.Int, req.user.sediu_id)
      .query(`
        INSERT INTO flota_accessories (masina_id, accessory_id, is_checked, sediu_id)
        VALUES (@masina_id, @accessory_id, @is_checked, @sediu_id)
      `);
  }
}


      res.status(200).json({ message: 'Mașina a fost actualizată cu succes.' });
    } catch (error) {
      console.error('Eroare la actualizarea mașinii:', error);
      res.status(500).json({ message: 'Eroare server la actualizarea mașinii.' });
    }
  }
];


// 🔹 Șterge o mașină
export const deleteFlota = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    // 🔥 Șterge imaginile din blob storage
    const images = await pool.request()
      .input('masina_id', sql.Int, id)
      .query('SELECT image_url FROM flota_img WHERE masina_id = @masina_id');

    for (const img of images.recordset) {
      const blobName = img.image_url.split('/').pop();
      await containerClient.deleteBlob(blobName);
    }

    // 🔥 Șterge imaginile din baza de date
    await pool.request()
      .input('masina_id', sql.Int, id)
      .query('DELETE FROM flota_img WHERE masina_id = @masina_id');

    // 🔥 Șterge reparațiile (dacă nu ai ON DELETE CASCADE)
    await pool.request()
      .input('masina_id', sql.Int, id)
      .query('DELETE FROM reparatii WHERE masina_id = @masina_id');

    // 🔥 Șterge mașina
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM flota WHERE id = @id');

    res.status(200).json({ message: 'Mașina și datele asociate au fost șterse cu succes.' });
  } catch (error) {
    console.error('Eroare la ștergerea mașinii:', error);
    res.status(500).json({ message: 'Eroare server la ștergerea mașinii.' });
  }
};



// 🔹 Asignare mașină către user
export const assignCarToUser = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!id || !user_id) {
    return res.status(400).json({ message: 'ID-ul mașinii și user_id sunt necesare.' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('user_id', sql.Int, user_id)
      .query(`
        UPDATE flota
        SET user_id = @user_id
        WHERE id = @id
      `);

    res.status(200).json({ message: 'Mașina a fost asignată cu succes.' });
  } catch (error) {
    console.error('Eroare la asignarea mașinii:', error);
    res.status(500).json({ message: 'Eroare server la asignarea mașinii.' });
  }
};
// controllers/flotaController.js
// 🔹 Șterge o imagine din mașină
export const handleDeleteImage = async (req, res) => {
  try {
    const { masina_id, image_url } = req.body;

    if (!masina_id || !image_url) {
      return res.status(400).json({ message: 'masina_id și image_url sunt obligatorii.' });
    }

    // 🔹 Stergem imaginea din Azure Blob
    const blobName = image_url.split('/').pop();
    await containerClient.deleteBlob(blobName);

    // 🔹 Ștergem imaginea din baza de date
    const pool = await poolPromise;
    await pool.request()
      .input('masina_id', sql.Int, masina_id)
      .input('image_url', sql.NVarChar, image_url)
      .query(`
        DELETE FROM flota_img 
        WHERE masina_id = @masina_id AND image_url = @image_url
      `);

    res.status(200).json({ message: 'Imagine ștearsă cu succes!' });
  } catch (error) {
    console.error('Eroare la ștergerea imaginii:', error);
    res.status(500).json({ message: 'Eroare server la ștergerea imaginii.' });
  }
};
// controllers/flotaController.js

export const getFlotaAccessories = async (req, res) => {
  try {
    const { masina_id } = req.query;
    if (!masina_id) {
      return res.status(400).json({ message: 'Parametrul masina_id este necesar.' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('masina_id', sql.Int, masina_id)
      .query(`
        SELECT a.id, a.name
        FROM flota_accessories fa
        JOIN accessories a ON fa.accessory_id = a.id
        WHERE fa.masina_id = @masina_id AND fa.is_checked = 1
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Eroare la obținerea accesoriilor:', error);
    res.status(500).json({ message: 'Eroare server la obținerea accesoriilor.' });
  }
};
