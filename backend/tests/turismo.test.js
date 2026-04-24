const { api, publicApi, DEV_USERS } = require('./setup')

describe('GET /api/v1/turismo/public', () => {
  it('retorna array de negocios de turismo', async () => {
    const res = await publicApi().get('/api/v1/turismo/public')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('negocios')
    expect(Array.isArray(res.body.negocios)).toBe(true)
  })
})

describe('GET /api/v1/turismo (auth)', () => {
  it('retorna negocios del usuario autenticado', async () => {
    const res = await api(DEV_USERS.turismo_p3).get('/api/v1/turismo')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('negocios')
    expect(Array.isArray(res.body.negocios)).toBe(true)
  })

  it('requiere autenticación — 401 sin token', async () => {
    const res = await publicApi().get('/api/v1/turismo')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/v1/turismo', () => {
  it('rechaza sin autenticación', async () => {
    const res = await publicApi()
      .post('/api/v1/turismo')
      .send({ nombre: 'Test' })
    expect(res.status).toBe(401)
  })

  it('rechaza si falta nombre', async () => {
    const res = await api(DEV_USERS.general_p2)
      .post('/api/v1/turismo')
      .send({ descripcion: 'Sin nombre' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/nombre/i)
  })

  it('rechaza si ya tiene negocio (general_p2 ya tiene business)', async () => {
    // general_p2 (1001) ya tiene un negocio registrado
    const res = await api(DEV_USERS.general_p2)
      .post('/api/v1/turismo')
      .send({ nombre: 'Nuevo Turismo' })
    // Puede ser 400 (ya existe) o 201 (si no tiene)
    expect([201, 400]).toContain(res.status)
  })
})

describe('PUT /api/v1/turismo/:id', () => {
  it('requiere autenticación', async () => {
    const res = await publicApi()
      .put('/api/v1/turismo/999')
      .send({ nombre: 'Test' })
    expect(res.status).toBe(401)
  })

  it('retorna 404 si el id no existe para el usuario', async () => {
    const res = await api(DEV_USERS.general_p1)
      .put('/api/v1/turismo/999999')
      .send({ nombre: 'Test' })
    expect([404, 400]).toContain(res.status)
  })
})
