/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import { animare, ease } from 'animare';
import { useEffect, useState, useRef } from 'react';
import { useLazyCss } from '..';
import styles from './$$$$$.lazy.css';

export default function $$$$$() {
  useLazyCss(styles);

  const [count, setCount] = useState(10);

  const isRandomColor = useRef(false);
  const isRgb = useRef(false);
  const isDisco = useRef(false);
  const isGlowing = useRef(false);
  const delay = useRef(150);
  const duration = useRef(5000);
  const animations = useRef([]);
  const animationRgb = useRef([]);

  const create$$$$$ = () => {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(
        <circle
          className='$$$$$'
          key={Math.random() * 100}
          cx='50%'
          cy='50%'
          r={0}
          style={{
            stroke: isRandomColor.current ? generateColor() : null,
            filter:
              isGlowing.current && isRandomColor.current
                ? `drop-shadow(0px 0px var(--glow-trength) ${generateColor()})`
                : isGlowing.current
                ? `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`
                : null,
          }}
        />
      );
    }
    return result;
  };

  const setupAnimation = () => {
    stop();
    animations.current = [];
    animationRgb.current = [];

    const $$$$$s = document.querySelectorAll('.$$$$$');

    for (let i = 0; i < $$$$$s.length; i++) {
      const e = $$$$$s[i];

      const callback = ([r], { pause }) => {
        if (!document.body.contains(e)) pause();
        e.setAttribute('r', r + '%');
      };

      animations.current.push(
        animare({ to: 100, duration: duration.current, delay: i * delay.current, repeat: -1, autoPlay: false }, callback)
      );

      if (isRgb.current) {
        const callback_color = ([r, g, b], { pause }) => {
          if (!document.contains(e)) pause();
          e.style.stroke = `rgb(${r},${g},${b})`;
          isGlowing.current
            ? (e.style.filter = `drop-shadow(0px 0px var(--glow-trength) rgb(${r},${g},${b}))`)
            : e.style.removeProperty('filter');
        };
        const b = animare(
          { from: [255, 0, 0], to: [0, 0, 255], duration: 2000, delay: i * delay.current, autoPlay: false },
          callback_color
        )
          .next({ to: [0, 255, 0] })
          .next({ to: [255, 0, 0] });
        b.setTimelineOptions({ repeat: -1 });
        animationRgb.current.push(b);
      }
    }
    play();
  };

  const disco = async () => {
    const $$$$$s = document.querySelectorAll('.$$$$$');
    while (isDisco.current) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!isDisco.current) return;
      for (let i = 0; i < $$$$$s.length; i++) {
        const e = $$$$$s[i];
        const color = generateColor();
        e.style.stroke = color;
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
      }
    }
  };

  const play = () => {
    for (let i = 0; i < animations.current.length; i++) {
      animations.current[i].play();
      animationRgb.current?.[i]?.play();
    }
  };

  const stop = () => {
    for (let i = 0; i < animations.current.length; i++) {
      animations.current[i].stop();
      animationRgb.current?.[i]?.stop();
    }
  };

  useEffect(() => {
    setupAnimation();
    if (isDisco.current) disco();
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

  const onStrokeWidthChange = e => {
    document.body.style.setProperty('--stroke-width', e.target.value);
  };

  const onDurationChange = e => {
    duration.current = +e.target.value;
    for (let i = 0; i < animations.current.length; i++) {
      animations.current[i]?.setOptions({ duration: duration.current });
    }
  };

  const onDelayChange = e => {
    delay.current = +e.target.value;
    setupAnimation();
  };

  const onRGBChange = async e => {
    isRgb.current = e.target.checked;
    document.getElementById('random-check').disabled = isRgb.current;
    document.getElementById('disco-check').disabled = isRgb.current;

    if (isRgb.current) {
      document.querySelectorAll('.$$$$$').forEach(e => {
        e.style.stroke = 'red';
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) red)`;
      });
      setupAnimation();
    } else {
      animationRgb.current.forEach(a => a.stop(0));
      animationRgb.current = [];
      await new Promise(resolve => setTimeout(resolve, 100));
      document.querySelectorAll('.$$$$$').forEach(e => {
        if (isRandomColor.current) {
          const color = generateColor();
          e.style.stroke = color;
          if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
          return;
        }
        e.style.removeProperty('stroke');
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`;
      });
    }
  };

  const onDiscoChange = e => {
    isDisco.current = e.target.checked;
    document.getElementById('random-check').disabled = isDisco.current;
    document.getElementById('rgb-check').disabled = isDisco.current;

    if (isDisco.current) {
      if (isRgb.current) animationRgb.current.forEach(a => a.pause());
      disco();
    } else {
      if (isRgb.current) setupAnimation();
      document.querySelectorAll('.$$$$$').forEach(e => {
        if (isRandomColor.current) {
          const color = generateColor();
          e.style.stroke = color;
          if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
          return;
        }
        e.style.removeProperty('stroke');
        isGlowing.current
          ? (e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`)
          : e.style.removeProperty('filter');
      });
    }
  };

  const onGlowChange = async e => {
    isGlowing.current = e.target.checked;
    if (isGlowing.current) {
      if (isRgb.current) return;
      if (isRandomColor.current) {
        document.querySelectorAll('.$$$$$').forEach(e => {
          const color = generateColor();
          e.style.stroke = color;
          e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
        });
        return;
      }

      document.querySelectorAll('.$$$$$').forEach(e => {
        e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`;
      });
    } else {
      document.querySelectorAll('.$$$$$').forEach(e => {
        e.style.removeProperty('filter');
      });
    }
  };

  const onRandomColorChange = e => {
    isRandomColor.current = e.target.checked;
    document.querySelectorAll('.$$$$$').forEach(e => {
      if (isRandomColor.current) {
        const color = generateColor();
        e.style.stroke = color;
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
        return;
      }
      e.style.removeProperty('stroke');
      if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`;
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
      <svg className='toggle-pannel-arrow' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' onClick={togglePannel}>
        <path d='M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z' />
      </svg>

      <div className='container'>
        <svg width='100%' height='100%' viewBox='0 0 500 500' fill='none'>
          {create$$$$$()}
          <circle cx='50%' cy='50%' r='1' />
        </svg>

        <div className='controls'>
          <label className='labels' htmlFor='$$$$$-count'>
            $$$$$ Counts:
          </label>
          <input className='inputs' type='number' min={1} name='$$$$$-count' value={count} onChange={onCountChange} />

          <label className='labels' htmlFor='orbit-stroke-width'>
            Stroke width:
          </label>
          <input
            className='inputs'
            type='number'
            min={1}
            name='orbit-stroke-width'
            defaultValue='1'
            onChange={onStrokeWidthChange}
          />

          <label className='labels' htmlFor='duration'>
            Duration:
          </label>
          <input
            className='inputs'
            type='number'
            step='50'
            name='duration'
            min='0'
            defaultValue={duration.current}
            onChange={onDurationChange}
          />

          <label className='labels' htmlFor='delay'>
            Delay:
          </label>
          <input
            className='inputs'
            type='number'
            step='10'
            name='delay'
            min='0'
            defaultValue={delay.current}
            onChange={onDelayChange}
          />

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
          <label className='labels' htmlFor='color'>
            Stroke Color:
          </label>
          <br />
          <input className='inputs' type='color' name='color' defaultValue='#ffffff' onChange={onColorChange} />

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
