import { poolPromise } from '../config/dbConfig.js'; // Conexiunea la baza de date
import bcrypt from 'bcrypt'; // Pentru hashuirea parolelor
import sql from 'mssql'; // Pentru interogări SQL
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
 //import { sendNotification } from './notificariController.js'; // Notificări email/sms
import { addLog } from './logController.js'; // Logarea acțiunilor


export const getAllUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { role, sediu_id } = req.user || {}; 

    let query = `
      SELECT id, name, email, role, employee_type, sediu_id, is_active, phone, address
      FROM users
      WHERE is_active = 1
    `;

    const request = pool.request();

    if (role === 'admin_sediu') {
      query += `
        AND sediu_id = @sediu_id
        AND (
          role = 'mecanic' OR role LIKE 'angajat%'
        )
      `;
      request.input('sediu_id', sql.Int, sediu_id);
    }

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Eroare la încărcarea utilizatorilor.' });
  }
};

  

// Autentificare utilizator
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = result.recordset[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        // Răspuns trimis cu succes
        res.status(200).json({ message: 'Login successful.', token });

        // Log-ul se execută separat
        await addLog(user.id, 'User login', `User ${user.email} logged in successfully.`);
    } catch (error) {
        console.error('Error logging in:', error);

        // Asigură-te că răspunsul de eroare este trimis doar dacă nu a fost trimis deja
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error while logging in.' });
        }
    }
};


export const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            employee_type,
            sediu_id: sediuIdFromBody,
            fingerprint,
            phone,
            address
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Name, email, password și role sunt obligatorii.' });
        }

        const pool = await poolPromise;

        // Verificăm dacă email-ul există deja
        const emailCheck = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT COUNT(*) AS count FROM users WHERE email = @email');

        if (emailCheck.recordset[0].count > 0) {
            return res.status(400).json({ message: 'Email-ul este deja folosit.' });
        }

        // Hash parola
        const hashedPassword = await bcrypt.hash(password, 10);
        const userFingerprint = fingerprint || null;

        // Identificăm utilizatorul care face requestul
        if (!req.user) {
            return res.status(401).json({ message: 'Token-ul de autentificare lipsește.' });
        }

        const { id: currentUserId, role: currentUserRole } = req.user;

        let finalSediuId = null;

        if (currentUserRole === 'admin_sediu') {
            // Dacă user-ul este admin_sediu => sediu_id vine automat din user-ul logat
            const userResult = await pool.request()
                .input('id', sql.Int, currentUserId)
                .query('SELECT sediu_id FROM users WHERE id = @id');

            if (userResult.recordset.length === 0) {
                return res.status(404).json({ message: 'Utilizatorul logat nu există.' });
            }

            finalSediuId = userResult.recordset[0].sediu_id;
        } else if (currentUserRole === 'admin_general') {
            // Admin_general poate trimite explicit sediu_id
            if (!sediuIdFromBody) {
                return res.status(400).json({ message: 'Adminul general trebuie să specifice sediul pentru userul creat.' });
            }
            finalSediuId = sediuIdFromBody;
        } else {
            return res.status(403).json({ message: 'Nu ai drepturi să creezi utilizatori.' });
        }

        // Inserare user
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .input('role', sql.NVarChar, role)
            .input('employee_type', sql.NVarChar, employee_type || null)
            .input('sediu_id', sql.Int, finalSediuId)
            .input('fingerprint', sql.NVarChar, userFingerprint)
            .input('phone', sql.NVarChar, phone || null)
            .input('address', sql.NVarChar, address || null)
            .query(`
                INSERT INTO users 
                (name, email, password, role, employee_type, sediu_id, fingerprint, phone, address)
                VALUES 
                (@name, @email, @password, @role, @employee_type, @sediu_id, @fingerprint, @phone, @address)
            `);

        res.status(201).json({ message: 'User creat cu succes.' });
        await addLog(currentUserId, 'User created', `Userul ${email} a fost creat de userul ID ${currentUserId}.`);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Eroare server la crearea userului.' });
    }
};

