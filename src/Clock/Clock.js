/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import { animare, ease } from 'animare';
import { useEffect, useState, useRef } from 'react';
import { addUrlQuery, parseUrl, useLazyCss, invertColor, generateColor } from '..';
import styles from './Clock.lazy.css';

const getXY = (x, y, angle, length) => [
  +(x + Math.cos((Math.PI * angle) / 180) * length).toFixed(2),
  +(y + Math.sin((Math.PI * angle) / 180) * length).toFixed(2),
];

export default function Clock() {
  useLazyCss(styles);

  const [count, setCount] = useState(parseUrl().count ?? 8);
  const [multiplier, setMultiplier] = useState(parseUrl().multiplier ?? 4);

  const isRandomColor = useRef(parseUrl().isRandomColor ?? false);
  const isDisco = useRef(parseUrl().isDisco ?? false);
  const isGlowing = useRef(parseUrl().isGlowing ?? false);
  const easing = useRef(parseUrl().easing ?? 'ease.in.quad');
  const delay = useRef(parseUrl().delay ?? 50);
  const duration = useRef(parseUrl().duration ?? 800);
  const isAnimation = useRef(parseUrl().isAnimation ?? true);
  const animations = useRef([]);
  const isRgb = useRef(parseUrl().isRgb ?? false);
  const animationsRgb = useRef([]);
  const isRotating = useRef(parseUrl().isRotating ?? false);
  const animationsRotate = useRef([]);
  const timer = useRef(null);

  const createClocks = () => {
    const circlesCount = count * 2 + 2;
    const result = [];
    const lineLength = 250 / circlesCount;

    for (let i = 0; i < circlesCount; i++) {
      const color = generateColor();
      const pathes = [];
      if (i % 2 && i !== 1) {
        const linesCount = multiplier * (i - 1);

        for (let point = 0; point < linesCount; point++) {
          const angle = (360 / linesCount) * point;
          const [x1, y1] = getXY(250, 250, angle, lineLength * i);
          const [x2, y2] = getXY(x1, y1, angle, lineLength);
          const [xTo, yTo] = getXY(250, 250, angle, lineLength * (i - 1));

          pathes.push(
            <path
              className='Clock'
              key={Math.random()}
              data-from={[x1, y1, x2, y2]}
              data-to={[xTo, yTo, x1, y1]}
              d={`M ${x1} ${y1} L ${x2} ${y2}`}
              style={{
                stroke: isRandomColor.current || isDisco.current ? color : isRgb.current ? 'red' : null,
                transition: isDisco.current ? 'stroke 500ms , filter 500ms' : null,
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
          <g
            className='Clock-group'
            key={Math.random()}
            data-angle={i * 45}
            style={{
              transform: `rotate(${i * 45}deg)`,
            }}
          >
            {pathes}
          </g>
        );
      }
    }
    return result;
  };

  const createAnimations = () => {
    const clockGroups = document.querySelectorAll('.Clock-group');
    const clocks = document.querySelectorAll('.Clock');

    let getEase = easing.current.split('.');
    getEase = getEase.length === 1 ? ease.linear : ease[getEase[1]][getEase[2]];

    const op = {};

    for (let g = 0; g < clockGroups.length; g++) {
      const clocks = clockGroups[g].querySelectorAll('.Clock');

      // rotate
      op.rotate ??= {};
      op.rotate.to ??= [];
      op.rotate.duration ??= [];

      op.rotate.to.push(g % 2 ? 360 : -360);
      op.rotate.duration.push(50000 * (g + 1));

      for (let i = 0; i < clocks.length; i++) {
        const e = clocks[i];

        // animation
        const from = e.dataset.from.split(',').map(n => +n);
        const to = e.dataset.to.split(',').map(n => +n);

        op.animation ??= {};
        op.animation.from ??= [];
        op.animation.to ??= [];
        op.animation.delay ??= [];

        op.animation.from.push(...from);
        op.animation.to.push(...to);
        op.animation.delay.push(...new Array(4).fill(delay.current * i + g * delay.current));

        // rgb
        op.rgb ??= {};
        op.rgb.from ??= [];
        op.rgb.to ??= [];
        op.rgb.to[0] ??= [];
        op.rgb.to[1] ??= [];
        op.rgb.delay ??= [];

        op.rgb.from.push(...[255, 0, 0]);
        op.rgb.to[0].push(...[0, 0, 255]);
        op.rgb.to[1].push(...[0, 255, 0]);
        op.rgb.delay.push(...new Array(3).fill(delay.current * i + g * delay.current));
      }
    }

    // rotate
    {
      const callback_rotate = v => {
        for (let i = 0; i < v.length; i++) {
          clockGroups[i].style.transform = `rotate(${v[i]}deg)`;
        }
      };

      const a_rotate = animare(
        {
          to: op.rotate.to,
          duration: op.rotate.duration,
          direction: 'alternate',
          autoPlay: false,
          repeat: -1,
        },
        callback_rotate
      );
      animationsRotate.current = a_rotate;
    }

    // animation
    {
      const callback = (v, { pause }) => {
        for (let i = 0; i < v.length; i = i + 4) {
          const e = clocks[i / 4];
          if (!document.body.contains(e)) pause();
          e.setAttribute('d', `M ${v[i]} ${v[i + 1]} L ${v[i + 2]} ${v[i + 3]}`);
        }
      };
      const a = animare(
        {
          from: op.animation.from,
          to: op.animation.to,
          duration: duration.current,
          delay: op.animation.delay,
          delayOnce: true,
          autoPlay: false,
          ease: getEase,
        },
        callback
      ).next({ to: op.animation.from, delay: op.animation.delay, delayOnce: true });
      a.setTimelineOptions({ repeat: -1 });
      animations.current = a;
    }

    // rgb
    {
      const callback_color = (v, { pause }) => {
        for (let i = 0; i < v.length; i = i + 3) {
          const e = clocks[i / 3];
          if (!document.body.contains(e)) pause();
          e.style.stroke = `rgb(${v[i]},${v[i + 1]},${v[i + 2]})`;
          isGlowing.current
            ? (e.style.filter = `drop-shadow(0px 0px var(--glow-trength) rgb(${v[i]},${v[i + 1]},${v[i + 2]}))`)
            : e.style.removeProperty('filter');
        }
      };
      const a_rgb = animare(
        {
          from: op.rgb.from,
          to: op.rgb.to[0],
          duration: 2000,
          delay: op.rgb.delay,
          delayOnce: true,
          autoPlay: false,
        },
        callback_color
      )
        .next({ to: op.rgb.to[1] })
        .next({ to: op.rgb.from });
      a_rgb.setTimelineOptions({ repeat: -1 });
      animationsRgb.current = a_rgb;
    }

    play();
  };

  const setupAnimation = () => {
    stop();
    animations.current = null;
    animationsRgb.current = null;
    animationsRotate.current = null;
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

  const play = () => {
    if (isAnimation.current) animations.current?.play?.();
    if (isRotating.current) animationsRotate.current?.play?.();
    if (isRgb.current) animationsRgb.current?.play?.();
  };

  const stop = () => {
    if (isAnimation.current) animations.current?.stop?.();
    if (isRotating.current) animationsRotate.current?.stop?.();
    if (isRgb.current) animationsRgb.current?.stop?.();
  };

  const pause = () => {
    if (isAnimation.current) animations.current?.pause?.();
    if (isRotating.current) animationsRotate.current?.pause?.();
    if (isRgb.current) animationsRgb.current?.pause?.();
  };

  const resume = () => {
    if (isAnimation.current) animations.current?.resume?.();
    if (isRotating.current) animationsRotate.current?.resume?.();
    if (isRgb.current) animationsRgb.current?.resume?.();
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

    window.addEventListener('focus', resume);
    window.addEventListener('blur', pause);

    return () => {
      window.removeEventListener('focus', resume);
      window.removeEventListener('blur', pause);
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
    setupAnimation();
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

  const onRotateChange = e => {
    isRotating.current = e.target.checked;
    addUrlQuery({ isRotating: e.target.checked });
    isRotating.current ? animationsRotate.current?.resume?.() : animationsRotate.current?.pause?.();
  };

  const onRGBChange = e => {
    const clocks = document.querySelectorAll('.Clock');

    isRgb.current = e.target.checked;
    addUrlQuery({ isRgb: isRgb.current });

    document.getElementById('random-check').disabled = isRgb.current;
    document.getElementById('disco-check').disabled = isRgb.current;
    document.getElementById('color-input').disabled = isRgb.current;

    if (isRgb.current) {
      clocks.forEach(e => {
        e.style.stroke = 'red';
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) red)`;
      });
      animationsRgb.current?.play?.();
      return;
    }

    animationsRgb.current?.pause?.();

    clocks.forEach(e => {
      e.style.removeProperty('stroke');
      if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`;
    });
  };

  const onDiscoChange = e => {
    const clocks = document.querySelectorAll('.Clock');

    isDisco.current = e.target.checked;
    addUrlQuery({ isDisco: isDisco.current });

    document.getElementById('random-check').disabled = isDisco.current;
    document.getElementById('rgb-check').disabled = isDisco.current;
    document.getElementById('color-input').disabled = isDisco.current;

    if (isDisco.current) {
      clocks.forEach(e => (e.style.transition = 'stroke 500ms , filter 500ms'));
      disco();
      return;
    }

    clocks.forEach(e => {
      e.style.removeProperty('stroke');
      e.style.removeProperty('transition');

      isGlowing.current
        ? (e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`)
        : e.style.removeProperty('filter');
    });
  };

  const onGlowChange = e => {
    const clocks = document.querySelectorAll('.Clock');

    isGlowing.current = e.target.checked;
    addUrlQuery({ isGlowing: isGlowing.current });

    document.getElementById('glow-input').disabled = !isGlowing.current;

    if (isGlowing.current) {
      clocks.forEach(e => {
        const color = generateColor();
        if (isRandomColor.current) e.style.stroke = color;
        e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${
          isRandomColor.current ? color : isRgb.current ? 'red' : 'var(--stroke-color)'
        })`;
      });

      return;
    }

    clocks.forEach(e => e.style.removeProperty('filter'));
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
            type='checkbox'
            name='rotate-Mode'
            defaultChecked={isRotating.current}
            onChange={onRotateChange}
          />
          <label className='labels' htmlFor='rotate-Mode'>
            {' '}
            Rotate
          </label>
          <br />

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
