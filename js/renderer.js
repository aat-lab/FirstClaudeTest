const CELL = 30;

function drawCell(ctx, row, col, color) {
  const x = col * CELL;
  const y = row * CELL;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, CELL, CELL);
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
}

function drawGrid(ctx) {
  ctx.strokeStyle = "#1c1c22";
  ctx.lineWidth = 1;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL, 0);
    ctx.lineTo(c * CELL, ROWS * CELL);
    ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL);
    ctx.lineTo(COLS * CELL, r * CELL);
    ctx.stroke();
  }
}

function drawBoard(ctx, board) {
  ctx.clearRect(0, 0, COLS * CELL, ROWS * CELL);
  drawGrid(ctx);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (cell !== 0) drawCell(ctx, r, c, COLORS[cell]);
    }
  }
}

function drawPiece(ctx, piece) {
  const color = COLORS[piece.type];
  pieceCells(piece).forEach(([r, c]) => {
    if (r >= 0) drawCell(ctx, r, c, color);
  });
}

function drawGhost(ctx, piece, board) {
  let ghost = { ...piece };
  while (isValidPosition(board, { ...ghost, row: ghost.row + 1 })) {
    ghost.row++;
  }
  ctx.globalAlpha = 0.25;
  drawPiece(ctx, ghost);
  ctx.globalAlpha = 1;
}

function drawNext(ctx, type) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!type) return;
  const shape = SHAPES[type];
  const size = shape.boxSize;
  const cell = Math.floor(ctx.canvas.width / 4);
  const offset = Math.floor((4 - size) / 2);
  shape.rotations[0].forEach(([r, c]) => {
    const x = (c + offset) * cell;
    const y = (r + offset) * cell;
    ctx.fillStyle = COLORS[type];
    ctx.fillRect(x, y, cell, cell);
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, cell - 2, cell - 2);
  });
}

function updateStats(score, level, lines) {
  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = level;
  document.getElementById("lines").textContent = lines;
}
