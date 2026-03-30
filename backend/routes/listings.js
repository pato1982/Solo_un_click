const express = require('express')
const path = require('path')
const fs = require('fs')
const pool = require('../db')
const { authMiddleware } = require('./auth')
const logActivity = require('../logActivity')
const logger = require('../logger')

const router = express.Router()
const uploadsDir = path.join(__dirname, '..', 'uploads')

// Sanitización: elimina tags HTML
function sanitize(str) {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

// GET /api/listings — obtener publicaciones (público, para página principal)
router.get('/', async (req, res) => {
  try {
    const { tipo, badge, user_id, carousel, banner, page, limit: queryLimit } = req.query
    const pageNum = Math.max(1, parseInt(page) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(queryLimit) || 50))

    let query = `
      SELECT l.*, li.url as imagen,
             u.nombre as autor_nombre, u.plan_id as owner_plan_id,
             b.nombre_negocio, b.whatsapp as negocio_whatsapp,
             b.telefono as negocio_telefono, b.direccion as negocio_direccion,
             b.correo as negocio_correo, b.facebook as negocio_facebook, b.instagram as negocio_instagram
      FROM listings l
      LEFT JOIN listing_images li ON l.id = li.listing_id
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN businesses b ON l.user_id = b.user_id
      WHERE l.activo = 1
    `
    const params = []

    if (tipo) {
      query += ' AND l.tipo = ?'
      params.push(tipo)
    }
    if (badge) {
      query += ' AND l.badge = ?'
      params.push(badge)
    }
    if (user_id) {
      query += ' AND l.user_id = ?'
      params.push(user_id)
    }
    // Obtener plan del dueño si se filtra por user_id (vista pública de tienda)
    let ownerPlan = null
    let ownerMaxListings = null
    if (user_id) {
      const [planRows] = await pool.query(
        'SELECT u.plan_id, p.max_listings FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.id = ?',
        [user_id]
      )
      if (planRows.length > 0) {
        ownerPlan = planRows[0].plan_id
        ownerMaxListings = planRows[0].max_listings
      }
    }

    if (carousel === '1') {
      // Solo devolver carruseles si el dueño tiene plan >= 2
      if (user_id && ownerPlan !== null && ownerPlan < 2) {
        return res.json({ listings: [] })
      }
      query += ' AND l.carousel_posicion IS NOT NULL'
      // Si plan < 3, solo carrusel posición 1
      if (user_id && ownerPlan !== null && ownerPlan < 3) {
        query += ' AND l.carousel_posicion = 1'
      }
      query += ' ORDER BY l.carousel_posicion ASC, l.carousel_orden ASC'
    } else if (banner === '1') {
      // Solo devolver banner items si el dueño tiene plan >= 3
      if (user_id && ownerPlan !== null && ownerPlan < 3) {
        return res.json({ listings: [] })
      }
      query += ' AND l.banner_orden IS NOT NULL'
      query += ' ORDER BY l.banner_orden ASC'
    } else {
      query += ' ORDER BY l.created_at DESC'
      // Paginación solo para listados generales (no carousel/banner)
      query += ' LIMIT ? OFFSET ?'
      params.push(pageSize, (pageNum - 1) * pageSize)
    }

    let [rows] = await pool.query(query, params)

    // Si es vista pública con user_id, filtrar banners según plan y limitar cantidad
    if (user_id && ownerPlan !== null && carousel !== '1' && banner !== '1') {
      // Eliminar banners si plan < 3 (ya están excluidos arriba, pero por seguridad)
      rows = rows.filter(r => !r.banner_orden)
      // Limitar al máximo del plan
      if (ownerMaxListings && rows.length > ownerMaxListings) {
        rows = rows.slice(0, ownerMaxListings)
      }
    }

    // Agregar tallas y medidas en batch (evita N+1 queries)
    if (rows.length > 0) {
      const ids = rows.map(r => r.id)
      const [allSizes] = await pool.query(
        'SELECT listing_id, tipo_talla, valor FROM listing_sizes WHERE listing_id IN (?)',
        [ids]
      )
      const [allDims] = await pool.query(
        'SELECT listing_id, alto, ancho, profundidad FROM listing_dimensions WHERE listing_id IN (?)',
        [ids]
      )

      const sizesMap = {}
      allSizes.forEach(s => {
        if (!sizesMap[s.listing_id]) sizesMap[s.listing_id] = []
        sizesMap[s.listing_id].push(s)
      })
      const dimsMap = {}
      allDims.forEach(d => { dimsMap[d.listing_id] = d })

      for (const row of rows) {
        const sizes = sizesMap[row.id] || []
        row.tallas = sizes.length > 0 ? { tipo: sizes[0].tipo_talla, seleccion: sizes.map(s => s.valor) } : null
        const dim = dimsMap[row.id]
        row.medidas = dim ? { alto: dim.alto, ancho: dim.ancho, profundidad: dim.profundidad } : null
      }
    }

    res.json({ listings: rows, page: pageNum, limit: pageSize })
  } catch (err) {
    logger.error('Error al obtener listings', { error: err.message })
    res.status(500).json({ error: 'Error al obtener publicaciones' })
  }
})

