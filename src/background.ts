chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  title: 'Chordirector',
  contexts: ['selection'],
  id: 'chordirector-open',
  visible: true,
});

function sendNewSongRequest(tabId: number, song: string) {
  chrome.tabs.sendMessage(
    tabId,
    { song: song, type: 'newSong' } as NewSongRequest,
    (response?: ChordirectorResponse) => {
      if (response === undefined) {
        response = {
          ok: false,
          reason: chrome.runtime.lastError?.message || 'chrome.runtime.lastError was not set',
        };
      }
      if (!response.ok) {
        alert(`Chordirector failed: ${response.reason}`);
      }
    },
  );
}

chrome.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId == 'chordirector-open') {
    chrome.tabs.create({ url: chrome.extension.getURL('main.html') }, (tab) => {
      setTimeout(() => {
        if (tab.id === undefined) {
          throw new Error('Did not get tab.id');
        }
        if (info.selectionText === undefined) {
          throw new Error('Did not get info.selectionText');
        }
        sendNewSongRequest(tab.id, info.selectionText);
      }, 3000);
    });
  }
});
