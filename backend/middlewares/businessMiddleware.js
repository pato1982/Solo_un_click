const pool = require('../db')

async function attachBusinessId(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' })
  try {
    const [rows] = await pool.query(
      'SELECT id FROM businesses WHERE user_id = ? LIMIT 1',
      [req.userId]
    )
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Usuario sin negocio asociado' })
    }
    req.businessId = rows[0].id
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { attachBusinessId }
