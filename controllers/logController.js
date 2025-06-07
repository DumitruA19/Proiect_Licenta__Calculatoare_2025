import { sql, poolPromise } from '../config/dbConfig.js';

// Creează un log
export const createLog = async (req, res) => {
    const { user_id, action, details } = req.body;

    try {
        const pool = await poolPromise;
        await pool
            .request()
            .input("user_id", sql.Int, user_id)
            .input("action", sql.NVarChar, action)
            .input("details", sql.NVarChar, details)
            .query(
                "INSERT INTO logs (user_id, action, details, created_at) VALUES (@user_id, @action, @details, GETDATE())"
            );

        res.status(201).json({ message: "Log creat cu succes." });
    } catch (err) {
        console.error("Error creating log:", err);
        res.status(500).json({ error: err.message });
    }
};

// Obține toate logurile
export const getAllLogs = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM logs ORDER BY created_at DESC");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("Error fetching logs:", err);
        res.status(500).json({ error: err.message });
    }
};

// Obține loguri pentru un utilizator
export const getLogsByUserId = async (req, res) => {
    const { user_id } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("user_id", sql.Int, user_id)
            .query("SELECT * FROM logs WHERE user_id = @user_id ORDER BY created_at DESC");

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("Error fetching logs by user ID:", err);
        res.status(500).json({ error: err.message });
    }
};

// Șterge logurile mai vechi de o anumită perioadă (ex: 60 de zile)
export const deleteOldLogs = async (req, res) => {
    const { days } = req.params;

    try {
        const pool = await poolPromise;
        await pool
            .request()
            .input("days", sql.Int, days)
            .query(
                "DELETE FROM logs WHERE created_at < DATEADD(DAY, -@days, GETDATE())"
            );

        res.status(200).json({ message: `Logurile mai vechi de ${days} zile au fost șterse.` });
    } catch (err) {
        console.error("Error deleting old logs:", err);
        res.status(500).json({ error: err.message });
    }
};

// Adaugă un log
export const addLog = async (userId, action, details) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input("user_id", sql.Int, userId)
            .input("action", sql.NVarChar, action)
            .input("details", sql.NVarChar, details)
            .query("INSERT INTO logs (user_id, action, details, created_at) VALUES (@user_id, @action, @details, GETDATE())");
    } catch (error) {
        console.error("Error adding log:", error);
    }
};