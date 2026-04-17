const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')
const { requirePlan } = require('../middlewares/planMiddleware')
const logger = require('../logger')

const router = express.Router()

// Sanitización: elimina tags HTML
function sanitize(str) {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

// ============================================================
// FASE 2 — crop_superior y crop_inferior son ahora tipo JSON nativo.
// parseJson() mantiene compatibilidad con filas legado (TEXT) si las hubiera.
// ============================================================
function parseJson(val, fallback = null) {
  if (val === null || val === undefined) return fallback
  if (typeof val === 'object') return val   // JSON nativo de MySQL 8
  try { return JSON.parse(val) } catch { return fallback }
}

function normalizarPagina(row) {
  row.crop_superior = parseJson(row.crop_superior, null)
  row.crop_inferior = parseJson(row.crop_inferior, null)
  return row
}

// GET /api/pagina — obtener página premium del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_pagina WHERE user_id = ? LIMIT 1',
      [req.userId]
    )
    const pagina = rows[0] ? normalizarPagina(rows[0]) : null
    res.json({ pagina })
  } catch (err) {
    logger.error('Error al obtener página', { error: err.message })
    res.status(500).json({ error: 'Error al obtener página' })
  }
})

// GET /api/pagina/public/:userId — obtener página premium de un usuario (público)
router.get('/public/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_pagina WHERE user_id = ? LIMIT 1',
      [req.params.userId]
    )
    const pagina = rows[0] ? normalizarPagina(rows[0]) : null
    res.json({ pagina })
  } catch (err) {
    logger.error('Error al obtener página pública', { error: err.message })
    res.status(500).json({ error: 'Error al obtener página' })
  }
})

// POST /api/pagina — crear o actualizar página premium
router.post('/', authMiddleware, requirePlan(3), async (req, res) => {
  try {
    const { titulo_superior, texto_superior, imagen_superior, titulo_inferior, texto_inferior, imagen_inferior } = req.body

    const [result] = await pool.query(
      `INSERT INTO turismo_pagina (user_id, titulo_superior, texto_superior, imagen_superior, titulo_inferior, texto_inferior, imagen_inferior)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE titulo_superior=VALUES(titulo_superior), texto_superior=VALUES(texto_superior), imagen_superior=VALUES(imagen_superior),
       titulo_inferior=VALUES(titulo_inferior), texto_inferior=VALUES(texto_inferior), imagen_inferior=VALUES(imagen_inferior)`,
      [req.userId, sanitize(titulo_superior) || null, sanitize(texto_superior) || null, imagen_superior || null, sanitize(titulo_inferior) || null, sanitize(texto_inferior) || null, imagen_inferior || null]
    )

    res.status(201).json({ message: 'Página guardada', id: result.insertId })
  } catch (err) {
    logger.error('Error al guardar página', { error: err.message })
    res.status(500).json({ error: 'Error al guardar página' })
  }
})

// PUT /api/pagina/:id — actualizar página premium
router.put('/:id', authMiddleware, requirePlan(3), async (req, res) => {
  try {
    const { titulo_superior, texto_superior, imagen_superior, titulo_inferior, texto_inferior, imagen_inferior } = req.body

    const [result] = await pool.query(
      `UPDATE turismo_pagina SET titulo_superior=?, texto_superior=?, imagen_superior=?, titulo_inferior=?, texto_inferior=?, imagen_inferior=?
       WHERE id=? AND user_id=?`,
      [sanitize(titulo_superior) || null, sanitize(texto_superior) || null, imagen_superior || null, sanitize(titulo_inferior) || null, sanitize(texto_inferior) || null, imagen_inferior || null, req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Página no encontrada' })
    }

    res.json({ message: 'Página actualizada' })
  } catch (err) {
    logger.error('Error al actualizar página', { error: err.message })
    res.status(500).json({ error: 'Error al actualizar página' })
  }
})

// PATCH /api/pagina/:id/crop — guardar encuadre de imágenes
router.patch('/:id/crop', authMiddleware, async (req, res) => {
  try {
    const { crop_superior, crop_inferior } = req.body
    await pool.query(
      'UPDATE turismo_pagina SET crop_superior=?, crop_inferior=? WHERE id=? AND user_id=?',
      [crop_superior ? JSON.stringify(crop_superior) : null, crop_inferior ? JSON.stringify(crop_inferior) : null, req.params.id, req.userId]
    )
    res.json({ message: 'Encuadre guardado' })
  } catch (err) {
    logger.error('Error al guardar encuadre', { error: err.message })
    res.status(500).json({ error: 'Error al guardar encuadre' })
  }
})

module.exports = router
