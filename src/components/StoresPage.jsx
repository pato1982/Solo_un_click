import { useState, useEffect, useRef } from 'react'

export const storeCategories = [
  { icon: 'store', label: 'Abarrotes' },
  { icon: 'liquor', label: 'Botilleria' },
  { icon: 'hardware', label: 'Ferreteria' },
  { icon: 'bakery_dining', label: 'Panaderia' },
  { icon: 'local_pharmacy', label: 'Farmacia' },
  { icon: 'storefront', label: 'Bazar' },
  { icon: 'restaurant', label: 'Comida' },
  { icon: 'local_florist', label: 'Floreria' },
  { icon: 'checkroom', label: 'Ropa' },
  { icon: 'pets', label: 'Mascotas' },
  { icon: 'local_library', label: 'Libreria' },
  { icon: 'content_cut', label: 'Peluqueria' },
  { icon: 'cake', label: 'Pasteleria' },
  { icon: 'local_laundry_service', label: 'Lavanderia' },
  { icon: 'smartphone', label: 'Celulares' },
  { icon: 'recycling', label: 'Reciclaje' },
]

export const allStores = [
  {
    name: 'Botilleria El Volcan',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
    address: 'Av. Pedro de Valdivia 520, Villarrica',
    schedule: 'Lun-Sab 10:00 - 22:00',
    type: 'Botilleria',
    lat: -39.2820, lng: -72.2265,
  },
  {
    name: 'Almacen Dona Rosa',
    image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?w=800&q=80',
    address: 'Calle Anfion Munoz 312, Villarrica',
    schedule: 'Lun-Dom 08:00 - 21:00',
    type: 'Abarrotes',
    lat: -39.2845, lng: -72.2280,
  },
  {
    name: 'Botilleria La Esquina',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
    address: 'Camino Villarrica-Pucon Km 3, Villarrica',
    schedule: 'Lun-Sab 11:00 - 23:00',
    type: 'Botilleria',
    lat: -39.2780, lng: -72.2150,
  },
  {
    name: 'Almacen Don Lucho',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
    address: 'Calle General Korner 145, Villarrica',
    schedule: 'Lun-Sab 08:30 - 20:30',
    type: 'Abarrotes',
    lat: -39.2860, lng: -72.2250,
  },
  {
    name: 'Botilleria Sur',
    image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80',
    address: 'Av. Julio Zegers 890, Villarrica',
    schedule: 'Lun-Dom 10:00 - 00:00',
    type: 'Botilleria',
    lat: -39.2890, lng: -72.2300,
  },
  {
    name: 'Almacen La Vecina',
    image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800&q=80',
    address: 'Pasaje Los Aromos 67, Villarrica',
    schedule: 'Lun-Sab 07:00 - 21:00',
    type: 'Abarrotes',
    lat: -39.2830, lng: -72.2310,
  },
  {
    name: 'Botilleria Central',
    image: 'https://images.unsplash.com/photo-1597290282695-edc43d0e7129?w=800&q=80',
    address: 'Calle Valentin Letelier 210, Villarrica',
    schedule: 'Lun-Sab 10:00 - 22:00',
    type: 'Botilleria',
    lat: -39.2855, lng: -72.2270,
  },
  {
    name: 'Almacen El Barrio',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    address: 'Calle Bilbao 455, Villarrica',
    schedule: 'Lun-Dom 07:30 - 22:00',
    type: 'Abarrotes',
    lat: -39.2870, lng: -72.2235,
  },
  {
    name: 'Ferreteria El Maestro',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80',
    address: 'Av. Pedro de Valdivia 310, Villarrica',
    schedule: 'Lun-Sab 09:00 - 19:00',
    type: 'Ferreteria',
    lat: -39.2835, lng: -72.2260,
  },
  {
    name: 'Panaderia La Espiga',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    address: 'Calle Anfion Munoz 180, Villarrica',
    schedule: 'Lun-Dom 07:00 - 20:00',
    type: 'Panaderia',
    lat: -39.2842, lng: -72.2290,
  },
  {
    name: 'Farmacia del Pueblo',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80',
    address: 'Calle General Korner 220, Villarrica',
    schedule: 'Lun-Sab 09:00 - 20:00',
    type: 'Farmacia',
    lat: -39.2858, lng: -72.2242,
  },
  {
    name: 'Bazar Todo Hogar',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
    address: 'Av. Julio Zegers 456, Villarrica',
    schedule: 'Lun-Sab 10:00 - 19:30',
    type: 'Bazar',
    lat: -39.2880, lng: -72.2285,
  },
  {
    name: 'Cocina de la Abuela',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
    address: 'Calle Valentin Letelier 89, Villarrica',
    schedule: 'Lun-Sab 12:00 - 22:00',
    type: 'Comida',
    lat: -39.2850, lng: -72.2275,
  },
  {
    name: 'Floreria Primavera',
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80',
    address: 'Pasaje Los Aromos 34, Villarrica',
    schedule: 'Lun-Sab 09:00 - 18:00',
    type: 'Floreria',
    lat: -39.2825, lng: -72.2320,
  },
  {
    name: 'Ferreteria Don Tito',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
    address: 'Calle Bilbao 678, Villarrica',
    schedule: 'Lun-Sab 08:30 - 19:00',
    type: 'Ferreteria',
    lat: -39.2875, lng: -72.2220,
  },
  {
    name: 'Pasteleria Dulce Tentacion',
    image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=800&q=80',
    address: 'Av. Pedro de Valdivia 890, Villarrica',
    schedule: 'Lun-Sab 09:00 - 20:00',
    type: 'Pasteleria',
    lat: -39.2810, lng: -72.2255,
  },
]

