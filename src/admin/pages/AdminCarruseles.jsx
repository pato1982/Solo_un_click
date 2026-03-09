import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API || ''
const MAX_IMAGES = 8

export default function AdminCarruseles() {
  const [carruseles, setCarruseles] = useState([
    { posicion: 1, nombre: 'Carrusel 1', imagenes: [] },
    { posicion: 2, nombre: 'Carrusel 2', imagenes: [] },
    { posicion: 3, nombre: 'Carrusel 3', imagenes: [] },
  ])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const fileInputRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  const esPremium = user.plan_id && user.plan_id >= 3

  // Cargar carruseles desde API
  useEffect(() => {
    if (!esPremium) return
    fetch(`${API}/api/carousels`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.carousels && data.carousels.length > 0) {
          const merged = [1, 2, 3].map(pos => {
            const found = data.carousels.find(c => c.posicion === pos)
            return found || { posicion: pos, nombre: `Carrusel ${pos}`, imagenes: [] }
          })
          setCarruseles(merged)
        }
      })
      .catch(err => console.error('Error cargando carruseles:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const current = carruseles[activeTab]
    const espacioDisponible = MAX_IMAGES - current.imagenes.length
    const archivos = files.slice(0, espacioDisponible)

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('nombre', current.nombre)
      archivos.forEach(f => formData.append('imagenes', f))

      const res = await fetch(`${API}/api/carousels/${current.posicion}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()

      if (data.carousel) {
        const updated = [...carruseles]
        updated[activeTab] = data.carousel
        setCarruseles(updated)
      }
    } catch (err) {
      console.error('Error subiendo imágenes:', err)
    }
    setSaving(false)
    e.target.value = ''
  }

  const removeImage = async (imgId) => {
    const current = carruseles[activeTab]
    try {
      await fetch(`${API}/api/carousels/${current.posicion}/images/${imgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      const updated = [...carruseles]
      updated[activeTab] = {
        ...current,
        imagenes: current.imagenes.filter(img => img.id !== imgId)
      }
      setCarruseles(updated)
    } catch (err) {
      console.error('Error eliminando imagen:', err)
    }
  }

  const moveImage = async (from, direction) => {
    const to = from + direction
    const current = carruseles[activeTab]
    const imgs = [...current.imagenes]
    if (to < 0 || to >= imgs.length) return

    ;[imgs[from], imgs[to]] = [imgs[to], imgs[from]]

    const updated = [...carruseles]
    updated[activeTab] = { ...current, imagenes: imgs }
    setCarruseles(updated)

    // Guardar nuevo orden en API
    try {
      await fetch(`${API}/api/carousels/${current.posicion}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ imageIds: imgs.map(i => i.id) })
      })
    } catch (err) {
      console.error('Error reordenando:', err)
    }
  }

  const updateNombre = (value) => {
    const updated = [...carruseles]
    updated[activeTab] = { ...updated[activeTab], nombre: value }
    setCarruseles(updated)
    setSaved(false)
  }

  const handleSaveNombre = async () => {
    const current = carruseles[activeTab]
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('nombre', current.nombre)

      await fetch(`${API}/api/carousels/${current.posicion}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error guardando nombre:', err)
    }
    setSaving(false)
  }

  const current = carruseles[activeTab]

  if (!esPremium) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-gray-800">Carruseles</h1>
            <p className="text-xs text-gray-400 mt-0.5">Imágenes destacadas en tu página</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-3 block">lock</span>
          <h2 className="text-sm font-bold text-gray-600 mb-1">Función exclusiva del Plan Premium</h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Los carruseles de imágenes están disponibles solo para usuarios con Plan Premium.
            Mejora tu plan para acceder a esta funcionalidad.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-800">Carruseles</h1>
          <p className="text-xs text-gray-400 mt-0.5">Administra las imágenes de tus 3 carruseles (máx. {MAX_IMAGES} por carrusel)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {carruseles.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                activeTab === i
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">view_carousel</span>
                {c.nombre || `Carrusel ${i + 1}`}
                <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded-full ${
                  c.imagenes.length >= MAX_IMAGES ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'
                }`}>
                  {c.imagenes.length}/{MAX_IMAGES}
                </span>
              </span>
              {activeTab === i && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Nombre del carrusel */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre del carrusel</label>
            <input
              type="text"
              value={current.nombre}
              onChange={(e) => updateNombre(e.target.value)}
              className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              placeholder={`Carrusel ${activeTab + 1}`}
            />
          </div>

          {/* Botón agregar */}
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={current.imagenes.length >= MAX_IMAGES || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                current.imagenes.length >= MAX_IMAGES || saving
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
              {saving ? 'Subiendo...' : 'Agregar imágenes'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleAddImages}
              className="hidden"
            />
            {current.imagenes.length >= MAX_IMAGES && (
              <span className="text-xs text-red-500 font-medium">Máximo alcanzado</span>
            )}
          </div>

          {/* Grid de imágenes */}
          {current.imagenes.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-3xl text-gray-300 mb-2 block">collections</span>
              <p className="text-sm text-gray-400">No hay imágenes en este carrusel</p>
              <p className="text-xs text-gray-300 mt-1">Agrega hasta {MAX_IMAGES} imágenes</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {current.imagenes.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                >
                  <img
                    src={img.imagen_url ? `${API}${img.imagen_url}` : img.url}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay con controles */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => moveImage(idx, -1)}
                      disabled={idx === 0}
                      className="h-7 w-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white disabled:opacity-30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="h-7 w-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                    <button
                      onClick={() => moveImage(idx, 1)}
                      disabled={idx === current.imagenes.length - 1}
                      className="h-7 w-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white disabled:opacity-30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                  {/* Número de posición */}
                  <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Vista previa estilo marquee */}
          {current.imagenes.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Vista previa del carrusel</p>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-2">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {current.imagenes.map((img) => (
                    <img
                      key={img.id}
                      src={img.imagen_url ? `${API}${img.imagen_url}` : img.url}
                      alt=""
                      className="h-20 w-20 object-cover rounded-md flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón guardar nombre */}
        <div className="px-5 pb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveNombre}
            disabled={saving}
            className="bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-base">check_circle</span>
              Guardado correctamente
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
