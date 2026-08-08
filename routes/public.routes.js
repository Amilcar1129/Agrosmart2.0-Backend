// routes/public.routes.js
const express = require('express');
const { getPublicStats, getGallery } = require('../controllers/public.controller.js');
const router = express.Router();

router.get('/stats', getPublicStats);
router.get('/gallery', getGallery);

module.exports = router;