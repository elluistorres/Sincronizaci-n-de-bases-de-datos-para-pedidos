// jobs/syncJob.js
const cron = require("node-cron");
const { MVsync } = require('../controllers/sqlServerdatos.js');

// Cada hora en el minuto 0
cron.schedule("0 * * * *", async () => {
  console.log("Ejecutando tarea programada de sincronización...");
  await MVsync();
});

