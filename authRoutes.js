// authRoutes.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('./db');       // 👉 ajusta la ruta si tu db.js está en otro sitio
const router  = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }
    // 1) ¿Email ya existe?
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }
    // 2) Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    // 3) Inserta el nuevo usuario
    const [result] = await pool.query(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashedPassword]
    );
    // 4) Devuelve éxito con el nuevo userId
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      userId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan datos necesarios.' });
    }
    // 1) Busca usuario por email
    const [rows] = await pool.query(
      'SELECT id, password FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    const user = rows[0];
    // 2) Compara contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }
    // 3) Genera JWT
    const token = jwt.sign(
      { userId: user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    // 4) Devuelve éxito con token
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;

