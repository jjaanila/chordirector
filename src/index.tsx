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
    <main style={mainCss}>
      <section>
        <button id="transpose-up" onClick={() => setSong(transpose(song, song.transposeLevel + 1))}>
          Transpose up
        </button>
        <button id="transpose-down" onClick={() => setSong(transpose(song, song.transposeLevel - 1))}>
          Transpose down
        </button>
        <button id="reset-transpose" onClick={() => setSong(transpose(song, 0))}>
          Reset transpose
        </button>
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
