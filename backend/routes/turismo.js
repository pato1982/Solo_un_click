const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')

const router = express.Router()

// GET /api/turismo — listar negocios de turismo del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_negocios WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    )

    for (const row of rows) {
      if (row.horarios && typeof row.horarios === 'string') {
        row.horarios = JSON.parse(row.horarios)
      }
    }

    res.json({ negocios: rows })
  } catch (err) {
    console.error('Error al obtener turismo:', err)
    res.status(500).json({ error: 'Error al obtener negocios de turismo' })
  }
})

// GET /api/turismo/public — listar todos los negocios de turismo (público)
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_negocios WHERE activo = 1 ORDER BY nombre ASC'
    )

    for (const row of rows) {
      if (row.horarios && typeof row.horarios === 'string') {
        row.horarios = JSON.parse(row.horarios)
      }
    }

    res.json({ negocios: rows })
  } catch (err) {
    console.error('Error al obtener turismo público:', err)
    res.status(500).json({ error: 'Error al obtener negocios de turismo' })
  }
})

// POST /api/turismo — crear nuevo negocio de turismo
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    const horariosJson = horarios ? JSON.stringify(horarios) : null

    const [result] = await pool.query(
      `INSERT INTO turismo_negocios (user_id, nombre, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, nombre.trim(), descripcion || null, direccion || null, ubicacion || null, whatsapp || null, telefono || null, correo || null, facebook || null, instagram || null, horariosJson]
    )

    res.status(201).json({ message: 'Negocio creado', id: result.insertId })
  } catch (err) {
    console.error('Error al crear turismo:', err)
    res.status(500).json({ error: 'Error al crear negocio de turismo' })
  }
})

// PUT /api/turismo/:id — actualizar negocio de turismo
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    const horariosJson = horarios ? JSON.stringify(horarios) : null

    const [result] = await pool.query(
      `UPDATE turismo_negocios SET nombre=?, descripcion=?, direccion=?, ubicacion=?, whatsapp=?, telefono=?, correo=?, facebook=?, instagram=?, horarios=?
       WHERE id=? AND user_id=?`,
      [nombre.trim(), descripcion || null, direccion || null, ubicacion || null, whatsapp || null, telefono || null, correo || null, facebook || null, instagram || null, horariosJson, req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Negocio no encontrado' })
    }

    res.json({ message: 'Negocio actualizado' })
  } catch (err) {
    console.error('Error al actualizar turismo:', err)
    res.status(500).json({ error: 'Error al actualizar negocio de turismo' })
  }
})

// DELETE /api/turismo/:id — eliminar negocio de turismo
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM turismo_negocios WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Negocio no encontrado' })
    }

    res.json({ message: 'Negocio eliminado' })
  } catch (err) {
    console.error('Error al eliminar turismo:', err)
    res.status(500).json({ error: 'Error al eliminar negocio de turismo' })
  }
})

module.exports = router
