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

module.exports = { touchLastSeen };
