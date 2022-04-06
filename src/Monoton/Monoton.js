/* eslint-disable no-loop-func */
/* eslint-disable react-hooks/exhaustive-deps */
import styles from './Monoton.lazy.css';
import { useState, useEffect, cloneElement, useRef } from 'react';
import { animare, ease } from 'animare';
import Letters from './Letters';

export default function Monoton() {
  const [text, setText] = useState('TEXT');

  const animations = useRef([]);
  const animationRgb = useRef([]);
  const duration = useRef(2000);
  const delay = useRef(150);
  const isRandomColor = useRef(false);
  const isRgb = useRef(false);
  const isDisco = useRef(false);
  const isGlowing = useRef(false);

  const createLetters = () => {
    const result = [];
    for (let i = 0; i < text.length; i++) {
      const L = Letters?.[text[i].toUpperCase()];

      if (L)
        result.push(
          cloneElement(
            L,
            {
              key: Math.random() * 100,
              className: 'letters',
            },
            L?.props?.children?.map(c =>
              cloneElement(c, {
                key: Math.random() * 100,
                style: {
                  stroke: isRandomColor.current ? generateColor() : null,
                  filter: isGlowing.current
                    ? `drop-shadow(0px 0px 3px ${isRandomColor.current ? generateColor() : 'var(--color)'})`
                    : null,
                },
              })
            )
          )
        );
    }
    return result;
  };

  const setupAnimation = () => {
    stop();
    animations.current = [];
    animationRgb.current = [];

    const letters = document.querySelectorAll('.letters');

    for (let i = 0; i < letters.length; i++) {
      const pathes = letters[i].childNodes;

      for (let p = 0; p < pathes.length; p++) {
        const path = pathes[p];

        const length = path.getTotalLength();
        path.style.strokeDasharray = length / 2 + 'px';
        path.style.strokeDashoffset = length + 'px';

        const callback = ([o, a], { pause }) => {
          if (!document.contains(path)) pause();
          path.style.strokeDasharray = a + 'px';
          path.style.strokeDashoffset = o + 'px';
        };

        const callback_color = ([r, g, b], { progress, setOptions, pause }) => {
          if (!document.contains(path)) pause();
          path.style.stroke = `rgb(${r},${g},${b})`;
          isGlowing.current
            ? (path.style.filter = `drop-shadow(0px 0px 3px rgb(${r},${g},${b}))`)
            : path.style.removeProperty('filter');

          if (progress === 100) {
            setOptions({ delay: (pathes.length - 1 - i) * 200 + i * 200 });
          }
        };

        const a = animare(
          {
            from: [length, length / 2],
            to: [0, length],
            duration: duration.current,
            delay: p * delay.current,
            autoPlay: false,
            ease: ease.inOut.quad,
          },
          callback
        )
          .next({ to: [-length, length / 2] })
          .next({ to: [0, length] })
          .next({ to: [length, length / 2] });
        a.setTimelineOptions({ repeat: -1 });
        animations.current.push(a);

        if (isRgb.current) {
          const b = animare(
            { from: [255, 0, 0], to: [0, 0, 255], duration: 2000, delay: p * delay.current + i * 50, autoPlay: false },
            callback_color
          )
            .next({ to: [0, 255, 0] })
            .next({ to: [255, 0, 0] });
          b.setTimelineOptions({ repeat: -1 });
          animationRgb.current.push(b);
        }
      }
    }
    play();
  };

  const disco = async () => {
    const pathes = document.querySelectorAll('.letters path');
    while (isDisco.current) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!isDisco.current) return;
      for (let i = 0; i < pathes.length; i++) {
        const path = pathes[i];
        const color = generateColor();
        path.style.stroke = color;
        if (isGlowing.current) path.style.filter = `drop-shadow(0px 0px 3px ${color})`;
      }
    }
  };

  const play = () => {
    for (let i = 0; i < animations.current.length; i++) {
      animationRgb.current[i]?.setOptions({ delay: i * delay.current });
      animationRgb.current[i]?.play();
      animations.current[i].play();
    }
  };

  const stop = () => {
    for (let i = 0; i < animations.current.length; i++) {
      animations.current[i].stop('25%');
      animationRgb.current[i]?.stop('25%');
    }
  };

  useEffect(() => {
    setupAnimation();
    if (isDisco.current) disco();
  }, [text]);

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

  const onTextChange = e => {
    setText(e.target.value.toUpperCase());
  };

  const onStrokeChange = e => {
    document.body.style.setProperty('--stroke', +e.target.value + 'px');
  };

  const onSizeChange = e => {
    document.body.style.setProperty('--size', +e.target.value + 'px');
  };

  const onSpaceChange = e => {
    document.body.style.setProperty('--space', +e.target.value + 'px');
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
      document.querySelectorAll('.letters path').forEach(e => {
        e.style.stroke = 'red';
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px 3px red)`;
      });
      setupAnimation();
    } else {
      animationRgb.current.forEach(a => a.stop(0));
      animationRgb.current = [];
      await new Promise(resolve => setTimeout(resolve, 100));
      document.querySelectorAll('.letters path').forEach(e => {
        if (isRandomColor.current) {
          const color = generateColor();
          e.style.stroke = color;
          if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px 3px ${color})`;
          return;
        }
        e.style.removeProperty('stroke');
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px 3px var(--color))`;
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
      document.querySelectorAll('.letters path').forEach(e => {
        if (isRandomColor.current) {
          const color = generateColor();
          e.style.stroke = color;
          if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px 3px ${color})`;
          return;
        }
        e.style.removeProperty('stroke');
        isGlowing.current ? (e.style.filter = `drop-shadow(0px 0px 3px var(--color))`) : e.style.removeProperty('filter');
      });
    }
  };

  const onGlowChange = async e => {
    isGlowing.current = e.target.checked;
    if (isGlowing.current) {
      if (isRgb.current) return;
      if (isRandomColor.current) {
        document.querySelectorAll('.letters path').forEach(e => {
          const color = generateColor();
          e.style.stroke = color;
          e.style.filter = `drop-shadow(0px 0px 3px ${color})`;
        });
        return;
      }

      document.querySelectorAll('.letters path').forEach(e => {
        e.style.filter = `drop-shadow(0px 0px 3px var(--color))`;
      });
    } else {
      document.querySelectorAll('.letters path').forEach(e => {
        e.style.removeProperty('filter');
      });
    }
  };

  const onRandomColorChange = e => {
    isRandomColor.current = e.target.checked;
    document.querySelectorAll('.letters path').forEach(e => {
      if (isRandomColor.current) {
        const color = generateColor();
        e.style.stroke = color;
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px 3px ${color})`;
        return;
      }
      e.style.removeProperty('stroke');
      if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px 3px var(--color))`;
    });
  };

  const onColorChange = e => {
    document.body.style.setProperty('--color', e.target.value);
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

      <div className='container'>{createLetters()}</div>

      <div className='controls'>
        <label className='labels' htmlFor='text'>
          Text:
        </label>
        <input className='inputs' type='text' name='text' value={text} onChange={onTextChange} />

        <label className='labels' htmlFor='size'>
          Size:
        </label>
        <input className='inputs' type='number' step={10} min='1' name='size' defaultValue={200} onChange={onSizeChange} />

        <label className='labels' htmlFor='space'>
          Space:
        </label>
        <input className='inputs' type='number' step={5} name='space' defaultValue={0} onChange={onSpaceChange} />

        <label className='labels' htmlFor='stroke-width'>
          Stroke Width:
        </label>
        <input className='inputs' type='number' min='1' name='stroke-width' defaultValue={1} onChange={onStrokeChange} />

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
        <br />
        <label className='labels' htmlFor='letters-color'>
          Color:
        </label>
        <br />
        <input className='inputs' type='color' name='letters-color' defaultValue='#ffffff' onChange={onColorChange} />

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
