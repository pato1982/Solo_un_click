import { useState, useEffect } from 'react'

const emptyForm = {
  nombre_negocio: '',
  direccion: '',
  whatsapp: '',
  telefono: '',
  correo: '',
  facebook: '',
  instagram: '',
}

export default function AdminNegocio() {
  const [form, setForm] = useState(emptyForm)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('admin_negocio')
    if (data) setForm(JSON.parse(data))
  }, [])

  const update = (field, value) => {
    setForm({ ...form, [field]: value })
    setSaved(false)
  }

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem('admin_negocio', JSON.stringify(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-800">Mi Negocio</h1>
          <p className="text-xs text-gray-400 mt-0.5">Información de tu emprendimiento, local o servicio</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        {/* Nombre del negocio */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">storefront</span>
            Nombre del negocio
          </h2>
          <input
            type="text"
            value={form.nombre_negocio}
            onChange={(e) => update('nombre_negocio', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            placeholder="Nombre de tu emprendimiento o local"
          />
        </div>

        {/* Dirección */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">location_on</span>
            Dirección
          </h2>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => update('direccion', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            placeholder="Dirección del negocio"
          />
        </div>

        {/* Contacto */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">call</span>
            Contacto
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">WhatsApp</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-lg material-symbols-outlined">chat</span>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => update('whatsapp', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Teléfono</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg material-symbols-outlined">phone</span>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => update('telefono', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="+56 45 123 4567"
                />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Correo electrónico</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg material-symbols-outlined">mail</span>
              <input
                type="email"
                value={form.correo}
                onChange={(e) => update('correo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                placeholder="contacto@minegocio.cl"
              />
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">share</span>
            Redes sociales
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Facebook</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 text-sm font-black">f</span>
                <input
                  type="text"
                  value={form.facebook}
                  onChange={(e) => update('facebook', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="facebook.com/tu-pagina"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Instagram</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500 text-lg material-symbols-outlined">photo_camera</span>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => update('instagram', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="@tu_instagram"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botón guardar */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Guardar cambios
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-base">check_circle</span>
              Guardado correctamente
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
