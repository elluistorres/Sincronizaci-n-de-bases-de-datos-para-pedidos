const logger = require('../logger.js');
const { Estatustlmk } = require('../models'); 
const { Synctables } = require('./syncontroller.js');
const { sequelize } = require('../dbconections/db');

async function MVsync() {
  const functionName = 'MVsync'; // ✅ Declarada al inicio de la función
  logger.info(`[${functionName}] Iniciando proceso...`);
  
  const transaction = await sequelize.transaction();
  
  try {
    // 1. Obtener registros
    const registros = await Estatustlmk.findAll({ transaction });
    // Log de los primeros registros para ver fechaEntrega
registros.forEach((r, i) => {
  if (i < 5) { // solo los primeros 5 para no saturar
    console.log(`[MVsync] Registro ${i}: id=${r.id}, fechaEntrega=${r.fechaEntrega}`);
  }
});
    if (registros.length === 0) {
      logger.info(`[${functionName}] No hay datos por sincronizar.`);
      await transaction.commit();
      return { success: true, message: "No había datos para sincronizar", count: 0 };
    }

    // 2. Sincronizar
    const resultadoInsercion = await Synctables(registros);
    logger.info(`[${functionName}] Insertados ${resultadoInsercion.insertedCount} registros en destino`);

    // 3. Borrar origen
 // Borrado por lotes (FIX: Declaración correcta de ids)
 const ids = registros.map(r => {
  if (!r.id) {
    logger.warn(`Registro sin ID: ${JSON.stringify(r)}`);
  }
  return r.id;
}).filter(id => id !== undefined); // Filtra IDs no definidos

const batchSize = 1000;
let totalborrado = 0;

for (let i = 0; i < ids.length; i += batchSize) {
  const batch = ids.slice(i, i + batchSize);
  const conteoborrado = await Estatustlmk.destroy({
    where: { id: batch },
    transaction
  });
  totalborrado += conteoborrado;
  logger.info(`[${functionName}] Lote ${Math.floor(i/batchSize) + 1}: ${conteoborrado} borrados`);
}

logger.info(`[${functionName}] Total borrados: ${totalborrado}/${registros.length}`);

logger.info(`[${functionName}] Proceso finalizado! :)`)

    await transaction.commit();
    return {
      success: true,
      message: "Datos sincronizados exitosamente",
      count: registros.length,
      insertedCount: resultadoInsercion.insertedCount,
      deletedCount: totalborrado,
      registros
    };
    
  } catch (error) {
    await transaction.rollback();
    logger.error(`[${functionName}] Error crítico: ${error.message}`);
    throw {
      success: false,
      message: "Error durante la sincronización",
      error: error.message
    };
  }
  
}

module.exports = { MVsync };