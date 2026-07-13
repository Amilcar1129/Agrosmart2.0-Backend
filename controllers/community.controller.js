const { sequelize } = require('../models');

// Listar comunidades dentro de un radio (km) usando ST_DWithin
const getCommunitiesWithin = async (req, res) => {
  try {
    let { lat, lng, radius } = req.query;
    
    // Validar parámetros obligatorios
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Se requieren lat y lng como parámetros' });
    }
    
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    radius = radius ? parseFloat(radius) : 5000; // radio en metros, por defecto 5km
    
    // Verificar que lat/lng sean números válidos
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'lat y lng deben ser números válidos' });
    }
    
    // Consulta espacial con SQL nativo
    const query = `
      SELECT 
        c.encuesta_id,
        c.nombre as comunidad_nombre,
        c.parroquia,
        c.canton,
        ST_AsGeoJSON(c.geom) as geojson,
        ST_Distance(
          c.geom,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
        ) as distancia_metros,
        c.referencia_ubicacion
      FROM comunidades c
      INNER JOIN encuestas e ON c.encuesta_id = e.id
      WHERE c.geom IS NOT NULL
        AND ST_DWithin(
          c.geom,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326),
          :radius
        )
      ORDER BY distancia_metros ASC
    `;
    
    // Ejecutar consulta - IMPORTANTE: No usar type SELECT para evitar problemas de desestructuración
    const results = await sequelize.query(query, {
      replacements: { lat, lng, radius },
      type: sequelize.QueryTypes.SELECT  // Esto ya retorna directamente el array de resultados
    });
    
    // results ya es un array (puede estar vacío)
    if (!Array.isArray(results)) {
      console.error('Resultados no son array:', results);
      return res.status(500).json({ message: 'Error inesperado en el formato de resultados' });
    }
    
    // Parsear geojson de string a objeto
    const comunidades = results.map(row => {
      try {
        return {
          ...row,
          geojson: row.geojson ? JSON.parse(row.geojson) : null
        };
      } catch (parseError) {
        console.error('Error parseando geojson:', parseError);
        return { ...row, geojson: null };
      }
    });
    
    res.json(comunidades);
  } catch (error) {
    console.error('Error en getCommunitiesWithin:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las comunidades (con GeoJSON)
const getAllCommunities = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.encuesta_id,
        c.nombre as comunidad_nombre,
        c.parroquia,
        c.canton,
        ST_AsGeoJSON(c.geom) as geojson,
        c.referencia_ubicacion
      FROM comunidades c
      INNER JOIN encuestas e ON c.encuesta_id = e.id
      WHERE c.geom IS NOT NULL
    `;
    const results = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    
    if (!Array.isArray(results)) {
      return res.status(500).json({ message: 'Error en formato de resultados' });
    }
    
    const comunidades = results.map(row => ({
      ...row,
      geojson: row.geojson ? JSON.parse(row.geojson) : null
    }));
    
    res.json(comunidades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCommunitiesWithin, getAllCommunities };