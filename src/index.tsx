import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Chord } from './components/Chord';
import { Song, Token, tokenize, transpose } from './parser';

const nonChordCss = {
  whiteSpace: 'pre',
};

const NonChord = ({ value }: { value: Token['value'] }) => {
  if (/^\s+$/.test(value)) {
    return <span style={nonChordCss}>{value}</span>;
  }
  return <span style={nonChordCss}>{value}</span>;
};

const App: React.FC = () => {
  const [song, setSong] = useState<Song>({ tokens: [], transposeLevel: 0 });

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request: NewSongRequest, _sender, sendResponse) => {
      if (request.type == 'newSong') {
        setSong(tokenize(request.song));
        sendResponse({ ok: true, reason: undefined });
      }
      sendResponse({ ok: false, reason: `Unknown request type ${request.type}` });
    });
  });
  return (
    <main>
      <p>
        {song.tokens.map((token) => {
          if (token.chord !== null) {
            return <Chord key={token.id} chord={token.chord} />;
          } else {
            return <NonChord key={token.id} value={token.value} />;
          }
        })}
      </p>
      <button id="transpose-up" onClick={() => setSong(transpose(song, song.transposeLevel + 1))}>
        Transpose up
      </button>
      <button id="transpose-down" onClick={() => setSong(transpose(song, song.transposeLevel - 1))}>
        Transpose down
      </button>
      <button id="reset-transpose" onClick={() => setSong(transpose(song, 0))}>
        Reset
      </button>
    </main>
  );
};

render(<App></App>, document.getElementById('container'));
