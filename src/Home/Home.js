import { useState, useEffect, useRef, useContext } from 'react';
import { Navigate, useLazyCss } from '..';
import styles from './Home.lazy.css';

export default function Home() {
  useLazyCss(styles);

  useEffect(() => {
    document.body.removeAttribute('style');
  }, []);

  return (
    <div className='container'>
      <Card path='DotsCircle' />
      <Card path='Clock' />
      <Card path='MultiSidedPolygon' />
      <Card path='Trinity' />
      <Card path='SwirlingLines' />
      <Card path='Cuboid' />
      <Card path='Eye' />
      <Card path='Orbits' />
      <Card path='Tunnel' />
      <Card path='Monoton' />
      <Card path='PingPong' />
      <GameOfLife />
      <Card path='BouncingShit' />
    </div>
  );
}

const Card = ({ path }) => {
  let pngImg = useRef();
  let gifImg = useRef();

  const [pngUrl, setPngUrl] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const setPage = useContext(Navigate);

  const navigate = () => {
    setPage(path);
    window.history.pushState({}, '', `/${path}`);
  };

  const getUrl = () => {
    try {
      setPngUrl(require(`../assets/${path}.webp`));
      setGifUrl(require(`../assets/${path}.gif`));
    } catch (error) {}
  };

  const onMouseEnter = () => {
    if (!pngImg.current || !gifImg.current) return;
    pngImg.current.style.display = 'none';
    gifImg.current.style.display = 'block';
  };

  const onMouseLeave = () => {
    if (!pngImg.current || !gifImg.current) return;
    pngImg.current.style.display = 'block';
    gifImg.current.style.display = 'none';
  };

  useEffect(() => {
    getUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='card-container' onClick={navigate} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <img ref={pngImg} src={pngUrl} alt={path} />
      <img ref={gifImg} src={gifUrl} alt={path} loading='lazy' style={{ display: 'none' }} />
    </div>
  );
};

const GameOfLife = () => {
  let pngImg = useRef();
  let gifImg = useRef();

  const navigate = () => {
    window.open('https://game-of-life-canvas-edition.netlify.app/', '_self');
  };

  const onMouseEnter = () => {
    if (!pngImg.current || !gifImg.current) return;
    pngImg.current.style.display = 'none';
    gifImg.current.style.display = 'block';
  };

  const onMouseLeave = () => {
    if (!pngImg.current || !gifImg.current) return;
    pngImg.current.style.display = 'block';
    gifImg.current.style.display = 'none';
  };

  return (
    <div className='card-container' onClick={navigate} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <img ref={pngImg} src={require('../assets/gameOfLife.webp')} alt='gameOfLife' />
      <img ref={gifImg} src={require('../assets/gameOfLife.gif')} alt='gameOfLife' style={{ display: 'none' }} />
    </div>
  );
};
