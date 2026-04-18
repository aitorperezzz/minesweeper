// Main object of the game
let arena;

// Sizes of several important objects of the game
let sizes = {};

function computeSizes() {
  const container = document.getElementById("sketch-holder");
  const rect = container.getBoundingClientRect();

  let availableWidth = rect.width;
  let availableHeight = rect.height;

  let canvasRatio = 2;
  let screenProportion = 0.95;

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

// p5js specific functions
function setup() {
  computeSizes();
  let canvas = createCanvas(sizes.canvasWidth, sizes.canvasHeight);
  canvas.parent("sketch-holder");

  // Initialize the global variables
  arena = new Arena(sizes.canvasWidth, sizes.canvasHeight);
}

function draw() {
  arena.draw();
}

function mousePressed() {
  arena.click(mouseX, mouseY);
}

function keyPressed() {
  if (key == "f") {
    arena.flag(mouseX, mouseY);
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
  computeSizes();
  resizeCanvas(sizes.canvasWidth, sizes.canvasHeight);
  arena.resize(sizes.canvasWidth, sizes.canvasHeight);
}
