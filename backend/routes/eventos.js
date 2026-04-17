const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const pool = require('../db')
const { authMiddleware, programadorMiddleware } = require('./auth')
const logActivity = require('../logActivity')
const logger = require('../logger')

const router = express.Router()

const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1000)}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) return cb(null, true)
    cb(new Error('Solo se permiten imágenes (jpg, png, webp)'))
  }
})

function sanitize(str) {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

// GET /api/eventos/categorias — categorías de evento (público)
router.get('/categorias', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT ce.id, ce.nombre, ce.icono, ce.orden
      FROM categorias_evento ce
      INNER JOIN eventos e ON e.categoria_evento_id = ce.id AND e.activo = 1
      WHERE ce.activo = 1
      ORDER BY ce.orden ASC
    `)
    res.json({ categorias: rows })
  } catch (err) {
    logger.error('Error al obtener categorías de evento', { error: err.message })
    res.status(500).json({ error: 'Error al obtener categorías' })
  }
})

// GET /api/eventos — públicos, solo activos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, ce.nombre as categoria_nombre, ce.icono as categoria_icono
       FROM eventos e
       LEFT JOIN categorias_evento ce ON e.categoria_evento_id = ce.id
       WHERE e.activo = 1
       ORDER BY e.created_at DESC
       LIMIT 200`
    )
    res.json({ eventos: rows })
  } catch (err) {
    logger.error('Error al obtener eventos', { error: err.message })
    res.status(500).json({ error: 'Error al obtener eventos' })
  }
})

// GET /api/eventos/admin — todos (auth + programador)
router.get('/admin', authMiddleware, programadorMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, ce.nombre as categoria_nombre, ce.icono as categoria_icono
       FROM eventos e
       LEFT JOIN categorias_evento ce ON e.categoria_evento_id = ce.id
       ORDER BY e.created_at DESC`
    )
    res.json({ eventos: rows })
  } catch (err) {
    logger.error('Error al obtener eventos (admin)', { error: err.message })
    res.status(500).json({ error: 'Error al obtener eventos' })
  }
})

// POST /api/eventos — crear (auth + programador)
router.post('/', authMiddleware, programadorMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, fecha, ubicacion, precio, categoria_evento_id } = req.body
    if (!titulo || !titulo.trim()) return res.status(400).json({ error: 'El título es obligatorio' })

    const imagen = req.file ? `/uploads/${req.file.filename}` : null

    const [result] = await pool.query(
      `INSERT INTO eventos (titulo, imagen, fecha, ubicacion, precio, categoria_evento_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sanitize(titulo), imagen, sanitize(fecha) || null, sanitize(ubicacion) || null, sanitize(precio) || null, categoria_evento_id || null]
    )

    await logActivity(req.userId, 'crear', 'evento', result.insertId, { titulo })
    res.status(201).json({ message: 'Evento creado', id: result.insertId })
  } catch (err) {
    logger.error('Error al crear evento', { error: err.message })
    res.status(500).json({ error: 'Error al crear evento' })
  }
})

// PUT /api/eventos/:id — actualizar (auth + programador)
router.put('/:id', authMiddleware, programadorMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, fecha, ubicacion, precio, categoria_evento_id } = req.body
    if (!titulo || !titulo.trim()) return res.status(400).json({ error: 'El título es obligatorio' })

    if (req.file) {
      const [existing] = await pool.query('SELECT imagen FROM eventos WHERE id = ?', [req.params.id])
      if (existing.length > 0 && existing[0].imagen) {
        try { fs.unlinkSync(path.join(uploadsDir, path.basename(existing[0].imagen))) } catch (e) {}
      }
    }

    const imagen = req.file ? `/uploads/${req.file.filename}` : undefined
    let query, params
    if (imagen !== undefined) {
      query = `UPDATE eventos SET titulo=?, imagen=?, fecha=?, ubicacion=?, precio=?, categoria_evento_id=?, updated_at=NOW() WHERE id=?`
      params = [sanitize(titulo), imagen, sanitize(fecha) || null, sanitize(ubicacion) || null, sanitize(precio) || null, categoria_evento_id || null, req.params.id]
    } else {
      query = `UPDATE eventos SET titulo=?, fecha=?, ubicacion=?, precio=?, categoria_evento_id=?, updated_at=NOW() WHERE id=?`
      params = [sanitize(titulo), sanitize(fecha) || null, sanitize(ubicacion) || null, sanitize(precio) || null, categoria_evento_id || null, req.params.id]
    }

    const [result] = await pool.query(query, params)
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Evento no encontrado' })

    await logActivity(req.userId, 'editar', 'evento', parseInt(req.params.id), { titulo })
    res.json({ message: 'Evento actualizado' })
  } catch (err) {
    logger.error('Error al actualizar evento', { error: err.message })
    res.status(500).json({ error: 'Error al actualizar evento' })
  }
})

// PATCH /api/eventos/:id/crop — guardar encuadre de imagen
router.patch('/:id/crop', authMiddleware, programadorMiddleware, async (req, res) => {
  try {
    const { imagen_crop } = req.body
    await pool.query('UPDATE eventos SET imagen_crop = ?, updated_at = NOW() WHERE id = ?', [JSON.stringify(imagen_crop), req.params.id])
    res.json({ message: 'Encuadre guardado' })
  } catch (err) {
    logger.error('Error al guardar encuadre', { error: err.message })
    res.status(500).json({ error: 'Error al guardar encuadre' })
  }
})

// PATCH /api/eventos/:id/toggle — activar/desactivar
router.patch('/:id/toggle', authMiddleware, programadorMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT activo FROM eventos WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' })
    const newState = rows[0].activo ? 0 : 1
    await pool.query('UPDATE eventos SET activo = ?, updated_at = NOW() WHERE id = ?', [newState, req.params.id])
    res.json({ message: newState ? 'Evento activado' : 'Evento desactivado', activo: newState })
  } catch (err) {
    logger.error('Error al cambiar estado', { error: err.message })
    res.status(500).json({ error: 'Error al cambiar estado' })
  }
})

// DELETE /api/eventos/:id — eliminar (auth + programador)
router.delete('/:id', authMiddleware, programadorMiddleware, async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT imagen FROM eventos WHERE id = ?', [req.params.id])
    if (existing.length === 0) return res.status(404).json({ error: 'Evento no encontrado' })

    if (existing[0].imagen) {
      try { fs.unlinkSync(path.join(uploadsDir, path.basename(existing[0].imagen))) } catch (e) {}
    }

    await pool.query('DELETE FROM eventos WHERE id = ?', [req.params.id])
    await logActivity(req.userId, 'eliminar', 'evento', parseInt(req.params.id))
    res.json({ message: 'Evento eliminado' })
  } catch (err) {
    logger.error('Error al eliminar evento', { error: err.message })
    res.status(500).json({ error: 'Error al eliminar evento' })
  }
})

module.exports = router
