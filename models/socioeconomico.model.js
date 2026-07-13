const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Socioeconomico = sequelize.define('Socioeconomico', {
  encuesta_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  ingreso_mensual: DataTypes.DECIMAL(10,2),
  fuentes_ingreso: DataTypes.TEXT,
  acceso_credito: { type: DataTypes.BOOLEAN, defaultValue: false },
  asistencia_tecnica: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'socioeconomico',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Socioeconomico;