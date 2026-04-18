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
  let screenProportion = 0.9;

  if (availableHeight * canvasRatio < availableWidth) {
    // Decide according to vertical space
    sizes.canvasy = screenProportion * availableHeight;
    sizes.canvasx = sizes.canvasy * canvasRatio;
  } else {
    // Decide according to horizontal space
    sizes.canvasx = screenProportion * availableWidth;
    sizes.canvasy = sizes.canvasx / canvasRatio;
  }
}

// p5js specific functions
function setup() {
  computeSizes();
  let canvas = createCanvas(sizes.canvasx, sizes.canvasy);
  canvas.parent("sketch-holder");

  // Initialize the global variables
  arena = new Arena(sizes.canvasx, sizes.canvasy);
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
  resizeCanvas(sizes.canvasx, sizes.canvasy);
  arena.resize(sizes.canvasx, sizes.canvasy);
}
