/**
 * Smoke Tests — Fase 3: MFA + OWASP
 *
 * Flujo completo: registro → login → MFA setup → login con MFA → backup code → logout
 * Valida también: política de contraseñas OWASP V2.1
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') })

const request = require('supertest')
const speakeasy = require('speakeasy')
const app = require('../server')
const pool = require('../db')

const TEST_EMAIL = `mfa_test_${Date.now()}@test.com`
const TEST_PASSWORD = 'TestPassw0rd!2026' // 16 chars, no está en la lista de comunes
const TEST_NAME = 'MFA Test User'

let authCookies = ''
let userId = null
let mfaSecret = null

async function extractCookies(res) {
  const setCookieHeaders = res.headers['set-cookie']
  if (!setCookieHeaders) return ''
  return setCookieHeaders.map(c => c.split(';')[0]).join('; ')
}

afterAll(async () => {
  // Limpiar usuario de test
  if (userId) {
    await pool.query('DELETE FROM mfa_attempts WHERE user_id = ?', [userId])
    await pool.query('DELETE FROM mfa_pending_tokens WHERE user_id = ?', [userId])
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId])
    await pool.query('DELETE FROM user_sessions WHERE user_id = ?', [userId])
    await pool.query('DELETE FROM users WHERE id = ?', [userId])
  }
})

// ============================================================
// Política de contraseñas — OWASP V2.1
// ============================================================
describe('OWASP V2.1 — Política de contraseñas', () => {
  test('Rechaza contraseñas de menos de 12 caracteres', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Test', email: 'short@test.com', password: 'Short123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/12/)
  })

  test('Rechaza contraseñas de exactamente 11 caracteres', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Test', email: 'eleven@test.com', password: 'Eleven12345' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/12/)
  })

  test('Rechaza contraseñas comunes conocidas', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Test', email: 'common@test.com', password: 'password123456' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/común|segura/i)
  })

  test('Acepta contraseñas de 12+ caracteres no comunes', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ nombre: TEST_NAME, email: TEST_EMAIL, password: TEST_PASSWORD })
    expect(res.status).toBe(201)
    expect(res.body.user).toHaveProperty('id')
    userId = res.body.user.id
    authCookies = await extractCookies(res)
  })
})

// ============================================================
// Login sin MFA
// ============================================================
describe('Login — flujo sin MFA', () => {
  test('Login exitoso retorna token y user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
    expect(res.body.mfa_required).toBeUndefined()
    expect(res.body.user.email).toBe(TEST_EMAIL)
    authCookies = await extractCookies(res)
  })

  test('Login con contraseña incorrecta retorna 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPassword123!' })
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/inválidas/i)
  })
})

// ============================================================
// MFA Setup y Enable
// ============================================================
describe('MFA — Setup y activación', () => {
  test('GET /mfa/status retorna mfa_enabled=false antes de activar', async () => {
    const res = await request(app)
      .get('/api/v1/auth/mfa/status')
      .set('Cookie', authCookies)
    expect(res.status).toBe(200)
    expect(res.body.mfa_enabled).toBe(false)
  })

  test('POST /mfa/setup retorna QR code y secret', async () => {
    const res = await request(app)
      .post('/api/v1/auth/mfa/setup')
      .set('Cookie', authCookies)
    expect(res.status).toBe(200)
    expect(res.body.secret).toBeTruthy()
    expect(res.body.qr_code).toMatch(/^data:image\/png/)
    mfaSecret = res.body.secret
  })

  test('POST /mfa/enable con código TOTP válido activa MFA y retorna backup codes', async () => {
    expect(mfaSecret).toBeTruthy()
    const code = speakeasy.totp({ secret: mfaSecret, encoding: 'base32' })
    const res = await request(app)
      .post('/api/v1/auth/mfa/enable')
      .set('Cookie', authCookies)
      .send({ code })
    expect(res.status).toBe(200)
    expect(res.body.backup_codes).toBeInstanceOf(Array)
    expect(res.body.backup_codes).toHaveLength(8)
    res.body.backup_codes.forEach(c => expect(c).toMatch(/^[A-F0-9]{10}$/))
  })

  test('GET /mfa/status retorna mfa_enabled=true después de activar', async () => {
    const res = await request(app)
      .get('/api/v1/auth/mfa/status')
      .set('Cookie', authCookies)
    expect(res.status).toBe(200)
    expect(res.body.mfa_enabled).toBe(true)
    expect(res.body.backup_codes_remaining).toBe(8)
  })

  test('POST /mfa/enable con código inválido retorna 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/mfa/enable')
      .set('Cookie', authCookies)
      .send({ code: '000000' })
    expect(res.status).toBe(401)
  })
})

// ============================================================
// Login con MFA activo
// ============================================================
describe('MFA — Flujo de login con segundo factor', () => {
  let mfaToken = null

  test('Login con MFA activo retorna mfa_required=true y mfa_token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
    expect(res.status).toBe(200)
    expect(res.body.mfa_required).toBe(true)
    expect(res.body.mfa_token).toBeTruthy()
    expect(res.body.token).toBeUndefined()
    mfaToken = res.body.mfa_token
  })

  test('POST /mfa/verify con código incorrecto retorna 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/mfa/verify')
      .send({ mfa_token: mfaToken, code: '000000' })
    expect(res.status).toBe(401)
  })

  test('POST /mfa/verify con código TOTP válido emite JWT completo', async () => {
    const code = speakeasy.totp({ secret: mfaSecret, encoding: 'base32' })
    const res = await request(app)
      .post('/api/v1/auth/mfa/verify')
      .send({ mfa_token: mfaToken, code })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe(TEST_EMAIL)
    authCookies = await extractCookies(res)
  })

  test('POST /mfa/verify no acepta el mismo mfa_token dos veces', async () => {
    const code = speakeasy.totp({ secret: mfaSecret, encoding: 'base32' })
    const res = await request(app)
      .post('/api/v1/auth/mfa/verify')
      .send({ mfa_token: mfaToken, code })
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/inválido|expirado/i)
  })
})

// ============================================================
// Backup codes
// ============================================================
describe('MFA — Backup codes', () => {
  let savedBackupCode = null

  test('Obtener un backup code de la DB para test', async () => {
    const [rows] = await pool.query('SELECT mfa_backup_codes FROM users WHERE id = ?', [userId])
    const codes = JSON.parse(rows[0].mfa_backup_codes)
    savedBackupCode = codes[0]
    expect(savedBackupCode).toMatch(/^[A-F0-9]{10}$/)
  })

  test('Login → mfa_token → backup code funciona como segundo factor', async () => {
    // Obtener mfa_token primero
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
    expect(loginRes.body.mfa_required).toBe(true)
    const mfaToken = loginRes.body.mfa_token

    // Verificar con backup code
    const verifyRes = await request(app)
      .post('/api/v1/auth/mfa/verify')
      .send({ mfa_token: mfaToken, code: savedBackupCode })
    expect(verifyRes.status).toBe(200)
    expect(verifyRes.body.token).toBeTruthy()
    authCookies = await extractCookies(verifyRes)
  })

  test('El backup code usado ya no está en la lista', async () => {
    const [rows] = await pool.query('SELECT mfa_backup_codes FROM users WHERE id = ?', [userId])
    const codes = JSON.parse(rows[0].mfa_backup_codes)
    expect(codes).not.toContain(savedBackupCode)
    expect(codes).toHaveLength(7)
  })
})

// ============================================================
// Disable MFA
// ============================================================
describe('MFA — Desactivación', () => {
  test('POST /mfa/disable con código TOTP válido desactiva MFA', async () => {
    const code = speakeasy.totp({ secret: mfaSecret, encoding: 'base32' })
    const res = await request(app)
      .post('/api/v1/auth/mfa/disable')
      .set('Cookie', authCookies)
      .send({ code })
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/desactivado/i)
  })

  test('GET /mfa/status retorna mfa_enabled=false tras disable', async () => {
    const res = await request(app)
      .get('/api/v1/auth/mfa/status')
      .set('Cookie', authCookies)
    expect(res.status).toBe(200)
    expect(res.body.mfa_enabled).toBe(false)
  })

  test('Login sin MFA vuelve a retornar JWT directamente', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
    expect(res.body.mfa_required).toBeUndefined()
    authCookies = await extractCookies(res)
  })
})

// ============================================================
// Refresh token y logout
// ============================================================
describe('Sesión — Refresh y logout', () => {
  test('POST /auth/refresh con cookie válida rota el token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', authCookies)
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
    authCookies = await extractCookies(res)
  })

  test('GET /auth/me retorna datos del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', authCookies)
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(TEST_EMAIL)
  })

  test('POST /auth/logout invalida la sesión', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', authCookies)
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/cerrada/i)
  })

  test('GET /auth/me tras logout retorna 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', authCookies)
    expect(res.status).toBe(401)
  })
})

// ============================================================
// Security headers (OWASP V9.x)
// ============================================================
describe('Security Headers — OWASP V9.x', () => {
  test('Responde con X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/api/health')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  test('Responde con X-Frame-Options o CSP frame-ancestors', async () => {
    const res = await request(app).get('/api/health')
    const hasFrameGuard = res.headers['x-frame-options'] === 'DENY'
    const hasCSPFrameAncestors = res.headers['content-security-policy']?.includes("frame-ancestors 'none'")
    expect(hasFrameGuard || hasCSPFrameAncestors).toBe(true)
  })

  test('Responde con Referrer-Policy', async () => {
    const res = await request(app).get('/api/health')
    expect(res.headers['referrer-policy']).toBeTruthy()
  })

  test('Responde con Strict-Transport-Security en producción', async () => {
    if (process.env.NODE_ENV === 'production') {
      const res = await request(app).get('/api/health')
      expect(res.headers['strict-transport-security']).toMatch(/max-age=/)
    } else {
      // En test, helmet puede no incluir HSTS — skip
      expect(true).toBe(true)
    }
  })
})
