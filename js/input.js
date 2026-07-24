const HOLD_REPEAT_MS = 120;

function bindHoldButton(el, onPress, onRelease) {
  if (!el) return;
  let intervalId = null;
  const start = (e) => {
    e.preventDefault();
    onPress();
    intervalId = setInterval(onPress, HOLD_REPEAT_MS);
  };
  const stop = (e) => {
    if (e) e.preventDefault();
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (onRelease) onRelease();
  };
  el.addEventListener("pointerdown", start);
  el.addEventListener("pointerup", stop);
  el.addEventListener("pointercancel", stop);
  el.addEventListener("pointerleave", stop);
}

function bindTapButton(el, onPress) {
  if (!el) return;
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    onPress();
  });
}

function initTouchControls(handlers) {
  bindHoldButton(document.getElementById("btnLeft"), handlers.onLeft);
  bindHoldButton(document.getElementById("btnRight"), handlers.onRight);
  bindHoldButton(document.getElementById("btnSoftDrop"), handlers.onSoftDrop, handlers.onSoftDropEnd);
  bindTapButton(document.getElementById("btnRotate"), handlers.onRotate);
  bindTapButton(document.getElementById("btnHardDrop"), handlers.onHardDrop);
  bindTapButton(document.getElementById("btnPause"), handlers.onPause);
  bindTapButton(document.getElementById("btnStart"), handlers.onStart);
}

const LONG_PRESS_MS = 1000;

function initBoardGestures(handlers) {
  const board = document.getElementById("board");
  if (!board) return;
  let timeoutId = null;
  let isLongPress = false;

  const onDown = (e) => {
    e.preventDefault();
    isLongPress = false;
    timeoutId = setTimeout(() => {
      isLongPress = true;
      timeoutId = null;
      handlers.onSoftDrop();
    }, LONG_PRESS_MS);
  };

  const onUp = (e) => {
    e.preventDefault();
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      handlers.onRotate();
    } else if (isLongPress) {
      isLongPress = false;
      if (handlers.onSoftDropEnd) handlers.onSoftDropEnd();
    }
  };

  board.addEventListener("pointerdown", onDown);
  board.addEventListener("pointerup", onUp);
  board.addEventListener("pointercancel", onUp);
  board.addEventListener("pointerleave", onUp);
}

function initInput(handlers) {
  initTouchControls(handlers);
  initBoardGestures(handlers);
  const keyActions = {
    ArrowLeft: handlers.onLeft,
    ArrowRight: handlers.onRight,
    ArrowDown: handlers.onSoftDrop,
    ArrowUp: handlers.onRotate,
    " ": handlers.onHardDrop,
    p: handlers.onPause,
    P: handlers.onPause,
    Enter: handlers.onStart,
  };

  document.addEventListener("keydown", (e) => {
    const action = keyActions[e.key];
    if (!action) return;
    e.preventDefault();
    if (e.repeat && (e.key === "Enter" || e.key === "p" || e.key === "P" || e.key === "ArrowUp")) {
      return;
    }
    action();
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowDown" && handlers.onSoftDropEnd) handlers.onSoftDropEnd();
  });
}
