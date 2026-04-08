import { useState, useEffect, useRef, useCallback } from 'react'

const API = import.meta.env.VITE_API || ''

const PLACEHOLDER_TOURS = [
  { id: 'ph-t1', nombre: 'Volcán Villarrica', categoria: 'Aventura', ubicacion: 'Pucón', detalle: 'Ascenso al cráter del volcán activo más visitado de Chile. Incluye equipamiento, guía certificado y transporte.', precio: 85000, empresa_nombre: 'Ejemplo', imagenes: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'], _isPlaceholder: true },
  { id: 'ph-t2', nombre: 'Kayak Río Trancura', categoria: 'Agua', ubicacion: 'Villarrica', detalle: 'Descenso en kayak por los rápidos del río Trancura. Apto para principiantes y avanzados.', precio: 35000, empresa_nombre: 'Ejemplo', imagenes: ['https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=400&q=80','https://images.unsplash.com/photo-1530866707318-0761c37bc3be?w=400&q=80','https://images.unsplash.com/photo-1526188717906-ab4a2f949f57?w=400&q=80'], _isPlaceholder: true },
  { id: 'ph-t3', nombre: 'Termas Geométricas', categoria: 'Relax', ubicacion: 'Coñaripe', detalle: 'Visita guiada a las famosas termas en medio del bosque nativo. Transporte incluido.', precio: 45000, empresa_nombre: 'Ejemplo', imagenes: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80','https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80','https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=80'], _isPlaceholder: true },
  { id: 'ph-t4', nombre: 'Trekking Huerquehue', categoria: 'Aventura', ubicacion: 'Pucón', detalle: 'Caminata por senderos del Parque Nacional Huerquehue. Lagunas, araucarias y vistas panorámicas.', precio: 30000, empresa_nombre: 'Ejemplo', imagenes: ['https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80','https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80','https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&q=80'], _isPlaceholder: true },
  { id: 'ph-t5', nombre: 'Canopy Bosque Nativo', categoria: 'Aventura', ubicacion: 'Villarrica', detalle: 'Tirolesas entre las copas de los árboles del bosque valdiviano. Adrenalina y naturaleza.', precio: 25000, empresa_nombre: 'Ejemplo', imagenes: ['https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&q=80','https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=400&q=80','https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80'], _isPlaceholder: true },
  { id: 'ph-t6', nombre: 'Lago Caburgua', categoria: 'Naturaleza', ubicacion: 'Caburgua', detalle: 'Excursión al cristalino Lago Caburgua con playa de arena volcánica y aguas turquesas.', precio: 20000, empresa_nombre: 'Ejemplo', imagenes: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80','https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=400&q=80','https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80'], _isPlaceholder: true },
  { id: 'ph-t7', nombre: 'Rafting Clase IV', categoria: 'Agua', ubicacion: 'Pucón', detalle: 'Emocionante descenso por rápidos clase III y IV. Guías profesionales y equipo completo.', precio: 40000, empresa_nombre: 'Ejemplo', imagenes: ['https://images.unsplash.com/photo-1530866707318-0761c37bc3be?w=400&q=80','https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=400&q=80','https://images.unsplash.com/photo-1526188717906-ab4a2f949f57?w=400&q=80'], _isPlaceholder: true },
  { id: 'ph-t8', nombre: 'Ojos del Caburgua', categoria: 'Naturaleza', ubicacion: 'Caburgua', detalle: 'Cascadas cristalinas rodeadas de bosque nativo. Una joya natural imperdible del sur.', precio: 15000, empresa_nombre: 'Ejemplo', imagenes: ['https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=400&q=80','https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80','https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=80'], _isPlaceholder: true },
  { id: 'ph-t9', nombre: 'Pesca con Mosca', categoria: 'Pesca', ubicacion: 'Villarrica', detalle: 'Jornada de pesca deportiva en ríos y lagos de la zona. Equipo y guía incluidos.', precio: 55000, empresa_nombre: 'Ejemplo', imagenes: ['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80'], _isPlaceholder: true },
  { id: 'ph-t10', nombre: 'Cabalgata Andina', categoria: 'Aventura', ubicacion: 'Pucón', detalle: 'Recorrido a caballo por senderos cordilleranos con vistas al volcán y lagos.', precio: 38000, empresa_nombre: 'Ejemplo', imagenes: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=80','https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80','https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80'], _isPlaceholder: true },
]

// Mosaic layout: 8 columns × 2 rows
const LAYOUT = [
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 1, rowSpan: 1 },
]

function parseJSON(val) {
  if (Array.isArray(val)) return val
  if (!val) return []
  try { return JSON.parse(val) } catch { return [] }
}

function getTourImage(tour) {
  const imgs = parseJSON(tour.imagenes)
  const idx = tour.imagen_principal || 0
  if (imgs.length > 0) {
    const img = imgs[idx] || imgs[0]
    return img.startsWith('http') ? img : `${API}${img}`
  }
  return ''
}

// Shuffle ensuring all companies are represented first
function shuffleWithCompanyBalance(tours) {
  if (tours.length === 0) return []

  // Group by user_id (company)
  const byCompany = {}
  tours.forEach(t => {
    const key = t.user_id || t.id
    if (!byCompany[key]) byCompany[key] = []
    byCompany[key].push(t)
  })

  // Shuffle each company's tours
  Object.values(byCompany).forEach(arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  })

  // Round-robin: take one from each company, then repeat
  const result = []
  const companyKeys = Object.keys(byCompany)
  // Shuffle company order
  for (let i = companyKeys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[companyKeys[i], companyKeys[j]] = [companyKeys[j], companyKeys[i]]
  }

  let added = true
  while (added) {
    added = false
    for (const key of companyKeys) {
      if (byCompany[key].length > 0) {
        result.push(byCompany[key].shift())
        added = true
      }
    }
  }

  return result
}

function TourModal({ tour, onClose, onOpenTour }) {
  const [currentImg, setCurrentImg] = useState(0)
  const imgs = parseJSON(tour.imagenes).map(img => img.startsWith('http') ? img : `${API}${img}`).filter(Boolean)
  const crops = parseJSON(tour.imagenes_crop) || []

  const prev = () => setCurrentImg(i => i === 0 ? imgs.length - 1 : i - 1)
  const next = () => setCurrentImg(i => i === imgs.length - 1 ? 0 : i + 1)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Imagen con flechas */}
        <div className="relative w-full" style={{ aspectRatio: '4 / 3' }}>
          {imgs.length > 0 ? (
            <img
              src={imgs[currentImg]}
              alt={`${tour.nombre} ${currentImg + 1}`}
              className="w-full h-full object-cover"
              style={crops[currentImg] && (crops[currentImg].zoom > 1 || crops[currentImg].x || crops[currentImg].y) ? {
                transform: `scale(${crops[currentImg].zoom}) translate(${crops[currentImg].x / crops[currentImg].zoom}px, ${crops[currentImg].y / crops[currentImg].zoom}px)`,
                transformOrigin: 'center center',
              } : undefined}
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-slate-400">landscape</span>
            </div>
          )}

          {/* Botón cerrar */}
          <button onClick={onClose} className="absolute top-2 right-2 h-7 w-7 bg-black/40 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
            <span className="material-symbols-outlined text-white text-sm">close</span>
          </button>

          {/* Flechas */}
          {imgs.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-primary hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-primary hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {imgs.map((_, i) => (
                  <button key={i} onClick={() => setCurrentImg(i)} className={`h-1.5 rounded-full transition-all ${i === currentImg ? 'w-5 bg-accent' : 'w-1.5 bg-white/50'}`} />
                ))}
              </div>
            </>
          )}

          {/* Contador */}
          {imgs.length > 1 && (
            <span className="absolute top-2 left-2 bg-black/40 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {currentImg + 1}/{imgs.length}
            </span>
          )}
        </div>

        {/* Info debajo */}
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800">{tour.nombre}</h3>
            {tour.user_id && !tour._isPlaceholder && (
              <button
                onClick={() => { onClose(); onOpenTour && onOpenTour(tour.user_id) }}
                className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                title="Ver página de la empresa"
              >
                <span className="material-symbols-outlined text-primary text-sm">storefront</span>
                <span className="text-[10px] font-bold text-primary">Ver tienda</span>
              </button>
            )}
          </div>
          {tour.empresa_nombre && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-sm">store</span>
              <span className="text-[11px] font-bold text-primary">{tour.empresa_nombre}</span>
            </div>
          )}
          {tour.ubicacion && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-accent text-sm">location_on</span>
              <span className="text-[11px] text-slate-500">{tour.ubicacion}</span>
            </div>
          )}
          {tour.detalle && (
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{tour.detalle}</p>
          )}
          {(tour.precio || tour.precio_antes) && (
            <div className="flex items-center gap-3 pt-1">
              {tour.precio_antes && (
                <span className="text-xs text-slate-400 line-through">
                  ${Number(tour.precio_antes).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                </span>
              )}
              {tour.precio && (
                <span className="text-lg font-black text-primary">
                  ${Number(tour.precio).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MosaicTile({ tour, colSpan, rowSpan, onClick, fading }) {
  const isBig = colSpan >= 2 && rowSpan >= 2
  const imageSrc = getTourImage(tour)

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl cursor-pointer group transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
        aspectRatio: '1 / 1',
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={tour.nombre}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-slate-500">landscape</span>
        </div>
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
        {tour.categoria && (
          <span className="inline-block bg-accent/90 text-primary text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
            {tour.categoria}
          </span>
        )}
        <p className={`text-white font-bold leading-tight line-clamp-2 ${isBig ? 'text-sm sm:text-base' : 'text-[10px] sm:text-xs'}`}>
          {tour.nombre}
        </p>
        {isBig && tour.ubicacion && (
          <p className="text-white/60 text-[10px] mt-0.5 line-clamp-1">{tour.ubicacion}</p>
        )}
      </div>
    </div>
  )
}

export default function TurismoSection({ onViewAll, onOpenTour }) {
  const [allTours, setAllTours] = useState([])
  const [displayTours, setDisplayTours] = useState([])
  const [fading, setFading] = useState(false)
  const [selectedTour, setSelectedTour] = useState(null)
  const gridRef = useRef(null)
  const rotationRef = useRef(null)

  // Fetch tours from DB (only premium)
  useEffect(() => {
    fetch(`${API}/api/v1/tours/public`)
      .then(r => r.json())
      .then(data => {
        const tours = data.tours || []
        setAllTours(tours)
        const shuffled = shuffleWithCompanyBalance(tours.length > 0 ? tours : PLACEHOLDER_TOURS)
        setDisplayTours(shuffled.slice(0, LAYOUT.length))
      })
      .catch(() => {
        setAllTours([])
        setDisplayTours(PLACEHOLDER_TOURS.slice(0, LAYOUT.length))
      })
  }, [])

  // Rotate collage every 10 seconds
  const rotateTours = useCallback(() => {
    const source = allTours.length > 0 ? allTours : PLACEHOLDER_TOURS
    setFading(true)
    setTimeout(() => {
      const shuffled = shuffleWithCompanyBalance(source)
      setDisplayTours(shuffled.slice(0, LAYOUT.length))
      setFading(false)
    }, 700)
  }, [allTours])

  useEffect(() => {
    rotationRef.current = setInterval(rotateTours, 10000)
    return () => clearInterval(rotationRef.current)
  }, [rotateTours])

  // Equalize row heights
  useEffect(() => {
    function equalize() {
      const grid = gridRef.current
      if (!grid) return
      const cols = 8
      const gap = 6
      const cellSize = Math.floor((grid.clientWidth - (cols - 1) * gap) / cols)
      grid.style.gridTemplateRows = `${cellSize}px ${cellSize}px`
    }
    equalize()
    window.addEventListener('resize', equalize)
    return () => window.removeEventListener('resize', equalize)
  }, [displayTours])

  const tiles = LAYOUT.map((slot, i) => ({
    ...slot,
    tour: displayTours[i],
  })).filter(t => t.tour)

  const handleTileClick = (tour) => {
    setSelectedTour(tour)
  }

  return (
    <div className="relative overflow-hidden" style={{ background: '#1a1220' }}>
      {displayTours.length > 0 && getTourImage(displayTours[0]) && (
        <>
          <img
            src={getTourImage(displayTours[0])}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            style={{ filter: 'blur(4px)', transform: 'scale(1.05)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(26,18,32,0.95) 35%, rgba(26,18,32,0.6) 100%)' }} />
        </>
      )}

      <div className="relative z-10 py-4 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          <div className="w-1 h-5 sm:h-6 bg-accent rounded-full"></div>
          <h2 className="text-sm sm:text-base font-black text-white tracking-wide">Turismo</h2>
          <span className="text-[9px] sm:text-[10px] font-bold text-accent/70 uppercase tracking-wider">Villarrica</span>
          <div className="flex-1 h-px bg-white/10"></div>
          <button
            onClick={onViewAll}
            className="text-[9px] sm:text-[10px] font-bold text-accent hover:text-white transition-colors uppercase tracking-wider"
          >
            Ver todo
          </button>
        </div>

        <div
          ref={gridRef}
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridAutoRows: 'auto',
          }}
        >
          {tiles.map((tile, i) => (
            <MosaicTile
              key={`${tile.tour.id}-${i}`}
              tour={tile.tour}
              colSpan={tile.colSpan}
              rowSpan={tile.rowSpan}
              onClick={() => handleTileClick(tile.tour)}
              fading={fading}
            />
          ))}
        </div>
      </div>

      {selectedTour && (
        <TourModal tour={selectedTour} onClose={() => setSelectedTour(null)} onOpenTour={onOpenTour} />
      )}
    </div>
  )
}
