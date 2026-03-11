import { useState } from 'react'
import { storeCategories } from './StoresPage'
import { eventCategories } from './EventsPage'

const btnClass = 'flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/10 transition-colors text-xs font-normal text-white/50 hover:text-white w-full text-left'
const catBtnClass = 'flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/10 transition-colors text-xs font-bold text-white/80 hover:text-white w-full'
const subBtnClass = 'flex items-center gap-2 pl-6 pr-2 py-0.5 rounded-md text-[11px] font-normal text-white/50'

const hierarchicalContent = {
  productos: {
    title: 'Productos',
    categories: [
      {
        icon: 'weekend', label: 'Muebles',
        subcategories: ['Sillas', 'Escritorios'],
      },
      {
        icon: 'computer', label: 'Computacion',
        subcategories: ['Tecnología', 'Laptops', 'Monitores', 'Memorias', 'Impresoras'],
      },
      {
        icon: 'headphones', label: 'Audio',
        subcategories: ['Parlantes', 'Audífonos'],
      },
      {
        icon: 'videocam', label: 'Video',
        subcategories: ['Cámaras'],
      },
      {
        icon: 'keyboard', label: 'Perifericos',
        subcategories: ['Teclados', 'Accesorios', 'Redes'],
      },
      {
        icon: 'bolt', label: 'Energia',
        subcategories: ['Cargadores', 'Cables'],
      },
      {
        icon: 'lightbulb', label: 'Iluminacion',
        subcategories: ['Iluminación'],
      },
      {
        icon: 'smart_display', label: 'Dispositivos',
        subcategories: ['Tablets', 'Smartwatch'],
      },
      {
        icon: 'backpack', label: 'Transporte',
        subcategories: ['Mochilas', 'Maletas', 'Bolsos'],
      },
      {
        icon: 'phone_iphone', label: 'Celulares',
        subcategories: ['Smartphones', 'Fundas', 'Protectores'],
      },
      {
        icon: 'sports_esports', label: 'Gaming',
        subcategories: ['Consolas', 'Controles', 'Juegos'],
      },
      {
        icon: 'photo_camera', label: 'Fotografía',
        subcategories: ['Cámaras Foto', 'Lentes', 'Trípodes'],
      },
      {
        icon: 'kitchen', label: 'Hogar',
        subcategories: ['Electrodomésticos', 'Cocina', 'Aspiradoras'],
      },
      {
        icon: 'checkroom', label: 'Ropa',
        subcategories: ['Hombre', 'Mujer', 'Niños', 'Calzado'],
      },
      {
        icon: 'handyman', label: 'Herramientas',
        subcategories: ['Eléctricas', 'Manuales', 'Jardín'],
      },
      {
        icon: 'local_grocery_store', label: 'Alimentos',
        subcategories: ['Despensa', 'Bebidas', 'Congelados'],
      },
      {
        icon: 'self_care', label: 'Salud',
        subcategories: ['Cuidado Personal', 'Suplementos', 'Belleza'],
      },
      {
        icon: 'child_care', label: 'Bebés',
        subcategories: ['Coches', 'Cunas', 'Juguetes Bebé'],
      },
      {
        icon: 'menu_book', label: 'Librería',
        subcategories: ['Libros', 'Útiles Escolares', 'Arte'],
      },
    ],
  },
}

// Contenido plano para turismo, locales, eventos y arriendos (sin jerarquía)
const flatContent = {
  servicios: {
    title: 'Servicios',
    items: [
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
    ],
  },
  arriendos: {
    title: 'Arriendos',
    items: [
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
    ],
  },
  locales: {
    title: 'Negocios',
    items: storeCategories,
  },
  eventos: {
    title: 'Eventos',
    items: eventCategories,
  },
}

const TURISMO_ICON_MAP = {
  'Aventura': 'kayaking',
  'Cabalgatas': 'pets',
  'Gastronómico': 'restaurant',
  'Gastronomía': 'restaurant',
  'Lagos': 'water',
  'Naturaleza': 'forest',
  'Nocturno': 'nightlife',
  'Rafting': 'rowing',
  'Spa': 'spa',
  'Termas': 'pool',
  'Trekking': 'hiking',
  'Volcanes': 'terrain',
  'Cultural': 'museum',
  'Familiar': 'family_restroom',
  'Deportivo': 'sports_soccer',
  'Relax': 'self_improvement',
  'Fotografía': 'photo_camera',
  'Acuático': 'pool',
  'Nieve': 'ac_unit',
  'Adrenalina': 'bolt',
}

