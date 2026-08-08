// controllers/public.controller.js
const { sequelize } = require('../models');

const getPublicStats = async (req, res) => {
  try {
    const [comunidadesResult] = await sequelize.query(`
      SELECT COUNT(DISTINCT nombre) as total FROM comunidades
    `);
    const totalComunidades = parseInt(comunidadesResult[0]?.total || 0);

    const [familiasResult] = await sequelize.query(`
      SELECT COUNT(*) as total 
      FROM familias f
      INNER JOIN encuestas e ON f.encuesta_id = e.id
      WHERE e.estado = 'completa'
    `);
    const totalAgricultores = parseInt(familiasResult[0]?.total || 0);

    const [hectareasResult] = await sequelize.query(`
      SELECT SUM(c.area_ha) as total 
      FROM cultivos c
      INNER JOIN encuestas e ON c.encuesta_id = e.id
      WHERE e.estado = 'completa'
    `);
    const totalHectareas = parseFloat(hectareasResult[0]?.total || 0);

    const [cantonesResult] = await sequelize.query(`
      SELECT COUNT(DISTINCT canton) as total 
      FROM comunidades
      WHERE canton IS NOT NULL
    `);
    const totalCantones = parseInt(cantonesResult[0]?.total || 0);

    const [hectareasPorCanton] = await sequelize.query(`
      SELECT 
        c.canton,
        SUM(cu.area_ha) as total_hectareas
      FROM comunidades c
      INNER JOIN encuestas e ON c.encuesta_id = e.id
      INNER JOIN cultivos cu ON e.id = cu.encuesta_id
      WHERE e.estado = 'completa' AND c.canton IS NOT NULL
      GROUP BY c.canton
      ORDER BY total_hectareas DESC
    `);

    res.json({
      comunidades: totalComunidades,
      agricultores: totalAgricultores,
      hectareas: totalHectareas,
      cantones: totalCantones,
      hectareasPorCanton: hectareasPorCanton || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

const getGallery = async (req, res) => {
  try {
    const { categoria, destacada } = req.query;
    let where = 'activo = true';
    if (categoria) where += ` AND categoria = '${categoria}'`;
    if (destacada === 'true') where += ' AND destacada = true';

    const [imagenes] = await sequelize.query(`
      SELECT id, titulo, descripcion, imagen_url, categoria, destacada
      FROM galeria_imagenes
      WHERE ${where}
      ORDER BY orden ASC, created_at DESC
    `);
    res.json(imagenes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener galería', error: error.message });
  }
};

module.exports = { getPublicStats, getGallery };