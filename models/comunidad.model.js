const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Comunidad = sequelize.define('Comunidad', {
  encuesta_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  parroquia: DataTypes.STRING(100),
  canton: DataTypes.STRING(100),
  geom: { type: DataTypes.GEOMETRY('POINT', 4326), allowNull: true },
  referencia_ubicacion: DataTypes.TEXT
}, {
  tableName: 'comunidades',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Comunidad;