export default function Sidebar({ activeNav, onClose, onGoHome, showInicio, onFilterSelect, activeFilter, onMapClick, onCategorySelect, turismoCategorias = [], listingSubcategorias = [] }) {
  const [expandedCat, setExpandedCat] = useState(null)

  if (!activeNav) return null

  const isHierarchical = !!hierarchicalContent[activeNav]
  let panel = isHierarchical ? hierarchicalContent[activeNav] : flatContent[activeNav]

  // Turismo: categorías dinámicas desde la BD
  if (activeNav === 'turismo') {
    panel = {
      title: 'Turismo',
      items: turismoCategorias.map(label => ({
        icon: TURISMO_ICON_MAP[label] || 'tour',
        label,
      })),
    }
  }

  // Productos, servicios, arriendos: mostrar solo subcategorías reales de la BD
  if ((activeNav === 'productos' || activeNav === 'servicios' || activeNav === 'arriendos') && listingSubcategorias.length > 0) {
    // Buscar subcategorías para este tipo de navegación
    const tipoMap = { productos: 'producto', servicios: 'servicio', arriendos: 'arriendo' }
    const subs = listingSubcategorias
      .filter(s => s.tipo === tipoMap[activeNav])
      .map(s => s.sub)

    // Convertir a lista plana dinámica (sin jerarquía hardcodeada)
    const ICON_MAP = {}
    // Extraer iconos del contenido hardcodeado si existe
    if (isHierarchical && panel.categories) {
      panel.categories.forEach(cat => {
        cat.subcategories.forEach(sub => { ICON_MAP[sub] = cat.icon })
      })
    }
    if (!isHierarchical && panel.items) {
      panel.items.forEach(item => { ICON_MAP[item.label] = item.icon })
    }

    const uniqueSubs = [...new Set(subs)].sort()
    panel = {
      title: panel.title,
      items: uniqueSubs.map(label => ({
        icon: ICON_MAP[label] || 'category',
        label,
      })),
    }
    // Ya no es jerárquico, es plano
  }

  if (!panel) return null

  const handleCatClick = (cat) => {
    setExpandedCat(expandedCat === cat.label ? null : cat.label)
    if (onCategorySelect) onCategorySelect(cat.label, cat.subcategories)
  }

  return (
    <aside className="hidden md:block shrink-0 w-44 sticky top-[112px] self-start mt-3 ml-1 z-30 mb-6">
      <div className="bg-primary text-white animate-slide-in shadow-lg p-2">
        <div className="border border-accent rounded-lg p-2 pt-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black uppercase tracking-tight">{panel.title}</h3>
            {!showInicio && (
              <button onClick={onClose} className="hover:bg-white/10 rounded-full p-0.5 transition-colors">
                <span className="material-symbols-outlined text-white/60 text-lg hover:text-white">close</span>
              </button>
            )}
          </div>
          <div className="flex flex-col gap-0 max-h-[330px] overflow-y-auto sidebar-scroll pr-1">
            {panel.categories ? (
              panel.categories.map((cat) => {
                const isExpanded = expandedCat === cat.label
                const visibleSubs = cat.subcategories

                return (
                  <div key={cat.label}>
                    <button
                      className={`${catBtnClass} ${isExpanded || (activeFilter?.category === cat.label) ? 'bg-white/10 text-accent' : ''}`}
                      onClick={() => handleCatClick(cat)}
                    >
                      <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                      <span className="flex-1 text-left">{cat.label}</span>
                    </button>
                    {isExpanded && (
                      <div className="flex flex-col">
                        {visibleSubs.map((sub) => (
                          <button
                            key={sub}
                            className={`${subBtnClass} ${activeFilter === sub ? 'text-white font-bold' : ''}`}
                            onClick={() => onFilterSelect && onFilterSelect(sub)}
                          >
                            {activeFilter === sub
                              ? <span className="material-symbols-outlined text-white text-xs shrink-0">check</span>
                              : <span className="w-1 h-1 rounded-full bg-accent shrink-0"></span>
                            }
                            <span>{sub}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              panel.items.map((item) => (
                <button
                  key={item.icon}
                  className={`${btnClass} ${activeFilter === item.label ? 'bg-white/20 text-white font-bold' : ''}`}
                  onClick={() => onFilterSelect && onFilterSelect(item.label)}
                >
                  <span className="material-symbols-outlined text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <button
              onClick={activeNav === 'locales' ? onMapClick : undefined}
              className="w-full bg-accent text-primary py-1.5 rounded-md text-[10px] font-black uppercase tracking-wide hover:brightness-110 transition-all text-center leading-tight"
            >
              {activeNav === 'locales' ? 'Buscar en mapa' : <>Todas las<br />categorias</>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
