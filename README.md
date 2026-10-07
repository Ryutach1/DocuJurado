# DocuJurado

DocuJurado es un prototipo de aplicación web para apoyar la preparación de documentos jurídicos relacionados con casos de pensión alimenticia. Guía a la persona usuaria por un formulario, reúne los datos del caso y presenta una vista de revisión.

## ¿Para qué sirve?

- Capturar información de la parte demandante, demandada, hijos y gastos.
- Revisar los datos del caso antes de preparar el escrito.
- Usar el reproductor flotante de Spotify de forma opcional.

El proyecto se encuentra en desarrollo. La generación final del documento Word y otras funciones jurídicas pueden estar incompletas o cambiar entre versiones.

## ¿Cómo se utiliza?

### Aplicación publicada

La versión desplegada está disponible en:

**[Abrir DocuJurado en GitHub Pages](https://ryutach1.github.io/DocuJurado/)**

Completa los pasos del formulario y revisa la información antes de continuar. El reproductor de música es opcional; para reproducir contenido de una cuenta Spotify se requiere autorizar el acceso y cumplir los requisitos del reproductor de Spotify.

### Ejecutar localmente

Requisitos: Node.js compatible con Angular 21 y npm.

```bash
npm ci
npm start
```

Abre `http://localhost:4200/` en el navegador. Para compilar y ejecutar las pruebas:

```bash
npm run build
npm test
```

## ¿Quiénes pueden acceder?

La versión de GitHub Pages es pública y puede abrirla cualquier persona con el enlace; no requiere una cuenta de DocuJurado. No hay autenticación de usuarios ni almacenamiento central de expedientes. La información del formulario se conserva en la sesión de la aplicación, por lo que no se debe tratar como un sistema de archivo seguro.

Utiliza datos ficticios o anonimizados al probar. No publiques expedientes, documentos, identificaciones, direcciones, datos bancarios ni otra información personal en GitHub.

## Privacidad y servicios externos

DocuJurado es una aplicación estática. No incluye un servidor propio para guardar los casos. El reproductor puede conectarse directamente con Spotify y requiere internet; al autorizarlo, Spotify aplica sus propios permisos y condiciones. No se debe añadir un Client Secret de Spotify ni credenciales de usuarios al repositorio.

## Despliegue en GitHub Pages

El workflow de GitHub Actions compila Angular para la ruta `/DocuJurado/` y publica únicamente `dist/DocuJurado/browser`. Para activarlo en el repositorio, selecciona **Settings → Pages → Build and deployment → Source: GitHub Actions**. Los cambios enviados a `master` ejecutan el despliegue automáticamente; también se puede iniciar manualmente desde la pestaña **Actions**.

## Tecnologías

Angular 21, TypeScript, formularios reactivos, Bootstrap y Vitest.
