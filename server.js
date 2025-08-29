const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const logger = require('./logger');

// Middlewares
app.use(cors());
// Middlewares (corregido)
app.use(express.static(path.join(__dirname, 'Public'))); // Solo la carpeta Public

logger.info("servidor corriendo");

// Routers
const viewsRouter = require('./routes/index');
//const apiRouter = require('./Public/routes/index.js');

app.use('/', viewsRouter);       // Rutas de vistas (HTML)
//app.use('/api', apiRouter);     // Rutas de API (BD)

// Iniciar servidor
app.listen(8000, () => {
  console.log('Servidor en http://localhost:8000');
});