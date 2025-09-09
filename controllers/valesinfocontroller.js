// controllers/valesinfocontroller.js
const { QueryTypes } = require('sequelize'); 
const { sequelize } = require('../dbconections/db');
const logger = require('../logger');
const functionName = 'Vales detalle';

async function valesinfocontroller(vale, filial, docto, serie) {
  logger.info(`[${functionName}] Iniciando proceso...`)

  try {
    // Verificar que los parámetros no sean undefined o null
    if (vale === undefined || filial === undefined || docto === undefined || serie === undefined) {
      throw new Error('Parámetros undefined recibidos en controller');
    }

    const params = {
      vale: String(vale).trim(),
      filial: String(filial).trim(),
      docto: String(docto).trim(),
      serie: String(serie).trim()
    };
    const query = `
      SELECT 
        A.VAL_FILIAL,
        A.VAL_NUMERO, 
        A.VAL_FECHA,
        A.VAL_SERIEORIGINAL, 
        A.VAL_DOCORIGINAL,
        B.VAD_SERIEORIGINAL,
        B.VAD_DOCORIGINAL,
        A.VAL_CONTACTO, 
        A.VAL_TELEFONO, 
        B.VAD_CODIGO, 
        B.VAD_DESCRIPCION, 
        (B.VAD_VENDIDO - B.VAD_CANTIDAD - B.VAD_ENTREGATUBERIA) - B.VAD_ENTREGAPREVIA AS PENDIENTE
      FROM VALES AS A
      INNER JOIN VALES_DETALLE AS B 
        ON A.VAL_NUMERO = B.VAD_NUMERO 
        AND A.VAL_FILIAL = B.VAD_FILIAL
        AND A.VAL_IDANO = B.VAD_IDANO
      WHERE A.VAL_STATUS = 'A' 
        AND A.VAL_NUMERO = :vale 
        AND A.VAL_FILIAL = :filial 
        AND A.VAL_SERIEORIGINAL = :serie 
        AND A.VAL_DOCORIGINAL = :docto
    `;
    
    const resultados = await sequelize.query(query, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    
    if (resultados.length === 0) {
      console.log("     CONSULTA VACÍA - Posibles causas:");
      console.log("   - No hay registros con esos parámetros");
      console.log("   - VAL_STATUS no es 'A'");
      console.log("   - No coinciden las relaciones entre tablas");
      console.log("   - Error en nombres de tablas/columnas");
    }

    return resultados;

  } catch (error) {
    console.error(`ERROR en ${functionName}:`, {
      message: error.message,
      stack: error.stack,
      original: error.original
    });
    throw error;
  }
}

module.exports = { valesinfocontroller };