// Actualizează un utilizator
export const updateUser = async (req, res) => {
    const { id } = req.params; // Preia ID-ul din URL
    const { name, email, role, employee_type, sediu_id, is_active, phone, address } = req.body; // Preia datele din body

    if (!id) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name || null)
            .input('email', sql.NVarChar, email || null)
            .input('role', sql.NVarChar, role || null)
            .input('employee_type', sql.NVarChar, employee_type || null)
            .input('sediu_id', sql.Int, sediu_id || null)
            .input('is_active', sql.Bit, is_active !== undefined ? is_active : null)
            .input('phone', sql.NVarChar, phone || null)
            .input('address', sql.NVarChar, address || null)

            .query(`
                UPDATE users
                SET name = ISNULL(@name, name),
                    email = ISNULL(@email, email),
                    role = ISNULL(@role, role),
                    employee_type = ISNULL(@employee_type, employee_type),
                    sediu_id = ISNULL(@sediu_id, sediu_id),
                    is_active = ISNULL(@is_active, is_active),
                    phone = ISNULL(@phone, phone),
                    address = ISNULL(@address, address)
                WHERE id = @id
            `);

        res.status(200).json({ message: 'User updated successfully.' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error while updating user.' });
    }
};

// Dezactivează un utilizator
export const deactivateUser = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .query(`
                UPDATE users
                SET is_active = 0
                WHERE id = @id
            `);

        res.status(200).json({ message: 'User deactivated successfully.' });
        await addLog(id, 'User deactivated', `User ${id} was deactivated.`);
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({ message: 'Server error while deactivating user.' });
    }
};

// Șterge un utilizator
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const pool = await poolPromise;

    // Permite ștergerea doar de către admin_general și admin_sediu (opțional)
    if (!['admin_general', 'admin_sediu'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Nu ai drepturi să ștergi utilizatori.' });
    }

    // Dacă e admin_sediu — verifică sediu_id
    if (req.user.role === 'admin_sediu') {
      const userResult = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT sediu_id FROM users WHERE id = @id');
      
      if (userResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
      }

      if (userResult.recordset[0].sediu_id !== req.user.sediu_id) {
        return res.status(403).json({ message: 'Nu poți șterge utilizatori din alt sediu.' });
      }
    }

    // Șterge utilizatorul
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM users WHERE id = @id');

    console.log(`Userul cu ID ${id} a fost șters de ${req.user.name} (${req.user.email}).`);

    res.status(200).json({ message: 'Utilizator șters cu succes.' });
    await addLog(req.user.id, 'User deleted', `User ID ${id} a fost șters de ${req.user.name} (${req.user.email}).`);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user.' });
  }
};


// Resetare parolă
export const resetPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email-ul este necesar.' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', email)
            .query('SELECT * FROM users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Nu există un utilizator cu acest email.' });
        }

        // Generăm un token pentru resetarea parolei
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expirationTime = new Date(Date.now() + 3600000); // Token valabil 1 oră

        // Stocăm tokenul în baza de date
        await pool.request()
            .input('email', email)
            .input('reset_token', resetToken)
            .input('reset_token_expiration', expirationTime)
            .query(`
                UPDATE users 
                SET reset_token = @reset_token, reset_token_expiration = @reset_token_expiration 
                WHERE email = @email
            `);

        // Configurarea transportului pentru trimiterea emailului
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Sau orice alt serviciu de email
            auth: {
                user: process.env.EMAIL_USER, // Setează user-ul din variabilele de mediu
                pass: process.env.EMAIL_PASS, // Setează parola din variabilele de mediu
            },
        });

        // Trimiterea emailului
        const resetLink = `http://localhost:5000/reset-password/${resetToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Resetare Parolă',
            html: `<p>Apasă pe linkul de mai jos pentru a-ți reseta parola:</p>
                   <a href="${resetLink}">${resetLink}</a>`,
        });

        res.status(200).json({ message: 'Email trimis cu succes pentru resetarea parolei.' });
    } catch (err) {
        console.error('Eroare la resetarea parolei:', err);
        res.status(500).json({ message: 'Eroare de server. Încercați din nou.' });
    }
};