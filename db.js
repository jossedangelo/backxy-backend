// db.js
// — Carga variables de entorno (.env en local; en Railway ya vienen)
require('dotenv').config();
const mysql = require('mysql2/promise');

// Pool usando las vars individuales que Railway inyecta
const pool = mysql.createPool({
  host:     process.env.MYSQLHOST,
  user:     process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port:     Number(process.env.MYSQLPORT),
});

module.exports = pool;

