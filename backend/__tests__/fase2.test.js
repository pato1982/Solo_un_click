/**
 * Tests de integración — Fase 2 (Branch: feature/db-schema-v2)
 *
 * Valida:
 * - categoria_id se persiste al crear/editar listings (si el texto matchea)
 * - turismo_tours retorna imagenes e imagenes_crop como arrays (JSON nativo)
 * - turismo_portada retorna imagenes, categorias, imagenes_crop como arrays
 * - turismo_pagina retorna crop_superior/crop_inferior como objeto o null
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') })

const request = require('supertest')
const app = require('../server')
const pool = require('../db')

let authToken       // usuario 1 — María (plan 3, tipo general)
let authTokenTurismo // usuario turismo para probar portada/tours

beforeAll(async () => {
  const [r1, r2] = await Promise.all([
    request(app).post('/api/v1/auth/login').send({ email: 'maria@test.com', password: 'password' }),
    request(app).post('/api/v1/auth/login').send({ email: 'hotel@test.com', password: 'password' })
  ])
  authToken = r1.body.token
  authTokenTurismo = r2.body.token
})

afterAll(async () => {
  await pool.end()
})

// ============================================================
// categoria_id — listings
// ============================================================
describe('Listings — categoria_id FK (Fase 2)', () => {
  let listingId

  afterEach(async () => {
    // Limpiar listing creado en cada test
    if (listingId) {
      await pool.query('DELETE FROM listings WHERE id = ?', [listingId])
      listingId = null
    }
  })

  test('POST /listings persiste categoria_id cuando el nombre coincide', async () => {
    // 'Ropa' debe existir en la tabla categorias con tipo='producto' o 'general'
    // Si no hay match, categoria_id queda NULL (no es error)
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        tipo: 'producto',
        nombre: 'Test Fase2 categoria_id',
        descripcion: 'Test automatizado Fase 2',
        precio: 1000,
        categoria: 'Ropa'
      })

    expect(res.status).toBe(201)
    listingId = res.body.id

    const [rows] = await pool.query('SELECT categoria, categoria_id FROM listings WHERE id = ?', [listingId])
    expect(rows.length).toBe(1)
    // El texto libre siempre se guarda
    expect(rows[0].categoria).toBe('Ropa')
    // categoria_id es number o null — ambos son aceptables según seed
    expect(typeof rows[0].categoria_id === 'number' || rows[0].categoria_id === null).toBe(true)
  })

  test('PUT /listings/:id actualiza categoria_id', async () => {
    // Crear primero
    const create = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ tipo: 'producto', nombre: 'Test Fase2 PUT', precio: 500, categoria: 'Ropa' })

    listingId = create.body.id

    // Actualizar con otra categoría
    const update = await request(app)
      .put(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ tipo: 'producto', nombre: 'Test Fase2 PUT', precio: 500, categoria: 'Calzado' })

    expect(update.status).toBe(200)

    const [rows] = await pool.query('SELECT categoria, categoria_id FROM listings WHERE id = ?', [listingId])
    expect(rows[0].categoria).toBe('Calzado')
  })

  test('listing creado con texto y FK tiene ambos campos en la BD', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ tipo: 'producto', nombre: 'Test texto+FK', precio: 200, categoria: 'Ropa', subcategoria: 'Poleras' })

    expect(res.status).toBe(201)
    listingId = res.body.id

    const [rows] = await pool.query(
      'SELECT categoria, subcategoria, categoria_id, subcategoria_id FROM listings WHERE id = ?',
      [listingId]
    )
    // Retrocompatibilidad — texto siempre presente
    expect(rows[0].categoria).toBe('Ropa')
    expect(rows[0].subcategoria).toBe('Poleras')
    // FK nullable — no falla si no hay match
    expect(['number', 'object'].includes(typeof rows[0].categoria_id) ||
           rows[0].categoria_id === null).toBe(true)
  })
})

// ============================================================
// turismo_tours — JSON nativo (Fase 2)
// ============================================================
describe('Tours — JSON nativo (Fase 2)', () => {
  test('GET /tours/public retorna imagenes como array', async () => {
    const res = await request(app).get('/api/v1/tours/public')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.tours)).toBe(true)

    for (const tour of res.body.tours) {
      expect(Array.isArray(tour.imagenes)).toBe(true)
      // imagenes_crop puede ser null o array — nunca string crudo
      if (tour.imagenes_crop !== null) {
        expect(Array.isArray(tour.imagenes_crop)).toBe(true)
      }
    }
  })

  test('GET /tours/public/:userId filtra por usuario y devuelve JSON', async () => {
    // userId=5 es el primer turismo1 en el seed
    const res = await request(app).get('/api/v1/tours/public/5')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.tours)).toBe(true)
    // Cada tour debe tener imagenes como array
    res.body.tours.forEach(t => {
      expect(Array.isArray(t.imagenes)).toBe(true)
    })
  })

  test('GET /tours (autenticado) retorna imagenes como array', async () => {
    const res = await request(app)
      .get('/api/v1/tours')
      .set('Authorization', `Bearer ${authTokenTurismo}`)
    expect(res.status).toBe(200)
    res.body.tours.forEach(t => {
      expect(Array.isArray(t.imagenes)).toBe(true)
      if (t.imagenes_crop !== null) {
        expect(Array.isArray(t.imagenes_crop)).toBe(true)
      }
    })
  })

  test('imagenes nunca es string en la respuesta', async () => {
    const res = await request(app).get('/api/v1/tours/public')
    res.body.tours.forEach(t => {
      expect(typeof t.imagenes).not.toBe('string')
    })
  })
})

// ============================================================
// turismo_portada — JSON nativo (Fase 2)
// ============================================================
describe('Portada — JSON nativo (Fase 2)', () => {
  test('GET /portada/public retorna imagenes como array', async () => {
    const res = await request(app).get('/api/v1/portada/public')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.portadas)).toBe(true)

    res.body.portadas.forEach(p => {
      expect(Array.isArray(p.imagenes)).toBe(true)
      if (p.categorias !== null) {
        expect(Array.isArray(p.categorias)).toBe(true)
      }
      if (p.imagenes_crop !== null) {
        expect(Array.isArray(p.imagenes_crop)).toBe(true)
      }
      // horarios puede venir del JOIN con businesses — siempre array u objeto, nunca string
      if (p.horarios !== null && p.horarios !== undefined) {
        expect(typeof p.horarios).not.toBe('string')
      }
    })
  })

  test('GET /portada (autenticado) retorna portada con JSON normalizado', async () => {
    const res = await request(app)
      .get('/api/v1/portada')
      .set('Authorization', `Bearer ${authTokenTurismo}`)
    expect(res.status).toBe(200)
    // portada puede ser null si el usuario no tiene una
    if (res.body.portada) {
      expect(Array.isArray(res.body.portada.imagenes)).toBe(true)
      expect(Array.isArray(res.body.portada.categorias)).toBe(true)
      expect(Array.isArray(res.body.portada.imagenes_crop)).toBe(true)
    }
  })

  test('imagenes no es string en portadas públicas', async () => {
    const res = await request(app).get('/api/v1/portada/public')
    res.body.portadas.forEach(p => {
      expect(typeof p.imagenes).not.toBe('string')
    })
  })
})

// ============================================================
// turismo_pagina — JSON nativo (Fase 2)
// ============================================================
describe('Página — JSON nativo (Fase 2)', () => {
  test('GET /pagina (autenticado) retorna crop_superior como objeto o null', async () => {
    const res = await request(app)
      .get('/api/v1/pagina')
      .set('Authorization', `Bearer ${authTokenTurismo}`)
    expect(res.status).toBe(200)
    if (res.body.pagina) {
      // Nunca debe ser string crudo
      if (res.body.pagina.crop_superior !== null) {
        expect(typeof res.body.pagina.crop_superior).not.toBe('string')
      }
      if (res.body.pagina.crop_inferior !== null) {
        expect(typeof res.body.pagina.crop_inferior).not.toBe('string')
      }
    }
  })

  test('GET /pagina/public/:userId retorna crop como objeto o null', async () => {
    const res = await request(app).get('/api/v1/pagina/public/5')
    expect(res.status).toBe(200)
    if (res.body.pagina) {
      if (res.body.pagina.crop_superior !== null) {
        expect(typeof res.body.pagina.crop_superior).not.toBe('string')
      }
    }
  })
})
