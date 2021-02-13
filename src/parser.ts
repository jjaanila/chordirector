const noteLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const notes = [
  'C',
  'D',
  'E',
  'F',
  'G',
  'A',
  'B',
  'C#',
  'D#',
  'E#',
  'F#',
  'G#',
  'A#',
  'B#',
  'Cb',
  'Db',
  'Fb',
  'Gb',
  'Eb',
  'Ab',
  'Bb',
] as const;

type Note = typeof notes[number];

export interface TokenChord {
  rootNote: Note;
  otherBassNote: Note | null;
  rest: string | null;
}

export interface Token {
  id: number;
  value: string;
  chord: TokenChord | null;
}

const noteRegex = `[${noteLetters.join()}][b#]*`;
const restRegex = '[m#b123456789adiMmju+()]*';

function isChord(chordCandidate: string) {
  return new RegExp(`^${noteRegex}${restRegex}(\/${noteRegex})?$`, 'gm').test(chordCandidate);
}

function parseChord(chordCandidate: string): TokenChord | null {
  if (!isChord(chordCandidate)) {
    return null;
  }
  const rootNoteMatches = chordCandidate.match(`^${noteRegex}`);
  if (rootNoteMatches === null || rootNoteMatches[0] === null) {
    throw new Error(`Did not find rootnote for ${chordCandidate}`);
  }
  let rest = chordCandidate.slice(rootNoteMatches[0].length);
  const bassNoteMatches = rest.match(new RegExp(`(?<=\/)${noteRegex}$`));
  let otherBassNote: Note | null = null;
  if (bassNoteMatches !== null && bassNoteMatches[0] !== null) {
    otherBassNote = bassNoteMatches[0] as Note; // Leave out the leading slash
    console.log(chordCandidate);
    console.log(rest, otherBassNote);
    rest = rest.slice(0, rest.length - otherBassNote.length - 1); // - 1 for slash!
    console.log(rest);
  }
  return {
    rootNote: rootNoteMatches[0] as Note,
    otherBassNote,
    rest: rest === '' ? null : rest,
  };
}

export type Song = {
  tokens: Token[];
  transposeLevel: number;
};

export function tokenize(songStr: string): Song {
  return {
    tokens: songStr.split(/(?<=\w)(?=\s)|(?<=\s)(?=\w)/).map((tokenStr, index) => ({
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
