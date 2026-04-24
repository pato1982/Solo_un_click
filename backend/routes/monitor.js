const express = require('express')
const router = express.Router()
const pool = require('../db')
const { authMiddleware } = require('./auth')
const logger = require('../logger')

// GET /api/v1/monitor — todos los listings recientes con datos del usuario
// Solo accesible para rol 'programador'
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [user] = await pool.query('SELECT rol FROM users WHERE id = ?', [req.userId])
    if (!user.length || user[0].rol !== 'programador') {
      return res.status(403).json({ error: 'Acceso restringido' })
    }

    const limit = Math.min(parseInt(req.query.limit) || 100, 200)

    const [rows] = await pool.query(
      `SELECT
         l.id,
         b.id AS business_id,
         l.tipo,
         l.seccion,
         l.nombre,
         l.descripcion,
         l.precio,
         l.precio_original,
         l.categoria,
         l.subcategoria,
         l.badge,
         l.genero,
         l.activo,
         l.created_at,
         l.updated_at,
         u.nombre AS usuario_nombre,
         u.email AS usuario_email,
         u.plan_id,
         p.nombre AS plan_nombre,
         li.url AS imagen
       FROM listings l
       JOIN businesses b ON l.business_id = b.id
       JOIN users u ON b.user_id = u.id
       JOIN plans p ON u.plan_id = p.id
       LEFT JOIN listing_images li ON l.id = li.listing_id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [limit]
    )

    const [businesses] = await pool.query(
      `SELECT
         b.id,
         b.user_id,
         b.nombre_negocio,
         b.slogan,
         b.descripcion,
         b.direccion,
         b.whatsapp,
         b.telefono,
         b.correo,
         b.facebook,
         b.instagram,
         b.horarios,
         b.activo,
         b.created_at,
         b.updated_at,
         u.nombre  AS usuario_nombre,
         u.email   AS usuario_email,
         u.plan_id,
         p.nombre  AS plan_nombre
       FROM businesses b
       JOIN users u ON b.user_id = u.id
       JOIN plans p ON u.plan_id = p.id
       ORDER BY b.created_at DESC
       LIMIT ?`,
      [limit]
    )

    res.json({
      listings: rows,
      total: rows.length,
      businesses,
      businesses_total: businesses.length,
      generado: new Date().toISOString(),
    })
  } catch (err) {
    logger.error('Error en monitor', { error: err.message })
    res.status(500).json({ error: 'Error al obtener datos' })
  }
})

module.exports = router
