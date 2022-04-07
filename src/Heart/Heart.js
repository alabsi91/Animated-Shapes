/* eslint-disable react-hooks/exhaustive-deps */
import { animare } from 'animare';
import { useEffect } from 'react';
import { useLazyCss } from '..';
import styles from './Heart.lazy.css';

export default function Heart() {
  useLazyCss(styles);

  const easingX = x => 16 * Math.sin(x * 6.2) ** 3;
  const easingY = x => 13 * Math.cos(x * 6.2) - 5 * Math.cos(2 * x * 6.2) - 2 * Math.cos(3 * x * 6.2) - Math.cos(4 * x * 6.2);

  const draw = () => {
    const canvas = document.querySelector(`.${styles.canvas}`);
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 10; // heart max width
    const pointRadius = 5;

    const randomColor = () => {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r},${g},${b})`;
    };

    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'red';

    // draw axes
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    const callback = ([x, y], { isLastFrame, setOptions, getOptions }) => {
      ctx.beginPath();
      ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
      ctx.fill();
      if (isLastFrame) {
        ctx.fillStyle = randomColor();
        const to = getOptions().to.map(x => x - 0.55);
        const duration = getOptions().duration + 90;
        setOptions({ to, duration });
      }
    };

    animare(
      {
        from: [centerX, centerY],
        to: [centerX - size / 16.2 / 2, centerY - size / 16.2 / 2],
        duration: 100,
        ease: [easingX, easingY],
        repeat: -1,
      },
      callback
    );
  };

  useEffect(() => {
    draw();
  }, []);

  return (
    <div className='container'>
      <canvas width={window.innerWidth} height={window.innerHeight} className='canvas' />
    </div>
  );
}
