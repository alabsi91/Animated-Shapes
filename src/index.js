/* eslint-disable no-unused-vars */
import { animare, ease } from 'animare';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from './index.module.css';

const App = () => {
  const path = window.location.pathname.replace('/', '') || 'Home';
  const Component = React.lazy(() => import(`./${path}/${path}`));
  return (
    <React.Suspense fallback={<Loading />}>
      <Component />
    </React.Suspense>
  );
};

const Loading = () => {
  const animation = () => {
    const outter = document.querySelector(`.${styles.outter}`);
    const inner = document.querySelector(`.${styles.inner}`);
    animare({ to: 30, duration: 1000, repeat: -1, ease: ease.inOut.quad }, ([r]) => {
      outter.style.width = `${r}vw`;
    });
    animare({ to: 30, duration: 1000, delay: 20, repeat: -1, ease: ease.inOut.quad }, ([r]) => {
      inner.style.width = `${r}vw`;
    });
  };

  React.useEffect(() => {
    animation();
  }, []);

  return (
    <div className={styles.background}>
      <div className={styles.circle + ' ' + styles.outter}>
        <div className={styles.circle + ' ' + styles.inner} />
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <React.Suspense fallback={<Loading />}>
      <App />
    </React.Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);
