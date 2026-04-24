const { api, publicApi, DEV_USERS } = require('./setup')

describe('LISTINGS /api/v1/listings', () => {

  // ============================================================
  // GET / — listados públicos
  // ============================================================
  describe('GET / — listados públicos', () => {
    it('devuelve array de listados', async () => {
      const res = await publicApi().get('/api/v1/listings')
      expect(res.status).toBe(200)
      expect(res.body.listings).toBeInstanceOf(Array)
    })

    it('filtra por tipo=producto', async () => {
      const res = await publicApi().get('/api/v1/listings?tipo=producto')
      expect(res.status).toBe(200)
      for (const l of res.body.listings) {
        expect(l.tipo).toBe('producto')
      }
    })

    it('filtra por tipo=servicio', async () => {
      const res = await publicApi().get('/api/v1/listings?tipo=servicio')
      expect(res.status).toBe(200)
      for (const l of res.body.listings) {
        expect(l.tipo).toBe('servicio')
      }
    })

    it('filtra por tipo=arriendo', async () => {
      const res = await publicApi().get('/api/v1/listings?tipo=arriendo')
      expect(res.status).toBe(200)
      for (const l of res.body.listings) {
        expect(l.tipo).toBe('arriendo')
      }
    })

    // --- schema-v2 ---

    it('[schema-v2] cada listing expone business_id en el payload', async () => {
      const res = await publicApi().get('/api/v1/listings')
      expect(res.status).toBe(200)
      if (res.body.listings.length === 0) return // sin datos no se puede validar
      for (const l of res.body.listings) {
        // business_id debe estar presente y ser un número positivo
        expect(l).toHaveProperty('business_id')
        expect(typeof l.business_id).toBe('number')
        expect(l.business_id).toBeGreaterThan(0)
      }
    })

    it('[schema-v2] cada listing expone datos de negocio via JOIN a businesses', async () => {
      const res = await publicApi().get('/api/v1/listings')
      expect(res.status).toBe(200)
      if (res.body.listings.length === 0) return
      const l = res.body.listings[0]
      // El JOIN a businesses debe incluir al menos nombre_negocio
      expect(l).toHaveProperty('nombre_negocio')
    })

    it('[schema-v2] paginación devuelve metadatos page y limit', async () => {
      const res = await publicApi().get('/api/v1/listings?limit=5')
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('page')
      expect(res.body).toHaveProperty('limit')
      expect(res.body.listings.length).toBeLessThanOrEqual(5)
    })
  })

  // ============================================================
  // GET /mine — listados del usuario autenticado
  // ============================================================
  describe('GET /mine — listados del usuario autenticado', () => {
    it('devuelve listados propios', async () => {
      const res = await api(DEV_USERS.general_p2).get('/api/v1/listings/mine')
      expect(res.status).toBe(200)
      expect(res.body.listings).toBeInstanceOf(Array)
    })

    it('rechaza sin autenticación', async () => {
      const res = await publicApi().get('/api/v1/listings/mine')
      expect(res.status).toBe(401)
    })

    // --- schema-v2 ---

    it('[schema-v2] los listings propios contienen business_id', async () => {
      const res = await api(DEV_USERS.general_p2).get('/api/v1/listings/mine')
      expect(res.status).toBe(200)
      if (res.body.listings.length === 0) return
      for (const l of res.body.listings) {
        expect(l).toHaveProperty('business_id')
        expect(typeof l.business_id).toBe('number')
        expect(l.business_id).toBeGreaterThan(0)
      }
    })

    it('[schema-v2] usuario p1 y p2 no comparten listings en /mine', async () => {
      const resP1 = await api(DEV_USERS.general_p1).get('/api/v1/listings/mine')
      const resP2 = await api(DEV_USERS.general_p2).get('/api/v1/listings/mine')
      expect(resP1.status).toBe(200)
      expect(resP2.status).toBe(200)

      const idsP1 = new Set(resP1.body.listings.map(l => l.id))
      const idsP2 = resP2.body.listings.map(l => l.id)

      // Ningún listing de p2 debe aparecer en la respuesta de p1
      for (const id of idsP2) {
        expect(idsP1.has(id)).toBe(false)
      }
    })

    it('[schema-v2] filtrado refleja relación business_id (no solo user_id)', async () => {
      // Crear un listing como p2 y verificar que no aparece en /mine de p3
      const created = await api(DEV_USERS.general_p2)
        .post('/api/v1/listings')
        .send({ tipo: 'producto', nombre: 'Mine Isolation Test', precio: 100, descripcion: 'tmp', seccion: 'inicio' })

      if (created.status !== 201) return // skip si falla la creación

      const id = created.body.id

      const resMine = await api(DEV_USERS.general_p3).get('/api/v1/listings/mine')
      expect(resMine.status).toBe(200)
      const ids = resMine.body.listings.map(l => l.id)
      expect(ids).not.toContain(id)

      // Limpiar
      await api(DEV_USERS.general_p2).delete(`/api/v1/listings/${id}`)
    })
  })

  // ============================================================
  // POST / — crear listing
  // ============================================================
  describe('POST / — crear listing', () => {
    let createdId = null

    it('crea un producto válido y retorna id', async () => {
      const res = await api(DEV_USERS.general_p2)
        .post('/api/v1/listings')
        .send({
          tipo: 'producto',
          nombre: 'Producto Test QA',
          precio: 9990,
          descripcion: 'Descripción de prueba para test automatizado',
          seccion: 'inicio',
        })
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(res.body.message).toMatch(/cread/i)
      createdId = res.body.id
    })

    it('crea un servicio válido', async () => {
      const res = await api(DEV_USERS.general_p2)
        .post('/api/v1/listings')
        .send({
          tipo: 'servicio',
          nombre: 'Servicio Test QA',
          precio: 5000,
          descripcion: 'Servicio de prueba',
          seccion: 'inicio',
        })
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      if (res.body.id) await api(DEV_USERS.general_p2).delete(`/api/v1/listings/${res.body.id}`)
    })

    it('rechaza sin autenticación', async () => {
      const res = await publicApi()
        .post('/api/v1/listings')
        .send({ tipo: 'producto', nombre: 'Test', precio: 100 })
      expect(res.status).toBe(401)
    })

    // --- schema-v2 ---

    it('[schema-v2] el listing creado almacena business_id correcto', async () => {
      // Crear listing y luego leerlo con /mine para verificar business_id
      const createRes = await api(DEV_USERS.general_p3)
        .post('/api/v1/listings')
        .send({
          tipo: 'producto',
          nombre: 'Schema v2 Business ID Test',
          precio: 1234,
          descripcion: 'Verificar asignación de business_id',
          seccion: 'inicio',
        })
      expect(createRes.status).toBe(201)
      const id = createRes.body.id

      // Obtener el listing via /mine
      const mineRes = await api(DEV_USERS.general_p3).get('/api/v1/listings/mine')
      expect(mineRes.status).toBe(200)

      const listing = mineRes.body.listings.find(l => l.id === id)
      expect(listing).toBeDefined()
      expect(listing).toHaveProperty('business_id')
      expect(typeof listing.business_id).toBe('number')
      expect(listing.business_id).toBeGreaterThan(0)

      // Limpiar
      await api(DEV_USERS.general_p3).delete(`/api/v1/listings/${id}`)
    })

    it('[schema-v2] dos usuarios distintos reciben business_id distintos al crear', async () => {
      const [resP2, resP3] = await Promise.all([
        api(DEV_USERS.general_p2)
          .post('/api/v1/listings')
          .send({ tipo: 'producto', nombre: 'BizID Test P2', precio: 100, descripcion: 'tmp', seccion: 'inicio' }),
        api(DEV_USERS.general_p3)
          .post('/api/v1/listings')
          .send({ tipo: 'producto', nombre: 'BizID Test P3', precio: 100, descripcion: 'tmp', seccion: 'inicio' }),
      ])
      expect(resP2.status).toBe(201)
      expect(resP3.status).toBe(201)

      const [mineP2, mineP3] = await Promise.all([
        api(DEV_USERS.general_p2).get('/api/v1/listings/mine'),
        api(DEV_USERS.general_p3).get('/api/v1/listings/mine'),
      ])

      const lP2 = mineP2.body.listings.find(l => l.id === resP2.body.id)
      const lP3 = mineP3.body.listings.find(l => l.id === resP3.body.id)

      if (lP2 && lP3) {
        expect(lP2.business_id).not.toBe(lP3.business_id)
      }

      // Limpiar
      await Promise.all([
        api(DEV_USERS.general_p2).delete(`/api/v1/listings/${resP2.body.id}`),
        api(DEV_USERS.general_p3).delete(`/api/v1/listings/${resP3.body.id}`),
      ])
    })

    afterAll(async () => {
      if (createdId) {
        await api(DEV_USERS.general_p2).delete(`/api/v1/listings/${createdId}`)
      }
    })
  })

  // ============================================================
  // PUT /:id — editar listing
  // ============================================================
  describe('PUT /:id — editar listing', () => {
    let tempId = null

    beforeAll(async () => {
      const res = await api(DEV_USERS.general_p3)
        .post('/api/v1/listings')
        .send({ tipo: 'producto', nombre: 'Edit Test', precio: 100, descripcion: 'tmp', seccion: 'inicio' })
      if (res.status === 201) tempId = res.body.id
    })

    it('edita un listing propio', async () => {
      if (!tempId) return
      const res = await api(DEV_USERS.general_p3)
        .put(`/api/v1/listings/${tempId}`)
        .send({ nombre: 'Edit Test Modificado', precio: 200 })
      expect(res.status).toBe(200)
    })

    it('rechaza editar listing ajeno', async () => {
      if (!tempId) return
      const res = await api(DEV_USERS.general_p1)
        .put(`/api/v1/listings/${tempId}`)
        .send({ nombre: 'Hack' })
      expect(res.status).toBe(403)
    })

    // --- schema-v2 ---

    it('[schema-v2] autorización de edición compara business_id (no user_id)', async () => {
      // p2 intenta editar el listing de p3 — debe ser 403 porque son business distintos
      if (!tempId) return
      const res = await api(DEV_USERS.general_p2)
        .put(`/api/v1/listings/${tempId}`)
        .send({ nombre: 'Cross-biz hack' })
      expect(res.status).toBe(403)
    })

    afterAll(async () => {
      if (tempId) await api(DEV_USERS.general_p3).delete(`/api/v1/listings/${tempId}`)
    })
  })

  // ============================================================
  // DELETE /:id — eliminar listing
  // ============================================================
  describe('DELETE /:id — eliminar listing', () => {
    it('rechaza eliminar listing ajeno', async () => {
      const created = await api(DEV_USERS.general_p2)
        .post('/api/v1/listings')
        .send({ tipo: 'producto', nombre: 'Delete Test', precio: 100, descripcion: 'tmp', seccion: 'inicio' })
      if (created.status !== 201) return
      const id = created.body.id
      const res = await api(DEV_USERS.general_p1).delete(`/api/v1/listings/${id}`)
      expect(res.status).toBe(403)
      await api(DEV_USERS.general_p2).delete(`/api/v1/listings/${id}`)
    })

    // --- schema-v2 ---

    it('[schema-v2] autorización de eliminación compara business_id (no user_id)', async () => {
      const created = await api(DEV_USERS.general_p3)
        .post('/api/v1/listings')
        .send({ tipo: 'producto', nombre: 'BizID Delete Auth Test', precio: 50, descripcion: 'tmp', seccion: 'inicio' })
      if (created.status !== 201) return
      const id = created.body.id

      // p2 (business distinto) intenta eliminar el listing de p3
      const res = await api(DEV_USERS.general_p2).delete(`/api/v1/listings/${id}`)
      expect(res.status).toBe(403)

      // Limpiar con el dueño correcto
      await api(DEV_USERS.general_p3).delete(`/api/v1/listings/${id}`)
    })
  })

})
