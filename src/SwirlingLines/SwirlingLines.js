/* eslint-disable react-hooks/exhaustive-deps */
import { animare, ease } from 'animare';
import { useEffect, useRef, useState } from 'react';
import { useLazyCss } from '..';
import styles from './SwirlingLines.lazy.css';

export default function SwirlingLines() {
  useLazyCss(styles);

  const animations = useRef([]);
  const animationsRgb = useRef([]);
  const lineWidth = useRef(1);
  const isRandomColor = useRef(false);
  const isRgb = useRef(false);
  const containeRef = useRef(true);
  const lineLengthRef = useRef(50);

  const [lineLength, setLineLength] = useState(50);
  const [lineMultiplier, setlineMultiplier] = useState(3);
  const [contain, setContain] = useState(true);
  const [svgCount, setSvgCount] = useState(
    ~~(window.innerHeight < window.innerWidth ? window.innerHeight / lineLength : window.innerWidth / lineLength)
  );

  const createLines = (count = lineMultiplier, size = lineLength) => {
    const angle = 180 / count;
    const lineElements = [];
    for (let i = 0; i < count; i++) {
      const line = (
        <line
          key={'line' + i}
          x1={0}
          y1='50%'
          x2='100%'
          y2='50%'
          style={{ stroke: isRandomColor.current && !isRgb.current ? generateColor() : isRgb.current ? 'red' : null }}
          strokeWidth={(100 / size) * lineWidth.current}
          transform={`rotate(${angle * i})`}
        />
      );
      lineElements.push(line);
    }
    return (
      <svg
        key={'svg' + Math.random() * 100}
        className='lines-svg'
        width={size}
        height={size}
        style={{ top: `calc(50% - ${size / 2}px)`, left: `calc(50% - ${size / 2}px)`, transform: 'rotate(0deg)' }}
        viewBox='0 0 100 100'
      >
        <circle cx='50%' cy='50%' r='50%' />
        {lineElements}
      </svg>
    );
  };

  const render = count => {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.unshift(createLines(lineMultiplier * (i + 1), lineLength * (i + 1)));
    }
    return results;
  };

  const setupAnimation = () => {
    stop();
    animations.current = [];
    animationsRgb.current = [];

    const svgs = document.querySelectorAll('.lines-svg');

    for (let i = 0; i < svgs.length; i++) {
      const el = svgs[i];
      const angle = 360 / (svgs.length * lineMultiplier - i * lineMultiplier);
      const duration = 1000 * ((svgs.length * lineMultiplier - i * lineMultiplier) / 4);
      const delay = 400 * ((i * lineMultiplier) / 4);

      const callback = ([rotate], { pause }) => {
        if (!document.body.contains(el)) pause();
        el.style.transform = `rotate(${rotate}deg)`;
      };

      animations.current.push(
        animare(
          {
            to: angle * ((svgs.length * lineMultiplier - i * lineMultiplier) / 4),
            duration,
            delay,
            direction: 'alternate',
            autoPlay: false,
            repeat: -1,
          },
          callback
        )
      );
      if (isRgb.current) {
        const callback_color = ([r, g, b], { progress, setOptions, pause }) => {
          if (!document.contains(el)) pause();
          el.childNodes.forEach(child => {
            if (child.tagName === 'line') child.style.stroke = `rgb(${r},${g},${b})`;
          });
          if (progress === 100) {
            setOptions({ delay: (svgs.length - 1 - i) * 150 + i * 150 });
          }
        };
        const b = animare({ from: [255, 0, 0], to: [0, 0, 255], duration: 4000, delay: 150 * i, autoPlay: false }, callback_color)
          .next({ to: [0, 255, 0] })
          .next({ to: [255, 0, 0] });
        b.setTimelineOptions({ repeat: -1 });
        animationsRgb.current.push(b);
      }
    }
    play();
  };

  const play = async () => {
    for (let i = 0; i < animations.current.length; i++) {
      animations.current[i].play();
      animationsRgb.current[i]?.setOptions({ delay: 150 * i });
      animationsRgb.current[i]?.play();
    }
  };

  const stop = () => {
    for (let i = 0; i < animations.current.length; i++) {
      animations.current[i].stop(0);
      animationsRgb.current[i]?.stop(0);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', () => {
      if (containeRef.current)
        setSvgCount(
          ~~(window.innerHeight < window.innerWidth
            ? window.innerHeight / lineLengthRef.current
            : window.innerWidth / lineLengthRef.current)
        );
    });
  }, []);

  useEffect(() => {
    setupAnimation();
  }, [svgCount, lineLength, contain, lineMultiplier]);

  useEffect(() => {
    window.addEventListener('focus', play);
    window.addEventListener('blur', stop);

    return () => {
      window.removeEventListener('focus', play);
      window.removeEventListener('blur', stop);
    };
  }, []);

  const lineLengthInput = e => {
    const value = +e.target.value;
    setLineLength(value);
    lineLengthRef.current = value;
    if (contain) setSvgCount(~~(window.innerHeight < window.innerWidth ? window.innerHeight / value : window.innerWidth / value));
  };

  const lineWidthInput = e => {
    lineWidth.current = +e.target.value;
    const svgs = document.querySelectorAll('.lines-svg');
    for (let i = 0; i < svgs.length; i++) {
      const el = svgs[i];
      const size = parseInt(getComputedStyle(el).getPropertyValue('width'));
      const lines = el.childNodes;
      lines.forEach(line => {
        if (line.tagName === 'line') line.style.strokeWidth = `${(100 / size) * +e.target.value}px`;
      });
    }
  };

  const lineMultiplierInput = e => {
    setlineMultiplier(+e.target.value);
  };

  const svgCountInput = e => {
    setSvgCount(+e.target.value);
  };

  const containInput = e => {
    setContain(e.target.checked);
    containeRef.current = e.target.checked;
    if (e.target.checked)
      setSvgCount(~~(window.innerHeight < window.innerWidth ? window.innerHeight / lineLength : window.innerWidth / lineLength));
  };

  const onRGBChange = async e => {
    isRgb.current = e.target.checked;
    document.getElementById('random-check').disabled = isRgb.current;

    if (isRgb.current) {
      document.querySelectorAll('.lines-svg line').forEach(e => {
        e.style.stroke = 'red';
      });
      setupAnimation();
    } else {
      animationsRgb.current.forEach(a => a.pause());
      animationsRgb.current = [];
      await new Promise(resolve => setTimeout(resolve, 50));
      document.querySelectorAll('.lines-svg line').forEach(e => {
        e.style.stroke = isRandomColor.current ? generateColor() : null;
      });
    }
  };

  const onColorChange = e => {
    document.body.style.setProperty('--stroke-color', e.target.value);
  };

  const onBgColorChange = e => {
    document.body.style.setProperty('--bg-color', e.target.value);
    const inverted = invertColor(getComputedStyle(document.body).backgroundColor);
    [...document.getElementsByClassName('labels')].forEach(el => (el.style.color = inverted));
    document.querySelector('.toggle-pannel-arrow').style.fill = inverted;
  };

  const onRandomColorChange = e => {
    isRandomColor.current = e.target.checked;
    document.querySelectorAll('.lines-svg line').forEach(el => {
      isRandomColor.current ? (el.style.stroke = generateColor()) : el.style.removeProperty('stroke');
    });
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
      <div className='container'>{render(svgCount)}</div>

      <svg className='toggle-pannel-arrow' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' onClick={togglePannel}>
        <path d='M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z' />
      </svg>

      <div className='controls'>
        <label className='labels' htmlFor='line-length'>
          Line Length:
        </label>
        <input className='inputs' type='number' min={1} name='line-length' value={lineLength} onChange={lineLengthInput} />

        <label className='labels' htmlFor='line-widht'>
          Line Width:
        </label>
        <input
          className='inputs'
          type='number'
          min={1}
          name='line-width'
          defaultValue={lineWidth.current}
          onChange={lineWidthInput}
        />

        <label className='labels' htmlFor='line-multiplier'>
          Line Multiplier:
        </label>
        <input
          className='inputs'
          type='number'
          min={1}
          name='line-multiplier'
          value={lineMultiplier}
          onChange={lineMultiplierInput}
        />

        <label className='labels' htmlFor='svg-counts'>
          Circles count:
        </label>
        <input
          className='inputs'
          type='number'
          min={1}
          name='svg-counts'
          value={svgCount}
          onChange={svgCountInput}
          disabled={contain}
        />

        <input className='inputs' type='checkbox' name='contain' checked={contain} onChange={containInput} />
        <label className='labels' htmlFor='contain'>
          {' '}
          Contain Size
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
        <input className='inputs' type='color' name='bg-color' defaultValue='#00000' onChange={onBgColorChange} />
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
