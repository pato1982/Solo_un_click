import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Breadcrumbs from './components/Breadcrumbs'
import ProductCarousel from './components/ProductCarousel'
import Banner from './components/Banner'
import TourismPage from './components/TourismPage'
import EventsSection from './components/EventsSection'
import StoresCarousel from './components/StoresCarousel'
import Footer from './components/Footer'
import SectionPage from './components/SectionPage'
import StoresPage from './components/StoresPage'
import EventsPage from './components/EventsPage'
import StorePage, { StoreFooter } from './components/StorePage'
// import { sections as staticSections } from './data/products'

const API = import.meta.env.VITE_API || ''

const SECTION_TITLES = {
  destacados: 'Productos Destacados',
  ofertas: 'Productos en Ofertas',
  novedades: 'Novedades',
  liquidacion: 'Productos en Liquidación',
  tecnologia: 'Tecnología',
  servicios: 'Servicios',
  arriendos: 'Arriendos',
  tendencia: 'Tendencia',
}

const SECTION_ORDER = ['destacados', 'ofertas', 'arriendos', 'novedades', 'servicios', 'liquidacion', 'tendencia', 'tecnologia']

function mapListingToProduct(l) {
  return {
    id: l.id,
    user_id: l.user_id,
    name: l.nombre,
    description: l.descripcion,
    image: l.imagen ? `${API}${l.imagen}` : null,
    alt: l.nombre,
    price: l.precio,
    originalPrice: l.precio_original,
    badge: l.badge,
    badgeColor: l.badge ? 'bg-primary text-white' : null,
    rating: null,
    category: l.tipo === 'producto' ? 'productos' : l.tipo === 'servicio' ? 'servicios' : l.tipo === 'arriendo' ? 'arriendos' : 'otros',
    categoria: l.categoria,
    subcategory: l.subcategoria,
    tipo: l.tipo,
    medidas: l.medidas,
    tallas: l.tallas,
    genero: l.genero,
    negocio_whatsapp: l.negocio_whatsapp,
    negocio_telefono: l.negocio_telefono,
    negocio_direccion: l.negocio_direccion,
    negocio_correo: l.negocio_correo,
    negocio_facebook: l.negocio_facebook,
    negocio_instagram: l.negocio_instagram,
    nombre_negocio: l.nombre_negocio,
    owner_plan_id: l.owner_plan_id,
  }
}

// Mezcla ponderada: Premium 3 slots, Normal 2, Gratis 1 por ronda
// Round-robin entre negocios del mismo tier, producto aleatorio de cada uno
function mixProductsByPlan(products) {
  if (products.length <= 1) return products

  // Agrupar por user_id (negocio)
  const byUser = {}
  products.forEach(p => {
    const uid = p.user_id || 0
    if (!byUser[uid]) byUser[uid] = { plan: p.owner_plan_id || 1, items: [] }
    byUser[uid].items.push(p)
  })

  // Mezclar productos de cada negocio aleatoriamente
  Object.values(byUser).forEach(u => {
    for (let i = u.items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [u.items[i], u.items[j]] = [u.items[j], u.items[i]]
    }
  })

  // Separar negocios por tier
  const tiers = { 3: [], 2: [], 1: [] }
  Object.values(byUser).forEach(u => {
    const tier = u.plan >= 3 ? 3 : u.plan === 2 ? 2 : 1
    tiers[tier].push({ items: [...u.items], idx: 0 })
  })

  // Mezclar orden de negocios dentro de cada tier
  Object.values(tiers).forEach(arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
  })

  // Pesos por tier: Premium 3, Normal 2, Gratis 1
  const weights = { 3: 3, 2: 2, 1: 1 }
  const result = []
  const totalProducts = products.length
  const tierPointers = { 3: 0, 2: 0, 1: 0 } // round-robin pointer por tier

  while (result.length < totalProducts) {
    let added = false
    for (const tier of [3, 2, 1]) {
      const businesses = tiers[tier]
      if (businesses.length === 0) continue
      const slots = weights[tier]
      for (let s = 0; s < slots && result.length < totalProducts; s++) {
        // Round-robin entre negocios del tier
        let attempts = 0
        while (attempts < businesses.length) {
          const biz = businesses[tierPointers[tier] % businesses.length]
          tierPointers[tier]++
          if (biz.idx < biz.items.length) {
            result.push(biz.items[biz.idx])
            biz.idx++
            added = true
            break
          }
          attempts++
        }
      }
    }
    if (!added) break
  }

  return result
}

