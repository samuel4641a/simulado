// src/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // altere conforme seu ambiente
  password: '',         // altere conforme seu ambiente
  database: 'almoxarifado',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
