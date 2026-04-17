const pool = require('../db')
const logger = require('../logger')

/**
 * Middleware: requirePlan(minPlanId)
 * Verifica que el usuario autenticado tenga plan >= minPlanId.
 * Debe usarse DESPUÉS de authMiddleware (req.userId debe estar disponible).
 *
 * Uso:
 *   router.post('/', authMiddleware, requirePlan(3), async (req, res) => { ... })
 *
 * Plan IDs: 1 = Gratis, 2 = Normal, 3 = Premium
 */
function requirePlan(minPlanId) {
  const PLAN_NAMES = { 1: 'Gratis', 2: 'Normal', 3: 'Premium' }
  return async (req, res, next) => {
    try {
      const [rows] = await pool.query(
        'SELECT plan_id FROM users WHERE id = ?',
        [req.userId]
      )
      if (!rows.length) {
        return res.status(404).json({ error: 'Usuario no encontrado' })
      }
      if (rows[0].plan_id < minPlanId) {
        return res.status(403).json({
          error: `Se requiere Plan ${PLAN_NAMES[minPlanId] || minPlanId} para esta acción`
        })
      }
      req.userPlanId = rows[0].plan_id
      next()
    } catch (err) {
      logger.error('Error verificando plan', { error: err.message })
      res.status(500).json({ error: 'Error al verificar plan' })
    }
  }
}

module.exports = { requirePlan }
