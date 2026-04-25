class ClickableIconDisplay extends IconDisplay {
  constructor(releasedIcon, pressedIcon) {
    super();
    this.releasedIcon = releasedIcon;
    this.pressedIcon = pressedIcon;
  }

  press() {
    super.setIcon(this.pressedIcon);
  }

  release() {
    super.setIcon(this.releasedIcon);
  }

  draw(x, y, width, height) {
    super.draw(x, y, width, height);
  }
}
