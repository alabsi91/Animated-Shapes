/* eslint-disable react-hooks/exhaustive-deps */
import './Cuboid.css';
import { useEffect, useState } from 'react';
import { animare, ease } from 'animare';

let width = 500,
  height = 500,
  thickness = 30,
  strokeWidth = 2,
  backgroundColor = '#000',
  borderColor = '#fff',
  randomColor = false,
  strokeRandomColor = false,
  duration = 3000,
  delay = 50,
  animations = [];

export default function Cuboid() {
  const [count, setCount] = useState(15);

  const createCuboid = () => {
    let order = 0;
    const result = [];

    for (let i = -((count - 1) / 2); i <= (count - 1) / 2; i++) {
      const pos = (i * window.innerHeight) / count / 1.2;
      const color1 = generateColor();
      const color2 = generateColor();

      result[i > 0 ? 'unshift' : 'push'](
        <div
          key={Math.random() * 100}
          className='scene'
          data-order={order}
          style={{ transform: 'rotateX(180deg) rotateY(0deg)' }}
        >
          <div
            className='shape cuboid-1 cub-1'
            style={{ transform: `translate3D(0px, ${pos}px, 0px) rotateX(90deg) rotateY(0deg) rotateZ(0deg)` }}
          >
            <div
              className='face ft'
              style={{
                borderColor: strokeRandomColor ? color1 : null,
                backgroundColor: randomColor ? color2 : null,
              }}
            >
              <div className='photon-shader'></div>
            </div>
            <div
              className='face bk'
              style={{
                borderColor: strokeRandomColor ? color1 : null,
                backgroundColor: randomColor ? color2 : null,
              }}
            >
              <div className='photon-shader'></div>
            </div>
            <div
              className='face rt'
              style={{
                borderColor: strokeRandomColor ? color1 : null,
                backgroundColor: randomColor ? color2 : null,
              }}
            >
              <div className='photon-shader'></div>
            </div>
            <div
              className='face lt'
              style={{
                borderColor: strokeRandomColor ? color1 : null,
                backgroundColor: randomColor ? color2 : null,
              }}
            >
              <div className='photon-shader'></div>
            </div>
            <div
              className='face bm'
              style={{
                borderColor: strokeRandomColor ? color1 : null,
                backgroundColor: randomColor ? color2 : null,
              }}
            >
              <div className='photon-shader'></div>
            </div>
            <div
              className='face tp'
              style={{
                borderColor: strokeRandomColor ? color1 : null,
                backgroundColor: randomColor ? color2 : null,
              }}
            >
              <div className='photon-shader'></div>
            </div>
          </div>
        </div>
      );
      order++;
    }

    return result;
  };

  const setupAnimation = () => {
    stop();
    animations = [];

    const scenes = document.querySelectorAll('.scene');

    for (let i = 0; i < scenes.length; i++) {
      const e = scenes[i];
      const order = +e.dataset.order;
      // eslint-disable-next-line no-loop-func
      const callback = ([ry], { pause, progress, setOptions }) => {
        if (!document.contains(e)) pause();
        e.style.transform = `rotateX(180deg) rotateY(${ry}deg)`;
        if (progress === 100) {
          setOptions({ delay: (scenes.length - 1 - order) * delay + order * delay });
        }
      };

      const a = animare(
        { from: 0, to: 180, duration, delay: order * delay, autoPlay: false, ease: ease.out.back },
        callback
      ).next({
        to: 0,
        delay: (scenes.length - 1 - order) * delay + order * delay,
      });
      a.setTimelineOptions({ repeat: -1 });
      animations[order] = a;
    }
    play();
  };

  const play = () => {
    for (let i = 0; i < animations.length; i++) {
      animations[i].setOptions({ delay: i * delay });
      animations[i].play();
    }
  };

  const stop = () => {
    for (let i = 0; i < animations.length; i++) animations[i].stop();
  };

  useEffect(() => {
    setupAnimation();
  }, [count]);

  useEffect(() => {
    document.body.style.setProperty('--width', width + 'px');
    document.body.style.setProperty('--height', height + 'px');
    document.body.style.setProperty('--thickness', thickness + 'px');
    document.body.style.setProperty('--border-width', strokeWidth + 'px');
    document.body.style.setProperty('--bg-color', backgroundColor);
    document.body.style.setProperty('--border-color', borderColor);
    window.addEventListener('focus', play);
    window.addEventListener('blur', stop);
  }, []);

  const onCountChange = e => {
    setCount(+e.target.value);
  };

  const onWidthChange = e => {
    width = +e.target.value;
    document.body.style.setProperty('--width', width + 'px');
  };

  const onHeightChange = e => {
    height = +e.target.value;
    document.body.style.setProperty('--height', height + 'px');
  };

  const onThicknessChange = e => {
    thickness = +e.target.value;
    document.body.style.setProperty('--thickness', thickness + 'px');
  };

  const onStrokeChange = e => {
    strokeWidth = +e.target.value;
    document.body.style.setProperty('--border-width', strokeWidth + 'px');
  };

  const onPerspectiveChange = e => {
    strokeWidth = +e.target.value;
    document.getElementById('tridiv').style.perspective = strokeWidth + 'px';
  };

  const onDelayChange = e => {
    delay = +e.target.value;
    stop();
    animations = [];
    setupAnimation();
  };

  const onDurationChange = e => {
    duration = +e.target.value;
    stop();
    animations = [];
    setupAnimation();
  };

  const onColorChange = e => {
    document.body.style.setProperty('--bg-color', e.target.value);
  };

  const onRandomColorChange = e => {
    randomColor = e.target.checked;
    document.querySelectorAll('.cub-1').forEach(e => {
      const faces = [...e.children];
      const color = generateColor();
      faces.forEach(f => {
        if (randomColor) {
          f.style.backgroundColor = color;
        } else f.style.removeProperty('background-color');
      });
    });
  };

  const onStrokeColorChange = e => {
    document.body.style.setProperty('--border-color', e.target.value);
  };

  const onStrokeRandomColorChange = e => {
    strokeRandomColor = e.target.checked;

    document.querySelectorAll('.cub-1').forEach(e => {
      const faces = [...e.children];
      const color = generateColor();
      faces.forEach(f => {
        if (strokeRandomColor) {
          f.style.borderColor = color;
        } else f.style.removeProperty('border');
      });
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

      <div id='tridiv'>{createCuboid()}</div>

      <div className='controls'>
        <label className='labels' htmlFor='cuboids-count'>
          Cuboids Count:
        </label>
        <input className='inputs' type='number' min={1} name='cuboids-count' value={count} onChange={onCountChange} />

        <label className='labels' htmlFor='cuboids-width'>
          Cuboid Width:
        </label>
        <input
          className='inputs'
          type='number'
          step='10'
          min={1}
          name='cuboids-width'
          defaultValue={width}
          onChange={onWidthChange}
        />

        <label className='labels' htmlFor='cuboids-height'>
          Cuboid Height:
        </label>
        <input
          className='inputs'
          type='number'
          step='10'
          min={1}
          name='cuboids-width'
          defaultValue={height}
          onChange={onHeightChange}
        />

        <label className='labels' htmlFor='cuboids-thickness'>
          Cuboid Thickness:
        </label>
        <input
          className='inputs'
          type='number'
          min={1}
          name='cuboids-thickness'
          defaultValue={thickness}
          onChange={onThicknessChange}
        />

        <label className='labels' htmlFor='stroke-width'>
          Stroke Width:
        </label>
        <input
          className='inputs'
          type='number'
          name='stroke-width'
          min='0'
          defaultValue={strokeWidth}
          onChange={onStrokeChange}
        />

        <label className='labels' htmlFor='3D-Perspective'>
          3D Perspective:
        </label>
        <input
          className='inputs'
          type='number'
          name='3D-Perspective'
          min='0'
          step='50'
          defaultValue='1800'
          onChange={onPerspectiveChange}
        />

        <label className='labels' htmlFor='delay'>
          Delay:
        </label>
        <input className='inputs' type='number' name='delay' min='0' defaultValue={delay} onChange={onDelayChange} />

        <label className='labels' htmlFor='duration'>
          Duration:
        </label>
        <input
          className='inputs'
          type='number'
          name='duration'
          min='1'
          step={100}
          defaultValue={duration}
          onChange={onDurationChange}
        />

        <br />
        <label className='labels' htmlFor='Cuboid-color'>
          Cuboid Color:
        </label>
        <br />
        <input className='inputs' type='color' name='Cuboid-color' defaultValue='#000000' onChange={onColorChange} />

        <input className='inputs' type='checkbox' name='randomColor' onChange={onRandomColorChange} />
        <label className='labels' htmlFor='randomColor'>
          {' '}
          Random Colors
        </label>

        <br />
        <label className='labels' htmlFor='Stroke-color'>
          Stroke Color:
        </label>
        <br />
        <input className='inputs' type='color' name='Stroke-color' defaultValue='#ffffff' onChange={onStrokeColorChange} />

        <input className='inputs' type='checkbox' name='randomColor' onChange={onStrokeRandomColorChange} />
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
