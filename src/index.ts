import { tokenize } from './parser';

chrome.runtime.onMessage.addListener((request: NewSongRequest, _sender, sendResponse) => {
  console.log(request);
  if (request.type == 'newSong') {
    console.log(tokenize(request.song));
    sendResponse({ ok: true, reason: undefined });
  }
  sendResponse({ ok: false, reason: `Unknown request type ${request.type}` });
});
