const nodemailer = require('nodemailer')

// Configuración SMTP — se puede cambiar a cualquier proveedor
// Para Gmail: habilitar "App Passwords" en la cuenta Google
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@soloaunclick.cl'
const SITE_NAME = 'Solo a un Click'
const SITE_URL = process.env.SITE_URL || 'https://soloaunclick.cl'

async function sendPasswordResetEmail(toEmail, userName, token) {
  const resetUrl = `${SITE_URL}?reset=${token}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
      <div style="background: #3B1969; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #E5B800; margin: 0; font-size: 20px;">${SITE_NAME}</h1>
      </div>
      <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 14px;">Hola <strong>${userName}</strong>,</p>
        <p style="color: #6b7280; font-size: 13px;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para continuar:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background: #3B1969; color: #E5B800; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 11px;">Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este correo.</p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 16px 0;" />
        <p style="color: #d1d5db; font-size: 10px; text-align: center;">${SITE_NAME} — Villarrica, Chile</p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to: toEmail,
      subject: `Recupera tu contraseña — ${SITE_NAME}`,
      html,
    })
    return true
  } catch (err) {
    console.error('Error enviando email:', err)
    return false
  }
}

module.exports = { sendPasswordResetEmail }
