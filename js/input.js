function initInput(handlers) {
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
