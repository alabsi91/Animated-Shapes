/* eslint-disable react-hooks/exhaustive-deps */
import { animare } from 'animare';
import { useEffect, useRef, useState } from 'react';
import { useLazyCss } from '..';
import styles from './PingPong.lazy.css';

export default function PingPong() {
  useLazyCss(styles);

  const [play, setAnimation] = useState();
  const isRunning = useRef(false);
  const timer = useRef();

  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

  const ball = () => {
    const paddle = document.querySelector('.Paddle');
    const score = document.querySelector('.Score');
    const wall = document.querySelector('.Wall');
    const wallHeight = wall.getBoundingClientRect().height;
    const ball = document.querySelector('.Ball');
    const ballSize = ball.getBoundingClientRect().height;
    const space = document.querySelector('.Space');
    const { width, height } = space.getBoundingClientRect();
    const hitAudio = new Audio(require('./pong.mp3'));
    const explosionAudio = new Audio(require('./explosion.mp3'));

    let duration = 2000;
    let currentScore = 0;
    let wallLastPosition = height / 2;
    let randomToPaddle = random(0, height - ballSize);
    let randomToWall = random(0, height - ballSize);

    const toPaddleOptions = {
      from: [0, height / 2 - ballSize / 2],
      to: [window.innerWidth, randomToPaddle],
      duration,
      autoPlay: false,
    };
    const toPaddleCb = ([x, y], { isFinished, pause }) => {
      if (!document.body.contains(ball)) pause();
      ball.style.left = x + 'px';
      ball.style.top = y + 'px';
      if (collisionDetection()) onCollision(x, y);
      if (isFinished) gameOver();
    };
    const toPaddle = animare(toPaddleOptions, toPaddleCb);

    const collisionDetection = () => {
      const { top, bottom, left } = paddle.getBoundingClientRect();
      const ballTop = ball.getBoundingClientRect().top;
      const ballBottom = ball.getBoundingClientRect().bottom;
      const ballRight = ball.getBoundingClientRect().right;

      if (ballBottom >= top && ballTop <= bottom && ballRight >= left) return true;

      return false;
    };

    const onCollision = (x, y) => {
      toPaddle.stop();
      hitAudio.play();
      currentScore += 50;
      score.innerHTML = 'Score: ' + currentScore;
      randomToWall = random(0, height - ballSize);
      toWall.setOptions({ from: [x, y], to: [0, randomToWall] });
      wallPaddle.setOptions({ from: wallLastPosition, to: randomToWall });
      toWall.play();
      wallPaddle.play();
    };

    const gameOver = () => {
      explosionAudio.play();
      isRunning.current = false;
      alert('Game Over!! You scored :' + currentScore);
      currentScore = 0;
      score.innerHTML = 'Score: 0';
      ball.style.left = '0px';
      ball.style.top = height / 2 - ballSize / 2 + 'px';
      wallLastPosition = height / 2;
      wall.style.marginTop = height / 2 - wallHeight / 2 + 'px';
      duration = 2000;
      toPaddle.setOptions({ from: [0, height / 2 - ballSize / 2], duration });
      toWall.setOptions({ duration });
      wallPaddle.setOptions({ duration });
    };

    const toWallOptions = {
      from: [width - ballSize, randomToWall],
      to: [0, height / 2],
      duration,
      autoPlay: false,
    };
    const toWallCb = ([x, y], { isFinished, pause }) => {
      if (!document.body.contains(ball)) pause();
      ball.style.left = x + 'px';
      ball.style.top = y + 'px';
      if (isFinished) {
        hitAudio.play();
        randomToPaddle = random(0, height - ballSize);
        toPaddle.setOptions({ from: [0, randomToWall], to: [window.innerWidth, randomToPaddle] });
        toPaddle.play();
      }
    };
    const toWall = animare(toWallOptions, toWallCb);

    const wallPaddleCb = ([y], { isFinished, pause }) => {
      if (!document.body.contains(ball)) pause();
      wall.style.marginTop = y - wallHeight / 2 + 'px';
      if (isFinished) wallLastPosition = y;
    };
    const wallPaddle = animare({ from: wallLastPosition, to: 0, duration, autoPlay: false }, wallPaddleCb);

    setAnimation(toPaddle);

    timer.current = setInterval(() => {
      if (duration < 200 || !isRunning.current) return;
      duration -= 50;
      toPaddle.setOptions({ duration });
      toWall.setOptions({ duration });
      wallPaddle.setOptions({ duration });
    }, 2000);
  };

  const movePaddle = e => {
    const paddle = document.querySelector('.Paddle');
    paddle.style.marginTop = e.clientY - paddle.offsetHeight / 2 + 'px';
  };

  useEffect(() => {
    ball();
    window.addEventListener('mousemove', movePaddle);

    return () => {
      window.removeEventListener('mousemove', movePaddle);
      clearInterval(timer.current);
    };
  }, []);

  return (
    <div
      className='Game'
      onClick={() => {
        if (isRunning.current) return;
        isRunning.current = true;
        play.play();
      }}
    >
      <div className='Wall' />
      <div className='Space'>
        <div className='Ball' />
        <h1 className='Score'>Score: 0</h1>
      </div>
      <div className='Paddle' />
    </div>
  );
}
