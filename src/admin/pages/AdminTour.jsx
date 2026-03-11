import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API || ''

const emptyForm = {
  nombre: '',
  ubicacion: '',
  detalle: '',
  precio: '',
  precioAntes: '',
  imagenPrincipal: 0,
  imagenes: [null, null, null],
  imagenesPreview: [null, null, null],
}

export default function AdminTour() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const fileRefs = [useRef(null), useRef(null), useRef(null)]

  const token = localStorage.getItem('token')

  const fetchTours = () => {
    fetch(`${API}/api/tours`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (r.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; return null }
        return r.json()
      })
      .then(data => { if (data) setTours(data.tours || []) })
      .catch(err => console.error('Error cargando tours:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTours() }, [])

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
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
  }

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setActiveTab(0)
    setShowModal(true)
  }

  const openEdit = (tour) => {
    setEditingId(tour.id)
    const imgs = tour.imagenes || []
    setForm({
      nombre: tour.nombre || '',
      ubicacion: tour.ubicacion || '',
      detalle: tour.detalle || '',
      precio: tour.precio ? String(tour.precio) : '',
      precioAntes: tour.precio_antes ? String(tour.precio_antes) : '',
      imagenPrincipal: tour.imagen_principal || 0,
      imagenes: [imgs[0] || null, imgs[1] || null, imgs[2] || null],
      imagenesPreview: [
        imgs[0] ? `${API}${imgs[0]}` : null,
        imgs[1] ? `${API}${imgs[1]}` : null,
        imgs[2] ? `${API}${imgs[2]}` : null,
      ],
    })
    setActiveTab(0)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setSaving(true)

    try {
      // Subir imágenes nuevas
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
        nombre: form.nombre,
        ubicacion: form.ubicacion,
        detalle: form.detalle,
        precio: form.precio ? Math.round(Number(form.precio)) : null,
        precio_antes: form.precioAntes ? Math.round(Number(form.precioAntes)) : null,
        imagen_principal: form.imagenPrincipal,
        imagenes: finalUrls.filter(Boolean),
      }

      const url = editingId ? `${API}/api/tours/${editingId}` : `${API}/api/tours`
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        fetchTours()
        setShowModal(false)
        setEditingId(null)
        setForm(emptyForm)
      }
    } catch (err) {
      console.error('Error guardando tour:', err)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/api/tours/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTours()
    } catch (err) {
      console.error('Error eliminando tour:', err)
    }
    setDeleteId(null)
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
        <h1 className="text-xl font-black text-gray-800">Tour</h1>
        <p className="text-xs text-gray-400 mt-0.5">Administra los tours y experiencias</p>
      </div>

      {/* Tarjetas de tours + botón agregar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tours.map((tour) => {
          const imgIdx = tour.imagen_principal || 0
          const imagen = tour.imagenes && tour.imagenes[imgIdx] ? `${API}${tour.imagenes[imgIdx]}` : (tour.imagenes && tour.imagenes[0] ? `${API}${tour.imagenes[0]}` : null)
          return (
            <div key={tour.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              {/* Imagen principal */}
              {imagen ? (
                <img src={imagen} alt={tour.nombre} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                </div>
              )}

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-gray-800 truncate">{tour.nombre}</h3>
                {tour.ubicacion && (
                  <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {tour.ubicacion}
                  </p>
                )}
                {tour.detalle && (
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{tour.detalle}</p>
                )}
                {(tour.precio || tour.precio_antes) && (
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    {tour.precio_antes && (
                      <span className="text-xs text-gray-400 line-through">
                        ${Number(tour.precio_antes).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                      </span>
                    )}
                    {tour.precio && (
                      <span className="text-sm font-black text-primary">
                        ${Number(tour.precio).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex border-t border-gray-100">
                <button
                  onClick={() => openEdit(tour)}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Editar
                </button>
                <div className="w-px bg-gray-100" />
                <button
                  onClick={() => setDeleteId(tour.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Eliminar
                </button>
              </div>
            </div>
          )
        })}

        {/* Tarjeta agregar */}
        <button
          onClick={openNew}
          className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-8 min-h-[180px] cursor-pointer group"
        >
          <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-primary transition-colors">add_circle</span>
          <span className="text-sm font-semibold text-gray-400 group-hover:text-primary transition-colors">+ Agregar tour</span>
        </button>
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">{editingId ? 'Editar tour' : 'Nuevo tour'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-gray-400 text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex gap-4 p-4">
              {/* Columna izquierda — Imagen con pestañas */}
              <div className="w-52 shrink-0">
                {/* Pestañas 1 / 2 / 3 */}
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

                {/* Visor de imagen activa */}
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
              </div>

              {/* Columna derecha — Info */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Nombre del tour *</label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(e) => update('nombre', e.target.value)}
                      required
                      className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary"
                      placeholder="Ej: Ascenso Volcán Villarrica"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Imagen principal</label>
                    <select
                      value={form.imagenPrincipal}
                      onChange={(e) => update('imagenPrincipal', Number(e.target.value))}
                      className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary"
                    >
                      <option value={0}>Img 1</option>
                      <option value={1}>Img 2</option>
                      <option value={2}>Img 3</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Detalle del tour</label>
                  <textarea
                    value={form.detalle}
                    onChange={(e) => update('detalle', e.target.value)}
                    rows={4}
                    className="w-full rounded-md border-gray-300 text-xs py-1.5 focus:ring-primary focus:border-primary resize-none"
                    placeholder="Describe en qué consiste el tour..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Precio antes <span className="text-gray-400 font-normal">(opcional)</span></label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                      <input
                        type="number"
                        value={form.precioAntes}
                        onChange={(e) => update('precioAntes', e.target.value)}
                        min="0"
                        step="1"
                        onKeyDown={(e) => ['.', ',', 'e', 'E'].includes(e.key) && e.preventDefault()}
                        className="w-full rounded-md border-gray-300 text-xs py-1.5 pl-6 focus:ring-primary focus:border-primary"
                        placeholder="89990"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Precio actual <span className="text-gray-400 font-normal">(opcional)</span></label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                      <input
                        type="number"
                        value={form.precio}
                        onChange={(e) => update('precio', e.target.value)}
                        min="0"
                        step="1"
                        onKeyDown={(e) => ['.', ',', 'e', 'E'].includes(e.key) && e.preventDefault()}
                        className="w-full rounded-md border-gray-300 text-xs py-1.5 pl-6 focus:ring-primary focus:border-primary"
                        placeholder="45000"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-auto flex items-center justify-center gap-1.5 bg-accent text-primary py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
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
              <h3 className="text-sm font-bold text-gray-800">Eliminar tour</h3>
              <p className="text-xs text-gray-500 text-center">¿Estás seguro de que quieres eliminar este tour? Esta acción no se puede deshacer.</p>
              <div className="flex gap-2 w-full mt-1">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
