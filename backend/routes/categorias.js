const express = require('express')
const router = express.Router()
const db = require('../db')

// GET /api/categorias?tipo=turismo — categorías con subcategorías
router.get('/', async (req, res) => {
  try {
    const { tipo } = req.query
    let query = `
      SELECT c.id as cat_id, c.nombre as categoria, c.tipo,
             s.id as sub_id, s.nombre as subcategoria
      FROM categorias c
      LEFT JOIN subcategorias s ON s.categoria_id = c.id
    `
    const params = []
    if (tipo) {
      const tipos = tipo.split(',').map(t => t.trim()).filter(Boolean)
      if (tipos.length === 1) {
        query += ' WHERE c.tipo = ?'
        params.push(tipos[0])
      } else if (tipos.length > 1) {
        query += ` WHERE c.tipo IN (${tipos.map(() => '?').join(',')})`
        params.push(...tipos)
      }
    }
    query += ' ORDER BY c.nombre, s.nombre'

    const [rows] = await db.query(query, params)

    // Agrupar por categoría
    const catMap = new Map()
    rows.forEach(row => {
      if (!catMap.has(row.cat_id)) {
        catMap.set(row.cat_id, {
          id: row.cat_id,
          nombre: row.categoria,
          tipo: row.tipo,
          subcategorias: [],
        })
      }
      if (row.sub_id) {
        catMap.get(row.cat_id).subcategorias.push({
          id: row.sub_id,
          nombre: row.subcategoria,
        })
      }
    })

    res.json({ categorias: [...catMap.values()] })
  } catch (err) {
    console.error('Error obteniendo categorías:', err)
    res.status(500).json({ error: 'Error interno' })
  }
})

module.exports = router
