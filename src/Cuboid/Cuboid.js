/* eslint-disable react-hooks/exhaustive-deps */
import styles from './Cuboid.lazy.css';
import { useEffect, useState, useRef } from 'react';
import { animare, ease } from 'animare';
import { addUrlQuery, parseUrl, useLazyCss, invertColor, generateColor } from '..';

export default function Cuboid() {
  useLazyCss(styles);

  const [count, setCount] = useState(parseUrl().count ?? 15);

  const isRandomColor = useRef(parseUrl().isRandomColor ?? false);
  const isStrokeRandomColor = useRef(parseUrl().isStrokeRandomColor ?? false);
  const duration = useRef(parseUrl().duration ?? 3000);
  const delay = useRef(parseUrl().delay ?? 50);
  const easing = useRef(parseUrl().easing ?? 'ease.out.back');
  const animations = useRef([]);
  const timer = useRef();

  const createCuboid = () => {
    let order = 0;
    const result = [];

    for (let i = -((count - 1) / 2); i <= (count - 1) / 2; i++) {
      const pos = (i * (window.innerHeight - 50)) / count / 1.2;
      const color1 = generateColor();
      const color2 = generateColor();

      result[i > 0 ? 'unshift' : 'push'](
        <div
          key={Math.random()}
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
                borderColor: isStrokeRandomColor.current ? color1 : null,
                backgroundColor: isRandomColor.current ? color2 : null,
              }}
            >
              <div className='photon-shader'></div>
            </div>
            <div
              className='face bk'
              style={{
                borderColor: isStrokeRandomColor.current ? color1 : null,
                backgroundColor: isRandomColor.current ? color2 : null,
              }}
            >
              <div className='photon-shader'></div>
            </div>
            <div
              className='face rt'
              style={{
                borderColor: isStrokeRandomColor.current ? color1 : null,
                backgroundColor: isRandomColor.current ? color2 : null,
              }}
            >
              <div className='photon-shader'></div>
            </div>
            <div
              className='face lt'
              style={{
                borderColor: isStrokeRandomColor.current ? color1 : null,
                backgroundColor: isRandomColor.current ? color2 : null,
              }}
            >
              <div className='photon-shader'></div>
            </div>
            <div
              className='face bm'
              style={{
                borderColor: isStrokeRandomColor.current ? color1 : null,
                backgroundColor: isRandomColor.current ? color2 : null,
              }}
            >
              <div className='photon-shader'></div>
            </div>
            <div
              className='face tp'
              style={{
                borderColor: isStrokeRandomColor.current ? color1 : null,
                backgroundColor: isRandomColor.current ? color2 : null,
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

  const createAnimations = () => {
    const scenes = document.querySelectorAll('.scene');

    let getEase = easing.current.split('.');
    getEase = getEase.length === 1 ? ease.linear : ease[getEase[1]][getEase[2]];

    for (let i = 0; i < scenes.length; i++) {
      const e = scenes[i];
      const order = +e.dataset.order;
      // eslint-disable-next-line no-loop-func
      const callback = ([ry], { pause, progress, setOptions }) => {
        if (!document.contains(e)) pause();
        e.style.transform = `rotateX(180deg) rotateY(${ry}deg)`;
        if (progress === 100) setOptions({ delay: (scenes.length - 1 - order) * delay.current + order * delay.current });
      };

      const a = animare(
        { from: 0, to: 180, duration: duration.current, delay: order * delay.current, autoPlay: false, ease: getEase },
        callback
      ).next({
        to: 0,
        delay: (scenes.length - 1 - order) * delay.current + order * delay.current,
      });
      a.setTimelineOptions({ repeat: -1 });
      animations.current[order] = a;
    }
    play();
  };

  const setupAnimation = () => {
    stop();
    animations.current = [];
    clearTimeout(timer.current);
    timer.current = setTimeout(createAnimations, 300);
  };

  const play = () => {
    for (let i = 0; i < animations.current.length; i++) {
      animations.current[i].setOptions({ delay: i * delay.current });
      animations.current[i].play();
    }
  };

  const stop = () => {
    for (let i = 0; i < animations.current.length; i++) animations.current[i].stop();
  };

  useEffect(() => {
    setupAnimation();
  }, [count]);

  useEffect(() => {
    const params = parseUrl();
    if (params.strokeWidth) document.body.style.setProperty('--stroke-width', params.strokeWidth + 'px');
    if (params.width) document.body.style.setProperty('--width', params.width + 'px');
    if (params.height) document.body.style.setProperty('--height', params.height + 'px');
    if (params.thickness) document.body.style.setProperty('--thickness', params.thickness + 'px');
    if (params.strokeColor) document.body.style.setProperty('--stroke-color', '#' + params.strokeColor);
    if (params.color) document.body.style.setProperty('--color', '#' + params.color);
    if (params.backgroundColor) onBgColorChange('#' + params.backgroundColor);

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

  const onWidthChange = e => {
    document.body.style.setProperty('--width', e.target.value + 'px');
    addUrlQuery({ width: +e.target.value });
  };

  const onHeightChange = e => {
    document.body.style.setProperty('--height', e.target.value + 'px');
    addUrlQuery({ height: +e.target.value });
  };

  const onThicknessChange = e => {
    document.body.style.setProperty('--thickness', e.target.value + 'px');
    addUrlQuery({ thickness: +e.target.value });
  };

  const onStrokeChange = e => {
    document.body.style.setProperty('--stroke-width', e.target.value + 'px');
    addUrlQuery({ strokeWidth: +e.target.value });
  };

  const onPerspectiveChange = e => {
    document.getElementById('tridiv').style.perspective = e.target.value + 'px';
    addUrlQuery({ perspective: +e.target.value });
  };

  const onZoomChange = e => {
    document.getElementById('tridiv').style.zoom = e.target.value / 100;
    if (e?.target?.value) addUrlQuery({ zoom: +e.target.value });
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

  const onColorChange = e => {
    document.body.style.setProperty('--color', e.target.value);
    addUrlQuery({ color: e.target.value.replace('#', '') });
  };

  const onRandomColorChange = e => {
    isRandomColor.current = e.target.checked;
    addUrlQuery({ isRandomColor: e.target.checked });
    document.querySelectorAll('.cub-1').forEach(e => {
      const faces = [...e.children];
      const color = generateColor();
      faces.forEach(f => {
        if (isRandomColor.current) {
          f.style.backgroundColor = color;
        } else f.style.removeProperty('background-color');
      });
    });
  };

  const onStrokeColorChange = e => {
    document.body.style.setProperty('--stroke-color', e.target.value);
    addUrlQuery({ strokeColor: e.target.value.replace('#', '') });
  };

  const onStrokeRandomColorChange = e => {
    isStrokeRandomColor.current = e.target.checked;
    addUrlQuery({ isStrokeRandomColor: e.target.checked });
    document.querySelectorAll('.cub-1').forEach(e => {
      const faces = [...e.children];
      const color = generateColor();
      faces.forEach(f => {
        if (isStrokeRandomColor.current) {
          f.style.borderColor = color;
        } else f.style.removeProperty('border');
      });
    });
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
        <div id='tridiv' style={{ perspective: parseUrl().perspective + 'px' ?? '1000px', zoom: (parseUrl().zoom ?? 90) / 100 }}>
          {createCuboid()}
        </div>
      </div>

      <div className='controls'>
        <label className='labels' htmlFor='cuboids-count'>
          Cuboids Count:
        </label>
        <input className='inputs' type='number' min={1} max={100} name='cuboids-count' value={count} onChange={onCountChange} />

        <label className='labels' htmlFor='cuboids-width'>
          Cuboid Width:
        </label>
        <input
          className='inputs'
          type='number'
          step='10'
          min={1}
          name='cuboids-width'
          defaultValue={parseUrl().width ?? 500}
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
          name='cuboids-height'
          defaultValue={parseUrl().height ?? 500}
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
          defaultValue={parseUrl().thickness ?? 40}
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
          defaultValue={parseUrl().strokeWidth ?? 2}
          onChange={onStrokeChange}
        />

        <label className='labels' htmlFor='duration'>
          Duration:
        </label>
        <input
          className='inputs'
          type='number'
          name='duration'
          min='1'
          step={100}
          defaultValue={duration.current}
          onChange={onDurationChange}
        />

        <label className='labels' htmlFor='delay'>
          Delay:
        </label>
        <input className='inputs' type='number' name='delay' min='0' defaultValue={delay.current} onChange={onDelayChange} />

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

        <label className='labels' htmlFor='Perspective'>
          3D Perspective:
        </label>
        <input
          className='inputs'
          type='range'
          min='300'
          max='5000'
          name='Perspective'
          defaultValue={parseUrl().perspective ?? 1000}
          onChange={onPerspectiveChange}
        />
        <label className='labels' htmlFor='zoom'>
          Zoom:
        </label>
        <input
          className='inputs'
          type='range'
          min='5'
          max='150'
          name='zoom'
          defaultValue={parseUrl().zoom ?? 90}
          onChange={onZoomChange}
        />

        <label className='labels' htmlFor='Cuboid-color'>
          Cuboid Color:
        </label>
        <br />
        <div className='color-input-wrapper'>
          <input
            className='inputs'
            type='color'
            name='Cuboid-color'
            defaultValue={'#' + (parseUrl()?.Color ?? '000000')}
            onChange={onColorChange}
          />

          <input
            className='inputs'
            type='checkbox'
            name='randomColor'
            defaultChecked={isRandomColor.current}
            onChange={onRandomColorChange}
          />
          <label className='labels' htmlFor='randomColor'>
            {' '}
            Random Colors
          </label>
        </div>

        <label className='labels' htmlFor='Stroke-color'>
          Stroke Color:
        </label>
        <br />
        <div className='color-input-wrapper'>
          <input
            className='inputs'
            type='color'
            name='Stroke-color'
            defaultValue={'#' + (parseUrl()?.strokeColor ?? 'ffffff')}
            onChange={onStrokeColorChange}
          />

          <input
            className='inputs'
            type='checkbox'
            name='randomColor'
            defaultChecked={isStrokeRandomColor.current}
            onChange={onStrokeRandomColorChange}
          />
          <label className='labels' htmlFor='randomColor'>
            {' '}
            Random Colors
          </label>
        </div>

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
