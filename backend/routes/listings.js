const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')

const router = express.Router()

// GET /api/listings — obtener publicaciones (público, para página principal)
router.get('/', async (req, res) => {
  try {
    const { tipo, badge } = req.query

    let query = `
      SELECT l.*, li.url as imagen,
             u.nombre as autor_nombre
      FROM listings l
      LEFT JOIN listing_images li ON l.id = li.listing_id
      LEFT JOIN users u ON l.user_id = u.id
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

    query += ' ORDER BY l.created_at DESC'

    const [rows] = await pool.query(query, params)

    // Agregar tallas y medidas a cada listing
    for (const row of rows) {
      const [sizes] = await pool.query(
        'SELECT tipo_talla, valor FROM listing_sizes WHERE listing_id = ?',
        [row.id]
      )
      row.tallas = sizes.length > 0 ? { tipo: sizes[0].tipo_talla, seleccion: sizes.map(s => s.valor) } : null

      const [dims] = await pool.query(
        'SELECT alto, ancho, profundidad FROM listing_dimensions WHERE listing_id = ?',
        [row.id]
      )
      row.medidas = dims.length > 0 ? dims[0] : null
    }

    res.json({ listings: rows })
  } catch (err) {
    console.error('Error al obtener listings:', err)
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

    for (const row of rows) {
      const [sizes] = await pool.query(
        'SELECT tipo_talla, valor FROM listing_sizes WHERE listing_id = ?',
        [row.id]
      )
      row.tallas = sizes.length > 0 ? { tipo: sizes[0].tipo_talla, seleccion: sizes.map(s => s.valor) } : null

      const [dims] = await pool.query(
        'SELECT alto, ancho, profundidad FROM listing_dimensions WHERE listing_id = ?',
        [row.id]
      )
      row.medidas = dims.length > 0 ? dims[0] : null
    }

    res.json({ listings: rows })
  } catch (err) {
    console.error('Error al obtener mis listings:', err)
    res.status(500).json({ error: 'Error al obtener publicaciones' })
  }
})

// POST /api/listings — crear publicación
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tipo, nombre, descripcion, precio, precio_original, subcategoria, badge, genero, imagen, tallas, medidas } = req.body

    // Verificar límite del plan
    const [userRows] = await pool.query(
      'SELECT u.plan_id, p.max_listings FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.id = ?',
      [req.userId]
    )
    const [countRows] = await pool.query(
      'SELECT COUNT(*) as total FROM listings WHERE user_id = ?',
      [req.userId]
    )

    if (countRows[0].total >= userRows[0].max_listings) {
      return res.status(403).json({ error: `Has alcanzado el límite de ${userRows[0].max_listings} publicaciones de tu plan` })
    }

    // Validar que badge solo se use con productos
    const finalBadge = tipo === 'producto' ? (badge || null) : null

    // Insertar listing
    const [result] = await pool.query(
      `INSERT INTO listings (user_id, tipo, nombre, descripcion, precio, precio_original, subcategoria, badge, genero)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, tipo, nombre, descripcion || null, precio || 0, precio_original || null, subcategoria || null, finalBadge, genero || null]
    )

    const listingId = result.insertId

    // Guardar imagen
    if (imagen) {
      await pool.query('INSERT INTO listing_images (listing_id, url) VALUES (?, ?)', [listingId, imagen])
    }

    // Guardar tallas
    if (tallas && tallas.tipo && tallas.seleccion && tallas.seleccion.length > 0) {
      const sizeValues = tallas.seleccion.map(v => [listingId, tallas.tipo, v])
      await pool.query('INSERT INTO listing_sizes (listing_id, tipo_talla, valor) VALUES ?', [sizeValues])
    }

    // Guardar medidas
    if (medidas && (medidas.alto || medidas.ancho || medidas.profundidad)) {
      await pool.query(
        'INSERT INTO listing_dimensions (listing_id, alto, ancho, profundidad) VALUES (?, ?, ?, ?)',
        [listingId, medidas.alto || null, medidas.ancho || null, medidas.profundidad || null]
      )
    }

    res.status(201).json({ message: 'Publicación creada', id: listingId })
  } catch (err) {
    console.error('Error al crear listing:', err)
    res.status(500).json({ error: 'Error al crear publicación' })
  }
})

// PUT /api/listings/:id — editar publicación
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { tipo, nombre, descripcion, precio, precio_original, subcategoria, badge, genero, imagen, tallas, medidas } = req.body

    // Verificar que el listing pertenece al usuario
    const [owner] = await pool.query('SELECT user_id FROM listings WHERE id = ?', [id])
    if (owner.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' })
    if (owner[0].user_id !== req.userId) return res.status(403).json({ error: 'No autorizado' })

    const finalBadge = tipo === 'producto' ? (badge || null) : null

    // Actualizar listing
    await pool.query(
      `UPDATE listings SET tipo=?, nombre=?, descripcion=?, precio=?, precio_original=?, subcategoria=?, badge=?, genero=?
       WHERE id=?`,
      [tipo, nombre, descripcion || null, precio || 0, precio_original || null, subcategoria || null, finalBadge, genero || null, id]
    )

    // Actualizar imagen
    if (imagen) {
      await pool.query('DELETE FROM listing_images WHERE listing_id = ?', [id])
      await pool.query('INSERT INTO listing_images (listing_id, url) VALUES (?, ?)', [id, imagen])
    }

    // Actualizar tallas
    await pool.query('DELETE FROM listing_sizes WHERE listing_id = ?', [id])
    if (tallas && tallas.tipo && tallas.seleccion && tallas.seleccion.length > 0) {
      const sizeValues = tallas.seleccion.map(v => [id, tallas.tipo, v])
      await pool.query('INSERT INTO listing_sizes (listing_id, tipo_talla, valor) VALUES ?', [sizeValues])
    }

    // Actualizar medidas
    await pool.query('DELETE FROM listing_dimensions WHERE listing_id = ?', [id])
    if (medidas && (medidas.alto || medidas.ancho || medidas.profundidad)) {
      await pool.query(
        'INSERT INTO listing_dimensions (listing_id, alto, ancho, profundidad) VALUES (?, ?, ?, ?)',
        [id, medidas.alto || null, medidas.ancho || null, medidas.profundidad || null]
      )
    }

    res.json({ message: 'Publicación actualizada' })
  } catch (err) {
    console.error('Error al editar listing:', err)
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

    // Eliminar (CASCADE borra imágenes, tallas y medidas)
    await pool.query('DELETE FROM listings WHERE id = ?', [id])

    res.json({ message: 'Publicación eliminada' })
  } catch (err) {
    console.error('Error al eliminar listing:', err)
    res.status(500).json({ error: 'Error al eliminar publicación' })
  }
})

module.exports = router
