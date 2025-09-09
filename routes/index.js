const express = require('express');
const router = express.Router();
const path = require('path');
const { MVsync } = require('../controllers/sqlServerdatos.js');
const { searchRecords } = require('../controllers/searchcontroller.js');
const { valesinfocontroller } = require('../controllers/valesinfocontroller.js');

// Ruta principal (http://localhost:8000/)
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Public/index.html'));
});

// Ruta para obtener todos los registros
router.get('/sync', async (req, res) => {
    try {
        const registros = await MVsync();
        res.json(registros);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al sincronizar registros'
        });
    }
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


// Ruta para mostrar datos de búsqueda
/*
router.get('/search', async (req, res) => {
    try {
        await MVsync();
        const results = await searchRecords(req.query);
        res.json(results);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno'
        });
    }
});*/

// API para obtener detalle de vales
router.get('/api/valesdetalle/:vale/:filial/:docto/:serie', async (req, res) => {
    try {
        const { vale, filial, docto, serie } = req.params;
        
        // Validar que los parámetros no estén vacíos
        if (!vale || !filial || !docto || !serie) {
            return res.status(400).json({ 
                success: false, 
                message: 'Parámetros incompletos o vacíos',
                details: { vale, filial, docto, serie }
            });
        }

        const resultados = await valesinfocontroller(vale, filial, docto, serie); 

        // Validar que los resultados sean un array
        if (!Array.isArray(resultados)) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error en el formato de respuesta del servidor',
                data: resultados
            });
        }

        res.json({ 
            success: true, 
            data: resultados,
            count: resultados.length 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message,
            // Solo mostrar el stack en un entorno de desarrollo para depuración
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
});

module.exports = router;

