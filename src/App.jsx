import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Breadcrumbs from './components/Breadcrumbs'
import ProductCarousel from './components/ProductCarousel'
import TourismPage from './components/TourismPage'
import EventsSection from './components/EventsSection'
import StoresCarousel from './components/StoresCarousel'
import TurismoSection from './components/TurismoSection'
import Footer from './components/Footer'
import SectionPage from './components/SectionPage'
import StoresPage from './components/StoresPage'
import EventsPage from './components/EventsPage'
import ArriendosPage from './components/ArriendosPage'
import ServiciosPage from './components/ServiciosPage'
import StorePage, { StoreFooter } from './components/StorePage'
import CategoryGrid from './components/CategoryGrid'
import HeroBanner from './components/HeroBanner'
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

  return SECTION_ORDER.map((id) => {
    const realItems = mixProductsByPlan(grouped[id] || [])
    return {
      id,
      title: SECTION_TITLES[id] || id,
      hidePrice: id === 'servicios',
      items: realItems,
    }
  })
}

// --- Rotación de secciones cada 5 horas ---
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function seededShuffle(arr, rng) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function buildShuffledRows(sections, seed) {
  if (sections.length === 0) return []
  const rng = seededRandom(seed)

  // Convertir secciones de productos a rows
  const productRows = sections.map(s => ({ type: 'product', id: s.id, data: s }))

  // Secciones especiales
  const specialRows = [
    { type: 'turismo', id: '_turismo' },
    { type: 'eventos', id: '_eventos' },
    { type: 'locales', id: '_locales' },
  ]

  // 1) Barajar productos y tomar los 2 primeros para posiciones 0,1
  const shuffledProducts = seededShuffle(productRows, rng)
  const first2 = shuffledProducts.slice(0, 2)
  const restProducts = shuffledProducts.slice(2)

  // 2) Mezclar los 6 productos restantes + 4 especiales para posiciones 2-11
  let pool = seededShuffle([...restProducts, ...specialRows], rng)

  return [...first2, ...pool]
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(null)
  const [activeSidebar, setActiveSidebar] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const [activeFilter, setActiveFilter] = useState(null)
  const [storeMapMode, setStoreMapMode] = useState(false)
  const [sidebarH, setSidebarH] = useState(0)
  const [sidebarOpenKey, setSidebarOpenKey] = useState(0)
  const [activeStore, setActiveStore] = useState(null)
  const [scrollBeforeStore, setScrollBeforeStore] = useState(0)
  const [storeCatKey, setStoreCatKey] = useState(0)
  const [sections, setSections] = useState([])
  const [shuffleSeed, setShuffleSeed] = useState(() => Math.floor(Date.now() / (5 * 60 * 60 * 1000)))
  const shuffledRows = useMemo(() => buildShuffledRows(sections, shuffleSeed), [sections, shuffleSeed])

  // Verificar cada minuto si cambió la ventana de 5 horas
  useEffect(() => {
    const interval = setInterval(() => {
      const newSeed = Math.floor(Date.now() / (5 * 60 * 60 * 1000))
      setShuffleSeed(prev => prev !== newSeed ? newSeed : prev)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const [turismoCategorias, setTurismoCategorias] = useState([])
  const [turismoCategoriasAll, setTurismoCategoriasAll] = useState([])
  const [listingSubcategorias, setListingSubcategorias] = useState([])
  const [sidebarCategorias, setSidebarCategorias] = useState([])
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  // Dev auto-login: si no hay token, intentar auto-login de desarrollo
  useEffect(() => {
    if (localStorage.getItem('token')) return
    const api = import.meta.env.VITE_API || ''
    fetch(`${api}/api/v1/auth/dev-auto-login`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          setUser(data.user)
        }
      })
      .catch(() => {})
  }, [])

  // Registrar visita al sitio
  useEffect(() => {
    fetch(`${API}/api/v1/servidor/visita`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagina: 'home' }),
    }).catch(() => {})
  }, [])

  // Cargar listings desde API
  useEffect(() => {
    fetch(`${API}/api/v1/listings`)
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
    fetch(`${API}/api/v1/portada/public`)
      .then(r => r.json())
      .then(data => {
        if (data.portadas && data.portadas.length > 0) {
          const cats = new Set()
          data.portadas.forEach(p => {
            if (p.categorias && Array.isArray(p.categorias)) {
              p.categorias.forEach(c => cats.add(c))
            }
          })
          const sorted = [...cats].sort()
          setTurismoCategorias(sorted)
          setTurismoCategoriasAll(sorted)
        } else {
          setTurismoCategorias([])
          setTurismoCategoriasAll([])
        }
      })
      .catch(() => {
        setTurismoCategorias([])
        setTurismoCategoriasAll([])
      })

    // Cargar categorías del sidebar: solo las que tienen productos publicados
    fetch(`${API}/api/v1/categorias/sidebar`)
      .then(r => r.json())
      .then(data => {
        if (data.categorias) setSidebarCategorias(data.categorias)
      })
      .catch(err => console.error('Error cargando categorías sidebar:', err))
  }, [])

  const [turismoDirectUserId, setTurismoDirectUserId] = useState(null)
  const [turismoResetKey, setTurismoResetKey] = useState(0)
  const [turismoScrollTo, setTurismoScrollTo] = useState(null)

  // Abrir tienda o turismo directamente si viene ?store= o ?turismo= en la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const storeUserId = params.get('store')
    const turismoUserId = params.get('turismo')
    if (storeUserId) {
      window.history.replaceState({}, '', '/')
      handleOpenStore({ id: `user-${storeUserId}`, userId: parseInt(storeUserId) })
    } else if (turismoUserId) {
      window.history.replaceState({}, '', '/')
      setCurrentPage('turismo')
      setActiveSidebar('turismo')
      setTurismoDirectUserId(parseInt(turismoUserId))
    }

    // Navegar a sección si viene desde el admin (navTo)
    const navTo = localStorage.getItem('navTo')
    if (navTo) {
      localStorage.removeItem('navTo')
      if (navTo === 'turismo') {
        setCurrentPage('turismo')
        setActiveSidebar('turismo')
        const scrollTo = localStorage.getItem('turismo_scroll_to')
        if (scrollTo) {
          localStorage.removeItem('turismo_scroll_to')
          setTurismoScrollTo(parseInt(scrollTo))
        }
      }
    }
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const toggleNav = (nav, openSidebar = true) => {
    if (nav === 'negocios') {
      if (currentPage === 'locales') {
        if (openSidebar) setSidebarOpenKey(k => k + 1)
        return
      }
      handleViewAllStores()
      if (openSidebar) setSidebarOpenKey(k => k + 1)
      return
    }
    if (nav === 'turismo') {
      if (currentPage === 'turismo') {
        if (openSidebar) setSidebarOpenKey(k => k + 1)
        return
      }
      setCurrentPage('turismo')
      setActiveSidebar('turismo')
      setActiveSection(null)
      setActiveFilter(null)
      setTurismoResetKey(k => k + 1)
      if (openSidebar) setSidebarOpenKey(k => k + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (nav === 'arriendos') {
      if (currentPage === 'arriendos') {
        if (openSidebar) setSidebarOpenKey(k => k + 1)
        return
      }
      handleViewAllArriendos()
      if (openSidebar) setSidebarOpenKey(k => k + 1)
      return
    }
    if (nav === 'servicios') {
      if (currentPage === 'servicios') {
        if (openSidebar) setSidebarOpenKey(k => k + 1)
        return
      }
      handleViewAllServicios()
      if (openSidebar) setSidebarOpenKey(k => k + 1)
      return
    }
    // Productos
    if (currentPage === 'productos') {
      if (openSidebar) setSidebarOpenKey(k => k + 1)
      return
    }
    handleViewAllProductos()
    if (openSidebar) setSidebarOpenKey(k => k + 1)
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
      fetch(`${API}/api/v1/business/${store.userId}`)
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
              description: b.descripcion || '',
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

  const handleViewAllArriendos = () => {
    window.scrollTo({ top: 0 })
    setCurrentPage('arriendos')
    setActiveSidebar('arriendos')
    setActiveSection(null)
    setActiveFilter(null)
  }

  const handleViewAllServicios = () => {
    window.scrollTo({ top: 0 })
    setCurrentPage('servicios')
    setActiveSidebar('servicios')
    setActiveSection(null)
    setActiveFilter(null)
  }

  const handleViewAllProductos = () => {
    window.scrollTo({ top: 0 })
    setCurrentPage('productos')
    setActiveSidebar('productos')
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
    } else if (item.nav === 'arriendos') {
      setCurrentPage('arriendos')
      setActiveSidebar('arriendos')
      setActiveFilter(item.label)
    } else if (item.nav === 'servicios') {
      setCurrentPage('servicios')
      setActiveSidebar('servicios')
      setActiveFilter(item.label)
    } else {
      // productos
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
  const showInicio = currentPage === 'turismo' || currentPage === 'locales' || currentPage === 'eventos' || currentPage === 'arriendos' || currentPage === 'servicios' || currentPage === 'productos' || activeSection !== null || activeFilter !== null || activeStore !== null || activeSidebar !== null

  if (activeStore) {
    return (
      <div className="relative flex min-h-screen flex-col">
        {/* Header fijo: mini barra + header tienda */}
        <div className="sticky top-0 z-50">
          <header className="bg-primary text-white px-3 sm:px-4 md:px-6 py-3 sm:py-5 md:py-7 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4 md:gap-6 relative">
              <button onClick={goHome} className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity shrink-0">
                <div className="bg-accent p-1 sm:p-1.5 rounded-lg text-primary leading-none">
                  <span className="material-symbols-outlined block text-lg sm:text-xl md:text-2xl font-bold">ads_click</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/70">Solo a</span>
                  <span className="text-sm sm:text-base md:text-lg font-black italic tracking-tight text-white">un <span className="text-accent uppercase">CLICK</span></span>
                </div>
              </button>
              <div className="hidden sm:flex absolute inset-0 items-center justify-center pointer-events-none">
                <div className="flex flex-col leading-none text-center">
                  <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest text-white/70">{activeStore.slogan}</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-black italic tracking-tight">{activeStore.name}</span>
                </div>
              </div>
              {/* Nombre tienda mobile - debajo del logo */}
              <div className="sm:hidden flex-1 min-w-0 text-center">
                <span className="text-base font-black italic tracking-tight block truncate">{activeStore.name}</span>
              </div>
              <div className="flex-1 hidden sm:block"></div>
              <label className="relative group shrink-0 w-48 sm:w-56 md:w-64 hidden sm:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary text-sm">search</span>
                </div>
                <input
                  className="w-full rounded-full bg-white text-slate-900 py-1.5 pl-9 pr-16 sm:pr-20 focus:ring-4 focus:ring-primary-light/40 border-none transition-all placeholder:text-slate-400 text-xs"
                  placeholder={`Buscar en ${activeStore.name}...`}
                  type="text"
                />
                <button className="absolute right-1 top-1 bottom-1 bg-accent text-primary px-2 sm:px-3 rounded-full font-bold text-[10px] sm:text-xs hover:brightness-110 hover:scale-105 transition-all">
                  Buscar
                </button>
              </label>
            </div>
          </header>
          <nav className="bg-[#4A2070] px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 border-y-2 border-accent shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between relative">
              <button onClick={goHome} className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-accent border border-accent px-2 sm:px-2.5 py-0.5 rounded-full hover:bg-accent/10 transition-all">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Volver
              </button>
              {/* Hamburguesa centrada — solo mobile */}
              <button
                onClick={() => setStoreCatKey(k => k + 1)}
                className="md:hidden absolute left-1/2 -translate-x-1/2 p-0.5 rounded-md hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-white text-xl">menu</span>
              </button>
              <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  {user.rol !== 'programador' && (
                    <>
                      <span className="hidden md:inline text-xs text-white/70">Hola, <span className="font-bold text-accent">{(() => { const n = user.nombre.split(' ')[0]; return n.length > 10 ? n.slice(0, 10) + '...' : n })()}</span>
                        {' '}<span className="text-white/50">Plan {user.plan_id === 3 ? 'Premium' : user.plan_id === 2 ? 'Normal' : 'Gratis'}</span>
                      </span>
                      <Link to="/admin" className="flex items-center text-white/90 hover:text-accent transition-colors" title="Panel de administrador">
                        <span className="material-symbols-outlined text-lg sm:text-xl">dashboard</span>
                      </Link>
                    </>
                  )}
                  {user.rol === 'programador' && (
                    <Link to="/admin" className="flex items-center text-white/90 hover:text-accent transition-colors" title="Panel programador">
                      <span className="material-symbols-outlined text-lg sm:text-xl">terminal</span>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center text-white/90 hover:text-accent transition-colors" title="Salir">
                    <span className="material-symbols-outlined text-lg sm:text-xl">logout</span>
                  </button>
                </>
              ) : (
                <button onClick={goHome} className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-accent border border-accent px-2 sm:px-2.5 py-0.5 rounded-full hover:bg-accent/10 transition-all">
                  <span className="material-symbols-outlined text-sm">home</span>
                  Inicio
                </button>
              )}
              </div>
            </div>
          </nav>
        </div>

        <div className="w-full flex flex-1 flex-col md:flex-row">
          <StorePage store={activeStore} onBack={goHome} onOpenStore={handleOpenStore} mobileCatKey={storeCatKey} />
        </div>

        <StoreFooter store={activeStore} />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header activeNav={activeNav} toggleNav={toggleNav} onGoHome={goHome} showInicio={showInicio} onSearchSelect={handleSearchSelect} user={user} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />

      <div className="w-full flex flex-1 flex-col md:flex-row relative" style={sidebarH > 0 ? { minHeight: sidebarH } : undefined}>
        <Sidebar
          activeNav={activeSidebar}
          onClose={() => setActiveSidebar(currentPage === 'turismo' ? 'turismo' : currentPage === 'locales' ? 'locales' : currentPage === 'eventos' ? 'eventos' : currentPage === 'arriendos' ? 'arriendos' : currentPage === 'servicios' ? 'servicios' : currentPage === 'productos' ? 'productos' : null)}
          onGoHome={goHome}
          showInicio={showInicio}
          onFilterSelect={handleFilterSelect}
          activeFilter={activeFilter}
          onMapClick={() => setStoreMapMode(true)}
          onCategorySelect={handleCategorySelect}
          turismoCategorias={turismoCategorias}
          listingSubcategorias={listingSubcategorias}
          sidebarCategorias={sidebarCategorias}
          openKey={sidebarOpenKey}
          onSidebarHeight={setSidebarH}
        />

        <main className="flex-1 flex flex-col gap-4 sm:gap-6 md:gap-8 p-3 sm:p-4 md:p-6 overflow-hidden transition-all duration-300">
          {/* <Breadcrumbs /> */}

          {currentPage === 'productos' ? (
            (() => {
              const productSections = sections
                .filter(s => s.id !== 'servicios' && s.id !== 'arriendos')
                .map(s => ({
                  ...s,
                  items: activeFilter
                    ? s.items.filter(item => {
                        if (typeof activeFilter === 'object' && activeFilter.subcategories) {
                          return activeFilter.subcategories.some(sub => sub.toLowerCase() === (item.subcategory || '').toLowerCase())
                        }
                        return (item.subcategory || '').toLowerCase() === activeFilter.toLowerCase() || (item.categoria || '').toLowerCase() === activeFilter.toLowerCase()
                      })
                    : s.items,
                }))
                .filter(s => s.items.length > 0)

              return (
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <button onClick={goHome} className="flex items-center gap-1 text-primary hover:text-accent transition-colors text-[10px] sm:text-xs font-bold">
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      Volver
                    </button>
                    <div className="w-1 h-4 sm:h-5 bg-accent rounded-full"></div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">
                      {activeFilter ? (typeof activeFilter === 'object' ? activeFilter.category : activeFilter) : 'Todos los Productos'}
                    </h2>
                  </div>
                  {productSections.length > 0 ? (
                    <div className="flex flex-col gap-8">
                      {productSections.map((section, index) => (
                        <div key={section.id}>
                          <ProductCarousel
                            title={section.title}
                            items={section.items}
                            sidebarOpen={!!activeSidebar}
                            hidePrice={section.hidePrice}
                            onViewAll={() => handleViewAll(section)}
                            onOpenStore={handleOpenStore}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 text-xs mt-8">No hay productos para mostrar.</p>
                  )}
                </div>
              )
            })()
          ) : currentPage === 'servicios' ? (
            <ServiciosPage
              sidebarOpen={!!activeSidebar}
              onBack={goHome}
              activeFilter={activeFilter}
              onOpenStore={handleOpenStore}
            />
          ) : currentPage === 'arriendos' ? (
            <ArriendosPage
              sidebarOpen={!!activeSidebar}
              onBack={goHome}
              activeFilter={activeFilter}
              onOpenStore={handleOpenStore}
            />
          ) : currentPage === 'eventos' ? (
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
              initialUserId={turismoDirectUserId}
              onInitialUserConsumed={() => setTurismoDirectUserId(null)}
              resetKey={turismoResetKey}
              scrollToUserId={turismoScrollTo}
              onScrollConsumed={() => setTurismoScrollTo(null)}
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
                      ? activeFilter.subcategories.some(sub => sub.toLowerCase() === (item.subcategory || '').toLowerCase())
                      : (item.subcategory || '').toLowerCase() === activeFilter.toLowerCase()
                  ),
                }))
                .filter((s) => s.items.length > 0)

              const rowCount = filteredSections.length

              return (
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <button
                      onClick={() => setActiveFilter(null)}
                      className="flex items-center gap-1 text-primary hover:text-accent transition-colors text-[10px] sm:text-xs font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      Volver
                    </button>
                    <div className="w-1 h-4 sm:h-5 bg-accent rounded-full"></div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">{filterLabel}</h2>
                    <span className="text-[9px] sm:text-[10px] text-slate-400">
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
            (() => {
              // Group sections by mockup layout (using sections directly, not shuffledRows)
              const getSection = (id) => sections.find(s => s.id === id)
              // Productos: combinar destacados + novedades + tecnología + tendencia, aleatorio sin repetir
              const productosSections = ['destacados', 'novedades', 'tecnologia', 'tendencia']
              const realProductos = productosSections.flatMap(id => (getSection(id)?.items || []))
              const productosEjemplo = [
                { id: 'ej-p1', name: 'Polera Estampada Volcán', description: 'Algodón premium con diseño del volcán Villarrica', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', price: 12990 },
                { id: 'ej-p2', name: 'Mochila Outdoor Pro', description: 'Resistente al agua 30L, ideal para trekking', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', price: 34990, badge: 'Nuevo' },
                { id: 'ej-p3', name: 'Mermelada de Murta', description: 'Artesanal 100% natural, frutos nativos del sur', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', price: 4990, badge: 'Local' },
                { id: 'ej-p4', name: 'Bufanda de Lana Natural', description: 'Tejida a mano con lana de oveja, diseño mapuche', image: 'https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=400&q=80', price: 15990 },
                { id: 'ej-p5', name: 'Tabla de Asado Nativa', description: 'Madera de lenga tallada a mano, 50cm', image: 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=400&q=80', price: 18990 },
                { id: 'ej-p6', name: 'Miel de Ulmo Premium', description: 'Miel pura de bosque nativo, 500g', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80', price: 8990, badge: 'Premium' },
                { id: 'ej-p7', name: 'Cerveza Artesanal Pack x4', description: 'Variedades locales: Amber, IPA, Stout y Pilsner', image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80', price: 9990, badge: 'Nuevo' },
                { id: 'ej-p8', name: 'Gorro de Lana Araucanía', description: 'Tejido artesanal con diseños étnicos', image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&q=80', price: 7990 },
                { id: 'ej-p9', name: 'Jabón Artesanal Lavanda', description: 'Jabón natural con aceites esenciales', image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80', price: 3990, badge: 'Nuevo' },
                { id: 'ej-p10', name: 'Cuadro Volcán Villarrica', description: 'Óleo sobre tela 40x30cm, artista local', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80', price: 29990 },
                { id: 'ej-p11', name: 'Taza Cerámica Mapuche', description: 'Cerámica artesanal con diseño ancestral', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80', price: 6990 },
                { id: 'ej-p12', name: 'Parlante Bluetooth', description: 'Resistente al agua IPX5, 12h de batería', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80', price: 24990, badge: 'Top' },
                { id: 'ej-p13', name: 'Cargador Solar Camping', description: 'Panel solar plegable 20W, USB dual', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80', price: 19990 },
                { id: 'ej-p14', name: 'Smartwatch Outdoor', description: 'GPS, altímetro, brújula, resistente al agua', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', price: 49990 },
                { id: 'ej-p15', name: 'Parka Impermeable', description: 'Cortaviento, membrana 10K, capucha ajustable', image: 'https://images.unsplash.com/photo-1544923246-77307dd270b5?w=400&q=80', price: 59990, badge: 'Top' },
                { id: 'ej-p16', name: 'Botella Térmica 750ml', description: 'Acero inoxidable, 24h frío / 12h caliente', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80', price: 11990 },
                { id: 'ej-p17', name: 'Zapatillas Trail Running', description: 'Suela Vibram, grip extremo para senderos', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', price: 54990 },
                { id: 'ej-p18', name: 'Chocolate Artesanal Surtido', description: 'Caja 12 bombones, cacao orgánico del sur', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80', price: 7990, badge: 'Top' },
                { id: 'ej-p19', name: 'Manta de Lana Chilota', description: 'Lana natural teñida con tintes vegetales', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&q=80', price: 39990 },
                { id: 'ej-p20', name: 'Kit Mate Premium', description: 'Mate calabaza + bombilla alpaca + bolso cuero', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80', price: 22990 },
                { id: 'ej-p21', name: 'Linterna LED Recargable', description: 'Alta potencia 1000 lumens, resistente al agua', image: 'https://images.unsplash.com/photo-1507477338202-487281e6c27e?w=400&q=80', price: 12990 },
                { id: 'ej-p22', name: 'Auriculares Inalámbricos', description: 'Cancelación de ruido, 30h batería', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', price: 29990 },
                { id: 'ej-p23', name: 'Power Bank 20000mAh', description: 'Carga rápida, 3 puertos USB, compacto', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80', price: 15990 },
                { id: 'ej-p24', name: 'Calcetines Térmicos Pack x3', description: 'Lana merino, ideales para invierno', image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&q=80', price: 8990, badge: 'Nuevo' },
              ]
              const allProductos = realProductos.length > 0 ? realProductos : productosEjemplo
              // Mezclar aleatoriamente (Fisher-Yates)
              const shuffled = [...allProductos]
              for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
              }
              // Dividir en 2 filas
              const half = Math.ceil(shuffled.length / 2)
              const prodRow1Items = shuffled.slice(0, half)
              const prodRow2Items = shuffled.slice(half)
              // Ofertas: combinar ofertas + liquidacion, aleatorio sin repetir
              const ofertasSections = ['ofertas', 'liquidacion']
              const realOfertas = ofertasSections.flatMap(id => (getSection(id)?.items || []))
              const ofertasEjemplo = [
                { id: 'ej-o1', name: 'Chaqueta Térmica', description: 'Impermeable y cortaviento, ideal para invierno', image: 'https://images.unsplash.com/photo-1544923246-77307dd270b5?w=400&q=80', price: 29990, originalPrice: 49990, badge: '-40%' },
                { id: 'ej-o2', name: 'Set de Jardinería', description: 'Herramientas premium para huerto casero', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80', price: 14990, originalPrice: 24990, badge: '-40%' },
                { id: 'ej-o3', name: 'Zapatillas Running', description: 'Amortiguación avanzada, suela antideslizante', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', price: 34990, originalPrice: 54990, badge: '-36%' },
                { id: 'ej-o4', name: 'Cafetera Italiana', description: 'Acero inoxidable, 6 tazas', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80', price: 12990, originalPrice: 19990, badge: '-35%' },
                { id: 'ej-o5', name: 'Manta Polar Premium', description: 'Extra suave, tamaño king 200x230cm', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&q=80', price: 9990, originalPrice: 18990, badge: '-47%' },
                { id: 'ej-o6', name: 'Parlante Portátil', description: 'Bluetooth 5.0, resistente al agua', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80', price: 19990, originalPrice: 32990, badge: '-39%' },
                { id: 'ej-o7', name: 'Botas de Trekking', description: 'Cuero impermeable, suela Vibram', image: 'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=400&q=80', price: 44990, originalPrice: 69990, badge: '-36%' },
                { id: 'ej-o8', name: 'Sartén Antiadherente', description: 'Cerámica premium, mango ergonómico 28cm', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80', price: 11990, originalPrice: 21990, badge: '-45%' },
                { id: 'ej-o9', name: 'Mochila Escolar', description: 'Resistente al agua, compartimento notebook', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', price: 15990, originalPrice: 27990, badge: '-43%' },
                { id: 'ej-o10', name: 'Reloj Deportivo', description: 'Sumergible 50m, cronómetro, alarma', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', price: 22990, originalPrice: 39990, badge: '-42%' },
                { id: 'ej-o11', name: 'Sweater de Lana', description: 'Lana merino natural, tejido grueso', image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&q=80', price: 18990, originalPrice: 32990, badge: '-42%' },
                { id: 'ej-o12', name: 'Termo Acero 1L', description: 'Doble pared, mantiene 24h frío/12h caliente', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80', price: 8990, originalPrice: 15990, badge: '-44%' },
                { id: 'ej-o13', name: 'Lentes de Sol UV400', description: 'Polarizados, montura liviana resistente', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80', price: 9990, originalPrice: 17990, badge: '-44%' },
                { id: 'ej-o14', name: 'Colchoneta Yoga', description: 'Antideslizante 6mm, incluye correa', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80', price: 7990, originalPrice: 14990, badge: '-47%' },
                { id: 'ej-o15', name: 'Audífonos Bluetooth', description: 'Cancelación de ruido, 20h batería', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', price: 24990, originalPrice: 42990, badge: '-42%' },
                { id: 'ej-o16', name: 'Set Cuchillos Chef', description: '5 piezas acero inoxidable + taco madera', image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&q=80', price: 19990, originalPrice: 34990, badge: '-43%' },
                { id: 'ej-o17', name: 'Lámpara LED Escritorio', description: 'Recargable USB, 3 tonos de luz', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&q=80', price: 6990, originalPrice: 12990, badge: '-46%' },
                { id: 'ej-o18', name: 'Bolso Deportivo 40L', description: 'Compartimento para zapatillas, impermeable', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', price: 16990, originalPrice: 28990, badge: '-41%' },
                { id: 'ej-o19', name: 'Guantes Térmicos', description: 'Touch screen, interior polar, resistentes', image: 'https://images.unsplash.com/photo-1545170241-e489b37bfb98?w=400&q=80', price: 5990, originalPrice: 10990, badge: '-45%' },
                { id: 'ej-o20', name: 'Hamaca Camping', description: 'Nylon paracaídas, soporta 200kg, ultraliviana', image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=80', price: 13990, originalPrice: 23990, badge: '-42%' },
                { id: 'ej-o21', name: 'Hervidor Eléctrico', description: 'Acero inoxidable 1.7L, apagado automático', image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&q=80', price: 10990, originalPrice: 18990, badge: '-42%' },
                { id: 'ej-o22', name: 'Polera Deportiva Dry-Fit', description: 'Secado rápido, protección UV, transpirable', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', price: 7990, originalPrice: 13990, badge: '-43%' },
                { id: 'ej-o23', name: 'Cojín Lumbar Ergonómico', description: 'Espuma memoria, funda lavable', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', price: 11990, originalPrice: 19990, badge: '-40%' },
                { id: 'ej-o24', name: 'Kit Picnic 4 Personas', description: 'Platos, cubiertos, vasos + bolso térmico', image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400&q=80', price: 21990, originalPrice: 36990, badge: '-41%' },
              ]
              const allOfertas = realOfertas.length > 0 ? realOfertas : ofertasEjemplo
              const shuffledOfertas = [...allOfertas]
              for (let i = shuffledOfertas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[shuffledOfertas[i], shuffledOfertas[j]] = [shuffledOfertas[j], shuffledOfertas[i]]
              }
              const halfOfertas = Math.ceil(shuffledOfertas.length / 2)
              const ofertaRow1Items = shuffledOfertas.slice(0, halfOfertas)
              const ofertaRow2Items = shuffledOfertas.slice(halfOfertas)
              // Arriendos: aleatorio sin repetir
              const realArriendos = getSection('arriendos')?.items || []
              const arriendosEjemplo = [
                { id: 'ej-a1', name: 'Cabaña Lago Villarrica', description: '4 personas, orilla del lago, quincho equipado', image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&q=80', price: 65000, badge: 'Por noche' },
                { id: 'ej-a2', name: 'Departamento Centro', description: '2 dormitorios, amoblado, estacionamiento', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80', price: 45000, badge: 'Por noche' },
                { id: 'ej-a3', name: 'Casa Familiar Pucón', description: '6 personas, patio grande, parrilla', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80', price: 85000, badge: 'Por noche' },
                { id: 'ej-a4', name: 'Tiny House Bosque', description: 'Para 2, rodeada de naturaleza, calefacción', image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&q=80', price: 55000, badge: 'Por noche' },
                { id: 'ej-a5', name: 'Loft con Vista al Volcán', description: 'Moderno, terraza panorámica, WiFi', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80', price: 70000, badge: 'Por noche' },
                { id: 'ej-a6', name: 'Cabaña Río Toltén', description: '3 dormitorios, acceso directo al río', image: 'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=400&q=80', price: 75000, badge: 'Por noche' },
                { id: 'ej-a7', name: 'Motorhome Equipado', description: 'Para 4 personas, cocina, baño, calefacción', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&q=80', price: 50000, badge: 'Por día' },
                { id: 'ej-a8', name: 'Bicicleta Montaña', description: 'Aro 29, suspensión delantera, casco incluido', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80', price: 12000, badge: 'Por día' },
                { id: 'ej-a9', name: 'Kayak Doble', description: 'Incluye remos y chalecos salvavidas', image: 'https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=400&q=80', price: 18000, badge: 'Por día' },
                { id: 'ej-a10', name: 'Stand Up Paddle', description: 'Tabla inflable + remo + bomba', image: 'https://images.unsplash.com/photo-1526188717906-ab4a2f949f57?w=400&q=80', price: 15000, badge: 'Por día' },
                { id: 'ej-a11', name: 'Carpa 4 Estaciones', description: 'Para 3 personas, resistente a lluvia y viento', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80', price: 8000, badge: 'Por día' },
                { id: 'ej-a12', name: 'Equipo de Ski Completo', description: 'Skis + botas + bastones, talla a elección', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80', price: 25000, badge: 'Por día' },
              ]
              const allArriendos = realArriendos.length > 0 ? realArriendos : arriendosEjemplo
              const shuffledArriendos = [...allArriendos]
              for (let i = shuffledArriendos.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[shuffledArriendos[i], shuffledArriendos[j]] = [shuffledArriendos[j], shuffledArriendos[i]]
              }

              // Servicios: aleatorio sin repetir
              const realServicios = getSection('servicios')?.items || []
              const serviciosEjemplo = [
                { id: 'ej-s1', name: 'Electricista Certificado', description: 'Instalaciones, reparaciones, emergencias 24/7', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80', badge: 'Profesional' },
                { id: 'ej-s2', name: 'Gasfiter a Domicilio', description: 'Cañerías, calefont, baños, cocina', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80', badge: 'Profesional' },
                { id: 'ej-s3', name: 'Clases de Yoga', description: 'Grupales e individuales, todos los niveles', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', badge: 'Bienestar' },
                { id: 'ej-s4', name: 'Peluquería a Domicilio', description: 'Corte, color, tratamientos capilares', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80', badge: 'Belleza' },
                { id: 'ej-s5', name: 'Mecánico Automotriz', description: 'Diagnóstico, mantención, frenos, motor', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&q=80', badge: 'Automotriz' },
                { id: 'ej-s6', name: 'Profesor Particular Matemáticas', description: 'Básica, media y PSU, resultados garantizados', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80', badge: 'Educación' },
                { id: 'ej-s7', name: 'Jardinería y Paisajismo', description: 'Diseño, mantención, poda, riego automático', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80', badge: 'Hogar' },
                { id: 'ej-s8', name: 'Fotografía Profesional', description: 'Eventos, retratos, productos, naturaleza', image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&q=80', badge: 'Creativo' },
                { id: 'ej-s9', name: 'Mudanzas y Fletes', description: 'Camión cerrado, embalaje, carga y descarga', image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&q=80', badge: 'Transporte' },
                { id: 'ej-s10', name: 'Veterinaria Móvil', description: 'Consultas, vacunas, desparasitación a domicilio', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80', badge: 'Mascotas' },
                { id: 'ej-s11', name: 'Masajes Terapéuticos', description: 'Descontracturante, relajación, deportivo', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80', badge: 'Bienestar' },
                { id: 'ej-s12', name: 'Diseño Web y Redes Sociales', description: 'Páginas web, logo, manejo de Instagram y Facebook', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', badge: 'Digital' },
              ]
              const allServicios = realServicios.length > 0 ? realServicios : serviciosEjemplo
              const shuffledServicios = [...allServicios]
              for (let i = shuffledServicios.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[shuffledServicios[i], shuffledServicios[j]] = [shuffledServicios[j], shuffledServicios[i]]
              }

              return (
                <>
                  {/* 1. HERO BANNER */}
                  <HeroBanner />

                  {/* 2. CATEGORÍAS */}
                  <CategoryGrid onNavigate={toggleNav} />

                  {/* 3. PRODUCTOS — fondo blanco, 2 filas */}
                  <div className="bg-white -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-5 sm:py-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4">
                      <div className="w-1 h-5 sm:h-6 bg-accent rounded-full"></div>
                      <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-wide">Productos</h2>
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <button onClick={() => toggleNav('productos')} className="text-[9px] sm:text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wider">Ver todo</button>
                    </div>
                    <div className="flex flex-col gap-6">
                      {prodRow1Items.length > 0 && (
                        <ProductCarousel
                          key="productos-row1"
                          title="Productos"
                          items={prodRow1Items}
                          sidebarOpen={!!activeSidebar}
                          onViewAll={() => toggleNav('productos')}
                          onOpenStore={handleOpenStore}
                          hideHeader
                        />
                      )}
                      {prodRow2Items.length > 0 && (
                        <ProductCarousel
                          key="productos-row2"
                          title="Productos"
                          items={prodRow2Items}
                          sidebarOpen={!!activeSidebar}
                          onViewAll={() => toggleNav('productos')}
                          onOpenStore={handleOpenStore}
                          hideHeader
                        />
                      )}
                    </div>
                  </div>

                  {/* 4. TURISMO — fondo foto oscuro */}
                  <div className="-mx-3 sm:-mx-4 md:-mx-6">
                    <TurismoSection onViewAll={() => { setCurrentPage('turismo'); setActiveSidebar('turismo') }} onOpenTour={(userId) => { setCurrentPage('turismo'); setActiveSidebar('turismo'); setTurismoDirectUserId(userId) }} />
                  </div>

                  {/* 5. OFERTAS — fondo gris, 2 filas */}
                  <div className="bg-[#F5F4F7] -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-5 sm:py-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4">
                      <div className="w-1 h-5 sm:h-6 bg-accent rounded-full"></div>
                      <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-wide">Productos en <span className="text-red-500">Oferta</span></h2>
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <button onClick={() => toggleNav('productos')} className="text-[9px] sm:text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wider">Ver todo</button>
                    </div>
                    <div className="flex flex-col gap-6">
                      {ofertaRow1Items.length > 0 && (
                        <ProductCarousel
                          key="ofertas-row1"
                          title="Ofertas"
                          items={ofertaRow1Items}
                          sidebarOpen={!!activeSidebar}
                          onViewAll={() => toggleNav('productos')}
                          onOpenStore={handleOpenStore}
                          hideHeader
                        />
                      )}
                      {ofertaRow2Items.length > 0 && (
                        <ProductCarousel
                          key="ofertas-row2"
                          title="Ofertas"
                          items={ofertaRow2Items}
                          sidebarOpen={!!activeSidebar}
                          onViewAll={() => toggleNav('productos')}
                          onOpenStore={handleOpenStore}
                          hideHeader
                        />
                      )}
                    </div>
                  </div>


                  {/* 7. EVENTOS — fondo oscuro */}
                  <div className="-mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                    <EventsSection onViewAll={handleViewAllEvents} />
                  </div>

                  {/* 8. ARRIENDOS — fondo blanco */}
                  <div className="bg-white -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-5 sm:py-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4">
                      <div className="w-1 h-5 sm:h-6 bg-accent rounded-full"></div>
                      <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-wide">Arriendos</h2>
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <button onClick={() => toggleNav('arriendos')} className="text-[9px] sm:text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wider">Ver todo</button>
                    </div>
                    {shuffledArriendos.length > 0 && (
                      <ProductCarousel
                        key="arriendos-row"
                        title="Arriendos"
                        items={shuffledArriendos}
                        sidebarOpen={!!activeSidebar}
                        onViewAll={() => toggleNav('arriendos')}
                        onOpenStore={handleOpenStore}
                        hideHeader
                      />
                    )}
                  </div>

                  {/* 9. SERVICIOS — fondo gris */}
                  <div className="bg-[#F5F4F7] -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-5 sm:py-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4">
                      <div className="w-1 h-5 sm:h-6 bg-accent rounded-full"></div>
                      <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-wide">Servicios</h2>
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <button onClick={() => toggleNav('servicios')} className="text-[9px] sm:text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wider">Ver todo</button>
                    </div>
                    {shuffledServicios.length > 0 && (
                      <ProductCarousel
                        key="servicios-row"
                        title="Servicios"
                        items={shuffledServicios}
                        sidebarOpen={!!activeSidebar}
                        hidePrice
                        onViewAll={() => toggleNav('servicios')}
                        onOpenStore={handleOpenStore}
                        hideHeader
                      />
                    )}
                  </div>

                  {/* 10. LOCALES — fondo morado */}
                  <StoresCarousel onViewAll={handleViewAllStores} />
                </>
              )
            })()
          )}
        </main>
      </div>

      <Footer onNavigate={toggleNav} onLoginSuccess={handleLoginSuccess} />
    </div>
  )
}
