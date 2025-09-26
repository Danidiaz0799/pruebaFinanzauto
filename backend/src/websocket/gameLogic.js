class GameLogic {
  static checkWinner(board) {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  }

  static isDraw(board) {
    return board.every(cell => cell !== '') && !this.checkWinner(board);
  }

  static getWinningLine(board) {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          positions: pattern,
          symbol: board[a],
          type: this.getLineType(pattern)
        };
      }
    }

    return null;
  }

  static getLineType(pattern) {
    const [a, b, c] = pattern;

    if (Math.floor(a / 3) === Math.floor(b / 3) && Math.floor(b / 3) === Math.floor(c / 3)) {
      return 'row';
    }

    if (a % 3 === b % 3 && b % 3 === c % 3) {
      return 'column';
    }

    return 'diagonal';
  }

  static isValidMove(board, position) {
    return position >= 0 && position <= 8 && board[position] === '';
  }

  static getAvailableMoves(board) {
    const moves = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        moves.push(i);
      }
    }
    return moves;
  }

  static getGameStatus(board) {
    const winner = this.checkWinner(board);
    const isDraw = this.isDraw(board);

    if (winner) {
      return {
        status: 'finished',
        result: 'win',
        winner: winner,
        winningLine: this.getWinningLine(board)
      };
    }

    if (isDraw) {
      return {
        status: 'finished',
        result: 'draw',
        winner: null,
        winningLine: null
      };
    }

    return {
      status: 'playing',
      result: null,
      winner: null,
      winningLine: null
    };
  }

  static simulateMove(board, position, symbol) {
    if (!this.isValidMove(board, position)) {
      return null;
    }

    const newBoard = [...board];
    newBoard[position] = symbol;
    return newBoard;
  }
}

module.exports = GameLogic;