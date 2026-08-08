const { sequelize, Encuesta, Comunidad, Familia, Socioeconomico, Cultivo, Animal } = require('../models');

// Guardar encuesta completa (crear o actualizar) con foto
const saveSurvey = async (req, res) => {
  let transaction;
  try {
    // Verificar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({ message: 'La foto es obligatoria' });
    }
    const foto_ruta = `/uploads/${req.file.filename}`;
    
    // Parsear datos del campo 'datos' (JSON string)
    let datos;
    try {
      datos = JSON.parse(req.body.datos);
    } catch (e) {
      return res.status(400).json({ message: 'Formato de datos inválido' });
    }

    transaction = await sequelize.transaction();

    const {
      id,           // Si existe, actualizar; si no, crear
      estado,
      paso_actual,
      comunidad,
      familia,
      socioeconomico,
      cultivos,
      animales
    } = datos;

    const usuario_id = req.user.id; // Del token JWT

    let encuesta;
    if (id) {
      encuesta = await Encuesta.findByPk(id, { transaction });
      if (!encuesta) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Encuesta no encontrada' });
      }
      // Actualizar (la foto_ruta se reemplaza si se subió nueva)
      await encuesta.update({
        estado: estado || encuesta.estado,
        paso_actual: paso_actual !== undefined ? paso_actual : encuesta.paso_actual,
        foto_ruta,
        fecha_completado: estado === 'completa' ? new Date() : encuesta.fecha_completado
      }, { transaction });
    } else {
      encuesta = await Encuesta.create({
        usuario_id,
        estado: estado || 'borrador',
        paso_actual: paso_actual || 0,
        foto_ruta,
        fecha_completado: estado === 'completa' ? new Date() : null
      }, { transaction });
    }

    const encuestaId = encuesta.id;

    // Comunidad (1:1)
    if (comunidad) {
      const comunidadData = {
        encuesta_id: encuestaId,
        nombre: comunidad.nombre,
        parroquia: comunidad.parroquia,
        canton: comunidad.canton,
        referencia_ubicacion: comunidad.referencia_ubicacion,
        geom: (comunidad.lat && comunidad.lng) ? 
          { type: 'Point', coordinates: [comunidad.lng, comunidad.lat] } : 
          comunidad.geom || null
      };
      await Comunidad.upsert(comunidadData, { transaction });
    }

    // Familia (1:1)
    if (familia) {
      await Familia.upsert({ ...familia, encuesta_id: encuestaId }, { transaction });
    }

    // Socioeconomico (1:1)
    if (socioeconomico) {
      await Socioeconomico.upsert({ ...socioeconomico, encuesta_id: encuestaId }, { transaction });
    }

    // Cultivos (1:N) – reemplazar
    if (cultivos && Array.isArray(cultivos)) {
      await Cultivo.destroy({ where: { encuesta_id: encuestaId }, transaction });
      if (cultivos.length > 0) {
        const cultivosConId = cultivos.map(c => ({ ...c, encuesta_id: encuestaId }));
        await Cultivo.bulkCreate(cultivosConId, { transaction });
      }
    }

    // Animales (1:N) – reemplazar
    if (animales && Array.isArray(animales)) {
      await Animal.destroy({ where: { encuesta_id: encuestaId }, transaction });
      if (animales.length > 0) {
        const animalesConId = animales.map(a => ({ ...a, encuesta_id: encuestaId }));
        await Animal.bulkCreate(animalesConId, { transaction });
      }
    }

    await transaction.commit();
    res.status(200).json({ message: 'Encuesta guardada correctamente', id: encuestaId });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error al guardar la encuesta', error: error.message });
  }
};

// Obtener encuesta por ID (con todos sus datos)
const getSurveyById = async (req, res) => {
  try {
    const { id } = req.params;
    const encuesta = await Encuesta.findByPk(id, {
      include: [
        { association: 'comunidad' },
        { association: 'familia' },
        { association: 'socioeconomico' },
        { association: 'cultivos' },
        { association: 'animales' }
      ]
    });
    if (!encuesta) {
      return res.status(404).json({ message: 'Encuesta no encontrada' });
    }
    // Verificar permisos según rol
    const { rol, id: userId, canton_asignado } = req.user;
    if (rol === 'tecnico' && encuesta.usuario_id !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta encuesta' });
    }
    if (rol === 'coordinador' && encuesta.comunidad?.canton !== canton_asignado && encuesta.usuario_id !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para ver encuestas de este cantón' });
    }
    // Convertir geom a lat/lng para frontend
    const encuestaJSON = encuesta.toJSON();
    if (encuestaJSON.comunidad && encuestaJSON.comunidad.geom) {
      const point = encuestaJSON.comunidad.geom;
      encuestaJSON.comunidad.lat = point.coordinates[1];
      encuestaJSON.comunidad.lng = point.coordinates[0];
    }
    res.json(encuestaJSON);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Listar encuestas (con filtros según rol)
/*const listSurveys = async (req, res) => {
  try {
    const { rol, id: userId, canton_asignado } = req.user;
    let whereCondition = {};
    if (rol === 'tecnico') {
      whereCondition = { usuario_id: userId };
    } else if (rol === 'coordinador' && canton_asignado) {
      // Necesitamos filtrar por cantón vía la asociación comunidad
      // Podemos usar include con where
      const encuestas = await Encuesta.findAll({
        include: [{
          association: 'comunidad',
          where: { canton: canton_asignado },
          required: true
        }],
        order: [['created_at', 'DESC']]
      });
      return res.json(encuestas);
    }
    // Admin ve todo
    const encuestas = await Encuesta.findAll({
      where: whereCondition,
      include: ['comunidad', 'usuario'],
      order: [['created_at', 'DESC']]
    });
    res.json(encuestas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
*/ 
const listSurveys = async (req, res) => {
  try {
    const { rol, id: userId, canton_asignado } = req.user;
    const { estado, canton, page = 1, limit = 10 } = req.query;

    let whereCondition = {};
    if (rol === 'tecnico') {
      whereCondition.usuario_id = userId;
    }
    if (estado && estado !== 'Todos') {
      whereCondition.estado = estado;
    }

      const include = [
      { association: 'comunidad' },
      { association: 'usuario' },
      { association: 'cultivos' },    
      { association: 'animales' }     
    ];

    if (rol === 'coordinador' && canton_asignado) {
      include[0].where = { canton: canton_asignado };
      include[0].required = true;
    } else if (canton && canton !== 'Todos') {
      include[0].where = { canton };
      include[0].required = true;
    }

    const encuestas = await Encuesta.findAndCountAll({
      where: whereCondition,
      include,
      offset: (page - 1) * parseInt(limit),
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({
      data: encuestas.rows,
      total: encuestas.count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
  // delete/survey.controller.js

const deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const encuesta = await Encuesta.findByPk(id);
    if (!encuesta) {
      return res.status(404).json({ message: 'Encuesta no encontrada' });
    }

    // Verificar permisos: solo admin o el usuario propietario
    const { rol, id: userId } = req.user;
    if (rol !== 'admin' && encuesta.usuario_id !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta encuesta' });
    }

    // Eliminar en cascada (si las relaciones tienen ON DELETE CASCADE)
    await encuesta.destroy();
    res.json({ message: 'Encuesta eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la encuesta', error: error.message });
  }
}

// Exportar la nueva función
module.exports = { saveSurvey, getSurveyById, listSurveys, deleteSurvey };


