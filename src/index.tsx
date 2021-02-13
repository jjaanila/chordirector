import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Chord } from './components/Chord';
import { Song, Token, tokenize } from './parser';

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
  const [song, setSong] = useState<Song>([]);
  useEffect(() => {
    chrome.runtime.onMessage.addListener((request: NewSongRequest, _sender, sendResponse) => {
      if (request.type == 'newSong') {
        setSong(tokenize(request.song));
        sendResponse({ ok: true, reason: undefined });
      }
      sendResponse({ ok: false, reason: `Unknown request type ${request.type}` });
    });
  });
  console.log(song);
  return (
    <main>
      <p>
        {song.map((token) => {
          if (token.chord !== null) {
            return <Chord key={token.id} chord={token.chord} />;
          } else {
            return <NonChord key={token.id} value={token.value} />;
          }
        })}
      </p>
    </main>
  );
};

render(<App></App>, document.getElementById('container'));
