/* eslint-disable no-loop-func */
/* eslint-disable react-hooks/exhaustive-deps */
import { animare, ease } from 'animare';
import { useState, useEffect, useRef } from 'react';
import styles from './Eye.lazy.css';

export default function Eye() {
  const [count, setCount] = useState(20);

  const animations = useRef([]);
  const isRandomColor = useRef(false);
  const rotateY = useRef(false);
  const duration = useRef(5000);
  const delay = useRef(50);

  const createCircles = () => {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(
        <circle
          key={Math.random() * 100}
          cx='250'
          cy='250'
          r={(i + 1) * (240 / count)}
          style={isRandomColor.current ? { stroke: generateColor() } : null}
        />
      );
    }
    return result;
  };

  const setupAnimation = () => {
    stop();
    animations.current = [];

    const circles = document.querySelectorAll('circle');

    for (let i = 0; i < circles.length; i++) {
      const e = circles[i];

      const callback = ([r, rotate], { pause }) => {
        if (!document.contains(e)) pause();
        e.setAttribute('r', r);
        e.style.transform = rotateY.current ? `rotateY(${rotate}deg)` : `rotateX(${rotate}deg)`;
      };

      animations.current.push(
        animare(
          {
            from: [+e.getAttribute('r'), 0],
            to: [+e.getAttribute('r') * 0.7, 180],
            duration: duration.current,
            direction: 'alternate',
            ease: ease.inOut.quad,
            autoPlay: false,
            repeat: -1,
            callback,
          },

          callback
        )
      );
    }
    play();
  };

  const play = async () => {
    for (let i = 0; i < animations.current.length; i++) {
      const a = animations.current[i];
      const b = animations.current?.[i + 1];
      a.play();
      await a.asyncOnProgress(delay.current);
      b?.play();
    }
  };

  const stop = () => {
    animations.current.forEach(a => a.stop(0));
  };

  useEffect(() => {
    setupAnimation();
  }, [count]);

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

  const onStrokeChange = e => {
    document.body.style.setProperty('--stroke-width', +e.target.value + 'px');
  };

  const onDurationChange = e => {
    duration.current = +e.target.value;
    stop();
    animations.current.forEach(a => a.setOptions({ duration: duration.current }));
    play();
  };

  const onDelayChange = e => {
    stop();
    delay.current = +e.target.value;
    play();
  };

  const onRotateChange = e => {
    rotateY.current = e.target.checked;
    setupAnimation();
  };

  const onColorChange = e => {
    document.body.style.setProperty('--stroke-color', e.target.value);
  };

  const onRandomColorChange = e => {
    isRandomColor.current = e.target.checked;
    document.querySelectorAll('circle').forEach(e => {
      if (isRandomColor.current) {
        e.style.stroke = generateColor();
      } else e.style.removeProperty('stroke');
    });
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
      <svg className='toggle-pannel-arrow' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' onClick={togglePannel}>
        <path d='M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z' />
      </svg>

      <div className='container'>
        <svg width='100%' height='100%' viewBox='0 0 500 500'>
          {createCircles()}
        </svg>

        <div className='controls'>
          <label className='labels' htmlFor='circles-count'>
            Circles Count:
          </label>
          <input className='inputs' type='number' min='1' name='circles-count' value={count} onChange={onCountChange} />

          <label className='labels' htmlFor='stroke-width'>
            Stroke width:
          </label>
          <input className='inputs' type='number' min='1' name='stroke-width' defaultValue='2' onChange={onStrokeChange} />

          <label className='labels' htmlFor='duration'>
            Duration:
          </label>
          <input
            className='inputs'
            type='number'
            step={50}
            min='0'
            name='duration'
            defaultValue={duration.current}
            onChange={onDurationChange}
          />

          <label className='labels' htmlFor='Delay'>
            Delay:
          </label>

          <input
            className='inputs'
            type='number'
            step='50'
            min='0'
            name='Delay'
            defaultValue={delay.current}
            onChange={onDelayChange}
          />

          <input className='inputs' type='checkbox' name='randomColor' onChange={onRotateChange} />
          <label className='labels' htmlFor='randomColor'>
            {' '}
            Vertical
          </label>

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