// GET /api/listings/mine — publicaciones del usuario autenticado
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, li.url as imagen
       FROM listings l
       LEFT JOIN listing_images li ON l.id = li.listing_id
       WHERE l.user_id = ?
       ORDER BY l.created_at DESC`,
      [req.userId]
    )

    if (rows.length > 0) {
      const ids = rows.map(r => r.id)
      const [allSizes] = await pool.query(
        'SELECT listing_id, tipo_talla, valor FROM listing_sizes WHERE listing_id IN (?)',
        [ids]
      )
      const [allDims] = await pool.query(
        'SELECT listing_id, alto, ancho, profundidad FROM listing_dimensions WHERE listing_id IN (?)',
        [ids]
      )

      const sizesMap = {}
      allSizes.forEach(s => {
        if (!sizesMap[s.listing_id]) sizesMap[s.listing_id] = []
        sizesMap[s.listing_id].push(s)
      })
      const dimsMap = {}
      allDims.forEach(d => { dimsMap[d.listing_id] = d })

      for (const row of rows) {
        const sizes = sizesMap[row.id] || []
        row.tallas = sizes.length > 0 ? { tipo: sizes[0].tipo_talla, seleccion: sizes.map(s => s.valor) } : null
        const dim = dimsMap[row.id]
        row.medidas = dim ? { alto: dim.alto, ancho: dim.ancho, profundidad: dim.profundidad } : null
      }
    }

    res.json({ listings: rows })
  } catch (err) {
    logger.error('Error al obtener mis listings', { error: err.message })
    res.status(500).json({ error: 'Error al obtener publicaciones' })
  }
})

// POST /api/listings — crear publicación
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tipo, seccion, nombre, descripcion, precio, precio_original, categoria, subcategoria, badge, genero, imagen, tallas, medidas, carousel_posicion, carousel_orden, banner_orden } = req.body

    // Verificar límite del plan
    const [userRows] = await pool.query(
      'SELECT u.plan_id, p.max_listings FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.id = ?',
      [req.userId]
    )
    const [countRows] = await pool.query(
      'SELECT COUNT(*) as total FROM listings WHERE user_id = ? AND carousel_posicion IS NULL AND banner_orden IS NULL',
      [req.userId]
    )

    // Carruseles y banners no cuentan en el límite del plan
    if (!carousel_posicion && !banner_orden && countRows[0].total >= userRows[0].max_listings) {
      return res.status(403).json({ error: `Has alcanzado el límite de ${userRows[0].max_listings} publicaciones de tu plan` })
    }

    // Validar que badge solo se use con productos
    const finalBadge = tipo === 'producto' ? (badge || null) : null

    // Transacción: insertar listing + imagen + tallas + medidas
    const conn = await pool.getConnection()
    let listingId
    try {
      await conn.beginTransaction()

      const [result] = await conn.query(
        `INSERT INTO listings (user_id, tipo, seccion, nombre, descripcion, precio, precio_original, categoria, subcategoria, badge, genero, carousel_posicion, carousel_orden, banner_orden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.userId, tipo, seccion || 'destacados', sanitize(nombre), sanitize(descripcion) || null, precio || 0, precio_original || null, sanitize(categoria) || null, sanitize(subcategoria) || null, finalBadge, genero || null, carousel_posicion || null, carousel_orden || null, banner_orden || null]
      )
      listingId = result.insertId

      if (imagen) {
        await conn.query('INSERT INTO listing_images (listing_id, url) VALUES (?, ?)', [listingId, imagen])
      }

      if (tallas && tallas.tipo && tallas.seleccion && tallas.seleccion.length > 0) {
        const sizeValues = tallas.seleccion.map(v => [listingId, tallas.tipo, v])
        await conn.query('INSERT INTO listing_sizes (listing_id, tipo_talla, valor) VALUES ?', [sizeValues])
      }

      if (medidas && (medidas.alto || medidas.ancho || medidas.profundidad)) {
        await conn.query(
          'INSERT INTO listing_dimensions (listing_id, alto, ancho, profundidad) VALUES (?, ?, ?, ?)',
          [listingId, medidas.alto || null, medidas.ancho || null, medidas.profundidad || null]
        )
      }

      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }

    await logActivity(req.userId, 'crear', 'listing', listingId, { tipo, nombre, seccion })
    res.status(201).json({ message: 'Publicación creada', id: listingId })
  } catch (err) {
    logger.error('Error al crear listing', { error: err.message })
    res.status(500).json({ error: 'Error al crear publicación' })
  }
})

