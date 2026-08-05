# Torre de Control DM2 ECICEP APS

Frontend React + Vite para visualizar una torre de control de priorizacion clinica DM2 en APS.

## Requisitos

- Node.js 20 o superior
- npm

## Ejecutar en local

1. Instala dependencias:
   `npm install`
2. Inicia el servidor de desarrollo:
   `npm run dev`

## Scripts

- `npm run dev`: inicia Vite en el puerto 3000.
- `npm run build`: genera la compilacion de produccion.
- `npm run lint`: ejecuta el chequeo de TypeScript sin emitir archivos.
- `npm run clean`: elimina la carpeta `dist`.

## Estructura util

- `src/`: aplicacion React.
- `src/data/mockPatients.ts`: datos mock usados por la interfaz.
- `src/lib/roles.ts`: reglas de visibilidad y permisos por perfil.

Actualmente el frontend no requiere variables de entorno para ejecutarse.
