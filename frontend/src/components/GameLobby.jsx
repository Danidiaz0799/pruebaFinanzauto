import { useState, useEffect } from 'react'
import { useSocket } from '../services/SocketContext'
import './GameLobby.css'

const GameLobby = ({ user, onStartGame, onBackToLogin }) => {
  const [availableRooms, setAvailableRooms] = useState([])
  const [playerStats, setPlayerStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [waitingInRoom, setWaitingInRoom] = useState(null)
  const { socket } = useSocket()

  const handleBackToModeSelector = () => {
    window.location.reload()
  }

  useEffect(() => {
    if (socket) {
      socket.emit('get_available_rooms')
      socket.emit('get_player_stats')

      socket.on('available_rooms', (rooms) => {
        setAvailableRooms(rooms)
      })

      socket.on('player_stats', (stats) => {
        setPlayerStats(stats)
      })

      socket.on('room_created', (data) => {
        setWaitingInRoom(data)
        setLoading(false)
      })

      socket.on('new_room_available', () => {
        socket.emit('get_available_rooms')
      })

      socket.on('room_no_longer_available', () => {
        socket.emit('get_available_rooms')
      })

      socket.on('game_started', (data) => {
        setWaitingInRoom(null)
        setLoading(false)
        onStartGame(data)
      })

      socket.on('error', (error) => {
        setLoading(false)
        setWaitingInRoom(null)
      })
    }
  }, [socket, onStartGame])

  const handleCreateRoom = () => {
    setLoading(true)
    socket.emit('create_room')
  }

  const handleJoinRoom = (roomId) => {
    setLoading(true)
    socket.emit('join_room', { roomId })
  }

  const handleCancelWaiting = () => {
    if (waitingInRoom && socket) {
      socket.emit('leave_game')
      setWaitingInRoom(null)
      setLoading(false)
      socket.emit('get_available_rooms')
    }
  }

  if (waitingInRoom) {
    return (
      <div className="lobby-container">
        <div className="waiting-room">
          <h2>Sala Online Creada</h2>
          <div className="waiting-info">
            <p>Sala ID: <strong>{waitingInRoom.roomId}</strong></p>
            <p>Esperando a otro jugador en línea...</p>
            <div className="loading-spinner">⏳</div>
          </div>
          <div className="waiting-actions">
            <button
              className="action-button secondary"
              onClick={handleCancelWaiting}
            >
              ❌ Cancelar y Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h2> Sala de Juego Online</h2>
        <div className="user-stats">
          {playerStats && (
            <div className="stats-card">
              <h3>📊 Tus Estadísticas Online</h3>
              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-value">{playerStats.wins}</span>
                  <span className="stat-label">Victorias</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{playerStats.losses}</span>
                  <span className="stat-label">Derrotas</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{playerStats.winRate}%</span>
                  <span className="stat-label">% Victorias</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lobby-actions">
        <button
          className="action-button primary"
          onClick={handleCreateRoom}
          disabled={loading}
        >
          🎮 Crear Sala Online
        </button>
      </div>

      <div className="available-rooms">
        <h3>Salas Disponibles Online</h3>
        {loading && <div className="loading">⏳ Buscando salas...</div>}
        {availableRooms.length === 0 && !loading && (
          <div className="no-rooms">
            <p>No hay salas online disponibles</p>
            <p>Crea una nueva sala para comenzar a jugar en línea</p>
          </div>
        )}

        {availableRooms.map((room) => (
          <div key={room.roomId} className="room-card">
            <div className="room-info">
              <span className="room-player">👤 {room.player1}</span>
              <span className="room-id">ID: {room.roomId}</span>
            </div>
            <button
              className="join-button"
              onClick={() => handleJoinRoom(room.roomId)}
              disabled={loading}
            >
              🚀 Unirse
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GameLobby