function buildSectionsFromAPI(listings) {
  const grouped = {}
  listings.forEach((l) => {
    const sec = l.seccion || 'destacados'
    if (!grouped[sec]) grouped[sec] = []
    grouped[sec].push(mapListingToProduct(l))
  })

  return SECTION_ORDER.map((id) => ({
    id,
    title: SECTION_TITLES[id] || id,
    hidePrice: id === 'servicios',
    items: mixProductsByPlan(grouped[id] || []),
  }))
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(null)
  const [activeSidebar, setActiveSidebar] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const [activeFilter, setActiveFilter] = useState(null)
  const [storeMapMode, setStoreMapMode] = useState(false)
  const [activeStore, setActiveStore] = useState(null)
  const [scrollBeforeStore, setScrollBeforeStore] = useState(0)
  const [sections, setSections] = useState([])
  const [turismoCategorias, setTurismoCategorias] = useState([])
  const [turismoCategoriasAll, setTurismoCategoriasAll] = useState([])
  const [listingSubcategorias, setListingSubcategorias] = useState([])
  const [sidebarCategorias, setSidebarCategorias] = useState([])
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  // Cargar listings desde API
  useEffect(() => {
    fetch(`${API}/api/listings`)
      .then(r => r.json())
      .then(data => {
        {
          setSections(buildSectionsFromAPI(data.listings || []))
          // Extraer subcategorías únicas con su tipo para el sidebar dinámico
          const subsMap = new Map()
          data.listings.forEach(l => {
            if (l.subcategoria) {
              const key = `${l.tipo}|${l.subcategoria}`
              if (!subsMap.has(key)) subsMap.set(key, { tipo: l.tipo, sub: l.subcategoria })
            }
          })
          setListingSubcategorias([...subsMap.values()])
        }
      })
      .catch(err => console.error('Error cargando listings:', err))

    // Cargar categorías de turismo desde portadas activas
    fetch(`${API}/api/portada/public`)
      .then(r => r.json())
      .then(data => {
        if (data.portadas) {
          const cats = new Set()
          data.portadas.forEach(p => {
            if (p.categorias && Array.isArray(p.categorias)) {
              p.categorias.forEach(c => cats.add(c))
            }
          })
          const sorted = [...cats].sort()
          setTurismoCategorias(sorted)
          setTurismoCategoriasAll(sorted)
        }
      })
      .catch(err => console.error('Error cargando categorías turismo:', err))

    // Cargar categorías del sidebar: solo las que tienen productos publicados
    fetch(`${API}/api/categorias/sidebar`)
      .then(r => r.json())
      .then(data => {
        if (data.categorias) setSidebarCategorias(data.categorias)
      })
      .catch(err => console.error('Error cargando categorías sidebar:', err))
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const toggleNav = (nav) => {
    if (nav === 'negocios') {
      if (currentPage === 'locales' && activeSidebar === 'locales') {
        goHome()
      } else {
        handleViewAllStores()
      }
      return
    }
    if (nav === 'turismo') {
      if (currentPage === 'turismo') {
        // Ya estamos en turismo: volver a la lista principal y scroll arriba
        setActiveSidebar('turismo')
        setActiveSection(null)
        setActiveFilter(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setCurrentPage('turismo')
        setActiveSidebar('turismo')
        setActiveSection(null)
        setActiveFilter(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      if (currentPage === 'turismo') {
        // Estamos en turismo: solo cambiar el sidebar, no salir de la página
        setActiveSidebar(activeSidebar === nav ? 'turismo' : nav)
      } else if (currentPage === 'locales') {
        setActiveSidebar(activeSidebar === nav ? 'locales' : nav)
        setActiveFilter(null)
      } else if (currentPage === 'eventos') {
        setActiveSidebar(activeSidebar === nav ? 'eventos' : nav)
        setActiveFilter(null)
      } else {
        // Estamos en inicio o SectionPage: toggle sidebar y limpiar filtro al cambiar
        const newSidebar = activeSidebar === nav ? null : nav
        setActiveSidebar(newSidebar)
        setActiveFilter(null)
      }
    }
  }

  const goHome = () => {
    const wasInStore = !!activeStore
    const savedScroll = scrollBeforeStore
    setCurrentPage(null)
    setActiveSidebar(null)
    setActiveSection(null)
    setActiveFilter(null)
    setStoreMapMode(false)
    setActiveStore(null)
    if (wasInStore && savedScroll > 0) {
      setTimeout(() => window.scrollTo({ top: savedScroll, behavior: 'smooth' }), 50)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleOpenStore = (store) => {
    setScrollBeforeStore(window.scrollY)
    window.scrollTo({ top: 0 })
    setCurrentPage(null)
    setActiveSidebar(null)
    setActiveSection(null)
    setActiveFilter(null)

    // Si la tienda tiene userId, cargar datos completos del negocio
    if (store.userId) {
      fetch(`${API}/api/business/${store.userId}`)
        .then(r => r.json())
        .then(data => {
          if (data.business) {
            const b = data.business
            setActiveStore({
              ...store,
              name: b.nombre_negocio || store.name,
              slogan: b.slogan || '',
              phone: b.whatsapp || b.telefono || store.phone || '',
              email: b.correo || '',
              address: b.direccion || '',
              description: '',
              facebook: b.facebook || '',
              instagram: b.instagram || '',
              horarios: b.horarios || [],
              plan_id: b.plan_id || 1,
            })
          } else {
            setActiveStore(store)
          }
        })
        .catch(() => setActiveStore(store))
    } else {
      setActiveStore(store)
    }
  }


  const handleViewAll = (section) => {
    setActiveSection(section)
    setActiveFilter(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterSelect = (filter) => {
    setActiveFilter(filter)
    window.scrollTo({ top: 0 })
  }

  const handleCategorySelect = (catLabel, subcategories) => {
    setActiveFilter({ category: catLabel, subcategories })
    window.scrollTo({ top: 0 })
  }

  const handleViewAllStores = () => {
    window.scrollTo({ top: 0 })
    setCurrentPage('locales')
    setActiveSidebar('locales')
    setActiveSection(null)
    setActiveFilter(null)
  }

  const handleViewAllEvents = () => {
    window.scrollTo({ top: 0 })
    setCurrentPage('eventos')
    setActiveSidebar('eventos')
    setActiveSection(null)
    setActiveFilter(null)
  }

  const handleSearchSelect = (item) => {
    window.scrollTo({ top: 0 })
    setStoreMapMode(false)
    setActiveSection(null)

    if (item.nav === 'turismo') {
      setCurrentPage('turismo')
      setActiveSidebar('turismo')
      setActiveFilter(item.label)
    } else if (item.nav === 'locales') {
      setCurrentPage('locales')
      setActiveSidebar('locales')
      setActiveFilter(item.label)
    } else if (item.nav === 'eventos') {
      setCurrentPage('eventos')
      setActiveSidebar('eventos')
      setActiveFilter(item.label)
    } else {
      // productos, servicios, arriendos
      setCurrentPage(null)
      setActiveSidebar(item.nav)
      if (item.type === 'category' && item.subcategories) {
        setActiveFilter({ category: item.label, subcategories: item.subcategories })
      } else {
        setActiveFilter(item.label)
      }
    }
  }

  // Para el header, marcar como activo el sidebar actual
  const activeNav = activeSidebar

  // Determinar si mostrar botón Inicio
  const showInicio = currentPage === 'turismo' || currentPage === 'locales' || currentPage === 'eventos' || activeSection !== null || activeFilter !== null || activeStore !== null

  if (activeStore) {
    return (
      <div className="relative flex min-h-screen flex-col">
        {/* Header fijo: mini barra + header tienda */}
        <div className="sticky top-0 z-50">
          {/* <div className="bg-primary px-6 border-b border-white/10" style={{ paddingTop: '1px', paddingBottom: '1px' }}>
            <div className="max-w-7xl mx-auto flex items-center">
              <button onClick={goHome} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <div className="bg-accent p-0.5 rounded text-primary leading-none">
                  <span className="material-symbols-outlined block text-xs font-bold">ads_click</span>
                </div>
                <span className="text-[7px] font-bold uppercase tracking-widest text-white/70">Solo a</span>
                <span className="text-[10px] font-black italic tracking-tight text-white -ml-0.5">un <span className="text-accent uppercase">CLICK</span></span>
              </button>
            </div>
          </div> */}
          <header className="bg-primary text-white px-6 py-7 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center gap-6 relative">
              <button onClick={goHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
                <div className="bg-accent p-1.5 rounded-lg text-primary leading-none">
                  <span className="material-symbols-outlined block text-2xl font-bold">ads_click</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">Solo a</span>
                  <span className="text-lg font-black italic tracking-tight text-white">un <span className="text-accent uppercase">CLICK</span></span>
                </div>
              </button>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col leading-none text-center">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/70">{activeStore.slogan}</span>
                  <span className="text-3xl font-black italic tracking-tight">{activeStore.name}</span>
                </div>
              </div>
              <div className="flex-1"></div>
              <label className="relative group shrink-0 w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary">search</span>
                </div>
                <input
                  className="w-full rounded-full bg-white text-slate-900 py-1.5 pl-9 pr-20 focus:ring-4 focus:ring-primary-light/40 border-none transition-all placeholder:text-slate-400 text-xs"
                  placeholder={`Buscar en ${activeStore.name}...`}
                  type="text"
                />
                <button className="absolute right-1 top-1 bottom-1 bg-accent text-primary px-3 rounded-full font-bold text-xs hover:brightness-110 hover:scale-105 transition-all">
                  Buscar
                </button>
              </label>
            </div>
          </header>
          <nav className="bg-[#4A2070] px-6 py-1.5 border-y-2 border-accent shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between relative">
              <button onClick={goHome} className="flex items-center gap-1 text-xs font-bold bg-accent text-primary px-3 py-1 rounded-full hover:brightness-110 transition-all">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Volver
              </button>
              <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-xs text-white/70">Hola, <span className="font-bold text-accent">{user.nombre}</span>
                    {' '}{user.tipo_cuenta === 'turismo' ? 'Turismo' : user.vende_productos ? 'Productos' : user.ofrece_servicios ? 'Servicios' : user.ofrece_arriendos ? 'Arriendos' : ''}
                    {' '}<span className="text-white/50">{user.plan_id === 3 ? 'Premium' : user.plan_id === 2 ? 'Normal' : 'Gratis'}</span>
                  </span>
                  <a href="/admin" className="flex items-center text-white/90 hover:text-accent transition-colors" title="Panel de administrador">
                    <span className="material-symbols-outlined text-xl">dashboard</span>
                  </a>
                  <button onClick={handleLogout} className="flex items-center text-white/90 hover:text-accent transition-colors" title="Salir">
                    <span className="material-symbols-outlined text-xl">logout</span>
                  </button>
                </>
              ) : (
                <button onClick={goHome} className="flex items-center gap-1 text-xs font-bold bg-accent text-primary px-3 py-1 rounded-full hover:brightness-110 transition-all">
                  <span className="material-symbols-outlined text-base">home</span>
                  Inicio
                </button>
              )}
              </div>
            </div>
          </nav>
        </div>

        <div className="w-full flex flex-1 flex-col md:flex-row">
          <StorePage store={activeStore} onBack={goHome} onOpenStore={handleOpenStore} />
        </div>

        <StoreFooter store={activeStore} />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header activeNav={activeNav} toggleNav={toggleNav} onGoHome={goHome} showInicio={showInicio} onSearchSelect={handleSearchSelect} user={user} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />

      <div className="w-full flex flex-1 flex-col md:flex-row">
        <Sidebar
          activeNav={activeSidebar}
          onClose={() => setActiveSidebar(currentPage === 'turismo' ? 'turismo' : currentPage === 'locales' ? 'locales' : currentPage === 'eventos' ? 'eventos' : null)}
          onGoHome={goHome}
          showInicio={showInicio}
          onFilterSelect={handleFilterSelect}
          activeFilter={activeFilter}
          onMapClick={() => setStoreMapMode(true)}
          onCategorySelect={handleCategorySelect}
          turismoCategorias={turismoCategorias}
          listingSubcategorias={listingSubcategorias}
          sidebarCategorias={sidebarCategorias}
        />

        <main className="flex-1 flex flex-col gap-8 p-6 overflow-hidden transition-all duration-300">
          {/* <Breadcrumbs /> */}

          {currentPage === 'eventos' ? (
            <EventsPage
              sidebarOpen={!!activeSidebar}
              onBack={goHome}
              activeFilter={activeFilter}
            />
          ) : currentPage === 'locales' ? (
            <StoresPage
              sidebarOpen={!!activeSidebar}
              onBack={goHome}
              activeFilter={activeFilter}
              mapMode={storeMapMode}
              onToggleMap={() => setStoreMapMode(false)}
            />
          ) : currentPage === 'turismo' ? (
            <TourismPage
              activeFilter={activeFilter}
              onClearFilter={() => setActiveFilter(null)}
              onEmpresaCategorias={(cats) => setTurismoCategorias(cats || turismoCategoriasAll)}
            />
          ) : activeFilter ? (
            /* Filtro activo: mostrar secciones (filas) que tengan productos de esa subcategoría o categoría */
            (() => {
              const isCategory = typeof activeFilter === 'object' && activeFilter.subcategories
              const filterLabel = isCategory ? activeFilter.category : activeFilter
              const filteredSections = sections
                .map((s) => ({
                  ...s,
                  items: s.items.filter((item) =>
                    isCategory
                      ? activeFilter.subcategories.includes(item.subcategory)
                      : item.subcategory === activeFilter
                  ),
                }))
                .filter((s) => s.items.length > 0)

              const rowCount = filteredSections.length

              return (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setActiveFilter(null)}
                      className="flex items-center gap-1 text-primary hover:text-accent transition-colors text-xs font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      Volver
                    </button>
                    <div className="w-1 h-5 bg-accent rounded-full"></div>
                    <h2 className="text-sm font-bold text-slate-700 tracking-wide">{filterLabel}</h2>
                    <span className="text-[10px] text-slate-400">
                      {filteredSections.reduce((acc, s) => acc + s.items.length, 0)} resultados
                    </span>
                  </div>
                  <div className="flex flex-col gap-8">
                    {filteredSections.map((section, index) => (
                      <div key={section.id}>
                        <ProductCarousel
                          title={section.title}
                          items={section.items}
                          sidebarOpen={!!activeSidebar}
                          hidePrice={section.hidePrice}
                          onViewAll={() => handleViewAll(section)}
                          onOpenStore={handleOpenStore}
                        />
                        {rowCount >= 3 && index === 1 && <div className="mt-8"><Banner /></div>}
                        {rowCount > 4 && index === 3 && <div className="mt-8"><StoresCarousel onViewAll={handleViewAllStores} /></div>}
                      </div>
                    ))}
                  </div>
                  {filteredSections.length === 0 && (
                    <p className="text-center text-slate-400 text-xs mt-8">
                      No hay productos para mostrar.
                    </p>
                  )}
                </div>
              )
            })()
          ) : activeSection ? (
            <SectionPage
              section={activeSection}
              sidebarOpen={!!activeSidebar}
              onBack={goHome}
              onOpenStore={handleOpenStore}
            />
          ) : (
            sections.map((section, index) => (
              <div key={section.id}>
                <ProductCarousel
                  title={section.title}
                  items={section.items}
                  sidebarOpen={!!activeSidebar}
                  hidePrice={section.hidePrice}
                  onViewAll={() => handleViewAll(section)}
                  onOpenStore={handleOpenStore}
                />
                {index === 1 && <div className="mt-8"><Banner /></div>}
                {index === 2 && <div className="mt-8"><EventsSection onViewAll={handleViewAllEvents} /></div>}
                {index === 4 && <div className="mt-8"><StoresCarousel onViewAll={handleViewAllStores} /></div>}
              </div>
            ))
          )}
        </main>
      </div>

      <Footer onNavigate={toggleNav} />
    </div>
  )
}
