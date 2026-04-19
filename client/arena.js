// Size of the grid and number of mines to place depending
// on the difficulty
const arenaConfig = {
  beginner: {
    i: 9,
    j: 9,
    mines: 10,
  },
  intermediate: {
    i: 16,
    j: 16,
    mines: 40,
  },
  expert: {
    i: 30,
    j: 16,
    mines: 99,
  },
};

class Arena {
  constructor(canvasWidth, canvasHeight) {
    // Keep a copy of the canvas dimensions
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    // compute generic sizes in the arena
    this.computeArenaSizes();

    // counters and displays
    this.faceDisplay = new IconDisplay();
    this.timerDisplay = new TimerDisplay();
    this.minesLeftDisplay = new NumberDisplay();

    // The game starts in beginner mode
    this.play("beginner");
  }

  play(mode) {
    console.log("Starting game in mode " + mode);
    this.mode = mode;

    // configuration depending on the mode
    let config = arenaConfig[mode];
    this.inum = config.i;
    this.jnum = config.j;
    this.mines = config.mines;

    // recompute the initial coordinates of the cells area
    this.computeCellsCoordinates();

    // Create a grid with the appropriate number of cells
    this.cells = [];
    for (let i = 0; i < this.inum; i++) {
      this.cells.push([]);
      for (let j = 0; j < this.jnum; j++) {
        this.cells[i].push(new Cell(i, j));
      }
    }

    // Populate some of the cells with the appropriate number of mines
    let minesPlaced = 0;
    while (minesPlaced < this.mines) {
      let iCandidate = int(random(0, this.inum));
      let jCandidate = int(random(0, this.jnum));
      if (this.cells[iCandidate][jCandidate].mine == false) {
        // Make this cell a mine and update the number of mines placed
        this.cells[iCandidate][jCandidate].mine = true;
        minesPlaced++;
      }
    }

    // Calculate the number of surrounding mines for each cell
    for (let i = 0; i < this.inum; i++) {
      for (let j = 0; j < this.jnum; j++) {
        this.assignNumber(i, j);
      }
    }

    // Number of cells that have been flagged is zero
    this.numFlagged = 0;
    // Update counter
    this.minesLeftDisplay.updateNumber(this.mines);

    // Counter indicating if the first click has happened
    this.firstClickHappened = false;

    // Reset the timer
    this.timerDisplay.reset();

    // Face resets to happy
    this.faceDisplay.setIcon(icons.happy);

    // Flag used to disable all inputs when the user has won or lost
    this.playing = true;
  }

  computeArenaSizes() {
    // The cell size simply depends on the width, because the expert mode
    // needs to occupy the horizontal space fully
    this.cellSize = this.canvasWidth / arenaConfig.expert.i;

    // Sizes of the header
    this.headerWidth = this.canvasWidth;
    this.headerHeight = this.cellSize * numCellsHeader;
    this.headerx = 0;
    this.headery = 0;
    // Sizes of the grid below
    this.gridWidth = this.canvasWidth;
    this.gridHeight = this.cellSize * arenaConfig.expert.j;
    this.gridx = 0;
    this.gridy = this.headerHeight;

    // inside the header

    // generic margin for the displays
    let margin =
      (this.headerHeight - this.headerHeight * displaysProportion) / 2;
    // mines left display (left)
    this.minesDisplayHeight = this.headerHeight - 2 * margin;
    this.minesDisplayWidth =
      (this.minesDisplayHeight * 3 * panelNumberWidth) / panelNumberHeight;
    this.minesDisplayx = this.headerx + margin;
    this.minesDisplayy = this.headery + margin;
    // timer display (right)
    this.timerDisplayHeight = this.minesDisplayHeight;
    this.timerDisplayWidth = this.minesDisplayWidth;
    this.timerDisplayx =
      this.headerx + this.headerWidth - margin - this.timerDisplayWidth;
    this.timerDisplayy = this.headery + margin;
    // face icon display (center)
    this.faceDisplayHeight = this.minesDisplayHeight;
    this.faceDisplayWidth = this.faceDisplayHeight;
    this.faceDisplayx =
      this.headerx + this.headerWidth / 2 - this.faceDisplayWidth / 2;
    this.faceDisplayy = this.headery + margin;
  }

  computeCellsCoordinates() {
    this.cellsx = this.gridx + (this.gridWidth - this.inum * this.cellSize) / 2;
    this.cellsy =
      this.gridy + (this.gridHeight - this.jnum * this.cellSize) / 2;
  }

  resize(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.computeArenaSizes();
    if (this.mode != undefined) {
      this.computeCellsCoordinates();
    }
  }

