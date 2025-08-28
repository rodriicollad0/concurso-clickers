# Quiz Backend

Backend del sistema de concurso con clickers desarrollado con NestJS.

## Configuración

### Variables de Entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` con tus credenciales:
   - `DB_PASSWORD`: Contraseña de tu base de datos PostgreSQL
   - `JWT_SECRET`: Clave secreta para JWT (cámbiala en producción)
   - Otras configuraciones según tu entorno

### Base de Datos

Este proyecto usa SQLite para desarrollo local y PostgreSQL para producción.

**Importante:** Los archivos de base de datos (*.db, *.sqlite) no se suben al repositorio por seguridad.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run start:dev
```

## Producción

```bash
npm run build
npm run start:prod
```

## Seguridad

- ❌ **NUNCA** subas archivos `.env` al repositorio
- ❌ **NUNCA** subas archivos de base de datos al repositorio
- ✅ Usa `.env.example` para documentar las variables necesarias
- ✅ Cambia las claves secretas en producción
