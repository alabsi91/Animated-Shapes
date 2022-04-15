/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import { animare, ease } from 'animare';
import { useEffect, useState, useRef, cloneElement } from 'react';
import { addUrlQuery, parseUrl, useLazyCss, sleep, invertColor, generateColor } from '..';
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
              key: Math.random() * 100,
              className: 'Monoton-svg',
            },
            L?.props?.children?.map(c =>
              cloneElement(c, {
                key: Math.random() * 100,
                className: 'Monoton',
                style: {
                  stroke: isRandomColor.current ? color : null,
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
    let getEase = easing.current.split('.');
    getEase = getEase.length === 1 ? ease.linear : ease[getEase[1]][getEase[2]];

    for (let i = 0; i < letters.length; i++) {
      const Monotons = letters[i].childNodes;

      for (let p = 0; p < Monotons.length; p++) {
        const e = Monotons[p];

        if (isDash.current) {
          const length = e.getTotalLength();
          e.style.strokeDasharray = length / 2 + 'px';
          e.style.strokeDashoffset = length + 'px';

          const callback_dash = ([o, a], { pause }) => {
            if (!document.body.contains(e)) pause();
            e.style.strokeDashoffset = o + 'px';
            e.style.strokeDasharray = a + 'px';
          };

          const a_dash = animare(
            {
              from: [length, length / 2],
              to: [0, length],
              duration: duration.current,
              delay: p * delay.current,
              autoPlay: false,
              ease: getEase,
            },
            callback_dash
          )
            .next({ to: [-length, length / 2] })
            .next({ to: [0, length] })
            .next({ to: [length, length / 2] });

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
              delay: p * delay.current + i * 50,
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
    }
    play();
  };

  const setupAnimation = () => {
    stop();
    animationsRgb.current = [];
    animationsDash.current = [];
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
    const Monotons = document.querySelectorAll('.Monoton');
    for (let i = 0; i < Monotons.length; i++) {
      animationsDash.current[i]?.play();
      animationsRgb.current?.[i]?.play();
    }
  };

  const stop = () => {
    const Monotons = document.querySelectorAll('.Monoton');
    for (let i = 0; i < Monotons.length; i++) {
      animationsDash.current?.[i]?.stop(0);
      animationsRgb.current?.[i]?.stop(0);
    }
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

    window.addEventListener('focus', play);
    window.addEventListener('blur', stop);

    return () => {
      window.removeEventListener('focus', play);
      window.removeEventListener('blur', stop);
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
    if (!isDash.current) {
      animationsDash.current.forEach(a => a.stop(0));
      animationsDash.current = [];
      await sleep(50);
      document.querySelectorAll('.Monoton').forEach(e => {
        e.style.removeProperty('stroke-dasharray');
        e.style.removeProperty('stroke-offset');
      });
    } else setupAnimation();
  };

  const onRGBChange = async e => {
    isRgb.current = e.target.checked;
    addUrlQuery({ isRgb: isRgb.current });
    document.getElementById('random-check').disabled = isRgb.current;
    document.getElementById('disco-check').disabled = isRgb.current;
    document.getElementById('color-input').disabled = isRgb.current;

    if (isRgb.current) {
      document.querySelectorAll('.Monoton').forEach(e => {
        e.style.stroke = 'red';
        if (isGlowing.current) e.style.filter = `drop-shadow(0px 0px var(--glow-trength) red)`;
      });
      setupAnimation();
    } else {
      animationsRgb.current.forEach(a => a.stop(0));
      animationsRgb.current = [];
      await sleep(100);
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
      document.querySelectorAll('.Monoton').forEach(e => {
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
        document.querySelectorAll('.Monoton').forEach(e => {
          const color = generateColor();
          e.style.stroke = color;
          e.style.filter = `drop-shadow(0px 0px var(--glow-trength) ${color})`;
        });
        return;
      }

      document.querySelectorAll('.Monoton').forEach(e => {
        e.style.filter = `drop-shadow(0px 0px var(--glow-trength) var(--stroke-color))`;
      });
    } else {
      document.querySelectorAll('.Monoton').forEach(e => {
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
          Zoom:
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
