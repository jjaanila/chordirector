chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  title: 'Chordirector',
  contexts: ['selection'],
  id: 'chordirector-open',
  visible: true,
});

const noteLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'H'];

const rootNotes = [
  'C',
  'D',
  'E',
  'F',
  'G',
  'A',
  'B',
  'H',
  'C#',
  'D#',
  'E#',
  'F#',
  'G#',
  'A#',
  'B#',
  'H#',
  'Cb',
  'Db',
  'Fb',
  'Gb',
  'Eb',
  'Ab',
  'Bb',
  'Hb',
] as const;

const rootNoteRegex = `[${noteLetters.join()}][b#]*`;

type RootNote = typeof rootNotes[number];

interface Chord {
  rootNote: RootNote;
  rest: string | null;
}

interface Token {
  value: string;
  chord: Chord | null;
}

function renderChord(chord: Token) {
  return '<strong>' + chord + '</strong>';
}

function isChord(chordCandidate: string) {
  return new RegExp(`^${rootNoteRegex}[/m#b123456789adiMmju+()]*$`).test(chordCandidate);
}

function parseChord(chordCandidate: string): Chord | null {
  if (!isChord(chordCandidate)) {
    return null;
  }
  const rootNoteMatches = chordCandidate.match(rootNoteRegex);
  if (rootNoteMatches === null) {
    throw new Error(`Did not find rootnote for ${chordCandidate}`);
  }
  const rest = chordCandidate.slice(rootNoteMatches[0].length);
  return {
    rootNote: rootNoteMatches[0] as RootNote,
    rest: rest === '' ? rest : null,
  };
}

function tokenize(song: string): Token[] {
  return song.split(/\s+/).map((tokenStr) => ({
    value: tokenStr,
    chord: parseChord(tokenStr),
  }));
}

chrome.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId == 'chordirector-open' && info.selectionText) {
    console.log(tokenize(info.selectionText));
  }
});
