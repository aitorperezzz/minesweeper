class TimerDisplay extends NumberDisplay {
  constructor() {
    super();
    this.reset();
  }

  start() {
    this.begin = Date.now();
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  reset() {
    this.begin = 0;
    this.running = false;
    this.updateNumber(0);
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
