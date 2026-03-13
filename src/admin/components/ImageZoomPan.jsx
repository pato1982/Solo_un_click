import { useState, useRef, useCallback, useEffect } from 'react'

export default function ImageZoomPan({ src, alt, onEdit, onRemove }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef(null)

  // Reset zoom/pan when image changes
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [src])

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3))
  const handleZoomOut = () => setZoom(z => {
    const newZ = Math.max(z - 0.25, 1)
    if (newZ === 1) setPan({ x: 0, y: 0 })
    return newZ
  })

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z + 0.15, 3))
    } else {
      setZoom(z => {
        const newZ = Math.max(z - 0.15, 1)
        if (newZ === 1) setPan({ x: 0, y: 0 })
        return newZ
      })
    }
  }, [])

  // Attach wheel with passive:false
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const startDrag = (clientX, clientY) => {
    setDragging(true)
    dragStart.current = { x: clientX, y: clientY }
    panStart.current = { ...pan }
  }

  const moveDrag = (clientX, clientY) => {
    if (!dragging) return
    const dx = clientX - dragStart.current.x
    const dy = clientY - dragStart.current.y
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy })
  }

  const endDrag = () => setDragging(false)

  // Mouse events
  const onMouseDown = (e) => { e.preventDefault(); startDrag(e.clientX, e.clientY) }
  const onMouseMove = (e) => moveDrag(e.clientX, e.clientY)
  const onMouseUp = () => endDrag()

  // Touch events
  const onTouchStart = (e) => {
    if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY)
  }
  const onTouchMove = (e) => {
    if (e.touches.length === 1) moveDrag(e.touches[0].clientX, e.touches[0].clientY)
  }
  const onTouchEnd = () => endDrag()

  return (
    <div className="relative">
      {/* Image container */}
      <div
        ref={containerRef}
        className="w-52 h-52 rounded-lg border border-gray-200 overflow-hidden"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover select-none pointer-events-none"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 0.15s ease-out',
          }}
          draggable={false}
        />
      </div>

      {/* Zoom controls — centered bottom */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 rounded-full shadow px-1.5 py-0.5 z-10">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          className="p-0.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-gray-600 text-sm">remove</span>
        </button>
        <span className="text-[10px] font-bold text-gray-500 min-w-[32px] text-center">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
          className="p-0.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-gray-600 text-sm">add</span>
        </button>
      </div>

      {/* Edit button */}
      <button
        type="button"
        onClick={onEdit}
        className="absolute top-1.5 left-1.5 bg-white/90 p-1 rounded-md shadow hover:bg-primary/10 transition-colors z-10"
      >
        <span className="material-symbols-outlined text-primary text-sm">edit</span>
      </button>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 bg-white/90 p-1 rounded-md shadow hover:bg-red-50 transition-colors z-10"
      >
        <span className="material-symbols-outlined text-red-500 text-sm">close</span>
      </button>
    </div>
  )
}
