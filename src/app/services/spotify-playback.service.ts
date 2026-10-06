import { Injectable, signal } from '@angular/core';
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_SCOPES
} from '../config/music-player.config';

type PlaybackStatus = 'disconnected' | 'authorizing' | 'connecting' | 'playing' | 'error';

interface SpotifyPlayerEvent {
  device_id?: string;
  message?: string;
}

interface SpotifySdkPlayer {
  addListener(eventName: string, listener: (event: SpotifyPlayerEvent) => void): boolean;
  connect(): Promise<boolean>;
  disconnect(): void;
  togglePlay(): Promise<void>;
}

interface SpotifySdk {
  Player: new (options: {
    name: string;
    volume: number;
    getOAuthToken: (callback: (token: string) => void) => void;
  }) => SpotifySdkPlayer;
}

declare global {
  interface Window {
    Spotify?: SpotifySdk;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
}

interface SpotifyPlaybackResponse {
  context?: {
    type?: string;
    uri?: string;
  } | null;
}

function isSpotifyTokenResponse(value: unknown): value is SpotifyTokenResponse {
  return typeof value === 'object' &&
    value !== null &&
    'access_token' in value &&
    typeof value.access_token === 'string' &&
    'expires_in' in value &&
    typeof value.expires_in === 'number';
}

function isSpotifyPlaybackResponse(value: unknown): value is SpotifyPlaybackResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('context' in value)) {
    return true;
  }

  const context = value.context;
  return context === null ||
    (typeof context === 'object' &&
      context !== null &&
      (!('type' in context) || typeof context.type === 'string') &&
      (!('uri' in context) || typeof context.uri === 'string'));
}

const PKCE_VERIFIER_KEY = 'docujurado.spotify.pkce-verifier';
const OAUTH_STATE_KEY = 'docujurado.spotify.oauth-state';

@Injectable({ providedIn: 'root' })
export class SpotifyPlaybackService {
  readonly status = signal<PlaybackStatus>('disconnected');
  readonly message = signal('');
  readonly activePlaylistUri = signal('');

  private accessToken = '';
  private accessTokenExpiresAt = 0;
  private player: SpotifySdkPlayer | null = null;

  async handleOAuthRedirect(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const returnedState = params.get('state');
    const authError = params.get('error');

    if (!code && !authError) {
      return;
    }

    this.clearOAuthParams();

    if (authError) {
      this.clearPkceData();
      throw new Error(`Spotify canceló o rechazó la autorización (${authError}).`);
    }

    const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
    this.clearPkceData();

    if (!code || !returnedState || !expectedState || returnedState !== expectedState || !verifier) {
      throw new Error('No se pudo validar el retorno seguro de Spotify. Intenta conectar de nuevo.');
    }

    if (!SPOTIFY_CLIENT_ID) {
      throw new Error('Falta configurar el Client ID público de Spotify en music-player.config.ts.');
    }

    this.status.set('connecting');
    const token = await this.exchangeAuthorizationCode(code, verifier);
    this.accessToken = token.access_token;
    this.accessTokenExpiresAt = Date.now() + token.expires_in * 1000;
    await this.startFromActivePlaylist();
  }

