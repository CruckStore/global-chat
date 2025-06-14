const { pool } = require("./db");

async function touchLastSeen(req, res) {
  const userId = req.headers["user-id"];
  if (userId) {
    await pool.execute(
      `UPDATE users
          SET last_seen = NOW()
        WHERE user_id = ?`,
      [userId]
    );
  }
}

async function ensureNotBanned(req, res) {
    const userId = req.headers["user-id"];
    if (userId) {
      const [[u]] = await pool.execute(
        `SELECT banned FROM users WHERE user_id = ?`,
        [userId]
      );
      if (u && u.banned) {
        sendJSON(res, 403, { error: "Vous êtes banni" });
        return false;
      }
    }
    return true;
  }
  
  if (!(await ensureNotBanned(req, res))) return;
module.exports = { touchLastSeen };
