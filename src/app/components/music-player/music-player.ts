import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  DEFAULT_SPOTIFY_PLAYLIST_LINK,
  SPOTIFY_CLIENT_ID
} from '../../config/music-player.config';
import { SpotifyPlaybackService } from '../../services/spotify-playback.service';
import { toSpotifyPlaylistEmbedUrl } from './spotify-playlist.util';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.html',
  styleUrl: './music-player.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closePlayer()'
  }
})
export class MusicPlayer implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);
  readonly spotify = inject(SpotifyPlaybackService);

  readonly isOpen = signal(false);
  readonly playlistInput = signal('');
  readonly playlistUrl = signal(toSpotifyPlaylistEmbedUrl(DEFAULT_SPOTIFY_PLAYLIST_LINK));
  readonly feedback = signal('');
  readonly hasError = signal(false);
  readonly spotifyConfigured = Boolean(SPOTIFY_CLIENT_ID);

  ngOnInit(): void {
    void this.spotify.handleOAuthRedirect().catch(error => {
      this.spotify.reportError(this.errorMessage(error));
    });
  }

  readonly embedUrl = computed(() => {
    const url = this.playlistUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  readonly currentArtist = computed(
    () => this.spotify.currentTrack()?.artists.map(artist => artist.name).join(', ') ?? ''
  );

  readonly progressPercent = computed(() => {
    const duration = this.spotify.duration();
    return duration > 0 ? Math.min(100, (this.spotify.position() / duration) * 100) : 0;
  });

  readonly currentTime = computed(() => this.formatTime(this.spotify.position()));
  readonly durationTime = computed(() => this.formatTime(this.spotify.duration()));

  readonly spotifyPageUrl = computed(() => {
    const url = this.playlistUrl();
    return url?.replace('/embed/playlist/', '/playlist/') ?? null;
  });

  togglePlayer(): void {
    this.isOpen.update(open => !open);
  }

  closePlayer(): void {
    this.isOpen.set(false);
  }

  updatePlaylistInput(event: Event): void {
    this.playlistInput.set((event.target as HTMLInputElement).value);
    this.feedback.set('');
    this.hasError.set(false);
  }

  applyPlaylist(link: string): void {
    const embedUrl = toSpotifyPlaylistEmbedUrl(link);

    if (!embedUrl) {
      this.feedback.set('Usa un enlace HTTPS de una playlist pública de Spotify.');
      this.hasError.set(true);
      return;
    }

    this.playlistUrl.set(embedUrl);
    this.playlistInput.set(link.trim());
    this.feedback.set('Playlist cargada para esta sesión. No se guardará al cerrar o recargar la página.');
    this.hasError.set(false);
  }

  clearPlaylist(): void {
    this.playlistUrl.set(null);
    this.playlistInput.set('');
    this.feedback.set('Playlist eliminada de esta sesión.');
    this.hasError.set(false);
  }

  async connectSpotify(): Promise<void> {
    try {
      await this.spotify.beginAuthorization();
    } catch (error) {
      this.spotify.reportError(this.errorMessage(error));
    }
  }

  async toggleSpotifyPlayback(): Promise<void> {
    try {
      await this.spotify.togglePlay();
    } catch (error) {
      this.spotify.reportError(this.errorMessage(error));
    }
  }

  async nextTrack(): Promise<void> {
    try {
      await this.spotify.nextTrack();
    } catch (error) {
      this.spotify.reportError(this.errorMessage(error));
    }
  }

  async previousTrack(): Promise<void> {
    try {
      await this.spotify.previousTrack();
    } catch (error) {
      this.spotify.reportError(this.errorMessage(error));
    }
  }

  disconnectSpotify(): void {
    this.spotify.disconnect();
  }

  private formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo conectar con Spotify.';
  }
}
