const pool = require('./db')

/**
 * Registra una acción en activity_log
 * @param {number} userId - ID del usuario que realizó la acción
 * @param {string} accion - Tipo: 'crear', 'editar', 'eliminar'
 * @param {string} entidad - Ej: 'listing', 'tour', 'portada', 'business', 'carousel'
 * @param {number|null} entidadId - ID del registro afectado
 * @param {object|null} detalles - Info adicional (JSON)
 */
async function logActivity(userId, accion, entidad, entidadId = null, detalles = null) {
  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, accion, entidad, entidad_id, detalles) VALUES (?, ?, ?, ?, ?)',
      [userId, accion, entidad, entidadId, detalles ? JSON.stringify(detalles) : null]
    )
  } catch (err) {
    console.error('Error registrando actividad:', err)
  }
}

module.exports = logActivity
