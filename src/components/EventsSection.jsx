const events = [
  {
    title: 'Feria Costumbrista Villarrica',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    date: '15 - 17 Mar 2026',
    location: 'Plaza de Armas, Villarrica',
    price: 'Entrada libre',
    badge: 'Gratis',
    badgeColor: 'bg-green-500 text-white',
  },
  {
    title: 'Festival de Música Lago',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    date: '22 Mar 2026',
    location: 'Costanera Villarrica',
    price: '$8.000',
    badge: 'Música',
    badgeColor: 'bg-primary-light text-white',
  },
  {
    title: 'Feria Gastronómica Sur',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    date: '28 - 30 Mar 2026',
    location: 'Parque Municipal',
    price: '$3.000',
    badge: 'Gastronomía',
    badgeColor: 'bg-accent text-primary font-black',
  },
  {
    title: 'Carrera Trail Volcán',
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80',
    date: '5 Abr 2026',
    location: 'Parque Nacional Villarrica',
    price: '$15.000',
    badge: 'Deporte',
    badgeColor: 'bg-red-500 text-white',
  },
  {
    title: 'Expo Emprendedores',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    date: '10 - 12 Abr 2026',
    location: 'Centro Cultural Villarrica',
    price: 'Entrada libre',
    badge: 'Gratis',
    badgeColor: 'bg-green-500 text-white',
  },
  {
    title: 'Noche de Fogatas y Folklore',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    date: '18 Abr 2026',
    location: 'Playa Villarrica',
    price: '$5.000',
    badge: 'Cultura',
    badgeColor: 'bg-primary text-white',
  },
  {
    title: 'Feria de Artesanía Mapuche',
    image: 'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=800&q=80',
    date: '25 - 27 Abr 2026',
    location: 'Mercado Municipal',
    price: 'Entrada libre',
    badge: 'Gratis',
    badgeColor: 'bg-green-500 text-white',
  },
  {
    title: 'Torneo de Pesca Deportiva',
    image: 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&q=80',
    date: '3 May 2026',
    location: 'Lago Villarrica',
    price: '$12.000',
    badge: 'Deporte',
    badgeColor: 'bg-red-500 text-white',
  },
]

export default function EventsSection({ onViewAll }) {
  return (
    <div className="border-2 border-accent rounded-2xl p-6 mx-6 bg-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 bg-accent rounded-full"></div>
        <h2 className="text-sm font-bold text-slate-700 tracking-wide">Próximos Eventos</h2>
        <div className="flex-1 h-px bg-slate-200"></div>
        <button onClick={onViewAll} className="text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wider">Ver todo</button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {events.map((event) => (
          <div
            key={event.title}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 group max-w-[200px] mx-auto w-full"
          >
            <div className="relative h-28 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span className={`absolute top-1.5 left-1.5 ${event.badgeColor} px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider shadow`}>
                {event.badge}
              </span>
            </div>
            <div className="p-2.5">
              <h3 className="font-bold text-[10px] text-slate-900 leading-tight line-clamp-1 mb-1">{event.title}</h3>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="material-symbols-outlined text-accent text-[10px]">calendar_month</span>
                <span className="text-[9px] font-bold text-slate-600">{event.date}</span>
              </div>
              <div className="flex items-center gap-1 mb-1.5">
                <span className="material-symbols-outlined text-slate-400 text-[10px]">location_on</span>
                <span className="text-[9px] text-slate-500 line-clamp-1">{event.location}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-black text-primary">{event.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
