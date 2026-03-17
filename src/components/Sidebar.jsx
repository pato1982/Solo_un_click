import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API || ''

const btnClass = 'flex items-center gap-2 px-2 py-1 rounded-md transition-colors text-xs font-normal text-white/50 hover:text-accent w-full text-left'
const catBtnClass = 'flex items-center gap-2 px-2 py-1 rounded-md transition-colors text-xs font-normal text-white/50 hover:text-accent w-full'
const subBtnClass = 'flex items-center gap-2 pl-2 pr-2 py-0.5 rounded-md text-xs font-normal text-white/50 hover:text-accent w-full text-left'

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

const SIDEBAR_TITLES = {
  productos: 'Productos',
  servicios: 'Servicios',
  arriendos: 'Arriendos',
}

export default function Sidebar({ activeNav, onClose, onGoHome, showInicio, onFilterSelect, activeFilter, onMapClick, onCategorySelect, turismoCategorias = [], listingSubcategorias = [], sidebarCategorias = [], openKey, onSidebarHeight }) {
  const [expandedCat, setExpandedCat] = useState(null)
  const [localeCategorias, setLocaleCategorias] = useState([])
  const [eventoCategorias, setEventoCategorias] = useState([])
  const [mobileClosed, setMobileClosed] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(150)
  const mobileRef = useRef(null)

  // Medir la altura real del header sticky - en cada cambio y resize
  useEffect(() => {
    const measure = () => {
      const headerEl = document.getElementById('main-header')
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight + 8)
      }
    }
    measure()
    // Re-medir después de un frame por si el DOM no estaba listo
    requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeNav, mobileClosed])

  // Reset mobileClosed cuando cambia la sección activa o se pide reabrir
  useEffect(() => {
    setMobileClosed(false)
  }, [activeNav, openKey])

  const handleMobileClose = () => {
    setMobileClosed(true)
    if (onSidebarHeight) onSidebarHeight(0)
    onClose()
  }

  // Reportar que el sidebar está abierto (para min-height del contenedor → footer)
  useEffect(() => {
    if (mobileRef.current && !mobileClosed && activeNav) {
      if (onSidebarHeight) onSidebarHeight(mobileRef.current.offsetHeight + 8)
    } else {
      if (onSidebarHeight) onSidebarHeight(0)
    }
  })

  // Cerrar al hacer click fuera (solo mobile/tablet)
  useEffect(() => {
    if (!activeNav || mobileClosed) return
    const handleClickOutside = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        handleMobileClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [activeNav, mobileClosed, onClose])

  useEffect(() => {
    if (activeNav === 'locales') {
      fetch(`${API}/api/locales/categorias`)
        .then(r => r.json())
        .then(data => setLocaleCategorias(data.categorias || []))
        .catch(() => {})
    } else if (activeNav === 'eventos') {
      fetch(`${API}/api/eventos/categorias`)
        .then(r => r.json())
        .then(data => setEventoCategorias(data.categorias || []))
        .catch(() => {})
    }
  }, [activeNav])

  if (!activeNav) return null

  let panel = null

  // Turismo: categorías dinámicas desde portadas
  if (activeNav === 'turismo') {
    panel = {
      title: 'Turismo',
      items: turismoCategorias.map(label => ({
        icon: TURISMO_ICON_MAP[label] || 'tour',
        label,
      })),
    }
  }
  // Productos, servicios, arriendos: categorías desde la BD con subcategorías
  else if (activeNav === 'productos' || activeNav === 'servicios' || activeNav === 'arriendos') {
    const tipoMap = { productos: 'producto', servicios: 'servicio', arriendos: 'arriendo' }
    const tipo = tipoMap[activeNav]
    const catsDelTipo = sidebarCategorias.filter(c => c.tipo === tipo)

    // Demo categorías si no hay reales
    const DEMO_CATS = {
      productos: [
        { icon: 'devices', label: 'Tecnología', subcategories: ['Celulares', 'Notebooks', 'Tablets', 'Accesorios'] },
        { icon: 'checkroom', label: 'Vestuario', subcategories: ['Hombre', 'Mujer', 'Niños', 'Calzado'] },
        { icon: 'weekend', label: 'Hogar', subcategories: ['Muebles', 'Decoración', 'Cocina', 'Baño'] },
        { icon: 'sports_esports', label: 'Deportes', subcategories: ['Bicicletas', 'Camping', 'Fitness', 'Running'] },
        { icon: 'toys', label: 'Juguetería', subcategories: ['Didácticos', 'Muñecas', 'Autos', 'Juegos de mesa'] },
      ],
      servicios: [
        { icon: 'construction', label: 'Construcción', subcategories: ['Electricista', 'Gasfiter', 'Albañil', 'Pintor'] },
        { icon: 'local_car_wash', label: 'Automotriz', subcategories: ['Mecánica', 'Lavado', 'Grúa', 'Neumáticos'] },
        { icon: 'school', label: 'Educación', subcategories: ['Clases particulares', 'Idiomas', 'Música', 'Computación'] },
        { icon: 'spa', label: 'Belleza y Salud', subcategories: ['Peluquería', 'Masajes', 'Manicure', 'Podología'] },
        { icon: 'pets', label: 'Mascotas', subcategories: ['Veterinaria', 'Peluquería canina', 'Paseo', 'Pensión'] },
      ],
      arriendos: [
        { icon: 'cottage', label: 'Cabañas', subcategories: ['Lago', 'Volcán', 'Bosque', 'Centro'] },
        { icon: 'apartment', label: 'Departamentos', subcategories: ['1 dormitorio', '2 dormitorios', 'Studio', 'Amoblado'] },
        { icon: 'house', label: 'Casas', subcategories: ['Familiar', 'Vacaciones', 'Temporada', 'Larga estadía'] },
        { icon: 'night_shelter', label: 'Hospedajes', subcategories: ['Hostal', 'Habitación', 'Domo', 'Glamping'] },
      ],
    }

    if (catsDelTipo.length > 0) {
      panel = {
        title: SIDEBAR_TITLES[activeNav],
        categories: catsDelTipo.map(c => ({
          icon: 'category',
          label: c.nombre,
          subcategories: c.subcategorias.map(s => s.nombre),
        })),
      }
    } else {
      panel = {
        title: SIDEBAR_TITLES[activeNav],
        categories: DEMO_CATS[activeNav] || [],
      }
    }
  }
  // Locales: categorías desde API
  else if (activeNav === 'locales') {
    const DEMO_LOCALE_CATS = [
      { icon: 'bakery_dining', label: 'Panadería' },
      { icon: 'hardware', label: 'Ferretería' },
      { icon: 'local_grocery_store', label: 'Abarrotes' },
      { icon: 'content_cut', label: 'Peluquería' },
      { icon: 'menu_book', label: 'Librería' },
      { icon: 'local_cafe', label: 'Cafetería' },
      { icon: 'pets', label: 'Mascotas' },
      { icon: 'storefront', label: 'Bazar' },
    ]
    panel = {
      title: 'Negocios',
      items: localeCategorias.length > 0
        ? localeCategorias.map(c => ({ icon: c.icono || 'storefront', label: c.nombre }))
        : DEMO_LOCALE_CATS,
    }
  }
  // Eventos: categorías desde API
  else if (activeNav === 'eventos') {
    const DEMO_EVENT_CATS = [
      { icon: 'music_note', label: 'Música' },
      { icon: 'restaurant', label: 'Gastronomía' },
      { icon: 'sports_soccer', label: 'Deporte' },
      { icon: 'theater_comedy', label: 'Cultura' },
      { icon: 'palette', label: 'Artesanía' },
      { icon: 'family_restroom', label: 'Familiar' },
      { icon: 'forest', label: 'Naturaleza' },
      { icon: 'nightlife', label: 'Nocturno' },
    ]
    panel = {
      title: 'Eventos',
      items: eventoCategorias.length > 0
        ? eventoCategorias.map(c => ({ icon: c.icono || 'event', label: c.nombre }))
        : DEMO_EVENT_CATS,
    }
  }

  if (!panel) return null

  const isMobile = () => window.innerWidth < 1101

  const handleCatClick = (cat) => {
    setExpandedCat(expandedCat === cat.label ? null : cat.label)
    if (onCategorySelect) onCategorySelect(cat.label, cat.subcategories)
  }

  // Contenido de categorías (compartido entre mobile y desktop)
  const categoryList = (
    <>
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
      ) : panel.items && panel.items.length > 0 ? (
        panel.items.map((item) => (
          <button
            key={item.label}
            className={`${btnClass} ${activeFilter === item.label ? 'bg-white/20 text-white font-bold' : ''}`}
            onClick={() => onFilterSelect && onFilterSelect(item.label)}
          >
            <span className="material-symbols-outlined text-sm">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))
      ) : (
        <p className="text-[10px] text-white/30 text-center py-3">Sin categorías aún</p>
      )}
    </>
  )

  return (
    <>
      {/* ===== Mobile/Tablet: barra vertical inline debajo del header ===== */}
      <div ref={mobileRef} className={`md:hidden fixed left-0 z-40 min-w-[180px] w-fit max-w-[55%] bg-primary text-white shadow-lg rounded-br-xl flex flex-col ${mobileClosed ? 'hidden' : ''}`} style={{ top: String(headerHeight) + 'px', maxHeight: String(window.innerHeight - headerHeight - 40) + 'px', overflowY: 'hidden', overflowX: 'hidden' }}>
        {/* Título + cerrar */}
        <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-1 shrink-0">
          <h3 className="text-xs font-black uppercase tracking-tight whitespace-nowrap">{panel.title}</h3>
          <button onClick={handleMobileClose} className="hover:bg-white/10 rounded-full p-0.5 transition-colors shrink-0">
            <span className="material-symbols-outlined text-white/60 text-base hover:text-white">close</span>
          </button>
        </div>

        {/* Categorías en lista vertical con scroll */}
        <div className="flex-1 min-h-0 flex flex-col gap-0.5 px-2 pb-2 overflow-y-auto sidebar-scroll">
          {panel.categories ? (
            panel.categories.map((cat) => {
              const isExpanded = expandedCat === cat.label
              return (
                <div key={cat.label}>
                  <button
                    onClick={() => handleCatClick(cat)}
                    className={`flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      isExpanded || activeFilter?.category === cat.label
                        ? 'bg-white/10 text-accent'
                        : 'text-white/60 hover:text-accent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">{cat.icon}</span>
                    <span className="whitespace-nowrap">{cat.label}</span>
                  </button>
                  {isExpanded && cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="flex flex-col ml-4">
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => { onFilterSelect && onFilterSelect(sub); handleMobileClose() }}
                          className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                            activeFilter === sub ? 'text-white font-bold' : 'text-white/40 hover:text-accent'
                          }`}
                        >
                          {activeFilter === sub
                            ? <span className="material-symbols-outlined text-white text-[10px] shrink-0">check</span>
                            : <span className="w-1 h-1 rounded-full bg-accent shrink-0"></span>
                          }
                          <span className="whitespace-nowrap">{sub}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          ) : panel.items && panel.items.length > 0 ? (
            panel.items.map((item) => (
              <button
                key={item.label}
                onClick={() => { onFilterSelect && onFilterSelect(item.label); handleMobileClose() }}
                className={`flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeFilter === item.label
                    ? 'bg-white/10 text-accent font-bold'
                    : 'text-white/60 hover:text-accent'
                }`}
              >
                <span className="material-symbols-outlined text-xs">{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))
          ) : (
            <p className="text-[10px] text-white/30 py-1">Sin categorías aún</p>
          )}
        </div>

        {/* Botón de acción */}
        <div className="px-2 pb-2 shrink-0">
          <button
            onClick={activeNav === 'locales' ? onMapClick : undefined}
            className="w-full bg-accent text-primary py-1 rounded-md text-[9px] font-black uppercase tracking-wide hover:brightness-110 transition-all text-center"
          >
            {activeNav === 'locales' ? 'Buscar en mapa' : 'Todas las categorias'}
          </button>
        </div>
      </div>

      {/* ===== Desktop: sidebar vertical normal (sin cambios) ===== */}
      <aside className="hidden md:block shrink-0 w-max max-w-44 sticky top-[112px] self-start mt-3 ml-1 z-30 mb-6">
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
              {categoryList}
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
    </>
  )
}
