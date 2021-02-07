interface NewSongRequest {
  type: 'newSong';
  song: string;
}

interface ChordirectorResponse {
  ok: boolean;
  reason?: string;
}
