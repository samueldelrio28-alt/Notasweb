# NotasWeb

Aplicacion de notas con backend Node.js y Supabase.

## Instalacion

```
npm install
npm start
```

`http://localhost:3000`

## Base de datos

El servidor usa Supabase como base de datos.

1. Crea un proyecto en Supabase.
2. Abre SQL Editor.
3. Ejecuta el archivo `supabase.sql`.
4. En Vercel agrega estas variables de entorno si quieres ocultar las llaves:

```
SUPABASE_URL=https://ceazbepzihcvyqzmwqrf.supabase.co
SUPABASE_ANON_KEY=sb_publishable_EKhpJl2AIbQLlmJSozfjlQ_nx7eXhfN
```

Si no agregas variables, el proyecto ya trae esos datos en `configsql/supabase_notas.js`.

## API

- `POST /api/register` - Registrar usuario
- `POST /api/login` - Iniciar sesion
- `GET /api/notas?id_usuario=X` - Obtener notas activas
- `GET /api/notas/archivadas?id_usuario=X` - Obtener notas archivadas
- `POST /api/notas` - Crear nota
- `PATCH /api/notas/:id/archivar` - Archivar nota
- `PATCH /api/notas/:id/restaurar` - Restaurar nota archivada
- `DELETE /api/notas/:id` - Eliminar nota permanentemente
