const { Sequelize } = require('sequelize');
require('dotenv').config();
const logger = require('../logger.js');
const functionName = 'conexión a SQLSERVER';

logger.info(`[${functionName}] iniciando...`);

// Configuración de Sequelize para SQL Server
let sequelize;
try {
  sequelize = new Sequelize(
    process.env.SQLSBD,      // Nombre de la base de datos
    process.env.SQLSUSER,    // Usuario
    process.env.SQLSPASS,    // Contraseña
    {
      host: process.env.SQLSHOST,
      dialect: 'mssql',
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: false,
        },
      },
      logging: false,
    }
  );
  logger.info(`[${functionName}] Configuración exitosa.`);
} catch (error) {
  logger.error(`[${functionName}] Error al configurar Sequelize: ${error.message}`);
  throw error;
}

const functionName2 = 'conexión a MYSQLWORBENCH';

// CONEXION MYSQL WOPRKBENCH
logger.info(`[${functionName2}] iniciando...`);
let sequelizesqlw;
try {
  sequelizesqlw = new Sequelize(
    process.env.SQLWBD,      // Nombre de la base de datos
    process.env.SQLWUSER,    // Usuario
    process.env.SQLWPASS,    // Contraseña
    {
      host: process.env.SQLWHOST,
      port: parseInt(process.env.SQLWPORT, 10), // Asegúrate de que sea número
      dialect: 'mysql',
      logging: false,
    }
  );
  logger.info(`[${functionName2}] Configuración exitosa.`);
} catch (error) {
  logger.error(`[${functionName2}] Error al configurar Sequelize: ${error.message}`);
  throw error;
}
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info(`[${functionName}] Conexión establecida correctamente.`);
    logger.info(`[${functionName2}] Conexión establecida correctamente.`);
  } catch (error) {
    logger.error(`[${functionName}] Error de conexión: ${error.message}`);
    logger.error(`[${functionName2}] Error de conexión: ${error.message}`);
  }
}
testConnection();
module.exports = {
  sequelize,
  sequelizesqlw
};