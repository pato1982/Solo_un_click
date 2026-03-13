const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')
const logActivity = require('../logActivity')

const router = express.Router()

// Sanitización: elimina tags HTML
function sanitize(str) {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

// GET /api/tours — listar tours del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_tours WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    )

    for (const row of rows) {
      try { if (row.imagenes && typeof row.imagenes === 'string') row.imagenes = JSON.parse(row.imagenes) }
      catch { row.imagenes = [] }
      try { if (row.imagenes_crop && typeof row.imagenes_crop === 'string') row.imagenes_crop = JSON.parse(row.imagenes_crop) }
      catch { row.imagenes_crop = [] }
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
      try { if (row.imagenes && typeof row.imagenes === 'string') row.imagenes = JSON.parse(row.imagenes) }
      catch { row.imagenes = [] }
      try { if (row.imagenes_crop && typeof row.imagenes_crop === 'string') row.imagenes_crop = JSON.parse(row.imagenes_crop) }
      catch { row.imagenes_crop = [] }
    }

    res.json({ tours: rows })
  } catch (err) {
    console.error('Error al obtener tours públicos:', err)
    res.status(500).json({ error: 'Error al obtener tours' })
  }
})

// GET /api/tours/public/:userId — listar tours activos de un usuario específico (público)
router.get('/public/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_tours WHERE user_id = ? AND activo = 1 ORDER BY nombre ASC',
      [req.params.userId]
    )

    for (const row of rows) {
      try { if (row.imagenes && typeof row.imagenes === 'string') row.imagenes = JSON.parse(row.imagenes) }
      catch { row.imagenes = [] }
      try { if (row.imagenes_crop && typeof row.imagenes_crop === 'string') row.imagenes_crop = JSON.parse(row.imagenes_crop) }
      catch { row.imagenes_crop = [] }
    }

    res.json({ tours: rows })
  } catch (err) {
    console.error('Error al obtener tours del usuario:', err)
    res.status(500).json({ error: 'Error al obtener tours' })
  }
})

// POST /api/tours — crear tour (solo Premium)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Validar plan Premium y límite de 12 tours
    const [userRows] = await pool.query('SELECT plan_id FROM users WHERE id = ?', [req.userId])
    if (!userRows.length || userRows[0].plan_id < 3) {
      return res.status(403).json({ error: 'Se requiere Plan Premium para crear tours' })
    }

    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM turismo_tours WHERE user_id = ?', [req.userId])
    if (countRows[0].total >= 12) {
      return res.status(400).json({ error: 'Máximo 12 tours permitidos' })
    }

    const { nombre, categoria, ubicacion, detalle, precio, precio_antes, imagen_principal, imagenes } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    const imagenesJson = imagenes ? JSON.stringify(imagenes) : '[]'

    const [result] = await pool.query(
      `INSERT INTO turismo_tours (user_id, nombre, categoria, ubicacion, detalle, precio, precio_antes, imagen_principal, imagenes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, sanitize(nombre), sanitize(categoria) || null, sanitize(ubicacion) || null, sanitize(detalle) || null, precio || null, precio_antes || null, imagen_principal || 0, imagenesJson]
    )

    await logActivity(req.userId, 'crear', 'tour', result.insertId, { nombre })
    res.status(201).json({ message: 'Tour creado', id: result.insertId })
  } catch (err) {
    console.error('Error al crear tour:', err)
    res.status(500).json({ error: 'Error al crear tour' })
  }
})

// PUT /api/tours/:id — actualizar tour (solo Premium)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const [userRows] = await pool.query('SELECT plan_id FROM users WHERE id = ?', [req.userId])
    if (!userRows.length || userRows[0].plan_id < 3) {
      return res.status(403).json({ error: 'Se requiere Plan Premium para editar tours' })
    }

    const { nombre, categoria, ubicacion, detalle, precio, precio_antes, imagen_principal, imagenes } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    const imagenesJson = imagenes ? JSON.stringify(imagenes) : '[]'

    const [result] = await pool.query(
      `UPDATE turismo_tours SET nombre=?, categoria=?, ubicacion=?, detalle=?, precio=?, precio_antes=?, imagen_principal=?, imagenes=?
       WHERE id=? AND user_id=?`,
      [sanitize(nombre), sanitize(categoria) || null, sanitize(ubicacion) || null, sanitize(detalle) || null, precio || null, precio_antes || null, imagen_principal || 0, imagenesJson, req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' })
    }

    await logActivity(req.userId, 'editar', 'tour', parseInt(req.params.id), { nombre })
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

    await logActivity(req.userId, 'eliminar', 'tour', parseInt(req.params.id))
    res.json({ message: 'Tour eliminado' })
  } catch (err) {
    console.error('Error al eliminar tour:', err)
    res.status(500).json({ error: 'Error al eliminar tour' })
  }
})

// PATCH /api/tours/:id/crop — guardar encuadre de imágenes
router.patch('/:id/crop', authMiddleware, async (req, res) => {
  try {
    const { imagenes_crop } = req.body
    await pool.query(
      'UPDATE turismo_tours SET imagenes_crop=? WHERE id=? AND user_id=?',
      [JSON.stringify(imagenes_crop || []), req.params.id, req.userId]
    )
    res.json({ message: 'Encuadre guardado' })
  } catch (err) {
    console.error('Error al guardar encuadre:', err)
    res.status(500).json({ error: 'Error al guardar encuadre' })
  }
})

// PATCH /api/tours/:id/toggle — activar/desactivar tour
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE turismo_tours SET activo = NOT activo WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' })
    }

    res.json({ message: 'Estado del tour actualizado' })
  } catch (err) {
    console.error('Error al cambiar estado del tour:', err)
    res.status(500).json({ error: 'Error al cambiar estado del tour' })
  }
})

module.exports = router
