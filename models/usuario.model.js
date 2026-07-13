const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('tecnico', 'coordinador', 'admin'),
    allowNull: false,
    defaultValue: 'tecnico'
  },
  canton_asignado: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  comunidad_asignada: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password_hash) {
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, 10);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password_hash')) {
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, 10);
      }
    }
  }
});

// Método de instancia para comparar contraseñas
Usuario.prototype.validarPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = Usuario;