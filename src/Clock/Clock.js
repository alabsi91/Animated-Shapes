/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import { animare, ease } from 'animare';
import { useEffect, useState, useRef } from 'react';
import { addUrlQuery, parseUrl, useLazyCss, sleep } from '..';
import styles from './Clock.lazy.css';

const getXY = (x, y, angle, length) => [
  +(x + Math.cos((Math.PI * angle) / 180) * length).toFixed(2),
  +(y + Math.sin((Math.PI * angle) / 180) * length).toFixed(2),
];

export default function Clock() {
  useLazyCss(styles);

  const [count, setCount] = useState(parseUrl().count ?? 10);
  const [multiplier, setMultiplier] = useState(parseUrl().multiplier ?? 4);

  const isRandomColor = useRef(parseUrl().isRandomColor ?? false);
  const isDisco = useRef(parseUrl().isDisco ?? false);
  const isGlowing = useRef(parseUrl().isGlowing ?? false);
  const easing = useRef(parseUrl().easing ?? 'ease.in.expo');
  const delay = useRef(parseUrl().delay ?? 10);
  const duration = useRef(parseUrl().duration ?? 800);
  const animations = useRef([]);
  const isRgb = useRef(parseUrl().isRgb ?? false);
  const animationsRgb = useRef([]);
  const timer = useRef(null);

  const createClocks = () => {
    const cirlesCount = count * 2 + 2;
    const result = [];
    const lineLength = 250 / cirlesCount;

    for (let i = 0; i < cirlesCount; i++) {
      const color = generateColor();
      const linesCount = multiplier * (i + 1);

      if (i % 2 && i !== 1) {
        const pathes = [];

        for (let point = 0; point < linesCount; point++) {
          const angle = (360 / linesCount) * point;
          const [x1, y1] = getXY(250, 250, angle, lineLength * i);
          const [x2, y2] = getXY(x1, y1, angle, lineLength);
          const [xTo, yTo] = getXY(250, 250, angle, lineLength * (i - 1) - 0.5);

          pathes.push(
            <path
              className='Clock'
              key={Math.random() * 100}
              data-from={[x1, y1, x2, y2]}
              data-to={[xTo, yTo, x1, y1]}
              d={`M ${x1} ${y1} L ${x2} ${y2}`}
              style={{
                stroke: isRandomColor.current ? color : null,
                filter:
                  isGlowing.current && isRandomColor.current
                    ? `drop-shadow(0px 0px var(--glow-trength) ${color})`
                    : isGlowing.current
                    ? `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`
                    : null,
              }}
            />
          );
        }

        result.push(
          <g className='Clock-group' key={Math.random() * 100} style={{ transform: `rotate(${i * 45}deg)` }}>
            {pathes}
          </g>
        );
      }
    }
    return result;
  };

  const createAnimations = () => {
    const clockGroups = document.querySelectorAll('.Clock-group');

    let getEase = easing.current.split('.');
    getEase = getEase.length === 1 ? ease.linear : ease[getEase[1]][getEase[2]];

    for (let g = 0; g < clockGroups.length; g++) {
      const clocks = clockGroups[g].querySelectorAll('.Clock');
      const animationsGroups = [];
      const animationsGroupsRgb = [];

      for (let i = 0; i < clocks.length; i++) {
        const e = clocks[i];

        const callback = ([x1, y1, x2, y2], { pause }) => {
          if (!document.body.contains(e)) pause();
          e.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
        };
        const from = e.dataset.from.split(',').map(n => +n);
        const to = e.dataset.to.split(',').map(n => +n);

        const a = animare(
          {
            from,
            to,
            duration: duration.current,
            autoPlay: false,
            ease: getEase,
          },
          callback
        ).next({ to: from });
        a.setTimelineOptions({ repeat: -1 });
        animationsGroups.push(a);

        if (isRgb.current) {
          const callback_color = ([r, g, b], { pause }) => {
            if (!document.body.contains(e)) pause();
            e.style.stroke = `rgb(${r},${g},${b})`;
            isGlowing.current
              ? (e.style.filter = `drop-shadow(0px 0px var(--glow-trength) rgb(${r},${g},${b}))`)
              : e.style.removeProperty('filter');
          };
          const a_rgb = animare(
            {
              from: [255, 0, 0],
              to: [0, 0, 255],
              duration: 2000,
              autoPlay: false,
            },
            callback_color
          )
            .next({ to: [0, 255, 0] })
            .next({ to: [255, 0, 0] });
          a_rgb.setTimelineOptions({ repeat: -1 });
          animationsGroupsRgb.push(a_rgb);
        }
      }
      animations.current.push(animationsGroups);
      if (isRgb.current) animationsRgb.current.push(animationsGroupsRgb);
    }
    play();
  };

  const setupAnimation = () => {
    stop();
    animations.current = [];
    animationsRgb.current = [];
    clearTimeout(timer.current);
    timer.current = setTimeout(createAnimations, 700);
  };

  const disco = async () => {
    const Clocks = document.querySelectorAll('.Clock');
    while (isDisco.current) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!isDisco.current) return;
      for (let i = 0; i < Clocks.length; i++) {
        const e = Clocks[i];
        const color = generateColor();
        e.style.stroke = color;
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
      }
    }
  };

  const play = async () => {
    const d = delay.current;
    const p = async g => {
      const group = animations.current?.[g];
      const group_rgb = animationsRgb.current?.[g];
      for (let i = 0; i < group.length; i++) {
        const a = group?.[i];
        const b = group?.[i + 1];
        const a_rgb = group_rgb?.[i];
        const b_rgb = group_rgb?.[i + 1];

        a?.play();
        a_rgb?.play();

        if (d) await a?.asyncOnProgress(d);

        b?.play();
        b_rgb?.play();
      }
    };
    for (let g = 0; g < animations.current.length; g++) {
      p(g);
      if (d) await sleep(d);
    }
  };

  const stop = () => {
    for (let g = 0; g < animations.current.length; g++) {
      const group = animations?.current?.[g];
      const group_rgb = animationsRgb?.current?.[g];

      for (let i = 0; i < group?.length; i++) {
        group?.[i]?.stop(0);
        group_rgb?.[i]?.stop(0);
      }
    }
  };

  useEffect(() => {
    setupAnimation();
    if (isDisco.current) disco();
  }, [count, multiplier]);

  useEffect(() => {
    const params = parseUrl();
    if (params.strokeColor) document.body.style.setProperty('--stroke-color', '#' + params.strokeColor);
    if (params.strokeWidth) document.body.style.setProperty('--stroke-width', params.strokeWidth + 'px');
    if (params.glowStrength) document.body.style.setProperty('--glow-trength', params.glowStrength + 'px');
    if (params.backgroundColor) onBgColorChange('#' + params.backgroundColor);
    if (params.zoom) onZoomChange(params.zoom);

    window.addEventListener('focus', play);
    window.addEventListener('blur', stop);

    return () => {
      window.removeEventListener('focus', play);
      window.removeEventListener('blur', stop);
    };
  }, []);

  const onCountChange = e => {
    const value = +e.target.value > +e.target.max ? +e.target.max : +e.target.value;
    setCount(value);
    addUrlQuery({ count: value });
  };

  const onMultiplierChange = e => {
    const value = +e.target.value > +e.target.max ? +e.target.max : +e.target.value;
    setMultiplier(value);
    addUrlQuery({ multiplier: value });
  };

  const onStrokeWidthChange = e => {
    document.body.style.setProperty('--stroke-width', e.target.value);
    addUrlQuery({ strokeWidth: +e.target.value });
  };

  const onDurationChange = e => {
    duration.current = +e.target.value;
    addUrlQuery({ duration: +e.target.value });
    for (let g = 0; g < animations.current.length; g++) {
      const group = animations.current[g];
      for (let i = 0; i < group.length; i++) {
        group[i]?.setOptions({ duration: duration.current });
      }
    }
  };

  const onDelayChange = e => {
    delay.current = +e.target.value;
    addUrlQuery({ delay: +e.target.value });
    setupAnimation();
  };

  const onEaseChange = e => {
    easing.current = e.target.value;
    addUrlQuery({ easing: e.target.value });
    setupAnimation();
  };

  const onZoomChange = e => {
    document.querySelector('.Clock-svg').style.height = (e?.target?.value ?? e) + '%';
    document.querySelector('.Clock-svg').style.width = (e?.target?.value ?? e) + '%';
    if (e?.target?.value) addUrlQuery({ zoom: +e.target.value });
  };

  const onRGBChange = async e => {
    isRgb.current = e.target.checked;
    addUrlQuery({ isRgb: isRgb.current });
    document.getElementById('random-check').disabled = isRgb.current;
    document.getElementById('disco-check').disabled = isRgb.current;
    document.getElementById('color-input').disabled = isRgb.current;

    if (isRgb.current) {
      document.querySelectorAll('.Clock').forEach(e => {
        e.style.stroke = 'red';
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) red)`;
      });
      setupAnimation();
    } else {
      animationsRgb.current.forEach(group => group.forEach(a => a?.stop(0)));
      animationsRgb.current = [];
      await sleep(200);
      document.querySelectorAll('.Clock').forEach(e => {
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
    addUrlQuery({ isDisco: isDisco.current });
    document.getElementById('random-check').disabled = isDisco.current;
    document.getElementById('rgb-check').disabled = isDisco.current;
    document.getElementById('color-input').disabled = isDisco.current;

    if (isDisco.current) {
      if (isRgb.current) animationsRgb.current.forEach(a => a.pause());
      disco();
    } else {
      if (isRgb.current) setupAnimation();
      document.querySelectorAll('.Clock').forEach(e => {
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

  const onGlowChange = e => {
    isGlowing.current = e.target.checked;
    addUrlQuery({ isGlowing: isGlowing.current });
    document.getElementById('glow-input').disabled = !isGlowing.current;

    if (isGlowing.current) {
      if (isRgb.current) return;
      if (isRandomColor.current) {
        document.querySelectorAll('.Clock').forEach(e => {
          const color = generateColor();
          e.style.stroke = color;
          e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
        });
        return;
      }

      document.querySelectorAll('.Clock').forEach(e => {
        e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`;
      });
    } else {
      document.querySelectorAll('.Clock').forEach(e => {
        e.style.removeProperty('filter');
      });
    }
  };

  const onGlowStrengthChange = e => {
    document.body.style.setProperty('--glow-trength', e.target.value + 'px');
    addUrlQuery({ glowStrength: e.target.value });
  };

  const onRandomColorChange = e => {
    isRandomColor.current = e.target.checked;

    addUrlQuery({ isRandomColor: e.target.checked });

    document.getElementById('color-input').disabled = isRandomColor.current;
    document.getElementById('rgb-check').disabled = isRandomColor.current;
    document.getElementById('disco-check').disabled = isRandomColor.current;

    document.querySelectorAll('.Clock').forEach(e => {
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
    addUrlQuery({ strokeColor: e.target.value.replace('#', '') });
  };

  const onBgColorChange = e => {
    document.body.style.backgroundColor = e?.target?.value ?? e;
    if (e?.target?.value) addUrlQuery({ backgroundColor: e.target.value.replace('#', '') });
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
        <svg className='Clock-svg' viewBox='0 0 500 500'>
          {createClocks()}
        </svg>

        <div className='controls'>
          <label className='labels' htmlFor='Clock-count'>
            Circles Count:
          </label>
          <input className='inputs' type='number' min={1} max={100} name='Clock-count' value={count} onChange={onCountChange} />

          <label className='labels' htmlFor='SwirlingLines-Multiplier'>
            Multiplier:
          </label>
          <input
            className='inputs'
            type='number'
            min={1}
            max={70}
            name='SwirlingLines-Multiplier'
            value={multiplier}
            onChange={onMultiplierChange}
          />

          <label className='labels' htmlFor='Clock-stroke-width'>
            Stroke width:
          </label>
          <input
            className='inputs'
            type='number'
            min={1}
            name='Clock-stroke-width'
            defaultValue={parseUrl().strokeWidth ?? 2}
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

          <label className='labels' htmlFor='ease-select'>
            Ease:
          </label>
          <select className='select' name='ease-select' defaultValue={easing.current} onChange={onEaseChange}>
            <optgroup />
            <option value='linear'>- linear</option>
            <optgroup />
            {Object.keys(ease.in).map(e => (
              <option key={`ease.in.${e}`} value={`ease.in.${e}`}>{`- in ${e}`}</option>
            ))}
            <optgroup />
            {Object.keys(ease.out).map(e => (
              <option key={`ease.out.${e}`} value={`ease.out.${e}`}>{`- out ${e}`}</option>
            ))}
            <optgroup />
            {Object.keys(ease.inOut).map(e => (
              <option key={`ease.inOut.${e}`} value={`ease.inOut.${e}`}>{`- inOut ${e}`}</option>
            ))}
            <optgroup />
          </select>

          <label className='labels' htmlFor='zoom'>
            Zoom:
          </label>
          <input
            className='inputs'
            type='range'
            min='5'
            max='150'
            name='zoom'
            defaultValue={parseUrl().zoom ?? 95}
            onChange={onZoomChange}
          />

          <input
            className='inputs'
            id='rgb-check'
            type='checkbox'
            name='RGB-Mode'
            defaultChecked={isRgb.current}
            disabled={isDisco.current || isRandomColor.current}
            onChange={onRGBChange}
          />
          <label className='labels' htmlFor='RGB-Mode'>
            {' '}
            RGB
          </label>

          <br />
          <input
            className='inputs'
            id='disco-check'
            type='checkbox'
            name='Disco-Mode'
            defaultChecked={isDisco.current}
            disabled={isRgb.current || isRandomColor.current}
            onChange={onDiscoChange}
          />
          <label className='labels' htmlFor='Disco-Mode'>
            {' '}
            Disco
          </label>

          <br />
          <input
            className='inputs'
            id='random-check'
            type='checkbox'
            name='randomColor'
            defaultChecked={isRandomColor.current}
            disabled={isDisco.current || isRgb.current}
            onChange={onRandomColorChange}
          />
          <label className='labels' htmlFor='randomColor'>
            {' '}
            Random Colors
          </label>

          <br />
          <input
            className='inputs'
            id='glow-check'
            type='checkbox'
            name='Glow-Mode'
            defaultChecked={isGlowing.current}
            onChange={onGlowChange}
          />
          <label className='labels' htmlFor='Glow-Mode'>
            {' '}
            Glow
          </label>

          <br />
          <label className='labels' htmlFor='glow-strength'>
            Glow strength:
          </label>
          <input
            className='inputs'
            id='glow-input'
            step='0.5'
            type='number'
            name='glow-strength'
            min='0.5'
            defaultValue={parseUrl().glowStrength ?? 1}
            onChange={onGlowStrengthChange}
            disabled={!isGlowing.current}
          />

          <input
            className='inputs'
            id='color-input'
            type='color'
            name='color'
            defaultValue={'#' + (parseUrl()?.strokeColor ?? 'ffffff')}
            disabled={isRandomColor.current || isDisco.current || isRgb.current}
            onChange={onColorChange}
          />
          <label className='labels' htmlFor='color'>
            Stroke Color
          </label>

          <br />
          <br />

          <input
            className='inputs'
            type='color'
            name='bg-color'
            defaultValue={'#' + (parseUrl()?.backgroundColor ?? '000000')}
            onChange={onBgColorChange}
          />
          <label className='labels' htmlFor='bg-color'>
            Background Color
          </label>
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
