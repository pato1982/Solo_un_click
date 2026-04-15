const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const pool = require('../db')
const { authMiddleware } = require('./auth')
const { requirePlan } = require('../middlewares/planMiddleware')
const logger = require('../logger')

const router = express.Router()

// Crear carpeta uploads/carousels si no existe
const carouselsDir = path.join(__dirname, '..', 'uploads', 'carousels')
if (!fs.existsSync(carouselsDir)) {
  fs.mkdirSync(carouselsDir, { recursive: true })
}

// Configurar multer para carruseles
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, carouselsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000)}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/
    const ext = allowed.test(path.extname(file.originalname).toLowerCase())
    const mime = allowed.test(file.mimetype)
    if (ext && mime) return cb(null, true)
    cb(new Error('Solo se permiten imágenes (jpg, png, webp)'))
  }
})

// GET /api/carousels — obtener los 3 carruseles del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [carousels] = await pool.query(
      'SELECT * FROM carousels WHERE user_id = ? ORDER BY posicion',
      [req.userId]
    )

    // Obtener imágenes de cada carrusel desde tabla media
    const result = []
    for (const c of carousels) {
      const [images] = await pool.query(
        `SELECT id, url AS imagen_url, orden FROM media
         WHERE entity_type = 'carousel' AND entity_id = ? ORDER BY orden`,
        [c.id]
      )
      result.push({
        id: c.id,
        posicion: c.posicion,
        nombre: c.nombre,
        imagenes: images
      })
    }

    res.json({ carousels: result })
  } catch (err) {
    logger.error('Error al obtener carruseles', { error: err.message })
    res.status(500).json({ error: 'Error al obtener carruseles' })
  }
})

// POST /api/carousels/:posicion — guardar carrusel (nombre + imágenes nuevas)
router.post('/:posicion', authMiddleware, requirePlan(2), upload.array('imagenes', 8), async (req, res) => {
  try {
    const posicion = parseInt(req.params.posicion)
    if (![1, 2, 3].includes(posicion)) {
      return res.status(400).json({ error: 'Posición inválida (1, 2 o 3)' })
    }

    const { nombre } = req.body

    // Transacción: crear/actualizar carrusel + insertar imágenes
    const conn = await pool.getConnection()
    let carouselId
    try {
      await conn.beginTransaction()

      const [existing] = await conn.query(
        'SELECT id FROM carousels WHERE user_id = ? AND posicion = ?',
        [req.userId, posicion]
      )

      if (existing.length > 0) {
        carouselId = existing[0].id
        await conn.query('UPDATE carousels SET nombre = ? WHERE id = ?', [nombre || '', carouselId])
      } else {
        const [result] = await conn.query(
          'INSERT INTO carousels (user_id, nombre, posicion) VALUES (?, ?, ?)',
          [req.userId, nombre || '', posicion]
        )
        carouselId = result.insertId
      }

      if (req.files && req.files.length > 0) {
        const [countResult] = await conn.query(
          `SELECT COUNT(*) as total FROM media WHERE entity_type = 'carousel' AND entity_id = ?`,
          [carouselId]
        )
        const currentCount = countResult[0].total
        const maxNew = 8 - currentCount
        const filesToAdd = req.files.slice(0, maxNew)

        for (let i = 0; i < filesToAdd.length; i++) {
          const url = `/uploads/carousels/${filesToAdd[i].filename}`
          await conn.query(
            `INSERT INTO media (entity_type, entity_id, url, orden) VALUES ('carousel', ?, ?, ?)`,
            [carouselId, url, currentCount + i + 1]
          )
        }
      }

      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }

    // Devolver carrusel actualizado
    const [images] = await pool.query(
      `SELECT id, url AS imagen_url, orden FROM media
       WHERE entity_type = 'carousel' AND entity_id = ? ORDER BY orden`,
      [carouselId]
    )

    res.json({
      message: 'Carrusel guardado',
      carousel: { id: carouselId, posicion, nombre: nombre || '', imagenes: images }
    })
  } catch (err) {
    logger.error('Error al guardar carrusel', { error: err.message })
    res.status(500).json({ error: 'Error al guardar carrusel' })
  }
})

