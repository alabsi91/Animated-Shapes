/* eslint-disable react-hooks/exhaustive-deps */
import { animare, ease } from 'animare';
import { useEffect, useState, useRef } from 'react';
import { useLazyCss } from '..';
import styles from './Clock.lazy.css';

export default function Clock() {
  useLazyCss(styles);

  const [count, setCount] = useState(20);

  const isRandomColor = useRef(false);
  const duration = useRef(10000);
  const animations = useRef([]);

  const createCircles = () => {
    const r = 240;
    const circles = [];

    document.body.style.setProperty('--stroke-width', ~~(r / count) - 1);

    for (let i = 0; i < count; i++) {
      circles.push(
        <circle
          key={Math.random() * 100}
          className='circles'
          cx={250}
          cy={250}
          r={r - i * (r / count)}
          style={{
            transform: i % 2 === 0 ? `rotate(${180}deg)` : null,
            stroke: isRandomColor.current ? generateColor() : null,
          }}
        />
      );
    }

    return circles;
  };

  const setupAnimation = async () => {
    stop();
    animations.current = [];

    await new Promise(resolve => setTimeout(resolve, 50));

    const circles = document.querySelectorAll('.circles');
    const svg = document.querySelector('.circles-svg');
    const strokeGap = parseInt(getComputedStyle(document.body).getPropertyValue('--stroke-gap'));
    const strokeLength = parseInt(getComputedStyle(document.body).getPropertyValue('--stroke-length'));
    const strokeWidth = parseInt(getComputedStyle(document.body).getPropertyValue('--stroke-width'));

    animare({ to: 360, duration: 20000, ease: ease.inOut.quad }, ([r]) => {
      svg.style.transform = `rotate(${r}deg)`;
    })
      .next({ to: 0 })
      .setTimelineOptions({ repeat: -1 });

    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i];
      const callback = ([r, w, l, g, rotate], { pause }) => {
        if (!document.contains(circle)) pause();
        circle.setAttribute('r', r);
        circle.setAttribute('stroke-dasharray', w + ', ' + g);
        circle.setAttribute('stroke-width', l);
        circle.style.transform = `rotate(${rotate}deg)`;
      };

      const r = +circle.getAttribute('r');

      animations.current.push(
        animare(
          {
            from: [r, strokeLength, strokeWidth, strokeGap, i % 2 === 0 ? 180 : 0],
            to: [r * 0.75, strokeLength * 0.75, 1, strokeGap * 0.75, i % 2 === 0 ? 0 : 180],
            duration: duration.current,
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
    for (let i = 0; i < animations.current.length; i++) animations.current[i].play();
  };

  const stop = () => {
    for (let i = 0; i < animations.current.length; i++) animations.current[i].stop(0);
  };

  useEffect(() => {
    setupAnimation();
  }, [count]);

  useEffect(() => {
    window.addEventListener('focus', play);
    window.addEventListener('blur', stop);

    return () => {
      window.removeEventListener('focus', play);
      window.removeEventListener('blur', stop);
    };
  }, []);

  const onCountChange = e => {
    setCount(+e.target.value);
  };

  const onWidthChange = e => {
    document.body.style.setProperty('--stroke-length', e.target.value + 'px');
    setupAnimation();
  };

  const onGapChange = e => {
    document.body.style.setProperty('--stroke-gap', e.target.value + 'px');
    setupAnimation();
  };

  const onHeightChange = e => {
    document.body.style.setProperty('--stroke-width', e.target.value + 'px');
    setupAnimation();
  };

  const onRandomColorChange = e => {
    isRandomColor.current = e.target.checked;
    document.querySelectorAll('circle').forEach(e => {
      isRandomColor.current ? (e.style.stroke = generateColor()) : e.style.removeProperty('stroke');
    });
  };

  const onColorChange = e => {
    document.body.style.setProperty('--stroke-color', e.target.value);
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
        <svg className='circles-svg' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
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
        <input className='inputs' type='number' min={1} name='stoke-width' defaultValue={10} onChange={onWidthChange} />

        <label className='labels' htmlFor='stroke-height'>
          Storke height:
        </label>
        <input
          className='inputs'
          type='number'
          min={1}
          name='stroke-height'
          defaultValue={~~(240 / count) - 1}
          onChange={onHeightChange}
        />

        <label className='labels' htmlFor='orbit-stroke-width'>
          Stroke gap:
        </label>
        <input className='inputs' type='number' min={1} name='orbit-stroke-width' defaultValue={2} onChange={onGapChange} />

        <label className='labels' htmlFor='duration'>
          Duration:
        </label>
        <input
          className='inputs'
          type='number'
          min='500'
          step='500'
          name='duration'
          defaultValue={duration.current}
          onChange={e => {
            duration.current = +e.target.value;
            animations.current.forEach(a => a.setOptions({ duration: duration.current }));
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