function StoreCard({ store }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group border border-slate-100">
      <div className="relative h-40 bg-slate-100 overflow-hidden">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <span className="absolute top-2 right-2 bg-primary/80 backdrop-blur text-white px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider">
          {store.type}
        </span>
      </div>
      <div className="px-4 py-3 flex flex-col flex-1">
        <h3 className="font-bold text-xs text-slate-900 leading-tight line-clamp-1 mb-1">{store.name}</h3>
        <div className="flex items-start gap-1 mb-1">
          <span className="material-symbols-outlined text-slate-400 text-xs mt-0.5 shrink-0">location_on</span>
          <p className="text-[10px] text-slate-500 line-clamp-2">{store.address}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-slate-400 text-xs shrink-0">schedule</span>
          <p className="text-[10px] text-slate-500">{store.schedule}</p>
        </div>
      </div>
    </div>
  )
}

const typeColors = {
  Abarrotes: '#16a34a',
  Botilleria: '#7c3aed',
  Ferreteria: '#ea580c',
  Panaderia: '#ca8a04',
  Farmacia: '#0891b2',
  Bazar: '#e11d48',
  Comida: '#dc2626',
  Floreria: '#db2777',
  Pasteleria: '#a855f7',
  Ropa: '#6366f1',
  Mascotas: '#059669',
  Libreria: '#0284c7',
  Peluqueria: '#c026d3',
  Lavanderia: '#0d9488',
  Celulares: '#4f46e5',
  Reciclaje: '#65a30d',
}

function StoresMap({ stores, activeFilter }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!window.L || !mapRef.current) return

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current).setView([-39.2850, -72.2270], 15)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapInstanceRef.current)
    }

    // Limpiar markers anteriores
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const filtered = activeFilter
      ? stores.filter((s) => s.type === activeFilter)
      : stores

    filtered.forEach((store) => {
      const color = typeColors[store.type] || '#6b21a8'
      const icon = window.L.divIcon({
        className: '',
        html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <span class="material-symbols-outlined" style="color:white;font-size:14px;">storefront</span>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      })

      const marker = window.L.marker([store.lat, store.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width:180px;font-family:Inter,sans-serif;">
            <img src="${store.image}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px;" />
            <div style="font-size:12px;font-weight:800;color:#1e293b;margin-bottom:2px;">${store.name}</div>
            <div style="font-size:10px;color:#64748b;margin-bottom:2px;display:flex;align-items:center;gap:3px;">
              <span class="material-symbols-outlined" style="font-size:12px;color:#94a3b8;">location_on</span>
              ${store.address}
            </div>
            <div style="font-size:10px;color:#64748b;display:flex;align-items:center;gap:3px;">
              <span class="material-symbols-outlined" style="font-size:12px;color:#94a3b8;">schedule</span>
              ${store.schedule}
            </div>
            <div style="margin-top:4px;display:inline-block;background:${color};color:white;font-size:9px;font-weight:700;padding:2px 8px;border-radius:10px;text-transform:uppercase;">${store.type}</div>
          </div>
        `)

      markersRef.current.push(marker)
    })

    if (filtered.length > 0) {
      const bounds = window.L.latLngBounds(filtered.map((s) => [s.lat, s.lng]))
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
    }
  }, [stores, activeFilter])

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div ref={mapRef} className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '70vh' }}></div>
  )
}

export default function StoresPage({ sidebarOpen, onBack, activeFilter, mapMode, onToggleMap }) {
  const [currentPage, setCurrentPage] = useState(0)

  const filteredStores = activeFilter
    ? allStores.filter((s) => s.type === activeFilter)
    : allStores

  const cols = sidebarOpen ? 5 : 6
  const ROWS_PER_PAGE = 10
  const itemsPerPage = ROWS_PER_PAGE * cols
  const totalPages = Math.max(1, Math.ceil(filteredStores.length / itemsPerPage))
  const pageItems = filteredStores.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

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
          {activeFilter ? activeFilter : 'Todos los Locales'}
        </h2>
        <span className="text-[10px] text-slate-400">
          {filteredStores.length} {filteredStores.length === 1 ? 'local' : 'locales'}
        </span>
        <div className="flex-1"></div>
        {mapMode && (
          <button
            onClick={onToggleMap}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-accent transition-colors"
          >
            <span className="material-symbols-outlined text-sm">grid_view</span>
            Ver tarjetas
          </button>
        )}
      </div>

      {mapMode ? (
        <StoresMap stores={allStores} activeFilter={activeFilter} />
      ) : (
        <>
          <div className={`grid gap-4 ${sidebarOpen ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'} transition-all duration-300`}>
            {pageItems.map((store, idx) => (
              <StoreCard key={`${store.name}-${idx}`} store={store} />
            ))}
          </div>

          {filteredStores.length === 0 && (
            <p className="text-center text-slate-400 text-xs mt-8">
              No hay locales para mostrar.
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
    </div>
  )
}
