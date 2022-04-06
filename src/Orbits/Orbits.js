/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import { animare, ease } from 'animare';
import { useEffect, useState } from 'react';
import styles from './Orbits.lazy.css';

let orbitWidth = 0.4,
  orbitHeight = 1,
  isRandomColor = false,
  isRgb = false,
  isDisco = false,
  isGlowing = false,
  glowStrength = 3,
  delay = 150,
  duration = 2000,
  animations = [],
  animationRgb = [];

export default function Orbits() {
  const [count, setCount] = useState(3);

  const createOrbit = () => {
    const angle = 180 / count;
    const result = [];
    for (let i = 0; i < count; i++) {
      const color = generateColor();
      result.push(
        <g className='orbit' key={Math.random() * 100}>
          <ellipse
            cx='50%'
            cy='50%'
            rx={45 * (orbitHeight * 5)}
            ry={45 * (orbitWidth * 5)}
            transform={`rotate(${i * angle})`}
            style={{
              stroke: isRandomColor ? color : null,
              filter:
                isGlowing && isRandomColor
                  ? `drop-shadow(0px 0px ${glowStrength}px ${color})`
                  : isGlowing
                  ? `drop-shadow(0px 0px ${glowStrength}px var(--color))`
                  : null,
            }}
          />
        </g>
      );
    }
    return result;
  };

  const setupAnimation = () => {
    stop();
    animations = [];
    animationRgb = [];

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

      animations.push(animare({ to: 180, duration, delay: i * delay, repeat: -1, autoPlay: false }, callback));

      if (isRgb) {
        const callback_color = ([r, g, b], { pause }) => {
          if (!document.contains(e)) pause();
          e.style.stroke = `rgb(${r},${g},${b})`;
          isGlowing
            ? (e.style.filter = `drop-shadow(0px 0px ${glowStrength}px rgb(${r},${g},${b}))`)
            : e.style.removeProperty('filter');
        };
        const b = animare(
          { from: [255, 0, 0], to: [0, 0, 255], duration: 2000, delay: i * delay, autoPlay: false },
          callback_color
        )
          .next({ to: [0, 255, 0] })
          .next({ to: [255, 0, 0] });
        b.setTimelineOptions({ repeat: -1 });
        animationRgb.push(b);
      }
    }
    play();
  };

  const disco = async () => {
    const ellipses = document.querySelectorAll('.orbit ellipse');
    while (isDisco) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!isDisco) return;
      for (let i = 0; i < ellipses.length; i++) {
        const ellipse = ellipses[i];
        const color = generateColor();
        ellipse.style.stroke = color;
        if (isGlowing) ellipse.style.filter = `drop-shadow(0px 0px ${glowStrength}px ${color})`;
      }
    }
  };

  const play = () => {
    for (let i = 0; i < animations.length; i++) {
      animations[i].play();
      animationRgb?.[i]?.play();
    }
  };

  const stop = () => {
    for (let i = 0; i < animations.length; i++) {
      animations[i].stop();
      animationRgb?.[i]?.stop();
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

  const onWidthChange = e => {
    orbitWidth = +e.target.value / 100;
    const orbits = document.querySelectorAll('.orbit ellipse');
    orbits.forEach(e => {
      e.setAttribute('ry', 45 * (orbitWidth * 5));
    });
  };

  const onHeightChange = e => {
    orbitHeight = +e.target.value / 100;
    const orbits = document.querySelectorAll('.orbit ellipse');
    orbits.forEach(e => {
      e.setAttribute('rx', 45 * (orbitHeight * 5));
    });
  };

  const onStrokeWidthChange = e => {
    document.body.style.setProperty('--stroke', e.target.value);
  };

  const onDurationChange = e => {
    duration = +e.target.value;
    for (let i = 0; i < animations.length; i++) {
      animations[i]?.setOptions({ duration });
    }
  };

  const onDelayChange = e => {
    delay = +e.target.value;
    setupAnimation();
  };

  const onRGBChange = async e => {
    isRgb = e.target.checked;
    document.getElementById('random-check').disabled = isRgb;
    document.getElementById('disco-check').disabled = isRgb;

    if (isRgb) {
      document.querySelectorAll('.orbit ellipse').forEach(e => {
        e.style.stroke = 'red';
        if (isGlowing) e.style.filter = `drop-shadow(0px 0px ${glowStrength}px red)`;
      });
      setupAnimation();
    } else {
      animationRgb.forEach(a => a.stop(0));
      animationRgb = [];
      await new Promise(resolve => setTimeout(resolve, 100));
      document.querySelectorAll('.orbit ellipse').forEach(e => {
        if (isRandomColor) {
          const color = generateColor();
          e.style.stroke = color;
          if (isGlowing) e.style.filter = `drop-shadow(0px 0px ${glowStrength}px ${color})`;
          return;
        }
        e.style.removeProperty('stroke');
        if (isGlowing) e.style.filter = `drop-shadow(0px 0px ${glowStrength}px var(--color))`;
      });
    }
  };

  const onDiscoChange = e => {
    isDisco = e.target.checked;
    document.getElementById('random-check').disabled = isDisco;
    document.getElementById('rgb-check').disabled = isDisco;

    if (isDisco) {
      if (isRgb) animationRgb.forEach(a => a.pause());
      disco();
    } else {
      if (isRgb) setupAnimation();
      document.querySelectorAll('.orbit ellipse').forEach(e => {
        if (isRandomColor) {
          const color = generateColor();
          e.style.stroke = color;
          if (isGlowing) e.style.filter = `drop-shadow(0px 0px ${glowStrength}px ${color})`;
          return;
        }
        e.style.removeProperty('stroke');
        isGlowing ? (e.style.filter = `drop-shadow(0px 0px ${glowStrength}px var(--color))`) : e.style.removeProperty('filter');
      });
    }
  };

  const onGlowChange = async e => {
    isGlowing = e.target.checked;
    if (isGlowing) {
      if (isRgb) return;
      if (isRandomColor) {
        document.querySelectorAll('.orbit ellipse').forEach(e => {
          const color = generateColor();
          e.style.stroke = color;
          e.style.filter = `drop-shadow(0px 0px ${glowStrength}px ${color})`;
        });
        return;
      }

      document.querySelectorAll('.orbit ellipse').forEach(e => {
        e.style.filter = `drop-shadow(0px 0px ${glowStrength}px var(--color))`;
      });
    } else {
      document.querySelectorAll('.orbit ellipse').forEach(e => {
        e.style.removeProperty('filter');
      });
    }
  };

  const onRandomColorChange = e => {
    isRandomColor = e.target.checked;
    document.querySelectorAll('.orbit ellipse').forEach(e => {
      if (isRandomColor) {
        const color = generateColor();
        e.style.stroke = color;
        if (isGlowing) e.style.filter = `drop-shadow(0px 0px ${glowStrength}px ${color})`;
        return;
      }
      e.style.removeProperty('stroke');
      if (isGlowing) e.style.filter = `drop-shadow(0px 0px ${glowStrength}px var(--color))`;
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

      <div className='container'>
        <svg width='100%' height='100%' viewBox='0 0 500 500' fill='none'>
          {createOrbit()}
          <circle cx='50%' cy='50%' r='1' />
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
            defaultValue={duration}
            onChange={onDurationChange}
          />

          <label className='labels' htmlFor='delay'>
            Delay:
          </label>
          <input className='inputs' type='number' step='10' name='delay' min='0' defaultValue={delay} onChange={onDelayChange} />

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
