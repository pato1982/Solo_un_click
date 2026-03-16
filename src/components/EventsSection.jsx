import { useState, useEffect } from 'react'

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
  if (!precio) return true
  const lower = precio.toLowerCase().trim()
  return lower === 'entrada libre' || lower === 'gratis' || lower === '' || lower === '$0' || lower === '0'
}

export default function EventsSection({ onViewAll }) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetch(`${API}/api/eventos`)
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
      .catch(() => {})
  }, [])

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
      ) : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 group max-w-[200px] mx-auto w-full"
          >
            <div className="relative h-20 sm:h-24 md:h-28 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span className={`absolute top-1 left-1 sm:top-1.5 sm:left-1.5 ${event.badgeColor} px-1 sm:px-1.5 py-0.5 rounded-full text-[6px] sm:text-[7px] font-black uppercase tracking-wider shadow`}>
                {event.badge}
              </span>
            </div>
            <div className="p-1.5 sm:p-2.5">
              <h3 className="font-bold text-[9px] sm:text-[10px] text-slate-900 leading-tight line-clamp-1 mb-0.5 sm:mb-1">{event.title}</h3>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="material-symbols-outlined text-accent text-[9px] sm:text-[10px]">calendar_month</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-600">{event.date}</span>
              </div>
              <div className="flex items-center gap-1 mb-1 sm:mb-1.5">
                <span className="material-symbols-outlined text-slate-400 text-[9px] sm:text-[10px]">location_on</span>
                <span className="text-[8px] sm:text-[9px] text-slate-500 line-clamp-1">{event.location}</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] sm:text-[10px] font-black text-primary">{event.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  )
}
