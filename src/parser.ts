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
    rest = rest.slice(0, rest.length - otherBassNote.length - 1); // - 1 for slash!
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

const transposeNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

function transposeNote(note: Note, transposeDelta: number): Note {
  const noteIndex = transposeNotes.findIndex((rootNote) => rootNote === note);
  if (noteIndex === undefined) {
    throw new Error(`${note} note was not found from transposing table`);
  }
  let newIndex = noteIndex + transposeDelta;
  newIndex = newIndex > transposeNotes.length - 1 ? newIndex % transposeNotes.length : newIndex;
  newIndex = newIndex < 0 ? transposeNotes.length + (newIndex % transposeNotes.length) : newIndex;
  return transposeNotes[newIndex];
}

export function transpose(song: Song, newTransposeLevel: number): Song {
  if (newTransposeLevel === song.transposeLevel) {
    return song;
  }
  const transposeDelta = newTransposeLevel - song.transposeLevel;
  return {
    transposeLevel: newTransposeLevel,
    tokens: song.tokens.map((token) => {
      if (token.chord === null) {
        return token;
      }
      try {
        token.chord.rootNote = transposeNote(token.chord.rootNote, transposeDelta);
        token.chord.otherBassNote =
          token.chord.otherBassNote === null ? null : transposeNote(token.chord.otherBassNote, transposeDelta);
      } catch (err) {
        console.error(`Error transposing ${token.chord.rootNote} with delta ${transposeDelta}: ${err}`);
        throw err;
      }
      return token;
    }),
  };
}
