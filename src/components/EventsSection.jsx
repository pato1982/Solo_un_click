import { useState, useEffect, useRef, useCallback } from 'react'

const API = import.meta.env.VITE_API || ''

const badgeColors = {
  'Música': 'bg-primary-light text-white',
  'Musica': 'bg-primary-light text-white',
  'Gastronomía': 'bg-accent text-primary font-black',
  'Gastronomia': 'bg-accent text-primary font-black',
  'Deporte': 'bg-red-500 text-white',
  'Cultura': 'bg-primary text-white',
  'Artesanía': 'bg-amber-500 text-white',
  'Artesania': 'bg-amber-500 text-white',
  'Ferias': 'bg-teal-500 text-white',
  'Familiar': 'bg-blue-400 text-white',
  'Nocturno': 'bg-purple-600 text-white',
  'Educación': 'bg-blue-500 text-white',
  'Educacion': 'bg-blue-500 text-white',
  'Beneficencia': 'bg-pink-500 text-white',
  'Naturaleza': 'bg-green-600 text-white',
  'Religioso': 'bg-amber-600 text-white',
}

function getBadgeColor(categoria) {
  return badgeColors[categoria] || 'bg-slate-500 text-white'
}

function isGratis(precio) {
  if (!precio || precio === 0) return true
  const lower = String(precio).toLowerCase().trim()
  return lower === 'entrada libre' || lower === 'gratis' || lower === '' || lower === '$0' || lower === '0'
}


export default function EventsSection({ onViewAll }) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetch(`${API}/api/v1/eventos`)
      .then(r => r.json())
      .then(data => {
        const mapped = (data.eventos || []).slice(0, 8).map(e => ({
          id: e.id,
          title: e.titulo,
          image: e.imagen ? `${API}${e.imagen}` : '',
          date: e.fecha || '',
          location: e.ubicacion || '',
          price: e.precio || 'Entrada libre',
          badge: isGratis(e.precio) ? 'Gratis' : (e.categoria_nombre || ''),
          badgeColor: isGratis(e.precio) ? 'bg-green-500 text-white' : getBadgeColor(e.categoria_nombre),
        }))
        setEvents(mapped)
      })
      .catch(() => setEvents([]))
  }, [])

  // Mobile carousel: 2 rows, scroll horizontally
  const scrollRef = useRef(null)
  const intervalRef = useRef(null)

  // Agrupar eventos en pares (columnas de 2 filas)
  const eventPairs = []
  for (let i = 0; i < events.length; i += 2) {
    eventPairs.push(events.slice(i, i + 2))
  }

  const scrollOneMobile = useCallback(() => {
    if (!scrollRef.current) return
    const col = scrollRef.current.querySelector(':first-child')
    if (!col) return
    const amount = col.offsetWidth + 6
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    if (scrollLeft + clientWidth >= scrollWidth - 5) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(scrollOneMobile, 4000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [scrollOneMobile, events.length])

  const renderCard = (event) => (
    <div
      key={event.id}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 group w-full"
    >
      <div className="relative h-32 sm:h-28 md:h-28 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <span className={`absolute top-1 left-1 sm:top-1.5 sm:left-1.5 ${event.badgeColor} px-1 sm:px-1.5 py-0.5 rounded-full text-[6px] sm:text-[7px] font-black uppercase tracking-wider shadow`}>
          {event.badge}
        </span>
      </div>
      <div className="px-1.5 sm:p-2.5 py-1.5">
        <div className="min-h-[24px] sm:min-h-0 flex items-start">
          <h3 className="font-bold text-xs sm:text-[10px] text-slate-900 leading-tight line-clamp-2 sm:line-clamp-1 mb-0.5 sm:mb-1">{event.title}</h3>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5">
          <span className="material-symbols-outlined text-accent text-[10px] sm:text-[10px]">calendar_month</span>
          <span className="text-[10px] sm:text-[9px] font-bold text-slate-600">{event.date}</span>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1.5">
          <span className="material-symbols-outlined text-slate-400 text-[10px] sm:text-[10px]">location_on</span>
          <span className="text-[10px] sm:text-[9px] text-slate-500 line-clamp-1">{event.location}</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] sm:text-[10px] font-black text-primary">{event.price}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="border-2 border-accent rounded-2xl p-3 sm:p-4 md:p-6 mx-0 sm:mx-2 md:mx-6 bg-white">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-1 h-4 sm:h-5 bg-accent rounded-full"></div>
        <h2 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">Próximos Eventos</h2>
        <div className="flex-1 h-px bg-slate-200"></div>
        <button onClick={onViewAll} className="text-[9px] sm:text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wider">Ver todo</button>
      </div>
      {events.length === 0 ? (
        <p className="text-center text-slate-400 text-xs py-4">No hay eventos próximos aún.</p>
      ) : (
      <>
        {/* MOBILE: carrusel 2 filas */}
        <div className="sm:hidden overflow-x-hidden" ref={scrollRef}>
          <div className="flex gap-1.5" style={{ scrollBehavior: 'smooth' }}>
            {eventPairs.map((pair, i) => (
              <div key={i} className="shrink-0 w-[calc(50%-3px)] flex flex-col gap-1.5">
                {pair.map(event => renderCard(event))}
              </div>
            ))}
          </div>
        </div>

        {/* TABLET/DESKTOP: grid original */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 gap-3">
          {events.map(event => renderCard(event))}
        </div>
      </>
      )}
    </div>
  )
}
