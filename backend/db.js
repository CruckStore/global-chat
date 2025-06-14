const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "83.150.218.42",
  user: "u59_a2NPypgFzB",
  password: "!IgJqHIOj.C2l6++AVOYX^kc",
  database: "s59_messagerie",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = { pool };
