const express = require('express')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const pool = require('../db')
const { sendPasswordResetEmail } = require('../mailer')
const logger = require('../logger')

const router = express.Router()

// POST /api/password-reset/request — solicitar recuperación de contraseña
router.post('/request', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const { email } = req.body

    // Verificar que el usuario existe
    const [users] = await pool.query('SELECT id, nombre FROM users WHERE email = ? AND activo = 1', [email])
    if (users.length === 0) {
      // No revelar si el email existe o no (seguridad)
      return res.json({ message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' })
    }

    const user = users[0]

    // Invalidar tokens anteriores del usuario
    await pool.query(
      'UPDATE password_resets SET usado = 1 WHERE user_id = ? AND usado = 0',
      [user.id]
    )

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    )

    // Enviar email (si SMTP está configurado, sino solo loguea)
    const sent = await sendPasswordResetEmail(email, user.nombre, token)
    if (!sent) {
      console.log(`[PASSWORD RESET] Email no enviado (SMTP no configurado). Token para ${email}: ${token}`)
    }

    res.json({ message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' })
  } catch (err) {
    logger.error('Error en solicitud de reset', { error: err.message })
    res.status(500).json({ error: 'Error al procesar solicitud' })
  }
})

// POST /api/password-reset/validate — verificar si un token es válido
router.post('/validate', async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Token requerido' })

    const [rows] = await pool.query(
      'SELECT id, user_id FROM password_resets WHERE token = ? AND usado = 0 AND expires_at > NOW()',
      [token]
    )

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' })
    }

    res.json({ valid: true })
  } catch (err) {
    logger.error('Error validando token', { error: err.message })
    res.status(500).json({ error: 'Error al validar token' })
  }
})

// POST /api/password-reset/reset — cambiar la contraseña con token válido
router.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ error: 'Token y contraseña requeridos' })

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }

    // Buscar token válido
    const [rows] = await pool.query(
      'SELECT id, user_id FROM password_resets WHERE token = ? AND usado = 0 AND expires_at > NOW()',
      [token]
    )

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' })
    }

    const resetRow = rows[0]

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetRow.user_id])

    // Marcar token como usado
    await pool.query('UPDATE password_resets SET usado = 1 WHERE id = ?', [resetRow.id])

    res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (err) {
    logger.error('Error al cambiar contraseña', { error: err.message })
    res.status(500).json({ error: 'Error al cambiar contraseña' })
  }
})

module.exports = router
