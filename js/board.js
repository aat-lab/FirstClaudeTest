const ROWS = 20;
const COLS = 10;

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function isValidPosition(board, piece) {
  return pieceCells(piece).every(([r, c]) => {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return false;
    return board[r][c] === 0;
  });
}

function lockPiece(board, piece) {
  pieceCells(piece).forEach(([r, c]) => {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      board[r][c] = piece.type;
    }
  });
}

function clearLines(board) {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every((cell) => cell !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++; // re-check this row index after the shift
    }
  }
  return cleared;
}
