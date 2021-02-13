import React, { useEffect, useState } from 'react';

const controlCss = {
  marginRight: '4px',
};

let scrollingInterval: NodeJS.Timeout;
let countdownTimeout: NodeJS.Timeout;

export const AutoScroll = () => {
  const [scrollSpeed, setScrollSpeed] = useState<number>(200);
  const [countdown, setCountdown] = useState(0);
  const [countdownCounter, setCountdownCounter] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const start = () => {
    setIsCountingDown(true);
    setCountdownCounter(countdown);
  };
  const stop = () => {
    clearInterval(scrollingInterval);
    clearTimeout(countdownTimeout);
    setIsScrolling(false);
    setIsCountingDown(false);
  };
  useEffect(() => {
    function handleMouseWheel() {
      stop();
    }
    document.addEventListener('mousewheel', handleMouseWheel);
    let countdownTimeout: NodeJS.Timeout;
    if (isCountingDown) {
      countdownTimeout = setTimeout(() => {
        setCountdownCounter(countdownCounter - 1);
        if (countdownCounter <= 0) {
          setIsScrolling(true);
          setIsCountingDown(false);
          console.log('scroll!');
          scrollingInterval = setInterval(function () {
            window.scrollBy(0, scrollSpeed * 0.01);
          }, 100);
        }
      }, 1000);
    }
    return () => {
      document.removeEventListener('mousewheel', handleMouseWheel);
      clearTimeout(countdownTimeout);
    };
  });
  return (
    <>
      <button
        style={controlCss}
        id="auto-scroll"
        onClick={() => {
          if (isScrolling || isCountingDown) {
            stop();
          } else {
            start();
          }
        }}
      >
        {isCountingDown ? `${countdownCounter} (Stop)` : !isScrolling ? 'Start scrolling' : 'Stop'}
      </button>
      <select
        style={controlCss}
        disabled={isScrolling}
        id="select-speed"
        value={scrollSpeed}
        onChange={(event) => setScrollSpeed(parseInt(event.target.value, 10))}
      >
        <option value={100}>Slow</option>
        <option value={200}>Medium</option>
        <option value={300}>Fast</option>
      </select>
      <input
        style={controlCss}
        disabled={isScrolling}
        id="countdown-input"
        type="number"
        value={countdown}
        placeholder={'Countdown (s)'}
        title="Countdown before scrolling"
        onChange={(event) => {
          setCountdown(parseInt(event.target.value, 10));
        }}
      />
    </>
  );
};
