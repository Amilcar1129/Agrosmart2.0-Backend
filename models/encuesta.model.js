const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Encuesta = sequelize.define('Encuesta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' }
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('borrador', 'completa'),
    defaultValue: 'borrador'
  },
  paso_actual: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 4 }
  },
  fecha_completado: {
    type: DataTypes.DATE,
    allowNull: true
  },
  foto_ruta: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'encuestas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Encuesta;