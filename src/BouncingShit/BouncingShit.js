/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import { animare, ease } from 'animare';
import { useEffect, useRef, useState } from 'react';
import { useLazyCss } from '..';
import styles from './BouncingShit.lazy.css';

export default function BouncingShit() {
  useLazyCss(styles);

  const canvas = useRef();
  const canvas1 = useRef();
  const sounds = useRef([]);

  const [objectSize, setObjectSize] = useState(50);
  const [perSecond, setPerSecond] = useState(50);

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const clear = (context = canvas.current.getContext('2d')) => {
    const { width, height } = context.canvas;
    context.clearRect(0, 0, width, height);
  };

  // const circle = (x, y, radius, color, context = canvas.current.getContext('2d')) => {
  //   context.beginPath();
  //   context.arc(x, y, radius, 0, Math.PI * 2, false);

  //   const gradient = context.createLinearGradient(x - radius || 0, y - radius || 0, x + radius || 0, y + radius || 0);
  //   gradient.addColorStop(0, color);
  //   gradient.addColorStop(0.1, '#a5a5a5');
  //   gradient.addColorStop(1, color);

  //   context.fillStyle = gradient;
  //   context.fill();

  //   context.strokeStyle = '#323232';
  //   context.lineWidth = 0.5;
  //   context.stroke();
  // };
  // shit
  const circle = (x, y, size, color, context = canvas.current.getContext('2d')) => {
    const poop = document.getElementById('poop');
    context.drawImage(poop, x - size / 2, y, size, size);
  };

  const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

  const randomHslColor = () => {
    const h = randomNum(0, 360);
    const s = randomNum(40, 60);
    const l = randomNum(40, 40);
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const fallAnimation = async (xFrom, xTo, yFrom, yTo, radius, color) => {
    const ctx = canvas.current.getContext('2d');
    const ctx1 = canvas1.current.getContext('2d');
    const distance = yTo - yFrom;
    const duration = Math.sqrt(distance / 487.68) * 1000;

    let prevX = xFrom;
    let prevY = yFrom;
    let shareY = yFrom;

    animare({ from: yFrom, to: yTo, duration, ease: ease.out.bounce }, ([y]) => {
      shareY = y;
    });

    await animare({ from: xFrom, to: xTo, duration: duration + 300, ease: ease.out.sine }, ([x], { isLastFrame }) => {
      // clear ball from previus frame
      ctx.globalCompositeOperation = 'destination-out';
      circle(prevX, prevY, radius, color);
      // draw new ball to current frame
      ctx.globalCompositeOperation = 'source-over';
      circle(x, shareY, radius, color);
      // save current ball position to previus frame
      prevX = x;
      prevY = shareY;

      if (isLastFrame) {
        // clear last ball on the floor
        ctx.globalCompositeOperation = 'destination-out';
        circle(xTo, shareY, radius, color);
      }
    }).asyncOnFinish();

    // draw the last ball to new canvas
    ctx1.globalCompositeOperation = 'source-over';
    circle(xTo, yTo, radius, color, ctx1);
  };

  const fallOnClick = async () => {
    const { width, height } = canvas.current;
    for (let o = 0; o < 10; o++) {
      const radius = randomNum(10, objectSize);
      const left = randomNum(radius, radius + 200);
      const right = randomNum(width - radius - 200, width - radius);

      let random = randomNum(0, sounds.current.length);
      while (random === lastSoundPlayed) {
        random = randomNum(0, sounds.current.length - 1);
      }

      if (!isAudioPlaying) {
        sounds.current[random]?.play?.();
        lastSoundPlayed = random;
      }

      fallAnimation(left, randomNum(radius, width - radius), radius, height - radius, radius, randomHslColor());
      await sleep(10);
      fallAnimation(right, randomNum(radius, width - radius), radius, height - radius, radius, randomHslColor());
      await sleep(10);
    }
  };

  let MouseX = 0;
  let MouseY = 0;
  let isAudioPlaying = false;
  let lastSoundPlayed = 0;
  const fallOnMove = e => {
    const { x, y } = e.nativeEvent;
    const { height } = canvas.current;
    const direction = {
      x: x > MouseX ? 'right' : 'left',
      y: y > MouseY ? 'down' : 'up',
    };
    const radius = randomNum(10, objectSize);

    const shift = randomNum(100, 500);
    const xTo = randomNum(x, direction.x === 'right' ? x + shift : x - shift);
    const yTo = height - radius;

    fallAnimation(x, xTo, y, yTo, radius, randomHslColor());

    MouseX = x;
    MouseY = y;

    let random = randomNum(0, sounds.current.length);
    while (random === lastSoundPlayed) {
      random = randomNum(0, sounds.current.length - 1);
    }

    if (!isAudioPlaying) {
      sounds.current[random]?.play?.();
      lastSoundPlayed = random;
    }
  };

  const moveButt = e => {
    const butt = document.getElementById('butt');
    const top = canvas.current.getBoundingClientRect().top;
    const x = e.pageX;
    const y = e.pageY;
    butt.style.top = `${y - 70 + top}px`;
    butt.style.left = `${x - 50}px`;
  };

  let wait = false;
  const throttle = (func, event, limit = 100) => {
    if (wait) return;
    func(event);
    wait = true;
    setTimeout(() => (wait = false), 1000 / limit);
  };

  const fartSounds = () => {
    for (let i = 0; i < 5; i++) {
      sounds.current.push(new Audio(require(`./FartSounds/fart${i + 1}.mp3`)));
      sounds.current[i].volume = 0.3;
      sounds.current[i].addEventListener('playing', () => (isAudioPlaying = true));
      sounds.current[i].addEventListener('ended', () => (isAudioPlaying = false));
    }
  };

  const resizeCanvas = () => {
    clear();
    canvas.current.width = window.innerWidth;
    canvas.current.height = window.innerHeight - canvas.current.getBoundingClientRect().top;
    clear(canvas1.current.getContext('2d'));
    canvas1.current.width = window.innerWidth;
    canvas1.current.height = window.innerHeight - canvas1.current.getBoundingClientRect().top;
  };

  const uplaod = e => {
    const ctx = canvas1.current.getContext('2d');

    clear(ctx);

    const url = URL.createObjectURL(e.target.files[0]);
    const img = new Image();
    img.onload = function () {
      const sizePercent = img.width / img.height;
      let width = img.width > window.innerWidth / 2 ? window.innerWidth / 2 : img.width;
      let height = width / sizePercent;
      ctx.drawImage(img, canvas1.current.width / 2 - width / 2, canvas1.current.height - height, width, height);
      e.target.value = '';
    };

    img.src = url;
  };

  useEffect(() => {
    fartSounds();
    document.body.addEventListener('mousemove', moveButt);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      document.body.removeEventListener('mousemove', moveButt);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      <div
        className='press-to-start'
        onClick={e => {
          e.target.closest('div').style.display = 'none';
        }}
      >
        <p>Press To Start</p>
      </div>
      <div className='controll-panel'>
        <label htmlFor='uploadBg'>Select Background image</label>
        <input id='uploadBg' type='file' accept='image/png, image/jpeg' onChange={uplaod} />
        <input
          type='number'
          title='Size'
          value={objectSize}
          onChange={e => {
            setObjectSize(+e.target.value);
          }}
        />
        <input
          type='number'
          title='Amount Per Second'
          value={perSecond}
          onChange={e => {
            setPerSecond(+e.target.value);
          }}
        />
      </div>
      <img src={require('./butt.png')} id='butt' alt='img' />
      <img src={require('./poop.png')} id='poop' alt='img' style={{ display: 'none' }} />
      <canvas id='ctx1' ref={canvas1} width={window.innerWidth} height={window.innerHeight - 50}></canvas>
      <canvas
        ref={canvas}
        width={window.innerWidth}
        height={window.innerHeight - 50}
        onClick={fallOnClick}
        // onClick={bubbleOnClick}
        onMouseMove={e => throttle(fallOnMove, e, perSecond)}
        onMouseEnter={() => {
          document.getElementById('butt').style.display = 'block';
        }}
        onMouseLeave={() => {
          document.getElementById('butt').style.display = 'none';
        }}
      />
    </>
  );
}
