const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Familia = sequelize.define('Familia', {
  encuesta_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  jefe_nombre: { type: DataTypes.STRING(200), allowNull: false },
  num_miembros: { type: DataTypes.INTEGER, validate: { min: 1 } },
  acceso_agua: { type: DataTypes.BOOLEAN, defaultValue: false },
  acceso_luz: { type: DataTypes.BOOLEAN, defaultValue: false },
  acceso_internet: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'familias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Familia;
