const GameLogic = require('./gameLogic');
const UserModel = require('../database/userModel');
const GameModel = require('../database/gameModel');

const activeRooms = new Map();
const playerSockets = new Map();

function handleSocketConnection(io) {
  io.on('connection', (socket) => {

    socket.on('register_user', async (data) => {
      try {
        const { username } = data;
        if (!username || username.trim() === '') {
          socket.emit('error', { message: 'Nombre de usuario requerido' });
          return;
        }

        const user = await UserModel.findOrCreateUser(username.trim());
        socket.userId = user.id;
        socket.username = user.username;
        playerSockets.set(user.id, socket.id);

        socket.emit('user_registered', {
          user: {
            id: user.id,
            username: user.username,
            wins: user.wins,
            losses: user.losses
          }
        });

        console.log(`Usuario registrado: ${user.username} (ID: ${user.id})`);
      } catch (error) {
        console.error('Error al registrar usuario:', error);
        socket.emit('error', { message: 'Error al registrar usuario' });
      }
    });

    socket.on('create_room', async () => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Usuario no autenticado' });
          return;
        }

        const game = await GameModel.createGame(socket.userId);
        const roomId = `game_${game.id}`;

        const roomData = {
          gameId: game.id,
          player1: {
            id: socket.userId,
            username: socket.username,
            socketId: socket.id,
            symbol: 'X'
          },
          player2: null,
          board: Array(9).fill(''),
          currentTurn: socket.userId,
          status: 'waiting'
        };

        activeRooms.set(roomId, roomData);
        socket.join(roomId);
        socket.roomId = roomId;

        socket.emit('room_created', {
          roomId,
          gameId: game.id,
          player: roomData.player1
        });

        socket.broadcast.emit('new_room_available', {
          roomId,
          gameId: game.id,
          player1: roomData.player1.username
        });

        console.log(`Sala creada: ${roomId} por ${socket.username}`);
      } catch (error) {
        console.error('Error al crear sala:', error);
        socket.emit('error', { message: 'Error al crear sala' });
      }
    });

    socket.on('join_room', async (data) => {
      try {
        const { roomId } = data;

        if (!socket.userId) {
          socket.emit('error', { message: 'Usuario no autenticado' });
          return;
        }

        const roomData = activeRooms.get(roomId);
        if (!roomData) {
          socket.emit('error', { message: 'Sala no encontrada' });
          return;
        }

        if (roomData.status !== 'waiting') {
          socket.emit('error', { message: 'La sala no está disponible' });
          return;
        }

        if (roomData.player1.id === socket.userId) {
          socket.emit('error', { message: 'No puedes jugar contra ti mismo' });
          return;
        }

        await GameModel.joinGame(roomData.gameId, socket.userId);

        roomData.player2 = {
          id: socket.userId,
          username: socket.username,
          socketId: socket.id,
          symbol: 'O'
        };
        roomData.status = 'playing';

        socket.join(roomId);
        socket.roomId = roomId;

        io.to(roomId).emit('game_started', {
          roomId,
          gameId: roomData.gameId,
          player1: roomData.player1,
          player2: roomData.player2,
          currentTurn: roomData.currentTurn,
          board: roomData.board
        });

        socket.broadcast.emit('room_no_longer_available', {
          roomId
        });

      } catch (error) {
        console.error('Error al unirse a sala:', error);
        socket.emit('error', { message: 'Error al unirse a la sala' });
      }
    });

    socket.on('make_move', async (data) => {
      try {
        const { position } = data;
        const roomId = socket.roomId;

        if (!roomId) {
          socket.emit('error', { message: 'No estás en una sala' });
          return;
        }

        const roomData = activeRooms.get(roomId);
        if (!roomData) {
          socket.emit('error', { message: 'Sala no encontrada' });
          return;
        }

        if (roomData.status !== 'playing') {
          socket.emit('error', { message: 'El juego no está activo' });
          return;
        }

        if (roomData.currentTurn !== socket.userId) {
          socket.emit('error', { message: 'No es tu turno' });
          return;
        }

        if (position < 0 || position > 8 || roomData.board[position] !== '') {
          socket.emit('error', { message: 'Movimiento inválido' });
          return;
        }

        const playerSymbol = roomData.player1.id === socket.userId ? 'X' : 'O';
        roomData.board[position] = playerSymbol;

        const winner = GameLogic.checkWinner(roomData.board);
        const isDraw = GameLogic.isDraw(roomData.board);

        await GameModel.updateBoard(roomData.gameId, roomData.board);

        if (winner || isDraw) {
          roomData.status = 'finished';

          let winnerId = null;
          if (winner) {
            winnerId = winner === 'X' ? roomData.player1.id : roomData.player2.id;
            const existingGame = await GameModel.findById(roomData.gameId);
            if (existingGame && existingGame.status === 'finished') {
            } else {
              await GameModel.finishGame(roomData.gameId, winnerId);
            }
          } else {
            await GameModel.finishGame(roomData.gameId, null);
          }

          io.to(roomId).emit('game_finished', {
            board: roomData.board,
            winner: winner,
            winnerId: winnerId,
            isDraw: isDraw,
            winningLine: winner ? GameLogic.getWinningLine(roomData.board) : null
          });

          setTimeout(() => {
            activeRooms.delete(roomId);
          }, 30000);

        } else {
          roomData.currentTurn = roomData.currentTurn === roomData.player1.id
            ? roomData.player2.id
            : roomData.player1.id;

          io.to(roomId).emit('move_made', {
            position,
            symbol: playerSymbol,
            board: roomData.board,
            currentTurn: roomData.currentTurn,
            nextPlayer: roomData.currentTurn === roomData.player1.id
              ? roomData.player1.username
              : roomData.player2.username
          });
        }

      } catch (error) {
        console.error('Error al realizar movimiento:', error);
        socket.emit('error', { message: 'Error al realizar movimiento' });
      }
    });

    socket.on('get_available_rooms', () => {
      const availableRooms = [];
      for (const [roomId, roomData] of activeRooms.entries()) {
        if (roomData.status === 'waiting') {
          availableRooms.push({
            roomId,
            gameId: roomData.gameId,
            player1: roomData.player1.username,
            createdAt: new Date().toISOString()
          });
        }
      }
      socket.emit('available_rooms', availableRooms);
    });

    socket.on('get_player_stats', async () => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Usuario no autenticado' });
          return;
        }

        const user = await UserModel.findById(socket.userId);
        if (user) {
          socket.emit('player_stats', {
            id: user.id,
            username: user.username,
            wins: user.wins,
            losses: user.losses,
            totalGames: user.wins + user.losses,
            winRate: user.wins + user.losses > 0 ?
              Math.round((user.wins / (user.wins + user.losses)) * 100) : 0
          });
        }
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        socket.emit('error', { message: 'Error al obtener estadísticas' });
      }
    });

    socket.on('leave_game', async () => {
      try {
        if (socket.roomId) {
          const roomData = activeRooms.get(socket.roomId);
          if (roomData) {
            socket.to(socket.roomId).emit('player_left', {
              message: `${socket.username} abandonó la partida`,
              winner: roomData.player1.id === socket.userId ?
                roomData.player2?.username : roomData.player1.username
            });

            if (roomData.status === 'playing') {
              const winnerId = roomData.player1.id === socket.userId ?
                roomData.player2?.id : roomData.player1.id;

              if (winnerId) {
                await GameModel.finishGame(roomData.gameId, winnerId);
                roomData.status = 'finished';
              }
            }

            activeRooms.delete(socket.roomId);
          }
          socket.leave(socket.roomId);
          socket.roomId = null;
        }
      } catch (error) {
        console.error('Error al abandonar partida:', error);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        playerSockets.delete(socket.userId);

        if (socket.roomId) {
          const roomData = activeRooms.get(socket.roomId);
          if (roomData) {
            socket.to(socket.roomId).emit('player_disconnected', {
              message: `${socket.username} se desconecto`,
              roomId: socket.roomId
            });

            if (roomData.status === 'waiting') {
              activeRooms.delete(socket.roomId);
            }
          }
        }
      }
    });
  });
}

module.exports = {
  handleSocketConnection,
  activeRooms,
  playerSockets
};