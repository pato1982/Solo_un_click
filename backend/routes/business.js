const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')

const router = express.Router()

// GET /api/business — obtener datos del negocio del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM businesses WHERE user_id = ?', [req.userId])

    if (rows.length === 0) {
      return res.json({ business: null })
    }

    const business = rows[0]
    if (business.horarios && typeof business.horarios === 'string') {
      business.horarios = JSON.parse(business.horarios)
    }

    res.json({ business })
  } catch (err) {
    console.error('Error al obtener negocio:', err)
    res.status(500).json({ error: 'Error al obtener datos del negocio' })
  }
})

// POST /api/business — crear o actualizar datos del negocio
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre_negocio, direccion, whatsapp, telefono, correo, facebook, instagram, horarios } = req.body

    const horariosJson = horarios ? JSON.stringify(horarios) : null

    const [existing] = await pool.query('SELECT id FROM businesses WHERE user_id = ?', [req.userId])

    if (existing.length > 0) {
      await pool.query(
        `UPDATE businesses SET nombre_negocio=?, direccion=?, whatsapp=?, telefono=?, correo=?, facebook=?, instagram=?, horarios=?
         WHERE user_id=?`,
        [nombre_negocio || null, direccion || null, whatsapp || null, telefono || null, correo || null, facebook || null, instagram || null, horariosJson, req.userId]
      )
    } else {
      await pool.query(
        `INSERT INTO businesses (user_id, nombre_negocio, direccion, whatsapp, telefono, correo, facebook, instagram, horarios)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.userId, nombre_negocio || null, direccion || null, whatsapp || null, telefono || null, correo || null, facebook || null, instagram || null, horariosJson]
      )
    }

    res.json({ message: 'Datos del negocio guardados' })
  } catch (err) {
    console.error('Error al guardar negocio:', err)
    res.status(500).json({ error: 'Error al guardar datos del negocio' })
  }
})

module.exports = router
