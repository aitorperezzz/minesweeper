// Mouse and touch input state
let buttonPressedPrimary = false;
let touchMovedTooFar = false;
let touchStartX = 0;
let touchStartY = 0;
let touchStartClientX = 0;
let touchStartClientY = 0;
let ignoreMouseUntil = 0;
let activeTouchPointerId;
let flagMode = false;

const touchMoveTolerance = 18;
const syntheticMouseIgnoreDuration = 1000;

function ignoreSyntheticMouse() {
  ignoreMouseUntil = Date.now() + syntheticMouseIgnoreDuration;
}

function getCanvasElement(event) {
  if (event?.currentTarget instanceof HTMLCanvasElement) {
    return event.currentTarget;
  }

  if (event?.target instanceof Element) {
    const canvasElement = event.target.closest("canvas");
    if (canvasElement != undefined) {
      return canvasElement;
    }
  }

  return document.querySelector("#sketch-holder canvas");
}

function getCanvasPoint(event) {
  const canvasElement = getCanvasElement(event);
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
  touchMovedTooFar = false;
  activeTouchPointerId = undefined;
}

function setFlagMode(enabled) {
  flagMode = enabled;
  updateFlagModeButton();
}

function toggleFlagMode() {
  setFlagMode(!flagMode);
}

function flagOnce(mx, my) {
  if (arena.flag(mx, my)) {
    setFlagMode(false);
  }
}

function updateFlagModeButton() {
  const button = document.getElementById("flag-mode-button");
  if (button == undefined) {
    return;
  }

  button.classList.toggle("is-active", flagMode);
  button.setAttribute("aria-pressed", String(flagMode));
  button.textContent = flagMode ? "Flag: On" : "Flag: Off";
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
    ignoreSyntheticMouse();
    activeTouchPointerId = event.pointerId;
    canvasElement.setPointerCapture(event.pointerId);

    const point = getCanvasPoint(event);
    touchStartClientX = event.clientX;
    touchStartClientY = event.clientY;
    touchMovedTooFar = false;

    if (!flagMode) {
      arena.press(point.x, point.y);
    }
  });

  canvasElement.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activeTouchPointerId) {
      return;
    }

    event.preventDefault();
    const movedTooFar =
      Math.hypot(
        event.clientX - touchStartClientX,
        event.clientY - touchStartClientY,
      ) > touchMoveTolerance;

    if (movedTooFar) {
      touchMovedTooFar = true;
      arena.faceDisplay.setIcon(icons.happy);
    }
  });

  canvasElement.addEventListener("pointerup", (event) => {
    if (event.pointerId !== activeTouchPointerId) {
      return;
    }

    event.preventDefault();
    ignoreSyntheticMouse();

    if (!touchMovedTooFar) {
      const point = getCanvasPoint(event);
      if (flagMode) {
        flagOnce(point.x, point.y);
      } else {
        arena.release(point.x, point.y);
      }
    }

    resetTouchState();
  });

  canvasElement.addEventListener("pointercancel", (event) => {
    if (event.pointerId !== activeTouchPointerId) {
      return;
    }

    event.preventDefault();
    ignoreSyntheticMouse();
    arena.faceDisplay.setIcon(icons.happy);
    resetTouchState();
  });

  canvasElement.addEventListener("contextmenu", (event) => {
    event.preventDefault();
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
    const point = getCanvasPoint(event);
    if (flagMode) {
      flagOnce(point.x, point.y);
      return false;
    }

    buttonPressedPrimary = true;
    arena.press(point.x, point.y);
  } else if (isSecondaryClick) {
    const point = getCanvasPoint(event);
    if (flagMode) {
      flagOnce(point.x, point.y);
    } else {
      arena.flag(point.x, point.y);
    }
    return false;
  }
}

function mouseReleased(event) {
  if (Date.now() < ignoreMouseUntil) {
    return false;
  }

  if (buttonPressedPrimary) {
    const point = getCanvasPoint(event);
    buttonPressedPrimary = false;
    arena.release(point.x, point.y);
  }
}

function touchStarted() {
  if (window.PointerEvent) {
    return false;
  }

  ignoreSyntheticMouse();
  touchMovedTooFar = false;
  touchStartX = mouseX;
  touchStartY = mouseY;

  if (!flagMode) {
    arena.press(mouseX, mouseY);
  }

  return false;
}

function touchMoved() {
  if (window.PointerEvent) {
    return false;
  }

  const movedTooFar =
    dist(touchStartX, touchStartY, mouseX, mouseY) >
    Math.max(touchMoveTolerance, arena.cellSize * 0.15);

  if (movedTooFar) {
    touchMovedTooFar = true;
    arena.faceDisplay.setIcon(icons.happy);
  }

  return false;
}

function touchEnded() {
  if (window.PointerEvent) {
    return false;
  }

  ignoreSyntheticMouse();

  if (!touchMovedTooFar) {
    if (flagMode) {
      flagOnce(mouseX, mouseY);
    } else {
      arena.release(mouseX, mouseY);
    }
  }

  resetTouchState();
  return false;
}

function keyPressed(event) {
  const isFindShortcut = event.ctrlKey || event.metaKey;
  if (!isFindShortcut && key.toLowerCase() === "f") {
    toggleFlagMode();
    return false;
  }
}
