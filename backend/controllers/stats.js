const { pool } = require("../db");

/**
 * GET /api/stats
 * rest { online: number, total: number }
 */
async function getStats(req, res) {
  const [[{ cnt: total }]] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM users`
  );

  const [[{ cnt: online }]] = await pool.query(
    `SELECT COUNT(*) AS cnt
       FROM users
      WHERE last_seen >= DATE_SUB(NOW(), INTERVAL 2 MINUTE)`
  );
  res.status(200).json({ total, online });
}

module.exports = { getStats };
