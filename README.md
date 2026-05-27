# NotasWeb

Aplicación de notas con backend Node.js y MySQL.

## Instalación

```
npm install
npm start
```

`http://localhost:3000`

## Base de datos

El servidor espera una base de datos MySQL en `localhost:3306` con el nombre `notasweb_db`.

- Host: `127.0.0.1`
- Puerto: `3306`
- Usuario: `root`
- Contraseña: "";

Para cambiar la configuración, usa variables de entorno:
```
DB_HOST=localhost DB_USER=root DB_PASSWORD='' DB_NAME=notasweb_db npm start
```

## API

- `POST /api/register` - Registrar usuario
- `POST /api/login` - Iniciar sesión
- `GET /api/notas?id_usuario=X` - Obtener notas activas
- `GET /api/notas/archivadas?id_usuario=X` - Obtener notas archivadas
- `POST /api/notas` - Crear nota
- `PATCH /api/notas/:id/archivar` - Archivar nota
- `PATCH /api/notas/:id/restaurar` - Restaurar nota archivada
- `DELETE /api/notas/:id` - Eliminar nota permanentemente
