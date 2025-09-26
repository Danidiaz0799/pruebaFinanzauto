import { useState, useEffect } from 'react'
import { SocketProvider } from './services/SocketContext'
import Login from './components/Login'
import GameModeSelector from './components/GameModeSelector'
import GameLobby from './components/GameLobby'
import GameBoard from './components/GameBoard'
import LocalGameBoard from './components/LocalGameBoard'
import AdminPanel from './components/AdminPanel'
import './styles/App.css'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('login')
  const [gameMode, setGameMode] = useState(null)
  const [gameData, setGameData] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('tic_tac_toe_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setCurrentView('mode-selector')
      } catch (error) {
        localStorage.removeItem('tic_tac_toe_user')
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('tic_tac_toe_user', JSON.stringify(userData))
    setCurrentView('mode-selector')
  }

  const handleModeSelect = (mode) => {
    setGameMode(mode)
    if (mode === 'online') {
      setCurrentView('lobby')
    } else if (mode === 'local') {
      setCurrentView('local-game')
    }
  }

  const handleBackToModeSelector = () => {
    setGameMode(null)
    setGameData(null)
    setCurrentView('mode-selector')
  }

  const handleStartGame = (gameInfo) => {
    setGameData(gameInfo)
    setCurrentView('game')
  }

  const handleBackToLobby = () => {
    setGameData(null)
    setCurrentView('lobby')
  }

  const handleLogout = () => {
    setUser(null)
    setGameMode(null)
    setGameData(null)
    setCurrentView('login')
    localStorage.removeItem('tic_tac_toe_user')
  }

  const handleAdminPanel = () => {
    setCurrentView('admin')
  }

  const handleBackFromAdmin = () => {
    if (gameMode === 'online') {
      setCurrentView('lobby')
    } else {
      setCurrentView('mode-selector')
    }
  }

  return (
    <SocketProvider>
      <div className="app">
        <header className="app-header">
          <h1>Tic-Tac-Toe Multijugador</h1>
          {user && (
            <div className="user-info">
              <span>{user.username}</span>
              {gameMode === 'online' && currentView !== 'admin' && (
                <button onClick={handleAdminPanel}>Admin</button>
              )}
              <button onClick={handleLogout}>Salir</button>
            </div>
          )}
        </header>

        <main className="app-main">
          {currentView === 'login' && <Login onLogin={handleLogin} />}

          {currentView === 'mode-selector' && (
            <GameModeSelector
              user={user}
              onSelectMode={handleModeSelect}
              onBackToLogin={handleLogout}
            />
          )}

          {currentView === 'lobby' && gameMode === 'online' && (
            <GameLobby
              user={user}
              onStartGame={handleStartGame}
              onBackToLogin={handleLogout}
            />
          )}

          {currentView === 'game' && gameMode === 'online' && (
            <GameBoard
              user={user}
              gameData={gameData}
              onBackToLobby={handleBackToLobby}
            />
          )}

          {currentView === 'local-game' && gameMode === 'local' && (
            <LocalGameBoard
              user={user}
              onBackToMode={handleBackToModeSelector}
            />
          )}

          {currentView === 'admin' && (
            <AdminPanel onBackToLobby={handleBackFromAdmin} />
          )}
        </main>
      </div>
    </SocketProvider>
  )
}

export default App
