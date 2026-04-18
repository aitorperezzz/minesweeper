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
  }

  computeArenaSizes() {
    const headerProportion = 0.15;
    const displaysProportion = 0.8;

    // Sizes of the header
    this.headerWidth = this.canvasWidth;
    this.headerHeight = this.canvasHeight * headerProportion;
    this.headerx = 0;
    this.headery = 0;
    // Sizes of the grid below
    this.gridWidth = this.headerWidth;
    this.gridHeight = this.canvasHeight * (1 - headerProportion);
    this.gridx = 0;
    this.gridy = this.headerHeight;

    // inside the header

    // generic margin for the displays
    let margin =
      (this.headerHeight - this.headerHeight * displaysProportion) / 2;
    // mines left display (left)
    this.minesDisplayHeight = this.headerHeight - 2 * margin;
    this.minesDisplayWidth = (this.minesDisplayHeight * 3) / 2;
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
    this.faceDisplayy = this.headery + margin + this.faceDisplayHeight / 2;

    // inside the grid

    // I want that, even if the user changes mode, that the cells remain
    // of the same size. This is why it makes sense to compute the sizes
    // of the cells in the expert mode, which is the most restrictive.
    let config = arenaConfig.expert;
    // ratio is the width divided by the height
    let ratio = config.i / config.j;
    if (ratio * this.gridHeight < this.gridWidth) {
      // Decide according to vertical space
      this.cellSize = this.gridHeight / config.j;
    } else {
      // Decide according to horizontal space
      this.cellSize = this.gridWidth / config.i;
    }
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
    if (this.cells[i][j].mine) {
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
    // Stop the time
    this.timerDisplay.stop();
    // TODO print a message indicating that the user has lost
    // Reveal all the cells with mines
    this.revealAllMines();
  }

  win() {
    console.log("Win");
    // Stop the time
    this.timerDisplay.stop();
    // TODO print a message indicating that the user has won
  }

  // The user attempts to flag (or unflag)
  // at the given coordinates
  flag(mx, my) {
    let cell = this.getClickedCell(mx, my);
    if (cell != undefined) {
      if (!cell.revealed) {
        cell.flag = !cell.flag;
        this.numFlagged = cell.flag ? this.numFlagged + 1 : this.numFlagged - 1;
        this.minesLeftDisplay.updateNumber(this.mines - this.numFlagged);
      }
    }
  }

  // The player attempts to click (reveal)
  // in the given coordinates
  click(mx, my) {
    let cell = this.getClickedCell(mouseX, mouseY);
    if (cell != undefined) {
      this.reveal(cell.i, cell.j);
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

    // Draw soft lines all over
    fill("white");
    stroke(100);
    strokeWeight(1.0);
    for (let i = 0; i < this.inum + 1; i++) {
      line(
        this.cellsx + i * this.cellSize,
        this.cellsy,
        this.cellsx + i * this.cellSize,
        this.cellsy + this.cellSize * this.jnum,
      );
    }
    for (let j = 0; j < this.jnum + 1; j++) {
      line(
        this.cellsx,
        this.cellsy + j * this.cellSize,
        this.cellsx + this.inum * this.cellSize,
        this.cellsy + j * this.cellSize,
      );
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

    // Ignore if the cell is already revealed
    if (this.cells[i][j].revealed) {
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
