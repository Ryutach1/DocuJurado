# DocuJurado

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.17.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Mini reproductor de música

El reproductor flotante permite dos modos:

1. **Cuenta Spotify:** «Conectar con Spotify» usa OAuth Authorization Code + PKCE, consulta el contexto de reproducción actual y crea un dispositivo Web Playback SDK en DocuJurado. El usuario debe tener una playlist activa en Spotify y Spotify Premium para reproducirla dentro de la página. La transferencia puede pausar otros dispositivos Spotify Connect.
2. **Playlist pública manual:** cada persona puede pegar un enlace en el panel. El iframe puede estar limitado a muestras según Spotify, el navegador o las cookies.

### Configuración OAuth de Spotify

1. Crea una aplicación en el [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. En sus ajustes, agrega esta Redirect URI exactamente: `https://ryutach1.github.io/DocuJurado/`.
3. Copia el **Client ID** (no uses Client Secret) en `SPOTIFY_CLIENT_ID` de `src/app/config/music-player.config.ts`.
4. Publica la aplicación y prueba «Conectar con Spotify». Cada usuario debe autorizar los permisos solicitados y tener Spotify Premium para el Web Playback SDK.

El Client ID es público por diseño. No añadas un Client Secret al código. Los permisos se limitan a `streaming`, `user-read-playback-state` y `user-modify-playback-state`; no se leen ni modifican playlists guardadas.

El token de acceso vive únicamente en memoria y no se renueva de forma persistente; al expirar o recargar la página se deberá volver a autorizar. PKCE guarda temporalmente el verificador y el estado anti-CSRF en `sessionStorage` para sobrevivir el retorno OAuth; se eliminan al procesar el retorno o al desconectar. Esto evita un Client Secret, pero no protege contra código malicioso ejecutado en el mismo sitio ni frente a inspección de la sesión activa. «Desconectar» borra el token de esta página; para revocar el consentimiento hay que hacerlo desde la configuración de la cuenta Spotify.

El reproductor requiere conexión a internet. Los recursos de Spotify se solicitan directamente desde el navegador; no hay backend ni almacenamiento persistente de tokens.

Antes de usar el Web Playback SDK en producción, revisa los [términos y políticas de Spotify](https://developer.spotify.com/terms). Spotify indica que el SDK puede requerir aprobación previa por escrito para proyectos comerciales.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
