export const DEFAULT_SPOTIFY_PLAYLIST_LINK = '';

// Public app identifier; never add a Spotify Client Secret to this static app.
export const SPOTIFY_CLIENT_ID = '52e6ae77390c4a2d8bb98700528143ab';

// Must exactly match the Redirect URI registered in Spotify Developer Dashboard.
export const SPOTIFY_REDIRECT_URI = 'https://ryutach1.github.io/DocuJurado/';

export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state'
] as const;
