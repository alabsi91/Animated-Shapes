import { animare } from 'animare';
import React, { useEffect } from 'react';
import './MasonryLayout.css';

function MasonryLayout() {
  useEffect(() => {
    // masonryLayout();
    // window.addEventListener('resize', masonryLayoutOnResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const masonryLayout = async () => {
    const gridItems = document.querySelectorAll('.grid-item');
    const grid = gridItems[0].parentElement;
    const gridGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
    const columnCount = window.getComputedStyle(grid).getPropertyValue('grid-template-columns').split(' ').length;
    const alignment = window.getComputedStyle(grid).getPropertyValue('align-items');
    console.log(alignment);
    // remove margins from grid items to reset
    for (let i = 0; i < gridItems.length; i++) gridItems[i].style.removeProperty('margin-top');

    // set margin-top of each row
    if (alignment.includes('end')) {
      for (let i = gridItems.length - 1; i >= 0; i--) {
        if (gridItems[i - columnCount]) {
          const margin =
            gridItems[i - columnCount].getBoundingClientRect().bottom - gridItems[i].getBoundingClientRect().top + gridGap;
          await animare({ to: margin, duration: 30 }, m => {
            gridItems[i - columnCount].style.marginBottom = `${m}px`;
          }).asyncOnFinish();
        }
      }
    } else if (alignment.includes('start')) {
      for (let i = 0; i < gridItems.length; i++) {
        if (gridItems[i + columnCount]) {
          const margin =
            gridItems[i].getBoundingClientRect().bottom - gridItems[i + columnCount].getBoundingClientRect().top + gridGap;
          await animare({ to: margin, duration: 30 }, m => {
            gridItems[i + columnCount].style.marginTop = `${m}px`;
          }).asyncOnFinish();
        }
      }
    } else console.error('Alignment not supported, please use "start" or "end"');
  };

  const devideToRandoms = (num, by) => {
    const devided = ~~(num / by);
    const array = Array.from({ length: by }, e => devided);

    for (let i = 0; i < array.length; i++) {
      const random = Math.floor(Math.random() * (devided - 1 + 1) + 1);
      const randomIndex = Math.floor(Math.random() * (array.length - 2 + 0) + 0);
      array[i] = array[i] - random;
      array[randomIndex] = array[randomIndex] + random;
    }

    return array;
  };

  const createGridElements = () => {
    const elementsCount = Math.round(window.innerWidth / 25) * Math.round((window.innerHeight - 100) / 55);
    const elements = [];

    for (let i = 0; i < elementsCount; i++) {
      elements.push(<div className='grid-item' key={i}></div>);
    }
    return elements;
  };

  const randomColors = () => {
    const gridItems = document.querySelectorAll('.grid-item');
    for (let i = 0; i < gridItems.length; i++) {
      const randomColor = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )})`;
      gridItems[i].style.backgroundColor = randomColor;
    }
  };

  const randomHeights = () => {
    const gridItems = document.querySelectorAll('.grid-item');
    const grid = gridItems[0].parentElement;
    const columnCount = window.getComputedStyle(grid).getPropertyValue('grid-template-columns').split(' ').length;
    const rowCount = window.getComputedStyle(grid).getPropertyValue('grid-template-rows').split(' ').length;

    for (let c = 0; c < columnCount; c++) {
      const randoms = devideToRandoms(window.innerHeight - 100 - rowCount * 5, rowCount);
      let randomIndex = 0;
      for (let r = c; r < gridItems.length; r = r + columnCount) {
        gridItems[r].style.height = randoms[randomIndex] + 'px';
        gridItems[r].style.removeProperty('margin-top');
        randomIndex++;
      }
    }
  };

  return (
    <>
      <div id='header'>
        <div className='buttons' onClick={randomColors}>
          Random Colors
        </div>
        <div className='buttons' onClick={randomHeights}>
          Random Heights
        </div>
        <div className='buttons' onClick={masonryLayout}>
          Masonry Layout
        </div>
      </div>
      <div id='cards-grid' className='App'>
        {createGridElements()}
      </div>
    </>
  );
}

export default MasonryLayout;
