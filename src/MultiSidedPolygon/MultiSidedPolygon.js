/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import { animare, ease } from 'animare';
import { useEffect, useState, useRef } from 'react';
import { addUrlQuery, parseUrl, sleep, useLazyCss, invertColor, generateColor } from '..';
import styles from './MultiSidedPolygon.lazy.css';

export default function MultiSidedPolygon() {
  useLazyCss(styles);

  const [count, setCount] = useState(parseUrl().count ?? 20);
  const [sides, setSides] = useState(parseUrl().sides ?? 6);

  const isRandomColor = useRef(parseUrl().isRandomColor ?? false);
  const isRgb = useRef(parseUrl().isRgb ?? false);
  const isDisco = useRef(parseUrl().isDisco ?? false);
  const isGlowing = useRef(parseUrl().isGlowing ?? false);
  const easing = useRef(parseUrl().easing ?? 'ease.inOut.quad');
  const delay = useRef(parseUrl().delay ?? 20);
  const duration = useRef(parseUrl().duration ?? 6000);
  const isRotating = useRef(parseUrl().isRotating ?? true);
  const animations = useRef([]);
  const isDash = useRef(parseUrl().isDash ?? false);
  const animationsDash = useRef([]);
  const animationsRgb = useRef([]);
  const timer = useRef(null);

  const createMultiSidedPolygons = () => {
    const result = [];
    const angle = 360 / sides;

    for (let i = 0; i < count; i++) {
      const sideLength = (i + 1) * (245 / count);
      const xy = [];
      for (let point = 0; point < sides; point++) {
        const x = +(250 + Math.cos((Math.PI * angle * point) / 180) * sideLength).toFixed(2);
        const y = +(250 + Math.sin((Math.PI * angle * point) / 180) * sideLength).toFixed(2);
        xy.push(`${x} ${y}`);
      }

      result.push(
        <path
          className='MultiSidedPolygon'
          key={'MultiSidedPolygon' + i}
          style={{
            stroke: isRandomColor.current ? generateColor() : isRgb.current ? 'red' : null,
            filter:
              isGlowing.current && isRandomColor.current
                ? `drop-shadow(0px 0px var(--glow-trength) ${generateColor()})`
                : isGlowing.current
                ? `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`
                : null,
          }}
          d={`M ${xy.join(' L ')} Z`}
        />
      );
    }
    return result;
  };

  const createAnimations = () => {
    const MultiSidedPolygons = document.querySelectorAll('.MultiSidedPolygon');
    let getEase = easing.current.split('.');
    getEase = getEase.length === 1 ? ease.linear : ease[getEase[1]][getEase[2]];

    for (let i = 0; i < MultiSidedPolygons.length; i++) {
      const e = MultiSidedPolygons[i];

      if (isRotating.current) {
        const callback = ([r], { pause }) => {
          if (!document.body.contains(e)) pause();
          e.style.transform = `rotate(${r}deg)`;
        };

        const a_rotate = animare(
          {
            to: 360,
            duration: duration.current,
            delay: i * delay.current,
            delayOnce: true,
            direction: 'alternate',
            repeat: -1,
            autoPlay: false,
            ease: getEase,
          },
          callback
        );
        animations.current.push(a_rotate);
      }

      if (isDash.current) {
        const length = e.getTotalLength();
        e.style.strokeDasharray = length / sides + 'px';

        const callback_dash = ([o], { pause }) => {
          if (!document.body.contains(e)) pause();
          e.style.strokeDashoffset = o + 'px';
        };

        const a_dash = animare(
          {
            from: 0,
            to: length,
            duration: duration.current,
            delay: i * delay.current * 2,
            direction: 'alternate',
            autoPlay: false,
            ease: getEase,
          },
          callback_dash
        ).next({ from: -length, to: 0 });
        a_dash.setTimelineOptions({ repeat: -1 });
        animationsDash.current.push(a_dash);
      }

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
            delay: i * delay.current,
            delayOnce: true,
            autoPlay: false,
          },
          callback_color
        )
          .next({ to: [0, 255, 0] })
          .next({ to: [255, 0, 0] });
        a_rgb.setTimelineOptions({ repeat: -1 });
        animationsRgb.current.push(a_rgb);
      }
    }
    play();
  };

  const setupAnimation = () => {
    stop();
    animations.current = [];
    animationsRgb.current = [];
    animationsDash.current = [];
    clearTimeout(timer.current);
    timer.current = setTimeout(createAnimations, 300);
  };

  const disco = async () => {
    const MultiSidedPolygons = document.querySelectorAll('.MultiSidedPolygon');
    while (isDisco.current) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!isDisco.current) return;
      for (let i = 0; i < MultiSidedPolygons.length; i++) {
        const e = MultiSidedPolygons[i];
        const color = generateColor();
        e.style.stroke = color;
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
      }
    }
  };

  const play = () => {
    const polygons = document.querySelectorAll('.MultiSidedPolygon').length;
    for (let i = 0; i < polygons; i++) {
      animations.current[i]?.play();
      animationsRgb.current?.[i]?.play();
      animationsDash.current?.[i]?.play();
    }
  };

  const stop = () => {
    const polygons = document.querySelectorAll('.MultiSidedPolygon').length;
    for (let i = 0; i < polygons; i++) {
      animations.current[i]?.stop(0);
      animationsRgb.current?.[i]?.stop(0);
      animationsDash.current?.[i]?.stop(0);
    }
  };

  useEffect(() => {
    setupAnimation();
    if (isDisco.current) disco();
  }, [count, sides]);

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

  const onSidesChange = e => {
    setSides(+e.target.value);
    addUrlQuery({ sides: +e.target.value });
  };

  const onStrokeWidthChange = e => {
    document.body.style.setProperty('--stroke-width', e.target.value);
    addUrlQuery({ strokeWidth: +e.target.value });
  };

  const onDurationChange = e => {
    duration.current = +e.target.value;
    addUrlQuery({ duration: +e.target.value });
    for (let i = 0; i < count; i++) {
      animations.current[i]?.setOptions({ duration: duration.current });
      animationsDash.current[i]?.setOptions({ duration: duration.current });
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
    document.querySelector('.MultiSidedPolygon-svg').style.height = (e?.target?.value ?? e) + '%';
    document.querySelector('.MultiSidedPolygon-svg').style.width = (e?.target?.value ?? e) + '%';
    if (e?.target?.value) addUrlQuery({ zoom: +e.target.value });
  };

  const onDashChange = e => {
    isDash.current = e.target.checked;
    addUrlQuery({ isDash: e.target.checked });
    if (!isDash.current) {
      animationsDash.current.forEach(a => a.stop(0));
      animationsDash.current = [];
      document.querySelectorAll('.MultiSidedPolygon').forEach(e => {
        e.style.removeProperty('stroke-dasharray');
      });
    } else setupAnimation();
  };

  const onRotateChange = e => {
    isRotating.current = e.target.checked;
    addUrlQuery({ isRotating: e.target.checked });
    if (!isRotating.current) {
      animations.current.forEach(a => a.stop(0));
      animations.current = [];
    } else setupAnimation();
  };

  const onRGBChange = async e => {
    isRgb.current = e.target.checked;
    addUrlQuery({ isRgb: isRgb.current });
    document.getElementById('random-check').disabled = isRgb.current;
    document.getElementById('disco-check').disabled = isRgb.current;
    document.getElementById('color-input').disabled = isRgb.current;

    if (isRgb.current) {
      document.querySelectorAll('.MultiSidedPolygon').forEach(e => {
        e.style.stroke = 'red';
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) red)`;
      });
      setupAnimation();
    } else {
      animationsRgb.current.forEach(a => a.stop(0));
      animationsRgb.current = [];
      await sleep(100);
      document.querySelectorAll('.MultiSidedPolygon').forEach(e => {
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
      document.querySelectorAll('.MultiSidedPolygon').forEach(e => {
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
    addUrlQuery({ isGlowing: isGlowing.current });
    document.getElementById('glow-input').disabled = !isGlowing.current;

    if (isGlowing.current) {
      if (isRgb.current) return;
      if (isRandomColor.current) {
        document.querySelectorAll('.MultiSidedPolygon').forEach(e => {
          const color = generateColor();
          e.style.stroke = color;
          e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
        });
        return;
      }

      document.querySelectorAll('.MultiSidedPolygon').forEach(e => {
        e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`;
      });
    } else {
      document.querySelectorAll('.MultiSidedPolygon').forEach(e => {
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

    document.querySelectorAll('.MultiSidedPolygon').forEach(e => {
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
        <svg className='MultiSidedPolygon-svg' viewBox='0 0 500 500'>
          {createMultiSidedPolygons()}
        </svg>

        <div className='controls'>
          <label className='labels' htmlFor='MultiSidedPolygon-count'>
            Polygons Count:
          </label>
          <input
            className='inputs'
            type='number'
            min={1}
            max={150}
            name='MultiSidedPolygon-count'
            value={count}
            onChange={onCountChange}
          />

          <label className='labels' htmlFor='MultiSidedPolygon-sides'>
            Sides Count:
          </label>
          <input className='inputs' type='number' min={3} name='MultiSidedPolygon-sides' value={sides} onChange={onSidesChange} />

          <label className='labels' htmlFor='MultiSidedPolygon-stroke-width'>
            Stroke width:
          </label>
          <input
            className='inputs'
            type='number'
            min={1}
            name='MultiSidedPolygon-stroke-width'
            defaultValue={parseUrl().strokeWidth ?? 1}
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
            defaultValue={parseUrl().zoom ?? 100}
            onChange={onZoomChange}
          />

          <input className='inputs' type='checkbox' name='dashes-Mode' defaultChecked={isDash.current} onChange={onDashChange} />
          <label className='labels' htmlFor='dashes-Mode'>
            {' '}
            Dashes
          </label>
          <br />

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
