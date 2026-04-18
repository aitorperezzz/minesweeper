// The cell will have a different color depending on the number
const colors = {
  1: [123, 104, 238], // Light blue
  2: [50, 205, 50], // Green
  3: [255, 0, 0], // Red
  4: [0, 0, 139], // Dark blue
  5: [139, 0, 0], // Dark red
  6: [32, 178, 170], // Sea green
  7: [0, 0, 0], // Black
  8: [100, 100, 100], // Grey
};

// Internal representation of a cell
class Cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;

    // Initialize variables that store game information
    this.number = 0;
    this.revealed = false;
    this.mine = false;
    this.flag = false;
  }

  draw(x, y, size) {
    // The background color of a cell is darker if it has not been
    // revealed
    stroke(100);
    strokeWeight(2);
    if (this.revealed) {
      fill(190);
    } else {
      fill(150);
    }
    rect(x, y, size, size);

    // Draw flags if necessary
    if (this.flag) {
      noStroke();
      fill(255, 0, 0);
      ellipse(x + size / 2, y + size / 2, size / 2, size / 2);
    }

    // Draw the rest of the things
    if (this.revealed) {
      // Draw the content
      if (this.mine) {
        // Draw an ellipse simulating the mine
        noStroke();
        fill(0);
        ellipse(x + size / 2, y + size / 2, size / 2, size / 2);
      } else if (this.number != 0) {
        // Draw the number
        fill(colors[this.number]);
        noStroke();
        textAlign(CENTER);
        textSize(18);
        textStyle(BOLD);
        text(this.number, x + size / 2, y + size * (2 / 3));
      }
    }
  }
}
