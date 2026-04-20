const pool = require('../db')
const logger = require('../logger')

async function attachBusinessId(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' })
  try {
    const [rows] = await pool.query(
      'SELECT id FROM businesses WHERE user_id = ? LIMIT 1',
      [req.userId]
    )
    if (rows.length === 0) {
      // Dev bypass: crear business automáticamente para el usuario de desarrollo
      if (process.env.DEV_BYPASS === 'true' && req.isDevBypass) {
        logger.info('business:dev_autocreate', { userId: req.userId })
        const [result] = await pool.query(
          'INSERT INTO businesses (user_id, nombre_negocio, activo) VALUES (?, ?, 1)',
          [req.userId, 'Dev Business']
        )
        req.businessId = result.insertId
        return next()
      }
      return res.status(403).json({ error: 'Usuario sin negocio asociado' })
    }
    req.businessId = rows[0].id
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { attachBusinessId }
