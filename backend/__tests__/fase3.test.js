/**
 * Tests de integración — Fase 3 (Branch: feature/db-schema-v2)
 *
 * Valida:
 * - turismo_negocios ya no existe en la BD
 * - businesses contiene todos los negocios (general + turismo)
 * - FKs de turismo_portada/pagina/tours → businesses existen y funcionan
 * - Índice en businesses(tipo) existe
 * - GET /turismo/public sigue funcionando (retrocompatibilidad)
 * - GET /turismo (autenticado) sigue funcionando
 * - GET /servidor/estadisticas devuelve KPIs (fix DATABASE() vs 'soloaunclick')
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') })

const request = require('supertest')
const app = require('../server')
const pool = require('../db')

let authTokenTurismo
let authTokenAdmin

beforeAll(async () => {
  const [r1, r2] = await Promise.all([
    request(app).post('/api/v1/auth/login').send({ email: 'hotel@test.com', password: 'Test1234!' }),
    request(app).post('/api/v1/auth/login').send({ email: 'admin@test.com', password: 'Test1234!' })
  ])
  authTokenTurismo = r1.body.token
  authTokenAdmin = r2.body.token
})

afterAll(async () => {
  // pool se cierra en globalTeardown (__tests__/teardown.js)
})

// ============================================================
// Esquema — Fase 3 cleanup
// ============================================================
describe('Esquema DB — Fase 3 cleanup', () => {
  test('turismo_negocios ya NO existe en la BD', async () => {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS existe
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'turismo_negocios'
    `)
    expect(rows[0].existe).toBe(0)
  })

  test('businesses contiene registros tipo turismo', async () => {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM businesses WHERE tipo = 'turismo'"
    )
    expect(rows[0].total).toBeGreaterThan(0)
  })

  test('businesses contiene registros tipo general', async () => {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM businesses WHERE tipo = 'general'"
    )
    expect(rows[0].total).toBeGreaterThan(0)
  })

  test('FK turismo_portada → businesses existe', async () => {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS existe
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'turismo_portada'
        AND CONSTRAINT_NAME = 'fk_turismo_portada_business'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `)
    expect(rows[0].existe).toBe(1)
  })

  test('FK turismo_pagina → businesses existe', async () => {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS existe
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'turismo_pagina'
        AND CONSTRAINT_NAME = 'fk_turismo_pagina_business'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `)
    expect(rows[0].existe).toBe(1)
  })

  test('FK turismo_tours → businesses existe', async () => {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS existe
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'turismo_tours'
        AND CONSTRAINT_NAME = 'fk_turismo_tours_business'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `)
    expect(rows[0].existe).toBe(1)
  })

  test('índice idx_businesses_tipo existe en businesses', async () => {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS existe
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'businesses'
        AND INDEX_NAME = 'idx_businesses_tipo'
    `)
    expect(rows[0].existe).toBeGreaterThan(0)
  })
})

// ============================================================
// Retrocompatibilidad — rutas turismo siguen funcionando
// ============================================================
describe('Retrocompatibilidad — API turismo post-Fase 3', () => {
  test('GET /turismo/public retorna negocios turismo (sin turismo_negocios)', async () => {
    const res = await request(app).get('/api/v1/turismo/public')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.negocios)).toBe(true)
    expect(res.body.negocios.length).toBeGreaterThan(0)
    // El shape debe tener 'nombre' (mapeado desde nombre_negocio)
    res.body.negocios.forEach(n => {
      expect(n).toHaveProperty('nombre')
      expect(n).toHaveProperty('user_id')
    })
  })

  test('GET /turismo (autenticado) retorna negocio del usuario', async () => {
    const res = await request(app)
      .get('/api/v1/turismo')
      .set('Authorization', `Bearer ${authTokenTurismo}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.negocios)).toBe(true)
    expect(res.body.negocios.length).toBeGreaterThan(0)
    expect(res.body.negocios[0]).toHaveProperty('nombre')
  })

  test('horarios en turismo/public es objeto, no string', async () => {
    const res = await request(app).get('/api/v1/turismo/public')
    res.body.negocios.forEach(n => {
      if (n.horarios !== null) {
        expect(typeof n.horarios).not.toBe('string')
      }
    })
  })

  test('GET /business/public/:userId funciona para negocio turismo', async () => {
    // userId 5 = hotel@test.com (turismo)
    const res = await request(app).get('/api/v1/business/public/5')
    expect(res.status).toBe(200)
    expect(res.body.business).not.toBeNull()
    expect(res.body.business.nombre_negocio).toBeTruthy()
  })
})

// ============================================================
// Fix servidor.js — DATABASE() vs hardcoded 'soloaunclick'
// ============================================================
describe('servidor.js — estadísticas con DATABASE()', () => {
  test('GET /servidor/estadisticas retorna KPIs correctos', async () => {
    const res = await request(app)
      .get('/api/v1/servidor/estadisticas')
      .set('Authorization', `Bearer ${authTokenAdmin}`)
    expect(res.status).toBe(200)
    expect(res.body.kpis).toBeDefined()
    expect(typeof res.body.kpis.total).toBe('number')
    // Con la BD de test debe haber usuarios turismo
    expect(res.body.kpis.turismo_premium).toBeGreaterThan(0)
  })
})

// ============================================================
// Integridad referencial — CASCADE en acción
// ============================================================
describe('Integridad referencial — FK CASCADE', () => {
  test('listings con categoria_id=NULL no fallan el GET público', async () => {
    // Listados con categoría en texto pero sin match FK tienen categoria_id=NULL — deben aparecer igualmente
    const res = await request(app).get('/api/v1/listings')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.listings)).toBe(true)
    // No deben venir errores SQL por la FK nullable
    res.body.listings.forEach(l => {
      expect(l).toHaveProperty('id')
      expect(l).toHaveProperty('nombre')
    })
  })
})
