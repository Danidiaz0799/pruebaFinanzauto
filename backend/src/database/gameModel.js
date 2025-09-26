const { pool } = require('./connection');

class GameModel {
  static async createGame(player1Id, player2Id = null) {
    try {
      const result = await pool.query(
        'INSERT INTO games (player1_id, player2_id, status) VALUES ($1, $2, $3) RETURNING *',
        [player1Id, player2Id, player2Id ? 'playing' : 'waiting']
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear juego:', error);
      throw error;
    }
  }

  static async findById(gameId) {
    try {
      const result = await pool.query(`
        SELECT
          g.*,
          u1.username as player1_username,
          u2.username as player2_username,
          uw.username as winner_username
        FROM games g
        LEFT JOIN users u1 ON g.player1_id = u1.id
        LEFT JOIN users u2 ON g.player2_id = u2.id
        LEFT JOIN users uw ON g.winner_id = uw.id
        WHERE g.id = $1
      `, [gameId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error al obtener juego:', error);
      throw error;
    }
  }

  static async findWaitingGames() {
    try {
      const result = await pool.query(`
        SELECT
          g.*,
          u1.username as player1_username
        FROM games g
        LEFT JOIN users u1 ON g.player1_id = u1.id
        WHERE g.status = 'waiting'
        ORDER BY g.created_at ASC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error al obtener juegos en espera:', error);
      throw error;
    }
  }

  static async joinGame(gameId, player2Id) {
    try {
      const result = await pool.query(
        'UPDATE games SET player2_id = $1, status = $2 WHERE id = $3 AND status = $4 RETURNING *',
        [player2Id, 'playing', gameId, 'waiting']
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error al unirse al juego:', error);
      throw error;
    }
  }

  static async updateBoard(gameId, board) {
    try {
      const result = await pool.query(
        'UPDATE games SET board = $1 WHERE id = $2 RETURNING *',
        [JSON.stringify(board), gameId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error al actualizar tablero:', error);
      throw error;
    }
  }

  static async finishGame(gameId, winnerId = null) {
    try {
      const result = await pool.query(
        'UPDATE games SET status = $1, winner_id = $2, finished_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        ['finished', winnerId, gameId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error al finalizar juego:', error);
      throw error;
    }
  }

  static async getGameStats() {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total_games,
          COUNT(CASE WHEN status = 'finished' THEN 1 END) as finished_games,
          COUNT(CASE WHEN status = 'playing' THEN 1 END) as active_games,
          COUNT(CASE WHEN status = 'waiting' THEN 1 END) as waiting_games,
          COUNT(CASE WHEN winner_id IS NOT NULL THEN 1 END) as games_with_winner,
          COUNT(CASE WHEN winner_id IS NULL AND status = 'finished' THEN 1 END) as draws
        FROM games
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Error al obtener estadísticas de juegos:', error);
      throw error;
    }
  }

  static async getRecentGames(limit = 10) {
    try {
      const result = await pool.query(`
        SELECT
          g.*,
          u1.username as player1_username,
          u2.username as player2_username,
          uw.username as winner_username
        FROM games g
        LEFT JOIN users u1 ON g.player1_id = u1.id
        LEFT JOIN users u2 ON g.player2_id = u2.id
        LEFT JOIN users uw ON g.winner_id = uw.id
        WHERE g.status = 'finished'
        ORDER BY g.finished_at DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error al obtener juegos recientes:', error);
      throw error;
    }
  }

  static async getPlayerGames(playerId, limit = 20) {
    try {
      const result = await pool.query(`
        SELECT
          g.*,
          u1.username as player1_username,
          u2.username as player2_username,
          uw.username as winner_username
        FROM games g
        LEFT JOIN users u1 ON g.player1_id = u1.id
        LEFT JOIN users u2 ON g.player2_id = u2.id
        LEFT JOIN users uw ON g.winner_id = uw.id
        WHERE (g.player1_id = $1 OR g.player2_id = $1)
        AND g.status = 'finished'
        ORDER BY g.finished_at DESC
        LIMIT $2
      `, [playerId, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error al obtener juegos del jugador:', error);
      throw error;
    }
  }
}

module.exports = GameModel;