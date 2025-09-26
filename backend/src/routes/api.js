const express = require('express');
const router = express.Router();

const statsController = require('../controllers/statsController');
const rankingController = require('../controllers/rankingController');

router.get('/stats/admin', statsController.getAdminStats);
router.get('/ranking', rankingController.getRanking);
router.get('/recent-games', statsController.getRecentGames);

module.exports = router;