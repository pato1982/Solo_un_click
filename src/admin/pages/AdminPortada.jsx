import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API || ''

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
  const fileRefs = [useRef(null), useRef(null), useRef(null)]

  const token = localStorage.getItem('token')

  useEffect(() => {
    // Cargar portada y nombre del negocio en paralelo
    const headers = { Authorization: `Bearer ${token}` }

    const safeFetch = (url) => fetch(url, { headers }).then(r => {
      if (r.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; return {} }
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
