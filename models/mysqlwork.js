
const { DataTypes, Op } = require('sequelize'); // Importa Op desde sequelize
const { sequelizesqlw } = require('../dbconections/db');


 const Estatustlmkw = sequelizesqlw.define("estatustlmk", {
      filial: {
        type: DataTypes.STRING(2),
        allowNull: true,  // Allow null explicitly
    },
    pedido: {
      type: DataTypes.STRING(20),
      allowNull: true,  // Allow null explicitly
      
    },
    docto: {
        type: DataTypes.STRING(30),
        allowNull: true,  // Allow null explicitly
        
      },
      serie: {
        type: DataTypes.STRING(4),
        allowNull: true,  // Allow null explicitly
        
      },

      emision: {
        type: DataTypes.STRING(20),
        allowNull: true,  // Allow null explicitly
        
      },
      cliente: {
        type: DataTypes.STRING(10),
        allowNull: true,  // Allow null explicitly
        
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: true,  // Allow null explicitly
        
      },
      numbor: {
        type: DataTypes.STRING(10),
        allowNull: true,  // Allow null explicitly
        
      },
      statusbor: {
        type: DataTypes.STRING(50),
        allowNull: true,  // Allow null explicitly
        
      },
      statusEntrega: {
        type: DataTypes.STRING(30),
        allowNull: true,  // Allow null explicitly
        
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
 },
    {
      tableName: 'estatustlmk',
      timestamps: false // ajusta según necesites
    })
  
    async function testModel() {
        try {
          await Estatustlmkw.sync({ force: false, alter: true }); 
          console.log('Modelo sincronizado correctamente.');
        } catch (error) {
          console.error('Error al sincronizar el modelo:', error);
        }
      }
      
      testModel();
    
    module.exports = {Estatustlmkw, Op};
 