  assignNumber(i, j) {
    // Receives a cell and assigns the number of mines
    // surrounding it

    let cell = this.cells[i][j];
    if (cell.mine == false) {
      // In this case we have to assign a number
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue;
          if (this.isAccessible(i + di, j + dj)) {
            if (this.cells[i + di][j + dj].mine) {
              cell.number++;
            }
          }
        }
      }
    }
  }

  reveal(i, j) {
    // A flagged cell is protected against reveal
    if (this.cells[i][j].flag) {
      return;
    }

    if (this.cells[i][j].mine) {
      // This mine is the culprit
      this.cells[i][j].mineCulprit = true;
      // if the cell is a mine, we need to end the game
      this.lose();
    } else {
      // If this is the first reveal, start the timer
      if (!this.firstClickHappened) {
        this.firstClickHappened = true;
        this.timerDisplay.start();
      }

      // flood fill the cell
      this.flood(i, j);
      // Check if the user has won
      for (let i = 0; i < this.inum; i++) {
        for (let j = 0; j < this.jnum; j++) {
          if (!this.cells[i][j].mine && !this.cells[i][j].revealed) {
            // Player still has not won
            return;
          }
        }
      }
      // At this point, the user has won
      this.win();
    }
  }

  lose() {
    console.log("Lose");
    this.timerDisplay.stop();
    this.playing = false;
    this.faceDisplay.setIcon(icons.lose);
    // Reveal all the cells with mines
    this.revealAllMines();
  }

  win() {
    console.log("Win");
    this.timerDisplay.stop();
    this.playing = false;
    this.faceDisplay.setIcon(icons.win);
  }

  // The user attempts to flag (or unflag)
  // at the given coordinates
  flag(mx, my) {
    if (this.playing) {
      let cell = this.getClickedCell(mx, my);
      if (cell != undefined) {
        if (!cell.revealed) {
          cell.flag = !cell.flag;
          this.numFlagged = cell.flag
            ? this.numFlagged + 1
            : this.numFlagged - 1;
          this.minesLeftDisplay.updateNumber(this.mines - this.numFlagged);
        }
      }
    }
  }

  // Pressing on the cells area only changes the face
  press(mx, my) {
    if (this.playing) {
      let cell = this.getClickedCell(mx, my);
      // Only put the surprised face if the cell is not revealed
      // and not flagged (meaning it would be revealed)
      if (cell != undefined && !cell.revealed && !cell.flag) {
        this.faceDisplay.setIcon(icons.surprised);
      }
    }
  }

  // Releasing the primary button is an attempt to reveal a cell
  release(mx, my) {
    if (this.playing) {
      let cell = this.getClickedCell(mx, my);
      if (cell != undefined) {
        arena.faceDisplay.setIcon(icons.happy);
        this.reveal(cell.i, cell.j);
      }
    }
  }

  draw() {
    // The background of the complete canvas is always there
    background(180);

    // Draw the displays
    this.minesLeftDisplay.draw(
      this.minesDisplayx,
      this.minesDisplayy,
      this.minesDisplayWidth,
      this.minesDisplayHeight,
    );
    this.timerDisplay.draw(
      this.timerDisplayx,
      this.timerDisplayy,
      this.timerDisplayWidth,
      this.timerDisplayHeight,
    );
    this.faceDisplay.draw(
      this.faceDisplayx,
      this.faceDisplayy,
      this.faceDisplayWidth,
      this.faceDisplayHeight,
    );

    if (this.mode == undefined) {
      return;
    }

    // Call the draw function for each cell
    for (let i = 0; i < this.inum; i++) {
      for (let j = 0; j < this.jnum; j++) {
        this.cells[i][j].draw(
          this.cellsx + i * this.cellSize,
          this.cellsy + j * this.cellSize,
          this.cellSize,
        );
      }
    }
  }

  getClickedCell(mx, my) {
    // general boundaries of the arena
    if (mx < this.cellsx || this.cellsx + this.cellSize * this.inum < mx) {
      return undefined;
    }
    if (my < this.cellsy || this.cellsy + this.cellSize * this.jnum < my) {
      return undefined;
    }

    // get the coordinate of the cell
    for (let i = 0; i < this.inum; i++) {
      for (let j = 0; j < this.jnum; j++) {
        let clicked =
          this.cellsx + i * this.cellSize < mx &&
          mx < this.cellsx + (i + 1) * this.cellSize &&
          this.cellsy + j * this.cellSize < my &&
          my < this.cellsy + (j + 1) * this.cellSize;
        if (clicked) {
          return this.cells[i][j];
        }
      }
    }

    return undefined;
  }

  revealAllMines() {
    // Reveal every cell
    for (let i = 0; i < this.inum; i++) {
      for (let j = 0; j < this.jnum; j++) {
        if (this.cells[i][j].mine) {
          this.cells[i][j].revealed = true;
        }
      }
    }
  }

  flood(i, j) {
    // Ignore if the cell is not accesible
    if (!this.isAccessible(i, j)) {
      return;
    }

    // Ignore if the cell is already revealed or flagged
    if (this.cells[i][j].revealed || this.cells[i][j].flag) {
      return;
    }

    // This is a special condition for flood fill in the case of minesweeper:
    // the user clicks. If the cell has:
    // - a zero: reveal the cell AND expand to the neighbors
    // - another number: reveal the cell but DO NOT EXPAND

    // flood the cell itself
    this.cells[i][j].revealed = true;

    // If it has a zero, try to flood all the 8 neighbors
    if (this.cells[i][j].number == 0) {
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue;
          this.flood(i + di, j + dj);
        }
      }
    }
  }

  isAccessible(i, j) {
    return i >= 0 && i < this.inum && j >= 0 && j < this.jnum;
  }
}
