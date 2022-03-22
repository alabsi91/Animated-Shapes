/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import { animare, ease } from 'animare';
import { useEffect, useState } from 'react';
import './Orbits.css';

let orbitWidth = 0.4,
  orbitHeight = 1,
  strokeWidth = 1,
  color = '#ffffff',
  isRandomColor = false,
  animations = [];

export default function Orbits() {
  const [count, setCount] = useState(3);

  const createOrbit = () => {
    const angle = 180 / count;
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(
        <g className='orbit' key={Math.random() * 100}>
          <ellipse
            cx='50'
            cy='50'
            rx={45 * orbitHeight}
            ry={45 * orbitWidth}
            transform={`rotate(${i * angle})`}
            stroke={isRandomColor ? generateColor() : color}
            strokeWidth={strokeWidth / 20}
          />
        </g>
      );
    }
    return result;
  };

  const setupAnimation = () => {
    stop();
    animations = [];
    const svg = document.querySelector('.container svg');
    const orbits = document.querySelectorAll('.orbit ellipse');
    const angle = 180 / count;

    animare({ to: 180, repeat: -1, duration: 4000 }, ([r]) => {
      svg.style.transform = `rotate(${r}deg)`;
    });

    for (let i = 0; i < orbits.length; i++) {
      const e = orbits[i];
      const callback = ([r], { pause }) => {
        if (!document.body.contains(e)) pause();
        e.style.transform = `rotate(${i * angle}deg) rotateX(${r}deg)`;
      };
      animations.push(animare({ to: 180, duration: 2000, repeat: -1, autoPlay: false }, callback));
    }
    play();
  };

  const play = async () => {
    for (let i = 0; i < animations.length; i++) {
      const a = animations[i];
      const b = animations?.[i + 1];
      a.play();
      await a.asyncOnProgress((count * (180 / count)) / 2);
      b?.play();
    }
  };

  const stop = () => {
    for (let i = 0; i < animations.length; i++) animations[i].stop();
  };

  useEffect(() => {
    setupAnimation();
  }, [count]);

  useEffect(() => {
    window.addEventListener('focus', play);
    window.addEventListener('blur', stop);
  }, []);

  const onCountChange = e => {
    setCount(+e.target.value);
  };

  const onWidthChange = e => {
    orbitWidth = +e.target.value / 100;
    const orbits = document.querySelectorAll('.orbit ellipse');
    orbits.forEach(e => {
      e.setAttribute('ry', 45 * orbitWidth);
    });
  };

  const onHeightChange = e => {
    orbitHeight = +e.target.value / 100;
    const orbits = document.querySelectorAll('.orbit ellipse');
    orbits.forEach(e => {
      e.setAttribute('rx', 45 * orbitHeight);
    });
  };

  const onStrokeWidthChange = e => {
    strokeWidth = +e.target.value;
    const orbits = document.querySelectorAll('.orbit ellipse');
    orbits.forEach(e => {
      e.setAttribute('stroke-width', strokeWidth / 20);
    });
  };

  const onRandomColorChange = e => {
    const value = e.target.checked;
    document.querySelectorAll('.orbit ellipse').forEach(e => e.setAttribute('stroke', value ? generateColor() : color));
    isRandomColor = value;
    e.target.checked = value;
  };

  const onColorChange = e => {
    const value = e.target.value;
    color = value;
    if (isRandomColor) return;
    document.querySelectorAll('.orbit ellipse').forEach(e => e.setAttribute('stroke', value));
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
        <svg width='100%' height='100%' viewBox='0 0 100 100' fill='none'>
          {createOrbit()}
          <circle cx='50' cy='50' r='0.5' fill='white' />
        </svg>

        <div className='controls'>
          <label className='labels' htmlFor='orbits-count'>
            Orbits Count:
          </label>
          <input className='inputs' type='number' min={1} name='orbits-count' value={count} onChange={onCountChange} />

          <label className='labels' htmlFor='orbits-width'>
            Orbit width:
          </label>
          <input
            className='inputs'
            type='number'
            min={1}
            max={100}
            name='orbits-width'
            defaultValue={orbitWidth * 100}
            onChange={onWidthChange}
          />

          <label className='labels' htmlFor='orbits-height'>
            Orbit height:
          </label>
          <input
            className='inputs'
            type='number'
            min={1}
            max={100}
            name='orbits-height'
            defaultValue={orbitHeight * 100}
            onChange={onHeightChange}
          />

          <label className='labels' htmlFor='orbit-stroke-width'>
            Stroke width:
          </label>
          <input
            className='inputs'
            type='number'
            min={1}
            name='orbit-stroke-width'
            defaultValue={strokeWidth}
            onChange={onStrokeWidthChange}
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