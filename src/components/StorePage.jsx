import { useState, useEffect, useRef, useCallback } from 'react'
import { sections } from '../data/products'
import ProductCard from './ProductCard'

const API = import.meta.env.VITE_API || ''
const DEFAULT_PHONE = '56912345678'

export function StoreFooter({ store }) {
  const waPhone = (store.phone || '').replace(/[\s+]/g, '')
  return (
    <footer className="bg-primary text-white px-6 py-4">
      <div className="mx-auto grid grid-cols-[0.3fr_1fr_1.5fr_1fr_0.3fr] gap-8 items-start px-6">
        <div></div>
        <div>
          <h3 className="text-lg font-black italic tracking-tight mb-3">{store.name}</h3>
          <div className="flex items-center gap-3">
            <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" title="WhatsApp">
              <svg className="w-5 h-5 fill-current text-green-400" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.347 0-4.522-.809-6.236-2.164l-.436-.35-3.233 1.084 1.084-3.233-.35-.436A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity" title="Instagram">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><defs><linearGradient id="ig-store" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style={{stopColor:'#feda75'}}/><stop offset="25%" style={{stopColor:'#fa7e1e'}}/><stop offset="50%" style={{stopColor:'#d62976'}}/><stop offset="75%" style={{stopColor:'#962fbf'}}/><stop offset="100%" style={{stopColor:'#4f5bd5'}}/></linearGradient></defs><path fill="url(#ig-store)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity" title="YouTube">
              <svg className="w-5 h-5 fill-current text-red-500" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <p className="text-white/80 text-xs leading-relaxed text-justify">{store.description || 'Bienvenido a nuestra tienda. Ofrecemos productos de calidad con la mejor atención para nuestros clientes en Villarrica y alrededores.'}</p>
        </div>
        <div className="pl-16">
          <h4 className="text-xs font-black uppercase tracking-widest text-accent mb-2">Contacto</h4>
          <ul className="space-y-0.5 text-[11px] text-white/60">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent text-sm">mail</span>
              {store.email}
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent text-sm">call</span>
              {store.phone}
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent text-sm">location_on</span>
              {store.address}
            </li>
          </ul>
        </div>
        <div></div>
      </div>
    </footer>
  )
}

function getWhatsAppUrl(product, phone) {
  const p = phone ? phone.replace(/[\s+]/g, '') : DEFAULT_PHONE
  const msg = `Hola! Me interesa este producto:\n\n*${product.name}*\n${product.price ? `Precio: $${product.price.toLocaleString('es-CL', { maximumFractionDigits: 0 })}` : ''}\n\n${product.image}`
  return `https://wa.me/${p}?text=${encodeURIComponent(msg)}`
}

function MarqueeModal({ product, phone, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-2 right-2 z-10 h-6 w-6 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-slate-600 text-sm">close</span>
        </button>
        <div className="flex flex-col md:flex-row md:min-h-[220px]">
          <div className="md:w-[50%] h-44 md:h-auto shrink-0 pt-1 pr-1 pl-1">
            <img src={product.image} alt={product.alt || product.name} className="w-full h-full object-cover rounded-tr-xl bg-slate-100" />
          </div>
          <div className="md:w-[50%] p-3 flex flex-col flex-1 overflow-y-auto">
            <h3 className="text-sm font-black text-primary text-center mb-2 line-clamp-2">
              {(() => {
                const words = product.name.split(' ')
                if (words.length <= 2) return product.name
                return <>{words.slice(0, 2).join(' ')}<br />{words.slice(2).join(' ')}</>
              })()}
            </h3>
            {product.badge && (
              <div className="flex justify-center mb-2">
                <span className="text-[9px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">{product.badge}</span>
              </div>
            )}
            <p className="text-[10px] text-slate-500 leading-relaxed mb-2">{product.description}</p>

            {product.tallas && product.tallas.seleccion && product.tallas.seleccion.length > 0 && (
              <div className="mb-2">
                <p className="text-[9px] font-bold text-slate-600 mb-1">Tallas disponibles:</p>
                <div className="flex flex-wrap gap-1">
                  {product.tallas.seleccion.map((t) => (
                    <span key={t} className="text-[9px] font-semibold px-1.5 py-0.5 rounded border border-primary/20 bg-primary/5 text-primary">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {product.medidas && (product.medidas.alto || product.medidas.ancho || product.medidas.profundidad) && (
              <div className="mb-2">
                <p className="text-[9px] font-bold text-slate-600 mb-1">Medidas:</p>
                <div className="flex gap-2 text-[9px] text-slate-500">
                  {product.medidas.alto && <span>Alto: {product.medidas.alto}cm</span>}
                  {product.medidas.ancho && <span>Ancho: {product.medidas.ancho}cm</span>}
                  {product.medidas.profundidad && <span>Prof: {product.medidas.profundidad}cm</span>}
                </div>
              </div>
            )}

            {product.genero && (
              <p className="text-[9px] text-slate-400 mb-2">Género: {product.genero}</p>
            )}

            <div className="mt-auto pt-2 flex items-center gap-2">
              {product.originalPrice && (
                <p className="text-[10px] font-bold text-slate-400 line-through">
                  ${product.originalPrice.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                </p>
              )}
              {product.price > 0 && (
                <p className="text-sm font-black text-primary">
                  ${product.price.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-end">
          <div className="flex items-center gap-1.5">
            <button className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all" title="Tienda">
              <span className="material-symbols-outlined text-sm">storefront</span>
            </button>
            <a href={getWhatsAppUrl(product, phone)} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-green-500/10 hover:bg-green-500 hover:text-white text-green-600 flex items-center justify-center transition-all" title="WhatsApp">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.347 0-4.522-.809-6.236-2.164l-.436-.35-3.233 1.084 1.084-3.233-.35-.436A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            </a>
            <button className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all" title="Ubicación">
              <span className="material-symbols-outlined text-sm">location_on</span>
            </button>
            <button className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all" title="Teléfono">
              <span className="material-symbols-outlined text-sm">call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageMarquee({ products, phone, carouselItems }) {
  // Use carousel items from API if available, otherwise fall back to store products
  const items = (carouselItems && carouselItems.length > 0)
    ? carouselItems
    : products.filter((p) => p.image).slice(0, 8)
  if (items.length === 0) return null
  const doubled = [...items, ...items]
  const [paused, setPaused] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  return (
    <>
      <div
        className="overflow-hidden py-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex gap-3 w-max animate-image-marquee"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
        >
          {doubled.map((product, i) => (
            <div
              key={`${product.id}-${i}`}
              className="shrink-0 h-40 rounded-lg bg-white shadow-sm overflow-hidden border border-slate-100 cursor-pointer hover:shadow-md hover:scale-105 transition-all"
              style={{ width: 'calc((100vw - 280px) / 6 - 12px)' }}
              onClick={() => setSelectedProduct(product)}
            >
              <img
                src={product.image}
                alt={product.alt || product.name}
                className="w-full h-full object-contain p-2"
              />
            </div>
          ))}
        </div>
      </div>
      {selectedProduct && (
        <MarqueeModal product={selectedProduct} phone={phone} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  )
}

function StoreCarousel({ title, items, onOpenStore }) {
  const scrollRef = useRef(null)
  const intervalRef = useRef(null)

  const firstItem = items[0]
  const restItems = items.slice(1)

  const scrollOne = useCallback((direction) => {
    if (!scrollRef.current) return
    const cardWidth = scrollRef.current.querySelector(':first-child')?.offsetWidth || 200
    const amount = cardWidth + 16
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }, [])

  const scroll = (direction) => {
    scrollOne(direction)
    resetAutoScroll()
  }

  const resetAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (!scrollRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      if (scrollLeft + clientWidth >= scrollWidth - 5) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollOne('right')
      }
    }, 5000)
  }, [scrollOne])

  useEffect(() => {
    if (restItems.length > 0) {
      resetAutoScroll()
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [resetAutoScroll, restItems.length])

  const cardWidth = 'w-[calc(20%-13px)]'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-5 bg-accent rounded-full"></div>
        <h2 className="text-sm font-bold text-slate-700 tracking-wide">{title}</h2>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>
      <div className="flex gap-4 py-1 px-1">
        {firstItem && (
          <div className={`shrink-0 ${cardWidth} transition-all duration-300`}>
            <ProductCard product={firstItem} isFirst onOpenStore={onOpenStore} inStorePage />
          </div>
        )}
        {restItems.length > 0 && (
          <div className="relative group/carousel flex-1 min-w-0">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-hidden scroll-smooth"
            >
              {restItems.map((product) => (
                <div
                  key={product.id}
                  className={`shrink-0 ${cardWidth} transition-all duration-300`}
                >
                  <ProductCard product={product} onOpenStore={onOpenStore} inStorePage />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StoreBanner({ store, products, bannerItems, phone }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const intervalRef = useRef(null)

  // Usar banner items del API si están disponibles, sino productos
  let slides
  if (bannerItems && bannerItems.length > 0) {
    const slide1 = bannerItems.filter(b => b.banner_orden >= 1 && b.banner_orden <= 5).sort((a, b) => a.banner_orden - b.banner_orden)
    const slide2 = bannerItems.filter(b => b.banner_orden >= 6 && b.banner_orden <= 10).sort((a, b) => a.banner_orden - b.banner_orden)
    slides = [slide1, slide2].filter(s => s.length >= 1)
  } else {
    const bannerProducts = products.filter((p) => p.image).slice(0, 10)
    slides = [
      bannerProducts.slice(0, 5),
      bannerProducts.slice(5, 10),
    ].filter((s) => s.length >= 5)
  }

  useEffect(() => {
    if (slides.length < 2) return
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0))
    }, 7000)
    return () => clearInterval(intervalRef.current)
  }, [slides.length])

  return (
    <>
      <div className="relative w-full h-72 overflow-hidden mb-2 bg-white">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-1 p-1 transition-opacity duration-1000"
            style={{ opacity: activeSlide === i ? 1 : 0 }}
          >
            {slide[0] && (
              <div className="col-span-2 row-span-2 bg-white rounded-lg overflow-hidden flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setSelectedProduct(slide[0])}>
                <img src={slide[0].image} alt={slide[0].alt || slide[0].name} className="h-full w-1/2 object-contain shrink-0" />
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-xs font-black text-primary leading-tight line-clamp-2">{slide[0].name}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{slide[0].description}</p>
                  {slide[0].price > 0 && (
                    <p className="text-sm font-black text-accent mt-1">${slide[0].price.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
                  )}
                </div>
              </div>
            )}
            {[1, 2, 3, 4].map((idx) => slide[idx] && (
              <div key={slide[idx].id || idx} className="bg-white rounded-lg overflow-hidden flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setSelectedProduct(slide[idx])}>
                <img src={slide[idx].image} alt={slide[idx].alt || slide[idx].name} className="h-full w-2/5 object-contain shrink-0" />
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-[9px] font-bold text-primary leading-tight line-clamp-1">{slide[idx].name}</p>
                  <p className="text-[8px] text-slate-400 line-clamp-1 mt-0.5">{slide[idx].description}</p>
                  {slide[idx].price > 0 && (
                    <p className="text-[10px] font-black text-accent mt-0.5">${slide[idx].price.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-primary/30 pointer-events-none"></div>
        {/* Indicadores */}
        {slides.length > 1 && (
          <div className="absolute bottom-2 right-3 flex gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveSlide(i); clearInterval(intervalRef.current) }}
                className={`h-1.5 rounded-full transition-all ${
                  activeSlide === i ? 'w-5 bg-accent' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {selectedProduct && (
        <MarqueeModal product={selectedProduct} phone={phone} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  )
}

function mapListing(l) {
  return {
    id: l.id,
    name: l.nombre,
    description: l.descripcion,
    image: l.imagen ? `${API}${l.imagen}` : null,
    alt: l.nombre,
    price: l.precio,
    originalPrice: l.precio_original,
    badge: l.badge,
    tallas: l.tallas,
    medidas: l.medidas,
    genero: l.genero,
    tipo: l.tipo,
    subcategory: l.subcategoria,
    seccion: l.seccion,
    carousel_posicion: l.carousel_posicion,
  }
}

const SECTION_TITLES = {
  destacados: 'Productos Destacados',
  ofertas: 'Productos en Ofertas',
  novedades: 'Novedades',
  liquidacion: 'Productos en Liquidación',
  tecnologia: 'Tecnología',
  servicios: 'Servicios',
  arriendos: 'Arriendos',
  turismo: 'Tendencia',
}

export default function StorePage({ store, onBack, onOpenStore }) {
  const [activeCat, setActiveCat] = useState(null)
  const [activeSub, setActiveSub] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const [seccionesOpen, setSeccionesOpen] = useState(false)
  const [carouselItems, setCarouselItems] = useState([])
  const [bannerItems, setBannerItems] = useState([])
  const [apiProducts, setApiProducts] = useState(null)
  const [storeInfo, setStoreInfo] = useState(null)
  const [loading, setLoading] = useState(!!store.userId)

  // Fetch data from API if store has userId
  useEffect(() => {
    if (!store.userId) return
    Promise.all([
      fetch(`${API}/api/listings?user_id=${store.userId}`).then(r => r.json()),
      fetch(`${API}/api/listings?user_id=${store.userId}&carousel=1`).then(r => r.json()),
      fetch(`${API}/api/business/${store.userId}`).then(r => r.json()),
    ]).then(([listData, carData, bizData]) => {
      if (listData.listings) {
        // Productos normales (sin carrusel ni banner)
        setApiProducts(listData.listings.filter(l => !l.carousel_posicion && !l.banner_orden).map(mapListing))
        // Banner items
        const banners = listData.listings.filter(l => l.banner_orden).map(l => ({
          ...mapListing(l),
          banner_orden: l.banner_orden,
        }))
        setBannerItems(banners)
      }
      if (carData.listings) {
        setCarouselItems(carData.listings.map(mapListing))
      }
      if (bizData.business) {
        setStoreInfo(bizData.business)
      }
    }).catch(err => console.error('Error cargando tienda:', err))
      .finally(() => setLoading(false))
  }, [store.userId])

  // Datos de la tienda: API o estáticos
  const storeName = storeInfo?.nombre_negocio || store.name
  const storePhone = storeInfo?.whatsapp || storeInfo?.telefono || store.phone
  const storeSlogan = storeInfo?.slogan || store.slogan

  // Productos: API o estáticos
  let storeProducts
  if (apiProducts) {
    storeProducts = apiProducts
  } else {
    storeProducts = []
    sections.forEach((section) => {
      section.items.forEach((item) => {
        if (store.productIds && store.productIds.includes(item.id)) {
          storeProducts.push(item)
        }
      })
    })
  }

  // Categorías: API (dinámicas desde subcategorías) o estáticas
  const storeCategories = apiProducts
    ? (() => {
        const catMap = {}
        apiProducts.forEach(p => {
          if (!p.subcategory) return
          // Usar tipo como categoría padre
          const catLabel = p.tipo === 'servicio' ? 'Servicios' : p.tipo === 'arriendo' ? 'Arriendos' : 'Productos'
          if (!catMap[catLabel]) catMap[catLabel] = new Set()
          catMap[catLabel].add(p.subcategory)
        })
        return Object.entries(catMap).map(([label, subs]) => ({
          label,
          subcategories: [...subs],
        }))
      })()
    : (store.categories || [])

  // Secciones del store
  const storeSections = apiProducts
    ? (() => {
        const secMap = {}
        apiProducts.forEach(p => {
          const sec = p.seccion || 'destacados'
          if (!secMap[sec]) secMap[sec] = []
          secMap[sec].push(p)
        })
        return Object.entries(secMap).map(([id, items]) => ({
          id,
          title: SECTION_TITLES[id] || id,
          items,
        }))
      })()
    : sections.filter((s) =>
        s.items.some((item) => store.productIds && store.productIds.includes(item.id))
      )

  // Filtrar por categoría, subcategoría o sección seleccionada
  const currentCat = storeCategories.find((c) => c.label === activeCat)
  const currentSubs = currentCat ? currentCat.subcategories : []

  const filteredProducts = storeProducts.filter((p) => {
    if (activeSection) {
      if (apiProducts) {
        return (p.seccion || 'destacados') === activeSection
      }
      const sec = sections.find((s) => s.id === activeSection)
      return sec ? sec.items.some((item) => item.id === p.id) : true
    }
    if (activeSub) return p.subcategory === activeSub
    if (currentCat) return currentSubs.includes(p.subcategory)
    return true
  })

  const handleCatClick = (catLabel) => {
    setActiveSection(null)
    if (activeCat === catLabel) {
      setActiveCat(null)
      setActiveSub(null)
    } else {
      setActiveCat(catLabel)
      setActiveSub(null)
    }
  }

  const handleSectionClick = (sectionId) => {
    if (activeSection === sectionId) {
      setActiveSection(null)
    } else {
      setActiveSection(sectionId)
      setActiveCat(null)
      setActiveSub(null)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <>
      {/* Sidebar con categorías y subcategorías */}
      <aside className="hidden md:block shrink-0 w-44 sticky top-[92px] self-start mt-3 ml-1 z-30 mb-6">
          <div className="bg-primary text-white animate-slide-in shadow-lg p-2">
            <div className="border border-accent rounded-lg p-2 pt-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase tracking-tight">{storeName.split(' ')[0]}</h3>
              </div>
              <div className="flex flex-col gap-0 max-h-[380px] overflow-y-auto sidebar-scroll pr-1">
                {storeCategories.map((cat) => (
                  <div key={cat.label}>
                    <button
                      onClick={() => handleCatClick(cat.label)}
                      className={`flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/10 transition-colors text-xs font-bold text-white/80 hover:text-white w-full ${
                        activeCat === cat.label ? 'bg-white/10 text-accent' : ''
                      }`}
                    >
                      <span className="flex-1 text-left">{cat.label}</span>
                    </button>
                    <div className="flex flex-col">
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => { setActiveCat(cat.label); setActiveSub(sub) }}
                          className={`flex items-center gap-2 pl-6 pr-2 py-0.5 rounded-md text-[11px] font-normal text-white/50 w-full text-left ${
                            activeSub === sub ? 'text-white font-bold' : ''
                          }`}
                        >
                          {activeSub === sub
                            ? <span className="material-symbols-outlined text-white text-xs shrink-0">check</span>
                            : <span className="w-1 h-1 rounded-full bg-accent shrink-0"></span>
                          }
                          <span>{sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Secciones */}
              {storeSections.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <button
                    onClick={() => setSeccionesOpen(!seccionesOpen)}
                    className={`flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/10 transition-colors text-xs font-bold text-white/80 hover:text-white w-full ${
                      seccionesOpen ? 'bg-white/10 text-accent' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs" style={{ transition: 'transform 0.2s', transform: seccionesOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      chevron_right
                    </span>
                    <span className="flex-1 text-left">Secciones</span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: seccionesOpen ? `${storeSections.length * 28}px` : '0px' }}
                  >
                    {storeSections.map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => handleSectionClick(sec.id)}
                        className={`flex items-center gap-2 pl-6 pr-2 py-0.5 rounded-md text-[11px] font-normal text-white/50 w-full text-left ${
                          activeSection === sec.id ? 'text-white font-bold' : ''
                        }`}
                      >
                        {activeSection === sec.id
                          ? <span className="material-symbols-outlined text-white text-xs shrink-0">check</span>
                          : <span className="w-1 h-1 rounded-full bg-accent shrink-0"></span>
                        }
                        <span className="truncate">{sec.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-white/20">
                <button
                  onClick={onBack}
                  className="w-full bg-accent text-primary py-1.5 rounded-md text-[10px] font-black uppercase tracking-wide hover:brightness-110 transition-all text-center leading-tight flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">arrow_back</span>
                  Volver
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 flex flex-col gap-8 pt-1 px-6 pb-6 overflow-hidden transition-all duration-300">
          {/* Banner publicitario */}
          <StoreBanner store={store} products={storeProducts} bannerItems={bannerItems} phone={storePhone} />
          {filteredProducts.length > 0 ? (
            (() => {
              const rows = []
              for (let i = 0; i < filteredProducts.length; i += 10) {
                rows.push(filteredProducts.slice(i, i + 10))
              }
              // Separar carouseles por posición
              const carousel1 = carouselItems.filter(c => c.carousel_posicion === 1)
              const carousel2 = carouselItems.filter(c => c.carousel_posicion === 2)
              const carousel3 = carouselItems.filter(c => c.carousel_posicion === 3)

              return rows.map((row, idx) => (
                <div key={idx}>
                  <StoreCarousel
                    title={idx === 0 ? (activeSection ? (storeSections.find(s => s.id === activeSection)?.title || SECTION_TITLES[activeSection] || activeSection) : activeSub || activeCat || 'Todos los productos') : ''}
                    items={row}
                    onOpenStore={onOpenStore}
                  />
                  {/* Carrusel 1 después de 2 filas */}
                  {idx === 1 && carousel1.length > 0 && <ImageMarquee products={storeProducts} phone={storePhone} carouselItems={carousel1} />}
                  {/* Carrusel 2 después de 4 filas */}
                  {idx === 3 && carousel2.length > 0 && <ImageMarquee products={storeProducts} phone={storePhone} carouselItems={carousel2} />}
                  {/* Carrusel 3 después de 6 filas */}
                  {idx === 5 && carousel3.length > 0 && <ImageMarquee products={storeProducts} phone={storePhone} carouselItems={carousel3} />}
                </div>
              ))
            })()
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              No hay productos en esta categoría.
            </div>
          )}

        </main>
    </>
  )
}
