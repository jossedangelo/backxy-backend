const mysql = require('mysql2/promise');

// Configura la conexión usando los datos de cPanel
const pool = mysql.createPool({
  host:    '92.205.151.0',   // ← tu Shared IP, con comillas
  user:    'backxy_user',
  password:'josE5005%%%%%',
  database:'backxy_db'
});
module.exports = pool;

