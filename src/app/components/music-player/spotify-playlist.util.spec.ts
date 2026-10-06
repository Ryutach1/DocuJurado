import { describe, expect, it } from 'vitest';
import { toSpotifyPlaylistEmbedUrl } from './spotify-playlist.util';

const playlistId = '37i9dQZF1DX4sWSpwq3LiO';

describe('toSpotifyPlaylistEmbedUrl', () => {
  it('accepts a public playlist link with tracking parameters', () => {
    expect(toSpotifyPlaylistEmbedUrl(`https://open.spotify.com/playlist/${playlistId}?si=share`))
      .toBe(`https://open.spotify.com/embed/playlist/${playlistId}`);
  });

  it('accepts Spotify embed and localized playlist links', () => {
    expect(toSpotifyPlaylistEmbedUrl(`https://open.spotify.com/embed/playlist/${playlistId}`))
      .toBe(`https://open.spotify.com/embed/playlist/${playlistId}`);
    expect(toSpotifyPlaylistEmbedUrl(`https://open.spotify.com/intl-es/playlist/${playlistId}`))
      .toBe(`https://open.spotify.com/embed/playlist/${playlistId}`);
  });

  it.each([
    'http://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    'https://open.spotify.com.example.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    'https://open.spotify.com/track/37i9dQZF1DX4sWSpwq3LiO',
    'https://open.spotify.com/album/37i9dQZF1DX4sWSpwq3LiO',
    'https://open.spotify.com/playlist/not-a-valid-id',
    'not a URL'
  ])('rejects unsupported or unsafe link: %s', link => {
    expect(toSpotifyPlaylistEmbedUrl(link)).toBeNull();
  });
});
