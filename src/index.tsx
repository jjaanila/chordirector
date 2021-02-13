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

let scrollingInterval: NodeJS.Timeout | null = null;

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [song, setSong] = useState<Song>({ tokens: [], transposeLevel: 0 });
  const [scrollSpeed, setScrollSpeed] = useState<number>(200);
  const stopScrolling = () => {
    if (scrollingInterval !== null) {
      clearInterval(scrollingInterval);
      scrollingInterval = null;
      setIsScrolling(false);
    }
  };
  const startScrolling = (scrollSpeed: number) => {
    scrollingInterval = setInterval(function () {
      window.scrollBy(0, scrollSpeed * 0.01);
      if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
        stopScrolling();
      }
    }, 100);
    setIsScrolling(true);
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
      <section>
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
          {!isScrolling ? 'Start scrolling' : 'Stop scrolling'}
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
