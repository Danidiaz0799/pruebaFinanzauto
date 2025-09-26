import { useState, useEffect } from 'react'
import axios from 'axios'
import './AdminPanel.css'

const AdminPanel = ({ onBackToLobby }) => {
  const [stats, setStats] = useState(null)
  const [ranking, setRanking] = useState([])
  const [recentGames, setRecentGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      const [statsRes, rankingRes, gamesRes] = await Promise.all([
        axios.get('/api/stats/admin'),
        axios.get('/api/ranking'),
        axios.get('/api/recent-games')
      ])

      setStats(statsRes.data.data)
      setRanking(rankingRes.data.data)
      setRecentGames(gamesRes.data.data)
    } catch (error) {
      console.error('Error al cargar datos administrativos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">⏳ Cargando datos administrativos...</div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <button className="back-button" onClick={onBackToLobby}>
          ← Volver al Lobby
        </button>
        <h2>📊 Panel Administrativo</h2>
        <button className="refresh-button" onClick={fetchAdminData}>
          🔄 Actualizar
        </button>
      </div>

      <div className="admin-content">
        {/* Estadísticas Generales */}
        <div className="stats-section">
          <h3>📈 Estadísticas Generales</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.overview.totalUsers || 0}</div>
              <div className="stat-label">Usuarios Totales</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.overview.totalGames || 0}</div>
              <div className="stat-label">Juegos Totales</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.overview.activeGames || 0}</div>
              <div className="stat-label">Juegos Activos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.overview.finishedGames || 0}</div>
              <div className="stat-label">Juegos Terminados</div>
            </div>
          </div>
        </div>

        {/* Ranking de Jugadores */}
        <div className="ranking-section">
          <h3>🏆 Ranking de Jugadores</h3>
          <div className="ranking-list">
            {ranking.slice(0, 10).map((player, index) => (
              <div key={player.id} className="ranking-item">
                <div className="rank-position">#{player.position}</div>
                <div className="player-info">
                  <div className="player-name">{player.username}</div>
                  <div className="player-stats">
                    {player.wins}W - {player.losses}L ({player.winRateFormatted})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Juegos Recientes */}
        <div className="recent-games-section">
          <h3>🎮 Juegos Recientes</h3>
          <div className="games-list">
            {recentGames.slice(0, 5).map((game) => (
              <div key={game.id} className="game-item">
                <div className="game-players">
                  {game.player1} vs {game.player2}
                </div>
                <div className="game-result">
                  Ganador: {game.winner}
                </div>
                <div className="game-duration">
                  Duración: {game.duration ? `${game.duration}s` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estadísticas de Juegos */}
        <div className="game-stats-section">
          <h3>📊 Estadísticas de Juegos</h3>
          <div className="game-stats-grid">
            <div className="stat-item">
              <span className="stat-label">Juegos con Ganador:</span>
              <span className="stat-value">{stats?.gameStats.gamesWithWinner || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Empates:</span>
              <span className="stat-value">{stats?.gameStats.draws || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">% de Victorias:</span>
              <span className="stat-value">{stats?.gameStats.winRate || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
