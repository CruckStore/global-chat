require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: "83.150.218.42",
    user: "u59_a2NPypgFzB",
    password: "!IgJqHIOj.C2l6++AVOYX^kc",
    database: "s59_messagerie",
  });
  const [[row]] = await conn.execute(
    `SELECT user_id, role FROM users WHERE pseudo = ?`,
    ['gtol']
  );
  if (!row) {
    console.error('Aucun utilisateur trouvé pour ce pseudo.');
  } else {
    console.log('Copiez ce JSON dans votre console navigateur :');
    console.log(JSON.stringify({
      userId: row.user_id,
      pseudo: 'gtol',
      role:   row.role
    }));
  }
  await conn.end();
})();
