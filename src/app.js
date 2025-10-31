require('dotenv').config();
const express = require('express');
const cors = require('cors');
const UsuarioController = require('../controllers/usuarioController');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// rutas API
app.use('/api/usuarios', UsuarioController.getAll);
app.use('/api/encuestas', encuestaRoutes);
app.use('/api/preguntas', preguntaRoutes);
app.use('/api/opciones', opcionRoutes);
app.use('/api/respuestas', respuestaRoutes);
app.use('/api/admins', adminRoutes);

// manejador de errores básico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
});

app.listen(port, () => console.log(`Backend corriendo en http://localhost:${port}`));