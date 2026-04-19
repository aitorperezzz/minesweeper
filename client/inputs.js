// Mouse and touch input state
let buttonPressedPrimary = false;
let touchLongPressTimer;
let touchLongPressTriggered = false;
let touchMovedTooFar = false;
let touchStartX = 0;
let touchStartY = 0;
let ignoreMouseUntil = 0;

const longPressDuration = 500;
const touchMoveTolerance = 10;

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
  ignoreMouseUntil = Date.now() + 700;
  touchLongPressTriggered = false;
  touchMovedTooFar = false;
  touchStartX = mouseX;
  touchStartY = mouseY;

  arena.press(mouseX, mouseY);

  cancelTouchLongPress();
  touchLongPressTimer = setTimeout(() => {
    touchLongPressTriggered = true;
    arena.faceDisplay.setIcon(icons.happy);
    arena.flag(touchStartX, touchStartY);
  }, longPressDuration);

  return false;
}

function touchMoved() {
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
  ignoreMouseUntil = Date.now() + 700;
  cancelTouchLongPress();

  if (!touchLongPressTriggered && !touchMovedTooFar) {
    arena.release(mouseX, mouseY);
  }

  touchLongPressTriggered = false;
  touchMovedTooFar = false;
  return false;
}

function keyPressed(event) {
  const isFindShortcut = event.ctrlKey || event.metaKey;
  if (!isFindShortcut && key.toLowerCase() === "f") {
    arena.flag(mouseX, mouseY);
    return false;
  }
}
