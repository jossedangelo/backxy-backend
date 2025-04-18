// – Carga variables de entorno (.env) –
require('dotenv').config();

// – Importaciones –
const express     = require('express');
const cors        = require('cors');
const pool        = require('./db');          // tu pool MySQL
const authRoutes  = require('./authRoutes');  // rutas de registro/login
const verifyToken = require('./verifyToken'); // middleware JWT

// – App y middlewares –
const app = express();
app.use(cors());
app.use(express.json());

// – Sirve estáticos de /public –
// (si no usas carpeta public, puedes eliminar esta línea)
app.use(express.static('public'));

// – Rutas de autenticación –
// Endpoints: POST /api/auth/register, POST /api/auth/login
app.use('/api/auth', authRoutes);

// – Ruta protegida de ejemplo –
// Devuelve el payload del JWT si el token es válido
app.get(
  '/api/profile',
  verifyToken,
  (req, res) => {
    res.json({
      message: 'Acceso autorizado 🔒',
      user: req.user   // { userId, email, iat, exp }
    });
  }
);

// – Endpoints públicos de prueba –

// 1) Leer tabla `prueba`
app.get('/api/testdb', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM prueba;');
    res.json({ rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falló la consulta a la DB' });
  }
});

// 2) Listar usuarios (id, email, username)
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, username FROM users;'
    );
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falló la consulta a usuarios' });
  }
});

// – Sanity check –
app.get('/', (req, res) => {
  res.send('API Backxy funcionando correctamente!');
});

// – Iniciar servidor –
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

