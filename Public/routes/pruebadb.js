const express = require('express');
const router = express.Router();
const { sqlServerConfig, mysqlConfig } = require('../dbconections/db');
const sql = require('mssql');
const mysql = require('mysql2/promise');

// Ruta para probar conexiones a BD
router.get('/test-connections', async (req, res) => {
  try {
    const sqlPool = await sql.connect(sqlServerConfig);
    await sqlPool.query('SELECT 1 + 1 AS result');
    await sqlPool.close();

    const mysqlConn = await mysql.createConnection(mysqlConfig);
    await mysqlConn.query('SELECT 1 + 1 AS result');
    await mysqlConn.end();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;