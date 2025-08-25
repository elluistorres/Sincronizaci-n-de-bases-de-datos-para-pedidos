const express = require('express');
const router = express.Router();
const path = require('path');
const { MVsync } = require('../../controllers/sqlServerdatos.js');
const { searchRecords } = require('../../controllers/searchcontroller.js');
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