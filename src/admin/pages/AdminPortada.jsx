import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API || ''

// Categorías de ejemplo (luego vendrán de una tabla)
const CATEGORIAS_EJEMPLO = [
  'Aventura', 'Naturaleza', 'Cultural', 'Gastronómico',
  'Nocturno', 'Familiar', 'Deportivo', 'Relax',
  'Fotografía', 'Trekking', 'Acuático', 'Nieve',
]

const emptyForm = {
  descripcion: '',
  imagenes: [null, null, null],
  imagenesPreview: [null, null, null],
}

export default function AdminPortada() {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [portadaId, setPortadaId] = useState(null)
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [categorias, setCategorias] = useState([])
  const [savingCats, setSavingCats] = useState(false)
  const [savedCats, setSavedCats] = useState(false)
  const fileRefs = [useRef(null), useRef(null), useRef(null)]

  const token = localStorage.getItem('token')

  useEffect(() => {
    // Cargar portada y nombre del negocio en paralelo
    const headers = { Authorization: `Bearer ${token}` }

    const safeFetch = (url) => fetch(url, { headers }).then(r => {
      if (r.status === 401 && token !== 'dev-token') { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; return {} }
      if (!r.ok) return {}
      return r.json()
    })

    Promise.all([
      safeFetch(`${API}/api/portada`),
      safeFetch(`${API}/api/business`),
    ])
      .then(([portadaData, businessData]) => {
        if (businessData.business) {
          setNombreNegocio(businessData.business.nombre_negocio || '')
        }
        if (portadaData.portada) {
          const p = portadaData.portada
          const imgs = p.imagenes || []
          setPortadaId(p.id)
          setCategorias(p.categorias || [])
          setForm({
            descripcion: p.descripcion || '',
            imagenes: [imgs[0] || null, imgs[1] || null, imgs[2] || null],
            imagenesPreview: [
              imgs[0] ? `${API}${imgs[0]}` : null,
              imgs[1] ? `${API}${imgs[1]}` : null,
              imgs[2] ? `${API}${imgs[2]}` : null,
            ],
          })
        }
      })
      .catch(err => console.error('Error cargando portada:', err))
      .finally(() => setLoading(false))
  }, [])

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleImageChange = (index, e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm(prev => {
        const newImages = [...prev.imagenes]
        const newPreviews = [...prev.imagenesPreview]
        newImages[index] = file
        newPreviews[index] = reader.result
        return { ...prev, imagenes: newImages, imagenesPreview: newPreviews }
      })
      setSaved(false)
    }
    reader.readAsDataURL(file)
  }

  const toggleCategoria = (cat) => {
    setCategorias(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
    setSavedCats(false)
  }

  const handleSaveCategorias = async () => {
    setSavingCats(true)
    try {
      const body = {
        nombre: nombreNegocio || 'Mi emprendimiento',
        descripcion: form.descripcion,
        imagenes: [],
        categorias,
      }

      // Si ya hay portada, usar PUT; si no, POST
      if (portadaId) {
        // Solo actualizar categorias via PUT
        const currentImgs = form.imagenes.filter(img => typeof img === 'string')
        body.imagenes = currentImgs
        await fetch(`${API}/api/portada/${portadaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body)
        })
      } else {
        const res = await fetch(`${API}/api/portada`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body)
        })
        if (res.ok) {
          const data = await res.json()
          if (data.id) setPortadaId(data.id)
        }
      }
      setSavedCats(true)
      setTimeout(() => setSavedCats(false), 3000)
    } catch (err) {
      console.error('Error guardando categorías:', err)
    }
    setSavingCats(false)
  }

  const removeImage = (index) => {
    setForm(prev => {
      const newImages = [...prev.imagenes]
      const newPreviews = [...prev.imagenesPreview]
      newImages[index] = null
      newPreviews[index] = null
      return { ...prev, imagenes: newImages, imagenesPreview: newPreviews }
    })
    setSaved(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.imagenes.some(img => img)) return
    setSaving(true)

    try {
      const finalUrls = []
      for (let i = 0; i < 3; i++) {
        const img = form.imagenes[i]
        if (img instanceof File) {
          const fd = new FormData()
          fd.append('imagen', img)
          const upRes = await fetch(`${API}/api/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd
          })
          const upData = await upRes.json()
          finalUrls.push(upData.url || null)
        } else if (typeof img === 'string') {
          finalUrls.push(img)
        } else {
          finalUrls.push(null)
        }
      }

      const body = {
        nombre: nombreNegocio || 'Mi emprendimiento',
        descripcion: form.descripcion,
        imagenes: finalUrls.filter(Boolean),
        categorias,
      }

      const url = portadaId ? `${API}/api/portada/${portadaId}` : `${API}/api/portada`
      const method = portadaId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        const data = await res.json()
        if (!portadaId && data.id) setPortadaId(data.id)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Error guardando portada:', err)
    }
    setSaving(false)
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
      <div className="mb-6">
        <h1 className="text-xl font-black text-gray-800">Portada</h1>
        <p className="text-xs text-gray-400 mt-0.5">Personaliza cómo se ve tu negocio en la página principal de turismo</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-6">
          {/* Columna izquierda — Imágenes con pestañas */}
          <div className="w-52 shrink-0">
            <label className="block text-[11px] font-semibold text-gray-600 mb-2">Imágenes de portada</label>

            {/* Pestañas */}
            <div className="flex mb-2 rounded-lg overflow-hidden border border-gray-200">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-1.5 text-[11px] font-semibold transition-colors relative ${
                    activeTab === i
                      ? 'text-primary bg-primary/5'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    Img {i + 1}
                    {form.imagenesPreview[i] && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    )}
                  </span>
                  {activeTab === i && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
              ))}
            </div>

            {/* Visor imagen activa */}
            {form.imagenesPreview[activeTab] ? (
              <div className="relative">
                <img
                  src={form.imagenesPreview[activeTab]}
                  alt={`Imagen ${activeTab + 1}`}
                  className="w-52 h-52 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => fileRefs[activeTab].current?.click()}
                  className="absolute top-1.5 left-1.5 bg-white/90 p-1 rounded-md shadow hover:bg-primary/10 transition-colors z-10"
                >
                  <span className="material-symbols-outlined text-primary text-sm">edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(activeTab)}
                  className="absolute top-1.5 right-1.5 bg-white/90 p-1 rounded-md shadow hover:bg-red-50 transition-colors z-10"
                >
                  <span className="material-symbols-outlined text-red-500 text-sm">close</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRefs[activeTab].current?.click()}
                className="w-52 h-52 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-3xl text-gray-400">cloud_upload</span>
                <span className="text-xs text-gray-500">Buscar imagen</span>
                <span className="text-[10px] text-gray-400">JPG, PNG, WEBP</span>
              </button>
            )}

            {[0, 1, 2].map((i) => (
              <input
                key={i}
                ref={fileRefs[i]}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(i, e)}
                className="hidden"
              />
            ))}

            <p className="text-[10px] text-gray-400 text-center mt-2">Estas 3 imágenes aparecen en abanico en tu tarjeta</p>
          </div>

          {/* Columna derecha — Info */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Categorías */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-2">Categorías</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIAS_EJEMPLO.map((cat) => {
                  const activa = categorias.includes(cat)
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategoria(cat)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                        activa
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {activa && <span className="material-symbols-outlined text-xs">check</span>}
                      {cat}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleSaveCategorias}
                  disabled={savingCats || savedCats}
                  className={`font-bold px-5 py-2 rounded-lg transition-all text-xs flex items-center gap-1.5 disabled:opacity-90 ${
                    savedCats
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{savedCats ? 'check_circle' : 'save'}</span>
                  {savingCats ? 'Guardando...' : savedCats ? 'Guardado' : 'Guardar categorías'}
                </button>
                {categorias.length > 0 && !savedCats && (
                  <span className="text-[10px] text-gray-400">{categorias.length} seleccionada{categorias.length !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => update('descripcion', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
                placeholder="Somos líderes en ascensos al volcán Villarrica con más de 15 años de experiencia..."
              />
            </div>

            {/* Botón guardar */}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="submit"
                disabled={saving || saved}
                className={`font-bold px-6 py-2.5 rounded-lg transition-all text-sm flex items-center gap-2 disabled:opacity-90 ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{saved ? 'check_circle' : 'save'}</span>
                {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Vista previa */}
      {(nombreNegocio || form.descripcion || form.imagenesPreview.some(Boolean)) && (
        <div className="mt-6">
          <p className="text-[10px] font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">visibility</span>
            Vista previa — así se verá tu tarjeta en la página de turismo
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 max-w-2xl">
            <div className="flex-1">
              <h3 className="text-lg font-black text-primary mb-1">{nombreNegocio || 'Nombre de Mi Negocio'}</h3>
              {categorias.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {categorias.map(cat => (
                    <span key={cat} className="bg-primary/10 text-primary text-[9px] font-semibold px-2 py-0.5 rounded-full">{cat}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">
                {form.descripcion || 'Descripción de tu negocio...'}
              </p>
              <div className="flex items-center gap-3">
                <span className="bg-primary text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Ver más
                </span>
                <span className="border border-primary/20 text-primary px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">call</span>
                  Contactar
                </span>
              </div>
            </div>
            {/* Mini fan de imágenes */}
            <div className="relative shrink-0" style={{ width: '180px', height: '140px' }}>
              {form.imagenesPreview.map((src, i) => {
                if (!src) return null
                const angles = [{ r: -15, tx: -35 }, { r: 0, tx: 0 }, { r: 15, tx: 35 }]
                return (
                  <div
                    key={i}
                    className="absolute w-20 h-[110px] rounded-xl overflow-hidden shadow-lg border-2 border-white"
                    style={{
                      transform: `translateX(calc(-50% + ${angles[i].tx}px)) rotate(${angles[i].r}deg)`,
                      transformOrigin: 'bottom center',
                      left: '50%',
                      top: '0px',
                      zIndex: i === 1 || i === 2 ? 12 : 10,
                    }}
                  >
                    <img src={src} alt={`Img ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
