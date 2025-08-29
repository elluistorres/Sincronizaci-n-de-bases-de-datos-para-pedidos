const express = require('express');
const router = express.Router();
const path = require('path');
const { MVsync } = require('../controllers/sqlServerdatos.js');
const { searchRecords } = require('../controllers/searchcontroller.js');
const {valesinfocontroller} = require('../controllers/valesinfocontroller.js');
// Ruta principal (http://localhost:8000/)


router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Public/index.html'));
});

// Ruta para obtener todos los registros
router.get('/status', async (req, res) => {
    const registros = await MVsync();
    res.json(registros);
});
//ruta para mostrar datos de busqueda
router.get('/search', async (req, res) => {
  try {
    const results = await searchRecords(req.query);
    res.json(results);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno'
    });
  }
});


// Vista
router.get('/valesdetalle/:vale/:filial/:docto/:serie', (req, res) => {
  res.sendFile(path.join(__dirname, '../Public/views/valesdetalle.html'));
});

// API
router.get('/api/valesdetalle/:vale/:filial/:docto/:serie', async (req, res) => {
  try {
    const { vale, filial, docto, serie } = req.params;
    const resultados = await valesinfocontroller(vale, filial, docto, serie);
    res.json({ success: true, data: resultados });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
/*
router.get('/search', async (req, res) => {
  logger.info(`[${functionName}] Iniciando proceso...`);
  try {
    // Ejecutar MVsync primero
    await MVsync();

    // Luego buscar los registros con base en el query
    const results = await searchRecords(req.query);

    res.json(results);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno'
    });
  }
}); */


module.exports = router;