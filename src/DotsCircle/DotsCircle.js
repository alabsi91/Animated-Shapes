/* eslint-disable react-hooks/exhaustive-deps */
import { animare, ease } from 'animare';
import { useEffect, useState, useRef } from 'react';
import { addUrlQuery, parseUrl, useLazyCss, invertColor, generateColor } from '..';
import styles from './DotsCircle.lazy.css';

export default function DotsCircle() {
  useLazyCss(styles);

  const [count, setCount] = useState(parseUrl().count ?? 15);
  const [dotGap, setDotGap] = useState(parseUrl().dotGap ?? 3);

  const isRandomColor = useRef(parseUrl().isRandomColor ?? false);
  const isDisco = useRef(parseUrl().isDisco ?? false);
  const isGlowing = useRef(parseUrl().isGlowing ?? false);
  const easing = useRef(parseUrl().easing ?? 'linear');
  const delay = useRef(parseUrl().delay ?? 50);
  const duration = useRef(parseUrl().duration ?? 2000);
  const isAnimation = useRef(parseUrl().isAnimation ?? true);
  const animations = useRef([]);
  const isRgb = useRef(parseUrl().isRgb ?? false);
  const animationsRgb = useRef([]);
  const isRotating = useRef(parseUrl().isRotating ?? false);
  const animationsRotate = useRef([]);
  const timer = useRef(null);

  const getXY = (x, y, angle, length) => [
    +(x + Math.cos((Math.PI * angle) / 180) * length).toFixed(2),
    +(y + Math.sin((Math.PI * angle) / 180) * length).toFixed(2),
  ];

  const createDotsCircles = () => {
    const circlesCount = count * 2;
    const dotRadius = 500 / circlesCount / 4;
    const result = [];

    for (let i = 0; i < circlesCount; i++) {
      const circleRadius = dotRadius * 2 * i;
      const Circumference = 2 * Math.PI * circleRadius;
      const dotsCount = Math.floor(Circumference / ((dotRadius + dotGap) * 2));
      const dots = [];
      if (i % 2) {
        for (let d = 0; d < dotsCount; d++) {
          const color = generateColor();
          const angle = (360 / dotsCount) * d;
          const xy = getXY(250, 250, angle, circleRadius);
          dots.push(
            <circle
              className='DotsCircle'
              key={Math.random()}
              cx={xy[0]}
              cy={xy[1]}
              r={dotRadius}
              style={{
                fill: isRandomColor.current || isDisco.current ? color : isRgb.current ? 'red' : null,
                transition: isDisco.current ? 'fill 500ms , filter 500ms' : null,
                filter:
                  isGlowing.current && isRandomColor.current
                    ? `drop-shadow(0px 0px var(--glow-trength) ${color})`
                    : isGlowing.current
                    ? `drop-shadow(0px 0px var(--glow-trength) var(--fill-color))`
                    : null,
              }}
            />
          );
        }
      }

      if (dots.length)
        result.push(
          <g
            className='DotsCircle-group'
            key={Math.random()}
            data-angle={i * dotRadius}
            style={{ transform: `rotate(${i * dotRadius}deg)` }}
          >
            {dots}
          </g>
        );
    }
    return result;
  };

  const createAnimations = () => {
    const DotsGroups = document.querySelectorAll('.DotsCircle-group');
    const Dots = document.querySelectorAll('.DotsCircle');
    let getEase = easing.current.split('.');
    getEase = getEase.length === 1 ? ease.linear : ease[getEase[1]][getEase[2]];

    const op = {};

    for (let g = 0; g < DotsGroups.length; g++) {
      const dots = DotsGroups[g].querySelectorAll('.DotsCircle');

      // rotate
      op.rotate ??= {};
      op.rotate.from ??= [];
      op.rotate.to ??= [];
      op.rotate.delay ??= [];

      op.rotate.from.push(+DotsGroups[g].dataset.angle);
      op.rotate.to.push(g % 2 ? 360 : -360);
      op.rotate.delay.push(g * delay.current);

      for (let i = 0; i < dots.length; i++) {
        const e = dots[i];

        // animation
        const from = +e.getAttribute('r');
        op.animation ??= {};
        op.animation.from ??= [];
        op.animation.to ??= [];
        op.animation.to[0] ??= [];
        op.animation.to[1] ??= [];
        op.animation.delay ??= [];

        op.animation.from.push(from);
        op.animation.to[0].push(0);
        op.animation.delay.push(i * delay.current);

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
        op.rgb.delay.push(...new Array(3).fill(i * delay.current));
      }
    }

    // rotate
    {
      const callback_rotate = v => {
        for (let i = 0; i < v.length; i++) {
          DotsGroups[i].style.transform = `rotate(${v[i]}deg)`;
        }
      };

      const a_rotate = animare(
        {
          from: op.rotate.from,
          to: op.rotate.to,
          duration: 200000,
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
        for (let i = 0; i < v.length; i++) {
          const e = Dots[i];
          if (!document.body.contains(e)) pause();
          e.setAttribute('r', v[i] < 0 ? 0 : v[i]);
        }
      };

      const a = animare(
        {
          from: op.animation.from,
          to: op.animation.to[0],
          duration: duration.current,
          delay: op.animation.delay,
          delayOnce: true,
          autoPlay: false,
          ease: getEase,
        },
        callback
      ).next({ to: op.animation.from });
      a.setTimelineOptions({ repeat: -1 });
      animations.current = a;
    }

    // rgb
    {
      const callback_rgb = (v, { pause }) => {
        for (let i = 0; i < v.length; i = i + 3) {
          const index = i / 3;
          const e = Dots[index];
          if (!document.body.contains(e)) pause();
          e.style.fill = `rgb(${v[i]},${v[i + 1]},${v[i + 2]})`;
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
        callback_rgb
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
    timer.current = setTimeout(createAnimations, 300);
  };

  const disco = async () => {
    const DotsCircles = document.querySelectorAll('.DotsCircle');
    while (isDisco.current) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!isDisco.current) return;
      for (let i = 0; i < DotsCircles.length; i++) {
        const e = DotsCircles[i];
        const color = generateColor();
        e.style.fill = color;
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
  }, [count, dotGap]);

  useEffect(() => {
    const params = parseUrl();
    if (params.fillColor) document.body.style.setProperty('--fill-color', '#' + params.fillColor);
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

  const onDotGapChange = e => {
    setDotGap(+e.target.value);
    addUrlQuery({ dotGap: +e.target.value });
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
    document.querySelector('.DotsCircle-svg').style.height = (e?.target?.value ?? e) + '%';
    document.querySelector('.DotsCircle-svg').style.width = (e?.target?.value ?? e) + '%';
    if (e?.target?.value) addUrlQuery({ zoom: +e.target.value });
  };

  const onRotateChange = async e => {
    isRotating.current = e.target.checked;
    addUrlQuery({ isRotating: e.target.checked });
    isRotating.current ? animationsRotate.current?.resume?.() : animationsRotate.current?.pause?.();
  };

  const onRGBChange = e => {
    const dots = document.querySelectorAll('.DotsCircle');

    isRgb.current = e.target.checked;
    addUrlQuery({ isRgb: isRgb.current });

    document.getElementById('random-check').disabled = isRgb.current;
    document.getElementById('disco-check').disabled = isRgb.current;
    document.getElementById('color-input').disabled = isRgb.current;

    if (isRgb.current) {
      dots.forEach(e => {
        e.style.fill = 'red';
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) red)`;
      });

      animationsRgb.current?.play?.();
      return;
    }

    animationsRgb.current?.pause?.();

    dots.forEach(e => {
      e.style.removeProperty('fill');
      if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--fill-color))`;
    });
  };

  const onDiscoChange = e => {
    const dots = document.querySelectorAll('.DotsCircle');

    isDisco.current = e.target.checked;
    addUrlQuery({ isDisco: isDisco.current });

    document.getElementById('random-check').disabled = isDisco.current;
    document.getElementById('rgb-check').disabled = isDisco.current;
    document.getElementById('color-input').disabled = isDisco.current;

    if (isDisco.current) {
      dots.forEach(e => (e.style.transition = 'fill 500ms , filter 500ms'));
      disco();
      return;
    }

    dots.forEach(e => {
      e.style.removeProperty('fill');
      e.style.removeProperty('transition');

      isGlowing.current
        ? (e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--fill-color))`)
        : e.style.removeProperty('filter');
    });
  };

  const onGlowChange = e => {
    const dots = document.querySelectorAll('.DotsCircle');

    isGlowing.current = e.target.checked;
    addUrlQuery({ isGlowing: isGlowing.current });
    document.getElementById('glow-input').disabled = !isGlowing.current;

    if (isGlowing.current) {
      dots.forEach(e => {
        const color = generateColor();
        if (isRandomColor.current) e.style.fill = color;
        e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${
          isRandomColor.current ? color : isRgb.current ? 'red' : 'var(--fill-color)'
        })`;
      });

      return;
    }

    dots.forEach(e => e.style.removeProperty('filter'));
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

    document.querySelectorAll('.DotsCircle').forEach(e => {
      if (isRandomColor.current) {
        const color = generateColor();
        e.style.fill = color;
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
        return;
      }
      e.style.removeProperty('fill');
      if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--fill-color))`;
    });
  };

  const onColorChange = e => {
    document.body.style.setProperty('--fill-color', e.target.value);
    addUrlQuery({ fillColor: e.target.value.replace('#', '') });
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
        <svg className='DotsCircle-svg' viewBox='0 0 500 500'>
          {createDotsCircles()}
        </svg>

        <div className='controls'>
          <label className='labels' htmlFor='DotsCircle-count'>
            Circles Count:
          </label>
          <input
            className='inputs'
            type='number'
            min={1}
            max={100}
            name='DotsCircle-count'
            value={count}
            onChange={onCountChange}
          />

          <label className='labels' htmlFor='DotsCircle-gap'>
            Gap:
          </label>
          <input className='inputs' type='number' min={0} name='DotsCircle-gap' value={dotGap} onChange={onDotGapChange} />

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
            defaultValue={parseUrl().glowStrength ?? 2}
            onChange={onGlowStrengthChange}
            disabled={!isGlowing.current}
          />

          <input
            className='inputs'
            id='color-input'
            type='color'
            name='color'
            defaultValue={'#' + (parseUrl()?.fillColor ?? 'ffffff')}
            disabled={isRandomColor.current || isDisco.current || isRgb.current}
            onChange={onColorChange}
          />
          <label className='labels' htmlFor='color'>
            Fill Color
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
