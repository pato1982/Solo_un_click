import { useState, useEffect, useRef, useCallback } from 'react'

const API = import.meta.env.VITE_API || ''

function TourCard({ tour, onOpenTour }) {
  const imageSrc = (() => {
    const idx = tour.imagen_principal || 0
    if (tour.imagenes && tour.imagenes.length > 0) {
      const img = tour.imagenes[idx] || tour.imagenes[0]
      return img.startsWith('http') ? img : `${API}${img}`
    }
    return ''
  })()

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group border border-slate-100">
      <div className="relative h-44 sm:h-40 md:h-44 bg-slate-50 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={tour.nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <span className="material-symbols-outlined text-4xl text-slate-300">landscape</span>
          </div>
        )}
        {tour.categoria && (
          <span className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-primary text-white px-1 sm:px-2 py-0.5 rounded-full text-[6px] sm:text-[8px] font-black uppercase tracking-wider shadow">
            {tour.categoria}
          </span>
        )}
        <button
          onClick={() => onOpenTour && onOpenTour(tour.user_id)}
          className="absolute top-1 right-1 sm:top-2 sm:right-2 h-6 w-6 sm:h-7 sm:w-7 bg-white/90 backdrop-blur-sm border border-slate-300 rounded-full flex items-center justify-center shadow hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-primary text-xs sm:text-sm group-hover:text-white">storefront</span>
        </button>
      </div>
      <div className="px-1.5 sm:px-3 md:px-4 py-1.5 sm:py-2 flex flex-col flex-1 items-center text-center">
        {/* Nombre */}
        <div className="min-h-[24px] sm:min-h-0 flex items-start">
          <h3 className="font-bold text-xs sm:text-xs text-slate-900 leading-tight line-clamp-2 sm:line-clamp-1 mb-0 sm:mb-0.5">{tour.nombre}</h3>
        </div>
        {/* Ubicación */}
        {tour.ubicacion && (
          <div className="flex items-center gap-0.5">
            <span className="material-symbols-outlined text-slate-400 text-[10px]">location_on</span>
            <span className="text-[10px] sm:text-[10px] text-slate-500 line-clamp-1">{tour.ubicacion}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TurismoSection({ onViewAll, onOpenTour }) {
  const [tours, setTours] = useState([])
  const mobileScrollRef = useRef(null)
  const desktopScrollRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/api/v1/tours/public`)
      .then(r => r.json())
      .then(data => setTours(data.tours || []))
      .catch(() => setTours([]))
  }, [])

  const getScrollEl = () => {
    if (window.innerWidth < 640 && mobileScrollRef.current) return mobileScrollRef.current
    return desktopScrollRef.current
  }

  const scrollOne = useCallback((direction) => {
    const el = getScrollEl()
    if (!el) return
    const cardW = el.querySelector(':first-child')?.offsetWidth || 200
    const amount = cardW + 8
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }, [])

  const scroll = (direction) => {
    scrollOne(direction)
    resetAutoScroll()
  }

  const resetAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const el = getScrollEl()
      if (!el) return
      const { scrollLeft, scrollWidth, clientWidth } = el
      if (scrollLeft + clientWidth >= scrollWidth - 5) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollOne('right')
      }
    }, 4000)
  }, [scrollOne])

  useEffect(() => {
    if (tours.length > 0) {
      resetAutoScroll()
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [resetAutoScroll, tours.length])

  const cardWidth = `w-[calc(50%-4px)] sm:w-[calc(33.33%-12px)] md:w-[calc(20%-14px)]`

  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
        <div className="w-1 h-4 sm:h-5 bg-accent rounded-full"></div>
        <h2 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">Turismo</h2>
        <div className="flex-1 h-px bg-slate-200"></div>
        <button onClick={onViewAll} className="text-[9px] sm:text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wider">Ver todo</button>
      </div>

      {tours.length === 0 ? (
        <div className="flex items-center justify-center py-6 sm:py-8 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-xs text-gray-400">No hay tours disponibles aún</p>
        </div>
      ) : (
      <>
        {/* MOBILE: carrusel 2 por fila */}
        <div className="sm:hidden relative group/carousel">
          <div
            ref={mobileScrollRef}
            className="flex gap-2 overflow-x-hidden scroll-smooth py-1 px-1"
          >
            {tours.map((tour) => (
              <div key={tour.id} className="shrink-0 w-[calc(50%-4px)] transition-all duration-300">
                <TourCard tour={tour} onOpenTour={onOpenTour} />
              </div>
            ))}
          </div>
        </div>

        {/* TABLET/DESKTOP: carrusel con flechas */}
        <div className="hidden sm:block relative group/carousel">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 md:h-10 md:w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <span className="material-symbols-outlined text-base md:text-lg">chevron_left</span>
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 md:h-10 md:w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <span className="material-symbols-outlined text-base md:text-lg">chevron_right</span>
          </button>

          <div ref={desktopScrollRef} className="flex gap-3 md:gap-4 overflow-x-hidden scroll-smooth py-1 px-1">
            {tours.map((tour) => (
              <div key={tour.id} className={`shrink-0 ${cardWidth} transition-all duration-300`}>
                <TourCard tour={tour} onOpenTour={onOpenTour} />
              </div>
            ))}
          </div>
        </div>
      </>
      )}
    </div>
  )
}
