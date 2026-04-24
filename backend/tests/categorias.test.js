const { publicApi } = require('./setup')

describe('CATEGORÍAS /api/v1/categorias', () => {

  describe('GET / — todas las categorías', () => {
    it('devuelve array de categorías con subcategorías', async () => {
      const res = await publicApi().get('/api/v1/categorias')
      expect(res.status).toBe(200)
      expect(res.body.categorias).toBeInstanceOf(Array)
      expect(res.body.categorias.length).toBeGreaterThan(0)
    })

    it('filtra por tipo=producto', async () => {
      const res = await publicApi().get('/api/v1/categorias?tipo=producto')
      expect(res.status).toBe(200)
      expect(res.body.categorias).toBeInstanceOf(Array)
    })
  })

  describe('GET /sidebar — categorías con listings activos', () => {
    it('devuelve categorías para el sidebar público', async () => {
      const res = await publicApi().get('/api/v1/categorias/sidebar')
      expect(res.status).toBe(200)
      expect(res.body.categorias).toBeInstanceOf(Array)
    })
  })

})
