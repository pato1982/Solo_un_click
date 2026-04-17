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

// ============================================================
// FASE 2 — imagenes, categorias e imagenes_crop son ahora tipo JSON nativo.
// MySQL los retorna ya como objetos/arrays — no se necesita JSON.parse().
// parseJson() mantiene compatibilidad con filas legado (TEXT) si las hubiera.
// ============================================================
function parseJson(val, fallback = []) {
  if (val === null || val === undefined) return fallback
  if (typeof val === 'object') return val   // JSON nativo de MySQL 8
  try { return JSON.parse(val) } catch { return fallback }
}

function normalizarPortada(row) {
  row.imagenes      = parseJson(row.imagenes, [])
  row.categorias    = parseJson(row.categorias, [])
  row.imagenes_crop = parseJson(row.imagenes_crop, [])
  if (row.horarios !== undefined) row.horarios = parseJson(row.horarios, [])
  return row
}

// GET /api/portada — obtener portada del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_portada WHERE user_id = ? LIMIT 1',
      [req.userId]
    )

    const portada = rows[0] ? normalizarPortada(rows[0]) : null
    res.json({ portada })
  } catch (err) {
    logger.error('Error al obtener portada', { error: err.message })
    res.status(500).json({ error: 'Error al obtener portada' })
  }
})

// GET /api/portada/public — obtener todas las portadas activas con datos del negocio y plan (público)
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.user_id, p.descripcion, p.imagenes, p.imagenes_crop, p.categorias,
              b.nombre_negocio, b.direccion, b.whatsapp, b.telefono, b.correo, b.facebook, b.instagram, b.horarios,
              u.plan_id
       FROM turismo_portada p
       LEFT JOIN businesses b ON b.user_id = p.user_id
       LEFT JOIN users u ON u.id = p.user_id
       WHERE p.activo = 1
       ORDER BY b.nombre_negocio ASC
       LIMIT 200`
    )

    res.json({ portadas: rows.map(normalizarPortada) })
  } catch (err) {
    logger.error('Error al obtener portadas públicas', { error: err.message })
    res.status(500).json({ error: 'Error al obtener portadas' })
  }
})

// POST /api/portada — crear portada
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, imagenes, categorias } = req.body

    const imagenesJson = imagenes ? JSON.stringify(imagenes) : '[]'
    const categoriasJson = categorias ? JSON.stringify(categorias) : '[]'

    // INSERT con ON DUPLICATE KEY para evitar race condition (user_id es UNIQUE)
    const [result] = await pool.query(
      `INSERT INTO turismo_portada (user_id, nombre, descripcion, imagenes, categorias)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion), imagenes=VALUES(imagenes), categorias=VALUES(categorias)`,
      [req.userId, sanitize(nombre) || null, sanitize(descripcion) || null, imagenesJson, categoriasJson]
    )

    await logActivity(req.userId, 'crear', 'portada', result.insertId, { nombre })
    res.status(201).json({ message: 'Portada creada', id: result.insertId })
  } catch (err) {
    logger.error('Error al crear portada', { error: err.message })
    res.status(500).json({ error: 'Error al crear portada' })
  }
})

// PUT /api/portada/:id — actualizar portada
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, imagenes, categorias } = req.body

    const imagenesJson = imagenes ? JSON.stringify(imagenes) : '[]'
    const categoriasJson = categorias ? JSON.stringify(categorias) : '[]'

    const [result] = await pool.query(
      `UPDATE turismo_portada SET nombre=?, descripcion=?, imagenes=?, categorias=?
       WHERE id=? AND user_id=?`,
      [sanitize(nombre) || null, sanitize(descripcion) || null, imagenesJson, categoriasJson, req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Portada no encontrada' })
    }

    await logActivity(req.userId, 'editar', 'portada', parseInt(req.params.id), { nombre })
    res.json({ message: 'Portada actualizada' })
  } catch (err) {
    logger.error('Error al actualizar portada', { error: err.message })
    res.status(500).json({ error: 'Error al actualizar portada' })
  }
})

// DELETE /api/portada/:id — eliminar portada (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE turismo_portada SET activo = 0 WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Portada no encontrada' })
    }

    await logActivity(req.userId, 'eliminar', 'portada', parseInt(req.params.id))
    res.json({ message: 'Portada eliminada' })
  } catch (err) {
    logger.error('Error al eliminar portada', { error: err.message })
    res.status(500).json({ error: 'Error al eliminar portada' })
  }
})

// PATCH /api/portada/:id/crop — guardar encuadre de imágenes
router.patch('/:id/crop', authMiddleware, async (req, res) => {
  try {
    const { imagenes_crop } = req.body
    await pool.query(
      'UPDATE turismo_portada SET imagenes_crop=? WHERE id=? AND user_id=?',
      [JSON.stringify(imagenes_crop || []), req.params.id, req.userId]
    )
    res.json({ message: 'Encuadre guardado' })
  } catch (err) {
    logger.error('Error al guardar encuadre', { error: err.message })
    res.status(500).json({ error: 'Error al guardar encuadre' })
  }
})

// PATCH /api/portada/:id/toggle — activar/desactivar portada
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE turismo_portada SET activo = NOT activo WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Portada no encontrada' })
    }

    res.json({ message: 'Estado de la portada actualizado' })
  } catch (err) {
    logger.error('Error al cambiar estado de la portada', { error: err.message })
    res.status(500).json({ error: 'Error al cambiar estado de la portada' })
  }
})

module.exports = router
