const logger = require('../logger');
const functionName = 'Buscar registros';
//funcion secundaria inserción
const { Estatustlmkw, Op } = require('../models/mysqlwork');
const { sequelize } = require('../dbconections/db');



async function searchRecords(filters) {
  logger.info(`[${functionName}] Iniciando proceso...`);
  const { docto, serie, fecha1, fecha2 } = filters;
  
  // Validación backend
  if (!serie) {
    return res.status(400).json({
      success: false,
      message: 'El campo Serie es obligatorio'
    });
  }
  if (!fecha1 && !fecha2) {
    throw new Error('Al menos una fecha debe ser proporcionada');
  }

 // Construcción dinámica del WHERE
const whereClause = { 
  serie,
  numbor: { [Op.ne]: '' } // <<--- Condición añadida aquí
};


if (docto) {
  whereClause.docto = docto;
}

  const formatearFecha = (fecha) => fecha.replaceAll('-', '');

if (fecha1 && fecha2) {
  whereClause.emision = {
    [Op.between]: [formatearFecha(fecha1), formatearFecha(fecha2)]
  };
} else if (fecha1) {
  whereClause.emision = {
    [Op.gte]: formatearFecha(fecha1)
  };
} else if (fecha2) {
  whereClause.emision = {
    [Op.lte]: formatearFecha(fecha2)
  };
}


  try {
    const results = await Estatustlmkw.findAll({
      where: whereClause,
      order: [['emision', 'DESC']]
    });
    
    //Agrupacion por columnas
    const agrupados = results.reduce((acc, registro) => {
      const clave = `${registro.numbor || 'null'}|${registro.docto || 'null'}`;
      if (!acc[clave]) acc[clave] = [];
      acc[clave].push(registro);
      return acc;
    }, {});
    const filtrados = [];

    for (const clave in agrupados) {
      const grupo = agrupados[clave];
    
      // Prioriza el que tiene statusEntrega con valor
      const conEntrega = grupo.find(r => r.statusEntrega && r.statusEntrega.trim() !== '');
    
      // Si no hay con valor, toma el primero que esté vacío
      filtrados.push(conEntrega || grupo.find(r => !r.statusEntrega || r.statusEntrega.trim() === ''));
    }

     // Enriquecer con datos de tabla VALES
     const resultadosFinales = [];

     for (const registroSequelize of filtrados) {
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
      type: sequelize.QueryTypes.SELECT
    });


    registro.statusGeneral = estatus?.statusGeneral || null;
//CONSULTA DE VALES
        const vales = await sequelize.query(`
          SELECT VAL_NUMERO, VAL_STATUS 
          FROM VALES 
          WHERE VAL_DOCORIGINAL = :docto 
            AND VAL_SERIEORIGINAL = :serie 
            AND VAL_STATUS IN ('A','P') AND VAL_BORRADO <> '*'
        `, {
          replacements: {
            docto: registro.docto,
            serie: registro.serie
          },
          type: sequelize.QueryTypes.SELECT
        });
       // console.log(vales) 
    
        registro.valesPendientes = vales.length > 0
          ? vales.map(v => v.VAL_NUMERO).join(', ')
          : null;
    
        registro.statusVale = vales.length > 0
          ? vales.map(v => v.VAL_STATUS).join(', ')
          : null;
    
        resultadosFinales.push(registro);
    
      } catch (err) {
        logger.warn(`Error al consultar VALES para ${registro.docto}-${registro.serie}:`, err);
        registro.valesPendientes = null;
        registro.statusVale = null;
        resultadosFinales.push(registro);
      }
    }
     // ✅ Este es el único return necesario
     return resultadosFinales;
        
   } catch (error) {
    logger.error(`[${functionName}] Error al buscar registros:`, error);
    throw error;
  }
}

module.exports = { searchRecords };