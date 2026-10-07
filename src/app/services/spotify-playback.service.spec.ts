import { describe, expect, it } from 'vitest';
import { isSpotifyPlaybackState } from './spotify-playback.service';

describe('isSpotifyPlaybackState', () => {
  const track = {
    name: 'Song',
    artists: [{ name: 'Artist' }],
    album: { images: [{ url: 'https://example.com/cover.jpg' }] }
  };

  it('accepts the direct player_state_changed payload from Spotify', () => {
    expect(isSpotifyPlaybackState({
      paused: false,
      position: 1200,
      duration: 2400,
      track_window: { current_track: track }
    })).toBe(true);
  });

  it('rejects the obsolete event.data wrapper', () => {
    expect(isSpotifyPlaybackState({
      data: {
        paused: false,
        position: 1200,
        duration: 2400,
        track_window: { current_track: track }
      }
    })).toBe(false);
  });

  it('rejects incomplete player state', () => {
    expect(isSpotifyPlaybackState({ paused: false, track_window: {} })).toBe(false);
  });
});
