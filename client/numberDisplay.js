class NumberDisplay {
  constructor() {
    this.number = 0;
    this.numberDisplays = [];
    for (let i = 0; i < 3; i++) {
      this.numberDisplays.push(new IconDisplay());
    }
  }

  updateNumber(number) {
    if (number < -99) {
      this.number = -99;
    } else if (number > 999) {
      this.number = 999;
    } else {
      this.number = number;
    }
  }

  draw(x, y, width, height) {
    let absNumber = Math.abs(this.number);
    let numberParts = [
      Math.floor(absNumber / 100),
      Math.floor((absNumber % 100) / 10),
      absNumber % 10,
    ];
    for (let i = 0; i < 3; i++) {
      this.numberDisplays[i].setIcon(icons.numbers[numberParts[i]]);
    }
    if (this.number < 0) {
      this.numberDisplays[0].setIcon(icons.numberDash);
    }
    for (let i = 0; i < 3; i++) {
      this.numberDisplays[i].draw(x + (i * width) / 3, y, width / 3, height);
    }
  }
}
