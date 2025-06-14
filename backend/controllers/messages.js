const { pool } = require("../db");

/**
 * GET /api/messages
 * method: GET
 * Returns all messages in ascending order by timestamp.
 */
async function getMessages(req, res) {
  const [msgs] = await pool.query(
    `SELECT
       id,
       user_id,
       pseudo,
       content,
       timestamp,
       edited,
       parent_id
     FROM messages
     ORDER BY timestamp ASC`
  );
  return res.status(200).json(msgs);
}

/**
 * POST /api/messages
 * Headers: user-id
 * Body: { content: string, parentId?: number }
 */
async function createMessage(req, res) {
  const userId = req.headers["user-id"];
  const { content, parentId } = req.body;

  const [[user]] = await pool.execute(
    `SELECT pseudo, role
       FROM users
      WHERE user_id = ?`,
    [userId]
  );
  if (!user) {
    return res.status(401).json({ error: "Utilisateur non connecté" });
  }

  const [result] = await pool.execute(
    `INSERT INTO messages(user_id, pseudo, content, parent_id)
     VALUES(?,?,?,?)`,
    [userId, user.pseudo, content, parentId || null]
  );

  return res.status(201).json({
    id: result.insertId,
    user_id: userId,
    pseudo: user.pseudo,
    content,
    timestamp: new Date(),
    edited: false,
    parent_id: parentId || null,
  });
}

/**
 * PUT /api/messages/:id
 * Headers: user-id
 * Body: { content: string }
 */
async function editMessage(req, res) {
  const msgId = req.params.id;
  const userId = req.headers["user-id"];
  const { content } = req.body;

  const [[msg]] = await pool.execute(
    `SELECT user_id
       FROM messages
      WHERE id = ?`,
    [msgId]
  );
  if (!msg) {
    return res.status(404).json({ error: "Message introuvable" });
  }

  const [[user]] = await pool.execute(
    `SELECT role
       FROM users
      WHERE user_id = ?`,
    [userId]
  );
  if (!user) {
    return res.status(401).json({ error: "Utilisateur non connecté" });
  }

  const own = msg.user_id === userId;
  const canEditOwn = own && (user.role === "premium" || user.role === "admin");
  const canAdmin = user.role === "admin";
  if (!canEditOwn && !canAdmin) {
    return res
      .status(403)
      .json({ error: "Pas d’accès pour éditer ce message" });
  }

  await pool.execute(
    `UPDATE messages
        SET content = ?, edited = TRUE
      WHERE id = ?`,
    [content, msgId]
  );
  return res.status(200).json({ success: true });
}

/**
 * DELETE /api/messages/:id
 * Headers: user-id
 */
async function deleteMessage(req, res) {
  const msgId = req.params.id;
  const userId = req.headers["user-id"];

  const [[user]] = await pool.execute(
    `SELECT role
       FROM users
      WHERE user_id = ?`,
    [userId]
  );
  if (!user) {
    return res.status(401).json({ error: "Utilisateur non connecté" });
  }
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Seulement admin peut supprimer" });
  }

  await pool.execute(
    `DELETE FROM messages
      WHERE id = ?`,
    [msgId]
  );
  return res.status(200).json({ success: true });
}

module.exports = {
  getMessages,
  createMessage,
  editMessage,
  deleteMessage,
};
