import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Chord } from './components/Chord';
import { Token, tokenize } from './parser';

const App: React.FC = () => {
  const [song, setSong] = useState<Token[]>([]);
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
            return <Chord chord={token.chord}></Chord>;
          } else {
            return token.value;
          }
        })}
      </p>
    </main>
  );
};

render(<App></App>, document.getElementById('container'));
