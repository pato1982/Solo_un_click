import { useState, useRef, useEffect } from 'react'
import PlansModal from './PlansModal'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import { searchIndex } from '../data/searchIndex'

export default function Header({ activeNav, toggleNav, onGoHome, showInicio, onSearchSelect, user, onLoginSuccess, onLogout }) {
  const [showPlans, setShowPlans] = useState(false)
  const [showLogin, setShowLogin] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return !!params.get('reset')
  })
  const [showRegister, setShowRegister] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (value) => {
    setQuery(value)
    if (value.length >= 3) {
      const q = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const matches = searchIndex.filter((item) => {
        const label = item.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return label.includes(q)
      })
      setResults(matches.slice(0, 8))
      setShowResults(true)
    } else {
      setResults([])
      setShowResults(false)
    }
  }

  const handleSelect = (item) => {
    setQuery('')
    setResults([])
    setShowResults(false)
    if (onSearchSelect) onSearchSelect(item)
  }

  const navItems = [
    { label: 'Productos', icon: 'inventory_2' },
    { label: 'Servicios', icon: 'work' },
    { label: 'Arriendos', icon: 'home' },
    { label: 'Turismo', icon: 'tour' },
    { label: 'Negocios', icon: 'storefront' },
  ]

  return (
    <div className="sticky top-0 z-50">
      <header className="bg-primary text-white px-6 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 relative">
          {/* Logo */}
          <div className="flex items-center gap-2 absolute left-0">
            <div className="bg-accent p-1.5 rounded-lg text-primary">
              <span className="material-symbols-outlined block text-2xl font-bold">ads_click</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Solo a</span>
              <span className="text-xl font-black italic tracking-tight">un <span className="text-accent uppercase">CLICK</span></span>
            </div>
          </div>

          {/* Buscador centrado */}
          <div className="w-full max-w-lg relative group" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary">search</span>
            </div>
            <input
              className="w-full rounded-full bg-white text-slate-900 py-2 pl-10 pr-24 focus:ring-4 focus:ring-primary-light/40 border-none transition-all placeholder:text-slate-400 text-sm"
              placeholder="Buscar productos, servicios..."
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => query.length >= 3 && setShowResults(true)}
            />
            <button className="absolute right-1 top-1 bottom-1 bg-accent text-primary px-4 rounded-full font-bold text-sm hover:brightness-110 hover:scale-105 transition-all">
              Buscar
            </button>
            {showResults && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                {results.map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
                    onClick={() => handleSelect(item)}
                  >
                    <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-slate-800 block">{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.section}</span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.type === 'category' ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-primary'
                    }`}>{item.type === 'category' ? 'Categoría' : 'Subcategoría'}</span>
                  </button>
                ))}
              </div>
            )}
            {showResults && query.length >= 3 && results.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 px-4 py-3 text-center text-sm text-slate-400">
                No se encontraron resultados
              </div>
            )}
          </div>

          {/* Carrito y sesión - parte superior derecha */}
          <div className="absolute right-0 flex items-center gap-3">
            <button className="relative p-1.5 hover:bg-white/10 rounded-full">
              <span className="material-symbols-outlined text-white text-xl">shopping_cart</span>
              <span className="absolute -top-1 -right-1 bg-accent text-primary text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">3</span>
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded-full">
              <span className="material-symbols-outlined text-white text-xl">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* Nav bar */}
      <nav className="bg-[#4A2070] px-6 py-1.5 border-y-2 border-accent shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 relative">
          {showInicio && (
            <button
              onClick={onGoHome}
              className="flex items-center gap-1 text-xs font-bold bg-accent text-primary px-3 py-1 rounded-full hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-base">home</span>
              Inicio
            </button>
          )}
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => toggleNav(item.label.toLowerCase())}
              className={`flex items-center gap-1.5 text-xs font-bold capitalize tracking-wide transition-colors ${
                activeNav === item.label.toLowerCase() || (item.label === 'Negocios' && activeNav === 'locales')
                  ? 'text-accent'
                  : 'text-white/90 hover:text-accent'
              }`}
            >
              <span className="material-symbols-outlined text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Registrarse, Ingresar y Planes */}
          <div className="absolute right-0 flex items-center gap-4">
            {user ? (
              <>
                <span className="text-xs text-white/70">Hola, <span className="font-bold text-accent">{user.nombre}</span></span>
                <button onClick={onLogout} className="flex items-center gap-1 text-xs font-bold text-white/90 hover:text-accent transition-colors">
                  <span className="material-symbols-outlined text-base">logout</span>
                  Salir
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setShowRegister(true)} className="flex items-center gap-1 text-xs font-bold text-white/90 hover:text-accent transition-colors">
                  <span className="material-symbols-outlined text-base">person_add</span>
                  Registrarse
                </button>
                <button onClick={() => setShowLogin(true)} className="flex items-center gap-1 text-xs font-bold text-white/90 hover:text-accent transition-colors">
                  <span className="material-symbols-outlined text-base">login</span>
                  Ingresar
                </button>
              </>
            )}
            <button onClick={() => setShowPlans(true)} className="flex items-center gap-1 text-xs font-bold bg-accent text-primary px-3 py-1 rounded-full hover:brightness-110 transition-all">
              <span className="material-symbols-outlined text-base">star</span>
              Planes
            </button>
          </div>
        </div>
      </nav>

      {showPlans && <PlansModal onClose={() => setShowPlans(false)} />}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true) }}
          onLoginSuccess={onLoginSuccess}
        />
      )}
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true) }}
          onRegisterSuccess={onLoginSuccess}
        />
      )}
    </div>
  )
}
