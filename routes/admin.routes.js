// routes/admin.routes.js
const express = require('express');
const { uploadGalleryImage, deleteGalleryImage } = require('../controllers/admin.controller.js');
const { authMiddleware } = require('../middleware/auth');
const uploadGallery = require('../config/multer-gallery');
const router = express.Router();

router.use(authMiddleware);

router.post('/gallery', uploadGallery.single('imagen'), uploadGalleryImage);
router.delete('/gallery/:id', deleteGalleryImage);

module.exports = router;