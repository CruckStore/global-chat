require("dotenv").config();
const { pool } = require("../db");
const { v4: uuidv4 } = require("uuid");

/**
 * POST /api/login
 * Body: { pseudo: string, userId?: string }
 */
async function login(req, res) {
  const { pseudo, userId } = req.body;

  // re connect
  if (userId) {
    const [[existing]] = await pool.execute(
      `SELECT pseudo, role
         FROM users
        WHERE user_id = ?`,
      [userId]
    );
    if (!existing) {
      return res.status(401).json({ error: "UserId inconnu" });
    }
    if (existing.pseudo !== pseudo) {
      return res
        .status(403)
        .json({ error: "Pseudo différent de l’enregistrement" });
    }
    return res.status(200).json({ userId, pseudo, role: existing.role });
  }

  // creation
  const [rows] = await pool.execute(
    `SELECT user_id
       FROM users
      WHERE pseudo = ?`,
    [pseudo]
  );
  if (rows.length > 0) {
    return res.status(409).json({ error: "Pseudo déjà pris" });
  }

  const newId = uuidv4();
  await pool.execute(
    `INSERT INTO users(user_id, pseudo)
     VALUES(?,?)`,
    [newId, pseudo]
  );
  const [[u]] = await pool.execute(
    `SELECT role
       FROM users
      WHERE user_id = ?`,
    [newId]
  );
  return res.status(201).json({ userId: newId, pseudo, role: u.role });
}

module.exports = { login };
