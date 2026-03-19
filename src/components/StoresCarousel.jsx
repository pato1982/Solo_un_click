import { useState, useRef, useEffect } from 'react'

const API = import.meta.env.VITE_API || ''

function StoreModal({ store, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-xs w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-2 right-2 z-10 h-6 w-6 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-slate-600 text-sm">close</span>
        </button>
        <div className="h-48 overflow-hidden">
          <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4 text-center">
          <h3 className="text-sm font-black text-primary mb-2">{store.name}</h3>
          <div className="flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-slate-400 text-sm">location_on</span>
            <p className="text-xs text-slate-500">{store.address}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function StoresCarousel({ onViewAll }) {
  const [stores, setStores] = useState([])
  const [selected, setSelected] = useState(null)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef(null)
  const animRef = useRef(null)
  const posRef = useRef(0)

  useEffect(() => {
    fetch(`${API}/api/locales`)
      .then(r => r.json())
      .then(data => {
        const mapped = (data.locales || []).map(l => ({
          id: l.id,
          name: l.nombre,
          image: l.imagen ? `${API}${l.imagen}` : '',
          address: l.direccion || '',
        }))
        setStores(mapped)
      })
      .catch(() => setStores([]))
  }, [])

  // Duplicate stores for seamless loop
  const doubledStores = [...stores, ...stores]

  useEffect(() => {
    const track = trackRef.current
    if (!track || stores.length === 0) return

    const speed = 0.4 // pixels per frame

    const animate = () => {
      if (!paused) {
        posRef.current += speed
        // Reset when we've scrolled through one full set
        const halfWidth = track.scrollWidth / 2
        if (posRef.current >= halfWidth) {
          posRef.current -= halfWidth
        }
        track.style.transform = `translateX(-${posRef.current}px)`
      }
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [paused, stores])

  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-1 h-4 sm:h-5 bg-accent rounded-full"></div>
        <h2 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">Locales Inscritos</h2>
        <div className="flex-1 h-px bg-slate-200"></div>
        <button onClick={onViewAll} className="text-[9px] sm:text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wider">Ver todo</button>
      </div>

      {stores.length === 0 ? (
        <p className="text-center text-slate-400 text-xs py-6">No hay locales inscritos aún.</p>
      ) : <div
        className="overflow-hidden py-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex gap-3"
          style={{ willChange: 'transform' }}
        >
          {doubledStores.map((store, i) => (
            <button
              key={`${store.id}-${i}`}
              onClick={() => setSelected(store)}
              className="shrink-0 flex flex-col items-center gap-1 sm:gap-2 group/item cursor-pointer w-[calc(33.33%-8px)] sm:w-[calc(25%-9px)] md:w-[calc(16.666%-10px)]"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-3 border-accent shadow-md group-hover/item:scale-110 group-hover/item:border-primary transition-all duration-300">
                <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs sm:text-[9px] md:text-[10px] font-bold text-slate-700 text-center leading-tight line-clamp-2 group-hover/item:text-primary transition-colors">{store.name}</p>
            </button>
          ))}
        </div>
      </div>}

      {selected && <StoreModal store={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
