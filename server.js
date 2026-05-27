const express    = require("express");
const cors       = require("cors");
const path       = require("path");
const conexion   = require('./configsql/db_notas.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "publico")));
app.use(express.static(path.join(__dirname, "vistas")));

// Rutas de vistas
app.get("/",           (_req, res) => res.sendFile(path.join(__dirname, "vistas", "login.html")));
app.get("/login.html", (_req, res) => res.sendFile(path.join(__dirname, "vistas", "login.html")));
app.get("/index.html", (_req, res) => res.sendFile(path.join(__dirname, "vistas", "index.html")));

// AUTH
// POST /api/register
app.post("/api/register", (req, res) => {
  const { nombreUser, emailUser, contraUser } = req.body;

  if (!nombreUser || !emailUser || !contraUser)
    return res.status(400).json({ error: "Todos los campos son obligatorios." });

  const checkSql = "SELECT id_usuarios FROM usuarios WHERE emailUser = ?";
  conexion.query(checkSql, [emailUser], (err, rows) => {
    if (err)       return res.status(500).json({ error: "Error del servidor." });
    if (rows.length) return res.status(409).json({ error: "El correo ya está registrado." });

    const sql = "INSERT INTO usuarios (nombreUser, emailUser, contraUser, fecha_registroUser, estado) VALUES (?, ?, ?, NOW(), 1)";
    conexion.query(sql, [nombreUser, emailUser, contraUser], (err2, result) => {
      if (err2) return res.status(500).json({ error: "Error al crear el usuario." });
      res.status(201).json({ message: "Usuario creado.", id: result.insertId });
    });
  });
});

// POST /api/login
app.post("/api/login", (req, res) => {
  const { emailUser, contraUser } = req.body;

  if (!emailUser || !contraUser)
    return res.status(400).json({ error: "Correo y contraseña son obligatorios." });

  const sql = "SELECT id_usuarios, nombreUser, emailUser FROM usuarios WHERE emailUser = ? AND contraUser = ? AND estado = 1";
  conexion.query(sql, [emailUser, contraUser], (err, rows) => {
    if (err)         return res.status(500).json({ error: "Error del servidor." });
    if (!rows.length) return res.status(401).json({ error: "Correo o contraseña incorrectos." });

    res.json({ usuario: rows[0] });
  });
});

// NOTAS
// GET /api/notas?id_usuario=X
app.get("/api/notas", (req, res) => {
  const { id_usuario } = req.query;
  if (!id_usuario) return res.status(400).json({ error: "Falta id_usuario." });

  const sql = "SELECT id_nota, titulo, contenido, fecha_creacion FROM notas WHERE id_usuario = ? AND estado = 1 ORDER BY fecha_creacion DESC";
  conexion.query(sql, [id_usuario], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener las notas." });
    res.json(rows);
  });
});

// GET /api/notas/archivadas?id_usuario=X
app.get("/api/notas/archivadas", (req, res) => {
  const { id_usuario } = req.query;
  if (!id_usuario) return res.status(400).json({ error: "Falta id_usuario." });

  const sql = "SELECT id_nota, titulo, contenido, fecha_creacion FROM notas WHERE id_usuario = ? AND estado = 0 ORDER BY fecha_creacion DESC";
  conexion.query(sql, [id_usuario], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener las archivadas." });
    res.json(rows);
  });
});

// POST /api/notas
app.post("/api/notas", (req, res) => {
  const { id_usuario, titulo, contenido } = req.body;

  if (!id_usuario || !titulo || !contenido)
    return res.status(400).json({ error: "id_usuario, título y contenido son obligatorios." });

  const sql = "INSERT INTO notas (id_usuario, titulo, contenido, fecha_creacion, estado) VALUES (?, ?, ?, NOW(), 1)";
  conexion.query(sql, [id_usuario, titulo, contenido], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al crear la nota." });
    res.status(201).json({ message: "Nota creada.", id: result.insertId });
  });
});

// PATCH /api/notas/:id/archivar
app.patch("/api/notas/:id/archivar", (req, res) => {
  conexion.query("UPDATE notas SET estado = 0 WHERE id_nota = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Error al archivar la nota." });
    res.json({ message: "Nota archivada." });
  });
});

// PATCH /api/notas/:id/restaurar
app.patch("/api/notas/:id/restaurar", (req, res) => {
  conexion.query("UPDATE notas SET estado = 1 WHERE id_nota = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Error al restaurar la nota." });
    res.json({ message: "Nota restaurada." });
  });
});

// DELETE /api/notas/:id
app.delete("/api/notas/:id", (req, res) => {
  conexion.query("DELETE FROM notas WHERE id_nota = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Error al eliminar la nota." });
    res.json({ message: "Nota eliminada." });
  });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`✓ Servidor en http://localhost:${PORT}`));
}

module.exports = app;