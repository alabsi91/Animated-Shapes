/* eslint-disable react-hooks/exhaustive-deps */
import { animare, ease } from 'animare';
import { useCallback, useEffect, useState } from 'react';
import styles from './Squares.lazy.css';

let animations = [],
  animationsColor = [],
  isRandomColor = false,
  isRgb = false,
  gap = 0;

export default function Squares() {
  const [count, setCount] = useState(20);
  const [reverse, setReverse] = useState(false);

  const createSquares = useCallback(() => {
    gap = (window.innerHeight - 200) / count;
    const result = [];
    for (let i = 0; i < count; i++) {
      const css = {
        borderColor: isRandomColor ? generateColor() : null,
        width: window.innerWidth / 2 - gap * i + 'px',
        height: 200 + gap * i + 'px',
      };
      result.push(<div className='square' style={css} key={Math.random() * 100} />);
    }
    return result;
  }, [count]);

  const setupRgbAnimation = () => {
    animationsColor = [];
    const squares = document.querySelectorAll('.square');

    for (let i = 0; i < squares.length; i++) {
      const e = squares[i];
      const callback_color = ([r, g, b], { progress, setOptions, pause }) => {
        if (!document.body.contains(e)) pause();
        e.style.borderColor = `rgb(${r},${g},${b})`;
        if (progress === 100) setOptions({ delay: 0 });
      };

      const b = animare(
        { from: [255, 255, 255], to: [255, 0, 0], duration: 4000, delay: i * 150, autoPlay: false },
        callback_color
      )
        .next({ to: [0, 0, 255] })
        .next({ to: [0, 255, 0] })
        .next({ to: [255, 255, 255] });
      b.setTimelineOptions({ repeat: -1 });
      animationsColor.push(b);
    }
  };

  const setupAnimation = () => {
    stop();
    animations = [];
    animationsColor = [];

    const squares = document.querySelectorAll('.square');
    let i = reverse ? 0 : squares.length - 1;

    for (i; reverse ? i < squares.length : i >= 0; reverse ? i++ : i--) {
      const e = squares[i];
      const { width, height } = e.getBoundingClientRect();
      const duration = 2000;

      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;

      const callback = ([w, h], { pause }) => {
        if (!document.body.contains(e)) pause();
        e.style.width = w + 'px';
        e.style.height = h + 'px';
      };

      const a = animare(
        {
          from: [width, height],
          to: [winWidth / 2 + gap * (i + 1), 100 + gap * i],
          duration,
          autoPlay: false,
          ease: ease.inOut.quad,
        },
        callback
      )
        .next({ to: [winWidth / 4 + gap * i, winHeight / 1.2 - gap * i] })
        .next({ to: [winWidth - 100 - gap * i, 200 + gap * i] })
        .next({ to: [winWidth - 100 - gap * i, winHeight - 100 - gap * i] })
        .next({ to: [winWidth / 2 - gap * i, 200 + gap * i] })
        .next({ to: [winWidth - 100 - gap * i, winHeight - 100 - gap * i] })
        // .next({ to: [gap * (i + 1), gap * (i + 1)] })
        .next({ to: [winWidth / 2 - gap * i, 200 + gap * i] });

      a.setTimelineOptions({ repeat: -1 });
      animations.push(a);

      if (isRgb) setupRgbAnimation();
    }
    play();
  };

  const play = async () => {
    animationsColor.forEach(a => a.play());
    for (let i = 0; i < animations.length; i++) {
      const a = animations[i];
      const b = animations?.[i + 1];
      a.play();
      await a.asyncOnProgress(gap * 2);
      b?.play();
    }
  };

  const stop = () => {
    for (let i = 0; i < animations.length; i++) {
      animations[i].stop(0);
      animationsColor?.[i]?.stop(0);
    }
  };

  useEffect(() => {
    setupAnimation();
  }, [count, reverse]);

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

  const onCountChange = e => {
    setCount(+e.target.value);
  };

  const onBorderWidthChange = e => {
    document.body.style.setProperty('--stroke-width', +e.target.value + 'px');
  };

  const onRGBChange = async e => {
    isRgb = e.target.checked;
    document.getElementById('random-check').disabled = isRgb;

    if (isRgb) {
      setupRgbAnimation();
      animationsColor.forEach(a => {
        a.play();
      });
    } else {
      animationsColor.forEach(a => a.pause());
      animationsColor = [];
      await new Promise(resolve => setTimeout(resolve, 50));
      document.querySelectorAll('.square').forEach(e => {
        isRandomColor ? (e.style.borderColor = generateColor()) : e.style.removeProperty('border-color');
      });
    }
  };

  const onRandomColorChange = e => {
    isRandomColor = e.target.checked;
    document.querySelectorAll('.square').forEach(e => {
      isRandomColor ? (e.style.borderColor = generateColor()) : e.style.removeProperty('border-color');
    });
  };

  const onColorChange = e => {
    document.body.style.setProperty('--stroke-color', e.target.value);
  };

  const onBgColorChange = e => {
    document.body.style.backgroundColor = e.target.value;
    const inverted = invertColor(getComputedStyle(document.body).backgroundColor);
    [...document.getElementsByClassName('labels')].forEach(el => (el.style.color = inverted));
    document.querySelector('.toggle-pannel-arrow').style.fill = inverted;
  };

  const onReverseChange = e => {
    const value = e.target.checked;
    setReverse(value);
  };

  return (
    <>
      <svg className='toggle-pannel-arrow' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' onClick={togglePannel}>
        <path d='M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z' />
      </svg>
      <div className='container'>{createSquares()}</div>
      <div className='controls'>
        <label className='labels' htmlFor='squares-count'>
          Squares Count:
        </label>
        <input className='inputs' type='number' min={1} name='squares-count' value={count} onChange={onCountChange} />
        <label className='labels' htmlFor='line-width'>
          Line Width:
        </label>
        <input className='inputs' type='number' min={1} name='line-width' defaultValue={1} onChange={onBorderWidthChange} />

        <input className='inputs' type='checkbox' name='randomColor' value={reverse} onChange={onReverseChange} />
        <label className='labels' htmlFor='randomColor'>
          {' '}
          Reverse animation
        </label>
        <br />

        <label className='labels' htmlFor='color'>
          Lines Color:
        </label>
        <br />

        <br />
        <input className='inputs' id='rgb-check' type='checkbox' name='RGB-Mode' onChange={onRGBChange} />
        <label className='labels' htmlFor='RGB-Mode'>
          {' '}
          RGB Mode
        </label>

        <br />
        <input className='inputs' id='random-check' type='checkbox' name='randomColor' onChange={onRandomColorChange} />
        <label className='labels' htmlFor='randomColor'>
          {' '}
          Random Colors
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
