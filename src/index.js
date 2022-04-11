/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import styles from './Loading.lazy.css';
import './global.css';
import { useState, useEffect, Suspense, lazy, createContext, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { animare, ease } from 'animare';

const lazyComponents = {
  Clock: lazy(() => import('./Clock/Clock')),
  MultiSidedPolygon: lazy(() => import('./MultiSidedPolygon/MultiSidedPolygon')),
  Trinity: lazy(() => import('./Trinity/Trinity')),
  SwirlingLines: lazy(() => import('./SwirlingLines/SwirlingLines')),
  Cuboid: lazy(() => import('./Cuboid/Cuboid')),
  Eye: lazy(() => import('./Eye/Eye')),
  Orbits: lazy(() => import('./Orbits/Orbits')),
  Squares: lazy(() => import('./Squares/Squares')),
  Monoton: lazy(() => import('./Monoton/Monoton')),
  PingPong: lazy(() => import('./PingPong/PingPong')),
  BouncingShit: lazy(() => import('./BouncingShit/BouncingShit')),
  Home: lazy(() => import('./Home/Home')),
  Page404: lazy(() => import('./Page404')),
};

export const useLazyCss = styles => {
  useEffect(() => {
    styles.use();
    return styles.unuse;
  }, []);
};

const Loading = () => {
  useLazyCss(styles);

  const animation = () => {
    const outter = document.querySelector('.outter');
    const inner = document.querySelector('.inner');
    animare({ to: 30, duration: 1000, repeat: -1, ease: ease.inOut.quad }, ([r]) => {
      outter.style.width = `${r}vw`;
    });
    animare({ to: 30, duration: 1000, delay: 20, repeat: -1, ease: ease.inOut.quad }, ([r]) => {
      inner.style.width = `${r}vw`;
    });
  };

  useEffect(() => {
    animation();
  }, []);

  return (
    <div className='background'>
      <div className='circle outter'>
        <div className='circle inner' />
      </div>
    </div>
  );
};

export const Navigate = createContext();

const App = () => {
  const [page, setPage] = useState(window.location.pathname.replace('/', '') || 'Home');

  const Render = () => {
    const Component = lazyComponents[page] || lazyComponents.Page404;
    return <Component />;
  };

  useEffect(() => {
    window.addEventListener('popstate', () => {
      const path = window.location.pathname.replace('/', '') || 'Home';
      setPage(path);
    });
  }, []);

  return (
    <Navigate.Provider value={setPage}>
      <Suspense fallback={<Loading />}>{Render()}</Suspense>
    </Navigate.Provider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

export const parseUrl = () => {
  const regex = /[?&]([^=#]+)=([^&#]*)/g;
  const url = window.location.href;
  const params = {};
  const match = url.match(regex);
  match?.forEach(m => {
    const q = m.replace(/[?&]/, '');
    const [key, value] = q.split('=');
    params[key] = /^[1-9]\d+$|true|false/g.test(value) ? JSON.parse(value) : value;
  });
  return params;
};

export const addUrlQuery = obj => {
  const url = window.location.href;
  const params = parseUrl();
  const query = Object.keys(obj);
  let newUrl;
  query.forEach(key => {
    newUrl =
      params[key] !== undefined
        ? url.replace(`${key}=${params[key]}`, `${key}=${obj[key]}`)
        : `${url}${url.indexOf('?') === -1 ? '?' : '&'}${key}=${obj[key]}`;
  });
  window.history.replaceState({}, '', newUrl);
};

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
