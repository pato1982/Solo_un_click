const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')

const router = express.Router()

// GET /api/tours — listar tours del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_tours WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    )

    for (const row of rows) {
      if (row.imagenes && typeof row.imagenes === 'string') {
        row.imagenes = JSON.parse(row.imagenes)
      }
    }

    res.json({ tours: rows })
  } catch (err) {
    console.error('Error al obtener tours:', err)
    res.status(500).json({ error: 'Error al obtener tours' })
  }
})

// GET /api/tours/public — listar todos los tours activos (público)
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_tours WHERE activo = 1 ORDER BY nombre ASC'
    )

    for (const row of rows) {
      if (row.imagenes && typeof row.imagenes === 'string') {
        row.imagenes = JSON.parse(row.imagenes)
      }
    }

    res.json({ tours: rows })
  } catch (err) {
    console.error('Error al obtener tours públicos:', err)
    res.status(500).json({ error: 'Error al obtener tours' })
  }
})

// POST /api/tours — crear tour
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, ubicacion, detalle, precio, precio_antes, imagen_principal, imagenes } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    const imagenesJson = imagenes ? JSON.stringify(imagenes) : '[]'

    const [result] = await pool.query(
      `INSERT INTO turismo_tours (user_id, nombre, ubicacion, detalle, precio, precio_antes, imagen_principal, imagenes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, nombre.trim(), ubicacion || null, detalle || null, precio || null, precio_antes || null, imagen_principal || 0, imagenesJson]
    )

    res.status(201).json({ message: 'Tour creado', id: result.insertId })
  } catch (err) {
    console.error('Error al crear tour:', err)
    res.status(500).json({ error: 'Error al crear tour' })
  }
})

// PUT /api/tours/:id — actualizar tour
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nombre, ubicacion, detalle, precio, precio_antes, imagen_principal, imagenes } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    const imagenesJson = imagenes ? JSON.stringify(imagenes) : '[]'

    const [result] = await pool.query(
      `UPDATE turismo_tours SET nombre=?, ubicacion=?, detalle=?, precio=?, precio_antes=?, imagen_principal=?, imagenes=?
       WHERE id=? AND user_id=?`,
      [nombre.trim(), ubicacion || null, detalle || null, precio || null, precio_antes || null, imagen_principal || 0, imagenesJson, req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' })
    }

    res.json({ message: 'Tour actualizado' })
  } catch (err) {
    console.error('Error al actualizar tour:', err)
    res.status(500).json({ error: 'Error al actualizar tour' })
  }
})

// DELETE /api/tours/:id — eliminar tour
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM turismo_tours WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' })
    }

    res.json({ message: 'Tour eliminado' })
  } catch (err) {
    console.error('Error al eliminar tour:', err)
    res.status(500).json({ error: 'Error al eliminar tour' })
  }
})

module.exports = router
