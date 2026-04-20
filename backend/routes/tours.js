const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')
const { requirePlan } = require('../middlewares/planMiddleware')
const { attachBusinessId } = require('../middlewares/businessMiddleware')
const logActivity = require('../logActivity')
const logger = require('../logger')

const router = express.Router()

// Sanitización: elimina tags HTML
function sanitize(str) {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

// ============================================================
// FASE 2 — imagenes e imagenes_crop son ahora tipo JSON nativo.
// MySQL los retorna ya como objetos/arrays — no se necesita JSON.parse().
// parseJson() mantiene compatibilidad con filas legado (TEXT) si las hubiera.
// ============================================================
function parseJson(val, fallback = []) {
  if (val === null || val === undefined) return fallback
  if (typeof val === 'object') return val   // JSON nativo de MySQL 8
  try { return JSON.parse(val) } catch { return fallback }
}

function normalizarTour(row) {
  row.imagenes      = parseJson(row.imagenes, [])
  row.imagenes_crop = parseJson(row.imagenes_crop, [])
  return row
}

// Validar que la categoría exista en la tabla maestra (case-insensitive)
async function validateCategoria(nombre) {
  if (!nombre) return { valid: true }
  const [rows] = await pool.query(
    'SELECT nombre FROM categorias WHERE tipo = "turismo" AND LOWER(nombre) = LOWER(?) AND activo = 1',
    [nombre.trim()]
  )
  if (rows.length === 0) return { valid: false }
  return { valid: true, nombre: rows[0].nombre }
}

// GET /api/tours — listar tours del usuario autenticado
router.get('/', authMiddleware, attachBusinessId, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_tours WHERE business_id = ? ORDER BY created_at DESC',
      [req.businessId]
    )
    res.json({ tours: rows.map(normalizarTour) })
  } catch (err) {
    logger.error('Error al obtener tours', { error: err.message })
    res.status(500).json({ error: 'Error al obtener tours' })
  }
})

// GET /api/tours/public — listar todos los tours activos (público)
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_tours WHERE activo = 1 ORDER BY nombre ASC LIMIT 200'
    )
    res.json({ tours: rows.map(normalizarTour) })
  } catch (err) {
    logger.error('Error al obtener tours públicos', { error: err.message })
    res.status(500).json({ error: 'Error al obtener tours' })
  }
})

// GET /api/tours/public/:userId — listar tours activos de un usuario (público)
router.get('/public/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM turismo_tours WHERE user_id = ? AND activo = 1 ORDER BY nombre ASC',
      [req.params.userId]
    )
    res.json({ tours: rows.map(normalizarTour) })
  } catch (err) {
    logger.error('Error al obtener tours del usuario', { error: err.message })
    res.status(500).json({ error: 'Error al obtener tours' })
  }
})

// B-01: leer límite de tours desde la tabla `plans` en lugar de hardcodearlo
async function getToursLimit(userId) {
  const [rows] = await pool.query(
    `SELECT p.max_tours FROM users u
     LEFT JOIN plans p ON u.plan_id = p.id
     WHERE u.id = ?`,
    [userId]
  )
  return rows[0]?.max_tours ?? 12
}

