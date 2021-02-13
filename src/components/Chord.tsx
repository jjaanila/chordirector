import React from 'react';
import { TokenChord } from '../parser';

export const Chord = ({ chord }: { chord: TokenChord }) => {
  return <strong>{`${chord.rootNote}${chord.rest ? chord.rest : ''}`}</strong>;
};
