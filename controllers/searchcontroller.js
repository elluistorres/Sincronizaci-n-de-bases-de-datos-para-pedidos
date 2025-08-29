const logger = require('../logger');
const functionName = 'Buscar registros';

// Modelos y conexión
const { Estatustlmkw, Op } = require('../models/mysqlwork');
const { QueryTypes } = require('sequelize'); 
const { sequelize } = require('../dbconections/db');

async function searchRecords(filters) {
  logger.info(`[${functionName}] Iniciando proceso...`);
  const { docto, serie, fecha1, fecha2 } = filters;
  
  logger.info(`[${functionName}] Validación de campos`);
  if (!serie) {
    throw new Error('El campo Serie es obligatorio');
  }
  if (!fecha1 && !fecha2) {
    throw new Error('Al menos una fecha debe ser proporcionada');
  }

  logger.info(`[${functionName}] Construcción dinámica del WHERE`);
  const whereClause = { 
    serie,
    numbor: { [Op.ne]: '' }
  };

  if (docto) {
    whereClause.docto = docto;
  }

  logger.info(`[${functionName}] Formateo de fecha.`);
  const formatearFecha = (fecha) => fecha.replaceAll('-', '');

  if (fecha1 && fecha2) {
    whereClause.emision = { [Op.between]: [formatearFecha(fecha1), formatearFecha(fecha2)] };
  } else if (fecha1) {
    whereClause.emision = { [Op.gte]: formatearFecha(fecha1) };
  } else if (fecha2) {
    whereClause.emision = { [Op.lte]: formatearFecha(fecha2) };
  }

  logger.info(`[${functionName}] Funcion de busqueda.`);
  try {
    const results = await Estatustlmkw.findAll({
      where: whereClause,
      order: [['emision', 'DESC']]
    });

    const resultadosFinales = [];

    logger.info(`[${functionName}] Selección de status por medio de casos.`);

    for (const registroSequelize of results) {
      const registro = registroSequelize.get({ plain: true });

      try {
        // ✅ Consulta única con CASE
        const [estatus] = await sequelize.query(`
          SELECT 
            CASE
              WHEN EXISTS (
                SELECT 1 
                FROM SD2010 
                WHERE D2_SERIE = :serie 
                  AND D2_DOC = :docto
              ) THEN 'VENTA REALIZADA'
              WHEN EXISTS (
                SELECT 1 
                FROM SEA010 
                WHERE EA_PREFIXO = :serie 
                  AND EA_NUM = :docto 
                  AND EA_NUMBOR = :numbor
              ) THEN 'EN PROCESO DE ENTREGA'
              WHEN EXISTS (
                SELECT 1 
                FROM OF_BORDERO 
                WHERE NUMBOR = :numbor
              ) THEN 'ENTREGADO'
              ELSE NULL
            END AS statusGeneral
        `, {
          replacements: { 
            serie: registro.serie, 
            docto: registro.docto, 
            numbor: registro.numbor 
          },
          type: QueryTypes.SELECT
        });


        registro.statusGeneral = estatus?.statusGeneral || null;


        // ✅ Consulta de VALES
        const vales = await sequelize.query(`
          SELECT VAL_NUMERO, VAL_STATUS 
          FROM VALES 
          WHERE VAL_DOCORIGINAL = :docto 
            AND VAL_SERIEORIGINAL = :serie 
            AND VAL_STATUS IN ('A','P') 
            AND VAL_BORRADO <> '*'
        `, {
          replacements: {
            docto: registro.docto,
            serie: registro.serie
          },
          type: QueryTypes.SELECT
        });
    
registro.valesPendientes = vales.map(v => v.VAL_NUMERO);
registro.statusVale = vales.map(v => v.VAL_STATUS);


        resultadosFinales.push(registro);
      } catch (err) {
        logger.warn(`Error al consultar VALES para ${registro.docto}-${registro.serie}: ${err.message}`);
        registro.valesPendientes = null;
        registro.statusVale = null;
        resultadosFinales.push(registro);
      }
    }
logger.info(`[${functionName}] Vales obtenidos`);
logger.info(`[${functionName}] Función finalizada.`);
    return resultadosFinales;
        
  } catch (error) {
    logger.error(`[${functionName}] Error al buscar registros: ${error.message}`);
    throw error;
  }
}

module.exports = { searchRecords };
