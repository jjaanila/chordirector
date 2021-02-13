import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Song, Token, TokenChord, tokenize, transpose } from './parser';

const nonChordCss = {
  whiteSpace: 'pre',
};

const mainCss = {
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'center',
};

const songCss = {
  margin: 0,
};

const controlCss = {
  marginRight: '4px',
};

const controlsCss = {
  position: 'fixed',
  top: '0.1rem',
  right: '0.1rem',
};

const Chord = ({ chord }: { chord: TokenChord }) => {
  return (
    <strong>
      {chord.rootNote}
      {chord.rest !== null ? chord.rest : ''}
      {chord.otherBassNote !== null ? `/${chord.otherBassNote}` : ''}
    </strong>
  );
};

const NonChord = ({ value }: { value: Token['value'] }) => {
  return <span style={nonChordCss}>{value}</span>;
};

let countdownTimeout: NodeJS.Timeout | undefined;
let countdownInterval: NodeJS.Timeout | undefined;
let scrollingInterval: NodeJS.Timeout | undefined;

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [song, setSong] = useState<Song>({ tokens: [], transposeLevel: 0 });
  const [scrollSpeed, setScrollSpeed] = useState<number>(200);
  const [countdown, setCountdown] = useState(0);
  const [countdownSecond, setCountdownSecond] = useState<number>(0);
  const stopScrolling = () => {
    if (scrollingInterval !== undefined) {
      clearInterval(scrollingInterval);
      scrollingInterval = undefined;
      setIsScrolling(false);
    }
    if (countdownTimeout !== undefined) {
      clearTimeout(countdownTimeout);
      countdownTimeout = undefined;
    }
  };
  const startScrolling = (scrollSpeed: number) => {
    setIsScrolling(true);
    setCountdownSecond(countdown);
    countdownInterval = setInterval(() => {
      setCountdownSecond(countdownSecond - 1);
      if (countdownSecond === 0 && countdownInterval !== undefined) {
        clearInterval(countdownInterval);
      }
    }, 1000);
    setTimeout(() => {
      scrollingInterval = setInterval(function () {
        window.scrollBy(0, scrollSpeed * 0.01);
      }, 100);
    }, countdown * 1000);
  };
  useEffect(() => {
    chrome.runtime.onMessage.addListener((request: NewSongRequest, _sender, sendResponse) => {
      if (request.type == 'newSong') {
        setSong(tokenize(request.song));
        sendResponse({ ok: true, reason: undefined });
        setIsLoading(false);
      }
      sendResponse({ ok: false, reason: `Unknown request type ${request.type}` });
    });
    document.addEventListener('mousewheel', function (e) {
      stopScrolling();
    });
  });
  if (isLoading) {
    return <main>Loading...</main>;
  }
  return (
    <main style={mainCss}>
      <section style={controlsCss}>
        <button style={controlCss} id="transpose-up" onClick={() => setSong(transpose(song, song.transposeLevel + 1))}>
          Transpose up
        </button>
        <button
          style={controlCss}
          id="transpose-down"
          onClick={() => setSong(transpose(song, song.transposeLevel - 1))}
        >
          Transpose down
        </button>
        <button style={controlCss} id="reset-transpose" onClick={() => setSong(transpose(song, 0))}>
          Reset transpose
        </button>
        <button
          style={controlCss}
          id="auto-scroll"
          onClick={() => {
            if (isScrolling) {
              stopScrolling();
            } else {
              startScrolling(scrollSpeed);
            }
          }}
        >
          {countdownSecond > 0 ? countdownSecond : !isScrolling ? 'Start scrolling' : 'Stop scrolling'}
        </button>
        <select
          disabled={isScrolling}
          style={controlCss}
          id="select-speed"
          value={scrollSpeed}
          onChange={(event) => setScrollSpeed(parseInt(event.target.value, 10))}
        >
          <option value={100}>Slow</option>
          <option value={200}>Medium</option>
          <option value={300}>Fast</option>
        </select>
        <input
          disabled={isScrolling}
          id="countdown-input"
          type="number"
          value={undefined}
          placeholder={'Time to wait before scrolling'}
          title="Time to wait before scrolling"
          onChange={(event) => setCountdown(parseInt(event.target.value, 10))}
        />
      </section>
      <section>
        <p style={songCss}>
          {song.tokens.map((token) => {
            if (token.chord !== null) {
              return <Chord key={token.id} chord={token.chord} />;
            } else {
              return <NonChord key={token.id} value={token.value} />;
            }
          })}
        </p>
      </section>
    </main>
  );
};

render(<App></App>, document.getElementById('container'));
