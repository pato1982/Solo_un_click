const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')

const router = express.Router()

// POST /api/analytics/track — registrar evento (público, sin auth)
router.post('/track', async (req, res) => {
  try {
    const { user_id, event_type, listing_id } = req.body
    if (!user_id || !event_type) return res.status(400).json({ error: 'Faltan datos' })
    if (!['page_view', 'product_click', 'card_click'].includes(event_type)) return res.status(400).json({ error: 'Tipo inválido' })

    // Registrar en analytics (legacy)
    await pool.query(
      'INSERT INTO analytics (user_id, event_type, listing_id) VALUES (?, ?, ?)',
      [user_id, event_type, listing_id || null]
    )

    // Si es page_view, registrar también en page_visits
    if (event_type === 'page_view') {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0'
      const pagina = req.body.pagina || 'tienda'
      await pool.query(
        'INSERT INTO page_visits (user_id, visitor_ip, pagina) VALUES (?, ?, ?)',
        [user_id, ip, pagina]
      )
    }

    res.json({ ok: true })
  } catch (err) {
    console.error('Error tracking:', err)
    res.status(500).json({ error: 'Error al registrar evento' })
  }
})

// GET /api/analytics/stats — estadísticas mensuales del usuario autenticado
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Últimos 6 meses de visitas desde page_visits
    const [views] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as mes, COUNT(*) as total
       FROM page_visits
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY mes ORDER BY mes ASC`,
      [req.userId]
    )

    // Últimos 6 meses de clicks en productos
    const [clicks] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as mes, COUNT(*) as total
       FROM analytics
       WHERE user_id = ? AND event_type = 'product_click' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY mes ORDER BY mes ASC`,
      [req.userId]
    )

    // Últimos 6 meses de clicks en tarjeta (turismo)
    const [cardClicks] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as mes, COUNT(*) as total
       FROM analytics
       WHERE user_id = ? AND event_type = 'card_click' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY mes ORDER BY mes ASC`,
      [req.userId]
    )

    // Visitantes únicos (por IP) del mes actual
    const [uniqueVisitors] = await pool.query(
      `SELECT COUNT(DISTINCT visitor_ip) as total
       FROM page_visits
       WHERE user_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
      [req.userId]
    )

    // Total visitas del mes actual
    const [monthVisits] = await pool.query(
      `SELECT COUNT(*) as total
       FROM page_visits
       WHERE user_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
      [req.userId]
    )

    // Visitas por tipo de página
    const [visitsByPage] = await pool.query(
      `SELECT pagina, COUNT(*) as total
       FROM page_visits
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY pagina`,
      [req.userId]
    )

    // Generar array de últimos 5 meses + mes actual + mes siguiente
    const meses = []
    const now = new Date()
    for (let i = 5; i >= -1; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      meses.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'))
    }

    const MESES_LABEL = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    const viewsMap = {}
    views.forEach(v => { viewsMap[v.mes] = v.total })

    const clicksMap = {}
    clicks.forEach(c => { clicksMap[c.mes] = c.total })

    const cardClicksMap = {}
    cardClicks.forEach(c => { cardClicksMap[c.mes] = c.total })

    const visitas = meses.map(m => ({
      mes: MESES_LABEL[parseInt(m.split('-')[1]) - 1],
      valor: viewsMap[m] || 0,
    }))

    const productos_clicks = meses.map(m => ({
      mes: MESES_LABEL[parseInt(m.split('-')[1]) - 1],
      valor: clicksMap[m] || 0,
    }))

    const paginasMap = {}
    visitsByPage.forEach(v => { paginasMap[v.pagina] = v.total })

    const tarjeta_clicks = meses.map(m => ({
      mes: MESES_LABEL[parseInt(m.split('-')[1]) - 1],
      valor: cardClicksMap[m] || 0,
    }))

    res.json({
      visitas,
      clicks: productos_clicks,
      card_clicks: tarjeta_clicks,
      resumen: {
        visitas_mes: monthVisits[0]?.total || 0,
        visitantes_unicos: uniqueVisitors[0]?.total || 0,
        por_pagina: paginasMap,
      },
    })
  } catch (err) {
    console.error('Error stats:', err)
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
})

module.exports = router
