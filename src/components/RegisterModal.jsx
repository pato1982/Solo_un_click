import { useState } from 'react'

export default function RegisterModal({ onClose, onSwitchToLogin, onRegisterSuccess }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    password2: '',
    telefono: '',
    comuna: '',
    tipo_cuenta: 'general',
    vende_productos: false,
    ofrece_servicios: false,
    ofrece_arriendos: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field, value) => setForm({ ...form, [field]: value })

  const validateStep1 = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio'
    if (!form.email.trim()) return 'El email es obligatorio'
    if (!form.password || form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    if (form.password !== form.password2) return 'Las contraseñas no coinciden'
    return null
  }

  const validateStep2 = () => {
    if (form.tipo_cuenta === 'general' && !form.vende_productos && !form.ofrece_servicios && !form.ofrece_arriendos) {
      return 'Selecciona al menos una opción'
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setError(err); return }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          password: form.password,
          telefono: form.telefono.trim() || null,
          comuna: form.comuna.trim() || null,
          tipo_cuenta: form.tipo_cuenta,
          vende_productos: form.vende_productos,
          ofrece_servicios: form.ofrece_servicios,
          ofrece_arriendos: form.ofrece_arriendos,
        })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrar')
        setLoading(false)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onRegisterSuccess(data.user)
      onClose()
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined">person_add</span>
            Registrarse
            <span className="text-white/50 text-sm font-normal">Paso {step} de 2</span>
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => update('nombre', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Repetir contraseña *</label>
                  <input
                    type="password"
                    required
                    value={form.password2}
                    onChange={(e) => update('password2', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    placeholder="Repite tu contraseña"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => update('telefono', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Comuna</label>
                  <input
                    type="text"
                    value={form.comuna}
                    onChange={(e) => update('comuna', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    placeholder="Ej: Villarrica"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Siguiente
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Tipo de cuenta */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Tipo de cuenta</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => update('tipo_cuenta', 'general')}
                    className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                      form.tipo_cuenta === 'general'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl">storefront</span>
                    <span className="text-sm font-bold">General</span>
                    <span className="text-[10px] text-center leading-tight">Productos, servicios o arriendos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      update('tipo_cuenta', 'turismo')
                      setForm(prev => ({ ...prev, tipo_cuenta: 'turismo', vende_productos: false, ofrece_servicios: false, ofrece_arriendos: false }))
                    }}
                    className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                      form.tipo_cuenta === 'turismo'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl">tour</span>
                    <span className="text-sm font-bold">Turismo</span>
                    <span className="text-[10px] text-center leading-tight">Experiencias y tours</span>
                  </button>
                </div>
              </div>

              {/* Opciones para cuenta general */}
              {form.tipo_cuenta === 'general' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">¿Qué ofreces?</label>
                  <div className="space-y-2">
                    {[
                      { key: 'vende_productos', label: 'Vendo productos', icon: 'inventory_2' },
                      { key: 'ofrece_servicios', label: 'Ofrezco servicios', icon: 'work' },
                      { key: 'ofrece_arriendos', label: 'Arriendo propiedades/equipos', icon: 'home' },
                    ].map((opt) => (
                      <label
                        key={opt.key}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          form[opt.key]
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form[opt.key]}
                          onChange={(e) => update(opt.key, e.target.checked)}
                          className="sr-only"
                        />
                        <span className={`material-symbols-outlined text-xl ${form[opt.key] ? 'text-primary' : 'text-gray-400'}`}>
                          {form[opt.key] ? 'check_circle' : opt.icon}
                        </span>
                        <span className={`text-sm font-medium ${form[opt.key] ? 'text-primary' : 'text-gray-600'}`}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {form.tipo_cuenta === 'turismo' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 flex items-start gap-2">
                  <span className="material-symbols-outlined text-base mt-0.5">info</span>
                  <span>Como cuenta de turismo podrás publicar experiencias, tours y actividades turísticas en Villarrica.</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError('') }}
                  className="flex-1 border-2 border-gray-300 text-gray-600 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Crear cuenta'}
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <p className="text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={onSwitchToLogin} className="text-primary font-bold hover:underline">
                Ingresar
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
