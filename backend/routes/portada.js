const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')

const router = express.Router()

// GET /api/portada — obtener portada del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_portada WHERE user_id = ? LIMIT 1',
      [req.userId]
    )

    const portada = rows[0] || null
    if (portada) {
      if (portada.imagenes && typeof portada.imagenes === 'string') {
        try { portada.imagenes = JSON.parse(portada.imagenes) } catch { portada.imagenes = [] }
      }
      if (portada.categorias && typeof portada.categorias === 'string') {
        try { portada.categorias = JSON.parse(portada.categorias) } catch { portada.categorias = [] }
      }
    }

    res.json({ portada })
  } catch (err) {
    console.error('Error al obtener portada:', err)
    res.status(500).json({ error: 'Error al obtener portada' })
  }
})

// GET /api/portada/public — obtener todas las portadas activas con datos del negocio y plan (público)
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.user_id, p.descripcion, p.imagenes, p.categorias,
              b.nombre_negocio, b.direccion, b.whatsapp, b.telefono, b.correo, b.facebook, b.instagram, b.horarios,
              u.plan_id
       FROM turismo_portada p
       LEFT JOIN businesses b ON b.user_id = p.user_id
       LEFT JOIN users u ON u.id = p.user_id
       WHERE p.activo = 1
       ORDER BY b.nombre_negocio ASC`
    )

    for (const row of rows) {
      if (row.imagenes && typeof row.imagenes === 'string') {
        try { row.imagenes = JSON.parse(row.imagenes) } catch { row.imagenes = [] }
      }
      if (row.categorias && typeof row.categorias === 'string') {
        try { row.categorias = JSON.parse(row.categorias) } catch { row.categorias = [] }
      }
      if (row.horarios && typeof row.horarios === 'string') {
        try { row.horarios = JSON.parse(row.horarios) } catch { row.horarios = [] }
      }
    }

    res.json({ portadas: rows })
  } catch (err) {
    console.error('Error al obtener portadas públicas:', err)
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
      [req.userId, (nombre || '').trim() || null, descripcion || null, imagenesJson, categoriasJson]
    )

    res.status(201).json({ message: 'Portada creada', id: result.insertId })
  } catch (err) {
    console.error('Error al crear portada:', err)
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
      [(nombre || '').trim() || null, descripcion || null, imagenesJson, categoriasJson, req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Portada no encontrada' })
    }

    res.json({ message: 'Portada actualizada' })
  } catch (err) {
    console.error('Error al actualizar portada:', err)
    res.status(500).json({ error: 'Error al actualizar portada' })
  }
})

// DELETE /api/portada/:id — eliminar portada
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM turismo_portada WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Portada no encontrada' })
    }

    res.json({ message: 'Portada eliminada' })
  } catch (err) {
    console.error('Error al eliminar portada:', err)
    res.status(500).json({ error: 'Error al eliminar portada' })
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
    console.error('Error al cambiar estado de la portada:', err)
    res.status(500).json({ error: 'Error al cambiar estado de la portada' })
  }
})

module.exports = router
