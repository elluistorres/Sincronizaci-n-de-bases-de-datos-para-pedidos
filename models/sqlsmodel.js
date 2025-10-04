const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbconections/db');


 const Estatustlmk = sequelize.define("estatustlmk", {
      filial: {
        type: DataTypes.STRING(2),
        allowNull: true,  // Permitimos nulos
    },
    pedido: {
      type: DataTypes.STRING(20),
      allowNull: true,
      
    },
    docto: {
        type: DataTypes.STRING(30),
        allowNull: true,
        
      },
      serie: {
        type: DataTypes.STRING(4),
        allowNull: true,
        
      },

      emision: {
        type: DataTypes.STRING(20),
        allowNull: true,
        
      },
      cliente: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: true,
        
      },
      numbor: {
        type: DataTypes.STRING(10),
        allowNull: true,
        
      },
      chofer: {
        type: DataTypes.STRING(50),
        allowNull: true,
        
      },
      statusbor: {
        type: DataTypes.STRING(50),
        allowNull: true,
        
      },
      statusEntrega: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      fechaEntrega: {
        type: DataTypes.STRING(20),
        allowNull: true,
        
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
 },
    {
      tableName: 'estatustlmk',
      timestamps: false
    })
  
    
    module.exports = Estatustlmk;
 