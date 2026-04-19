// Main object of the game
let arena;
let sketchHolderObserver;

// Sizes of several important objects of the game
let sizes = {};

// Variables to handle icons
let faceHappy, faceSurprised, faceLose, faceWin;

// Buttons pressed
let buttonPressedPrimary = false;
let buttonPressedSecondary = false;

// Number of cells occupied by the top header
const numCellsHeader = 3;
// Proportion of the canvas inside its container
const screenProportion = 0.95;
// The margin of the displays inside their respective containers
const displaysProportion = 0.8;

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
  faceHappy = await loadImage("icons/happy.png");
  faceSurprised = await loadImage("icons/surprised.png");
  faceLose = await loadImage("icons/lose.png");
  faceWin = await loadImage("icons/win.png");

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
    buttonPressedSecondary = true;
  }

  if (isSecondaryClick) {
    return false;
  }
}

function mouseReleased() {
  if (buttonPressedPrimary) {
    buttonPressedPrimary = false;
    arena.release(mouseX, mouseY);
  } else if (buttonPressedSecondary) {
    buttonPressedSecondary = false;
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
