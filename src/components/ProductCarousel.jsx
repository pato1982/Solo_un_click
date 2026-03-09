import { useRef, useEffect, useCallback } from 'react'
import ProductCard from './ProductCard'

export default function ProductCarousel({ title, items, sidebarOpen, hidePrice, onViewAll, onOpenStore }) {
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

  const cardWidth = sidebarOpen ? 'w-[calc(20%-13px)]' : 'w-[calc(16.66%-14px)]'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-5 bg-accent rounded-full"></div>
        <h2 className="text-sm font-bold text-slate-700 tracking-wide">{title}</h2>
        <div className="flex-1 h-px bg-slate-200"></div>
        <button onClick={onViewAll} className="text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wider">Ver todo</button>
      </div>
      <div className="flex gap-4 py-1 px-1">
        {/* Primera tarjeta fija */}
        {firstItem && (
          <div className={`shrink-0 ${cardWidth} transition-all duration-300`}>
            <ProductCard product={firstItem} hidePrice={hidePrice} isFirst onOpenStore={onOpenStore} />
          </div>
        )}

        {/* Carrusel con el resto */}
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
                  <ProductCard product={product} hidePrice={hidePrice} onOpenStore={onOpenStore} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
