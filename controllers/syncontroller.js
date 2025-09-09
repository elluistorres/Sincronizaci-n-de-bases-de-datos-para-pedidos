const logger = require('../logger');
// Debe ser así (sin llaves {} si el export es directo):
// Importa el objeto y extrae el modelo
const { Estatustlmkw } = require('../models/mysqlwork.js');
//funcion secundaria inserción
//Paso 1: Primero valido que se halla recibido el arreglo desde la funcion principal de manera correcta.

async function Synctables(registros) {
    if (!registros || !Array.isArray(registros)) {
        throw new Error('Se esperaba un array de registros');
    }
    
    const functionName = 'insertarEnOtraTabla';
    logger.info(`[${functionName}] Iniciando... ${registros.length} registros a insertar`);

    try {
        // Paso 1: Filtrado de duplicados en memoria
        const registrosUnicos = registros.filter((r, index, self) =>
            index === self.findIndex(t => t.id === r.id)
        );

        if (registrosUnicos.length < registros.length) {
            logger.warn(`[${functionName}] Se encontraron ${
                registros.length - registrosUnicos.length
            } duplicados en el lote recibido`);
        }
logger.info(`[${functionName}] Verificación de campos duplicados en base`);
        // Paso 2: Verificación en BD
        const idsUnicos = registrosUnicos.map(r => r.id);
        const existentes = await Estatustlmkw.findAll({
            attributes: ['id'],
            where: { id: idsUnicos }
        });
        const idsExistentes = existentes.map(r => r.id);
logger.info(`[${functionName}] Inserción de campos`);
        // Paso 3: Inserción (sin cambios)
        const registrosNuevos = registrosUnicos.filter(r => !idsExistentes.includes(r.id));
        let insertedCount = 0;

        for (const registro of registrosNuevos) {
            console.log(`[Synctables] Insertando id=${registro.id}, fechaEntrega=${registro.fechaEntrega}`);
            await Estatustlmkw.create({
                id: registro.id,
                filial: registro.filial,
                pedido: registro.pedido,
                docto: registro.docto,
                serie: registro.serie,
                emision: registro.emision,
                cliente: registro.cliente,
                status: registro.status,
                numbor: registro.numbor,
                chofer: registro.chofer,
                statusbor: registro.statusbor,
                statusEntrega: registro.statusEntrega,
                fechaEntrega: registro.fechaEntrega      
            });
            insertedCount++;
        }

        logger.info(`[${functionName}] Finalizado. Insertados: ${insertedCount}, Duplicados omitidos: ${
            registros.length - insertedCount
        }`);

        return { 
            success: true, 
            insertedCount,
            duplicateCount: registros.length - insertedCount
        };

    } catch (error) {
        logger.error(`[${functionName}] Error: ${error.message}`);
        throw error;
    }
}
module.exports = {
    Synctables
}