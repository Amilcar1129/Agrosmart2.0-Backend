// config/multer-gallery.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que la carpeta uploads/galeria existe
const galleryDir = path.join(__dirname, '../uploads/galeria');
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, galleryDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: galeria-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `galeria-${uniqueSuffix}${ext}`);
  }
});

// Filtro para solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)'), false);
  }
};

// Configuración de multer
const uploadGallery = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter
});

module.exports = uploadGallery;