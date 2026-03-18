import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API || ''

// Fan de 4 tarjetas
const fanAngles4 = [
  { rotate: -18, translateX: -60 },
  { rotate: -6, translateX: -20 },
  { rotate: 6, translateX: 20 },
  { rotate: 18, translateX: 60 },
]
const fanAngles4Mobile = [
  { rotate: -14, translateX: -36 },
  { rotate: -5, translateX: -12 },
  { rotate: 5, translateX: 12 },
  { rotate: 14, translateX: 36 },
]

function CardFan4({ images }) {
  if (!images || images.length === 0) {
    return (
      <div className="relative shrink-0 flex items-center justify-center w-[120px] h-[100px] sm:w-[200px] sm:h-[150px] md:w-[260px] md:h-[180px]">
        <span className="material-symbols-outlined text-5xl text-slate-200">image</span>
      </div>
    )
  }
  const imgs = images.slice(0, 4)

  const renderFan = (angles, containerClass, cardClass) => (
    <div className={`relative shrink-0 ${containerClass}`}>
      {imgs.map((img, i) => (
        <div
          key={i}
          className={`absolute ${cardClass} rounded-lg sm:rounded-xl overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-[3px] border-white transition-transform duration-300 hover:scale-110 hover:z-20`}
          style={{
            transform: `translateX(calc(-50% + ${angles[i].translateX}px)) rotate(${angles[i].rotate}deg)`,
            transformOrigin: 'bottom center',
            left: '50%',
            top: '0px',
            zIndex: i >= 1 ? 12 : 10,
          }}
        >
          <img src={img} alt="Servicio" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  )

  return (
    <>
      <div className="sm:hidden">{renderFan(fanAngles4Mobile, 'w-[130px] h-[100px]', 'w-12 h-[70px]')}</div>
      <div className="hidden sm:block md:hidden">{renderFan(fanAngles4, 'w-[210px] h-[150px]', 'w-[70px] h-[105px]')}</div>
      <div className="hidden md:block">{renderFan(fanAngles4, 'w-[260px] h-[180px]', 'w-24 h-[140px]')}</div>
    </>
  )
}

function GalleryPopup({ empresa, onClose }) {
  const [current, setCurrent] = useState(0)
  const images = empresa.images || []

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-sm font-black text-primary">{empresa.name}</h3>
            {empresa.categorias && empresa.categorias.length > 0 && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                {empresa.categorias.join(' · ')}
              </p>
            )}
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-slate-500 text-sm">close</span>
          </button>
        </div>

        {/* Galería */}
        {images.length > 0 && (
          <div className="relative bg-slate-100 shrink-0">
            <img
              src={images[current]}
              alt={`Imagen ${current + 1}`}
              className="w-full h-48 sm:h-64 md:h-72 object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrent((current - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-slate-700">chevron_left</span>
                </button>
                <button
                  onClick={() => setCurrent((current + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-slate-700">chevron_right</span>
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-1.5 px-4 py-2 overflow-x-auto shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === current ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Descripción completa */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{empresa.description}</p>
        </div>

        {/* Contacto */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5">
            {empresa.facebook && (
              <a href={empresa.facebook} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2] hover:text-white text-[#1877F2] flex items-center justify-center transition-all" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
            {empresa.instagram && (
              <a href={empresa.instagram.startsWith('http') ? empresa.instagram : `https://instagram.com/${empresa.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-pink-500/10 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white text-pink-500 flex items-center justify-center transition-all" title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            )}
          </div>
          {empresa.direccion && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="material-symbols-outlined text-xs">location_on</span>
              {empresa.direccion}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            {empresa.whatsapp && (
              <a href={`https://wa.me/${empresa.whatsapp.replace(/[\s+]/g, '')}`} target="_blank" rel="noopener noreferrer" className="h-8 px-3 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center gap-1.5 transition-all text-xs font-bold">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.347 0-4.522-.809-6.236-2.164l-.436-.35-3.233 1.084 1.084-3.233-.35-.436A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                Contactar
              </a>
            )}
            {!empresa.whatsapp && empresa.telefono && (
              <a href={`tel:${empresa.telefono}`} className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 transition-all text-xs font-bold">
                <span className="material-symbols-outlined text-sm">call</span>
                Llamar
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Horario popup (reutilizable)
function HorarioPopup({ horarios, onClose }) {
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-xs w-full p-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 h-5 w-5 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
          <span className="material-symbols-outlined text-slate-500 text-xs">close</span>
        </button>
        <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">schedule</span>
          Horarios
        </h4>
        <div className="space-y-1">
          {horarios.map((h, i) => (
            <div key={i} className="flex justify-between text-[11px]">
              <span className={h.activo ? 'font-semibold text-slate-700' : 'text-slate-400'}>{h.dia}</span>
              <span className={h.activo ? 'text-slate-600' : 'text-slate-400 italic'}>{h.activo ? `${h.apertura} - ${h.cierre}` : 'Cerrado'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FloatingButton({ label, icon, onClick }) {
  const [bottom, setBottom] = useState(24)
  useEffect(() => {
    let rafId
    const handleScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const footer = document.querySelector('footer')
        if (!footer) return
        const footerTop = footer.getBoundingClientRect().top
        const windowHeight = window.innerHeight
        const visibleFooter = windowHeight - footerTop
        setBottom(visibleFooter > 0 ? visibleFooter + 16 : 24)
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => { window.removeEventListener('scroll', handleScroll); cancelAnimationFrame(rafId) }
  }, [])
  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-50" style={{ bottom: `${bottom}px` }}>
      <button
        onClick={onClick}
        className="bg-primary hover:bg-primary-light text-white px-5 py-2 rounded-full shadow-xl text-xs font-bold uppercase tracking-wide transition-all hover:scale-105 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-base">{icon}</span>
        {label}
      </button>
    </div>
  )
}

const DEMO_SERVICIOS = [
  { user_id: 'd1', name: 'Electricidad Villarrica', description: 'Servicios eléctricos profesionales para hogares y empresas. Instalaciones, reparaciones y mantenciones con más de 10 años de experiencia en el rubro. Trabajamos con materiales certificados y garantía en todos nuestros trabajos.', images: [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
    'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&q=80',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80',
  ], categorias: ['Construcción'], direccion: 'Av. Pedro de Valdivia 456', whatsapp: '56912345678', planId: 2, horarios: [{ dia: 'Lunes', activo: true, apertura: '08:00', cierre: '18:00' }, { dia: 'Sábado', activo: true, apertura: '09:00', cierre: '14:00' }, { dia: 'Domingo', activo: false }] },
  { user_id: 'd2', name: 'Gasfiter Express', description: 'Soluciones rápidas en gasfitería. Destapes, instalaciones sanitarias, calefones y termos. Atención de emergencia 24/7 en toda la comuna de Villarrica.', images: [
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80',
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80',
  ], categorias: ['Construcción'], direccion: 'General Korner 234', telefono: '56945123456', planId: 1, horarios: [{ dia: 'Lunes', activo: true, apertura: '08:00', cierre: '19:00' }] },
  { user_id: 'd3', name: 'Clases de Inglés Villarrica', description: 'Profesor certificado TOEFL. Clases particulares y grupales para todos los niveles. Preparación de exámenes internacionales. Metodología comunicativa y personalizada.', images: [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80',
  ], categorias: ['Educación'], direccion: 'Camilo Henríquez 789', planId: 2 },
  { user_id: 'd4', name: 'Peluquería Estilo', description: 'Cortes, tinturas, tratamientos capilares y más. Atención personalizada con productos de primera calidad. Más de 15 años embelleciendo a Villarrica.', images: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&q=80',
    'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&q=80',
    'https://images.unsplash.com/photo-1521590832167-7228fcb555e4?w=400&q=80',
  ], categorias: ['Belleza y Salud'], direccion: 'Anfión Muñoz 321', whatsapp: '56987654321', planId: 1 },
]

export default function ServiciosPage({ activeFilter, onClearFilter, onOpenStore }) {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmpresa, setSelectedEmpresa] = useState(null)
  const [horarioPopup, setHorarioPopup] = useState(null)
  const [direccionPopup, setDireccionPopup] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/servicios/public`)
      .then(r => r.json())
      .then(data => {
        if (data.servicios && data.servicios.length > 0) {
          const mapped = data.servicios.map(s => ({
            user_id: s.user_id,
            name: s.nombre_negocio,
            description: s.descripcion || '',
            images: s.imagenes.map(img => `${API}${img}`),
            categorias: s.categorias || [],
            direccion: s.direccion || '',
            whatsapp: s.whatsapp || '',
            telefono: s.telefono || '',
            correo: s.correo || '',
            facebook: s.facebook || '',
            instagram: s.instagram || '',
            horarios: s.horarios || [],
            planId: s.plan_id,
          }))
          setEmpresas(mapped)
        } else {
          setEmpresas(DEMO_SERVICIOS)
        }
        setLoading(false)
      })
      .catch(() => {
        setEmpresas(DEMO_SERVICIOS)
        setLoading(false)
      })
  }, [])

  const filtered = activeFilter
    ? empresas.filter(e => e.categorias.includes(activeFilter))
    : empresas

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header — igual que TourismPage */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <div className="w-1 h-5 sm:h-6 bg-accent rounded-full"></div>
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-700 tracking-wide">
          {activeFilter ? `Servicios — ${activeFilter}` : 'Servicios en Villarrica'}
        </h2>
        {activeFilter && (
          <span className="text-[10px] text-slate-400">{filtered.length} {filtered.length === 1 ? 'empresa' : 'empresas'}</span>
        )}
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-slate-400 text-xs mt-8">No hay empresas con esta actividad.</p>
      )}

      {/* Grid 1-2 cols como TourismPage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
        {filtered.map((empresa) => (
          <div
            key={empresa.user_id}
            className="flex flex-row bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-slate-100 p-3 sm:p-4 md:p-5 gap-3 sm:gap-4 items-stretch min-h-[195px] sm:min-h-0"
          >
            {/* Info izquierda */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {empresa.direccion && (
                  <span
                    className="material-symbols-outlined text-slate-400 text-sm sm:text-base cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setDireccionPopup(empresa.direccion)}
                  >location_on</span>
                )}
                {empresa.horarios && empresa.horarios.length > 0 && (
                  <span
                    className="material-symbols-outlined text-slate-400 text-sm sm:text-base cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setHorarioPopup(empresa.horarios)}
                  >schedule</span>
                )}
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-black text-primary mb-1">{empresa.name}</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed mb-2 sm:mb-3 line-clamp-5 sm:line-clamp-3">
                {empresa.description || 'Sin descripción'}
              </p>
              <div className="mt-auto flex items-center gap-2 sm:gap-3">
                {empresa.planId >= 2 && onOpenStore && (
                  <button
                    onClick={() => onOpenStore({ id: `user-${empresa.user_id}`, userId: empresa.user_id, name: empresa.name, phone: empresa.whatsapp || empresa.telefono || '' })}
                    className="bg-primary hover:bg-primary-light text-white px-5 sm:px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all hover:scale-105 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Ver más
                  </button>
                )}
                {empresa.images.length > 0 && (
                  <button
                    onClick={() => setSelectedEmpresa(empresa)}
                    className="border border-primary/20 text-primary px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide hover:bg-primary/5 transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-sm">photo_library</span>
                    Ver fotos
                  </button>
                )}
                {(empresa.telefono || empresa.whatsapp) && (
                  <a
                    href={empresa.whatsapp
                      ? `https://wa.me/${empresa.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, me interesa su servicio: ${empresa.name}`)}`
                      : `tel:${empresa.telefono}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-primary/20 text-primary px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide hover:bg-primary/5 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">{empresa.whatsapp ? 'chat' : 'call'}</span>
                    Contactar
                  </a>
                )}
              </div>
            </div>

            {/* CardFan derecha + categorías */}
            <div className="shrink-0 flex flex-col items-center">
              <CardFan4 images={empresa.images} />
              <div className="min-h-[28px] sm:min-h-0 flex flex-wrap justify-center items-start content-start gap-x-1 gap-y-0.5 -mt-1 sm:-mt-2 max-w-[120px] sm:max-w-[200px] md:max-w-[250px]">
                {empresa.categorias.length > 0 && empresa.categorias.map((cat, i) => (
                  <span key={cat} className="flex items-center gap-0.5 sm:gap-1">
                    {i > 0 && <span className="text-[5px] sm:text-[6px] text-slate-300">●</span>}
                    <span className="text-[10px] sm:text-[9px] text-slate-400 font-medium">{cat}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Popup galería */}
      {selectedEmpresa && (
        <GalleryPopup empresa={selectedEmpresa} onClose={() => setSelectedEmpresa(null)} />
      )}

      {/* Popup horarios */}
      {horarioPopup && (
        <HorarioPopup horarios={horarioPopup} onClose={() => setHorarioPopup(null)} />
      )}

      {/* Popup dirección */}
      {direccionPopup && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4" onClick={() => setDireccionPopup(null)}>
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative bg-white rounded-xl shadow-2xl max-w-xs w-full p-5" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setDireccionPopup(null)} className="absolute top-2 right-2 h-5 w-5 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
              <span className="material-symbols-outlined text-slate-500 text-xs">close</span>
            </button>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">location_on</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ubicación</p>
              <p className="text-sm font-bold text-slate-800 text-center select-all">{direccionPopup}</p>
            </div>
          </div>
        </div>
      )}

      {activeFilter && onClearFilter && (
        <FloatingButton label="Quitar filtro" icon="close" onClick={onClearFilter} />
      )}
    </div>
  )
}
