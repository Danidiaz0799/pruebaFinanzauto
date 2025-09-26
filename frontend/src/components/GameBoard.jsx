import { useState, useEffect } from 'react'
import { useSocket } from '../services/SocketContext'
import './GameBoard.css'

const GameBoard = ({ user, gameData, onBackToLobby }) => {
  const [board, setBoard] = useState(Array(9).fill(''))
  const [currentTurn, setCurrentTurn] = useState(null)
  const [gameStatus, setGameStatus] = useState('playing')
  const [winner, setWinner] = useState(null)
  const [winningLine, setWinningLine] = useState(null)
  const [players, setPlayers] = useState({})
  const { socket } = useSocket()

  useEffect(() => {
    if (gameData) {
      setBoard(gameData.board || Array(9).fill(''))
      setCurrentTurn(gameData.currentTurn)
      setPlayers({
        player1: gameData.player1,
        player2: gameData.player2
      })
    }
  }, [gameData])

  useEffect(() => {
    if (socket) {
      socket.on('move_made', (data) => {
        setBoard(data.board)
        setCurrentTurn(data.currentTurn)
      })

      socket.on('game_finished', (data) => {
        setBoard(data.board)
        setGameStatus('finished')
        setWinner(data.winner)
        setWinningLine(data.winningLine)
      })

      socket.on('player_disconnected', (data) => {
        alert(data.message)
        onBackToLobby()
      })

      socket.on('player_left', (data) => {
        alert(data.message)
        onBackToLobby()
      })

      socket.on('error', (error) => {
        alert(error.message)
      })
    }

    return () => {
      if (socket) {
        socket.off('move_made')
        socket.off('game_finished')
        socket.off('player_disconnected')
        socket.off('player_left')
        socket.off('error')
      }
    }
  }, [socket, onBackToLobby])

  const handleCellClick = (index) => {
    if (gameStatus !== 'playing' || board[index] !== '') return
    if (currentTurn !== user.id) return

    socket.emit('make_move', { position: index })
  }

  const handleLeaveGame = () => {
    socket.emit('leave_game')
    onBackToLobby()
  }

  const renderCell = (index) => {
    const isWinning = winningLine && winningLine.positions.includes(index)
    return (
      <button
        key={index}
        className={`cell ${isWinning ? 'winning' : ''}`}
        onClick={() => handleCellClick(index)}
        disabled={gameStatus !== 'playing' || board[index] !== ''}
      >
        {board[index]}
      </button>
    )
  }

  const getCurrentPlayerName = () => {
    if (!currentTurn || !players.player1 || !players.player2) return ''
    return currentTurn === players.player1.id ? players.player1.username : players.player2.username
  }

  const getPlayerSymbol = (playerId) => {
    if (!players.player1 || !players.player2) return ''
    return playerId === players.player1.id ? 'X' : 'O'
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <button className="back-button" onClick={handleLeaveGame}>
          ← Volver al Lobby Online
        </button>
        <h2>� Partida Online</h2>
      </div>

      <div className="game-info">
        <div className="players-info">
          <div className={`player ${players.player1?.id === user.id ? 'current-user' : ''}`}>
            <span className="player-symbol">X</span>
            <span className="player-name">{players.player1?.username}</span>
          </div>
          <div className="vs">VS</div>
          <div className={`player ${players.player2?.id === user.id ? 'current-user' : ''}`}>
            <span className="player-symbol">O</span>
            <span className="player-name">{players.player2?.username}</span>
          </div>
        </div>

        {gameStatus === 'playing' && (
          <div className="turn-info">
            <p>Turno de: <strong>{getCurrentPlayerName()}</strong></p>
            {currentTurn === user.id && (
              <p className="your-turn">¡Es tu turno!</p>
            )}
          </div>
        )}

        {gameStatus === 'finished' && (
          <div className="game-result">
            {winner ? (
              <div className="winner">
                <h3>🎉 ¡{winner === 'X' ? players.player1?.username : players.player2?.username} ganó!</h3>
              </div>
            ) : (
              <div className="draw">
                <h3>🤝 ¡Empate!</h3>
              </div>
            )}
            <button className="new-game-button" onClick={onBackToLobby}>
              🎮 Nueva Partida Online
            </button>
          </div>
        )}
      </div>

      <div className="game-board">
        {Array.from({ length: 9 }, (_, index) => renderCell(index))}
      </div>
    </div>
  )
}

export default GameBoard