  async beginAuthorization(): Promise<void> {
    if (!SPOTIFY_CLIENT_ID) {
      throw new Error('Configura primero el Client ID público en music-player.config.ts.');
    }

    const verifier = this.randomUrlSafeString(64);
    const state = this.randomUrlSafeString(32);
    const challenge = await this.createCodeChallenge(verifier);

    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(OAUTH_STATE_KEY, state);

    const authorizationUrl = new URL('https://accounts.spotify.com/authorize');
    authorizationUrl.search = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge: challenge,
      state,
      scope: SPOTIFY_SCOPES.join(' ')
    }).toString();

    this.status.set('authorizing');
    window.location.assign(authorizationUrl);
  }

  async togglePlay(): Promise<void> {
    if (!this.player) {
      throw new Error('Conecta Spotify antes de controlar la reproducción.');
    }

    await this.player.togglePlay();
  }

  disconnect(): void {
    this.player?.disconnect();
    this.player = null;
    this.accessToken = '';
    this.accessTokenExpiresAt = 0;
    this.activePlaylistUri.set('');
    this.status.set('disconnected');
    this.message.set('Se cerró la conexión de esta página. Para revocar el permiso, hazlo desde tu cuenta de Spotify.');
    this.clearPkceData();
  }

  reportError(message: string): void {
    this.showSdkError(message);
  }

  private async startFromActivePlaylist(): Promise<void> {
    const response = await this.spotifyFetch('https://api.spotify.com/v1/me/player');

    if (response.status === 204) {
      throw new Error('No se encontró una reproducción activa. Inicia una playlist en Spotify y vuelve a conectar.');
    }

    if (!response.ok) {
      throw new Error(await this.responseError(response, 'No se pudo leer la reproducción activa de Spotify.'));
    }

    const payload: unknown = await response.json();

    if (!isSpotifyPlaybackResponse(payload)) {
      throw new Error('Spotify devolvió un estado de reproducción inválido.');
    }

    const playback = payload;
    const contextUri = playback.context?.uri;

    if (playback.context?.type !== 'playlist' || !contextUri?.startsWith('spotify:playlist:')) {
      throw new Error('La reproducción activa no pertenece a una playlist. Inicia una playlist y vuelve a conectar.');
    }

    this.activePlaylistUri.set(contextUri);
    this.message.set('Playlist activa encontrada. Preparando el reproductor de DocuJurado…');

    await this.loadPlaybackSdk();
    await this.createPlayer(contextUri);
  }

  private async createPlayer(contextUri: string): Promise<void> {
    const spotify = window.Spotify;

    if (!spotify) {
      throw new Error('No se pudo cargar el reproductor web de Spotify.');
    }

    const player = new spotify.Player({
      name: 'DocuJurado',
      volume: 0.5,
      getOAuthToken: callback => {
        if (Date.now() >= this.accessTokenExpiresAt) {
          this.showSdkError('La sesión temporal de Spotify expiró. Desconecta y vuelve a conectar.');
          callback('');
          return;
        }

        callback(this.accessToken);
      }
    });

    this.player = player;

    player.addListener('ready', event => {
      if (!event.device_id) {
        this.showSdkError('Spotify no devolvió el dispositivo de reproducción.');
        return;
      }

      void this.playContextOnDevice(event.device_id, contextUri)
        .catch(error => this.showSdkError(this.errorMessage(error)));
    });

    player.addListener('not_ready', () => {
      this.status.set('connecting');
      this.message.set('El reproductor web de Spotify se desconectó.');
    });

    player.addListener('account_error', event => {
      this.showSdkError(event.message || 'El reproductor web requiere una cuenta Spotify Premium.');
    });

    for (const eventName of ['initialization_error', 'authentication_error', 'playback_error']) {
      player.addListener(eventName, event => {
        this.showSdkError(event.message || 'Spotify no pudo iniciar la reproducción web.');
      });
    }

    const connected = await player.connect();

    if (!connected) {
      throw new Error('No se pudo conectar el reproductor web de Spotify.');
    }
  }

  private async playContextOnDevice(deviceId: string, contextUri: string): Promise<void> {
    const url = new URL('https://api.spotify.com/v1/me/player/play');
    url.searchParams.set('device_id', deviceId);

    const response = await this.spotifyFetch(url.toString(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context_uri: contextUri })
    });

    if (!response.ok) {
      throw new Error(await this.responseError(response, 'Spotify no permitió iniciar esta playlist en el reproductor web.'));
    }

    this.status.set('playing');
    this.message.set('Reproduciendo en DocuJurado. Spotify puede pausar otros dispositivos Connect.');
  }

  private async exchangeAuthorizationCode(code: string, verifier: string): Promise<SpotifyTokenResponse> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: verifier
      })
    });

    if (!response.ok) {
      throw new Error(await this.responseError(response, 'No se pudo completar la autorización con Spotify.'));
    }

    const payload: unknown = await response.json();

    if (!isSpotifyTokenResponse(payload)) {
      throw new Error('Spotify devolvió una respuesta de autorización inválida.');
    }

    return payload;
  }

  private async spotifyFetch(url: string, init: RequestInit = {}): Promise<Response> {
    return fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${this.accessToken}`
      }
    });
  }

  private async loadPlaybackSdk(): Promise<void> {
    if (window.Spotify) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById('spotify-web-playback-sdk');
      const previousCallback = window.onSpotifyWebPlaybackSDKReady;
      let settled = false;

      window.onSpotifyWebPlaybackSDKReady = () => {
        previousCallback?.();
        settled = true;
        resolve();
      };

      if (existingScript) {
        existingScript.addEventListener('error', () => reject(new Error('No se pudo descargar el SDK de Spotify.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = 'spotify-web-playback-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.onerror = () => {
        if (!settled) {
          reject(new Error('No se pudo descargar el SDK de Spotify.'));
        }
      };
      document.body.appendChild(script);
    });
  }

  private async createCodeChallenge(verifier: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return this.toBase64Url(new Uint8Array(digest));
  }

  private randomUrlSafeString(byteLength: number): string {
    const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
    return this.toBase64Url(bytes);
  }

  private toBase64Url(bytes: Uint8Array): string {
    let binary = '';

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private clearOAuthParams(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    url.searchParams.delete('error');
    url.searchParams.delete('error_description');
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }

  private clearPkceData(): void {
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
  }

  private async responseError(response: Response, fallback: string): Promise<string> {
    try {
      const body: unknown = await response.json();

      if (
        typeof body === 'object' &&
        body !== null &&
        'error_description' in body &&
        typeof body.error_description === 'string'
      ) {
        return body.error_description;
      }
    } catch {
      return `${fallback} (HTTP ${response.status}).`;
    }

    return `${fallback} (HTTP ${response.status}).`;
  }

  private showSdkError(message: string): void {
    this.status.set('error');
    this.message.set(message);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Ocurrió un error al conectar con Spotify.';
  }
}
