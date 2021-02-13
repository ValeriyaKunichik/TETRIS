class Piece {
  x;
  y;
  color;
  shape;
  context;
  type_id;

  constructor(context) {
    this.context = context;
    this.create();
  }

  create() {
    this.type_id = this.get_random_tetromino(COLORS.length - 1);
    this.shape = TETRIMINOS[this.type_id];
    this.color = COLORS[this.type_id];
    this.x = 0;
    this.y = 0;
  }

  draw() {
    this.context.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {          
          this.context.fillRect(this.x + x, this.y + y, 1, 1);
        }
      });
    });
  }

  move(p) {
    this.x = p.x;
    this.y = p.y;
    this.shape = p.shape;
  }

  set_starting_pos() {
    this.x = this.type_id === 4 ? 4 : 3;
  }

  get_random_tetromino(types_number) {
    return Math.floor(Math.random() * types_number + 1);
  }
}
