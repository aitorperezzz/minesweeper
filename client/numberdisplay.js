class NumberDisplay {
  constructor() {
    this.number = 0;
  }

  updateNumber(number) {
    if (number < 0) {
      this.number = 0;
    } else if (number > 999) {
      this.number = 999;
    } else {
      this.number = number;
    }
  }

  draw(x, y, width, height) {
    push();

    // background
    rectMode(CORNER);
    stroke(0);
    strokeWeight(1);
    fill("black");
    rect(x, y, width, height);
    // text
    fill("white");
    textAlign(LEFT, BASELINE);
    textSize(height * 0.75);
    textStyle(BOLD);
    text(
      String(this.number).padStart(3, "0"),
      x + width / 6,
      y + height * (3 / 4),
    );

    pop();
  }
}
