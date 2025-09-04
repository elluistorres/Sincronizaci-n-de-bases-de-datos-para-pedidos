// controllers/valesinfocontroller.js
const { QueryTypes } = require('sequelize'); 
const { sequelize } = require('../dbconections/db');

const logger = require('../logger');
const functionName = 'Vales detalle';


async function valesinfocontroller(vale, filial, docto, serie) {
  logger.info(`[${functionName}] Iniciando proceso...`);
  try {
    console.log("Parámetros recibidos en valesinfocontroller:", { vale, filial, docto, serie });

    const resultados = await sequelize.query(`
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
    `, {
      replacements: { 
        vale: String(vale), 
        filial: String(filial), 
        docto: String(docto), 
        serie: String(serie) 
      },
      type: QueryTypes.SELECT
    });

    logger.info(`[${functionName}] Resultados obtenidos`);
    return resultados;
  } catch (error) {
    console.error("❌ Error en valesinfocontroller:", error);
    throw error;
  }
}

module.exports = { valesinfocontroller};
