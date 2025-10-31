// app.js
// Servidor Express + SQLite para la encuesta (Ibagué Digital)
// Ejecutar: node app.js

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Asegurar UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  next();
});

// Middleware para leer bodies de formularios
app.use(express.urlencoded({ extended: false }));
// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Carpeta para la BD
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, 'respuestas.db');

// Conexión persistente a SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
    process.exit(1);
  }
  console.log('Conectado a SQLite en', DB_PATH);
});

// Crear tabla si no existe
const CREAR_TABLA_SQL = `
CREATE TABLE IF NOT EXISTS respuestas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  edad INTEGER NOT NULL,
  plataforma TEXT NOT NULL
);
`;

db.run(CREAR_TABLA_SQL, (err) => {
  if (err) console.error('Error creando la tabla respuestas:', err.message);
});

// Ruta GET / -> sirve el formulario (index.html en /public)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta POST /encuesta -> recibe y guarda los datos
app.post('/encuesta', (req, res) => {
  try {
    const { nombre, edad, plataforma } = req.body || {};
    if (!nombre || !edad || !plataforma) {
      res.status(400).send('<h2>Faltan datos requeridos. <a href="/">Volver</a></h2>');
      return;
    }

    const insertarSQL = `INSERT INTO respuestas (nombre, edad, plataforma) VALUES (?, ?, ?)`;
    db.run(insertarSQL, [nombre.trim(), parseInt(edad, 10), plataforma], function (err) {
      if (err) {
        console.error('Error insertando respuesta:', err.message);
        res.status(500).send('<h2>Error guardando la respuesta. Intente de nuevo.</h2>');
        return;
      }

      // Respuesta HTML con los resultados
      const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Respuesta guardada</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;max-width:720px;margin:auto}</style>
</head>
<body>
  <h1>Gracias por participar</h1>
  <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
  <p><strong>Edad:</strong> ${escapeHtml(String(edad))}</p>
  <p><strong>Plataforma más usada:</strong> ${escapeHtml(plataforma)}</p>
  <p>ID registro: ${this.lastID}</p>
  <p><a href="/">Enviar otra respuesta</a> — <a href="/resultados">Ver resultados</a></p>
</body>
</html>`;

      res.send(html);
    });
  } catch (e) {
    console.error('Error en /encuesta:', e);
    res.status(500).send('<h2>Error interno. Intente de nuevo.</h2>');
  }
});

// Ruta GET /resultados -> muestra todas las respuestas en una tabla HTML
app.get('/resultados', (req, res) => {
  const sql = 'SELECT id, nombre, edad, plataforma FROM respuestas ORDER BY id DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error consultando resultados:', err.message);
      res.status(500).send('<h2>Error obteniendo resultados.</h2>');
      return;
    }

    let rowsHtml = rows.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${escapeHtml(r.nombre)}</td>
        <td>${escapeHtml(String(r.edad))}</td>
        <td>${escapeHtml(r.plataforma)}</td>
      </tr>
    `).join('\n');

    if (!rowsHtml) rowsHtml = '<tr><td colspan="4">No hay respuestas registradas aún.</td></tr>';

    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Resultados - Encuesta</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:20px;max-width:900px;margin:auto}
    table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}
    th{background:#f4f4f4}
  </style>
</head>
<body>
  <h1>Resultados de la encuesta</h1>
  <p><a href="/">Volver al formulario</a></p>
  <table>
    <thead>
      <tr><th>ID</th><th>Nombre</th><th>Edad</th><th>Plataforma</th></tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;

    res.send(html);
  });
});

// Helper para escapar HTML básico
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Manejo de errores general
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('<h2>Error interno del servidor.</h2>');
});

// Cerrar conexión DB al terminar
process.on('SIGINT', () => {
  console.log('\nCerrando base de datos...');
  db.close((err) => {
    if (err) console.error(err.message);
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT} (UTF-8).`);
});
