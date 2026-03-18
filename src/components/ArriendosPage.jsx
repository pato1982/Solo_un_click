import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API || ''

const categoryColors = {
  'Cabañas': 'bg-amber-600 text-white',
  'Departamentos': 'bg-blue-500 text-white',
  'Casas': 'bg-emerald-600 text-white',
  'Hospedajes': 'bg-purple-500 text-white',
  'Habitaciones': 'bg-pink-500 text-white',
  'Terrenos': 'bg-teal-600 text-white',
  'Locales': 'bg-orange-500 text-white',
  'Vehículos': 'bg-slate-600 text-white',
  'Equipos': 'bg-indigo-500 text-white',
}

function getBadgeColor(cat) {
  return categoryColors[cat] || 'bg-primary/80 text-white'
}

function ContactPopup({ icon, title, value, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[10001]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-xs w-full p-5" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 h-5 w-5 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
          <span className="material-symbols-outlined text-slate-500 text-xs">close</span>
        </button>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-sm font-bold text-slate-800 select-all">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ArriendoModal({ item, onClose }) {
  const [contactPopup, setContactPopup] = useState(null)

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col mx-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-2 right-2 z-10 h-6 w-6 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-slate-600 text-sm">close</span>
        </button>

        <div className="flex flex-col md:flex-row md:min-h-[220px]">
          {/* Imagen */}
          <div className="md:w-[50%] h-44 md:h-auto shrink-0 p-1 relative">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-tr-xl bg-slate-100" />
            {item.categoria && (
              <span className={`absolute top-2.5 left-2.5 ${getBadgeColor(item.categoria)} px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow`}>
                {item.categoria}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="md:w-[50%] p-3 flex flex-col">
            <div className="min-h-[36px] flex items-start justify-center shrink-0">
              <h3 className="text-sm font-black text-primary text-center line-clamp-2 leading-[18px]">{item.name}</h3>
            </div>

            {item.nombre_negocio && (
              <p className="text-[10px] text-slate-400 text-center mb-1">
                <span className="material-symbols-outlined text-[10px] align-middle mr-0.5">storefront</span>
                {item.nombre_negocio}
              </p>
            )}

            <div className="flex-1 flex items-center min-h-0 my-1">
              <div className="w-full max-h-full overflow-y-auto">
                <p className="text-[10px] text-slate-500 leading-relaxed text-center">{item.description}</p>
              </div>
            </div>

            {item.negocio_direccion && (
              <div className="flex items-center gap-1 justify-center mb-1">
                <span className="material-symbols-outlined text-slate-400 text-xs">location_on</span>
                <p className="text-[10px] text-slate-500">{item.negocio_direccion}</p>
              </div>
            )}

            {/* Precio */}
            <div className="pt-1.5 border-t border-slate-100 mt-1.5 flex items-center justify-between shrink-0">
              <p className="text-sm font-black text-primary">
                ${(item.price || 0).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
              </p>
              {item.originalPrice && (
                <p className="text-[10px] font-bold text-slate-400 line-through">
                  ${item.originalPrice.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                </p>
              )}
            </div>

            {/* Contacto */}
            <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                {item.negocio_facebook && (
                  <a href={item.negocio_facebook} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2] hover:text-white text-[#1877F2] flex items-center justify-center transition-all" title="Facebook">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {item.negocio_instagram && (
                  <a href={item.negocio_instagram.startsWith('http') ? item.negocio_instagram : `https://instagram.com/${item.negocio_instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-pink-500/10 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white text-pink-500 flex items-center justify-center transition-all" title="Instagram">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {item.negocio_whatsapp && (
                  <button onClick={() => setContactPopup({ icon: 'chat', title: 'WhatsApp', value: item.negocio_whatsapp })} className="h-7 w-7 rounded-lg bg-green-500/10 hover:bg-green-500 hover:text-white text-green-600 flex items-center justify-center transition-all" title="WhatsApp">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.347 0-4.522-.809-6.236-2.164l-.436-.35-3.233 1.084 1.084-3.233-.35-.436A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                  </button>
                )}
                {item.negocio_telefono && (
                  <button onClick={() => setContactPopup({ icon: 'call', title: 'Teléfono', value: item.negocio_telefono })} className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all" title="Teléfono">
                    <span className="material-symbols-outlined text-sm">call</span>
                  </button>
                )}
                {item.negocio_correo && (
                  <button onClick={() => setContactPopup({ icon: 'mail', title: 'Correo', value: item.negocio_correo })} className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all" title="Correo">
                    <span className="material-symbols-outlined text-sm">mail</span>
                  </button>
                )}
                {item.negocio_direccion && (
                  <button onClick={() => setContactPopup({ icon: 'location_on', title: 'Ubicación', value: item.negocio_direccion })} className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all" title="Ubicación">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {contactPopup && (
        <ContactPopup icon={contactPopup.icon} title={contactPopup.title} value={contactPopup.value} onClose={() => setContactPopup(null)} />
      )}
    </div>
  )
}

function ArriendoCard({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group border border-slate-100 cursor-pointer"
    >
      <div className="relative h-32 sm:h-32 md:h-40 bg-slate-100 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {item.categoria && (
          <span className={`absolute top-1 left-1 sm:top-2 sm:left-2 ${getBadgeColor(item.categoria)} px-1 sm:px-2 py-0.5 rounded-full text-[6px] sm:text-[8px] font-bold uppercase tracking-wider shadow backdrop-blur`}>
            {item.categoria}
          </span>
        )}
      </div>
      <div className="px-1.5 sm:px-4 py-1.5 sm:py-3 flex flex-col flex-1">
        <div className="min-h-[24px] sm:min-h-0 flex items-start">
          <h3 className="font-bold text-[10px] sm:text-xs text-slate-900 leading-tight line-clamp-2 sm:line-clamp-1 mb-0.5 sm:mb-1">{item.name}</h3>
        </div>
        {item.negocio_direccion && (
          <div className="flex items-start gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
            <span className="material-symbols-outlined text-slate-400 text-[10px] sm:text-xs mt-0.5 shrink-0">location_on</span>
            <p className="text-[9px] sm:text-[10px] text-slate-500 line-clamp-1">{item.negocio_direccion}</p>
          </div>
        )}
        {item.nombre_negocio && (
          <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
            <span className="material-symbols-outlined text-slate-400 text-[10px] sm:text-xs shrink-0">storefront</span>
            <p className="text-[9px] sm:text-[10px] text-slate-400 line-clamp-1">{item.nombre_negocio}</p>
          </div>
        )}
        <div className="mt-auto pt-1">
          <p className="text-[10px] sm:text-xs font-black text-primary">
            ${(item.price || 0).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
            {item.originalPrice && (
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 line-through ml-1">
                ${item.originalPrice.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

const DEMO_IMG = 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&q=80'
const DEMO_ARRIENDOS = [
  { id: 'd1', name: 'Cabaña Lago Villarrica', categoria: 'Cabañas', price: 65000, description: 'Hermosa cabaña con vista al lago, 2 dormitorios, cocina equipada.', negocio_direccion: 'Camino Villarrica-Pucón Km 5' },
  { id: 'd2', name: 'Depto Centro Villarrica', categoria: 'Departamentos', price: 40000, description: 'Departamento amoblado, 1 dormitorio, ubicación central.', negocio_direccion: 'Av. Pedro de Valdivia 456' },
  { id: 'd3', name: 'Casa Familiar Volcán', categoria: 'Casas', price: 85000, description: 'Casa amplia con jardín, vista al volcán, ideal para familias.', negocio_direccion: 'Los Castaños 234' },
  { id: 'd4', name: 'Hostal Mochilero', categoria: 'Hospedajes', price: 15000, description: 'Habitación compartida con desayuno incluido.', negocio_direccion: 'General Korner 123' },
  { id: 'd5', name: 'Cabaña Bosque Nativo', categoria: 'Cabañas', price: 55000, description: 'Cabaña rústica rodeada de naturaleza, ideal para desconectar.', negocio_direccion: 'Camino a Lican Ray Km 8' },
  { id: 'd6', name: 'Domo Glamping Lago', categoria: 'Hospedajes', price: 70000, description: 'Experiencia glamping con vista panorámica al lago.', negocio_direccion: 'Costanera Norte' },
]

export default function ArriendosPage({ sidebarOpen, onBack, activeFilter, onOpenStore }) {
  const [allItems, setAllItems] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/listings`)
      .then(r => r.json())
      .then(data => {
        const arriendos = (data.listings || [])
          .filter(l => l.tipo === 'arriendo')
          .map(l => ({
            id: l.id,
            user_id: l.user_id,
            name: l.nombre,
            description: l.descripcion || '',
            image: l.imagen ? `${API}${l.imagen}` : '',
            price: l.precio,
            originalPrice: l.precio_original,
            categoria: l.categoria || '',
            subcategoria: l.subcategoria || '',
            nombre_negocio: l.nombre_negocio || '',
            negocio_whatsapp: l.negocio_whatsapp || '',
            negocio_telefono: l.negocio_telefono || '',
            negocio_direccion: l.negocio_direccion || '',
            negocio_correo: l.negocio_correo || '',
            negocio_facebook: l.negocio_facebook || '',
            negocio_instagram: l.negocio_instagram || '',
            owner_plan_id: l.owner_plan_id,
          }))
        setAllItems(arriendos.length > 0 ? arriendos : DEMO_ARRIENDOS.map(d => ({ ...d, image: DEMO_IMG })))
        setLoading(false)
      })
      .catch(() => {
        setAllItems(DEMO_ARRIENDOS.map(d => ({ ...d, image: DEMO_IMG })))
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    setCurrentPage(0)
  }, [activeFilter])

  const filteredItems = activeFilter
    ? allItems.filter(item => {
        if (typeof activeFilter === 'object' && activeFilter.subcategories) {
          return activeFilter.subcategories.includes(item.subcategoria) || item.categoria === activeFilter.category
        }
        return item.subcategoria === activeFilter || item.categoria === activeFilter
      })
    : allItems

  const cols = sidebarOpen ? 5 : 6
  const ROWS_PER_PAGE = 10
  const itemsPerPage = ROWS_PER_PAGE * cols
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
  const pageItems = filteredItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0 })
  }

  const filterLabel = activeFilter && typeof activeFilter === 'object' ? activeFilter.category : activeFilter

  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-primary hover:text-accent transition-colors text-[10px] sm:text-xs font-bold"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver
        </button>
        <div className="w-1 h-4 sm:h-5 bg-accent rounded-full"></div>
        <h2 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">
          {filterLabel || 'Todos los Arriendos'}
        </h2>
        <span className="text-[9px] sm:text-[10px] text-slate-400">
          {filteredItems.length} {filteredItems.length === 1 ? 'arriendo' : 'arriendos'}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
        </div>
      ) : (
        <>
          <div className={`grid gap-2 sm:gap-3 md:gap-4 ${sidebarOpen ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6'} transition-all duration-300`}>
            {pageItems.map((item, idx) => (
              <ArriendoCard
                key={`${item.id}-${idx}`}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <p className="text-center text-slate-400 text-xs mt-8">
              No hay arriendos para mostrar.
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
        </>
      )}

      {selectedItem && (
        <ArriendoModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
