import { useState } from 'react'
import { useSocket } from '../services/SocketContext'
import './Login.css'

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { socket } = useSocket()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Ingresa un nombre de usuario')
      return
    }

    setLoading(true)
    setError('')

    socket.emit('register_user', { username: username.trim() })

    socket.on('user_registered', (data) => {
      setLoading(false)
      onLogin(data.user)
    })

    socket.on('error', (error) => {
      setLoading(false)
      setError(error.message)
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🎮 Iniciar Sesión</h2>
        <p>Ingresa tu nombre de usuario para comenzar a jugar</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu nombre de usuario"
              disabled={loading}
              maxLength={20}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading || !username.trim()}
          >
            {loading ? '⏳ Conectando...' : '🚀 Jugar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
