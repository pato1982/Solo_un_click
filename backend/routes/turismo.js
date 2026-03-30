const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')
const logger = require('../logger')

const router = express.Router()

// GET /api/turismo — listar negocios de turismo del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_negocios WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    )

    for (const row of rows) {
      try { if (row.horarios && typeof row.horarios === 'string') row.horarios = JSON.parse(row.horarios) }
      catch { row.horarios = [] }
    }

    res.json({ negocios: rows })
  } catch (err) {
    logger.error('Error al obtener turismo', { error: err.message })
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
      try { if (row.horarios && typeof row.horarios === 'string') row.horarios = JSON.parse(row.horarios) }
      catch { row.horarios = [] }
    }

    res.json({ negocios: rows })
  } catch (err) {
    logger.error('Error al obtener turismo público', { error: err.message })
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

    // Verificar que el usuario no tenga ya un negocio
    const [existing] = await pool.query('SELECT id FROM turismo_negocios WHERE user_id = ?', [req.userId])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe un negocio, usa PUT para actualizar' })
    }

    const horariosJson = horarios ? JSON.stringify(horarios) : null

    const [result] = await pool.query(
      `INSERT INTO turismo_negocios (user_id, nombre, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, nombre.trim(), descripcion || null, direccion || null, ubicacion || null, whatsapp || null, telefono || null, correo || null, facebook || null, instagram || null, horariosJson]
    )

    res.status(201).json({ message: 'Negocio creado', id: result.insertId })
  } catch (err) {
    logger.error('Error al crear turismo', { error: err.message })
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
    logger.error('Error al actualizar turismo', { error: err.message })
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
    logger.error('Error al eliminar turismo', { error: err.message })
    res.status(500).json({ error: 'Error al eliminar negocio de turismo' })
  }
})

// PATCH /api/turismo/:id/toggle — activar/desactivar negocio
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE turismo_negocios SET activo = NOT activo WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Negocio no encontrado' })
    }

    res.json({ message: 'Estado del negocio actualizado' })
  } catch (err) {
    logger.error('Error al cambiar estado del negocio', { error: err.message })
    res.status(500).json({ error: 'Error al cambiar estado del negocio' })
  }
})

module.exports = router
