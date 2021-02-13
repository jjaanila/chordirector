import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { AutoScroll } from './components/AutoScroll';
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
  marginBottom: '4px',
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

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [song, setSong] = useState<Song>({ tokens: [], transposeLevel: 0 });
  useEffect(() => {
    function handleNewSong(
      request: NewSongRequest,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void,
    ) {
      if (request.type == 'newSong') {
        setSong(tokenize(request.song));
        sendResponse({ ok: true, reason: undefined });
        setIsLoading(false);
      }
      sendResponse({ ok: false, reason: `Unknown request type ${request.type}` });
    }

    chrome.runtime.onMessage.addListener(handleNewSong);
    return () => {
      chrome.runtime.onMessage.removeListener(handleNewSong);
    };
  });
  if (isLoading) {
    return <main>Loading...</main>;
  }
  return (
    <main style={mainCss}>
      <section style={controlsCss}>
        <div>
          <button
            style={controlCss}
            id="transpose-up"
            onClick={() => setSong(transpose(song, song.transposeLevel + 1))}
          >
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
        </div>
        <div>
          <AutoScroll />
        </div>
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
