// Classic Windows 95 Minesweeper colors
const colors = {
  1: [0, 0, 255], // Blue
  2: [0, 128, 0], // Green
  3: [255, 0, 0], // Red
  4: [0, 0, 128], // Dark blue
  5: [128, 0, 0], // Dark red
  6: [0, 128, 128], // Dark cyan
  7: [0, 0, 0], // Black
  8: [128, 128, 128], // Gray
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
    // if not reveled, paint it darker and with solid border
    if (!this.revealed) {
      stroke(50);
      strokeWeight(1.5);
      fill(140);
      rect(x, y, size, size);

      if (this.flag) {
        noStroke();
        fill(255, 0, 0);
        ellipse(x + size / 2, y + size / 2, size / 2, size / 2);
      }
      return;
    }

    // mine
    if (this.mine) {
      // Draw an ellipse simulating the mine
      noStroke();
      fill(0);
      ellipse(x + size / 2, y + size / 2, size / 2, size / 2);
    } else if (this.number != 0) {
      // Write the number with the correct color
      fill(colors[this.number]);
      noStroke();
      textAlign(CENTER);
      textSize(size * 0.75);
      textStyle(BOLD);
      text(this.number, x + size / 2, y + size * (3 / 4));
    }
  }
}
