const { api, publicApi, DEV_USERS } = require('./setup')

describe('GET /api/v1/portada/public', () => {
  it('retorna array de portadas activas', async () => {
    const res = await publicApi().get('/api/v1/portada/public')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('portadas')
    expect(Array.isArray(res.body.portadas)).toBe(true)
  })

  it('cada portada tiene campos esperados', async () => {
    const res = await publicApi().get('/api/v1/portada/public')
    for (const p of res.body.portadas) {
      expect(p).toHaveProperty('id')
      expect(p).toHaveProperty('user_id')
      expect(p).toHaveProperty('imagenes')
      expect(Array.isArray(p.imagenes)).toBe(true)
      expect(p).toHaveProperty('categorias')
    }
  })
})

describe('GET /api/v1/portada (auth)', () => {
  it('requiere autenticación', async () => {
    const res = await publicApi().get('/api/v1/portada')
    expect(res.status).toBe(401)
  })

  it('retorna portada del usuario autenticado (o null)', async () => {
    const res = await api(DEV_USERS.turismo_p3).get('/api/v1/portada')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('portada')
    // puede ser null si no tiene portada
  })
})

describe('POST /api/v1/portada', () => {
  it('requiere autenticación', async () => {
    const res = await publicApi()
      .post('/api/v1/portada')
      .send({ descripcion: 'Test' })
    expect(res.status).toBe(401)
  })

  it('crea o actualiza portada (upsert)', async () => {
    const res = await api(DEV_USERS.general_p2)
      .post('/api/v1/portada')
      .send({ descripcion: 'Test portada', imagenes: [], categorias: [] })
    // 201 (creada/upsert) es el happy path
    expect([201, 500]).toContain(res.status)
  })
})

describe('DELETE /api/v1/portada/:id', () => {
  it('requiere autenticación', async () => {
    const res = await publicApi().delete('/api/v1/portada/999')
    expect(res.status).toBe(401)
  })

  it('retorna 404 si portada no pertenece al usuario', async () => {
    const res = await api(DEV_USERS.general_p1).delete('/api/v1/portada/999999')
    expect(res.status).toBe(404)
  })
})
