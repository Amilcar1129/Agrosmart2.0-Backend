const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Cultivo = sequelize.define('Cultivo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  encuesta_id: { type: DataTypes.INTEGER, allowNull: false },
  nombre_cultivo: { type: DataTypes.STRING(100), allowNull: false },
  area_ha: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  rendimiento_estimado: DataTypes.DECIMAL(10,2),
  geom: { type: DataTypes.GEOMETRY('POLYGON', 4326), allowNull: true }
}, {
  tableName: 'cultivos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Cultivo;