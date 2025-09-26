const { pool } = require('./connection');

class UserModel {
  static async findOrCreateUser(username) {
    try {
      let result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      result = await pool.query(
        'INSERT INTO users (username) VALUES ($1) RETURNING *',
        [username]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error al encontrar o crear usuario:', error);
      throw error;
    }
  }

  static async findById(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw error;
    }
  }

  static async updateStats(userId, isWin) {
    try {
      const field = isWin ? 'wins' : 'losses';
      const result = await pool.query(
        `UPDATE users SET ${field} = ${field} + 1 WHERE id = $1 RETURNING *`,
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
      throw error;
    }
  }

  static async getRanking(limit = 10) {
    try {
      const result = await pool.query(`
        SELECT
          id,
          username,
          wins,
          losses,
          (wins + losses) as total_games,
          CASE
            WHEN (wins + losses) > 0 THEN ROUND(CAST((wins::float / (wins + losses)) * 100 AS NUMERIC), 2)
            ELSE 0
          END as win_rate
        FROM users
        WHERE (wins + losses) > 0
        ORDER BY wins DESC, win_rate DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error al obtener ranking:', error);
      throw error;
    }
  }

  static async getGeneralStats() {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total_users,
          SUM(wins + losses) as total_games,
          SUM(wins) as total_wins,
          AVG(wins + losses) as avg_games_per_user
        FROM users
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      throw error;
    }
  }
}

module.exports = UserModel;