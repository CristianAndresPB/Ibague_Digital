# Backend Ibagué Digital (SQLite + JWT + bcrypt)

## Quick start (local)
1. Copiar `.env.example` a `.env` y ajustar variables si lo deseas.
2. `cd backend`
3. `npm install`
4. `npm start`

## Docker
Construir imagen y levantar servicio:
```
cd backend
docker build -t ibague-backend .
docker-compose up
```

## Tests
Asegúrate de que el servidor esté corriendo en `localhost:3000`, luego:
```
cd backend
npm test
```

## Notes
- El usuario admin por defecto está en `users.json`. La contraseña original `ibague2025` fue reemplazada por un hash bcrypt.
- Para registrar nuevos usuarios (solo admin), iniciar sesión como admin y usar `POST /api/auth/register` con el token JWT en `Authorization: Bearer <token>`.
\n\n## Sincronización automática (SQLite -> PostgreSQL)\nEl proyecto incluye un script que sincroniza todas las tablas de SQLite hacia PostgreSQL, creando tablas si no existen y manteniendo espejo (inserta nuevos registros y elimina los que ya no existen en SQLite).\nConfigura las variables de entorno en `.env` y luego ejecuta:\n```bash\ncd backend\nnpm run sync\n```\nPara ejecutar una sola vez:\n```
node backend/scripts/sync_sqlite_to_postgres.js --once
```
