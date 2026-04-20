const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const { authMiddleware } = require('./auth')
const { attachBusinessId } = require('../middlewares/businessMiddleware')
const pool = require('../db')
const logger = require('../logger')

const MAX_IMAGES_PER_BUSINESS = 200

const router = express.Router()

const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer: almacena en memoria (no en disco), límite 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/
    const ext = allowed.test(path.extname(file.originalname).toLowerCase())
    const mime = allowed.test(file.mimetype)
    if (ext && mime) return cb(null, true)
    cb(new Error('Solo se permiten imágenes (jpg, png, webp, gif)'))
  }
})

// POST /api/upload — subir imagen con compresión automática
router.post('/', authMiddleware, attachBusinessId, upload.single('imagen'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió imagen' })
  }

  try {
    // M-12: cap por business para prevenir acumulación de imágenes
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM media m
       JOIN listings l ON m.entity_type = 'listing' AND m.entity_id = l.id
       WHERE l.business_id = ?`,
      [req.businessId]
    )
    if (countRows[0].total >= MAX_IMAGES_PER_BUSINESS) {
      return res.status(429).json({ error: `Límite de ${MAX_IMAGES_PER_BUSINESS} imágenes alcanzado para este negocio` })
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1000)}.webp`
    const outputPath = path.join(uploadsDir, filename)

    // Obtener metadata para saber el tamaño original
    const metadata = await sharp(req.file.buffer).metadata()

    await sharp(req.file.buffer)
      .rotate()                    // Corrige orientación EXIF automáticamente
      .resize({
        width: 1200,
        height: 1200,
        fit: 'inside',             // Mantiene proporción, nunca agranda
        withoutEnlargement: true
      })
      .webp({ quality: 82 })      // Convierte a WebP calidad 82
      .toFile(outputPath)

    const stats = fs.statSync(outputPath)
    const originalKB = Math.round(req.file.size / 1024)
    const finalKB = Math.round(stats.size / 1024)
    const ahorro = Math.round((1 - stats.size / req.file.size) * 100)

    logger.info('Imagen procesada', {
      original: `${originalKB}KB (${metadata.width}x${metadata.height})`,
      final: `${finalKB}KB`,
      ahorro: `${ahorro}%`
    })

    const url = `/uploads/${filename}`
    res.json({ message: 'Imagen subida', url, debug: { originalKB, finalKB, ahorro: `${ahorro}%` } })
  } catch (err) {
    logger.error('Error al procesar imagen', { error: err.message })
    res.status(500).json({ error: 'Error al procesar la imagen' })
  }
})

module.exports = router
