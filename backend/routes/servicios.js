const express = require('express')
const pool = require('../db')
const logger = require('../logger')

const router = express.Router()

// GET /api/servicios/public — negocios con listings tipo servicio + sus imágenes
router.get('/public', async (req, res) => {
  try {
    // Obtener negocios que tienen al menos un listing tipo servicio
    const [rows] = await pool.query(`
      SELECT
        b.user_id,
        ANY_VALUE(b.nombre_negocio) as nombre_negocio,
        ANY_VALUE(b.descripcion) as descripcion,
        ANY_VALUE(b.direccion) as direccion,
        ANY_VALUE(b.whatsapp) as whatsapp,
        ANY_VALUE(b.telefono) as telefono,
        ANY_VALUE(b.correo) as correo,
        ANY_VALUE(b.facebook) as facebook,
        ANY_VALUE(b.instagram) as instagram,
        ANY_VALUE(b.horarios) as horarios,
        ANY_VALUE(u.plan_id) as plan_id,
        GROUP_CONCAT(DISTINCT l.categoria ORDER BY l.categoria SEPARATOR '||') as categorias
      FROM businesses b
      JOIN users u ON b.user_id = u.id
      JOIN listings l ON l.business_id = b.id AND l.tipo = 'servicio' AND l.activo = 1
      WHERE b.nombre_negocio IS NOT NULL AND b.nombre_negocio != ''
        AND b.activo = 1
      GROUP BY b.user_id
      ORDER BY ANY_VALUE(u.plan_id) DESC, ANY_VALUE(b.nombre_negocio) ASC
    `)

    // Obtener imágenes de todos los negocios en una sola query (en lugar de 1 query por negocio)
    const userIds = rows.map(r => r.user_id)
    let imgsByUser = {}
    if (userIds.length > 0) {
      const [allImgs] = await pool.query(`
        SELECT b.user_id, m.url as imagen FROM media m
        JOIN listings l ON l.id = m.entity_id
        JOIN businesses b ON l.business_id = b.id
        WHERE m.entity_type = 'listing' AND b.user_id IN (?) AND l.tipo = 'servicio' AND l.activo = 1
        ORDER BY b.user_id, l.id DESC
      `, [userIds])
      for (const img of allImgs) {
        if (!imgsByUser[img.user_id]) imgsByUser[img.user_id] = []
        if (imgsByUser[img.user_id].length < 5) imgsByUser[img.user_id].push(img.imagen)
      }
    }

    const servicios = rows.map(row => {
      let horarios = row.horarios
      if (horarios && typeof horarios === 'string') {
        try { horarios = JSON.parse(horarios) } catch { horarios = [] }
      }
      return {
        user_id: row.user_id,
        nombre_negocio: row.nombre_negocio,
        descripcion: row.descripcion || '',
        direccion: row.direccion || '',
        whatsapp: row.whatsapp || '',
        telefono: row.telefono || '',
        correo: row.correo || '',
        facebook: row.facebook || '',
        instagram: row.instagram || '',
        horarios: horarios || [],
        plan_id: row.plan_id,
        categorias: row.categorias ? row.categorias.split('||') : [],
        imagenes: imgsByUser[row.user_id] || [],
      }
    })

    // Solo incluir negocios que tengan al menos una imagen
    const conImagenes = servicios.filter(s => s.imagenes.length > 0)

    res.json({ servicios: conImagenes })
  } catch (err) {
    logger.error('Error al obtener servicios públicos', { error: err.message })
    res.status(500).json({ error: 'Error al obtener servicios' })
  }
})

module.exports = router
