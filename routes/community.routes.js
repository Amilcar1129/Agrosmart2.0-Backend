const express = require('express');
const { getCommunitiesWithin, getAllCommunities } = require('../controllers/community.controller.js');
const { authMiddleware } = require('../middleware/auth.js');
const router = express.Router();

router.use(authMiddleware); // Requiere autenticación

router.get('/', getAllCommunities);
router.get('/nearby', getCommunitiesWithin);

module.exports = router;