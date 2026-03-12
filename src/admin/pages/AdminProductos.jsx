import { useState, useRef, useCallback, useEffect } from 'react'

const API = import.meta.env.VITE_API || ''

const allTabs = [
  { id: 'destacados', label: 'Destacados', requiere: 'vende_productos' },
  { id: 'ofertas', label: 'Ofertas', requiere: 'vende_productos' },
  { id: 'novedades', label: 'Novedades', requiere: 'vende_productos' },
  { id: 'liquidacion', label: 'Liquidación', requiere: 'vende_productos' },
  { id: 'tecnologia', label: 'Tecnología', requiere: 'vende_productos' },
  { id: 'tendencia', label: 'Tendencia', requiere: 'vende_productos' },
  { id: 'servicios', label: 'Servicios', requiere: 'ofrece_servicios' },
  { id: 'arriendos', label: 'Arriendos', requiere: 'ofrece_arriendos' },
]

const emptyForm = {
  nombre: '',
  descripcion: '',
  precio: '',
  precioOriginal: '',
  categoria: '',
  subcategoria: '',
  badge: '',
  tipo: '',
  attrMedidas: false,
  tallasTipo: '',
  tallasSeleccion: [],
  medidasAlto: '',
  medidasAncho: '',
  medidasProfundidad: '',
  genero: '',
  imagen: null,
  imagenPreview: null,
  imagenPos: { x: 0, y: 0 },
  imagenScale: 1,
  imagenNaturalW: 0,
  imagenNaturalH: 0,
}

const TALLAS_CALZADO = ['20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46']
const TALLAS_ROPA = ['2','4','6','8','10','12','14','16','XS','S','M','L','XL','XXL','XXXL']
const TALLAS_ACCESORIOS = ['XS','S','M','L','XL','Único']

function generateCroppedImage(src, pos, scale, naturalW, naturalH, size = 400) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const fitScale = Math.max(size / naturalW, size / naturalH) * scale
      const drawW = naturalW * fitScale
      const drawH = naturalH * fitScale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, pos.x * (size / 208), pos.y * (size / 208), drawW, drawH)
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
    }
    img.src = src
  })
}

function ImageCropper({ src, pos, onPosChange, naturalW, naturalH, scale, onScaleChange }) {
  const containerRef = useRef(null)
  const dragging = useRef(false)
  const startPoint = useRef({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })

  const fitScale = naturalW && naturalH ? Math.max(208 / naturalW, 208 / naturalH) * scale : 1
  const drawW = naturalW * fitScale
  const drawH = naturalH * fitScale

  const clampPos = useCallback((x, y) => {
    let minX, maxX, minY, maxY
    if (drawW >= 208) {
      minX = 208 - drawW; maxX = 0
    } else {
      minX = 0; maxX = 208 - drawW
    }
    if (drawH >= 208) {
      minY = 208 - drawH; maxY = 0
    } else {
      minY = 0; maxY = 208 - drawH
    }
    return { x: Math.max(minX, Math.min(maxX, x)), y: Math.max(minY, Math.min(maxY, y)) }
  }, [drawW, drawH])

  const handleStart = (clientX, clientY) => {
    dragging.current = true
    startPoint.current = { x: clientX, y: clientY }
    startPos.current = { ...pos }
  }

  const handleMove = useCallback((clientX, clientY) => {
    if (!dragging.current) return
    const dx = clientX - startPoint.current.x
    const dy = clientY - startPoint.current.y
    onPosChange(clampPos(startPos.current.x + dx, startPos.current.y + dy))
  }, [clampPos, onPosChange])

  const handleEnd = useCallback(() => { dragging.current = false }, [])

  useEffect(() => {
    const onMouseMove = (e) => handleMove(e.clientX, e.clientY)
    const onTouchMove = (e) => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY) }
    const onUp = () => handleEnd()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [handleMove, handleEnd])

  useEffect(() => { onPosChange(clampPos(pos.x, pos.y)) }, [scale])

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-52 h-52 rounded-lg border border-gray-200 overflow-hidden cursor-grab active:cursor-grabbing select-none bg-gray-100"
        onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientX, e.clientY) }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      >
        <img src={src} alt="Preview" draggable={false} className="pointer-events-none" style={{ width: drawW, height: drawH, transform: `translate(${pos.x}px, ${pos.y}px)`, maxWidth: 'none' }} />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="material-symbols-outlined text-gray-400 text-sm">zoom_out</span>
        <input type="range" min="0.5" max="3" step="0.05" value={scale} onChange={(e) => onScaleChange(Number(e.target.value))} className="flex-1 h-1 accent-primary" />
        <span className="material-symbols-outlined text-gray-400 text-sm">zoom_in</span>
      </div>
      <p className="text-[10px] text-gray-400 text-center mt-1">Arrastra para ajustar posición</p>
    </div>
  )
}

