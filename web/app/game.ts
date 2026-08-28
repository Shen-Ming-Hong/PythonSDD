export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const STARTING_LIVES = 3;
export const STARTING_SCORE = 0;
export const BRICK_SCORE = 10;

export const BACKGROUND = '#0f172a';
export const PADDLE_COLOR = '#f1f5f9';
export const BALL_COLOR = '#ffffff';
export const BRICK_COLORS = [
  '#f472b6',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#38bdf8',
];

export type Brick = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  alive: boolean;
};

export type Paddle = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
};

export type Ball = {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  launched: boolean;
};

export type GameState = {
  bricks: Brick[];
  paddle: Paddle;
  ball: Ball;
  lives: number;
  score: number;
  gameOver: boolean;
  gameWon: boolean;
};

export type InputState = {
  left: boolean;
  right: boolean;
};

export function createBricks(): Brick[] {
  const rows = 5;
  const columns = 9;
  const brickWidth = 72;
  const brickHeight = 24;
  const gap = 8;
  const startX = 44;
  const startY = 70;
  const bricks: Brick[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      bricks.push({
        x: startX + column * (brickWidth + gap),
        y: startY + row * (brickHeight + gap),
        width: brickWidth,
        height: brickHeight,
        color: BRICK_COLORS[row],
        alive: true,
      });
    }
  }

  return bricks;
}

export function resetGame(): GameState {
  const paddle: Paddle = {
    x: (GAME_WIDTH - 120) / 2,
    y: GAME_HEIGHT - 50,
    width: 120,
    height: 16,
    speed: 8,
  };

  return {
    bricks: createBricks(),
    paddle,
    ball: {
      x: paddle.x + paddle.width / 2,
      y: paddle.y - 9,
      radius: 9,
      velocityX: 5,
      velocityY: -5,
      launched: false,
    },
    lives: STARTING_LIVES,
    score: STARTING_SCORE,
    gameOver: false,
    gameWon: false,
  };
}

function isColliding(ball: Ball, rectangle: Pick<Brick, 'x' | 'y' | 'width' | 'height'>): boolean {
  return (
    ball.x + ball.radius > rectangle.x &&
    ball.x - ball.radius < rectangle.x + rectangle.width &&
    ball.y + ball.radius > rectangle.y &&
    ball.y - ball.radius < rectangle.y + rectangle.height
  );
}

function bounceFromRectangle(
  ball: Ball,
  rectangle: Pick<Brick, 'x' | 'y' | 'width' | 'height'>,
) {
  const overlaps = {
    left: ball.x + ball.radius - rectangle.x,
    right: rectangle.x + rectangle.width - (ball.x - ball.radius),
    top: ball.y + ball.radius - rectangle.y,
    bottom: rectangle.y + rectangle.height - (ball.y - ball.radius),
  };
  const collisionSide = Object.entries(overlaps).sort(([, first], [, second]) => first - second)[0][0];

  if (collisionSide === 'left' || collisionSide === 'right') {
    ball.velocityX *= -1;
  } else {
    ball.velocityY *= -1;
  }
}

export function getAliveBrickCount(state: Pick<GameState, 'bricks'>): number {
  return state.bricks.filter((brick) => brick.alive).length;
}

function resetBallOnPaddle(state: GameState) {
  state.ball.launched = false;
  state.ball.x = state.paddle.x + state.paddle.width / 2;
  state.ball.y = state.paddle.y - state.ball.radius;
  state.ball.velocityX = 5;
  state.ball.velocityY = -5;
}

export function handleSpace(state: GameState): GameState {
  if (state.gameOver || state.gameWon) {
    return resetGame();
  }

  state.ball.launched = true;
  return state;
}

export function updateGame(
  state: GameState,
  input: InputState,
  frameScale = 1,
): void {
  if (state.gameOver || state.gameWon) {
    return;
  }

  const scale = Math.min(Math.max(frameScale, 0), 2);
  const direction = Number(input.right) - Number(input.left);
  state.paddle.x += direction * state.paddle.speed * scale;
  state.paddle.x = Math.max(
    0,
    Math.min(state.paddle.x, GAME_WIDTH - state.paddle.width),
  );

  if (!state.ball.launched) {
    state.ball.x = state.paddle.x + state.paddle.width / 2;
    state.ball.y = state.paddle.y - state.ball.radius;
    return;
  }

  state.ball.x += state.ball.velocityX * scale;
  state.ball.y += state.ball.velocityY * scale;

  if (state.ball.x - state.ball.radius <= 0) {
    state.ball.x = state.ball.radius;
    state.ball.velocityX = Math.abs(state.ball.velocityX);
  } else if (state.ball.x + state.ball.radius >= GAME_WIDTH) {
    state.ball.x = GAME_WIDTH - state.ball.radius;
    state.ball.velocityX = -Math.abs(state.ball.velocityX);
  }

  if (state.ball.y - state.ball.radius <= 0) {
    state.ball.y = state.ball.radius;
    state.ball.velocityY = Math.abs(state.ball.velocityY);
  }

  if (state.ball.y - state.ball.radius > GAME_HEIGHT) {
    state.lives -= 1;
    if (state.lives > 0) {
      resetBallOnPaddle(state);
    } else {
      state.lives = 0;
      state.gameOver = true;
      state.gameWon = false;
    }
    return;
  }

  if (state.ball.velocityY > 0 && isColliding(state.ball, state.paddle)) {
    state.ball.y = state.paddle.y - state.ball.radius;
    state.ball.velocityY = -Math.abs(state.ball.velocityY);
    const offset =
      (state.ball.x - (state.paddle.x + state.paddle.width / 2)) /
      (state.paddle.width / 2);
    state.ball.velocityX = 6 * offset;
  }

  for (const brick of state.bricks) {
    if (!brick.alive || !isColliding(state.ball, brick)) {
      continue;
    }

    brick.alive = false;
    state.score += BRICK_SCORE;
    bounceFromRectangle(state.ball, brick);

    if (getAliveBrickCount(state) === 0) {
      state.gameWon = true;
      state.gameOver = false;
    }
    break;
  }
}
