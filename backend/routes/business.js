const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')
const logActivity = require('../logActivity')
const logger = require('../logger')

const router = express.Router()

// Sanitización: elimina tags HTML
function sanitize(str) {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

// Normalizar horarios: soporta JSON nativo (objeto) y TEXT legado (string)
function parseHorarios(val) {
  if (!val) return null
  if (typeof val === 'object') return val  // JSON nativo de MySQL
  try { return JSON.parse(val) } catch { return null }
}

// GET /api/business/public/:userId — datos públicos de un negocio por user_id
router.get('/public/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM businesses WHERE user_id = ?', [req.params.userId])
    if (rows.length === 0) return res.json({ business: null })
    const business = rows[0]
    business.horarios = parseHorarios(business.horarios)
    res.json({ business })
  } catch (err) {
    logger.error('Error al obtener negocio público', { error: err.message })
    res.status(500).json({ error: 'Error al obtener negocio' })
  }
})

// GET /api/business — obtener datos del negocio del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM businesses WHERE user_id = ?', [req.userId])

    if (rows.length === 0) {
      return res.json({ business: null })
    }

    const business = rows[0]
    business.horarios = parseHorarios(business.horarios)
    res.json({ business })
  } catch (err) {
    logger.error('Error al obtener negocio', { error: err.message })
    res.status(500).json({ error: 'Error al obtener datos del negocio' })
  }
})

// GET /api/business/:userId — obtener datos del negocio por userId (público)
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, u.plan_id FROM businesses b JOIN users u ON b.user_id = u.id WHERE b.user_id = ?`,
      [req.params.userId]
    )

    if (rows.length === 0) {
      return res.json({ business: null })
    }

    const business = rows[0]
    business.horarios = parseHorarios(business.horarios)
    res.json({ business })
  } catch (err) {
    logger.error('Error al obtener negocio público', { error: err.message })
    res.status(500).json({ error: 'Error al obtener datos del negocio' })
  }
})

// POST /api/business — crear o actualizar datos del negocio
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre_negocio, slogan, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios } = req.body

    // Validar slogan: máximo 10 palabras
    if (slogan) {
      const words = slogan.trim().split(/\s+/).filter(Boolean)
      if (words.length > 10) {
        return res.status(400).json({ error: 'El slogan debe tener máximo 10 palabras' })
      }
    }

    // Validar URLs de redes sociales
    if (facebook && !/^https?:\/\/(www\.)?(facebook\.com|fb\.com)\//i.test(facebook)) {
      return res.status(400).json({ error: 'La URL de Facebook debe ser un enlace válido de facebook.com' })
    }
    if (instagram && !/^https?:\/\/(www\.)?instagram\.com\//i.test(instagram) && !/^@[\w.]+$/.test(instagram)) {
      return res.status(400).json({ error: 'Instagram debe ser una URL de instagram.com o un @usuario' })
    }

    // horarios: JSON nativo en Fase 1 — almacenar como JSON string (MySQL convierte a JSON nativo)
    const horariosJson = horarios ? JSON.stringify(horarios) : null

    const [existing] = await pool.query('SELECT id FROM businesses WHERE user_id = ?', [req.userId])

    if (existing.length > 0) {
      await pool.query(
        `UPDATE businesses
         SET nombre_negocio=?, slogan=?, descripcion=?, direccion=?, ubicacion=?,
             whatsapp=?, telefono=?, correo=?, facebook=?, instagram=?, horarios=?
         WHERE user_id=?`,
        [sanitize(nombre_negocio) || null, sanitize(slogan) || null, sanitize(descripcion) || null,
         sanitize(direccion) || null, sanitize(ubicacion) || null,
         sanitize(whatsapp) || null, sanitize(telefono) || null, sanitize(correo) || null,
         facebook || null, instagram || null, horariosJson, req.userId]
      )
    } else {
      await pool.query(
        `INSERT INTO businesses
           (user_id, nombre_negocio, slogan, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios, tipo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'general')`,
        [req.userId, sanitize(nombre_negocio) || null, sanitize(slogan) || null, sanitize(descripcion) || null,
         sanitize(direccion) || null, sanitize(ubicacion) || null,
         sanitize(whatsapp) || null, sanitize(telefono) || null, sanitize(correo) || null,
         facebook || null, instagram || null, horariosJson]
      )
    }

    await logActivity(req.userId, existing.length > 0 ? 'editar' : 'crear', 'business', null, { nombre_negocio })
    res.json({ message: 'Datos del negocio guardados' })
  } catch (err) {
    logger.error('Error al guardar negocio', { error: err.message })
    res.status(500).json({ error: 'Error al guardar datos del negocio' })
  }
})

module.exports = router
