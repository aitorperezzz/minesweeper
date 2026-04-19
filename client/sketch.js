// Main object of the game
let arena;
let sketchHolderObserver;

// Sizes of several important objects of the game
let sizes = {};

// Variables to handle icons
let icons = {};

// Buttons pressed
let buttonPressedPrimary = false;

// Number of cells occupied by the top header
const numCellsHeader = 3;
// Proportion of the canvas inside its container
const screenProportion = 0.95;
// The margin of the displays inside their respective containers
const displaysProportion = 0.8;
// Panel number dimensions
const panelNumberWidth = 13;
const panelNumberHeight = 23;

function computeSizes() {
  const container = document.getElementById("sketch-holder");
  const rect = container.getBoundingClientRect();

  // Compute the optimal canvas ratio
  let expertConfig = arenaConfig.expert;
  // Ratio will be width divided by height
  let canvasRatio = expertConfig.i / (expertConfig.j + numCellsHeader);

  let availableWidth = rect.width;
  let availableHeight = rect.height;

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

  // Initialize the global variables
  arena = new Arena(sizes.canvasWidth, sizes.canvasHeight);

  const holder = document.getElementById("sketch-holder");
  if ("ResizeObserver" in window) {
    sketchHolderObserver = new ResizeObserver(resizeGame);
    sketchHolderObserver.observe(holder);
  }

  scheduleResizeGame();
}

function draw() {
  arena.draw();
}

function mousePressed(event) {
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
  if (buttonPressedPrimary) {
    buttonPressedPrimary = false;
    arena.release(mouseX, mouseY);
  }
}

function keyPressed(event) {
  const isFindShortcut = event.ctrlKey || event.metaKey;
  if (!isFindShortcut && key.toLowerCase() === "f") {
    arena.flag(mouseX, mouseY);
    return false;
  }
}

function playBeginner() {
  arena.play("beginner");
}

function playIntermediate() {
  arena.play("intermediate");
}

function playExpert() {
  arena.play("expert");
}

function windowResized() {
  scheduleResizeGame();
}
