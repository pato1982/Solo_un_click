const { publicApi } = require('./setup')

describe('GET /api/v1/servicios/public', () => {
  it('retorna array de servicios (puede estar vacío)', async () => {
    const res = await publicApi().get('/api/v1/servicios/public')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('servicios')
    expect(Array.isArray(res.body.servicios)).toBe(true)
  })

  it('cada servicio tiene campos requeridos', async () => {
    const res = await publicApi().get('/api/v1/servicios/public')
    expect(res.status).toBe(200)
    for (const s of res.body.servicios) {
      expect(s).toHaveProperty('user_id')
      expect(s).toHaveProperty('nombre_negocio')
      expect(s).toHaveProperty('imagenes')
      expect(Array.isArray(s.imagenes)).toBe(true)
      expect(s).toHaveProperty('categorias')
      expect(Array.isArray(s.categorias)).toBe(true)
    }
  })
})