export default function AdminProductos() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  // Filtrar tabs según permisos del usuario
  const tabs = allTabs.filter((tab) => {
    if (tab.requiere === 'vende_productos') return user.vende_productos
    if (tab.requiere === 'ofrece_servicios') return user.ofrece_servicios
    if (tab.requiere === 'ofrece_arriendos') return user.ofrece_arriendos
    return true
  })

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'destacados')
  const [productos, setProductos] = useState([])
  const [categoriasDB, setCategoriasDB] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const fileInputRef = useRef(null)

  // Construir tipos para fetch de categorías según permisos
  const tiposUsuario = [
    user.vende_productos && 'producto',
    user.ofrece_servicios && 'servicio',
    user.ofrece_arriendos && 'arriendo',
  ].filter(Boolean)

  // Cargar productos y categorías desde API
  useEffect(() => {
    const catUrl = tiposUsuario.length > 0
      ? `${API}/api/categorias?tipo=${tiposUsuario.join(',')}`
      : null

    Promise.all([
      fetch(`${API}/api/listings/mine`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      catUrl ? fetch(catUrl).then(r => r.json()) : Promise.resolve({ categorias: [] }),
    ])
      .then(([data, catsData]) => {
        if (data.listings) {
          setProductos(data.listings.map(l => ({
            id: l.id,
            seccion: l.seccion || 'destacados',
            nombre: l.nombre,
            descripcion: l.descripcion,
            precio: l.precio,
            precioOriginal: l.precio_original,
            categoria: l.categoria || '',
            subcategoria: l.subcategoria,
            badge: l.badge,
            tipo: l.tipo,
            tallas: l.tallas,
            medidas: l.medidas,
            genero: l.genero,
            imagenPreview: l.imagen ? `${API}${l.imagen}` : null,
            imagenUrl: l.imagen,
          })))
        }
        if (catsData.categorias) {
          setCategoriasDB(catsData.categorias)
        }
      })
      .catch(err => console.error('Error cargando productos:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const img = new Image()
        img.onload = () => {
          const fitScale = Math.max(208 / img.naturalWidth, 208 / img.naturalHeight)
          const drawW = img.naturalWidth * fitScale
          const drawH = img.naturalHeight * fitScale
          setFormData((prev) => ({
            ...prev,
            imagen: file,
            imagenPreview: reader.result,
            imagenNaturalW: img.naturalWidth,
            imagenNaturalH: img.naturalHeight,
            imagenPos: { x: (208 - drawW) / 2, y: (208 - drawH) / 2 },
            imagenScale: 1.75,
          }))
        }
        img.src = reader.result
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      let imagenUrl = editingId ? productos.find(p => p.id === editingId)?.imagenUrl : null

      // Subir imagen si hay una nueva
      if (formData.imagen && formData.imagenNaturalW) {
        const blob = await generateCroppedImage(
          formData.imagenPreview,
          formData.imagenPos,
          formData.imagenScale,
          formData.imagenNaturalW,
          formData.imagenNaturalH
        )
        const fd = new FormData()
        fd.append('imagen', blob, 'producto.jpg')
        const uploadRes = await fetch(`${API}/api/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        })
        const uploadData = await uploadRes.json()
        if (uploadData.url) imagenUrl = uploadData.url
      }

      // Determinar tipo automático según sección
      let tipo = formData.tipo
      if (!tipo) {
        if (activeTab === 'servicios') tipo = 'servicio'
        else if (activeTab === 'arriendos') tipo = 'arriendo'
        else tipo = 'producto'
      }

      const body = {
        tipo,
        seccion: editingId ? productos.find(p => p.id === editingId)?.seccion || activeTab : activeTab,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: Math.round(Number(formData.precio)) || 0,
        precio_original: formData.precioOriginal ? Math.round(Number(formData.precioOriginal)) : null,
        categoria: formData.categoria,
        subcategoria: formData.subcategoria,
        badge: formData.badge,
        genero: formData.genero || null,
        imagen: imagenUrl,
        tallas: formData.tallasTipo ? { tipo: formData.tallasTipo, seleccion: formData.tallasSeleccion } : null,
        medidas: formData.attrMedidas ? { alto: formData.medidasAlto, ancho: formData.medidasAncho, profundidad: formData.medidasProfundidad } : null,
      }

      let res
      if (editingId) {
        res = await fetch(`${API}/api/listings/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body)
        })
      } else {
        res = await fetch(`${API}/api/listings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body)
        })
      }

      if (res.ok) {
        // Recargar lista
        const listRes = await fetch(`${API}/api/listings/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const listData = await listRes.json()
        if (listData.listings) {
          setProductos(listData.listings.map(l => ({
            id: l.id,
            seccion: l.seccion || 'destacados',
            nombre: l.nombre,
            descripcion: l.descripcion,
            precio: l.precio,
            precioOriginal: l.precio_original,
            categoria: l.categoria || '',
            subcategoria: l.subcategoria,
            badge: l.badge,
            tipo: l.tipo,
            tallas: l.tallas,
            medidas: l.medidas,
            genero: l.genero,
            imagenPreview: l.imagen ? `${API}${l.imagen}` : null,
            imagenUrl: l.imagen,
          })))
        }
        setEditingId(null)
        setFormData(emptyForm)
        setShowModal(false)
      } else {
        const errData = await res.json()
        alert(errData.error || 'Error al guardar')
      }
    } catch (err) {
      console.error('Error guardando:', err)
      alert('Error de conexión')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/api/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (err) {
      console.error('Error eliminando:', err)
    }
    setDeleteId(null)
  }

  const openModal = () => {
    setEditingId(null)
    // Autoseleccionar tipo según tab activo
    let defaultTipo = ''
    if (activeTab === 'servicios') defaultTipo = 'servicio'
    else if (activeTab === 'arriendos') defaultTipo = 'arriendo'
    else defaultTipo = 'producto'
    setFormData({ ...emptyForm, tipo: defaultTipo })
    setShowModal(true)
  }

  const openEdit = (prod) => {
    setEditingId(prod.id)
    setFormData({
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: String(prod.precio),
      precioOriginal: prod.precioOriginal ? String(prod.precioOriginal) : '',
      categoria: prod.categoria || '',
      subcategoria: prod.subcategoria,
      badge: prod.badge || '',
      tipo: prod.tipo || '',
      attrMedidas: !!prod.medidas,
      tallasTipo: prod.tallas?.tipo || '',
      tallasSeleccion: prod.tallas?.seleccion || [],
      medidasAlto: prod.medidas?.alto || '',
      medidasAncho: prod.medidas?.ancho || '',
      medidasProfundidad: prod.medidas?.profundidad || '',
      genero: prod.genero || '',
      imagen: null,
      imagenPreview: prod.imagenPreview || null,
      imagenPos: { x: 0, y: 0 },
      imagenScale: 1,
      imagenNaturalW: 0,
      imagenNaturalH: 0,
    })
    setShowModal(true)
  }

  const productosDeTab = productos.filter((p) => p.seccion === activeTab)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Productos</h1>

      {/* Pestañas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => {
            const count = productos.filter((p) => p.seccion === tab.id).length
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>{count}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Grid de productos */}
        <div className="p-6">
          <div className="grid grid-cols-5 gap-4">
            <button
              onClick={openModal}
              className="group flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-6 min-h-[200px] hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-primary transition-colors">add</span>
              </div>
              <span className="text-sm font-semibold text-gray-400 group-hover:text-primary transition-colors">Agregar producto</span>
            </button>

            {productosDeTab.map((prod) => (
              <div key={prod.id} className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {prod.imagenPreview ? (
                  <img src={prod.imagenPreview} alt={prod.nombre} className="w-full aspect-square object-cover" />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-gray-300">image</span>
                  </div>
                )}
                {prod.badge && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">{prod.badge}</span>
                )}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-800 truncate">{prod.nombre}</p>
                  <p className="text-[10px] text-gray-400 truncate">{prod.subcategoria}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {prod.precio > 0 && (
                      <span className="text-sm font-bold text-primary">${prod.precio.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</span>
                    )}
                    {prod.precioOriginal && (
                      <span className="text-[10px] text-gray-400 line-through">${prod.precioOriginal.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</span>
                    )}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => openEdit(prod)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteId(prod.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-gray-400 text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-4 p-4">
              {/* Columna izquierda - Imagen */}
              <div className="w-52 shrink-0">
                {formData.imagenPreview ? (
                  <div className="relative">
                    {formData.imagenNaturalW > 0 ? (
                      <ImageCropper
                        src={formData.imagenPreview}
                        pos={formData.imagenPos}
                        onPosChange={(pos) => setFormData((prev) => ({ ...prev, imagenPos: pos }))}
                        naturalW={formData.imagenNaturalW}
                        naturalH={formData.imagenNaturalH}
                        scale={formData.imagenScale}
                        onScaleChange={(s) => setFormData((prev) => ({ ...prev, imagenScale: s }))}
                      />
                    ) : (
                      <img src={formData.imagenPreview} alt="Preview" className="w-52 h-52 object-cover rounded-lg border border-gray-200" />
                    )}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute top-1.5 left-1.5 bg-white/90 p-1 rounded-md shadow hover:bg-primary/10 transition-colors z-10">
                      <span className="material-symbols-outlined text-primary text-sm">edit</span>
                    </button>
                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, imagen: null, imagenPreview: null, imagenPos: { x: 0, y: 0 }, imagenScale: 1, imagenNaturalW: 0, imagenNaturalH: 0 }))} className="absolute top-1.5 right-1.5 bg-white/90 p-1 rounded-md shadow hover:bg-red-50 transition-colors z-10">
                      <span className="material-symbols-outlined text-red-500 text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-52 h-52 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-3xl text-gray-400">cloud_upload</span>
                    <span className="text-xs text-gray-500">Buscar imagen</span>
                    <span className="text-[10px] text-gray-400">JPG, PNG, WEBP</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Precio *</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                      <input type="number" name="precio" value={formData.precio} onChange={handleInputChange} required min="0" step="1" onKeyDown={(e) => ['.', ',', 'e', 'E'].includes(e.key) && e.preventDefault()} className="w-full rounded-md border-gray-300 text-xs py-1.5 pl-6 focus:ring-primary focus:border-primary" placeholder="249990" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Precio anterior</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                      <input type="number" name="precioOriginal" value={formData.precioOriginal} onChange={handleInputChange} min="0" step="1" onKeyDown={(e) => ['.', ',', 'e', 'E'].includes(e.key) && e.preventDefault()} className="w-full rounded-md border-gray-300 text-xs py-1.5 pl-6 focus:ring-primary focus:border-primary" placeholder="379990" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Info */}
              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Nombre *</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary" placeholder="Nombre del producto" />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Descripción *</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} required rows={2} className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary resize-none" placeholder="Describe el producto..." />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Tipo *</label>
                    <select name="tipo" value={formData.tipo} onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value, categoria: '', subcategoria: '' }))} required className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary">
                      <option value="">Seleccionar</option>
                      {user.vende_productos && <option value="producto">Productos</option>}
                      {user.ofrece_servicios && <option value="servicio">Servicios</option>}
                      {user.ofrece_arriendos && <option value="arriendo">Arriendos</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Etiqueta</label>
                    <input type="text" name="badge" value={formData.badge} onChange={handleInputChange} className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary" placeholder="Ej: Top Ventas" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Categoría *</label>
                    <select name="categoria" value={formData.categoria} onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value, subcategoria: '' }))} required className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary">
                      <option value="">Seleccionar categoría</option>
                      {categoriasDB.filter(c => !formData.tipo || c.tipo === formData.tipo).map(c => (
                        <option key={c.id} value={c.nombre}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Subcategoría *</label>
                    <select name="subcategoria" value={formData.subcategoria} onChange={handleInputChange} required className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary">
                      <option value="">Seleccionar subcategoría</option>
                      {(categoriasDB.find(c => c.nombre === formData.categoria)?.subcategorias || []).map(s => (
                        <option key={s.id} value={s.nombre}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Tallas</label>
                      <select name="tallasTipo" value={formData.tallasTipo} onChange={(e) => setFormData((prev) => ({ ...prev, tallasTipo: e.target.value, tallasSeleccion: [] }))} className="w-full rounded-md border-gray-300 text-xs py-1 focus:ring-primary focus:border-primary">
                        <option value="">Sin tallas</option>
                        <option value="calzado">Calzado</option>
                        <option value="ropa">Ropa</option>
                        <option value="accesorios">Accesorios</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-0.5">
                      <button type="button" onClick={() => setFormData((prev) => ({ ...prev, attrMedidas: !prev.attrMedidas, ...(!prev.attrMedidas ? {} : { medidasAlto: '', medidasAncho: '', medidasProfundidad: '' }) }))} className="flex items-center gap-1.5">
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${formData.attrMedidas ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                          {formData.attrMedidas && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-600">Medidas</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Género</label>
                      <select name="genero" value={formData.genero} onChange={handleInputChange} className="w-full rounded-md border-gray-300 text-xs py-1 focus:ring-primary focus:border-primary">
                        <option value="">Sin definir</option>
                        <option value="Niño">Niño</option>
                        <option value="Niña">Niña</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                  </div>

                  {formData.tallasTipo && (
                    <div className="flex flex-wrap gap-1.5">
                      {(formData.tallasTipo === 'calzado' ? TALLAS_CALZADO : formData.tallasTipo === 'ropa' ? TALLAS_ROPA : TALLAS_ACCESORIOS).map((t) => {
                        const selected = formData.tallasSeleccion.includes(t)
                        return (
                          <button key={t} type="button" onClick={() => setFormData((prev) => ({ ...prev, tallasSeleccion: selected ? prev.tallasSeleccion.filter((s) => s !== t) : [...prev.tallasSeleccion, t] }))} className={`min-w-[32px] px-1.5 py-0.5 text-[10px] font-semibold rounded border transition-colors ${selected ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                            {t}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {formData.attrMedidas && (
                    <div className="grid grid-cols-3 gap-2">
                      {[{ name: 'medidasAlto', label: 'Alto' }, { name: 'medidasAncho', label: 'Ancho' }, { name: 'medidasProfundidad', label: 'Profundidad' }].map(({ name, label }) => (
                        <div key={name}>
                          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">{label} (cm)</label>
                          <input type="number" name={name} value={formData[name]} onChange={handleInputChange} min="0" step="1" className="w-full rounded-md border-gray-300 text-[10px] py-1 focus:ring-primary focus:border-primary" placeholder="0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={saving} className="mt-auto flex items-center justify-center gap-1.5 bg-accent text-primary py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-50">
                  <span className="material-symbols-outlined text-base">save</span>
                  {saving ? 'Guardando...' : editingId ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup confirmar eliminación */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-red-500">delete</span>
              </div>
              <h3 className="text-sm font-bold text-gray-800">Eliminar producto</h3>
              <p className="text-xs text-gray-500 text-center">¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.</p>
              <div className="flex gap-2 w-full mt-1">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Aceptar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
