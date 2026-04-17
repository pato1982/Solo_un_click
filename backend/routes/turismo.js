const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')
const logger = require('../logger')

const router = express.Router()

// ============================================================
// FASE 1 — MIGRACIÓN: turismo_negocios → businesses (tipo='turismo')
//
// Las consultas ahora apuntan a la tabla `businesses` con WHERE tipo='turismo'.
// Las respuestas son idénticas al frontend (mismo shape de objeto).
// La tabla turismo_negocios se mantiene intacta pero NO se escribe más aquí.
// ============================================================

// Helper: normalizar negocio turismo para respuesta (compatible con frontend)
function normalizarNegocio(row) {
  // horarios: con JSON nativo ya viene parseado; si viene como string (BD vieja), parsear
  if (row.horarios && typeof row.horarios === 'string') {
    try { row.horarios = JSON.parse(row.horarios) } catch { row.horarios = [] }
  }
  // Mapear nombre_negocio → nombre (frontend turismo espera 'nombre')
  if (row.nombre_negocio !== undefined && row.nombre === undefined) {
    row.nombre = row.nombre_negocio
  }
  return row
}

// GET /api/turismo — listar negocio de turismo del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, nombre_negocio AS nombre, descripcion, direccion, ubicacion,
              whatsapp, telefono, correo, facebook, instagram, horarios, activo, created_at
       FROM businesses
       WHERE user_id = ? AND tipo = 'turismo'
       ORDER BY created_at DESC`,
      [req.userId]
    )

    const negocios = rows.map(normalizarNegocio)
    res.json({ negocios })
  } catch (err) {
    logger.error('Error al obtener turismo', { error: err.message })
    res.status(500).json({ error: 'Error al obtener negocios de turismo' })
  }
})

// GET /api/turismo/public — listar todos los negocios de turismo activos (público)
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, nombre_negocio AS nombre, descripcion, direccion, ubicacion,
              whatsapp, telefono, correo, facebook, instagram, horarios, activo, created_at
       FROM businesses
       WHERE tipo = 'turismo' AND activo = 1
       ORDER BY nombre_negocio ASC`
    )

    const negocios = rows.map(normalizarNegocio)
    res.json({ negocios })
  } catch (err) {
    logger.error('Error al obtener turismo público', { error: err.message })
    res.status(500).json({ error: 'Error al obtener negocios de turismo' })
  }
})

// POST /api/turismo — crear nuevo negocio de turismo
// Escribe en businesses con tipo='turismo' (NO en turismo_negocios)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    const [existing] = await pool.query('SELECT id FROM businesses WHERE user_id = ?', [req.userId])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe un negocio, usa PUT para actualizar' })
    }

    const horariosJson = horarios ? JSON.stringify(horarios) : null

    const [result] = await pool.query(
      `INSERT INTO businesses
         (user_id, nombre_negocio, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios, tipo, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'turismo', 1)`,
      [req.userId, nombre.trim(), descripcion || null, direccion || null, ubicacion || null,
       whatsapp || null, telefono || null, correo || null, facebook || null, instagram || null, horariosJson]
    )

    res.status(201).json({ message: 'Negocio creado', id: result.insertId })
  } catch (err) {
    logger.error('Error al crear turismo', { error: err.message })
    res.status(500).json({ error: 'Error al crear negocio de turismo' })
  }
})

// PUT /api/turismo/:id — actualizar negocio de turismo (actualiza en businesses)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, direccion, ubicacion, whatsapp, telefono, correo, facebook, instagram, horarios } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    const horariosJson = horarios ? JSON.stringify(horarios) : null

    const [result] = await pool.query(
      `UPDATE businesses
       SET nombre_negocio=?, descripcion=?, direccion=?, ubicacion=?,
           whatsapp=?, telefono=?, correo=?, facebook=?, instagram=?, horarios=?
       WHERE id=? AND user_id=? AND tipo='turismo'`,
      [nombre.trim(), descripcion || null, direccion || null, ubicacion || null,
       whatsapp || null, telefono || null, correo || null, facebook || null, instagram || null,
       horariosJson, req.params.id, req.userId]
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

// DELETE /api/turismo/:id — soft delete de negocio de turismo
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE businesses SET activo = 0, deleted_at = NOW() WHERE id = ? AND user_id = ? AND tipo = 'turismo'`,
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
      `UPDATE businesses SET activo = NOT activo WHERE id = ? AND user_id = ? AND tipo = 'turismo'`,
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
