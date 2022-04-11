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
      <Card path='Clock' />
      <Card path='MultiSidedPolygon' />
      <Card path='Trinity' />
      <Card path='SwirlingLines' />
      <Card path='Cuboid' />
      <Card path='Eye' />
      <Card path='Orbits' />
      <Card path='Squares' />
      <Card path='Monoton' />
      <Card path='PingPong' />
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

  const navigate = e => {
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
      <img ref={gifImg} src={gifUrl} alt={path} style={{ display: 'none' }} />
    </div>
  );
};
