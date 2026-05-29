const express = require("express");
const cors = require("cors");
const path = require("path");
const supabase = require("./configsql/supabase_notas.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "publico")));
app.get("/index.js", (_req, res) => res.sendFile(path.join(__dirname, "index.js")));

app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "login.html")));
app.get("/login.html", (_req, res) => res.sendFile(path.join(__dirname, "login.html")));
app.get("/signup.html", (_req, res) => res.sendFile(path.join(__dirname, "signup.html")));
app.get("/index.html", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/register", async (req, res) => {
  const { nombreUser, emailUser, contraUser } = req.body;

  if (!nombreUser || !emailUser || !contraUser) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  const existe = await supabase
    .from("usuarios")
    .select("id_usuarios")
    .eq("emailUser", emailUser)
    .limit(1);

  if (existe.error) {
    return res.status(500).json({ error: "Error del servidor." });
  }

  if (existe.data.length > 0) {
    return res.status(409).json({ error: "El correo ya esta registrado." });
  }

  const nuevoUsuario = await supabase
    .from("usuarios")
    .insert({
      nombreUser,
      emailUser,
      contraUser,
      estado: 1
    })
    .select("id_usuarios")
    .single();

  if (nuevoUsuario.error) {
    return res.status(500).json({ error: "Error al crear el usuario." });
  }

  res.status(201).json({ message: "Usuario creado.", id: nuevoUsuario.data.id_usuarios });
});

app.post("/api/login", async (req, res) => {
  const { emailUser, contraUser } = req.body;

  if (!emailUser || !contraUser) {
    return res.status(400).json({ error: "Correo y contrasena son obligatorios." });
  }

  const usuario = await supabase
    .from("usuarios")
    .select("id_usuarios,nombreUser,emailUser")
    .eq("emailUser", emailUser)
    .eq("contraUser", contraUser)
    .eq("estado", 1)
    .maybeSingle();

  if (usuario.error) {
    return res.status(500).json({ error: "Error del servidor." });
  }

  if (!usuario.data) {
    return res.status(401).json({ error: "Correo o contrasena incorrectos." });
  }

  res.json({ usuario: usuario.data });
});

app.get("/api/notas", async (req, res) => {
  const { id_usuario } = req.query;
  if (!id_usuario) {
    return res.status(400).json({ error: "Falta id_usuario." });
  }

  const notas = await supabase
    .from("notas")
    .select("id_nota,titulo,contenido,color,fecha_creacion")
    .eq("id_usuario", id_usuario)
    .eq("estado", 1)
    .order("fecha_creacion", { ascending: false });

  if (notas.error) {
    return res.status(500).json({ error: "Error al obtener las notas." });
  }

  res.json(notas.data);
});

app.get("/api/notas/archivadas", async (req, res) => {
  const { id_usuario } = req.query;
  if (!id_usuario) {
    return res.status(400).json({ error: "Falta id_usuario." });
  }

  const notas = await supabase
    .from("notas")
    .select("id_nota,titulo,contenido,color,fecha_creacion")
    .eq("id_usuario", id_usuario)
    .eq("estado", 0)
    .order("fecha_creacion", { ascending: false });

  if (notas.error) {
    return res.status(500).json({ error: "Error al obtener las archivadas." });
  }

  res.json(notas.data);
});

app.post("/api/notas", async (req, res) => {
  const { id_usuario, titulo, contenido, color } = req.body;

  if (!id_usuario || !titulo || !contenido) {
    return res.status(400).json({ error: "id_usuario, titulo y contenido son obligatorios." });
  }

  const nota = await supabase
    .from("notas")
    .insert({
      id_usuario,
      titulo,
      contenido,
      color: color || "#e8f4ff",
      estado: 1
    })
    .select("id_nota")
    .single();

  if (nota.error) {
    return res.status(500).json({ error: "Error al crear la nota." });
  }

  res.status(201).json({ message: "Nota creada.", id: nota.data.id_nota });
});

app.patch("/api/notas/:id/archivar", async (req, res) => {
  const nota = await supabase
    .from("notas")
    .update({ estado: 0 })
    .eq("id_nota", req.params.id);

  if (nota.error) {
    return res.status(500).json({ error: "Error al archivar la nota." });
  }

  res.json({ message: "Nota archivada." });
});

app.patch("/api/notas/:id/restaurar", async (req, res) => {
  const nota = await supabase
    .from("notas")
    .update({ estado: 1 })
    .eq("id_nota", req.params.id);

  if (nota.error) {
    return res.status(500).json({ error: "Error al restaurar la nota." });
  }

  res.json({ message: "Nota restaurada." });
});

app.delete("/api/notas/:id", async (req, res) => {
  const nota = await supabase
    .from("notas")
    .delete()
    .eq("id_nota", req.params.id);

  if (nota.error) {
    return res.status(500).json({ error: "Error al eliminar la nota." });
  }

  res.json({ message: "Nota eliminada." });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log("Servidor en http://localhost:" + PORT));
}

module.exports = app;
