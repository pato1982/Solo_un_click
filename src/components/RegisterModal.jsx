import { useState } from 'react'

const IVA = 0.19

const formatCLP = (n) => '$' + n.toLocaleString('es-CL')

const plansList = [
  {
    id: 1,
    name: 'Plan Gratuito',
    neto: 0,
    max: '5 imágenes',
    features: ['Panel de control', 'Visible en página principal', 'Editar información'],
    noFeatures: ['Slogan', 'Producto destacado', 'Página propia', 'Estadísticas'],
    highlight: false,
  },
  {
    id: 2,
    name: 'Plan Normal',
    neto: 2990,
    max: '33 imágenes',
    features: ['Panel de control', 'Visible en página principal', 'Editar información', 'Slogan', 'Producto destacado', 'Prioridad alta', '1 Carrusel (8 items)', 'Página propia'],
    noFeatures: ['Banner', 'Estadísticas'],
    highlight: false,
  },
  {
    id: 3,
    name: 'Plan Premium',
    neto: 4990,
    max: '134 imágenes',
    features: ['Panel de control', 'Visible en página principal', 'Editar información', 'Slogan', 'Producto destacado', 'Prioridad máxima', 'Página propia', '3 Carruseles (24 items)', 'Banner (10 items)', 'Estadísticas'],
    noFeatures: [],
    highlight: true,
  },
]

const plansListTurismo = [
  {
    id: 1,
    name: 'Plan Gratuito',
    neto: 0,
    max: '3 imágenes',
    features: ['Panel de control', 'Info del negocio', 'Portada (3 imágenes)', 'Tarjeta en página turismo', 'Dirección y horarios'],
    noFeatures: ['Página propia premium', 'Tours (36 imágenes)', 'Estadísticas'],
    highlight: false,
  },
  {
    id: 3,
    name: 'Plan Premium',
    neto: 3990,
    max: '39 imágenes',
    features: ['Panel de control', 'Info del negocio', 'Portada (3 imágenes)', 'Tarjeta en página turismo', 'Dirección y horarios', 'Página propia premium', 'Tours (36 imágenes)', 'Estadísticas'],
    noFeatures: [],
    highlight: true,
  },
]

