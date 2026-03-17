const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const pool = require('../db')
const { authMiddleware, programadorMiddleware } = require('./auth')
const logActivity = require('../logActivity')

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

// GET /api/locales/categorias — categorías de barrio (público)
router.get('/categorias', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT cb.id, cb.nombre, cb.icono
       FROM categorias_barrio cb
       INNER JOIN locales_barrio l ON l.categoria_barrio_id = cb.id AND l.activo = 1
       WHERE cb.activo = 1
       ORDER BY cb.orden ASC`
    )
    res.json({ categorias: rows })
  } catch (err) {
    console.error('Error al obtener categorías de barrio:', err)
    res.status(500).json({ error: 'Error al obtener categorías' })
  }
})

// GET /api/locales — públicos, solo activos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, cb.nombre as categoria_nombre, cb.icono as categoria_icono
       FROM locales_barrio l
       LEFT JOIN categorias_barrio cb ON l.categoria_barrio_id = cb.id
       WHERE l.activo = 1
       ORDER BY RAND()`
    )
    res.json({ locales: rows })
  } catch (err) {
    console.error('Error al obtener locales:', err)
    res.status(500).json({ error: 'Error al obtener locales' })
  }
})

// GET /api/locales/admin — todos (auth + programador)
router.get('/admin', authMiddleware, programadorMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, cb.nombre as categoria_nombre, cb.icono as categoria_icono
       FROM locales_barrio l
       LEFT JOIN categorias_barrio cb ON l.categoria_barrio_id = cb.id
       ORDER BY l.orden ASC, l.nombre ASC`
    )
    res.json({ locales: rows })
  } catch (err) {
    console.error('Error al obtener locales (admin):', err)
    res.status(500).json({ error: 'Error al obtener locales' })
  }
})

// POST /api/locales — crear (auth + programador)
router.post('/', authMiddleware, programadorMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, direccion, categoria_barrio_id, orden } = req.body
    if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' })

    const imagen = req.file ? `/uploads/${req.file.filename}` : null

    const [result] = await pool.query(
      `INSERT INTO locales_barrio (nombre, direccion, categoria_barrio_id, imagen, orden)
       VALUES (?, ?, ?, ?, ?)`,
      [sanitize(nombre), sanitize(direccion) || null, categoria_barrio_id || null, imagen, orden || 0]
    )

    await logActivity(req.userId, 'crear', 'local_barrio', result.insertId, { nombre })
    res.status(201).json({ message: 'Local creado', id: result.insertId })
  } catch (err) {
    console.error('Error al crear local:', err)
    res.status(500).json({ error: 'Error al crear local' })
  }
})

// PUT /api/locales/:id — actualizar (auth + programador)
router.put('/:id', authMiddleware, programadorMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, direccion, categoria_barrio_id, orden } = req.body
    if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' })

    if (req.file) {
      const [existing] = await pool.query('SELECT imagen FROM locales_barrio WHERE id = ?', [req.params.id])
      if (existing.length > 0 && existing[0].imagen) {
        try { fs.unlinkSync(path.join(uploadsDir, path.basename(existing[0].imagen))) } catch (e) {}
      }
    }

    const imagen = req.file ? `/uploads/${req.file.filename}` : undefined
    let query, params
    if (imagen !== undefined) {
      query = `UPDATE locales_barrio SET nombre=?, direccion=?, categoria_barrio_id=?, imagen=?, orden=?, updated_at=NOW() WHERE id=?`
      params = [sanitize(nombre), sanitize(direccion) || null, categoria_barrio_id || null, imagen, orden || 0, req.params.id]
    } else {
      query = `UPDATE locales_barrio SET nombre=?, direccion=?, categoria_barrio_id=?, orden=?, updated_at=NOW() WHERE id=?`
      params = [sanitize(nombre), sanitize(direccion) || null, categoria_barrio_id || null, orden || 0, req.params.id]
    }

    const [result] = await pool.query(query, params)
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Local no encontrado' })

    await logActivity(req.userId, 'editar', 'local_barrio', parseInt(req.params.id), { nombre })
    res.json({ message: 'Local actualizado' })
  } catch (err) {
    console.error('Error al actualizar local:', err)
    res.status(500).json({ error: 'Error al actualizar local' })
  }
})

// PATCH /api/locales/:id/crop — guardar encuadre de imagen
router.patch('/:id/crop', authMiddleware, programadorMiddleware, async (req, res) => {
  try {
    const { imagen_crop } = req.body
    await pool.query('UPDATE locales_barrio SET imagen_crop = ?, updated_at = NOW() WHERE id = ?', [JSON.stringify(imagen_crop), req.params.id])
    res.json({ message: 'Encuadre guardado' })
  } catch (err) {
    console.error('Error al guardar encuadre:', err)
    res.status(500).json({ error: 'Error al guardar encuadre' })
  }
})

// PATCH /api/locales/:id/toggle — activar/desactivar
router.patch('/:id/toggle', authMiddleware, programadorMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT activo FROM locales_barrio WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Local no encontrado' })
    const newState = rows[0].activo ? 0 : 1
    await pool.query('UPDATE locales_barrio SET activo = ?, updated_at = NOW() WHERE id = ?', [newState, req.params.id])
    res.json({ message: newState ? 'Local activado' : 'Local desactivado', activo: newState })
  } catch (err) {
    console.error('Error al cambiar estado:', err)
    res.status(500).json({ error: 'Error al cambiar estado' })
  }
})

// DELETE /api/locales/:id — eliminar (auth + programador)
router.delete('/:id', authMiddleware, programadorMiddleware, async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT imagen FROM locales_barrio WHERE id = ?', [req.params.id])
    if (existing.length === 0) return res.status(404).json({ error: 'Local no encontrado' })

    if (existing[0].imagen) {
      try { fs.unlinkSync(path.join(uploadsDir, path.basename(existing[0].imagen))) } catch (e) {}
    }

    await pool.query('DELETE FROM locales_barrio WHERE id = ?', [req.params.id])
    await logActivity(req.userId, 'eliminar', 'local_barrio', parseInt(req.params.id))
    res.json({ message: 'Local eliminado' })
  } catch (err) {
    console.error('Error al eliminar local:', err)
    res.status(500).json({ error: 'Error al eliminar local' })
  }
})

module.exports = router