// POST /api/tours — crear tour (solo Premium)
router.post('/', authMiddleware, attachBusinessId, requirePlan(3), async (req, res) => {
  try {
    // requirePlan(3) middleware ya verifica el plan Premium arriba
    const limit = await getToursLimit(req.userId)
    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM turismo_tours WHERE business_id = ? AND activo = 1', [req.businessId])
    if (countRows[0].total >= limit) {
      return res.status(400).json({ error: `Máximo ${limit} tours permitidos` })
    }

    const { nombre, categoria, ubicacion, detalle, precio, precio_antes, imagen_principal, imagenes } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    // Validar precio
    if (precio !== undefined && precio !== null && precio !== '' && parseFloat(precio) < 0) {
      return res.status(400).json({ error: 'El precio no puede ser negativo' })
    }

    // Validar categoría contra tabla maestra
    if (categoria) {
      const catCheck = await validateCategoria(categoria)
      if (!catCheck.valid) {
        return res.status(400).json({ error: `Categoría "${categoria}" no es válida para turismo` })
      }
    }

    const imagenesJson = imagenes ? JSON.stringify(imagenes) : '[]'

    const [result] = await pool.query(
      `INSERT INTO turismo_tours (user_id, business_id, nombre, categoria, ubicacion, detalle, precio, precio_antes, imagen_principal, imagenes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, req.businessId, sanitize(nombre), sanitize(categoria) || null, sanitize(ubicacion) || null,
       sanitize(detalle) || null, precio || null, precio_antes || null,
       imagen_principal || 0, imagenesJson]
    )

    await logActivity(req.userId, 'crear', 'tour', result.insertId, { nombre })
    res.status(201).json({ message: 'Tour creado', id: result.insertId })
  } catch (err) {
    logger.error('Error al crear tour', { error: err.message })
    res.status(500).json({ error: 'Error al crear tour' })
  }
})

// PUT /api/tours/:id — actualizar tour (solo Premium)
router.put('/:id', authMiddleware, attachBusinessId, requirePlan(3), async (req, res) => {
  try {
    const { nombre, categoria, ubicacion, detalle, precio, precio_antes, imagen_principal, imagenes } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    // Validar precio
    if (precio !== undefined && precio !== null && precio !== '' && parseFloat(precio) < 0) {
      return res.status(400).json({ error: 'El precio no puede ser negativo' })
    }

    // Validar categoría contra tabla maestra
    if (categoria) {
      const catCheck = await validateCategoria(categoria)
      if (!catCheck.valid) {
        return res.status(400).json({ error: `Categoría "${categoria}" no es válida para turismo` })
      }
    }

    const imagenesJson = imagenes ? JSON.stringify(imagenes) : '[]'

    const [result] = await pool.query(
      `UPDATE turismo_tours
       SET nombre=?, categoria=?, ubicacion=?, detalle=?, precio=?, precio_antes=?, imagen_principal=?, imagenes=?
       WHERE id=? AND business_id=?`,
      [sanitize(nombre), sanitize(categoria) || null, sanitize(ubicacion) || null,
       sanitize(detalle) || null, precio || null, precio_antes || null,
       imagen_principal || 0, imagenesJson, req.params.id, req.businessId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' })
    }

    await logActivity(req.userId, 'editar', 'tour', parseInt(req.params.id), { nombre })
    res.json({ message: 'Tour actualizado' })
  } catch (err) {
    logger.error('Error al actualizar tour', { error: err.message })
    res.status(500).json({ error: 'Error al actualizar tour' })
  }
})

// DELETE /api/tours/:id — eliminar tour (soft delete)
router.delete('/:id', authMiddleware, attachBusinessId, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE turismo_tours SET activo = 0 WHERE id = ? AND business_id = ?',
      [req.params.id, req.businessId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' })
    }

    await logActivity(req.userId, 'eliminar', 'tour', parseInt(req.params.id))
    res.json({ message: 'Tour eliminado' })
  } catch (err) {
    logger.error('Error al eliminar tour', { error: err.message })
    res.status(500).json({ error: 'Error al eliminar tour' })
  }
})

// PATCH /api/tours/:id/crop — guardar encuadre de imágenes
router.patch('/:id/crop', authMiddleware, attachBusinessId, async (req, res) => {
  try {
    const { imagenes_crop } = req.body
    await pool.query(
      'UPDATE turismo_tours SET imagenes_crop=? WHERE id=? AND business_id=?',
      [JSON.stringify(imagenes_crop || []), req.params.id, req.businessId]
    )
    res.json({ message: 'Encuadre guardado' })
  } catch (err) {
    logger.error('Error al guardar encuadre', { error: err.message })
    res.status(500).json({ error: 'Error al guardar encuadre' })
  }
})

// PATCH /api/tours/:id/toggle — activar/desactivar tour
router.patch('/:id/toggle', authMiddleware, attachBusinessId, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE turismo_tours SET activo = NOT activo WHERE id = ? AND business_id = ?',
      [req.params.id, req.businessId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tour no encontrado' })
    }

    res.json({ message: 'Estado del tour actualizado' })
  } catch (err) {
    logger.error('Error al cambiar estado del tour', { error: err.message })
    res.status(500).json({ error: 'Error al cambiar estado del tour' })
  }
})

module.exports = router
