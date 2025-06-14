require("dotenv").config();

const http = require("http");
const url = require("url");
const { pool } = require("./db");
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 3001;

function sendJSON(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,user-id",
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url, true);

  if (req.method === "OPTIONS") {
    return sendJSON(res, 200, {});
  }

  const body = await new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });

  if (pathname === "/api/login" && req.method === "POST") {
    const { pseudo, userId } = body;

    if (userId) {
      const [[existing]] = await pool.execute(
        `SELECT pseudo, role
           FROM users
          WHERE user_id = ?`,
        [userId]
      );
      if (!existing) {
        return sendJSON(res, 401, { error: "UserId inconnu" });
      }

      if (existing.pseudo !== pseudo) {
        return sendJSON(res, 403, {
          error: "Pseudo différent de l’enregistrement",
        });
      }
      return sendJSON(res, 200, { userId, pseudo, role: existing.role });
    }

    const [rows] = await pool.execute(
      `SELECT user_id
         FROM users
        WHERE pseudo = ?`,
      [pseudo]
    );
    if (rows.length > 0) {
      return sendJSON(res, 409, { error: "Pseudo déjà pris" });
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
    return sendJSON(res, 201, { userId: newId, pseudo, role: u.role });
  }

  if (pathname === "/api/messages" && req.method === "GET") {
    const [msgs] = await pool.query(
      `SELECT id
            , user_id
            , pseudo
            , content
            , timestamp
            , edited
            , parent_id
         FROM messages
        ORDER BY timestamp ASC`
    );
    return sendJSON(res, 200, msgs);
  }

  if (pathname === "/api/messages" && req.method === "POST") {
    const userId = req.headers["user-id"];
    const { content, parentId } = body;

    const [[user]] = await pool.execute(
      `SELECT pseudo, role
         FROM users
        WHERE user_id = ?`,
      [userId]
    );
    if (!user) {
      return sendJSON(res, 401, { error: "Utilisateur non connecté" });
    }

    const [resInsert] = await pool.execute(
      `INSERT INTO messages(user_id, pseudo, content, parent_id)
       VALUES(?,?,?,?)`,
      [userId, user.pseudo, content, parentId || null]
    );

    return sendJSON(res, 201, {
      id: resInsert.insertId,
      user_id: userId,
      pseudo: user.pseudo,
      content,
      timestamp: new Date(),
      edited: false,
      parent_id: parentId || null,
    });
  }

  {
    const editMatch = pathname.match(/^\/api\/messages\/(\d+)$/);
    if (editMatch && req.method === "PUT") {
      const msgId = editMatch[1];
      const userId = req.headers["user-id"];
      const { content } = body;

      const [[msg]] = await pool.execute(
        `SELECT user_id
           FROM messages
          WHERE id = ?`,
        [msgId]
      );
      if (!msg) {
        return sendJSON(res, 404, { error: "Message introuvable" });
      }

      const [[user]] = await pool.execute(
        `SELECT role
           FROM users
          WHERE user_id = ?`,
        [userId]
      );
      if (!user) {
        return sendJSON(res, 401, { error: "Utilisateur non connecté" });
      }

      const own = msg.user_id === userId;
      const canEditOwn =
        own && (user.role === "premium" || user.role === "admin");
      const canAdmin = user.role === "admin";

      if (!canEditOwn && !canAdmin) {
        return sendJSON(res, 403, {
          error: "Pas d’accès pour éditer ce message",
        });
      }

      await pool.execute(
        `UPDATE messages
            SET content = ?, edited = TRUE
          WHERE id = ?`,
        [content, msgId]
      );
      return sendJSON(res, 200, { success: true });
    }
  }

  {
    const delMatch = pathname.match(/^\/api\/messages\/(\d+)$/);
    if (delMatch && req.method === "DELETE") {
      const msgId = delMatch[1];
      const userId = req.headers["user-id"];

      const [[user]] = await pool.execute(
        `SELECT role
           FROM users
          WHERE user_id = ?`,
        [userId]
      );
      if (!user) {
        return sendJSON(res, 401, { error: "Utilisateur non connecté" });
      }
      if (user.role !== "admin") {
        return sendJSON(res, 403, { error: "Seulement admin peut supprimer" });
      }

      await pool.execute(
        `DELETE FROM messages
          WHERE id = ?`,
        [msgId]
      );
      return sendJSON(res, 200, { success: true });
    }
  }

  sendJSON(res, 404, { error: "Route inconnue" });
});

server.listen(PORT, () => {
  console.log(`Server écoute sur le port ${PORT}`);
});
