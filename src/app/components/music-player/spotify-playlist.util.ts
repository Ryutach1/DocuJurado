const SPOTIFY_PLAYLIST_PATH = /^\/(?:intl-[a-z]{2}\/)?(?:embed\/)?playlist\/([A-Za-z0-9]{22})\/?$/i;

export function toSpotifyPlaylistEmbedUrl(link: string): string | null {
  try {
    const url = new URL(link.trim());

    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'open.spotify.com' ||
      url.port ||
      url.username ||
      url.password
    ) {
      return null;
    }

    const match = SPOTIFY_PLAYLIST_PATH.exec(url.pathname);
    return match ? `https://open.spotify.com/embed/playlist/${match[1]}` : null;
  } catch {
    return null;
  }
}
