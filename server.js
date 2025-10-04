const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const logger = require('./logger');

require("./cron/nodecron.js");

// Middlewares
app.use(cors());
app.use(express.static(path.join(__dirname, 'Public')));

logger.info("servidor corriendo");

// Routers
const viewsRouter = require('./routes/index');
app.use('/', viewsRouter);

// Configuración del puerto
const PORT = process.env.PORT || 9000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  logger.info(`Servidor iniciado en puerto ${PORT}`);
});