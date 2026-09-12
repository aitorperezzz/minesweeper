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
  const [
    happy,
    happyPressed,
    surprised,
    lose,
    win,
    mine,
    mineCulprit,
    flag,
    revealed,
    ...remainingIcons
  ] = await Promise.all([
    "icons/happy.png",
    "icons/happy_pressed.png",
    "icons/surprised.png",
    "icons/lose.png",
    "icons/win.png",
    "icons/mine.png",
    "icons/mine_culprit.png",
    "icons/flag.png",
    "icons/revealed.png",
    ...Array.from({ length: 8 }, (_, index) =>
      `icons/revealed_${index + 1}.png`,
    ),
    "icons/unrevealed.png",
    "icons/panel_dash.png",
    ...Array.from({ length: 10 }, (_, index) => `icons/panel_${index}.png`),
  ].map((path) => loadImage(path)));

  const revealedNumbers = remainingIcons.slice(0, 8);
  const unrevealed = remainingIcons[8];
  const numberDash = remainingIcons[9];
  const numbers = remainingIcons.slice(10);

  icons = {
    happy,
    happyPressed,
    surprised,
    lose,
    win,
    mine,
    mineCulprit,
    flag,
    revealed,
    revealedNumbers: [undefined, ...revealedNumbers],
    unrevealed,
    numberDash,
    numbers,
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
