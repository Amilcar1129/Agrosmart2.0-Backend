const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que la carpeta uploads existe
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const mimeExtensionMap = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/heic': '.heic',
  'image/heif': '.heif'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp_usuarioId.extension
    let ext = path.extname(file.originalname || '').toLowerCase();
    if (!ext) {
      ext = mimeExtensionMap[file.mimetype?.toLowerCase()] || '.jpg';
    }
    const userId = req.user?.id || 'anon';
    const filename = `${Date.now()}_${userId}${ext}`;
    cb(null, filename);
  }
});

// Filtro para solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic', '.heif'];
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/heic', 'image/heif'];

  const extname = path.extname(file.originalname || '').toLowerCase();
  const mimetype = (file.mimetype || '').toLowerCase();
  const isAllowedExtension = allowedExtensions.includes(extname);
  const isImageMimeType = mimetype.startsWith('image/') || allowedMimeTypes.includes(mimetype);

  if (isAllowedExtension || isImageMimeType) {
    return cb(null, true);
  }

  cb(new Error('Solo se permiten imágenes (JPG, JPEG, PNG, WEBP, GIF, BMP, HEIC, HEIF)'));
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 500 * 1024 } // 500KB máximo (el frontend comprimirá a ~90KB)
});

module.exports = upload;