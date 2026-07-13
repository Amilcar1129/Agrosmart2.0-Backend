const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Animal = sequelize.define('Animal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  encuesta_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING(100), allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  sistema_produccion: DataTypes.STRING(50),
  vacunado: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'animales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Animal;
