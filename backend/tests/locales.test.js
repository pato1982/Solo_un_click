const { api, publicApi, DEV_USERS } = require('./setup')

describe('GET /api/v1/locales', () => {
  it('retorna array de locales activos (público)', async () => {
    const res = await publicApi().get('/api/v1/locales')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('locales')
    expect(Array.isArray(res.body.locales)).toBe(true)
  })
})

describe('GET /api/v1/locales/categorias', () => {
  it('retorna categorías de barrio (público)', async () => {
    const res = await publicApi().get('/api/v1/locales/categorias')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('categorias')
    expect(Array.isArray(res.body.categorias)).toBe(true)
  })
})

describe('GET /api/v1/locales/admin', () => {
  it('requiere autenticación', async () => {
    const res = await publicApi().get('/api/v1/locales/admin')
    expect(res.status).toBe(401)
  })

  it('retorna 403 para usuario sin rol programador', async () => {
    const res = await api(DEV_USERS.general_p2).get('/api/v1/locales/admin')
    expect(res.status).toBe(403)
  })

  it('retorna todos los locales para programador', async () => {
    const res = await api(DEV_USERS.programador).get('/api/v1/locales/admin')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('locales')
    expect(Array.isArray(res.body.locales)).toBe(true)
  })
})

describe('POST /api/v1/locales', () => {
  it('requiere autenticación', async () => {
    const res = await publicApi().post('/api/v1/locales').send({ nombre: 'Test' })
    expect(res.status).toBe(401)
  })

  it('rechaza para usuario no programador', async () => {
    const res = await api(DEV_USERS.general_p2)
      .post('/api/v1/locales')
      .send({ nombre: 'Local Test' })
    expect(res.status).toBe(403)
  })

  it('rechaza si falta nombre', async () => {
    const res = await api(DEV_USERS.programador)
      .post('/api/v1/locales')
      .send({ direccion: 'Calle 123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/nombre/i)
  })

  let createdId
  it('crea local como programador', async () => {
    const res = await api(DEV_USERS.programador)
      .post('/api/v1/locales')
      .send({ nombre: 'Local Test Suite', direccion: 'Test 123' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    createdId = res.body.id
  })

  it('actualiza el local creado', async () => {
    if (!createdId) return
    const res = await api(DEV_USERS.programador)
      .put(`/api/v1/locales/${createdId}`)
      .send({ nombre: 'Local Test Actualizado' })
    expect(res.status).toBe(200)
  })

  it('toggle activo/inactivo del local', async () => {
    if (!createdId) return
    const res = await api(DEV_USERS.programador)
      .patch(`/api/v1/locales/${createdId}/toggle`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('activo')
  })

  it('elimina el local creado', async () => {
    if (!createdId) return
    const res = await api(DEV_USERS.programador)
      .delete(`/api/v1/locales/${createdId}`)
    expect(res.status).toBe(200)
  })
})

describe('DELETE /api/v1/locales/:id', () => {
  it('retorna 404 para id inexistente', async () => {
    const res = await api(DEV_USERS.programador).delete('/api/v1/locales/999999')
    expect(res.status).toBe(404)
  })
})
