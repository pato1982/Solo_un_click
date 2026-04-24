const { api, publicApi, DEV_USERS } = require('./setup')

describe('GET /api/v1/carousels', () => {
  it('requiere autenticación', async () => {
    const res = await publicApi().get('/api/v1/carousels')
    expect(res.status).toBe(401)
  })

  it('retorna carousels del usuario autenticado', async () => {
    const res = await api(DEV_USERS.turismo_p3).get('/api/v1/carousels')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('carousels')
    expect(Array.isArray(res.body.carousels)).toBe(true)
  })

  it('retorna array vacío para plan 1', async () => {
    // general_p1 (plan_id=1) no tiene acceso a carousels
    const res = await api(DEV_USERS.general_p1).get('/api/v1/carousels')
    expect(res.status).toBe(200)
    expect(res.body.carousels).toEqual([])
  })

  it('cada carousel tiene imagenes array', async () => {
    const res = await api(DEV_USERS.turismo_p3).get('/api/v1/carousels')
    expect(res.status).toBe(200)
    for (const c of res.body.carousels) {
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('posicion')
      expect(c).toHaveProperty('imagenes')
      expect(Array.isArray(c.imagenes)).toBe(true)
    }
  })
})

describe('PUT /api/v1/carousels/:posicion/reorder', () => {
  it('requiere autenticación', async () => {
    const res = await publicApi()
      .put('/api/v1/carousels/1/reorder')
      .send({ imageIds: [] })
    expect(res.status).toBe(401)
  })

  it('requiere plan >= 2', async () => {
    const res = await api(DEV_USERS.general_p1)
      .put('/api/v1/carousels/1/reorder')
      .send({ imageIds: [] })
    expect(res.status).toBe(403)
  })

  it('retorna 404 si el carrusel no existe', async () => {
    const res = await api(DEV_USERS.turismo_p3)
      .put('/api/v1/carousels/9/reorder')
      .send({ imageIds: [] })
    expect([400, 404]).toContain(res.status)
  })
})

describe('DELETE /api/v1/carousels/:posicion/images/:imageId', () => {
  it('requiere autenticación', async () => {
    const res = await publicApi().delete('/api/v1/carousels/1/images/1')
    expect(res.status).toBe(401)
  })

  it('requiere plan >= 2', async () => {
    const res = await api(DEV_USERS.general_p1).delete('/api/v1/carousels/1/images/1')
    expect(res.status).toBe(403)
  })
})
