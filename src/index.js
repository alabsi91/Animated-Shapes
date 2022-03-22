/* eslint-disable no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom';

const SwirlingLines = () => {
  document.title = 'Swirling Lines';
  const Component = require('./SwirlingLines/SwirlingLines').default;
  return <Component />;
};

const BouncingShit = () => {
  document.title = 'Bouncing Shit';
  const Component = require('./BouncingShit/BouncingShit').default;
  return <Component />;
};

const MasonryLayout = () => {
  document.title = 'Masonry Layout';
  const Component = require('./MasonryLayout/MasonryLayout').default;
  return <Component />;
};

const Heart = () => {
  document.title = 'Heart';
  const Component = require('./Heart/Heart').default;
  return <Component />;
};

const PingPong = () => {
  document.title = 'Ping Pong';
  const Component = require('./PingPong/PingPong').default;
  return <Component />;
};

const Squares = () => {
  document.title = 'Squares';
  const Component = require('./Squares/Squares').default;
  return <Component />;
};

const Orbits = () => {
  document.title = 'Orbits';
  const Component = require('./Orbits/Orbits').default;
  return <Component />;
};

const Clock = () => {
  document.title = 'Clock';
  const Component = require('./Clock/Clock').default;
  return <Component />;
};

const Cuboid = () => {
  document.title = 'Cuboid';
  const Component = require('./Cuboid/Cuboid').default;
  return <Component />;
};

const Eye = () => {
  document.title = 'Eye';
  const Component = require('./Eye/Eye').default;
  return <Component />;
};

const Trinity = () => {
  document.title = 'Trinity';
  const Component = require('./Trinity/Trinity').default;
  return <Component />;
};

const Home = () => {
  document.title = 'Animated Shapes';
  const Component = require('./Home/Home').default;
  return <Component />;
};

const App = () => {
  const path = window.location.pathname;

  switch (path) {
    case '/':
      return <Home />;
    case '/SwirlingLines':
      return <SwirlingLines />;
    case '/BouncingShit':
      return <BouncingShit />;
    case '/MasonryLayout':
      return <MasonryLayout />;
    case '/Heart':
      return <Heart />;
    case '/PingPong':
      return <PingPong />;
    case '/Squares':
      return <Squares />;
    case '/Orbits':
      return <Orbits />;
    case '/Clock':
      return <Clock />;
    case '/Cuboid':
      return <Cuboid />;
    case '/Eye':
      return <Eye />;
    case '/Trinity':
      return <Trinity />;
    default:
      return <Home />;
  }
};

ReactDOM.render(
  <React.StrictMode>
    {/* {Squares()} */}
    {/* {SwirlingLines()} */}
    {/* {Heart()} */}
    {/* {BouncingShit()} */}
    {/* {MasonryLayout()} */}
    {/* {PingPong()} */}
    {/* {Orbits()} */}
    {/* {Clock()} */}
    {/* {Cuboid()} */}
    {/* {Eye()} */}
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