// PUT /api/carousels/:posicion/reorder — reordenar imágenes
router.put('/:posicion/reorder', authMiddleware, requirePlan(2), async (req, res) => {
  try {
    const posicion = parseInt(req.params.posicion)
    const { imageIds } = req.body // Array de IDs en el nuevo orden

    const [carousel] = await pool.query(
      'SELECT id FROM carousels WHERE user_id = ? AND posicion = ?',
      [req.userId, posicion]
    )

    if (carousel.length === 0) {
      return res.status(404).json({ error: 'Carrusel no encontrado' })
    }

    // Verificar que todos los imageIds pertenecen a este carousel
    if (imageIds && imageIds.length > 0) {
      const [check] = await pool.query(
        `SELECT COUNT(*) as total FROM media WHERE id IN (?) AND entity_type = 'carousel' AND entity_id = ?`,
        [imageIds, carousel[0].id]
      )
      if (check[0].total !== imageIds.length) {
        return res.status(403).json({ error: 'Una o más imágenes no pertenecen a este carrusel' })
      }
    }

    // Transacción: reordenar todas las imágenes atómicamente
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      for (let i = 0; i < imageIds.length; i++) {
        await conn.query(
          `UPDATE media SET orden = ? WHERE id = ? AND entity_type = 'carousel' AND entity_id = ?`,
          [i + 1, imageIds[i], carousel[0].id]
        )
      }
      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }

    res.json({ message: 'Orden actualizado' })
  } catch (err) {
    logger.error('Error al reordenar', { error: err.message })
    res.status(500).json({ error: 'Error al reordenar imágenes' })
  }
})

// DELETE /api/carousels/:posicion/images/:imageId — eliminar imagen
router.delete('/:posicion/images/:imageId', authMiddleware, requirePlan(2), async (req, res) => {
  try {
    const posicion = parseInt(req.params.posicion)
    const imageId = parseInt(req.params.imageId)

    const [carousel] = await pool.query(
      'SELECT id FROM carousels WHERE user_id = ? AND posicion = ?',
      [req.userId, posicion]
    )

    if (carousel.length === 0) {
      return res.status(404).json({ error: 'Carrusel no encontrado' })
    }

    // Obtener URL para borrar archivo físico
    const [img] = await pool.query(
      `SELECT url FROM media WHERE id = ? AND entity_type = 'carousel' AND entity_id = ?`,
      [imageId, carousel[0].id]
    )

    if (img.length > 0) {
      const fileToDelete = path.join(__dirname, '..', img[0].url)

      // Transacción: borrar registro + reordenar restantes
      const conn = await pool.getConnection()
      try {
        await conn.beginTransaction()

        await conn.query('DELETE FROM media WHERE id = ?', [imageId])

        const [remaining] = await conn.query(
          `SELECT id FROM media WHERE entity_type = 'carousel' AND entity_id = ? ORDER BY orden`,
          [carousel[0].id]
        )
        for (let i = 0; i < remaining.length; i++) {
          await conn.query('UPDATE media SET orden = ? WHERE id = ?', [i + 1, remaining[i].id])
        }

        await conn.commit()
      } catch (err) {
        await conn.rollback()
        throw err
      } finally {
        conn.release()
      }

      // Borrar archivo físico DESPUÉS del commit
      if (fs.existsSync(fileToDelete)) {
        fs.unlinkSync(fileToDelete)
      }
    }

    res.json({ message: 'Imagen eliminada' })
  } catch (err) {
    logger.error('Error al eliminar imagen', { error: err.message })
    res.status(500).json({ error: 'Error al eliminar imagen' })
  }
})

module.exports = router
