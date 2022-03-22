/* eslint-disable no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom';

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
          <React.Suspense fallback={<div>Loading...</div>}>
            <SwirlingLines />
          </React.Suspense>
        );

      case '/BouncingShit':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <BouncingShit />
          </React.Suspense>
        );

      case '/MasonryLayout':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <MasonryLayout />
          </React.Suspense>
        );

      case '/Heart':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Heart />
          </React.Suspense>
        );

      case '/PingPong':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <PingPong />
          </React.Suspense>
        );

      case '/Squares':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Squares />
          </React.Suspense>
        );

      case '/Orbits':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Orbits />
          </React.Suspense>
        );

      case '/Clock':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Clock />
          </React.Suspense>
        );

      case '/Cuboid':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Cuboid />
          </React.Suspense>
        );

      case '/Eye':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Eye />
          </React.Suspense>
        );

      case '/Trinity':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Trinity />
          </React.Suspense>
        );

      default:
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Home />
          </React.Suspense>
        );
    }
  };

  return checkUrl();
};

ReactDOM.render(
  <React.StrictMode>
    <React.Suspense fallback={<div>Loading...</div>}>
      <App />
    </React.Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);
