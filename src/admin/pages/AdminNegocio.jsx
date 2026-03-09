import { useState, useEffect } from 'react'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const defaultHorarios = DIAS.map((dia) => ({
  dia,
  activo: dia !== 'Domingo',
  apertura: '09:00',
  cierre: '18:00',
}))

const MAX_SLOGAN_WORDS = 10

const emptyForm = {
  nombre_negocio: '',
  slogan: '',
  direccion: '',
  whatsapp: '',
  telefono: '',
  correo: '',
  facebook: '',
  instagram: '',
  horarios: defaultHorarios,
}

export default function AdminNegocio() {
  const [form, setForm] = useState(emptyForm)
  const [saved, setSaved] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const tieneSlogan = user.plan_id && user.plan_id >= 2

  useEffect(() => {
    const data = localStorage.getItem('admin_negocio')
    if (data) setForm(JSON.parse(data))
  }, [])

  const update = (field, value) => {
    if (field === 'slogan') {
      const words = value.trim().split(/\s+/).filter(Boolean)
      if (words.length > MAX_SLOGAN_WORDS) return
    }
    setForm({ ...form, [field]: value })
    setSaved(false)
  }

  const sloganWordCount = form.slogan.trim() ? form.slogan.trim().split(/\s+/).filter(Boolean).length : 0

  const updateHorario = (index, field, value) => {
    const newHorarios = [...form.horarios]
    newHorarios[index] = { ...newHorarios[index], [field]: value }
    setForm({ ...form, horarios: newHorarios })
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

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* COLUMNA IZQUIERDA: Datos del negocio */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Negocio o emprendimiento</label>
                <input
                  type="text"
                  value={form.nombre_negocio}
                  onChange={(e) => update('nombre_negocio', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="Nombre de tu negocio"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Slogan
                  {tieneSlogan && (
                    <span className={`ml-2 text-[10px] font-normal ${sloganWordCount >= MAX_SLOGAN_WORDS ? 'text-red-500' : 'text-gray-400'}`}>
                      {sloganWordCount}/{MAX_SLOGAN_WORDS} palabras
                    </span>
                  )}
                </label>
                {tieneSlogan ? (
                  <input
                    type="text"
                    value={form.slogan}
                    onChange={(e) => update('slogan', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    placeholder="Ej: Lo mejor en calidad y precio"
                  />
                ) : (
                  <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400 flex items-center justify-between">
                    <span>Disponible desde Plan Normal</span>
                    <span className="material-symbols-outlined text-base text-gray-300">lock</span>
                  </div>
                )}
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-3">
              <div>
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
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Dirección</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg material-symbols-outlined">location_on</span>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) => update('direccion', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    placeholder="Dirección del negocio"
                  />
                </div>
              </div>
            </div>

            <div>
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
          </div>

          {/* COLUMNA DERECHA: Horarios */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-lg">schedule</span>
              Horarios de atención
            </h2>
            <div className="space-y-1.5">
              {form.horarios.map((h, i) => (
                <div key={h.dia} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateHorario(i, 'activo', !h.activo)}
                    className={`w-24 text-left text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      h.activo ? 'text-primary bg-primary/5' : 'text-gray-400 bg-gray-50'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-sm ${h.activo ? 'text-primary' : 'text-gray-300'}`}>
                      {h.activo ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    {h.dia}
                  </button>

                  {h.activo ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={h.apertura}
                        onChange={(e) => updateHorario(i, 'apertura', e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                      />
                      <span className="text-xs text-gray-400">a</span>
                      <input
                        type="time"
                        value={h.cierre}
                        onChange={(e) => updateHorario(i, 'cierre', e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Cerrado</span>
                  )}
                </div>
              ))}
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
