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
  constructor(canvasx, canvasy) {
    // Keep a copy of the canvas dimensions
    this.canvasx = canvasx;
    this.canvasy = canvasy;
    // the size of the cells can already be computed
    this.computeCellSize();

    // create the placeholders for the grid of cells
    this.cells = [];

    // no game for the moment
    this.mode = undefined;
  }

  play(mode) {
    console.log("Starting game in mode " + mode);
    this.mode = mode;

    // configuration depending on the mode
    let config = arenaConfig[mode];
    this.inum = config.i;
    this.jnum = config.j;
    this.mines = config.mines;

    // recompute the initial coordinates of the grid
    this.computeArenaSize();

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
  }

  computeCellSize() {
    // I want that, even if the user changes mode, that the cells remain
    // of the same size. This is why it makes sense to compute the sizes
    // of the cells in the expert mode, which is the most restrictive.
    let config = arenaConfig.expert;
    // ratio is the width divided by the height
    let ratio = config.i / config.j;
    if (ratio * this.canvasy < this.canvasx) {
      // Decide according to vertical space
      this.cellSize = this.canvasy / config.j;
    } else {
      // Decide according to horizontal space
      this.cellSize = this.canvasx / config.i;
    }
  }

  computeArenaSize() {
    this.x = (this.canvasx - this.inum * this.cellSize) / 2;
    this.y = (this.canvasy - this.jnum * this.cellSize) / 2;
  }

  resize(canvasx, canvasy) {
    this.canvasx = canvasx;
    this.canvasy = canvasy;
    this.computeCellSize();
    if (this.mode != undefined) {
      this.computeArenaSize();
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
    // TODO print a message indicating that the user has lost
    // Reveal the arena completely
    this.revealAll();
  }

  win() {
    console.log("Win");
    // TODO print a message indicating that the user has won
  }

  // The user attempts to flag (or unflag)
  // at the given coordinates
  flag(mx, my) {
    let cell = this.getClickedCell(mx, my);
    if (cell != undefined) {
      cell.flag = !cell.flag;
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
    if (this.mode == undefined) {
      background(0);
    } else {
      // Call the draw function for each cell
      for (let i = 0; i < this.inum; i++) {
        for (let j = 0; j < this.jnum; j++) {
          this.cells[i][j].draw(
            this.x + i * this.cellSize,
            this.y + j * this.cellSize,
            this.cellSize,
          );
        }
      }
    }
  }

  getClickedCell(mx, my) {
    // general boundaries of the arena
    if (mx < this.x || this.x + this.cellSize * this.inum < mx) {
      return undefined;
    }
    if (my < this.y || this.y + this.cellSize * this.jnum < my) {
      return undefined;
    }

    // get the coordinate of the cell
    for (let i = 0; i < this.inum; i++) {
      for (let j = 0; j < this.jnum; j++) {
        let clicked =
          this.x + i * this.cellSize < mx &&
          mx < this.x + (i + 1) * this.cellSize &&
          this.y + j * this.cellSize < my &&
          my < this.y + (j + 1) * this.cellSize;
        if (clicked) {
          return this.cells[i][j];
        }
      }
    }

    return undefined;
  }

  revealAll() {
    // Reveal every cell
    for (let i = 0; i < this.inum; i++) {
      for (let j = 0; j < this.jnum; j++) {
        this.cells[i][j].revealed = true;
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
