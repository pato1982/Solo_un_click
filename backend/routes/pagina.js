const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')

const router = express.Router()

// GET /api/pagina — obtener página premium del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_pagina WHERE user_id = ? LIMIT 1',
      [req.userId]
    )
    res.json({ pagina: rows[0] || null })
  } catch (err) {
    console.error('Error al obtener página:', err)
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
    res.json({ pagina: rows[0] || null })
  } catch (err) {
    console.error('Error al obtener página pública:', err)
    res.status(500).json({ error: 'Error al obtener página' })
  }
})

// POST /api/pagina — crear o actualizar página premium
router.post('/', authMiddleware, async (req, res) => {
  try {
    const [userRows] = await pool.query('SELECT plan_id FROM users WHERE id = ?', [req.userId])
    if (!userRows.length || userRows[0].plan_id < 3) {
      return res.status(403).json({ error: 'Se requiere Plan Premium' })
    }

    const { titulo_superior, texto_superior, imagen_superior, titulo_inferior, texto_inferior, imagen_inferior } = req.body

    const [result] = await pool.query(
      `INSERT INTO turismo_pagina (user_id, titulo_superior, texto_superior, imagen_superior, titulo_inferior, texto_inferior, imagen_inferior)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE titulo_superior=VALUES(titulo_superior), texto_superior=VALUES(texto_superior), imagen_superior=VALUES(imagen_superior),
       titulo_inferior=VALUES(titulo_inferior), texto_inferior=VALUES(texto_inferior), imagen_inferior=VALUES(imagen_inferior)`,
      [req.userId, titulo_superior || null, texto_superior || null, imagen_superior || null, titulo_inferior || null, texto_inferior || null, imagen_inferior || null]
    )

    res.status(201).json({ message: 'Página guardada', id: result.insertId })
  } catch (err) {
    console.error('Error al guardar página:', err)
    res.status(500).json({ error: 'Error al guardar página' })
  }
})

// PUT /api/pagina/:id — actualizar página premium
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const [userRows] = await pool.query('SELECT plan_id FROM users WHERE id = ?', [req.userId])
    if (!userRows.length || userRows[0].plan_id < 3) {
      return res.status(403).json({ error: 'Se requiere Plan Premium' })
    }

    const { titulo_superior, texto_superior, imagen_superior, titulo_inferior, texto_inferior, imagen_inferior } = req.body

    const [result] = await pool.query(
      `UPDATE turismo_pagina SET titulo_superior=?, texto_superior=?, imagen_superior=?, titulo_inferior=?, texto_inferior=?, imagen_inferior=?
       WHERE id=? AND user_id=?`,
      [titulo_superior || null, texto_superior || null, imagen_superior || null, titulo_inferior || null, texto_inferior || null, imagen_inferior || null, req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Página no encontrada' })
    }

    res.json({ message: 'Página actualizada' })
  } catch (err) {
    console.error('Error al actualizar página:', err)
    res.status(500).json({ error: 'Error al actualizar página' })
  }
})

module.exports = router
