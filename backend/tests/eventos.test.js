const { api, publicApi, DEV_USERS } = require('./setup')

describe('GET /api/v1/eventos', () => {
  it('retorna array de eventos activos (público)', async () => {
    const res = await publicApi().get('/api/v1/eventos')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('eventos')
    expect(Array.isArray(res.body.eventos)).toBe(true)
  })
})

describe('GET /api/v1/eventos/categorias', () => {
  it('retorna categorías de evento (público)', async () => {
    const res = await publicApi().get('/api/v1/eventos/categorias')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('categorias')
    expect(Array.isArray(res.body.categorias)).toBe(true)
  })
})

describe('GET /api/v1/eventos/admin', () => {
  it('requiere autenticación', async () => {
    const res = await publicApi().get('/api/v1/eventos/admin')
    expect(res.status).toBe(401)
  })

  it('retorna 403 para usuario sin rol programador', async () => {
    const res = await api(DEV_USERS.general_p2).get('/api/v1/eventos/admin')
    expect(res.status).toBe(403)
  })

  it('retorna todos los eventos para programador', async () => {
    const res = await api(DEV_USERS.programador).get('/api/v1/eventos/admin')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('eventos')
    expect(Array.isArray(res.body.eventos)).toBe(true)
  })
})

describe('POST /api/v1/eventos', () => {
  it('requiere autenticación', async () => {
    const res = await publicApi().post('/api/v1/eventos').send({ titulo: 'Test' })
    expect(res.status).toBe(401)
  })

  it('rechaza para usuario no programador', async () => {
    const res = await api(DEV_USERS.general_p2)
      .post('/api/v1/eventos')
      .send({ titulo: 'Test evento' })
    expect(res.status).toBe(403)
  })

  it('rechaza si falta título', async () => {
    const res = await api(DEV_USERS.programador)
      .post('/api/v1/eventos')
      .send({ fecha: '2026-05-01', ubicacion: 'Plaza' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/título/i)
  })

  let createdId
  it('crea evento como programador', async () => {
    const res = await api(DEV_USERS.programador)
      .post('/api/v1/eventos')
      .send({ titulo: 'Evento Test Suite', fecha: '2026-12-01', ubicacion: 'Test' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    createdId = res.body.id
  })

  it('actualiza el evento creado', async () => {
    if (!createdId) return
    const res = await api(DEV_USERS.programador)
      .put(`/api/v1/eventos/${createdId}`)
      .send({ titulo: 'Evento Test Actualizado' })
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/actualizado/i)
  })

  it('toggle activo/inactivo del evento', async () => {
    if (!createdId) return
    const res = await api(DEV_USERS.programador)
      .patch(`/api/v1/eventos/${createdId}/toggle`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('activo')
  })

  it('elimina el evento creado', async () => {
    if (!createdId) return
    const res = await api(DEV_USERS.programador)
      .delete(`/api/v1/eventos/${createdId}`)
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/eliminado/i)
  })
})

describe('DELETE /api/v1/eventos/:id', () => {
  it('retorna 404 para id inexistente', async () => {
    const res = await api(DEV_USERS.programador).delete('/api/v1/eventos/999999')
    expect(res.status).toBe(404)
  })
})
