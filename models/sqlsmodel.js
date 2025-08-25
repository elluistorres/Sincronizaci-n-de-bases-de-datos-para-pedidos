const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbconections/db');


 const Estatustlmk = sequelize.define("estatustlmk", {
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
      chofer: {
        type: DataTypes.STRING(50),
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
      tableName: 'estatustlmk', // nombre exacto de la tabla en SQL Server
      timestamps: false // ajusta según necesites
    })
  
    
    module.exports = Estatustlmk;
 