export default function RegisterModal({ onClose, onSwitchToLogin, onRegisterSuccess }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nombre: 'Usuario Demo',
    email: 'demo@soloaunclick.cl',
    password: '123456',
    password2: '123456',
    telefono: '+56 9 8765 4321',
    comuna: 'Villarrica',
    direccion: 'Av. Pedro de Valdivia 123',
    tipo_cuenta: '',
    vende_productos: false,
    ofrece_servicios: false,
    ofrece_arriendos: false,
    plan_id: 1,
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
    if (!form.tipo_cuenta) return 'Selecciona un tipo de cuenta'
    if (form.tipo_cuenta === 'general' && !form.vende_productos && !form.ofrece_servicios && !form.ofrece_arriendos) {
      return 'Selecciona al menos una opción'
    }
    return null
  }

  const handleNext = () => {
    if (step === 1) {
      const err = validateStep1()
      if (err) { setError(err); return }
    }
    if (step === 2) {
      const err = validateStep2()
      if (err) { setError(err); return }
    }
    setError('')
    setStep(step + 1)
  }

  const handleSubmit = async () => {
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
          direccion: form.direccion.trim() || null,
          tipo_cuenta: form.tipo_cuenta,
          vende_productos: form.vende_productos,
          ofrece_servicios: form.ofrece_servicios,
          ofrece_arriendos: form.ofrece_arriendos,
          plan_id: form.plan_id,
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

  const stepTitles = ['Datos personales', 'Tipo de cuenta', 'Elige tu plan']

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden ${step === 3 ? (form.tipo_cuenta === 'turismo' ? 'max-w-lg' : 'max-w-2xl') : 'max-w-sm'} transition-all duration-300`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined">person_add</span>
            Registrarse
          </h2>
          <div className="flex items-center gap-3">
            {/* Indicador de pasos */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    s === step ? 'bg-accent text-primary' : s < step ? 'bg-white/30 text-white' : 'bg-white/10 text-white/40'
                  }`}>
                    {s < step ? <span className="material-symbols-outlined text-sm">check</span> : s}
                  </div>
                  {s < 3 && <div className={`w-4 h-0.5 ${s < step ? 'bg-white/30' : 'bg-white/10'}`} />}
                </div>
              ))}
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Subtítulo del paso */}
        <div className="bg-primary/5 px-6 py-2 border-b border-gray-100">
          <p className="text-xs font-semibold text-primary">{stepTitles[step - 1]}</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {/* PASO 1: Datos personales */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => update('nombre', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="Tu nombre completo"
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

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) => update('direccion', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    placeholder="Tu dirección"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors mt-2"
              >
                Siguiente
              </button>

              <p className="text-center text-sm text-gray-500">
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={onSwitchToLogin} className="text-primary font-bold hover:underline">
                  Ingresar
                </button>
              </p>
            </div>
          )}

          {/* PASO 2: Tipo de cuenta */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-3">¿Qué tipo de cuenta necesitas?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tipo_cuenta: 'general', vende_productos: false, ofrece_servicios: false, ofrece_arriendos: false })}
                    className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                      form.tipo_cuenta === 'general'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-4xl">storefront</span>
                    <span className="text-sm font-bold">General</span>
                    <span className="text-[10px] text-center leading-tight">Venta de productos, servicios o arriendos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tipo_cuenta: 'turismo', vende_productos: false, ofrece_servicios: false, ofrece_arriendos: false })}
                    className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                      form.tipo_cuenta === 'turismo'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-4xl">tour</span>
                    <span className="text-sm font-bold">Turismo</span>
                    <span className="text-[10px] text-center leading-tight">Experiencias, tours y actividades turísticas</span>
                  </button>
                </div>
              </div>

              {form.tipo_cuenta === 'general' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">¿Qué ofreces? (selecciona al menos una)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'vende_productos', label: 'Productos', icon: 'inventory_2' },
                      { key: 'ofrece_servicios', label: 'Servicios', icon: 'work' },
                      { key: 'ofrece_arriendos', label: 'Arriendos', icon: 'home' },
                    ].map((opt) => (
                      <label
                        key={opt.key}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
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
                        <span className={`material-symbols-outlined text-lg ${form[opt.key] ? 'text-primary' : 'text-gray-400'}`}>
                          {form[opt.key] ? 'check_circle' : opt.icon}
                        </span>
                        <span className={`text-[11px] font-medium ${form[opt.key] ? 'text-primary' : 'text-gray-600'}`}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {form.tipo_cuenta === 'turismo' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-start gap-2">
                  <span className="material-symbols-outlined text-xs text-blue-500 mt-0.5">info</span>
                  <span className="text-[11px] text-blue-700 leading-tight" style={{ textAlign: 'justify' }}>Como cuenta de turismo podrás publicar experiencias, tours y actividades turísticas en Villarrica y alrededores.</span>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError('') }}
                  className="flex-1 border-2 border-gray-300 text-gray-600 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Selección de plan */}
          {step === 3 && (
            <div className="space-y-4">
              <div className={`grid gap-3 ${form.tipo_cuenta === 'turismo' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {(form.tipo_cuenta === 'turismo' ? plansListTurismo : plansList).map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => update('plan_id', plan.id)}
                    className={`relative flex flex-col rounded-xl border-2 p-4 transition-all text-left ${
                      form.plan_id === plan.id
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : plan.highlight
                          ? 'border-accent hover:border-primary'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.highlight && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-primary text-[8px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
                        Recomendado
                      </span>
                    )}

                    {/* Check de selección */}
                    <div className="absolute top-2 right-2">
                      <span className={`material-symbols-outlined text-xl ${form.plan_id === plan.id ? 'text-primary' : 'text-gray-300'}`}>
                        {form.plan_id === plan.id ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-800">{plan.name}</h3>

                    {plan.neto === 0 ? (
                      <div className="mt-1">
                        <span className="text-2xl font-black text-primary">Gratis</span>
                      </div>
                    ) : (
                      <div className="mt-1 space-y-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-primary">{formatCLP(plan.neto)}</span>
                          <span className="text-[10px] text-slate-400">/ mes</span>
                        </div>
                        <div className="text-[9px] text-slate-400 leading-tight">
                          + IVA ({formatCLP(Math.round(plan.neto * IVA))})
                        </div>
                      </div>
                    )}

                    {plan.max && <span className="text-[11px] font-bold text-primary/70 mt-1">{plan.max}</span>}

                    <div className="mt-3 space-y-1">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                          <span className="text-[11px] text-slate-600">{f}</span>
                        </div>
                      ))}
                      {plan.noFeatures.map((f) => (
                        <div key={f} className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-red-400 text-sm">cancel</span>
                          <span className="text-[11px] text-slate-400">{f}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(2); setError('') }}
                  className="flex-1 border-2 border-gray-300 text-gray-600 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Crear cuenta'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
