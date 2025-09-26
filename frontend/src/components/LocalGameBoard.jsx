import { useState, useEffect } from 'react'
import './LocalGameBoard.css'

const LocalGameBoard = ({ user, onBackToMode }) => {
  const [board, setBoard] = useState(Array(9).fill(''))
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [gameStatus, setGameStatus] = useState('playing')
  const [winner, setWinner] = useState(null)
  const [winningLine, setWinningLine] = useState(null)
  const [gameStats, setGameStats] = useState({
    playerX: { name: 'Jugador 1', symbol: 'X', wins: 0 },
    playerO: { name: 'Jugador 2', symbol: 'O', wins: 0 },
    draws: 0,
    totalGames: 0
  })
  const [playerNames, setPlayerNames] = useState({
    playerX: 'Jugador 1',
    playerO: 'Jugador 2'
  })
  const [showNameEditor, setShowNameEditor] = useState(false)

  useEffect(() => {
    // Cargar estadísticas del localStorage
    const savedStats = localStorage.getItem('localGameStats')
    if (savedStats) {
      const stats = JSON.parse(savedStats)
      setGameStats(stats)
      setPlayerNames({
        playerX: stats.playerX.name,
        playerO: stats.playerO.name
      })
    }
  }, [])

  const saveStats = (newStats) => {
    localStorage.setItem('localGameStats', JSON.stringify(newStats))
    setGameStats(newStats)
  }

  const checkWinner = (board) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas  
      [0, 4, 8], [2, 4, 6] // Diagonales
    ]

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          winner: board[a],
          winningLine: {
            positions: pattern,
            type: getLineType(pattern)
          }
        }
      }
    }

    return null
  }

  const getLineType = (pattern) => {
    const [a, b, c] = pattern
    if (Math.floor(a / 3) === Math.floor(b / 3)) return 'row'
    if (a % 3 === b % 3) return 'column'
    return 'diagonal'
  }

  const isDraw = (board) => {
    return board.every(cell => cell !== '') && !checkWinner(board)
  }

  const handleCellClick = (index) => {
    if (gameStatus !== 'playing' || board[index] !== '') return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const result = checkWinner(newBoard)
    const draw = isDraw(newBoard)

    if (result) {
      setGameStatus('finished')
      setWinner(result.winner)
      setWinningLine(result.winningLine)
      
      // Actualizar estadísticas
      const newStats = { ...gameStats }
      if (result.winner === 'X') {
        newStats.playerX.wins++
      } else {
        newStats.playerO.wins++
      }
      newStats.totalGames++
      saveStats(newStats)
      
    } else if (draw) {
      setGameStatus('finished')
      setWinner(null)
      
      // Actualizar estadísticas para empate
      const newStats = { ...gameStats }
      newStats.draws++
      newStats.totalGames++
      saveStats(newStats)
      
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(''))
    setCurrentPlayer('X')
    setGameStatus('playing')
    setWinner(null)
    setWinningLine(null)
  }

  const resetStats = () => {
    const freshStats = {
      playerX: { name: playerNames.playerX, symbol: 'X', wins: 0 },
      playerO: { name: playerNames.playerO, symbol: 'O', wins: 0 },
      draws: 0,
      totalGames: 0
    }
    saveStats(freshStats)
  }

  const handleNameChange = (player, name) => {
    const newNames = { ...playerNames, [player]: name || `Jugador ${player === 'playerX' ? '1' : '2'}` }
    setPlayerNames(newNames)
    
    const newStats = { ...gameStats }
    newStats[player].name = newNames[player]
    saveStats(newStats)
  }

  const renderCell = (index) => {
    const isWinning = winningLine && winningLine.positions.includes(index)
    return (
      <button
        key={index}
        className={`local-cell ${isWinning ? 'winning' : ''} ${board[index] ? 'filled' : ''}`}
        onClick={() => handleCellClick(index)}
        disabled={gameStatus !== 'playing' || board[index] !== ''}
      >
        <span className={`cell-symbol ${board[index] === 'X' ? 'symbol-x' : 'symbol-o'}`}>
          {board[index]}
        </span>
      </button>
    )
  }

  return (
    <div className="local-game-container">
      <div className="local-game-header">
        <button className="back-button" onClick={onBackToMode}>
          ← Cambiar Modo
        </button>
        <h2>👥 Multijugador Local</h2>
        <button 
          className="edit-names-button"
          onClick={() => setShowNameEditor(!showNameEditor)}
        >
          ✏️ Editar Nombres
        </button>
      </div>

      {showNameEditor && (
        <div className="name-editor">
          <div className="name-input-group">
            <label>Jugador X:</label>
            <input
              type="text"
              value={playerNames.playerX}
              onChange={(e) => handleNameChange('playerX', e.target.value)}
              placeholder="Jugador 1"
              maxLength={15}
            />
          </div>
          <div className="name-input-group">
            <label>Jugador O:</label>
            <input
              type="text"
              value={playerNames.playerO}
              onChange={(e) => handleNameChange('playerO', e.target.value)}
              placeholder="Jugador 2"
              maxLength={15}
            />
          </div>
          <button 
            className="close-editor-button"
            onClick={() => setShowNameEditor(false)}
          >
            ✓ Listo
          </button>
        </div>
      )}

      <div className="local-game-content">
        <div className="players-section">
          <div className={`local-player ${currentPlayer === 'X' && gameStatus === 'playing' ? 'active' : ''}`}>
            <div className="player-avatar x-player">X</div>
            <div className="player-info">
              <h3>{gameStats.playerX.name}</h3>
              <div className="player-stats">
                <span className="wins">{gameStats.playerX.wins} victorias</span>
              </div>
            </div>
          </div>

          <div className="vs-section">
            <div className="vs-circle">VS</div>
            {gameStatus === 'playing' && (
              <div className="turn-indicator">
                <p>Turno de:</p>
                <p className="current-turn">
                  {currentPlayer === 'X' ? gameStats.playerX.name : gameStats.playerO.name}
                </p>
              </div>
            )}
          </div>

          <div className={`local-player ${currentPlayer === 'O' && gameStatus === 'playing' ? 'active' : ''}`}>
            <div className="player-avatar o-player">O</div>
            <div className="player-info">
              <h3>{gameStats.playerO.name}</h3>
              <div className="player-stats">
                <span className="wins">{gameStats.playerO.wins} victorias</span>
              </div>
            </div>
          </div>
        </div>

        <div className="local-game-board">
          {Array.from({ length: 9 }, (_, index) => renderCell(index))}
        </div>

        {gameStatus === 'finished' && (
          <div className="game-result">
            {winner ? (
              <div className="winner-announcement">
                <div className="winner-icon">🎉</div>
                <h3>¡{winner === 'X' ? gameStats.playerX.name : gameStats.playerO.name} ganó!</h3>
                <p>¡Excelente partida!</p>
              </div>
            ) : (
              <div className="draw-announcement">
                <div className="draw-icon">🤝</div>
                <h3>¡Empate!</h3>
                <p>Ambos jugadores han empatado</p>
              </div>
            )}
            
            <div className="game-actions">
              <button className="new-game-button" onClick={resetGame}>
                🔄 Nueva Partida
              </button>
            </div>
          </div>
        )}

        <div className="game-stats-summary">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{gameStats.totalGames}</span>
              <span className="stat-label">Partidas Totales</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{gameStats.draws}</span>
              <span className="stat-label">Empates</span>
            </div>
          </div>
          
          <div className="game-controls">
            <button className="reset-game-button" onClick={resetGame}>
              🔄 Reiniciar Partida
            </button>
            <button className="reset-stats-button" onClick={resetStats}>
              🗑️ Limpiar Estadísticas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocalGameBoard