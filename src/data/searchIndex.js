import { storeCategories } from '../components/StoresPage'
import { eventCategories } from '../components/EventsPage'
import { companies } from '../components/TourismPage'

// Productos - categorías y subcategorías
const productCategories = [
  { icon: 'weekend', label: 'Muebles', subcategories: ['Sillas', 'Escritorios'] },
  { icon: 'computer', label: 'Computacion', subcategories: ['Tecnología', 'Laptops', 'Monitores', 'Memorias', 'Impresoras'] },
  { icon: 'headphones', label: 'Audio', subcategories: ['Parlantes', 'Audífonos'] },
  { icon: 'videocam', label: 'Video', subcategories: ['Cámaras'] },
  { icon: 'keyboard', label: 'Perifericos', subcategories: ['Teclados', 'Accesorios', 'Redes'] },
  { icon: 'bolt', label: 'Energia', subcategories: ['Cargadores', 'Cables'] },
  { icon: 'lightbulb', label: 'Iluminacion', subcategories: ['Iluminación'] },
  { icon: 'smart_display', label: 'Dispositivos', subcategories: ['Tablets', 'Smartwatch'] },
  { icon: 'backpack', label: 'Transporte', subcategories: ['Mochilas', 'Maletas', 'Bolsos'] },
  { icon: 'phone_iphone', label: 'Celulares', subcategories: ['Smartphones', 'Fundas', 'Protectores'] },
  { icon: 'sports_esports', label: 'Gaming', subcategories: ['Consolas', 'Controles', 'Juegos'] },
  { icon: 'photo_camera', label: 'Fotografía', subcategories: ['Cámaras Foto', 'Lentes', 'Trípodes'] },
  { icon: 'kitchen', label: 'Hogar', subcategories: ['Electrodomésticos', 'Cocina', 'Aspiradoras'] },
  { icon: 'checkroom', label: 'Ropa', subcategories: ['Hombre', 'Mujer', 'Niños', 'Calzado'] },
  { icon: 'handyman', label: 'Herramientas', subcategories: ['Eléctricas', 'Manuales', 'Jardín'] },
  { icon: 'local_grocery_store', label: 'Alimentos', subcategories: ['Despensa', 'Bebidas', 'Congelados'] },
  { icon: 'self_care', label: 'Salud', subcategories: ['Cuidado Personal', 'Suplementos', 'Belleza'] },
  { icon: 'child_care', label: 'Bebés', subcategories: ['Coches', 'Cunas', 'Juguetes Bebé'] },
  { icon: 'menu_book', label: 'Librería', subcategories: ['Libros', 'Útiles Escolares', 'Arte'] },
]

// Servicios
const serviciosItems = [
  { icon: 'electric_bolt', label: 'Electricidad' },
  { icon: 'plumbing', label: 'Gasfitería' },
  { icon: 'format_paint', label: 'Pintura' },
  { icon: 'yard', label: 'Jardinería' },
  { icon: 'cleaning_services', label: 'Aseo' },
  { icon: 'handyman', label: 'Carpintería' },
  { icon: 'construction', label: 'Construcción' },
  { icon: 'roofing', label: 'Techumbres' },
  { icon: 'thermostat', label: 'Aislación' },
  { icon: 'local_shipping', label: 'Fletes' },
  { icon: 'school', label: 'Clases' },
  { icon: 'build', label: 'Mantención' },
  { icon: 'support_agent', label: 'Soporte' },
  { icon: 'lock', label: 'Cerrajería' },
  { icon: 'content_cut', label: 'Peluquería' },
  { icon: 'local_laundry_service', label: 'Lavandería' },
  { icon: 'pets', label: 'Mascotas' },
  { icon: 'pest_control', label: 'Plagas' },
]

// Arriendos
const arriendosItems = [
  { icon: 'home', label: 'Casas' },
  { icon: 'apartment', label: 'Departamentos' },
  { icon: 'cabin', label: 'Cabañas' },
  { icon: 'bed', label: 'Habitaciones' },
  { icon: 'chair', label: 'Amoblados' },
  { icon: 'storefront', label: 'Locales' },
  { icon: 'work', label: 'Oficinas' },
  { icon: 'desktop_windows', label: 'Coworking' },
  { icon: 'warehouse', label: 'Bodegas' },
  { icon: 'landscape', label: 'Parcelas' },
  { icon: 'terrain', label: 'Terrenos' },
  { icon: 'grass', label: 'Campos' },
  { icon: 'outdoor_grill', label: 'Quinchos' },
  { icon: 'event', label: 'Salones' },
  { icon: 'directions_car', label: 'Automóviles' },
  { icon: 'local_shipping', label: 'Camionetas' },
  { icon: 'airport_shuttle', label: 'Furgones' },
  { icon: 'local_parking', label: 'Estacionamientos' },
  { icon: 'directions_bike', label: 'Bicicletas' },
  { icon: 'two_wheeler', label: 'Motos' },
  { icon: 'electric_scooter', label: 'Scooters' },
  { icon: 'sailing', label: 'Botes' },
  { icon: 'kayaking', label: 'Kayaks' },
  { icon: 'speed', label: 'Lanchas' },
  { icon: 'surfing', label: 'Tablas' },
  { icon: 'fitness_center', label: 'Equipos Deportivos' },
  { icon: 'sports_tennis', label: 'Canchas' },
  { icon: 'pool', label: 'Piscinas' },
  { icon: 'agriculture', label: 'Maquinaria' },
  { icon: 'construction', label: 'Herramientas' },
  { icon: 'bolt', label: 'Generadores' },
  { icon: 'camping', label: 'Carpas' },
  { icon: 'forest', label: 'Camping' },
  { icon: 'ac_unit', label: 'Equipos Nieve' },
]

// Turismo
const turismoIconMap = {
  'Aventura': 'kayaking',
  'Cabalgatas': 'pets',
  'Gastronomia': 'restaurant',
  'Lagos': 'water',
  'Naturaleza': 'forest',
  'Nocturno': 'nightlife',
  'Rafting': 'rowing',
  'Spa': 'spa',
  'Termas': 'pool',
  'Trekking': 'hiking',
  'Volcanes': 'terrain',
}
const turismoSubs = new Set()
companies.forEach((c) => c.subcategories.forEach((s) => turismoSubs.add(s)))
const turismoItems = [...turismoSubs].sort().map((label) => ({
  icon: turismoIconMap[label] || 'tour',
  label,
}))

// Construir índice
export const searchIndex = [
  // Productos: categorías
  ...productCategories.map((cat) => ({
    icon: cat.icon,
    label: cat.label,
    section: 'Productos',
    type: 'category',
    nav: 'productos',
    subcategories: cat.subcategories,
  })),
  // Productos: subcategorías
  ...productCategories.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      icon: cat.icon,
      label: sub,
      section: 'Productos → ' + cat.label,
      type: 'subcategory',
      nav: 'productos',
    }))
  ),
  // Servicios
  ...serviciosItems.map((item) => ({
    icon: item.icon,
    label: item.label,
    section: 'Servicios',
    type: 'subcategory',
    nav: 'servicios',
  })),
  // Arriendos
  ...arriendosItems.map((item) => ({
    icon: item.icon,
    label: item.label,
    section: 'Arriendos',
    type: 'subcategory',
    nav: 'arriendos',
  })),
  // Negocios
  ...storeCategories.map((item) => ({
    icon: item.icon,
    label: item.label,
    section: 'Negocios',
    type: 'subcategory',
    nav: 'locales',
  })),
  // Eventos
  ...eventCategories.map((item) => ({
    icon: item.icon,
    label: item.label,
    section: 'Eventos',
    type: 'subcategory',
    nav: 'eventos',
  })),
  // Turismo
  ...turismoItems.map((item) => ({
    icon: item.icon,
    label: item.label,
    section: 'Turismo',
    type: 'subcategory',
    nav: 'turismo',
  })),
]
