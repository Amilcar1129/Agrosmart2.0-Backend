const express = require('express');
const { saveSurvey, getSurveyById, listSurveys, deleteSurvey  } = require('../controllers/survey.controller.js');
const { authMiddleware } = require('../middleware/auth.js');
const upload = require('../config/multer.js');
const router = express.Router();

// Todas las rutas de encuestas requieren autenticación
router.use(authMiddleware);

// POST /api/survey - guardar encuesta (con foto)
router.post('/', (req, res, next) => {
  upload.single('foto')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Error al subir la imagen' });
    }
    next();
  });
}, saveSurvey);

// GET /api/survey - listar encuestas (según rol)
router.get('/', listSurveys);

// GET /api/survey/:id - obtener una encuesta
router.get('/:id', getSurveyById);

// DELETE /api/survey/:id - eliminar una encuesta
router.delete('/:id', deleteSurvey);

module.exports = router;