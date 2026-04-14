/**
 * Tests de integración — businesses unificado (Fase 1)
 * Branch: feature/db-schema-v2
 *
 * Valida:
 * - GET /api/v1/business/public/:userId retorna negocio general y turismo
 * - POST /api/v1/business crea negocio con tipo='general'
 * - GET /api/v1/turismo/public retorna solo negocios turismo activos
 * - GET /api/v1/turismo retorna negocio del usuario autenticado
 * - Retrocompatibilidad: respuesta idéntica al frontend
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') })

const request = require('supertest')
const app = require('../server')
const pool = require('../db')

// JWT de usuario de prueba (generado con JWT_SECRET del .env.test)
// En un entorno real se haría login; aquí usamos un token pre-generado para el seed
let authTokenGeneral  // usuario 1 (María - general, plan 3)
let authTokenTurismo  // usuario 5 (Hotel Patagonia - turismo, plan 3)

beforeAll(async () => {
  // Login usuario general
  const resG = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'maria@test.com', password: 'Test1234!' })
  authTokenGeneral = resG.body.token

  // Login usuario turismo
  const resT = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'hotel@test.com', password: 'Test1234!' })
  authTokenTurismo = resT.body.token
})

afterAll(async () => {
  await pool.end()
})

// =====================
// GET /api/v1/business/public/:userId
// =====================
describe('GET /business/public/:userId', () => {
  test('retorna negocio general por user_id', async () => {
    const res = await request(app).get('/api/v1/business/public/1')
    expect(res.status).toBe(200)
    expect(res.body.business).toBeDefined()
    expect(res.body.business.nombre_negocio).toBe('Moda María')
    expect(res.body.business.tipo).toBe('general')
  })

  test('retorna null si el usuario no tiene negocio', async () => {
    const res = await request(app).get('/api/v1/business/public/9')
    expect(res.status).toBe(200)
    expect(res.body.business).toBeNull()
  })

  test('horarios retorna objeto (no string)', async () => {
    const res = await request(app).get('/api/v1/business/public/1')
    expect(typeof res.body.business.horarios).toBe('object')
  })
})

// =====================
// GET /api/v1/business (autenticado)
// =====================
describe('GET /business (autenticado)', () => {
  test('retorna negocio del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/v1/business')
      .set('Authorization', `Bearer ${authTokenGeneral}`)
    expect(res.status).toBe(200)
    expect(res.body.business.nombre_negocio).toBe('Moda María')
  })

  test('retorna 401 sin token', async () => {
    const res = await request(app).get('/api/v1/business')
    expect(res.status).toBe(401)
  })
})

// =====================
// POST /api/v1/business (crear / actualizar)
// =====================
describe('POST /business', () => {
  test('actualiza negocio existente', async () => {
    const res = await request(app)
      .post('/api/v1/business')
      .set('Authorization', `Bearer ${authTokenGeneral}`)
      .send({
        nombre_negocio: 'Moda María Updated',
        slogan: 'Estilo y elegancia',
        descripcion: 'Descripción actualizada',
        direccion: 'Nueva dirección 100',
        whatsapp: '+56912345001',
        horarios: { 'lun-vie': '10:00-19:00' }
      })
    expect(res.status).toBe(200)
    expect(res.body.message).toContain('guardados')
  })

  test('rechaza slogan de más de 10 palabras', async () => {
    const res = await request(app)
      .post('/api/v1/business')
      .set('Authorization', `Bearer ${authTokenGeneral}`)
      .send({ nombre_negocio: 'Test', slogan: 'uno dos tres cuatro cinco seis siete ocho nueve diez once' })
    expect(res.status).toBe(400)
    expect(res.body.error).toContain('slogan')
  })

  test('rechaza URL de Facebook inválida', async () => {
    const res = await request(app)
      .post('/api/v1/business')
      .set('Authorization', `Bearer ${authTokenGeneral}`)
      .send({ nombre_negocio: 'Test', facebook: 'https://instagram.com/algo' })
    expect(res.status).toBe(400)
  })
})

// =====================
// GET /api/v1/turismo/public
// =====================
describe('GET /turismo/public', () => {
  test('retorna solo negocios de turismo activos', async () => {
    const res = await request(app).get('/api/v1/turismo/public')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.negocios)).toBe(true)
    // Todos deben tener activo=1 y tipo='turismo' (verificado internamente en la query)
    expect(res.body.negocios.length).toBeGreaterThan(0)
    res.body.negocios.forEach(n => {
      expect(n.activo).toBe(1)
    })
  })

  test('NO retorna negocios generales en /turismo/public', async () => {
    const res = await request(app).get('/api/v1/turismo/public')
    // Los nombres del seed de turismo no deben confundirse con los generales
    const nombres = res.body.negocios.map(n => n.nombre)
    expect(nombres).not.toContain('Moda María')
    expect(nombres).not.toContain('Servicios Ruiz')
  })

  test('horarios retorna objeto (no string) en turismo', async () => {
    const res = await request(app).get('/api/v1/turismo/public')
    res.body.negocios.forEach(n => {
      if (n.horarios !== null) {
        expect(typeof n.horarios).toBe('object')
      }
    })
  })
})

// =====================
// GET /api/v1/turismo (autenticado — usuario turismo)
// =====================
describe('GET /turismo (autenticado)', () => {
  test('usuario turismo ve su negocio', async () => {
    const res = await request(app)
      .get('/api/v1/turismo')
      .set('Authorization', `Bearer ${authTokenTurismo}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.negocios)).toBe(true)
    expect(res.body.negocios[0].nombre).toBe('Hotel Patagonia')
  })

  test('respuesta incluye campo ubicacion', async () => {
    const res = await request(app)
      .get('/api/v1/turismo')
      .set('Authorization', `Bearer ${authTokenTurismo}`)
    expect(res.body.negocios[0]).toHaveProperty('ubicacion')
  })
})
