class IconDisplay {
  constructor() {
    this.icon = undefined;
  }

  setIcon(icon) {
    this.icon = icon;
  }

  draw(x, y, width, height) {
    if (this.icon == undefined) {
      return;
    }

    push();
    const previousSmoothing = drawingContext.imageSmoothingEnabled;
    drawingContext.imageSmoothingEnabled = false;
    imageMode(CORNER);
    image(this.icon, x, y, width, height);
    drawingContext.imageSmoothingEnabled = previousSmoothing;
    pop();
  }
}
