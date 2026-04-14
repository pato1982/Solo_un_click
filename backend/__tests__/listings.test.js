/**
 * Tests de integración — listings con soft delete (Fase 1)
 * Branch: feature/db-schema-v2
 *
 * Valida:
 * - GET /api/v1/listings no retorna listings con deleted_at
 * - DELETE /api/v1/listings/:id hace soft delete (no borra físicamente)
 * - El listing eliminado sigue en la BD con deleted_at != NULL
 * - Listings activos sin deleted_at aparecen normalmente
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') })

const request = require('supertest')
const app = require('../server')
const pool = require('../db')

let authToken  // usuario 1 (María - plan 3, tiene listings)

beforeAll(async () => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'maria@test.com', password: 'password' })
  authToken = res.body.token
})

afterAll(async () => {
  // pool se cierra en globalTeardown (__tests__/teardown.js)
})

// =====================
// GET /api/v1/listings — listings públicos
// =====================
describe('GET /listings (público)', () => {
  test('retorna listings activos', async () => {
    const res = await request(app).get('/api/v1/listings')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.listings)).toBe(true)
    expect(res.body.listings.length).toBeGreaterThan(0)
  })

  test('NO retorna listings con deleted_at (soft-deleted)', async () => {
    const res = await request(app).get('/api/v1/listings')
    // El listing id=14 del seed tiene deleted_at seteado
    const deletedListing = res.body.listings.find(l => l.nombre === 'Producto Eliminado Test')
    expect(deletedListing).toBeUndefined()
  })

  test('NO retorna listings inactivos', async () => {
    const res = await request(app).get('/api/v1/listings')
    res.body.listings.forEach(l => {
      expect(l.activo).toBe(1)
    })
  })

  test('retorna info del negocio (JOIN con businesses)', async () => {
    const res = await request(app).get('/api/v1/listings?user_id=1')
    expect(res.status).toBe(200)
    // El JOIN con businesses debe traer nombre_negocio
    res.body.listings.forEach(l => {
      expect(l).toHaveProperty('nombre_negocio')
    })
  })
})

// =====================
// DELETE /api/v1/listings/:id — soft delete
// =====================
describe('DELETE /listings/:id (soft delete)', () => {
  let newListingId

  // Crear un listing temporal para eliminarlo
  beforeEach(async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        tipo: 'producto',
        nombre: 'Producto Test Para Eliminar',
        descripcion: 'Se eliminará con soft delete',
        precio: 9990,
        categoria: 'Ropa',
        activo: 1
      })
    newListingId = res.body.id
  })

  test('DELETE retorna 200 y mensaje de éxito', async () => {
    const res = await request(app)
      .delete(`/api/v1/listings/${newListingId}`)
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(200)
    expect(res.body.message).toContain('eliminada')
  })

  test('listing eliminado tiene deleted_at en la BD', async () => {
    await request(app)
      .delete(`/api/v1/listings/${newListingId}`)
      .set('Authorization', `Bearer ${authToken}`)

    // Verificar directamente en BD que NO fue borrado físicamente
    const [rows] = await pool.query('SELECT * FROM listings WHERE id = ?', [newListingId])
    expect(rows.length).toBe(1)  // Sigue existiendo
    expect(rows[0].deleted_at).not.toBeNull()  // Pero tiene deleted_at
    expect(rows[0].activo).toBe(0)
  })

  test('listing soft-deleted NO aparece en GET /listings', async () => {
    await request(app)
      .delete(`/api/v1/listings/${newListingId}`)
      .set('Authorization', `Bearer ${authToken}`)

    const res = await request(app).get('/api/v1/listings')
    const found = res.body.listings.find(l => l.id === newListingId)
    expect(found).toBeUndefined()
  })

  test('DELETE sin auth retorna 401', async () => {
    const res = await request(app).delete(`/api/v1/listings/${newListingId}`)
    expect(res.status).toBe(401)
  })
})
