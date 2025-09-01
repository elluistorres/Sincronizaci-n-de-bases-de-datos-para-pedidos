const logger = require('../logger');
const functionName = 'Buscar registros';

// Modelos y conexión
const { Estatustlmkw, Op } = require('../models/mysqlwork');
const { QueryTypes } = require('sequelize'); 
const { sequelize } = require('../dbconections/db');

async function searchRecords(filters) {
    logger.info(`[${functionName}] Iniciando proceso...`);
    const { docto, serie, numbor, fecha1, fecha2 } = filters;
    
    // --- Lógica de Validación Mejorada ---
    logger.info(`[${functionName}] Validación de campos`);
    
    // Validar que al menos uno de los campos principales de búsqueda esté presente
    if (!serie && !numbor) {
        throw new Error('Debe proporcionar un número de Serie o de Bordero.');
    }
    
    // Si se busca por Serie, las fechas son obligatorias
    if (serie && (!fecha1 && !fecha2)) {
        throw new Error('Para buscar por Serie, debe seleccionar un rango de fechas.');
    }
    
    // --- Construcción Dinámica del WHERE ---
    logger.info(`[${functionName}] Construcción dinámica del WHERE`);
    let whereClause = {};

    if (numbor) {
        whereClause.numbor = numbor;
    } 
    else if (serie) {
        whereClause.serie = serie;

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
    }

    logger.info(`[${functionName}] Funcion de busqueda.`);
try {
    let queryOptions = {
        where: whereClause,
        order: [['id', 'DESC']]
    };

    // Si se busca por Bordero o Serie/Docto, agrupamos los resultados para evitar duplicados.
    if (numbor || serie) {
        queryOptions.group = ['docto', 'serie', 'id'];
        queryOptions.attributes = [
            'id', 'filial', 'pedido', 'docto', 'serie', 'emision', 'cliente', 'numbor', 
            'chofer', 'statusEntrega', 'statusbor', 'status' // Asegúrate de incluir estas
        ];
    }
    
    const results = await Estatustlmkw.findAll(queryOptions);

    // --- Lógica de Priorización de Resultados si se busca por Bordero ---
    let resultadosAFiltrar = results;
    if (numbor) {
        logger.info(`[${functionName}] Se busca por bordero, aplicando lógica de priorización.`);
        
        // 1. Prioridad: `estatusEntrega`
        let priorizados = resultadosAFiltrar.filter(r => r.get('statusEntrega'));
        if (priorizados.length > 0) {
            resultadosAFiltrar = priorizados;
        } else {
            // 2. Prioridad: `statusbor` (si no hay `estatusEntrega`)
            priorizados = resultadosAFiltrar.filter(r => r.get('statusbor'));
            if (priorizados.length > 0) {
                resultadosAFiltrar = priorizados;
            } else {
                // 3. Última prioridad: `status` (si no hay `estatusEntrega` ni `statusbor`)
                priorizados = resultadosAFiltrar.filter(r => r.get('status'));
                if (priorizados.length > 0) {
                    resultadosAFiltrar = priorizados;
                }
            }
        }
        logger.info(`[${functionName}] ${resultadosAFiltrar.length} registros después de la priorización.`);
    }


        logger.info(`[${functionName}] Funcion de promesas con status de venta y vales pendientes`);
        // CAMBIO CRÍTICO: Usamos 'resultadosAFiltrar' en lugar de 'results'
        const resultadosFinales = await Promise.all(
            resultadosAFiltrar.map(async (registroSequelize) => {
                const registro = registroSequelize.get({ plain: true });

                try {
                    const [estatus, vales] = await Promise.all([
                        sequelize.query(`
                            SELECT CASE
                            WHEN EXISTS ( 
                                SELECT 1 FROM OF_BORDERO WHERE NUMBOR = :numbor
                            ) THEN 'ENTREGADO'
                            WHEN EXISTS (
                                SELECT 1 FROM SEA010 WHERE EA_PREFIXO = :serie AND EA_NUM = :docto AND EA_NUMBOR = :numbor
                            ) THEN 'EN PROCESO DE ENTREGA'
                            WHEN EXISTS (
                                SELECT 1 FROM SD2010 WHERE D2_SERIE = :serie AND D2_DOC = :docto
                            ) THEN 'VENTA REALIZADA'
                            ELSE NULL
                            END AS statusGeneral
                        `, {
                            replacements: { serie: registro.serie, docto: registro.docto, numbor: registro.numbor },
                            type: QueryTypes.SELECT
                        }),
                        sequelize.query(`
                            SELECT VAL_NUMERO, VAL_STATUS 
                            FROM VALES 
                            WHERE VAL_DOCORIGINAL = :docto 
                                AND VAL_SERIEORIGINAL = :serie 
                                AND VAL_STATUS IN ('A') 
                                AND VAL_BORRADO <> '*'
                        `, {
                            replacements: { docto: registro.docto, serie: registro.serie },
                            type: QueryTypes.SELECT
                        })
                    ]);
                    registro.statusGeneral = estatus[0]?.statusGeneral || null;
                    registro.valesPendientes = vales.map(v => v.VAL_NUMERO);
                    registro.statusVale = vales.map(v => v.VAL_STATUS);

                } catch (err) {
                    logger.warn(`Error en consultas para ${registro.docto}-${registro.serie}: ${err.message}`);
                    registro.statusGeneral = null;
                    registro.valesPendientes = null;
                    registro.statusVale = null;
                }
                return registro;
            })
        );

        logger.info(`[${functionName}] Vales obtenidos`);
        logger.info(`[${functionName}] Función finalizada.`);
        return resultadosFinales;

    } catch (error) {
        logger.error(`[${functionName}] Error al buscar registros: ${error.message}`);
        throw error;
    }
}

module.exports = { searchRecords };
