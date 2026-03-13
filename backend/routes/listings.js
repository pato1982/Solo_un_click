const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')
const logActivity = require('../logActivity')

const router = express.Router()

// GET /api/listings — obtener publicaciones (público, para página principal)
router.get('/', async (req, res) => {
  try {
    const { tipo, badge, user_id, carousel } = req.query

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
    } else {
      // Excluir items de carrusel y banner del feed principal
      query += ' AND l.carousel_posicion IS NULL AND l.banner_orden IS NULL'
      query += ' ORDER BY l.created_at DESC'
    }

    let [rows] = await pool.query(query, params)

    // Si es vista pública con user_id, filtrar banners según plan y limitar cantidad
    if (user_id && ownerPlan !== null && carousel !== '1') {
      // Eliminar banners si plan < 3 (ya están excluidos arriba, pero por seguridad)
      rows = rows.filter(r => !r.banner_orden)
      // Limitar al máximo del plan
      if (ownerMaxListings && rows.length > ownerMaxListings) {
        rows = rows.slice(0, ownerMaxListings)
      }
    }

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

    // Insertar listing
    const [result] = await pool.query(
      `INSERT INTO listings (user_id, tipo, seccion, nombre, descripcion, precio, precio_original, categoria, subcategoria, badge, genero, carousel_posicion, carousel_orden, banner_orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, tipo, seccion || 'destacados', nombre, descripcion || null, precio || 0, precio_original || null, categoria || null, subcategoria || null, finalBadge, genero || null, carousel_posicion || null, carousel_orden || null, banner_orden || null]
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

    await logActivity(req.userId, 'crear', 'listing', listingId, { tipo, nombre, seccion })
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
    const { tipo, seccion, nombre, descripcion, precio, precio_original, categoria, subcategoria, badge, genero, imagen, tallas, medidas, carousel_posicion, carousel_orden, banner_orden } = req.body

    // Verificar que el listing pertenece al usuario
    const [owner] = await pool.query('SELECT user_id FROM listings WHERE id = ?', [id])
    if (owner.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' })
    if (owner[0].user_id !== req.userId) return res.status(403).json({ error: 'No autorizado' })

    const finalBadge = tipo === 'producto' ? (badge || null) : null

    // Actualizar listing
    await pool.query(
      `UPDATE listings SET tipo=?, seccion=?, nombre=?, descripcion=?, precio=?, precio_original=?, categoria=?, subcategoria=?, badge=?, genero=?, carousel_posicion=?, carousel_orden=?, banner_orden=?
       WHERE id=?`,
      [tipo, seccion || 'destacados', nombre, descripcion || null, precio || 0, precio_original || null, categoria || null, subcategoria || null, finalBadge, genero || null, carousel_posicion || null, carousel_orden || null, banner_orden || null, id]
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

    await logActivity(req.userId, 'editar', 'listing', parseInt(id), { tipo, nombre, seccion })
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

    await logActivity(req.userId, 'eliminar', 'listing', parseInt(id))
    res.json({ message: 'Publicación eliminada' })
  } catch (err) {
    console.error('Error al eliminar listing:', err)
    res.status(500).json({ error: 'Error al eliminar publicación' })
  }
})

module.exports = router
