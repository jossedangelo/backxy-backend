// authRoutes.js
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('./db');           // tu conexión MySQL
const { body, validationResult } = require('express-validator');

// 1) Registro de usuario
router.post(
  '/register',
  // Validación mínima de datos
  body('email').isEmail(),
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    // 1.1) Revisa errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, username, password } = req.body;
    try {
      // 1.2) Hashea la contraseña
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // 1.3) Inserta en la BD
      const [result] = await pool.query(
        'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
        [email, username, hash]
      );

      // 1.4) Genera un JWT
      const token = jwt.sign(
        { userId: result.insertId, email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(201).json({ token });
    } catch (err) {
      console.error(err);
      // detecta duplicados (email/username único)
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email o usuario ya existe' });
      }
      res.status(500).json({ error: 'Error en el registro' });
    }
  }
);

// 2) Login de usuario
router.post(
  '/login',
  body('email').isEmail(),
  body('password').exists(),
  async (req, res) => {
    // 2.1) Validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      // 2.2) Busca al usuario
      const [rows] = await pool.query(
        'SELECT id, password FROM users WHERE email = ?',
        [email]
      );
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      const user = rows[0];

      // 2.3) Compara contraseñas
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // 2.4) Emite JWT
      const token = jwt.sign(
        { userId: user.id, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      res.json({ token });
    } catch (err) {
      console.error('Error en register:', err);
      res.status(500).json({ error: 'Error en el login' });
    }
  }
);

module.exports = router;

