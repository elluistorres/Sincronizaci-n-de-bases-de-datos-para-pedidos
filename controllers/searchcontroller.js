const logger = require('../logger');
const functionName = 'Buscar registros';

// Modelos y conexión
const { Estatustlmkw, Op } = require('../models/mysqlwork');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../dbconections/db');

async function searchRecords(filters) {
    logger.info(`[${functionName}] Iniciando proceso...`);
    const { docto, serie, fecha1, fecha2 } = filters;

    // Lógica de Validación Mejorada
    logger.info(`[${functionName}] Validación de campos`);

    if (!serie) {
        throw new Error('Debe proporcionar un número de Serie.');
    }

    if (!docto && (!fecha1 && !fecha2)) {
        throw new Error('Para buscar por Serie sin folio, debe seleccionar un rango de fechas.');
    }

    // Construcción Dinámica del WHERE
    logger.info(`[${functionName}] Construcción dinámica del WHERE`);
    let whereClause = {};

    whereClause.serie = serie;

    if (docto) {
        whereClause.docto = docto;
    } else {

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

        // NOTA: Manejamos los duplicados manualmente.
        queryOptions.attributes = [
            'id', 'filial', 'pedido', 'docto', 'serie', 'emision', 'cliente', 'numbor',
            'chofer', 'statusEntrega', 'statusbor', 'status', 'fechaEntrega'
        ];

        const results = await Estatustlmkw.findAll(queryOptions);

        // Lógica para filtrar y obtener solo el registro más reciente
        const resultadosUnicos = {};

        results.forEach(registroSequelize => {
            const registro = registroSequelize.get({ plain: true });
            const claveUnica = `${registro.serie}-${registro.docto}-${registro.numbor}`;

            // Si no existe la clave, o si el ID del nuevo registro es mayor, lo guarda
            if (!resultadosUnicos[claveUnica] || registro.id > resultadosUnicos[claveUnica].id) {
                resultadosUnicos[claveUnica] = registro;
            }
        });

        // Convertir el objeto de resultados únicos a un array
        const registrosFiltrados = Object.values(resultadosUnicos);
        const resultadosFinales = await Promise.all(
            registrosFiltrados.map(async (registro) => {
                try {
                    const [estatus, vales] = await Promise.all([
                        sequelize.query(`
                            SELECT CASE
                            WHEN EXISTS(
                            SELECT 1 FROM VALES WHERE VAL_DOCORIGINAL = :docto
                                AND VAL_SERIEORIGINAL = :serie
                                AND VAL_STATUS IN ('A')
                                AND VAL_BORRADO <> '*' ) THEN 'PARCIALMENTE ENTREGADO'
                            WHEN EXISTS (
                                SELECT 1 FROM OF_BORDERO b INNER JOIN 
                            SEA010 c ON b.NUMBOR = c.EA_NUMBOR AND c.D_E_L_E_T_ <> '*' WHERE b.NUMBOR = :numbor
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