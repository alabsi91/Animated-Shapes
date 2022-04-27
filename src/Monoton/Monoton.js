/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import { animare, ease } from 'animare';
import { useEffect, useState, useRef, cloneElement } from 'react';
import { addUrlQuery, parseUrl, useLazyCss, invertColor, generateColor } from '..';
import Letters from '../Monoton/Letters';
import styles from './Monoton.lazy.css';

export default function Monoton() {
  useLazyCss(styles);

  const [text, setText] = useState(parseUrl()?.text?.replaceAll('%20', ' ') ?? 'TEXT');

  const isRandomColor = useRef(parseUrl().isRandomColor ?? false);
  const isDisco = useRef(parseUrl().isDisco ?? false);
  const isGlowing = useRef(parseUrl().isGlowing ?? false);
  const easing = useRef(parseUrl().easing ?? 'ease.inOut.quad');
  const delay = useRef(parseUrl().delay ?? 150);
  const duration = useRef(parseUrl().duration ?? 2000);
  const isRgb = useRef(parseUrl().isRgb ?? false);
  const animationsRgb = useRef([]);
  const isDash = useRef(parseUrl().isDash ?? true);
  const animationsDash = useRef([]);
  const timer = useRef(null);

  const createMonotons = () => {
    const result = [];
    for (let i = 0; i < text.length; i++) {
      const L = Letters?.[text[i].toUpperCase()];
      const color = generateColor();
      if (L)
        result.push(
          cloneElement(
            L,
            {
              key: Math.random(),
              className: 'Monoton-svg',
            },
            L?.props?.children?.map(c =>
              cloneElement(c, {
                key: Math.random(),
                className: 'Monoton',
                style: {
                  stroke: isRandomColor.current || isDisco.current ? color : isRgb.current ? 'red' : null,
                  transition: isDisco.current ? 'stroke 500ms , filter 500ms' : null,
                  filter:
                    isGlowing.current && isRandomColor.current
                      ? `drop-shadow(0px 0px var(--glow-trength) ${color})`
                      : isGlowing.current
                      ? `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`
                      : null,
                },
              })
            )
          )
        );
    }
    return result;
  };

  const createAnimations = () => {
    const letters = document.querySelectorAll('.Monoton-svg');
    const pathes = document.querySelectorAll('.Monoton-svg path');
    let getEase = easing.current.split('.');
    getEase = getEase.length === 1 ? ease.linear : ease[getEase[1]][getEase[2]];

    const op = {};

    for (let i = 0; i < letters.length; i++) {
      const Monotons = letters[i].childNodes;

      for (let p = 0; p < Monotons.length; p++) {
        const e = Monotons[p];

        // dash
        const length = e.getTotalLength();
        if (isDash.current) {
          e.style.strokeDasharray = length / 2 + 'px';
          e.style.strokeDashoffset = length + 'px';
        }

        op.dash ??= {};
        op.dash.from ??= [];
        op.dash.to ??= [];
        op.dash.to[0] ??= [];
        op.dash.to[1] ??= [];
        op.dash.delay ??= [];

        op.dash.from.push(...[length, length / 2]);
        op.dash.to[0].push(...[0, length]);
        op.dash.to[1].push(...[-length, length / 2]);
        op.dash.delay.push(...new Array(2).fill(delay.current * p));

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
    }
    // dash
    {
      const callback_dash = (v, { pause }) => {
        for (let i = 0; i < v.length; i = i + 2) {
          const e = pathes[i / 2];
          if (!document.body.contains(e)) pause();
          e.style.strokeDashoffset = v[i] + 'px';
          e.style.strokeDasharray = v[i + 1] + 'px';
        }
      };

      const a_dash = animare(
        {
          from: op.dash.from,
          to: op.dash.to[0],
          duration: duration.current,
          delay: op.dash.delay,
          autoPlay: false,
          ease: getEase,
        },
        callback_dash
      )
        .next({ to: op.dash.to[1] })
        .next({ to: op.dash.to[0] })
        .next({ to: op.dash.from });

      a_dash.setTimelineOptions({ repeat: -1 });
      animationsDash.current = a_dash;
    }

    // rgb
    {
      const callback_color = (v, { pause }) => {
        for (let i = 0; i < v.length; i = i + 3) {
          const e = pathes[i / 3];
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
    animationsRgb.current = null;
    animationsDash.current = null;
    clearTimeout(timer.current);
    timer.current = setTimeout(createAnimations, 300);
  };

  const disco = async () => {
    const Monotons = document.querySelectorAll('.Monoton');
    while (isDisco.current) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!isDisco.current) return;
      for (let i = 0; i < Monotons.length; i++) {
        const e = Monotons[i];
        const color = generateColor();
        e.style.stroke = color;
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
      }
    }
  };

  const play = () => {
    if (isDash.current) animationsDash.current?.play?.();
    if (isRgb.current) animationsRgb.current?.play?.();
  };

  const stop = () => {
    if (isDash.current) animationsDash.current?.stop?.();
    if (isRgb.current) animationsRgb.current?.stop?.();
  };

  const pause = () => {
    if (isDash.current) animationsDash.current?.pause?.();
    if (isRgb.current) animationsRgb.current?.pause?.();
  };

  const resume = () => {
    if (isDash.current) animationsDash.current?.resume?.();
    if (isRgb.current) animationsRgb.current?.resume?.();
  };

  useEffect(() => {
    setupAnimation();
    if (isDisco.current) disco();
  }, [text]);

  useEffect(() => {
    const params = parseUrl();
    if (params.strokeColor) document.body.style.setProperty('--stroke-color', '#' + params.strokeColor);
    if (params.strokeWidth) document.body.style.setProperty('--stroke-width', params.strokeWidth + 'px');
    if (params.glowStrength) document.body.style.setProperty('--glow-trength', params.glowStrength + 'px');
    if (params.backgroundColor) onBgColorChange('#' + params.backgroundColor);
    if (params.zoom) document.body.style.setProperty('--zoom', params.zoom + '%');
    if (params.space) document.body.style.setProperty('--space', params.space + 'px');

    window.addEventListener('focus', resume);
    window.addEventListener('blur', pause);

    return () => {
      window.removeEventListener('focus', resume);
      window.removeEventListener('blur', pause);
    };
  }, []);

  const onTextChange = e => {
    setText(e.target.value.toUpperCase());
    addUrlQuery({ text: e.target.value.toUpperCase() });
  };

  const onStrokeWidthChange = e => {
    document.body.style.setProperty('--stroke-width', e.target.value);
    addUrlQuery({ strokeWidth: +e.target.value });
  };

  const onDurationChange = e => {
    duration.current = +e.target.value;
    addUrlQuery({ duration: +e.target.value });
    for (let i = 0; i < animationsDash.current.length; i++) {
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
    document.body.style.setProperty('--zoom', +e.target.value + '%');
    addUrlQuery({ zoom: +e.target.value });
  };

  const onSpaceChange = e => {
    document.body.style.setProperty('--space', +e.target.value + 'px');
    addUrlQuery({ space: +e.target.value });
  };

  const onDashChange = async e => {
    isDash.current = e.target.checked;
    addUrlQuery({ isDash: e.target.checked });
    if (isDash.current) {
      animationsDash.current?.resume?.();
      document.querySelectorAll('.Monoton').forEach(e => {
        const length = e.getTotalLength();
        if (isDash.current) {
          e.style.strokeDasharray = length / 2 + 'px';
          e.style.strokeDashoffset = length + 'px';
        }
      });
    } else {
      animationsDash.current?.pause?.();
      document.querySelectorAll('.Monoton').forEach(e => {
        e.style.removeProperty('stroke-dasharray');
        e.style.removeProperty('stroke-offset');
      });
    }
  };

  const onRGBChange = async e => {
    const pathes = document.querySelectorAll('.Monoton');

    isRgb.current = e.target.checked;
    addUrlQuery({ isRgb: isRgb.current });

    document.getElementById('random-check').disabled = isRgb.current;
    document.getElementById('disco-check').disabled = isRgb.current;
    document.getElementById('color-input').disabled = isRgb.current;

    if (isRgb.current) {
      pathes.forEach(e => {
        e.style.stroke = 'red';
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) red)`;
      });
      animationsRgb.current?.resume?.();
      return;
    }

    animationsRgb.current?.pause?.();

    pathes.forEach(e => {
      e.style.removeProperty('stroke');
      if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`;
    });
  };

  const onDiscoChange = e => {
    const pathes = document.querySelectorAll('.Monoton');

    isDisco.current = e.target.checked;
    addUrlQuery({ isDisco: isDisco.current });

    document.getElementById('random-check').disabled = isDisco.current;
    document.getElementById('rgb-check').disabled = isDisco.current;
    document.getElementById('color-input').disabled = isDisco.current;

    if (isDisco.current) {
      pathes.forEach(e => (e.style.transition = 'stroke 500ms , filter 500ms'));
      disco();
      return;
    }

    pathes.forEach(e => {
      e.style.removeProperty('stroke');
      e.style.removeProperty('transition');

      isGlowing.current
        ? (e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`)
        : e.style.removeProperty('filter');
    });
  };

  const onGlowChange = e => {
    const pathes = document.querySelectorAll('.Monoton');

    isGlowing.current = e.target.checked;
    addUrlQuery({ isGlowing: isGlowing.current });

    document.getElementById('glow-input').disabled = !isGlowing.current;

    if (isGlowing.current) {
      pathes.forEach(e => {
        const color = generateColor();
        if (isRandomColor.current) e.style.stroke = color;
        e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${
          isRandomColor.current ? color : isRgb.current ? 'red' : 'var(--stroke-color)'
        })`;
      });

      return;
    }

    pathes.forEach(e => e.style.removeProperty('filter'));
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

    document.querySelectorAll('.Monoton').forEach(e => {
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

      <div className='container'>{createMonotons()}</div>

      <div className='controls'>
        <label className='labels' htmlFor='Monoton-text'>
          Text:
        </label>
        <input className='inputs' type='text' name='Monoton-text' value={text} onChange={onTextChange} />

        <label className='labels' htmlFor='Monoton-stroke-width'>
          Stroke width:
        </label>
        <input
          className='inputs'
          type='number'
          min={1}
          name='Monoton-stroke-width'
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
          Size:
        </label>
        <input
          className='inputs'
          type='range'
          min='5'
          max='150'
          name='zoom'
          defaultValue={parseUrl().zoom ?? 20}
          onChange={onZoomChange}
        />

        <label className='labels' htmlFor='space'>
          Space:
        </label>
        <input
          className='inputs'
          type='range'
          min='-300'
          max='20'
          name='space'
          defaultValue={parseUrl().space ?? 0}
          onChange={onSpaceChange}
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
          defaultValue={parseUrl().glowStrength ?? 2}
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
    </>
  );
}
