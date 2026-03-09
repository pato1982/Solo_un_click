const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'soloaunclick_secret_2026'

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, telefono, comuna, direccion, tipo_cuenta, vende_productos, ofrece_servicios, ofrece_arriendos, plan_id } = req.body

    // Verificar si el email ya existe
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    // Encriptar password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Validar plan_id (1, 2 o 3)
    const selectedPlan = [1, 2, 3].includes(plan_id) ? plan_id : 1

    // Insertar usuario
    const [result] = await pool.query(
      `INSERT INTO users (plan_id, tipo_cuenta, nombre, email, password, telefono, comuna, direccion, vende_productos, ofrece_servicios, ofrece_arriendos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        selectedPlan,
        tipo_cuenta || 'general',
        nombre,
        email,
        hashedPassword,
        telefono || null,
        comuna || null,
        direccion || null,
        vende_productos ? 1 : 0,
        ofrece_servicios ? 1 : 0,
        ofrece_arriendos ? 1 : 0
      ]
    )

    // Generar token
    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      message: 'Usuario registrado',
      token,
      user: { id: result.insertId, nombre, email, tipo_cuenta: tipo_cuenta || 'general', plan_id: selectedPlan, vende_productos: vende_productos ? 1 : 0, ofrece_servicios: ofrece_servicios ? 1 : 0, ofrece_arriendos: ofrece_arriendos ? 1 : 0 }
    })
  } catch (err) {
    console.error('Error en registro:', err)
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Buscar usuario
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' })
    }

    const user = rows[0]

    // Verificar que esté activo
    if (!user.activo) {
      return res.status(403).json({ error: 'Cuenta desactivada' })
    }

    // Verificar password
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' })
    }

    // Generar token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        tipo_cuenta: user.tipo_cuenta,
        plan_id: user.plan_id,
        vende_productos: user.vende_productos,
        ofrece_servicios: user.ofrece_servicios,
        ofrece_arriendos: user.ofrece_arriendos
      }
    })
  } catch (err) {
    console.error('Error en login:', err)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

// Middleware para verificar token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

// GET /api/auth/me — obtener datos del usuario autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.tipo_cuenta, u.telefono, u.comuna,
              u.vende_productos, u.ofrece_servicios, u.ofrece_arriendos,
              u.plan_id, u.activo, u.created_at,
              p.nombre as plan_nombre, p.max_listings, p.tiene_pagina,
              p.tiene_destacados, p.tiene_estadisticas
       FROM users u
       JOIN plans p ON u.plan_id = p.id
       WHERE u.id = ?`,
      [req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({ user: rows[0] })
  } catch (err) {
    console.error('Error en /me:', err)
    res.status(500).json({ error: 'Error al obtener usuario' })
  }
})

module.exports = router
module.exports.authMiddleware = authMiddleware
