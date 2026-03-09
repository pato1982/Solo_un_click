// Tiendas Premium con página propia
export const premiumStores = [
  {
    id: 'tecno-sur',
    name: 'TecnoSur Villarrica',
    slogan: 'Tu tienda tecnológica en el sur de Chile',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA38oJjJWEUBdLOIOQn9-ZxX3k5SCbkc4Qz5vzl_TvRayDl6FbSIk974zdMpQHY145ZG6vD5Deq91Iw971LdVWrB82pl5fcMHV1NkALb7zk7w4BW01tQaAl-WoH1QeXsEQ0Cmp66PkIWPi8F94bKz3nWIaUE6HSaV2gFyvju4fVBDt88fM3RXq2g02EkG7bnmi3f8pEORPEGACVIgj4zaC2nSW0BU6DuM1-frKn2Bymil3ID2Qj1yNEFzpsZsS6MqCFQwnVkcMnINg',
    address: 'Av. Pedro de Valdivia 456, Villarrica',
    phone: '+56 9 8765 4321',
    email: 'ventas@tecnosur.cl',
    description: 'Tu tienda de tecnología de confianza en Villarrica. Ofrecemos lo mejor en computación, gaming y audio con asesoría personalizada y servicio técnico garantizado.',
    categories: [
      {
        label: 'Computación',
        subcategories: ['Laptops', 'Monitores', 'Memorias'],
      },
      {
        label: 'Periféricos',
        subcategories: ['Teclados', 'Accesorios'],
      },
      {
        label: 'Audio',
        subcategories: ['Parlantes', 'Audífonos'],
      },
      {
        label: 'Gaming',
        subcategories: ['Consolas', 'Controles', 'Sillas Gamer'],
      },
      {
        label: 'Redes',
        subcategories: ['Routers', 'Switches', 'Cables'],
      },
      {
        label: 'Energía',
        subcategories: ['Cargadores', 'UPS', 'Extensiones'],
      },
      {
        label: 'Almacenamiento',
        subcategories: ['Discos SSD', 'Pendrives', 'Tarjetas SD'],
      },
    ],
    // IDs de productos que pertenecen a esta tienda
    productIds: [1, 3, 4, 5, 6, 7, 8, 9, 16, 18, 19, 20, 36, 37, 38, 39, 40, 41, 42, 44, 50, 60, 61, 63, 67],
  },
  {
    id: 'hogar-deco',
    name: 'Hogar & Deco',
    slogan: 'Muebles y decoración para tu hogar',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtgS0SetPDa0pDvV-eKE4m0aK2J26dGm6gy0M1dUy-G-2N8exAFgxYVFOAGSShBaD66dYz7ydh-e1ItrO_e6xFTkR3HvtDNCMGzoJmSmMudDH2ZcBcooUxMd9XR7PvWEv-ZDD49kJEGKEzqL8YBnHk7Ptxn6gOTb3ey2EmoHHKPnA9Ny8Z1Zv81SsfQObaMoIzx2GMNjcSTnzjPWgTyETTnwU7p2calL-ZMBcXvos9_TL0H8_0UPntrurqNg5dqTI55A7SmoHnTj0',
    address: 'Camino Villarrica-Pucón km 2, Villarrica',
    phone: '+56 9 1122 3344',
    email: 'info@hogardeco.cl',
    description: 'Transformamos espacios con estilo y personalidad. Muebles, decoración e iluminación con diseños exclusivos y materiales de primera calidad para tu hogar.',
    categories: [
      {
        label: 'Muebles',
        subcategories: ['Sillas', 'Escritorios'],
      },
      {
        label: 'Iluminación',
        subcategories: ['Iluminación'],
      },
      {
        label: 'Accesorios',
        subcategories: ['Accesorios'],
      },
      {
        label: 'Decoración',
        subcategories: ['Cuadros', 'Alfombras', 'Cortinas'],
      },
      {
        label: 'Jardín',
        subcategories: ['Maceteros', 'Muebles Exterior'],
      },
    ],
    productIds: [2, 10, 17, 29, 65],
  },
]

// Mapa rápido: productId → storeId
const productStoreMap = {}
premiumStores.forEach((store) => {
  store.productIds.forEach((pid) => {
    productStoreMap[pid] = store.id
  })
})

export function getStoreForProduct(productId) {
  const storeId = productStoreMap[productId]
  if (!storeId) return null
  return premiumStores.find((s) => s.id === storeId)
}
