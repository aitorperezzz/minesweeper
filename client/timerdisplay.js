class TimerDisplay extends NumberDisplay {
  constructor() {
    super();
    this.begin = 0;
    this.running = false;
  }

  start() {
    this.begin = Date.now();
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  updateTime() {
    if (this.running) {
      let time = Math.floor((Date.now() - this.begin) / 1000);
      this.updateNumber(time);
    }
  }

  draw(x, y, width, height) {
    this.updateTime();
    super.draw(x, y, width, height);
  }
}
