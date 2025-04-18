// db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

// pool a partir de la URL completa de conexión
const pool = mysql.createPool(process.env.MYSQL_URL);

module.exports = pool;

