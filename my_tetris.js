const canvas = document.getElementById('board');
const context = canvas.getContext('2d');
const canvas_next = document.getElementById('next');
const context_next = canvas_next.getContext('2d');
const cleared_line =new Audio('./audio/tada.wav'); 


let dashboard_vals = {
  score: 0,
  level: 0,
  lines: 0
}

function update_account(key, value) {
  let element = document.getElementById(key);
  if (element) {  
    element.textContent = value;
  }
}

let account = new Proxy(dashboard_vals, {
  set: (target, key, value) => {
    target[key] = value;
    update_account(key, value);
    return true;
  }
});

let request_id;

moves = {
  [KEY.LEFT]: p => ({ ...p, x: p.x - 1 }),
  [KEY.RIGHT]: p => ({ ...p, x: p.x + 1 }),
  [KEY.DOWN]: p => ({ ...p, y: p.y + 1 }),
  [KEY.SPACE]: p => ({ ...p, y: p.y + 1 }),
  [KEY.UP]: p => board.rotate(p)
};

let board = new Board(context, context_next);
add_event_listener();
init_next();

function init_next() {  
  context_next.canvas.width = 4 * BLOCK_SIZE;
  context_next.canvas.height = 4 * BLOCK_SIZE;
  context_next.scale(BLOCK_SIZE, BLOCK_SIZE);
}

function add_event_listener() {
  document.addEventListener('keydown', event => {
    if (event.keyCode === KEY.P) {
      pause();
    }
    if (event.keyCode === KEY.ESC) {
      game_over();
    } else if (moves[event.keyCode]) {
      event.preventDefault();
      let p = moves[event.keyCode](board.piece);
      if (event.keyCode === KEY.SPACE) {
        while (board.valid(p)) {
          account.score += POINTS.HARD_DROP;
          board.piece.move(p);
          p = moves[KEY.DOWN](board.piece);
        }       
      } else if (board.valid(p)) {
        board.piece.move(p);
        if (event.keyCode === KEY.DOWN) {
          account.score += POINTS.SOFT_DROP;         
        }
      }
    }
  });
}



function play_game() {
  reset_game();
  time.start = performance.now();
  if (request_id) {
    cancelAnimationFrame(request_id);
  }  
  animate();  
}

function animate(now = 0) {    
  time.elapsed = now - time.start;
  if (time.elapsed > time.level) {
    time.start = now;   
    if (!board.drop()) {
      game_over();
      return;
    }
  }
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  board.draw();
  request_id = requestAnimationFrame(animate);
}

function reset_game() { 
  account.score = 0;
  account.lines = 0;
  account.level = 0;
  board.reset();
  time = { start: 0, elapsed: 0, level: LEVEL_TIME[account.level] };
}

function pause() {
  if (!request_id) {
    animate();
    return;
  }

  cancelAnimationFrame(request_id);
  request_id = null; 
  context.fillStyle = 'gray';
  context.fillRect(1, 3, 8, 1.2);
  context.font = '1px Arial';
  context.fillStyle = 'white';
  context.fillText('PAUSED', 3, 4);
}

function game_over() {
  cancelAnimationFrame(request_id);
  context.fillStyle = '#DCDCDC';
  context.fillRect(1, 3, 8, 1.2);
  context.font = '1px Arial';
  context.fillStyle = 'black';
  context.fillText('GAME OVER', 1.8, 4);
}
