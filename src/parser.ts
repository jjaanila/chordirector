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

export interface TokenChord {
  rootNote: RootNote;
  rest: string | null;
}

export interface Token {
  id: number;
  value: string;
  chord: TokenChord | null;
}

function isChord(chordCandidate: string) {
  return new RegExp(`^${rootNoteRegex}[/m#b123456789adiMmju+()]*$`).test(chordCandidate);
}

function parseChord(chordCandidate: string): TokenChord | null {
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

export function tokenize(song: string): Token[] {
  console.log('tokenizing' + song);
  return song.split(/\s+/).map((tokenStr, index) => ({
    id: index,
    value: tokenStr,
    chord: parseChord(tokenStr),
  }));
}
