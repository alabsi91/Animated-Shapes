/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import { animare, ease } from 'animare';
import { useEffect, useState, useRef } from 'react';
import { addUrlQuery, parseUrl, useLazyCss, invertColor, generateColor } from '..';
import styles from './SwirlingLines.lazy.css';

export default function SwirlingLines() {
  useLazyCss(styles);

  const [count, setCount] = useState(parseUrl().count ?? 10);
  const [multiplier, setMultiplier] = useState(parseUrl().multiplier ?? 3);

  const isRandomColor = useRef(parseUrl().isRandomColor ?? false);
  const isDisco = useRef(parseUrl().isDisco ?? false);
  const isGlowing = useRef(parseUrl().isGlowing ?? false);
  const easing = useRef(parseUrl().easing ?? 'ease.inOut.quad');
  const delay = useRef(parseUrl().delay ?? 150);
  const duration = useRef(parseUrl().duration ?? 1000);
  const isAnimation = useRef(parseUrl().isAnimation ?? true);
  const animations = useRef([]);
  const isRgb = useRef(parseUrl().isRgb ?? false);
  const animationsRgb = useRef([]);
  const isDash = useRef(parseUrl().isDash ?? false);
  const animationsDash = useRef([]);
  const timer = useRef(null);

  const createSwirlingLiness = () => {
    const result = [];
    const lineLength = 250 / count;

    for (let i = 0; i < count; i++) {
      const color = generateColor();
      const lineCount = multiplier * 2 * (i + 1);
      const xy = [];

      for (let point = 0; point < lineCount; point++) {
        const angle = 360 / lineCount;
        const x1 = +(250 + Math.cos((Math.PI * angle * point) / 180) * (lineLength * i)).toFixed(2);
        const y1 = +(250 + Math.sin((Math.PI * angle * point) / 180) * (lineLength * i)).toFixed(2);
        const x2 = +(x1 + Math.cos((Math.PI * angle * point) / 180) * lineLength).toFixed(2);
        const y2 = +(y1 + Math.sin((Math.PI * angle * point) / 180) * lineLength).toFixed(2);
        xy.push(`M ${x1} ${y1} L ${x2} ${y2}`);
      }

      result.push(
        <path
          className='SwirlingLines'
          key={Math.random()}
          d={xy.join(' ')}
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
    return result;
  };

  const createAnimations = () => {
    const SwirlingLines = document.querySelectorAll('.SwirlingLines');
    let getEase = easing.current.split('.');
    getEase = getEase.length === 1 ? ease.linear : ease[getEase[1]][getEase[2]];

    const op = {};

    for (let i = 0; i < SwirlingLines.length; i++) {
      const e = SwirlingLines[i];
      const duration_custom = duration.current + count * (multiplier * 4) * i;
      const delay_custom = duration.current + count * (multiplier * 5) * (count - 1 - i) + delay.current * 2;

      if (isAnimation.current) {
        op.animation ??= {};
        op.animation.to ??= [];
        op.animation.to[0] ??= [];
        op.animation.to[1] ??= [];
        op.animation.duration ??= [];
        op.animation.delay ??= [];
        op.animation.delay[0] ??= [];
        op.animation.delay[1] ??= [];

        op.animation.to[0].push(90);
        op.animation.to[1].push(0);
        op.animation.duration.push(duration_custom);
        op.animation.delay[0].push(i * delay.current);
        op.animation.delay[1].push(delay_custom);
      }

      // dash
      const length = e.getTotalLength();
      if (isDash.current) e.style.strokeDasharray = length * 0.1 + 'px';

      op.dash ??= {};
      op.dash.from ??= [];
      op.dash.to ??= [];
      op.dash.to[0] ??= [];
      op.dash.to[1] ??= [];
      op.dash.duration ??= [];
      op.dash.delay ??= [];

      op.dash.to[0].push(length);
      op.dash.duration.push(duration_custom * 7);
      op.dash.delay.push(i * delay.current);
      op.dash.from.push(-length); // next
      op.dash.to[1].push(0); // next

      // rgb
      op.rgb ??= {};
      op.rgb.delay ??= [];
      op.rgb.to ??= [];
      op.rgb.to[0] ??= [];
      op.rgb.to[1] ??= [];
      op.rgb.to[2] ??= [];
      op.rgb.from ??= [];

      op.rgb.delay.push(...new Array(3).fill(i * delay.current));
      op.rgb.from.push(...[255, 0, 0]);
      op.rgb.to[0].push(...[0, 0, 255]);
      op.rgb.to[1].push(...[0, 255, 0]);
    }

    if (isAnimation.current) {
      const callback = (v, { pause }) => {
        for (let i = 0; i < v.length; i++) {
          const e = SwirlingLines[i];

          if (!document.body.contains(e)) pause();
          e.style.transform = `rotate(${v[i]}deg)`;
        }
      };

      const a = animare(
        {
          to: op.animation.to[0],
          duration: op.animation.duration,
          delay: op.animation.delay[0],
          delayOnce: true,
          autoPlay: false,
          ease: getEase,
        },
        callback
      ).next({ to: op.animation.to[1], delay: op.animation.delay[1] });

      a.setTimelineOptions({ repeat: -1 });

      animations.current = a;
    }

    // dash
    {
      const callback_dash = (v, { pause }) => {
        for (let i = 0; i < v.length; i++) {
          const e = SwirlingLines[i];
          if (!document.body.contains(e)) pause();
          e.style.strokeDashoffset = v[i] + 'px';
        }
      };

      const a_dash = animare(
        {
          to: op.dash.to[0],
          duration: op.dash.duration,
          delay: op.dash.delay,
          autoPlay: false,
          ease: getEase,
        },
        callback_dash
      ).next({ from: op.dash.from, to: op.dash.to[1] });

      a_dash.setTimelineOptions({ repeat: -1 });

      animationsDash.current = a_dash;
    }

    // rgb
    {
      const callback_color = (v, { pause }) => {
        for (let i = 0; i < v.length; i = i + 3) {
          const e = SwirlingLines[i / 3];
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
    animationsDash.current = null;
    animationsRgb.current = null;
    clearTimeout(timer.current);
    timer.current = setTimeout(createAnimations, 300);
  };

  const disco = async () => {
    const SwirlingLines = document.querySelectorAll('.SwirlingLines');
    while (isDisco.current) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!isDisco.current) return;
      for (let i = 0; i < SwirlingLines.length; i++) {
        const e = SwirlingLines[i];
        const color = generateColor();
        e.style.stroke = color;
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
      }
    }
  };

  const play = () => {
    animations.current?.play?.();
    if (isDash.current) animationsDash.current?.play?.();
    if (isRgb.current) animationsRgb.current?.play?.();
  };

  const stop = () => {
    animations.current?.stop?.();
    if (isDash.current) animationsDash.current?.stop?.();
    if (isRgb.current) animationsRgb.current?.stop?.();
  };

  const pause = () => {
    animations.current?.pause?.();
    if (isDash.current) animationsDash.current?.pause?.();
    if (isRgb.current) animationsRgb.current?.pause?.();
  };

  const resume = () => {
    animations.current?.resume?.();
    if (isDash.current) animationsDash.current?.resume?.();
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
    document.querySelector('.SwirlingLines-svg').style.height = (e?.target?.value ?? e) + '%';
    document.querySelector('.SwirlingLines-svg').style.width = (e?.target?.value ?? e) + '%';
    if (e?.target?.value) addUrlQuery({ zoom: +e.target.value });
  };

  const onDashChange = e => {
    isDash.current = e.target.checked;
    addUrlQuery({ isDash: e.target.checked });
    if (isDash.current) {
      animationsDash.current?.play?.();
      document.querySelectorAll('.SwirlingLines').forEach(e => {
        const length = e.getTotalLength();
        e.style.strokeDasharray = length * 0.1 + 'px';
      });
    } else {
      animationsDash.current?.pause?.();
      document.querySelectorAll('.SwirlingLines').forEach(e => {
        e.style.removeProperty('stroke-dasharray');
      });
    }
  };

  const onRGBChange = e => {
    const lines = document.querySelectorAll('.SwirlingLines');

    isRgb.current = e.target.checked;
    addUrlQuery({ isRgb: isRgb.current });

    document.getElementById('random-check').disabled = isRgb.current;
    document.getElementById('disco-check').disabled = isRgb.current;
    document.getElementById('color-input').disabled = isRgb.current;

    if (isRgb.current) {
      lines.forEach(e => {
        e.style.stroke = 'red';
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) red)`;
      });
      animationsRgb.current?.play?.();
      return;
    }

    animationsRgb.current?.pause?.();

    lines.forEach(e => {
      e.style.removeProperty('stroke');
      if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`;
    });
  };

  const onDiscoChange = e => {
    const lines = document.querySelectorAll('.SwirlingLines');

    isDisco.current = e.target.checked;
    addUrlQuery({ isDisco: isDisco.current });

    document.getElementById('random-check').disabled = isDisco.current;
    document.getElementById('rgb-check').disabled = isDisco.current;
    document.getElementById('color-input').disabled = isDisco.current;

    if (isDisco.current) {
      lines.forEach(e => (e.style.transition = 'stroke 500ms , filter 500ms'));
      disco();
      return;
    }

    lines.forEach(e => {
      e.style.removeProperty('stroke');
      e.style.removeProperty('transition');

      isGlowing.current
        ? (e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`)
        : e.style.removeProperty('filter');
    });
  };

  const onGlowChange = e => {
    const lines = document.querySelectorAll('.SwirlingLines');

    isGlowing.current = e.target.checked;
    addUrlQuery({ isGlowing: isGlowing.current });

    document.getElementById('glow-input').disabled = !isGlowing.current;

    if (isGlowing.current) {
      lines.forEach(e => {
        const color = generateColor();
        if (isRandomColor.current) e.style.stroke = color;
        e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${
          isRandomColor.current ? color : isRgb.current ? 'red' : 'var(--stroke-color)'
        })`;
      });

      return;
    }

    lines.forEach(e => e.style.removeProperty('filter'));
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

    document.querySelectorAll('.SwirlingLines').forEach(e => {
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
        <svg className='SwirlingLines-svg' viewBox='0 0 500 500'>
          {createSwirlingLiness()}
        </svg>

        <div className='controls'>
          <label className='labels' htmlFor='SwirlingLines-count'>
            Circles Count:
          </label>
          <input
            className='inputs'
            type='number'
            min={1}
            max={100}
            name='SwirlingLines-Multiplier'
            value={count}
            onChange={onCountChange}
          />

          <label className='labels' htmlFor='SwirlingLines-Multiplier'>
            Line Multiplier:
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

          <label className='labels' htmlFor='SwirlingLines-stroke-width'>
            Stroke width:
          </label>
          <input
            className='inputs'
            type='number'
            min={1}
            name='SwirlingLines-stroke-width'
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
            defaultValue={parseUrl().zoom ?? 95}
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
