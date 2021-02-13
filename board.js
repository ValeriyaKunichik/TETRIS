class Board {
  context;
  context_next;
  grid;
  piece;
  next;
  request_id;
  time;

  constructor(context, context_next) {
    this.context = context;
    this.context_next = context_next;
    this.init();
  }

  init() {
    this.context.canvas.width = COLS * BLOCK_SIZE;
    this.context.canvas.height = ROWS * BLOCK_SIZE;
    this.context.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  reset() {
    this.grid = this.get_empty_grid();
    this.piece = new Piece(this.context);
    this.piece.set_starting_pos();
    this.get_new_piece();
  }

  get_new_piece() {
    this.next = new Piece(this.context_next);
    this.context_next.clearRect(
      0,
      0, 
      this.context_next.canvas.width, 
      this.context_next.canvas.height
    );
    this.next.draw();
  }

  draw() {
    this.piece.draw();
    this.draw_board();
  }

  drop() {
    let p = moves[KEY.DOWN](this.piece);
    if (this.valid(p)) {
      this.piece.move(p);
    } else {
      this.freeze();
      this.clear_lines();
      if (this.piece.y === 0) {   
        return false;
      }
      this.piece = this.next;
      this.piece.context = this.context;
      this.piece.set_starting_pos();
      this.get_new_piece();
    }
    return true;
  }

  clear_lines() {
    let lines = 0;

    this.grid.forEach((row, y) => {
      if (row.every(value => value > 0)) {
        lines++;
        this.grid.splice(y, 1);
        this.grid.unshift(Array(COLS).fill(0));
      }
    });
    
    if (lines > 0) {
      cleared_line.play();
      account.score += this.getLinesClearedPoints(lines);
      account.lines += lines;
      if (account.lines >= LINES_PER_LEVEL) {
        account.level++;  
        account.lines -= LINES_PER_LEVEL;
        time.level = LEVEL_TIME[account.level];
      }
    }
  }

  valid(p) {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx;
        let y = p.y + dy;
        return (
          value === 0 ||
          (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y))
        );
      });
    });
  }

  freeze() {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.grid[y + this.piece.y][x + this.piece.x] = value;
        }
      });
    });
  }

  draw_board() {
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.context.fillStyle = COLORS[value];
          this.context.fillRect(x, y, 1, 1);
        }
      });
    });
  }

  get_empty_grid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  insideWalls(x) {
    return x >= 0 && x < COLS;
  }

  aboveFloor(y) {
    return y <= ROWS;
  }

  notOccupied(x, y) {
    return this.grid[y] && this.grid[y][x] === 0;
  }

  rotate(piece) {
    let p = JSON.parse(JSON.stringify(piece));

    for (let y = 0; y < p.shape.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
      }
    }

    p.shape.forEach(row => row.reverse());
    return p;
  }

  getLinesClearedPoints(lines, level) {
    const lineClearPoints =
      lines === 1
        ? POINTS.SINGLE
        : lines === 2
        ? POINTS.DOUBLE
        : lines === 3
        ? POINTS.TRIPLE
        : lines === 4
        ? POINTS.TETRIS
        : 0;

    return (account.level + 1) * lineClearPoints;
  }
}