// PUT /api/listings/:id — editar publicación
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { tipo, seccion, nombre, descripcion, precio, precio_original, categoria, subcategoria, badge, genero, imagen, tallas, medidas, carousel_posicion, carousel_orden, banner_orden } = req.body

    // Verificar que el listing pertenece al usuario
    const [owner] = await pool.query('SELECT user_id FROM listings WHERE id = ?', [id])
    if (owner.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' })
    if (owner[0].user_id !== req.userId) return res.status(403).json({ error: 'No autorizado' })

    const finalBadge = tipo === 'producto' ? (badge || null) : null

    // Transacción: actualizar listing + imagen + tallas + medidas
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      await conn.query(
        `UPDATE listings SET tipo=?, seccion=?, nombre=?, descripcion=?, precio=?, precio_original=?, categoria=?, subcategoria=?, badge=?, genero=?, carousel_posicion=?, carousel_orden=?, banner_orden=?
         WHERE id=?`,
        [tipo, seccion || 'destacados', sanitize(nombre), sanitize(descripcion) || null, precio || 0, precio_original || null, sanitize(categoria) || null, sanitize(subcategoria) || null, finalBadge, genero || null, carousel_posicion || null, carousel_orden || null, banner_orden || null, id]
      )

      if (imagen) {
        await conn.query('DELETE FROM listing_images WHERE listing_id = ?', [id])
        await conn.query('INSERT INTO listing_images (listing_id, url) VALUES (?, ?)', [id, imagen])
      }

      await conn.query('DELETE FROM listing_sizes WHERE listing_id = ?', [id])
      if (tallas && tallas.tipo && tallas.seleccion && tallas.seleccion.length > 0) {
        const sizeValues = tallas.seleccion.map(v => [id, tallas.tipo, v])
        await conn.query('INSERT INTO listing_sizes (listing_id, tipo_talla, valor) VALUES ?', [sizeValues])
      }

      await conn.query('DELETE FROM listing_dimensions WHERE listing_id = ?', [id])
      if (medidas && (medidas.alto || medidas.ancho || medidas.profundidad)) {
        await conn.query(
          'INSERT INTO listing_dimensions (listing_id, alto, ancho, profundidad) VALUES (?, ?, ?, ?)',
          [id, medidas.alto || null, medidas.ancho || null, medidas.profundidad || null]
        )
      }

      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }

    await logActivity(req.userId, 'editar', 'listing', parseInt(id), { tipo, nombre, seccion })
    res.json({ message: 'Publicación actualizada' })
  } catch (err) {
    logger.error('Error al editar listing', { error: err.message })
    res.status(500).json({ error: 'Error al editar publicación' })
  }
})

// DELETE /api/listings/:id — eliminar publicación
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    // Verificar que pertenece al usuario
    const [owner] = await pool.query('SELECT user_id FROM listings WHERE id = ?', [id])
    if (owner.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' })
    if (owner[0].user_id !== req.userId) return res.status(403).json({ error: 'No autorizado' })

    // Eliminar imagen del disco
    const [imgRows] = await pool.query('SELECT url FROM listing_images WHERE listing_id = ?', [id])
    if (imgRows.length > 0 && imgRows[0].url) {
      const filePath = path.join(uploadsDir, path.basename(imgRows[0].url))
      try { fs.unlinkSync(filePath) } catch (e) {}
    }

    // Eliminar (CASCADE borra imágenes, tallas y medidas)
    await pool.query('DELETE FROM listings WHERE id = ?', [id])

    await logActivity(req.userId, 'eliminar', 'listing', parseInt(id))
    res.json({ message: 'Publicación eliminada' })
  } catch (err) {
    logger.error('Error al eliminar listing', { error: err.message })
    res.status(500).json({ error: 'Error al eliminar publicación' })
  }
})

// PATCH /api/listings/:id/banner-pos — actualizar posición y escala de imagen en banner
router.patch('/:id/banner-pos', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { banner_pos_x, banner_pos_y, banner_scale } = req.body

    const [owner] = await pool.query('SELECT user_id FROM listings WHERE id = ?', [id])
    if (owner.length === 0) return res.status(404).json({ error: 'No encontrado' })
    if (owner[0].user_id !== req.userId) return res.status(403).json({ error: 'No autorizado' })

    await pool.query('UPDATE listings SET banner_pos_x=?, banner_pos_y=?, banner_scale=? WHERE id=?', [
      Math.max(0, Math.min(100, parseInt(banner_pos_x) || 50)),
      Math.max(0, Math.min(100, parseInt(banner_pos_y) || 50)),
      Math.max(0.5, Math.min(3, parseFloat(banner_scale) || 1)),
      id
    ])
    res.json({ message: 'Posición actualizada' })
  } catch (err) {
    logger.error('Error actualizando posición banner', { error: err.message })
    res.status(500).json({ error: 'Error al actualizar' })
  }
})

module.exports = router
