// Main object of the game
let arena;
let sketchHolderObserver;

// Sizes of several important objects of the game
let sizes = {};

// Variables to handle icons
let icons = {};

// Number of cells occupied by the top header
const numCellsHeader = 3;
// Proportion of the canvas inside its container
const screenProportion = 0.95;
// The margin of the displays inside their respective containers
const displaysProportion = 0.8;
const headerDisplayGapProportion = 0.25;
// Panel number dimensions
const panelNumberWidth = 13;
const panelNumberHeight = 23;

function getCurrentArenaConfig() {
  if (arena != undefined && arena.mode != undefined) {
    return arenaConfig[arena.mode];
  }

  return arenaConfig.beginner;
}

function computeSizes() {
  const container = document.getElementById("sketch-holder");
  const containerStyles = getComputedStyle(container);
  const canvas = document.querySelector("#sketch-holder canvas");
  const canvasStyles = canvas ? getComputedStyle(canvas) : undefined;

  // Compute the optimal canvas ratio
  let currentConfig = getCurrentArenaConfig();
  // Ratio will be width divided by height
  let canvasRatio = currentConfig.i / (currentConfig.j + numCellsHeader);

  const containerHorizontalChrome =
    parseFloat(containerStyles.paddingLeft) +
    parseFloat(containerStyles.paddingRight) +
    parseFloat(containerStyles.borderLeftWidth) +
    parseFloat(containerStyles.borderRightWidth);
  const containerVerticalChrome =
    parseFloat(containerStyles.paddingTop) +
    parseFloat(containerStyles.paddingBottom) +
    parseFloat(containerStyles.borderTopWidth) +
    parseFloat(containerStyles.borderBottomWidth);
  const canvasHorizontalChrome = canvasStyles
    ? parseFloat(canvasStyles.borderLeftWidth) +
      parseFloat(canvasStyles.borderRightWidth)
    : 0;
  const canvasVerticalChrome = canvasStyles
    ? parseFloat(canvasStyles.borderTopWidth) +
      parseFloat(canvasStyles.borderBottomWidth)
    : 0;

  let availableWidth =
    container.getBoundingClientRect().width -
    containerHorizontalChrome -
    canvasHorizontalChrome;
  let availableHeight =
    container.getBoundingClientRect().height -
    containerVerticalChrome -
    canvasVerticalChrome;

  availableWidth = Math.max(0, availableWidth);
  availableHeight = Math.max(0, availableHeight);

  if (availableHeight * canvasRatio < availableWidth) {
    // Decide according to vertical space
    sizes.canvasHeight = screenProportion * availableHeight;
    sizes.canvasWidth = sizes.canvasHeight * canvasRatio;
  } else {
    // Decide according to horizontal space
    sizes.canvasWidth = screenProportion * availableWidth;
    sizes.canvasHeight = sizes.canvasWidth / canvasRatio;
  }
}

function resizeGame() {
  computeSizes();

  if (width !== sizes.canvasWidth || height !== sizes.canvasHeight) {
    resizeCanvas(sizes.canvasWidth, sizes.canvasHeight);
  }

  if (arena != undefined) {
    arena.resize(sizes.canvasWidth, sizes.canvasHeight);
  }
}

function scheduleResizeGame() {
  requestAnimationFrame(() => {
    requestAnimationFrame(resizeGame);
  });
}

// p5js specific functions
async function setup() {
  icons = {
    happy: await loadImage("icons/happy.png"),
    happyPressed: await loadImage("icons/happy_pressed.png"),
    surprised: await loadImage("icons/surprised.png"),
    lose: await loadImage("icons/lose.png"),
    win: await loadImage("icons/win.png"),
    mine: await loadImage("icons/mine.png"),
    mineCulprit: await loadImage("icons/mine_culprit.png"),
    flag: await loadImage("icons/flag.png"),
    revealed: await loadImage("icons/revealed.png"),
    revealedNumbers: [
      undefined,
      await loadImage("icons/revealed_1.png"),
      await loadImage("icons/revealed_2.png"),
      await loadImage("icons/revealed_3.png"),
      await loadImage("icons/revealed_4.png"),
      await loadImage("icons/revealed_5.png"),
      await loadImage("icons/revealed_6.png"),
      await loadImage("icons/revealed_7.png"),
      await loadImage("icons/revealed_8.png"),
    ],
    unrevealed: await loadImage("icons/unrevealed.png"),
    numberDash: await loadImage("icons/panel_dash.png"),
    numbers: [
      await loadImage("icons/panel_0.png"),
      await loadImage("icons/panel_1.png"),
      await loadImage("icons/panel_2.png"),
      await loadImage("icons/panel_3.png"),
      await loadImage("icons/panel_4.png"),
      await loadImage("icons/panel_5.png"),
      await loadImage("icons/panel_6.png"),
      await loadImage("icons/panel_7.png"),
      await loadImage("icons/panel_8.png"),
      await loadImage("icons/panel_9.png"),
    ],
  };

  computeSizes();
  let canvas = createCanvas(sizes.canvasWidth, sizes.canvasHeight);
  canvas.parent("sketch-holder");
  canvas.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  installCanvasInputHandlers(canvas.elt);

  // Initialize the global variables
  arena = new Arena(sizes.canvasWidth, sizes.canvasHeight);

  const holder = document.getElementById("sketch-holder");
  if ("ResizeObserver" in window) {
    sketchHolderObserver = new ResizeObserver(resizeGame);
    sketchHolderObserver.observe(holder);
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleResizeGame);
  }

  scheduleResizeGame();
}

function draw() {
  arena.draw();
}

function playBeginner() {
  arena.play("beginner");
  setFlagMode(false);
}

function playIntermediate() {
  arena.play("intermediate");
  setFlagMode(false);
}

function playExpert() {
  arena.play("expert");
  setFlagMode(false);
}

function windowResized() {
  scheduleResizeGame();
}
