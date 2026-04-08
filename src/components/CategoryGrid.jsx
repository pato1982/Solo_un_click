const CATEGORIES = [
  {
    id: 'productos',
    name: 'Productos',
    icon: 'shopping_bag',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80',
  },
  {
    id: 'arriendos',
    name: 'Arriendos',
    icon: 'home',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&q=80',
  },
  {
    id: 'servicios',
    name: 'Servicios',
    icon: 'handyman',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80',
  },
  {
    id: 'turismo',
    name: 'Turismo',
    icon: 'landscape',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80',
  },
  {
    id: 'negocios',
    name: 'Locales',
    icon: 'storefront',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80',
  },
]

export default function CategoryGrid({ onNavigate }) {
  return (
    <div className="relative z-10 -mt-8 sm:-mt-10 md:-mt-12 pb-2">
      <div className="flex justify-center gap-4 sm:gap-6 md:gap-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onNavigate(cat.id)}
            className="flex flex-col items-center gap-1 sm:gap-1.5 group cursor-pointer"
          >
            {/* Foto redonda */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 border-2 border-white">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Nombre debajo */}
            <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-700 group-hover:text-primary transition-colors leading-tight text-center">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
