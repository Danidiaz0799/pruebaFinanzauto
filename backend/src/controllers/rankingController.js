const UserModel = require('../database/userModel');

class RankingController {
  static async getRanking(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const ranking = await UserModel.getRanking(limit);

      const formattedRanking = ranking.map((user, index) => ({
        position: index + 1,
        id: user.id,
        username: user.username,
        wins: user.wins,
        losses: user.losses,
        totalGames: user.total_games,
        winRate: user.win_rate,
        winRateFormatted: `${user.win_rate}%`
      }));

      res.status(200).json({
        success: true,
        data: formattedRanking,
        count: formattedRanking.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener ranking:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = RankingController;