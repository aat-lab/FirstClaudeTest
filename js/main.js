const STATE = { START: "start", PLAYING: "playing", PAUSED: "paused", GAME_OVER: "gameover" };

const SCORE_TABLE = [0, 100, 300, 500, 800];
const LINES_PER_LEVEL = 10;
const BASE_DROP_MS = 1000;
const SOFT_DROP_MS = 40;

const boardCtx = document.getElementById("board").getContext("2d");
const nextCtx = document.getElementById("next").getContext("2d");
const startOverlay = document.getElementById("startOverlay");
const pauseOverlay = document.getElementById("pauseOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const finalScoreEl = document.getElementById("finalScore");

let game = null;

function dropIntervalForLevel(level) {
  return Math.max(100, BASE_DROP_MS - (level - 1) * 75);
}

function newGame() {
  return {
    board: createBoard(),
    bag: newBag(),
    current: null,
    nextType: null,
    score: 0,
    level: 1,
    totalLines: 0,
    softDropping: false,
    dropTimer: 0,
    lastTime: null,
    state: STATE.START,
  };
}

function drawFromBag(g) {
  if (g.bag.length === 0) g.bag = newBag();
  return g.bag.shift();
}

function spawnPiece(g) {
  const type = g.nextType !== null ? g.nextType : drawFromBag(g);
  g.nextType = drawFromBag(g);
  const piece = makePiece(type, COLS);
  if (!isValidPosition(g.board, piece)) {
    g.state = STATE.GAME_OVER;
    return;
  }
  g.current = piece;
}

function tryMove(g, dRow, dCol) {
  if (!g.current) return false;
  const candidate = { ...g.current, row: g.current.row + dRow, col: g.current.col + dCol };
  if (isValidPosition(g.board, candidate)) {
    g.current = candidate;
    return true;
  }
  return false;
}

function tryRotate(g) {
  if (!g.current) return;
  const nextRotation = (g.current.rotation + 1) % 4;
  const kicks = [0, -1, 1, -2, 2];
  for (const dCol of kicks) {
    const candidate = { ...g.current, rotation: nextRotation, col: g.current.col + dCol };
    if (isValidPosition(g.board, candidate)) {
      g.current = candidate;
      return;
    }
  }
}

function lockCurrent(g) {
  lockPiece(g.board, g.current);
  const cleared = clearLines(g.board);
  if (cleared > 0) {
    g.score += SCORE_TABLE[cleared] * g.level;
    g.totalLines += cleared;
    g.level = Math.floor(g.totalLines / LINES_PER_LEVEL) + 1;
  }
  g.current = null;
  spawnPiece(g);
}

function hardDrop(g) {
  if (!g.current) return;
  let dropDistance = 0;
  while (tryMove(g, 1, 0)) dropDistance++;
  g.score += dropDistance * 2;
  lockCurrent(g);
}

function startGame() {
  game = newGame();
  game.state = STATE.PLAYING;
  spawnPiece(game);
  updateStats(game.score, game.level, game.totalLines);
  startOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
}

function togglePause() {
  if (!game) return;
  if (game.state === STATE.PLAYING) {
    game.state = STATE.PAUSED;
    pauseOverlay.classList.remove("hidden");
  } else if (game.state === STATE.PAUSED) {
    game.state = STATE.PLAYING;
    game.lastTime = null;
    pauseOverlay.classList.add("hidden");
  }
}

function handleStart() {
  if (!game || game.state === STATE.START || game.state === STATE.GAME_OVER) {
    startGame();
  }
}

initInput({
  onLeft: () => game && game.state === STATE.PLAYING && tryMove(game, 0, -1),
  onRight: () => game && game.state === STATE.PLAYING && tryMove(game, 0, 1),
  onSoftDrop: () => {
    if (game && game.state === STATE.PLAYING) game.softDropping = true;
  },
  onSoftDropEnd: () => {
    if (game) game.softDropping = false;
  },
  onRotate: () => game && game.state === STATE.PLAYING && tryRotate(game),
  onHardDrop: () => game && game.state === STATE.PLAYING && hardDrop(game),
  onPause: togglePause,
  onStart: handleStart,
});

function render(g) {
  drawBoard(boardCtx, g.board);
  if (g.current) {
    drawGhost(boardCtx, g.current, g.board);
    drawPiece(boardCtx, g.current);
  }
  drawNext(nextCtx, g.nextType);
  updateStats(g.score, g.level, g.totalLines);
  if (g.state === STATE.GAME_OVER) {
    finalScoreEl.textContent = `Score: ${g.score}`;
    gameOverOverlay.classList.remove("hidden");
  }
}

function loop(timestamp) {
  if (game && game.state === STATE.PLAYING) {
    if (game.lastTime === null) game.lastTime = timestamp;
    const delta = timestamp - game.lastTime;
    game.lastTime = timestamp;
    game.dropTimer += delta;
    const interval = game.softDropping ? SOFT_DROP_MS : dropIntervalForLevel(game.level);
    if (game.dropTimer >= interval) {
      game.dropTimer = 0;
      if (!tryMove(game, 1, 0)) {
        lockCurrent(game);
      }
    }
  }
  if (game) render(game);
  requestAnimationFrame(loop);
}

drawBoard(boardCtx, createBoard());
requestAnimationFrame(loop);
