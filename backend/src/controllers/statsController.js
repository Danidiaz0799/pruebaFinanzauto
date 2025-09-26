const UserModel = require('../database/userModel');
const GameModel = require('../database/gameModel');

class StatsController {
  static async getRecentGames(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const recentGames = await GameModel.getRecentGames(limit);

      const formattedGames = recentGames.map(game => ({
        id: game.id,
        player1: game.player1_username,
        player2: game.player2_username,
        winner: game.winner_username || 'Empate',
        duration: game.finished_at ?
          Math.round((new Date(game.finished_at) - new Date(game.created_at)) / 1000) : null,
        finishedAt: game.finished_at,
        createdAt: game.created_at
      }));

      res.status(200).json({
        success: true,
        data: formattedGames,
        count: formattedGames.length
      });
    } catch (error) {
      console.error('Error al obtener juegos recientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  static async getAdminStats(req, res) {
    try {
      const userStats = await UserModel.getGeneralStats();
      const gameStats = await GameModel.getGameStats();
      const recentGames = await GameModel.getRecentGames(5);
      const topPlayers = await UserModel.getRanking(5);

      const adminStats = {
        overview: {
          totalUsers: parseInt(userStats.total_users) || 0,
          totalGames: parseInt(gameStats.total_games) || 0,
          activeGames: parseInt(gameStats.active_games) || 0,
          finishedGames: parseInt(gameStats.finished_games) || 0,
          waitingGames: parseInt(gameStats.waiting_games) || 0
        },
        gameStats: {
          totalGames: parseInt(gameStats.total_games) || 0,
          finishedGames: parseInt(gameStats.finished_games) || 0,
          activeGames: parseInt(gameStats.active_games) || 0,
          waitingGames: parseInt(gameStats.waiting_games) || 0,
          gamesWithWinner: parseInt(gameStats.games_with_winner) || 0,
          draws: parseInt(gameStats.draws) || 0,
          winRate: gameStats.finished_games > 0 ?
            Math.round((gameStats.games_with_winner / gameStats.finished_games) * 100) : 0
        },
        recentActivity: recentGames.map(game => ({
          id: game.id,
          players: `${game.player1_username} vs ${game.player2_username}`,
          winner: game.winner_username || 'Empate',
          duration: game.finished_at ?
            Math.round((new Date(game.finished_at) - new Date(game.created_at)) / 1000) : null,
          finishedAt: game.finished_at
        })),
        topPlayers: topPlayers.map((player, index) => ({
          position: index + 1,
          username: player.username,
          wins: player.wins,
          losses: player.losses,
          winRate: player.win_rate
        })),
        timestamp: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: adminStats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas administrativas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = StatsController;