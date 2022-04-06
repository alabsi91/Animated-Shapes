/* eslint-disable react-hooks/exhaustive-deps */
import { animare, ease } from 'animare';
import { useEffect, useState } from 'react';
import styles from './Clock.lazy.css';

let color = '#ffffff',
  isRandomColor = false,
  duration = 10000,
  animations = [];

export default function Clock() {
  const [count, setCount] = useState(20);
  const [strokeWidth, setStrokeWidth] = useState(10);
  const [strokeHeight, setStrokeHeight] = useState(~~(240 / count) - 1);
  const [strokeGap, setStrokeGap] = useState(2);

  const createCircles = () => {
    const r = 240;
    const circles = [];

    for (let i = 0; i < count; i++) {
      circles.push(
        <circle
          key={Math.random() * 100}
          cx={250}
          cy={250}
          r={r - i * (r / count)}
          strokeDasharray={strokeWidth + ', ' + strokeGap}
          strokeWidth={strokeHeight}
          stroke={isRandomColor ? generateColor() : color}
          fill='transparent'
          style={i % 2 === 0 ? { transform: `rotate(${180}deg)` } : null}
        />
      );
    }

    return circles;
  };

  const setupAnimation = async () => {
    stop();
    animations = [];
    const circles = document.querySelectorAll('circle');
    const svg = document.querySelector('svg');

    animare({ to: 360, duration: 20000, ease: ease.inOut.quad }, ([r]) => {
      svg.style.transform = `rotate(${r}deg)`;
    })
      .next({ to: 0 })
      .setTimelineOptions({ repeat: -1 });

    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i];
      const callback = ([r, w, l, g, rotate]) => {
        circle.setAttribute('r', r);
        circle.setAttribute('stroke-dasharray', w + ', ' + g);
        circle.setAttribute('stroke-width', l);
        circle.style.transform = `rotate(${rotate}deg)`;
      };

      const r = +circle.getAttribute('r');

      animations.push(
        animare(
          {
            from: [r, strokeWidth, strokeHeight, strokeGap, i % 2 === 0 ? 180 : 0],
            to: [r * 0.75, strokeWidth * 0.75, 1, strokeGap * 0.75, i % 2 === 0 ? 0 : 180],
            duration,
            ease: ease.inOut.quad,
            direction: 'alternate',
            delay: i * 150,
            repeat: -1,
            autoPlay: false,
          },
          callback
        )
      );
    }
    play();
  };

  const play = async () => {
    for (let i = 0; i < animations.length; i++) animations[i].play();
  };

  const stop = () => {
    for (let i = 0; i < animations.length; i++) animations[i].stop(0);
  };

  useEffect(() => {
    setupAnimation();
  }, [count, strokeWidth, strokeGap, strokeHeight]);

  useEffect(() => {
    styles.use();
    window.addEventListener('focus', play);
    window.addEventListener('blur', stop);

    return () => {
      styles.unuse();
      window.removeEventListener('focus', play);
      window.removeEventListener('blur', stop);
    };
  }, []);

  const onCountChange = e => {
    setCount(+e.target.value);
  };

  const onWidthChange = e => {
    setStrokeWidth(+e.target.value);
  };

  const onGapChange = e => {
    setStrokeGap(+e.target.value);
  };

  const onHeightChange = e => {
    setStrokeHeight(+e.target.value);
  };

  const onRandomColorChange = e => {
    const value = e.target.checked;
    document.querySelectorAll('circle').forEach(e => e.setAttribute('stroke', value ? generateColor() : color));
    isRandomColor = value;
    e.target.checked = value;
  };

  const onColorChange = e => {
    const value = e.target.value;
    color = value;
    if (isRandomColor) return;
    document.querySelectorAll('circle').forEach(e => e.setAttribute('stroke', value));
  };

  const onBgColorChange = e => {
    document.body.style.backgroundColor = e.target.value;
    const inverted = invertColor(getComputedStyle(document.body).backgroundColor);
    [...document.getElementsByClassName('labels')].forEach(el => (el.style.color = inverted));
    document.querySelector('.toggle-pannel-arrow').style.fill = inverted;
  };

  const togglePannel = () => {
    const pannel = document.querySelector('.controls');
    const arrow = document.querySelector('.toggle-pannel-arrow');
    const isOpen = pannel.getBoundingClientRect().left === 0;
    const width = pannel.getBoundingClientRect().width;
    const from = [isOpen ? 0 : -width, isOpen ? 1 : -1];
    const to = [isOpen ? -width : 0, isOpen ? -1 : 1];
    const callback = ([l, r]) => {
      pannel.style.left = l + 'px';
      arrow.style.transform = `scaleX(${r})`;
    };
    animare({ from, to, ease: ease.out.expo, duration: 500 }, callback);
  };

  return (
    <>
      <div className='container'>
        <svg width='99%' height='99%' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
          {createCircles()}
        </svg>
      </div>

      <svg className='toggle-pannel-arrow' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' onClick={togglePannel}>
        <path d='M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z' />
      </svg>

      <div className='controls'>
        <label className='labels' htmlFor='circles-count'>
          Circles Count:
        </label>
        <input className='inputs' type='number' min={1} name='circles-count' value={count} onChange={onCountChange} />

        <label className='labels' htmlFor='storke-width'>
          Stroke width:
        </label>
        <input className='inputs' type='number' min={1} name='stoke-width' value={strokeWidth} onChange={onWidthChange} />

        <label className='labels' htmlFor='stroke-height'>
          Storke height:
        </label>
        <input className='inputs' type='number' min={1} name='stroke-height' value={strokeHeight} onChange={onHeightChange} />

        <label className='labels' htmlFor='orbit-stroke-width'>
          Stroke gap:
        </label>
        <input className='inputs' type='number' min={1} name='orbit-stroke-width' value={strokeGap} onChange={onGapChange} />

        <label className='labels' htmlFor='duration'>
          Duration:
        </label>
        <input
          className='inputs'
          type='number'
          min='500'
          step='500'
          name='duration'
          defaultValue={duration}
          onChange={e => {
            duration = +e.target.value;
            animations.forEach(a => a.setOptions({ duration }));
          }}
        />

        <br />
        <label className='labels' htmlFor='color'>
          Stroke Color:
        </label>
        <br />
        <input className='inputs' type='color' name='color' defaultValue='#ffffff' onChange={onColorChange} />

        <input className='inputs' type='checkbox' name='randomColor' onChange={onRandomColorChange} />
        <label className='labels' htmlFor='randomColor'>
          {' '}
          Random Colors
        </label>

        <br />
        <label className='labels' htmlFor='bg-color'>
          Background Color:
        </label>
        <br />
        <input className='inputs' type='color' name='bg-color' onChange={onBgColorChange} />
      </div>
    </>
  );
}

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const hslToHex = (h, s, l) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};
const generateColor = () => {
  const h = randomNumber(50, 360);
  const s = randomNumber(50, 100);
  return hslToHex(h, s, 50);
};
const invertColor = color => {
  const rgb = color.match(/\d+/g);
  const r = 255 - rgb[0];
  const g = 255 - rgb[1];
  const b = 255 - rgb[2];
  return `rgb(${r},${g},${b})`;
};
