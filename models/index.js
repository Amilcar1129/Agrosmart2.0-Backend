const { sequelize } = require('../config/database.js');
const Usuario = require('./usuario.model.js');
const Encuesta = require('./encuesta.model.js');
const Comunidad = require('./comunidad.model.js');
const Familia = require('./familia.model.js');
const Socioeconomico = require('./socioeconomico.model.js');
const Cultivo = require('./cultivo.model.js');
const Animal = require('./animal.model.js');

// Relaciones
Usuario.hasMany(Encuesta, { foreignKey: 'usuario_id', as: 'encuestas', onDelete: 'CASCADE' });
Encuesta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Encuesta.hasOne(Comunidad, { foreignKey: 'encuesta_id', as: 'comunidad', onDelete: 'CASCADE' });
Encuesta.hasOne(Familia, { foreignKey: 'encuesta_id', as: 'familia', onDelete: 'CASCADE' });
Encuesta.hasOne(Socioeconomico, { foreignKey: 'encuesta_id', as: 'socioeconomico', onDelete: 'CASCADE' });
Encuesta.hasMany(Cultivo, { foreignKey: 'encuesta_id', as: 'cultivos', onDelete: 'CASCADE' });
Encuesta.hasMany(Animal, { foreignKey: 'encuesta_id', as: 'animales', onDelete: 'CASCADE' });

Comunidad.belongsTo(Encuesta, { foreignKey: 'encuesta_id' });
Familia.belongsTo(Encuesta, { foreignKey: 'encuesta_id' });
Socioeconomico.belongsTo(Encuesta, { foreignKey: 'encuesta_id' });
Cultivo.belongsTo(Encuesta, { foreignKey: 'encuesta_id' });
Animal.belongsTo(Encuesta, { foreignKey: 'encuesta_id' });

module.exports = {
  sequelize,
  Usuario,
  Encuesta,
  Comunidad,
  Familia,
  Socioeconomico,
  Cultivo,
  Animal
};