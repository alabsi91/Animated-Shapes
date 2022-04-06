/* eslint-disable no-loop-func */
/* eslint-disable react-hooks/exhaustive-deps */
import { animare, ease } from 'animare';
import { useEffect, useState } from 'react';
import styles from './Trinity.lazy.css';

let animations = [],
  animationsColor = [],
  animationsRotate = null,
  delay = 150,
  duration = 4000,
  isRotating = false,
  isRandomColor = false,
  isGlowing = false,
  isRgb = false,
  isDisco = false;

export default function Trinity() {
  const [count, setCount] = useState(8);

  const createTrinities = () => {
    const smallest = 0.5;
    const largest = 1.2;
    let result = [];
    for (let i = 0; i < count; i++) {
      const calc = ((smallest + 1) / count) * (i + 1);
      const x = 62.44 * largest * (calc <= smallest ? (smallest - calc) * -1 : calc - smallest);
      const y = 42.7 * largest * (calc <= smallest ? (smallest - calc) * -1 : calc - smallest);
      const color = generateColor();
      result.push(
        <path
          key={Math.random() * 100}
          d={`M${422.56 + x},${398.39 + y}c${-35.72 + x / 2},${-184.08 - y * 2.9},${-309.44 - x * 2.5},${-183.99 - y * 2.9},${
            -345.12 - x * 2
          },${0}c${177.29 + x * 1.6},${61.08 + y * 2.15},${314.04 + x * 2.9},${-176 - y * 2},${172.57 + x},${
            -298.92 - y * 2.53
          }C${108.46 - x * 2},${222.44 - y * 0.8},${245.37 - x * 0.45},${459.46 + y * 3.1},${422.56 + x},${398.39 + y}z`}
          style={{
            stroke: isRandomColor ? color : null,
            filter: isGlowing ? `drop-shadow(0px 0px 3px ${isRandomColor ? color : 'var(--stroke-color)'})` : null,
          }}
        />
      );
    }

    return result;
  };

  const setupAnimation = () => {
    stop();
    animations = [];
    animationsColor = [];

    const pathes = document.querySelectorAll('.trinity path');

    const svg = document.querySelector('.trinity');

    if (!animationsRotate) {
      animationsRotate = animare({ to: 360, duration: 20000, repeat: -1, autoPlay: false }, ([r]) => {
        svg.style.transform = `translate(-50%, -60%) rotate(${r}deg)`;
      });
    }

    for (let i = 0; i < pathes.length; i++) {
      const path = pathes[i];
      const length = path.getTotalLength();
      path.style.strokeDasharray = length / 3 + 'px';

      const callback = ([o], { pause }) => {
        if (!document.contains(path)) pause();
        path.style.strokeDashoffset = o + 'px';
      };

      const callback_color = ([r, g, b], { progress, setOptions, pause }) => {
        if (!document.contains(path)) pause();
        path.style.stroke = `rgb(${r},${g},${b})`;
        isGlowing ? (path.style.filter = `drop-shadow(0px 0px 3px rgb(${r},${g},${b}))`) : path.style.removeProperty('filter');
        if (progress === 100) {
          setOptions({ delay: (count - 1 - i) * delay + i * delay });
        }
      };

      const a = animare(
        { from: [0], to: [length], duration, delay: i * delay, ease: ease.inOut.quad, autoPlay: false },
        callback
      ).next({
        from: [-length],
        to: [0],
      });
      a.setTimelineOptions({ repeat: -1 });
      animations.push(a);

      if (isRgb) {
        const b = animare({ from: [0, 0, 0], to: [255, 0, 0], duration, delay: i * delay, autoPlay: false }, callback_color)
          .next({ to: [0, 0, 255] })
          .next({ to: [0, 255, 0] })
          .next({ to: [0, 0, 0] });
        b.setTimelineOptions({ repeat: -1 });
        animationsColor.push(b);
      }
    }

    play();
  };

  const disco = async () => {
    const pathes = document.querySelectorAll('.trinity path');
    while (isDisco) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!isDisco) return;
      for (let i = 0; i < pathes.length; i++) {
        const path = pathes[i];
        const color = generateColor();
        path.style.stroke = color;
        if (isGlowing) path.style.filter = `drop-shadow(0px 0px 3px ${color})`;
      }
    }
  };

  const play = () => {
    for (let i = 0; i < animations.length; i++) {
      animationsColor[i]?.setOptions({ delay: i * delay });
      animationsColor[i]?.play();
      animations[i].play();
    }
  };

  const stop = () => {
    for (let i = 0; i < animations.length; i++) {
      animations[i].stop();
      animationsColor[i]?.stop();
    }
  };

  useEffect(() => {
    setupAnimation();
    if (isDisco) disco();
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

  const onDelayChange = e => {
    delay = +e.target.value;
    setupAnimation();
  };

  const onDurationChange = e => {
    duration = +e.target.value;
    for (let i = 0; i < animations.length; i++) {
      animationsColor[i]?.setOptions({ duration });
      animations[i]?.setOptions({ duration });
    }
  };

  const onZoomChange = e => {
    document.querySelector('.trinity').style.height = e.target.value + '%';
  };

  const onRotateChange = async e => {
    isRotating = e.target.checked;
    if (isRotating) {
      animationsRotate?.play();
    } else {
      animationsRotate?.stop();
      await new Promise(resolve => setTimeout(resolve, 10));
      document.querySelector('.trinity').style.removeProperty('transform');
    }
  };

  const onRGBChange = async e => {
    isRgb = e.target.checked;
    document.getElementById('random-check').disabled = isRgb;
    document.getElementById('disco-check').disabled = isRgb;

    if (isRgb) {
      setupAnimation();
    } else {
      animationsColor.forEach(a => a.pause());
      animationsColor = [];
      await new Promise(resolve => setTimeout(resolve, 50));
      document.querySelectorAll('.trinity path').forEach(e => {
        if (isRandomColor) {
          const color = generateColor();
          e.style.stroke = color;
          if (isGlowing) e.style.filter = `drop-shadow(0px 0px 3px ${color})`;
          return;
        }
        e.style.removeProperty('stroke');
        if (isGlowing) e.style.filter = `drop-shadow(0px 0px 3px var(--stroke-color))`;
      });
    }
  };

  const onDiscoChange = e => {
    isDisco = e.target.checked;
    document.getElementById('random-check').disabled = isDisco;
    document.getElementById('rgb-check').disabled = isDisco;

    if (isDisco) {
      if (isRgb) animationsColor.forEach(a => a.pause());
      disco();
    } else {
      if (isRgb) setupAnimation();
      document.querySelectorAll('.trinity path').forEach(e => {
        if (isRandomColor) {
          const color = generateColor();
          e.style.stroke = color;
          if (isGlowing) e.style.filter = `drop-shadow(0px 0px 3px ${color})`;
          return;
        }
        e.style.removeProperty('stroke');
        isGlowing ? (e.style.filter = `drop-shadow(0px 0px 3px var(--stroke-color))`) : e.style.removeProperty('filter');
      });
    }
  };

  const onGlowChange = async e => {
    isGlowing = e.target.checked;
    if (isGlowing) {
      if (isRgb) return;
      if (isRandomColor) {
        document.querySelectorAll('.trinity path').forEach(e => {
          const color = generateColor();
          e.style.stroke = color;
          e.style.filter = `drop-shadow(0px 0px 3px ${color})`;
        });
        return;
      }

      document.querySelectorAll('.trinity path').forEach(e => {
        e.style.filter = `drop-shadow(0px 0px 3px var(--stroke-color))`;
      });
    } else {
      document.querySelectorAll('.trinity path').forEach(e => {
        e.style.removeProperty('filter');
      });
    }
  };

  const onColorChange = e => {
    document.body.style.setProperty('--stroke-color', e.target.value);
  };

  const onRandomColorChange = e => {
    isRandomColor = e.target.checked;
    document.querySelectorAll('.trinity path').forEach(e => {
      if (isRandomColor) {
        const color = generateColor();
        e.style.stroke = color;
        if (isGlowing) e.style.filter = `drop-shadow(0px 0px 3px ${color})`;
        return;
      }
      e.style.removeProperty('stroke');
      if (isGlowing) e.style.filter = `drop-shadow(0px 0px 3px var(--stroke-color))`;
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
        <svg className='trinity' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500' fill='none'>
          {createTrinities()}
        </svg>
      </div>

      <div className='controls'>
        <label className='labels' htmlFor='trinity-count'>
          Trinities Count:
        </label>
        <input className='inputs' type='number' min='1' name='trinity-count' value={count} onChange={onCountChange} />

        <label className='labels' htmlFor='stroke-width'>
          Stroke Width:
        </label>
        <input className='inputs' type='number' min='1' name='stroke-width' defaultValue={2} onChange={onStrokeChange} />

        <label className='labels' htmlFor='duration'>
          Duration:
        </label>
        <input
          className='inputs'
          type='number'
          step='50'
          name='duration'
          min='0'
          defaultValue={duration}
          onChange={onDurationChange}
        />

        <label className='labels' htmlFor='delay'>
          Delay:
        </label>
        <input className='inputs' type='number' step='10' name='delay' min='0' defaultValue={delay} onChange={onDelayChange} />

        <label className='labels' htmlFor='zoom'>
          {' '}
          Zoom
        </label>
        <input
          className='inputs'
          style={{ width: '95%' }}
          type='range'
          min='5'
          max='120'
          name='zoom'
          defaultValue='85'
          onChange={onZoomChange}
        />

        <br />
        <input className='inputs' type='checkbox' name='rotate-Mode' onChange={onRotateChange} />
        <label className='labels' htmlFor='rotate-Mode'>
          {' '}
          Rotate
        </label>

        <br />
        <input className='inputs' id='rgb-check' type='checkbox' name='RGB-Mode' onChange={onRGBChange} />
        <label className='labels' htmlFor='RGB-Mode'>
          {' '}
          RGB Mode
        </label>

        <br />
        <input className='inputs' id='disco-check' type='checkbox' name='Disco-Mode' onChange={onDiscoChange} />
        <label className='labels' htmlFor='Disco-Mode'>
          {' '}
          Disco Mode
        </label>

        <br />
        <input className='inputs' id='glow-check' type='checkbox' name='Glow-Mode' onChange={onGlowChange} />
        <label className='labels' htmlFor='Glow-Mode'>
          {' '}
          Glow
        </label>

        <br />
        <input className='inputs' id='random-check' type='checkbox' name='randomColor' onChange={onRandomColorChange} />
        <label className='labels' htmlFor='randomColor'>
          {' '}
          Random Colors
        </label>

        <br />
        <br />
        <label className='labels' htmlFor='trinity-color'>
          Trinity Color:
        </label>
        <br />
        <input className='inputs' type='color' name='trinity-color' defaultValue='#ffffff' onChange={onColorChange} />

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
