import { useState, useRef, useCallback, useEffect } from 'react'

const tabs = [
  { id: 'destacados', label: 'Destacados' },
  { id: 'ofertas', label: 'Ofertas' },
  { id: 'novedades', label: 'Novedades' },
  { id: 'liquidacion', label: 'Liquidación' },
  { id: 'tecnologia', label: 'Tecnología' },
]

const emptyForm = {
  nombre: '',
  descripcion: '',
  precio: '',
  precioOriginal: '',
  subcategoria: '',
  badge: '',
  tipo: '',
  // Atributos opcionales
  attrMedidas: false,
  tallasTipo: '', // 'calzado' | 'ropa' | 'accesorios'
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

const TALLAS_CALZADO = [
  '20','21','22','23','24','25','26','27','28','29','30','31','32','33','34',
  '35','36','37','38','39','40','41','42','43','44','45','46',
]
const TALLAS_ROPA = [
  '2','4','6','8','10','12','14','16',
  'XS','S','M','L','XL','XXL','XXXL',
]
const TALLAS_ACCESORIOS = [
  'XS','S','M','L','XL','Único',
]

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
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = src
  })
}

function ImageCropper({ src, pos, onPosChange, naturalW, naturalH, scale, onScaleChange }) {
  const containerRef = useRef(null)
  const dragging = useRef(false)
  const startPoint = useRef({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })

  const fitScale = naturalW && naturalH
    ? Math.max(208 / naturalW, 208 / naturalH) * scale
    : 1
  const drawW = naturalW * fitScale
  const drawH = naturalH * fitScale

  const clampPos = useCallback((x, y) => {
    const minX = Math.min(0, 208 - drawW)
    const minY = Math.min(0, 208 - drawH)
    return {
      x: Math.max(minX, Math.min(0, x)),
      y: Math.max(minY, Math.min(0, y)),
    }
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

  const handleEnd = useCallback(() => {
    dragging.current = false
  }, [])

  useEffect(() => {
    const onMouseMove = (e) => handleMove(e.clientX, e.clientY)
    const onTouchMove = (e) => {
      e.preventDefault()
      handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }
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

  // Clamp position when scale changes
  useEffect(() => {
    onPosChange(clampPos(pos.x, pos.y))
  }, [scale])

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-52 h-52 rounded-lg border border-gray-200 overflow-hidden cursor-grab active:cursor-grabbing select-none bg-gray-100"
        onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientX, e.clientY) }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      >
        <img
          src={src}
          alt="Preview"
          draggable={false}
          className="pointer-events-none"
          style={{
            width: drawW,
            height: drawH,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            maxWidth: 'none',
          }}
        />
      </div>
      {/* Zoom slider */}
      <div className="flex items-center gap-2 mt-2">
        <span className="material-symbols-outlined text-gray-400 text-sm">zoom_out</span>
        <input
          type="range"
          min="1"
          max="3"
          step="0.05"
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="flex-1 h-1 accent-primary"
        />
        <span className="material-symbols-outlined text-gray-400 text-sm">zoom_in</span>
      </div>
      <p className="text-[10px] text-gray-400 text-center mt-1">Arrastra para ajustar posición</p>
    </div>
  )
}

export default function AdminProductos() {
  const [activeTab, setActiveTab] = useState('destacados')
  const [productos, setProductos] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_productos')
      const version = localStorage.getItem('admin_productos_v')
      if (saved && version === '2') {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) return parsed
      }
    } catch {}
    localStorage.setItem('admin_productos_v', '2')
    const IMG1 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtgS0SetPDa0pDvV-eKE4m0aK2J26dGm6gy0M1dUy-G-2N8exAFgxYVFOAGSShBaD66dYz7ydh-e1ItrO_e6xFTkR3HvtDNCMGzoJmSmMudDH2ZcBcooUxMd9XR7PvWEv-ZDD49kJEGKEzqL8YBnHk7Ptxn6gOTb3ey2EmoHHKPnA9Ny8Z1Zv81SsfQObaMoIzx2GMNjcSTnzjPWgTyETTnwU7p2calL-ZMBcXvos9_TL0H8_0UPntrurqNg5dqTI55A7SmoHnTj0'
    const IMG2 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA38oJjJWEUBdLOIOQn9-ZxX3k5SCbkc4Qz5vzl_TvRayDl6FbSIk974zdMpQHY145ZG6vD5Deq91Iw971LdVWrB82pl5fcMHV1NkALb7zk7w4BW01tQaAl-WoH1QeXsEQ0Cmp66PkIWPi8F94bKz3nWIaUE6HSaV2gFyvju4fVBDt88fM3RXq2g02EkG7bnmi3f8pEORPEGACVIgj4zaC2nSW0BU6DuM1-frKn2Bymil3ID2Qj1yNEFzpsZsS6MqCFQwnVkcMnINg'
    const IMG3 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_lzR7ViSyn9C9Zd0jUBxTS__s2kzDNB8GsK8FsGYMv4aAvpcMMKD6OZscTI77gCTqSw6J68F17xDAcfsg1kiCKEJ9KAIgjnPZDPpa21o2TIhUKVp-K9m8s7haZfTBPOCeyirQGhSkEnwjiw7H_I2y9zsn4RSgYFeKVU7yN1u4w4BCrLjXet-S4btobWZ7reoQ4DQuaP2Ioet3EBEgj3tjyjO8AvW-VyHDj1v9UBMwwwzzZJiRKUeRs4Z62LltzVtV4QmoHamCw5U'
    return [
      // DESTACADOS
      { id: 101, seccion: 'destacados', nombre: 'Silla Pro-Gamer Alpha V2', descripcion: 'Soporte lumbar ajustable y malla transpirable de alta tecnología.', precio: 249990, precioOriginal: 379990, subcategoria: 'Sillas', badge: 'Top Ventas', tipo: 'productos', tallas: null, medidas: { alto: '120', ancho: '65', profundidad: '60' }, genero: null, imagenPreview: IMG1 },
      { id: 102, seccion: 'destacados', nombre: 'Escritorio Nórdico Z-Line', descripcion: 'Madera de roble sustentable con gestión de cables integrada.', precio: 159990, precioOriginal: null, subcategoria: 'Escritorios', badge: 'Premium', tipo: 'productos', tallas: null, medidas: { alto: '75', ancho: '140', profundidad: '60' }, genero: null, imagenPreview: IMG2 },
      { id: 103, seccion: 'destacados', nombre: 'Laptop ZenBook 14" OLED', descripcion: 'Chip M2 Pro y pantalla Retina XDR para creadores digitales.', precio: 1099990, precioOriginal: null, subcategoria: 'Notebooks', badge: 'Destacado', tipo: 'productos', tallas: null, medidas: null, genero: null, imagenPreview: IMG3 },
      { id: 104, seccion: 'destacados', nombre: 'Mouse Ergonómico MX Pro', descripcion: 'Sensor 25K DPI, batería de 70 días y diseño ergonómico.', precio: 74990, precioOriginal: 99990, subcategoria: 'Accesorios', badge: 'Popular', tipo: 'productos', tallas: null, medidas: null, genero: null, imagenPreview: IMG2 },
      { id: 105, seccion: 'destacados', nombre: 'Monitor Curvo 27" 4K', descripcion: 'Panel IPS 144Hz con HDR10 y USB-C integrado.', precio: 389990, precioOriginal: 499990, subcategoria: 'Monitores', badge: 'Recomendado', tipo: 'productos', tallas: null, medidas: { alto: '45', ancho: '62', profundidad: '20' }, genero: null, imagenPreview: IMG3 },
      // OFERTAS
      { id: 201, seccion: 'ofertas', nombre: 'Teclado Mecánico RGB', descripcion: 'Switches Cherry MX Red, retroiluminación RGB personalizable.', precio: 49990, precioOriginal: 84990, subcategoria: 'Teclados', badge: '-40%', tipo: 'productos', tallas: null, medidas: null, genero: null, imagenPreview: IMG2 },
      { id: 202, seccion: 'ofertas', nombre: 'Audífonos Noise Cancel', descripcion: 'Cancelación activa de ruido, 40h de batería, audio Hi-Res.', precio: 159990, precioOriginal: 229990, subcategoria: 'Audífonos', badge: '-30%', tipo: 'productos', tallas: null, medidas: null, genero: 'Unisex', imagenPreview: IMG1 },
      { id: 203, seccion: 'ofertas', nombre: 'Webcam 4K AutoFocus', descripcion: 'Resolución 4K, enfoque automático y micrófono dual integrado.', precio: 64990, precioOriginal: 84990, subcategoria: 'Cámaras', badge: '-25%', tipo: 'productos', tallas: null, medidas: null, genero: null, imagenPreview: IMG3 },
      { id: 204, seccion: 'ofertas', nombre: 'Hub USB-C 8 en 1', descripcion: 'HDMI 4K, ethernet, lector SD, carga PD 100W.', precio: 34990, precioOriginal: 52990, subcategoria: 'Accesorios', badge: '-35%', tipo: 'productos', tallas: null, medidas: { alto: '2', ancho: '12', profundidad: '5' }, genero: null, imagenPreview: IMG2 },
      { id: 205, seccion: 'ofertas', nombre: 'Polera Algodón Premium', descripcion: 'Polera 100% algodón orgánico, costuras reforzadas.', precio: 12990, precioOriginal: 24990, subcategoria: 'Poleras', badge: '-48%', tipo: 'productos', tallas: { tipo: 'ropa', seleccion: ['S', 'M', 'L', 'XL'] }, medidas: null, genero: 'Hombre', imagenPreview: IMG1 },
      // NOVEDADES
      { id: 301, seccion: 'novedades', nombre: 'Zapatillas Running Pro', descripcion: 'Zapatillas deportivas de alto rendimiento con suela antideslizante.', precio: 59990, precioOriginal: null, subcategoria: 'Zapatillas', badge: 'Nuevo', tipo: 'productos', tallas: { tipo: 'calzado', seleccion: ['38', '39', '40', '41', '42', '43'] }, medidas: null, genero: 'Unisex', imagenPreview: IMG1 },
      { id: 302, seccion: 'novedades', nombre: 'Mochila Aventura 40L', descripcion: 'Mochila resistente al agua con múltiples compartimentos.', precio: 45990, precioOriginal: null, subcategoria: 'Mochilas', badge: 'Nuevo', tipo: 'productos', tallas: null, medidas: { alto: '55', ancho: '35', profundidad: '20' }, genero: 'Unisex', imagenPreview: IMG3 },
      { id: 303, seccion: 'novedades', nombre: 'Smartwatch Deportivo X1', descripcion: 'GPS integrado, monitor cardíaco y resistencia al agua 50m.', precio: 129990, precioOriginal: null, subcategoria: 'Relojes', badge: 'Nuevo', tipo: 'productos', tallas: null, medidas: null, genero: 'Unisex', imagenPreview: IMG2 },
      { id: 304, seccion: 'novedades', nombre: 'Parlante Portátil Bass+', descripcion: 'Sonido 360°, 20h de batería y resistencia IPX7.', precio: 54990, precioOriginal: null, subcategoria: 'Audio', badge: 'Nuevo', tipo: 'productos', tallas: null, medidas: { alto: '18', ancho: '8', profundidad: '8' }, genero: null, imagenPreview: IMG1 },
      { id: 305, seccion: 'novedades', nombre: 'Cargador Solar 20000mAh', descripcion: 'Power bank solar con carga rápida y doble puerto USB-C.', precio: 29990, precioOriginal: null, subcategoria: 'Accesorios', badge: 'Nuevo', tipo: 'productos', tallas: null, medidas: { alto: '15', ancho: '8', profundidad: '2' }, genero: null, imagenPreview: IMG3 },
      // LIQUIDACIÓN
      { id: 401, seccion: 'liquidacion', nombre: 'Vestido Floral Verano', descripcion: 'Vestido ligero con estampado floral, ideal para temporada.', precio: 15990, precioOriginal: 39990, subcategoria: 'Vestidos', badge: 'Liquidación', tipo: 'productos', tallas: { tipo: 'ropa', seleccion: ['XS', 'S', 'M', 'L'] }, medidas: null, genero: 'Mujer', imagenPreview: IMG1 },
      { id: 402, seccion: 'liquidacion', nombre: 'Chaqueta Outdoor Térmica', descripcion: 'Resistente al viento y agua, relleno térmico liviano.', precio: 29990, precioOriginal: 69990, subcategoria: 'Chaquetas', badge: 'Liquidación', tipo: 'productos', tallas: { tipo: 'ropa', seleccion: ['M', 'L', 'XL', 'XXL'] }, medidas: null, genero: 'Hombre', imagenPreview: IMG2 },
      { id: 403, seccion: 'liquidacion', nombre: 'Zapatillas Urbanas Classic', descripcion: 'Diseño retro con plantilla memory foam.', precio: 24990, precioOriginal: 54990, subcategoria: 'Zapatillas', badge: 'Liquidación', tipo: 'productos', tallas: { tipo: 'calzado', seleccion: ['36', '37', '38', '39', '40'] }, medidas: null, genero: 'Mujer', imagenPreview: IMG3 },
      { id: 404, seccion: 'liquidacion', nombre: 'Lámpara LED Escritorio', descripcion: 'Temperatura ajustable, brazo flexible, carga inalámbrica en base.', precio: 19990, precioOriginal: 49990, subcategoria: 'Iluminación', badge: 'Liquidación', tipo: 'productos', tallas: null, medidas: { alto: '45', ancho: '15', profundidad: '15' }, genero: null, imagenPreview: IMG1 },
      { id: 405, seccion: 'liquidacion', nombre: 'Gorro Lana Merino', descripcion: 'Lana merino natural, cálido y suave al tacto.', precio: 5990, precioOriginal: 14990, subcategoria: 'Accesorios', badge: 'Liquidación', tipo: 'productos', tallas: { tipo: 'accesorios', seleccion: ['S', 'M', 'L'] }, medidas: null, genero: 'Unisex', imagenPreview: IMG2 },
      // TECNOLOGÍA
      { id: 501, seccion: 'tecnologia', nombre: 'Tablet Pro 11" 256GB', descripcion: 'Pantalla Liquid Retina, chip M1 y compatibilidad con stylus.', precio: 699990, precioOriginal: 849990, subcategoria: 'Tablets', badge: 'Tech', tipo: 'productos', tallas: null, medidas: { alto: '25', ancho: '17', profundidad: '1' }, genero: null, imagenPreview: IMG3 },
      { id: 502, seccion: 'tecnologia', nombre: 'Drone FPV Racing 4K', descripcion: 'Cámara 4K estabilizada, alcance 2km y vuelo autónomo 30min.', precio: 459990, precioOriginal: null, subcategoria: 'Drones', badge: 'Tech', tipo: 'productos', tallas: null, medidas: null, genero: null, imagenPreview: IMG2 },
      { id: 503, seccion: 'tecnologia', nombre: 'Cámara Mirrorless 24MP', descripcion: 'Sensor APS-C, video 4K 60fps y estabilización en cuerpo.', precio: 899990, precioOriginal: 1099990, subcategoria: 'Cámaras', badge: 'Tech', tipo: 'productos', tallas: null, medidas: null, genero: null, imagenPreview: IMG1 },
      { id: 504, seccion: 'tecnologia', nombre: 'Router WiFi 6E Mesh', descripcion: 'Cobertura 350m², tri-band y control parental avanzado.', precio: 149990, precioOriginal: null, subcategoria: 'Redes', badge: 'Tech', tipo: 'productos', tallas: null, medidas: { alto: '12', ancho: '12', profundidad: '12' }, genero: null, imagenPreview: IMG2 },
      { id: 505, seccion: 'tecnologia', nombre: 'SSD NVMe 1TB Gen4', descripcion: 'Lectura 7000MB/s, escritura 5000MB/s con disipador incluido.', precio: 89990, precioOriginal: 119990, subcategoria: 'Almacenamiento', badge: 'Tech', tipo: 'productos', tallas: null, medidas: null, genero: null, imagenPreview: IMG3 },
    ]
  })
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const fileInputRef = useRef(null)

  useEffect(() => {
    try { localStorage.setItem('admin_productos', JSON.stringify(productos)) } catch {}
  }, [productos])

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
            imagenScale: 1,
          }))
        }
        img.src = reader.result
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let finalImage = formData.imagenPreview
    if (formData.imagenPreview && formData.imagenNaturalW) {
      finalImage = await generateCroppedImage(
        formData.imagenPreview,
        formData.imagenPos,
        formData.imagenScale,
        formData.imagenNaturalW,
        formData.imagenNaturalH
      )
    }
    const productoData = {
      id: editingId || Date.now(),
      seccion: editingId ? productos.find((p) => p.id === editingId)?.seccion || activeTab : activeTab,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: Math.round(Number(formData.precio)),
      precioOriginal: formData.precioOriginal ? Math.round(Number(formData.precioOriginal)) : null,
      subcategoria: formData.subcategoria,
      badge: formData.badge,
      tipo: formData.tipo,
      tallas: formData.tallasTipo ? { tipo: formData.tallasTipo, seleccion: formData.tallasSeleccion } : null,
      medidas: formData.attrMedidas ? { alto: formData.medidasAlto, ancho: formData.medidasAncho, profundidad: formData.medidasProfundidad } : null,
      genero: formData.genero || null,
      imagenPreview: finalImage,
    }
    if (editingId) {
      setProductos((prev) => prev.map((p) => p.id === editingId ? productoData : p))
    } else {
      setProductos((prev) => [...prev, productoData])
    }
    setEditingId(null)
    setFormData(emptyForm)
    setShowModal(false)
  }

  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const openModal = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowModal(true)
  }

  const openEdit = (prod) => {
    setEditingId(prod.id)
    setFormData({
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: String(prod.precio),
      precioOriginal: prod.precioOriginal ? String(prod.precioOriginal) : '',
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

  return (
    <div>
      {/* Título */}
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
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Grid de productos + tarjeta agregar */}
        <div className="p-6">
          <div className="grid grid-cols-5 gap-4">
            {/* Tarjeta agregar producto */}
            <button
              onClick={openModal}
              className="group flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-6 min-h-[200px] hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-primary transition-colors">add</span>
              </div>
              <span className="text-sm font-semibold text-gray-400 group-hover:text-primary transition-colors">Agregar producto</span>
            </button>

            {/* Productos existentes */}
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
                    <span className="text-sm font-bold text-primary">${prod.precio.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</span>
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
            {/* Header modal */}
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
                      <img
                        src={formData.imagenPreview}
                        alt="Preview"
                        className="w-52 h-52 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-1.5 left-1.5 bg-white/90 p-1 rounded-md shadow hover:bg-primary/10 transition-colors z-10"
                    >
                      <span className="material-symbols-outlined text-primary text-sm">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imagen: null, imagenPreview: null, imagenPos: { x: 0, y: 0 }, imagenScale: 1, imagenNaturalW: 0, imagenNaturalH: 0 }))}
                      className="absolute top-1.5 right-1.5 bg-white/90 p-1 rounded-md shadow hover:bg-red-50 transition-colors z-10"
                    >
                      <span className="material-symbols-outlined text-red-500 text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-52 h-52 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-3xl text-gray-400">cloud_upload</span>
                    <span className="text-xs text-gray-500">Buscar imagen</span>
                    <span className="text-[10px] text-gray-400">JPG, PNG, WEBP</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {/* Precios bajo la imagen */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Precio *</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                      <input
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="1"
                        onKeyDown={(e) => ['.', ',', 'e', 'E'].includes(e.key) && e.preventDefault()}
                        className="w-full rounded-md border-gray-300 text-xs py-1.5 pl-6 focus:ring-primary focus:border-primary"
                        placeholder="249990"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Precio anterior</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                      <input
                        type="number"
                        name="precioOriginal"
                        value={formData.precioOriginal}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        onKeyDown={(e) => ['.', ',', 'e', 'E'].includes(e.key) && e.preventDefault()}
                        className="w-full rounded-md border-gray-300 text-xs py-1.5 pl-6 focus:ring-primary focus:border-primary"
                        placeholder="379990"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Info */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Nombre */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary"
                    placeholder="Nombre del producto"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Descripción *</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    rows={2}
                    className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary resize-none"
                    placeholder="Describe el producto..."
                  />
                </div>

                {/* Tipo, Categoría y Subcategoría */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Tipo *</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Seleccionar</option>
                      <option value="productos">Productos</option>
                      <option value="servicios">Servicios</option>
                      <option value="arriendos">Arriendos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Categoría *</label>
                    <input
                      type="text"
                      name="badge"
                      value={formData.badge}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary"
                      placeholder="Ej: Electrónica"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Subcategoría *</label>
                    <input
                      type="text"
                      name="subcategoria"
                      value={formData.subcategoria}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary"
                      placeholder="Ej: Notebooks"
                    />
                  </div>
                </div>

                {/* Atributos: Tallas, Medidas, Género */}
                <div className="space-y-1">
                  <div className="grid grid-cols-3 gap-3">
                    {/* Tallas select */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Tallas</label>
                      <select
                        name="tallasTipo"
                        value={formData.tallasTipo}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tallasTipo: e.target.value, tallasSeleccion: [] }))}
                        className="w-full rounded-md border-gray-300 text-xs py-1 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Sin tallas</option>
                        <option value="calzado">Calzado</option>
                        <option value="ropa">Ropa</option>
                        <option value="accesorios">Accesorios</option>
                      </select>
                    </div>
                    {/* Medidas toggle */}
                    <div className="flex items-end pb-0.5">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({
                          ...prev,
                          attrMedidas: !prev.attrMedidas,
                          ...(!prev.attrMedidas ? {} : { medidasAlto: '', medidasAncho: '', medidasProfundidad: '' }),
                        }))}
                        className="flex items-center gap-1.5"
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          formData.attrMedidas ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                          {formData.attrMedidas && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-600">Medidas</span>
                      </button>
                    </div>
                    {/* Género select */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Género</label>
                      <select
                        name="genero"
                        value={formData.genero}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 text-xs py-1 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Sin definir</option>
                        <option value="Niño">Niño</option>
                        <option value="Niña">Niña</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                  </div>

                  {/* Tallas seleccionables */}
                  {formData.tallasTipo && (
                    <div className="flex flex-wrap gap-1.5">
                      {(formData.tallasTipo === 'calzado' ? TALLAS_CALZADO : formData.tallasTipo === 'ropa' ? TALLAS_ROPA : TALLAS_ACCESORIOS).map((t) => {
                        const selected = formData.tallasSeleccion.includes(t)
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData((prev) => ({
                              ...prev,
                              tallasSeleccion: selected
                                ? prev.tallasSeleccion.filter((s) => s !== t)
                                : [...prev.tallasSeleccion, t],
                            }))}
                            className={`min-w-[32px] px-1.5 py-0.5 text-[10px] font-semibold rounded border transition-colors ${
                              selected
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            {t}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Medidas inputs */}
                  {formData.attrMedidas && (
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: 'medidasAlto', label: 'Alto' },
                        { name: 'medidasAncho', label: 'Ancho' },
                        { name: 'medidasProfundidad', label: 'Profundidad' },
                      ].map(({ name, label }) => (
                        <div key={name}>
                          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">{label} (cm)</label>
                          <input
                            type="number"
                            name={name}
                            value={formData[name]}
                            onChange={handleInputChange}
                            min="0"
                            step="1"
                            className="w-full rounded-md border-gray-300 text-[10px] py-1 focus:ring-primary focus:border-primary"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botón guardar */}
                <button
                  type="submit"
                  className="mt-auto flex items-center justify-center gap-1.5 bg-accent text-primary py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  {editingId ? 'Actualizar Producto' : 'Guardar Producto'}
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
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { setProductos((prev) => prev.filter((p) => p.id !== deleteId)); setDeleteId(null) }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
