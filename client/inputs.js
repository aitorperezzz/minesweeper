// Mouse and touch input state
let buttonPressedPrimary = false;
let touchLongPressTimer;
let touchLongPressTriggered = false;
let touchMovedTooFar = false;
let touchStartX = 0;
let touchStartY = 0;
let ignoreMouseUntil = 0;
let activeTouchPointerId;

const longPressDuration = 500;
const touchMoveTolerance = 10;

function getCanvasPoint(event) {
  const canvasElement = event.currentTarget;
  const rect = canvasElement.getBoundingClientRect();
  const styles = getComputedStyle(canvasElement);
  const borderLeft = parseFloat(styles.borderLeftWidth);
  const borderTop = parseFloat(styles.borderTopWidth);
  const scaleX = width / canvasElement.clientWidth;
  const scaleY = height / canvasElement.clientHeight;

  return {
    x: (event.clientX - rect.left - borderLeft) * scaleX,
    y: (event.clientY - rect.top - borderTop) * scaleY,
  };
}

function resetTouchState() {
  touchLongPressTriggered = false;
  touchMovedTooFar = false;
  activeTouchPointerId = undefined;
}

function startLongPressTimer() {
  cancelTouchLongPress();
  touchLongPressTimer = setTimeout(() => {
    touchLongPressTriggered = true;
    arena.faceDisplay.setIcon(icons.happy);
    arena.flag(touchStartX, touchStartY);
  }, longPressDuration);
}

function installCanvasInputHandlers(canvasElement) {
  if (!window.PointerEvent) {
    return;
  }

  canvasElement.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || activeTouchPointerId !== undefined) {
      return;
    }

    event.preventDefault();
    ignoreMouseUntil = Date.now() + 700;
    activeTouchPointerId = event.pointerId;
    canvasElement.setPointerCapture(event.pointerId);

    const point = getCanvasPoint(event);
    touchStartX = point.x;
    touchStartY = point.y;
    touchLongPressTriggered = false;
    touchMovedTooFar = false;

    arena.press(point.x, point.y);
    startLongPressTimer();
  });

  canvasElement.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activeTouchPointerId) {
      return;
    }

    event.preventDefault();
    const point = getCanvasPoint(event);
    const movedTooFar =
      dist(touchStartX, touchStartY, point.x, point.y) > touchMoveTolerance;

    if (movedTooFar) {
      touchMovedTooFar = true;
      cancelTouchLongPress();
      arena.faceDisplay.setIcon(icons.happy);
    }
  });

  canvasElement.addEventListener("pointerup", (event) => {
    if (event.pointerId !== activeTouchPointerId) {
      return;
    }

    event.preventDefault();
    ignoreMouseUntil = Date.now() + 700;
    cancelTouchLongPress();

    if (!touchLongPressTriggered && !touchMovedTooFar) {
      const point = getCanvasPoint(event);
      arena.release(point.x, point.y);
    }

    resetTouchState();
  });

  canvasElement.addEventListener("pointercancel", (event) => {
    if (event.pointerId !== activeTouchPointerId) {
      return;
    }

    event.preventDefault();
    cancelTouchLongPress();
    arena.faceDisplay.setIcon(icons.happy);
    resetTouchState();
  });
}

function mousePressed(event) {
  if (Date.now() < ignoreMouseUntil) {
    return false;
  }

  const isSecondaryClick =
    mouseButton.right || event.button === 2 || event.ctrlKey;
  const isPrimaryClick =
    !isSecondaryClick && (mouseButton.left || event.button === 0);

  if (isPrimaryClick) {
    buttonPressedPrimary = true;
    arena.press(mouseX, mouseY);
  } else if (isSecondaryClick) {
    arena.flag(mouseX, mouseY);
    return false;
  }
}

function mouseReleased() {
  if (Date.now() < ignoreMouseUntil) {
    return false;
  }

  if (buttonPressedPrimary) {
    buttonPressedPrimary = false;
    arena.release(mouseX, mouseY);
  }
}

function cancelTouchLongPress() {
  clearTimeout(touchLongPressTimer);
  touchLongPressTimer = undefined;
}

function touchStarted() {
  if (window.PointerEvent) {
    return false;
  }

  ignoreMouseUntil = Date.now() + 700;
  touchLongPressTriggered = false;
  touchMovedTooFar = false;
  touchStartX = mouseX;
  touchStartY = mouseY;

  arena.press(mouseX, mouseY);
  startLongPressTimer();

  return false;
}

function touchMoved() {
  if (window.PointerEvent) {
    return false;
  }

  const movedTooFar =
    dist(touchStartX, touchStartY, mouseX, mouseY) > touchMoveTolerance;

  if (movedTooFar) {
    touchMovedTooFar = true;
    cancelTouchLongPress();
    arena.faceDisplay.setIcon(icons.happy);
  }

  return false;
}

function touchEnded() {
  if (window.PointerEvent) {
    return false;
  }

  ignoreMouseUntil = Date.now() + 700;
  cancelTouchLongPress();

  if (!touchLongPressTriggered && !touchMovedTooFar) {
    arena.release(mouseX, mouseY);
  }

  resetTouchState();
  return false;
}

function keyPressed(event) {
  const isFindShortcut = event.ctrlKey || event.metaKey;
  if (!isFindShortcut && key.toLowerCase() === "f") {
    arena.flag(mouseX, mouseY);
    return false;
  }
}
