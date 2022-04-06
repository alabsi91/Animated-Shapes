/* eslint-disable no-unused-vars */
import styles from './index.lazy.css';
import './global.css';
import { useState, useEffect, Suspense, lazy, createContext, StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { animare, ease } from 'animare';

const Loading = () => {
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
    styles.use();
    animation();
    return styles.unuse;
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
    const path = page;
    const Component = lazy(() => import(`./${path}/${path}`));
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
      <Suspense fallback={<Loading />}>
        <Render />
      </Suspense>
    </Navigate.Provider>
  );
};

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);
