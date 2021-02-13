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
    rest: rest === '' ? null : rest,
  };
}

export type Song = {
  tokens: Token[];
  transposeLevel: number;
};

export function tokenize(songStr: string): Song {
  return {
    tokens: songStr.split(/\b/).map((tokenStr, index) => ({
      id: index,
      value: tokenStr,
      chord: parseChord(tokenStr),
      isWhitespace: /^\s+$/.test(tokenStr),
    })),
    transposeLevel: 0,
  };
}

const transposeRootNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export function transpose(song: Song, newTransposeLevel: number): Song {
  if (newTransposeLevel === song.transposeLevel) {
    return song;
  }
  const rootNoteOffset = newTransposeLevel - song.transposeLevel;
  return {
    transposeLevel: newTransposeLevel,
    tokens: song.tokens.map((token) => {
      if (token.chord === null) {
        return token;
      }
      const rootNoteIndex = transposeRootNotes.findIndex(
        (rootNote) => rootNote === (token.chord !== null && token.chord.rootNote),
      );
      if (rootNoteIndex === undefined) {
        console.error(`${token.chord} rootnote was not found from transposing table`);
        return token;
      }
      let newIndex = rootNoteIndex + rootNoteOffset;
      newIndex = newIndex > transposeRootNotes.length - 1 ? newIndex % transposeRootNotes.length : newIndex;
      newIndex = newIndex < 0 ? transposeRootNotes.length + (newIndex % transposeRootNotes.length) : newIndex;
      token.chord.rootNote = transposeRootNotes[newIndex];
      return token;
    }),
  };
}
