import { useState } from 'react'

export const eventCategories = [
  { icon: 'music_note', label: 'Musica' },
  { icon: 'restaurant', label: 'Gastronomia' },
  { icon: 'sports_soccer', label: 'Deporte' },
  { icon: 'theater_comedy', label: 'Cultura' },
  { icon: 'palette', label: 'Artesania' },
  { icon: 'storefront', label: 'Ferias' },
  { icon: 'family_restroom', label: 'Familiar' },
  { icon: 'nightlife', label: 'Nocturno' },
  { icon: 'school', label: 'Educacion' },
  { icon: 'volunteer_activism', label: 'Beneficencia' },
  { icon: 'eco', label: 'Naturaleza' },
  { icon: 'church', label: 'Religioso' },
]

export const allEvents = [
  {
    title: 'Feria Costumbrista Villarrica',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    date: '15 - 17 Mar 2026',
    location: 'Plaza de Armas, Villarrica',
    price: 'Entrada libre',
    badge: 'Gratis',
    badgeColor: 'bg-green-500 text-white',
    type: 'Ferias',
  },
  {
    title: 'Festival de Musica Lago',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    date: '22 Mar 2026',
    location: 'Costanera Villarrica',
    price: '$8.000',
    badge: 'Musica',
    badgeColor: 'bg-primary-light text-white',
    type: 'Musica',
  },
  {
    title: 'Feria Gastronomica Sur',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    date: '28 - 30 Mar 2026',
    location: 'Parque Municipal',
    price: '$3.000',
    badge: 'Gastronomia',
    badgeColor: 'bg-accent text-primary font-black',
    type: 'Gastronomia',
  },
  {
    title: 'Carrera Trail Volcan',
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80',
    date: '5 Abr 2026',
    location: 'Parque Nacional Villarrica',
    price: '$15.000',
    badge: 'Deporte',
    badgeColor: 'bg-red-500 text-white',
    type: 'Deporte',
  },
  {
    title: 'Expo Emprendedores',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    date: '10 - 12 Abr 2026',
    location: 'Centro Cultural Villarrica',
    price: 'Entrada libre',
    badge: 'Gratis',
    badgeColor: 'bg-green-500 text-white',
    type: 'Ferias',
  },
  {
    title: 'Noche de Fogatas y Folklore',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    date: '18 Abr 2026',
    location: 'Playa Villarrica',
    price: '$5.000',
    badge: 'Cultura',
    badgeColor: 'bg-primary text-white',
    type: 'Cultura',
  },
  {
    title: 'Feria de Artesania Mapuche',
    image: 'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=800&q=80',
    date: '25 - 27 Abr 2026',
    location: 'Mercado Municipal',
    price: 'Entrada libre',
    badge: 'Gratis',
    badgeColor: 'bg-green-500 text-white',
    type: 'Artesania',
  },
  {
    title: 'Torneo de Pesca Deportiva',
    image: 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&q=80',
    date: '3 May 2026',
    location: 'Lago Villarrica',
    price: '$12.000',
    badge: 'Deporte',
    badgeColor: 'bg-red-500 text-white',
    type: 'Deporte',
  },
  {
    title: 'Concierto de Verano',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    date: '10 May 2026',
    location: 'Anfiteatro Municipal',
    price: '$10.000',
    badge: 'Musica',
    badgeColor: 'bg-primary-light text-white',
    type: 'Musica',
  },
  {
    title: 'Dia de la Familia',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80',
    date: '15 May 2026',
    location: 'Parque Municipal',
    price: 'Entrada libre',
    badge: 'Gratis',
    badgeColor: 'bg-green-500 text-white',
    type: 'Familiar',
  },
  {
    title: 'Festival Nocturno Villarrica',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    date: '22 May 2026',
    location: 'Costanera Villarrica',
    price: '$6.000',
    badge: 'Nocturno',
    badgeColor: 'bg-purple-600 text-white',
    type: 'Nocturno',
  },
  {
    title: 'Taller de Cocina Mapuche',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    date: '28 May 2026',
    location: 'Centro Cultural Villarrica',
    price: '$5.000',
    badge: 'Educacion',
    badgeColor: 'bg-blue-500 text-white',
    type: 'Educacion',
  },
  {
    title: 'Caminata Ecologica',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    date: '1 Jun 2026',
    location: 'Reserva Nacional',
    price: 'Entrada libre',
    badge: 'Gratis',
    badgeColor: 'bg-green-500 text-white',
    type: 'Naturaleza',
  },
  {
    title: 'Bingo Solidario',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
    date: '7 Jun 2026',
    location: 'Gimnasio Municipal',
    price: '$2.000',
    badge: 'Beneficencia',
    badgeColor: 'bg-pink-500 text-white',
    type: 'Beneficencia',
  },
  {
    title: 'Fiesta de San Pedro',
    image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80',
    date: '29 Jun 2026',
    location: 'Caleta de Pescadores',
    price: 'Entrada libre',
    badge: 'Religioso',
    badgeColor: 'bg-amber-600 text-white',
    type: 'Religioso',
  },
  {
    title: 'Festival Gastronomico del Lago',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    date: '5 Jul 2026',
    location: 'Costanera Villarrica',
    price: '$4.000',
    badge: 'Gastronomia',
    badgeColor: 'bg-accent text-primary font-black',
    type: 'Gastronomia',
  },
]

function EventCard({ event }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group border border-slate-100">
      <div className="relative h-40 bg-slate-100 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <span className={`absolute top-2 left-2 ${event.badgeColor} px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow`}>
          {event.badge}
        </span>
      </div>
      <div className="px-4 py-3 flex flex-col flex-1">
        <h3 className="font-bold text-xs text-slate-900 leading-tight line-clamp-1 mb-1.5">{event.title}</h3>
        <div className="flex items-center gap-1 mb-1">
          <span className="material-symbols-outlined text-accent text-xs shrink-0">calendar_month</span>
          <p className="text-[10px] font-bold text-slate-600">{event.date}</p>
        </div>
        <div className="flex items-start gap-1 mb-2">
          <span className="material-symbols-outlined text-slate-400 text-xs mt-0.5 shrink-0">location_on</span>
          <p className="text-[10px] text-slate-500 line-clamp-1">{event.location}</p>
        </div>
        <div className="mt-auto text-center">
          <span className="text-xs font-black text-primary">{event.price}</span>
        </div>
      </div>
    </div>
  )
}

export default function EventsPage({ sidebarOpen, onBack, activeFilter }) {
  const [currentPage, setCurrentPage] = useState(0)

  const filteredEvents = activeFilter
    ? allEvents.filter((e) => e.type === activeFilter)
    : allEvents

  const cols = sidebarOpen ? 5 : 6
  const ROWS_PER_PAGE = 10
  const itemsPerPage = ROWS_PER_PAGE * cols
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage))
  const pageItems = filteredEvents.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0 })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-primary hover:text-accent transition-colors text-xs font-bold"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver
        </button>
        <div className="w-1 h-5 bg-accent rounded-full"></div>
        <h2 className="text-sm font-bold text-slate-700 tracking-wide">
          {activeFilter ? activeFilter : 'Todos los Eventos'}
        </h2>
        <span className="text-[10px] text-slate-400">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
        </span>
      </div>

      <div className={`grid gap-4 ${sidebarOpen ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'} transition-all duration-300`}>
        {pageItems.map((event, idx) => (
          <EventCard key={`${event.title}-${idx}`} event={event} />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <p className="text-center text-slate-400 text-xs mt-8">
          No hay eventos para mostrar.
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                i === currentPage
                  ? 'bg-primary text-white shadow'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  )
}
