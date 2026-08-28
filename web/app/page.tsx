'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BACKGROUND,
  BALL_COLOR,
  GAME_HEIGHT,
  GAME_WIDTH,
  PADDLE_COLOR,
  type GameState,
  handleSpace,
  resetGame,
  updateGame,
  type InputState,
} from './game';

type ResultState = '' | 'won' | 'game-over';

function getResultState(state: GameState): ResultState {
  if (state.gameWon) {
    return 'won';
  }
  if (state.gameOver) {
    return 'game-over';
  }
  return '';
}

function drawGame(canvas: HTMLCanvasElement, state: GameState) {
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  for (const brick of state.bricks) {
    if (!brick.alive) {
      continue;
    }

    context.fillStyle = brick.color;
    context.beginPath();
    context.roundRect(brick.x, brick.y, brick.width, brick.height, 5);
    context.fill();
  }

  context.fillStyle = PADDLE_COLOR;
  context.beginPath();
  context.roundRect(
    state.paddle.x,
    state.paddle.y,
    state.paddle.width,
    state.paddle.height,
    8,
  );
  context.fill();

  context.fillStyle = BALL_COLOR;
  context.beginPath();
  context.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  context.fill();
}

export default function Home() {
  const [initialState] = useState<GameState>(() => resetGame());
  const gameRef = useRef<GameState>(initialState);
  const inputRef = useRef<InputState>({ left: false, right: false });
  const gameRegionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hud, setHud] = useState({
    lives: initialState.lives,
    score: initialState.score,
  });
  const [result, setResult] = useState<ResultState>('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const gameRegion = gameRegionRef.current;
    if (!canvas || !gameRegion) {
      return;
    }

    let animationFrame = 0;
    let previousTime: number | null = null;
    let previousLives = gameRef.current.lives;
    let previousScore = gameRef.current.score;
    let previousResult = getResultState(gameRef.current);

    const syncHud = (state: GameState) => {
      setHud({ lives: state.lives, score: state.score });
      setResult(getResultState(state));
    };

    const clearInput = () => {
      inputRef.current.left = false;
      inputRef.current.right = false;
    };

    const isSpace = (event: KeyboardEvent) =>
      event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar';
    const isLeft = (event: KeyboardEvent) =>
      event.code === 'ArrowLeft' ||
      event.key === 'ArrowLeft' ||
      event.code === 'KeyA' ||
      event.key.toLowerCase() === 'a';
    const isRight = (event: KeyboardEvent) =>
      event.code === 'ArrowRight' ||
      event.key === 'ArrowRight' ||
      event.code === 'KeyD' ||
      event.key.toLowerCase() === 'd';

    const onKeyDown = (event: KeyboardEvent) => {
      if (isSpace(event)) {
        event.preventDefault();
        if (event.repeat) {
          return;
        }

        const nextState = handleSpace(gameRef.current);
        gameRef.current = nextState;
        syncHud(nextState);
        return;
      }

      if (isLeft(event) || isRight(event)) {
        event.preventDefault();
        if (gameRef.current.gameOver || gameRef.current.gameWon) {
          return;
        }
        if (isLeft(event)) {
          inputRef.current.left = true;
        }
        if (isRight(event)) {
          inputRef.current.right = true;
        }
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isLeft(event)) {
        inputRef.current.left = false;
      }
      if (isRight(event)) {
        inputRef.current.right = false;
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        clearInput();
      }
    };

    const renderFrame = (time: number) => {
      const state = gameRef.current;
      const frameScale = previousTime === null
        ? 1
        : Math.min(Math.max((time - previousTime) / (1000 / 60), 0), 2);
      previousTime = time;

      if (!state.gameOver && !state.gameWon) {
        updateGame(state, inputRef.current, frameScale);
      }
      drawGame(canvas, state);

      const nextResult = getResultState(state);
      if (state.lives !== previousLives || state.score !== previousScore) {
        previousLives = state.lives;
        previousScore = state.score;
        setHud({ lives: state.lives, score: state.score });
      }
      if (nextResult !== previousResult) {
        previousResult = nextResult;
        setResult(nextResult);
      }

      animationFrame = requestAnimationFrame(renderFrame);
    };

    gameRegion.addEventListener('keydown', onKeyDown);
    gameRegion.addEventListener('keyup', onKeyUp);
    gameRegion.addEventListener('blur', clearInput);
    window.addEventListener('blur', clearInput);
    document.addEventListener('visibilitychange', onVisibilityChange);
    gameRegion.focus({ preventScroll: true });
    animationFrame = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animationFrame);
      gameRegion.removeEventListener('keydown', onKeyDown);
      gameRegion.removeEventListener('keyup', onKeyUp);
      gameRegion.removeEventListener('blur', clearInput);
      window.removeEventListener('blur', clearInput);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <main className="site-shell">
      <section className="game-card" aria-labelledby="game-title">
        <div className="intro-row">
          <div>
            <p className="eyebrow">CHECKPOINT 07 · WEB EDITION</p>
            <h1 id="game-title">敲磚塊</h1>
            <p className="subtitle">用底板接住球，清除整個彩色版面。</p>
          </div>
          <div className="status-pills" aria-label="遊戲目前狀態">
            <span>Lives: {hud.lives}</span>
            <span>Score: {hud.score}</span>
          </div>
        </div>

        <div className="game-frame">
          <div
            ref={gameRegionRef}
            className="game-region"
            tabIndex={0}
            role="group"
            aria-label="敲磚塊遊戲操作區"
            aria-describedby="game-instructions game-status"
            onPointerDown={() => gameRegionRef.current?.focus({ preventScroll: true })}
          >
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className="game-canvas"
              aria-hidden="true"
            />
            {result && (
              <div className="result-overlay">
                <div className="result-content">
                  <p className="result-kicker">ROUND COMPLETE</p>
                  <h2>{result === 'won' ? 'You Win' : 'Game Over'}</h2>
                  <p className="result-hint">Press SPACE to restart</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p id="game-status" className="status-bar" role="status" aria-live="polite">
          Lives: {hud.lives} · Score: {hud.score}
          {result === 'won' && ' · You Win'}
          {result === 'game-over' && ' · Game Over'}
        </p>

        <p id="game-instructions" className="controls-hint">
          準備開始：按 <kbd>SPACE</kbd> 發球，使用 <kbd>←</kbd> <kbd>→</kbd> 或{' '}
          <kbd>A</kbd> <kbd>D</kbd> 移動底板。
        </p>
      </section>
    </main>
  );
}
