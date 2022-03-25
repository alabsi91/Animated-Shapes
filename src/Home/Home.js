import { useState, useEffect, useRef } from 'react';
import './Home.css';

export default function Home() {
  return (
    <div className='container'>
      <Card path='Trinity' />
      <Card path='SwirlingLines' />
      <Card path='Cuboid' />
      <Card path='Eye' />
      <Card path='Orbits' />
      <Card path='Clock' />
      <Card path='Squares' />
      <Card path='PingPong' />
      <Card path='BouncingShit' />
      <Card path='Monoton' />
    </div>
  );
}

const Card = ({ path }) => {
  let pngImg = useRef();
  let gifImg = useRef();

  const [pngUrl, setPngUrl] = useState('');
  const [gifUrl, setGifUrl] = useState('');

  const navigate = () => {
    window.location.href = `/${path}`;
  };

  const getUrl = () => {
    try {
      setPngUrl(require(`../assets/${path}.png`));
      setGifUrl(require(`../assets/${path}.gif`));
    } catch (error) {}
  };

  const onMouseEnter = () => {
    pngImg.current.style.display = 'none';
    gifImg.current.style.display = 'block';
  };

  const onMouseLeave = () => {
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
