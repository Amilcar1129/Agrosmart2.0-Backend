// controllers/admin.controller.js
const { sequelize } = require('../models');
const path = require('path');
const fs = require('fs');

const uploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Debe subir una imagen' });
    }

    const { titulo, descripcion, categoria, destacada } = req.body;
    const imagen_url = `/uploads/galeria/${req.file.filename}`;

    const [result] = await sequelize.query(`
      INSERT INTO galeria_imagenes 
        (titulo, descripcion, imagen_url, categoria, destacada)
      VALUES 
        (:titulo, :descripcion, :imagen_url, :categoria, :destacada)
      RETURNING id
    `, {
      replacements: {
        titulo: titulo || null,
        descripcion: descripcion || null,
        imagen_url,
        categoria: categoria || 'general',
        destacada: destacada === 'true' ? true : false
      }
    });

    res.status(201).json({ 
      message: 'Imagen subida correctamente', 
      id: result[0].id,
      imagen_url 
    });
  } catch (error) {
    console.error(error);
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'galeria', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({ message: 'Error al subir imagen', error: error.message });
  }
};

const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await sequelize.query(`
      SELECT imagen_url FROM galeria_imagenes WHERE id = :id
    `, { replacements: { id } });

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    const imagenPath = path.join(__dirname, '..', rows[0].imagen_url);
    await sequelize.query(`DELETE FROM galeria_imagenes WHERE id = :id`, { replacements: { id } });

    if (fs.existsSync(imagenPath)) {
      fs.unlinkSync(imagenPath);
    }

    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar imagen', error: error.message });
  }
};

module.exports = { uploadGalleryImage, deleteGalleryImage };