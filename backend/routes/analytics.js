const express = require('express')
const pool = require('../db')
const { authMiddleware } = require('./auth')

const router = express.Router()

// POST /api/analytics/track — registrar evento (público, sin auth)
router.post('/track', async (req, res) => {
  try {
    const { user_id, event_type, listing_id } = req.body
    if (!user_id || !event_type) return res.status(400).json({ error: 'Faltan datos' })
    if (!['page_view', 'product_click'].includes(event_type)) return res.status(400).json({ error: 'Tipo inválido' })

    await pool.query(
      'INSERT INTO analytics (user_id, event_type, listing_id) VALUES (?, ?, ?)',
      [user_id, event_type, listing_id || null]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('Error tracking:', err)
    res.status(500).json({ error: 'Error al registrar evento' })
  }
})

// GET /api/analytics/stats — estadísticas mensuales del usuario autenticado
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Últimos 6 meses de visitas a la página
    const [views] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as mes, COUNT(*) as total
       FROM analytics
       WHERE user_id = ? AND event_type = 'page_view' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
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

    // Generar array de últimos 6 meses con valores (rellenar meses sin datos con 0)
    const meses = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      meses.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'))
    }

    const MESES_LABEL = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    const viewsMap = {}
    views.forEach(v => { viewsMap[v.mes] = v.total })

    const clicksMap = {}
    clicks.forEach(c => { clicksMap[c.mes] = c.total })

    const visitas = meses.map(m => ({
      mes: MESES_LABEL[parseInt(m.split('-')[1]) - 1],
      valor: viewsMap[m] || 0,
    }))

    const productos_clicks = meses.map(m => ({
      mes: MESES_LABEL[parseInt(m.split('-')[1]) - 1],
      valor: clicksMap[m] || 0,
    }))

    res.json({ visitas, clicks: productos_clicks })
  } catch (err) {
    console.error('Error stats:', err)
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
})

module.exports = router
