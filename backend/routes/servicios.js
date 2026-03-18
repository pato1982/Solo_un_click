const express = require('express')
const pool = require('../db')

const router = express.Router()

// GET /api/servicios/public — negocios con listings tipo servicio + sus imágenes
router.get('/public', async (req, res) => {
  try {
    // Obtener negocios que tienen al menos un listing tipo servicio
    const [rows] = await pool.query(`
      SELECT
        b.user_id,
        b.nombre_negocio,
        b.descripcion,
        b.direccion,
        b.whatsapp,
        b.telefono,
        b.correo,
        b.facebook,
        b.instagram,
        b.horarios,
        u.plan_id,
        GROUP_CONCAT(DISTINCT l.categoria ORDER BY l.categoria SEPARATOR '||') as categorias
      FROM businesses b
      JOIN users u ON b.user_id = u.id
      JOIN listings l ON l.user_id = b.user_id AND l.tipo = 'servicio'
      WHERE b.nombre_negocio IS NOT NULL AND b.nombre_negocio != ''
      GROUP BY b.user_id
      ORDER BY u.plan_id DESC, b.nombre_negocio ASC
    `)

    // Para cada negocio, obtener sus primeras 5 imágenes de listings tipo servicio
    const servicios = await Promise.all(rows.map(async (row) => {
      const [imgs] = await pool.query(`
        SELECT imagen FROM listings
        WHERE user_id = ? AND tipo = 'servicio' AND imagen IS NOT NULL AND imagen != ''
        ORDER BY id DESC LIMIT 5
      `, [row.user_id])

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
        imagenes: imgs.map(i => i.imagen),
      }
    }))

    // Solo incluir negocios que tengan al menos una imagen
    const conImagenes = servicios.filter(s => s.imagenes.length > 0)

    res.json({ servicios: conImagenes })
  } catch (err) {
    console.error('Error al obtener servicios públicos:', err)
    res.status(500).json({ error: 'Error al obtener servicios' })
  }
})

module.exports = router
