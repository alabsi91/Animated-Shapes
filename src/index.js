/* eslint-disable no-unused-vars */
import { animare, ease } from 'animare';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from './index.module.css';

const SwirlingLines = () => {
  document.title = 'Swirling Lines';
  const Component = React.lazy(() => import('./SwirlingLines/SwirlingLines'));
  // const Component = require('./SwirlingLines/SwirlingLines').default;
  return <Component />;
};

const BouncingShit = () => {
  document.title = 'Bouncing Shit';
  const Component = React.lazy(() => import('./BouncingShit/BouncingShit'));
  return <Component />;
};

const MasonryLayout = () => {
  document.title = 'Masonry Layout';
  const Component = React.lazy(() => import('./MasonryLayout/MasonryLayout'));
  return <Component />;
};

const Heart = () => {
  document.title = 'Heart';
  const Component = React.lazy(() => import('./Heart/Heart'));
  return <Component />;
};

const PingPong = () => {
  document.title = 'Ping Pong';
  const Component = React.lazy(() => import('./PingPong/PingPong'));
  return <Component />;
};

const Squares = () => {
  document.title = 'Squares';
  const Component = React.lazy(() => import('./Squares/Squares'));
  return <Component />;
};

const Orbits = () => {
  document.title = 'Orbits';
  const Component = React.lazy(() => import('./Orbits/Orbits'));
  return <Component />;
};

const Clock = () => {
  document.title = 'Clock';
  const Component = React.lazy(() => import('./Clock/Clock'));
  return <Component />;
};

const Cuboid = () => {
  document.title = 'Cuboid';
  const Component = React.lazy(() => import('./Cuboid/Cuboid'));
  return <Component />;
};

const Eye = () => {
  document.title = 'Eye';
  const Component = React.lazy(() => import('./Eye/Eye'));
  return <Component />;
};

const Trinity = () => {
  document.title = 'Trinity';
  const Component = React.lazy(() => import('./Trinity/Trinity'));
  return <Component />;
};

const Home = () => {
  document.title = 'Animated Shapes';
  const Component = React.lazy(() => import('./Home/Home'));
  return <Component />;
};

const App = () => {
  const checkUrl = () => {
    const path = window.location.pathname;

    switch (path) {
      case '/':
        return <Home />;
      case '/SwirlingLines':
        return (
          <React.Suspense fallback={<Loading/>}>
            <SwirlingLines />
          </React.Suspense>
        );

      case '/BouncingShit':
        return (
          <React.Suspense fallback={<Loading/>}>
            <BouncingShit />
          </React.Suspense>
        );

      case '/MasonryLayout':
        return (
          <React.Suspense fallback={<Loading/>}>
            <MasonryLayout />
          </React.Suspense>
        );

      case '/Heart':
        return (
          <React.Suspense fallback={<Loading/>}>
            <Heart />
          </React.Suspense>
        );

      case '/PingPong':
        return (
          <React.Suspense fallback={<Loading/>}>
            <PingPong />
          </React.Suspense>
        );

      case '/Squares':
        return (
          <React.Suspense fallback={<Loading/>}>
            <Squares />
          </React.Suspense>
        );

      case '/Orbits':
        return (
          <React.Suspense fallback={<Loading/>}>
            <Orbits />
          </React.Suspense>
        );

      case '/Clock':
        return (
          <React.Suspense fallback={<Loading/>}>
            <Clock />
          </React.Suspense>
        );

      case '/Cuboid':
        return (
          <React.Suspense fallback={<Loading/>}>
            <Cuboid />
          </React.Suspense>
        );

      case '/Eye':
        return (
          <React.Suspense fallback={<Loading/>}>
            <Eye />
          </React.Suspense>
        );

      case '/Trinity':
        return (
          <React.Suspense fallback={<Loading/>}>
            <Trinity />
          </React.Suspense>
        );

      default:
        return (
          <React.Suspense fallback={<Loading/>}>
            <Home />
          </React.Suspense>
        );
    }
  };

  return checkUrl();
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
    <React.Suspense fallback={Loading}>
      <App />
    </React.Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);
