const logger = require('../logger');
const functionName = 'Buscar registros';
//funcion secundaria inserción
const { Estatustlmkw, Op } = require('../models/mysqlwork');


logger.info(`[${functionName}] Iniciando proceso...`);
async function searchRecords(filters) {
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
    return filtrados;
        
   } catch (error) {
    logger.error(`[${functionName}] Error al buscar registros:`, error);
    throw error;
  }
}

module.exports = { searchRecords };