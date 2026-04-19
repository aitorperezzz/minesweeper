// Internal representation of a cell
class Cell extends IconDisplay {
  constructor(i, j) {
    super();

    this.i = i;
    this.j = j;

    // Initialize variables that store game information
    this.number = 0;
    this.revealed = false;
    this.mine = false;
    this.flag = false;
    this.mineCulprit = false;
  }

  draw(x, y, size) {
    if (this.revealed) {
      if (this.mineCulprit) {
        this.setIcon(icons.mineCulprit);
      } else if (this.mine) {
        this.setIcon(icons.mine);
      } else if (this.number != 0) {
        this.setIcon(icons.revealedNumbers[this.number]);
      } else {
        this.setIcon(icons.revealed);
      }
    } else if (this.flag) {
      this.setIcon(icons.flag);
    } else {
      this.setIcon(icons.unrevealed);
    }

    super.draw(x, y, size, size);
  }
}
