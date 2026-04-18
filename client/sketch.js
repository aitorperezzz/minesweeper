// Main object of the game
let arena;

// Sizes of several important objects of the game
let sizes = {};

function computeSizes() {
  // canvas ratio is width divided by height
  let canvasRatio = 2;

  // the amount of the screen (vertically or horizontally)
  // that the application will occupy
  let screenProportion = 0.9;

  // Compute the sizes of the p5js grid
  if (windowHeight * canvasRatio < windowWidth) {
    // Decide according to vertical space
    sizes.canvasy = screenProportion * windowHeight;
    sizes.canvasx = sizes.canvasy * canvasRatio;
  } else {
    // Decide according to horizontal space
    sizes.canvasx = screenProportion * windowWidth;
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
  background(225);
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
