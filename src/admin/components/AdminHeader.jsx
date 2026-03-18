import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API || ''

function ConfirmDeletePopup({ message, details, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001 }} onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-red-500 px-6 py-4 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-3xl text-white">warning</span>
          </div>
          <h3 className="text-base font-bold text-white">Atención</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-slate-700 text-center leading-relaxed">{message}</p>
          {details && details.length > 0 && (
            <div className="mt-3 bg-red-50 rounded-lg p-3">
              <p className="text-[10px] font-bold text-red-400 uppercase mb-1.5">Se eliminarán:</p>
              <ul className="space-y-1">
                {details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-red-600">
                    <span className="material-symbols-outlined text-sm">delete</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[10px] text-red-500 font-bold text-center mt-3">Esta acción no se puede deshacer.</p>
        </div>
        <div className="px-6 pb-4 flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-sm">delete_forever</span>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmDowngradePopup({ message, items, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001 }} onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-amber-500 px-6 py-4 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-3xl text-white">info</span>
          </div>
          <h3 className="text-base font-bold text-white">Cambio de plan</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-slate-700 text-center leading-relaxed">{message}</p>
          {items && items.length > 0 && (
            <div className="mt-3 bg-amber-50 rounded-lg p-3">
              <p className="text-[10px] font-bold text-amber-500 uppercase mb-1.5">Qué cambiará:</p>
              <ul className="space-y-1">
                {items.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-amber-700">
                    <span className="material-symbols-outlined text-sm">visibility_off</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[10px] text-green-600 font-bold text-center mt-3 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Tu contenido se conservará y podrás recuperarlo subiendo de plan.
          </p>
        </div>
        <div className="px-6 pb-4 flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-sm">swap_vert</span>
            Cambiar plan
          </button>
        </div>
      </div>
    </div>
  )
}

function ProfileModal({ onClose }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [counts, setCounts] = useState(null)
  const [confirmPopup, setConfirmPopup] = useState(null)
  const [downgradePopup, setDowngradePopup] = useState(null)

  // Campos editables
  const [tipoCuenta, setTipoCuenta] = useState('general')
  const [vendeProductos, setVendeProductos] = useState(false)
  const [ofreceServicios, setOfreceServicios] = useState(false)
  const [ofreceArriendos, setOfreceArriendos] = useState(false)
  const [planId, setPlanId] = useState(1)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || token === 'dev-token') { setLoading(false); return }
    Promise.all([
      fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/api/auth/profile/counts`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([meData, countsData]) => {
      const u = meData.user || null
      setUser(u)
      setCounts(countsData)
      if (u) {
        setTipoCuenta(u.tipo_cuenta || 'general')
        setVendeProductos(!!u.vende_productos)
        setOfreceServicios(!!u.ofrece_servicios)
        setOfreceArriendos(!!u.ofrece_arriendos)
        setPlanId(u.plan_id || 1)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const buildDeleteWarning = () => {
    const warnings = []
    const deleteDetails = []
    const deleteTipos = []

    // Cambio de comercio a turismo
    if (user.tipo_cuenta === 'general' && tipoCuenta === 'turismo') {
      const total = (counts?.productos || 0) + (counts?.servicios || 0) + (counts?.arriendos || 0)
      if (total > 0) deleteDetails.push(`${total} publicaciones (productos, servicios y arriendos)`)
      if (counts?.carousels > 0) deleteDetails.push(`${counts.carousels} carruseles y sus imágenes`)
      if (counts?.negocio > 0) deleteDetails.push('Datos del negocio')
      if (deleteDetails.length > 0) {
        return {
          message: 'Al cambiar a Turismo se eliminarán todos los datos de tu cuenta de Comercio. Deberás configurar tu nuevo panel de turismo desde cero.',
          details: deleteDetails,
          deleteTipos: [],
        }
      }
    }

    // Cambio de turismo a comercio
    if (user.tipo_cuenta === 'turismo' && tipoCuenta === 'general') {
      if (counts?.tours > 0) deleteDetails.push(`${counts.tours} tours`)
      if (counts?.portada > 0) deleteDetails.push('Portada y sus imágenes')
      if (counts?.pagina > 0) deleteDetails.push('Página personalizada')
      if (counts?.negocio > 0) deleteDetails.push('Datos del negocio')
      if (deleteDetails.length > 0) {
        return {
          message: 'Al cambiar a Comercio se eliminarán todos los datos de tu cuenta de Turismo. Deberás configurar tu nuevo panel de comercio desde cero.',
          details: deleteDetails,
          deleteTipos: [],
        }
      }
    }

    // Quitar opciones dentro de comercio
    if (tipoCuenta === 'general') {
      if (user.vende_productos && !vendeProductos) {
        const n = counts?.productos || 0
        deleteDetails.push(n > 0 ? `${n} productos (publicaciones, carrusel y banner)` : 'Sección de Productos y todos sus datos futuros')
        deleteTipos.push('producto')
      }
      if (user.ofrece_servicios && !ofreceServicios) {
        const n = counts?.servicios || 0
        deleteDetails.push(n > 0 ? `${n} servicios publicados` : 'Sección de Servicios y todos sus datos futuros')
        deleteTipos.push('servicio')
      }
      if (user.ofrece_arriendos && !ofreceArriendos) {
        const n = counts?.arriendos || 0
        deleteDetails.push(n > 0 ? `${n} arriendos publicados` : 'Sección de Arriendos y todos sus datos futuros')
        deleteTipos.push('arriendo')
      }
      if (deleteTipos.length > 0) {
        const nombres = deleteTipos.map(t => t === 'producto' ? 'Productos' : t === 'servicio' ? 'Servicios' : 'Arriendos').join(', ')
        return {
          message: `Al desmarcar ${nombres} se eliminarán todos los datos ingresados en esas secciones incluyendo publicaciones, tarjetas de carrusel y banner asociadas, sin poder recuperarlos.`,
          details: deleteDetails,
          deleteTipos,
        }
      }
    }

    return null
  }

  // Advertencia al bajar de plan (no borra datos, solo oculta)
  const buildDowngradeWarning = () => {
    if (planId >= user.plan_id) return null // upgrade o mismo plan, sin advertencia
    const esTurismo = tipoCuenta === 'turismo'
    const items = []

    if (esTurismo) {
      // Turismo: de Premium a Gratis
      if (user.plan_id >= 3 && planId < 3) {
        if (counts?.tours > 0) items.push(`${counts.tours} tours dejarán de mostrarse`)
        if (counts?.pagina > 0) items.push('Tu página personalizada no será accesible')
        items.push('Las estadísticas no estarán disponibles')
      }
    } else {
      // Comercio: de Premium a Normal o Gratis
      if (user.plan_id >= 3 && planId < 3) {
        items.push('Tus banners dejarán de mostrarse públicamente')
        items.push('Las estadísticas no estarán disponibles')
      }
      // De Premium/Normal a Gratis
      if (user.plan_id >= 2 && planId < 2) {
        if (counts?.carousels > 0) items.push('Tus carruseles dejarán de mostrarse públicamente')
        items.push('Tu página de tienda no será accesible')
        items.push('Si tienes más de 5 productos, solo los 5 más recientes serán visibles')
      }
    }

    if (items.length === 0) return null
    return {
      message: `Al bajar de Plan ${planLabel(user.plan_id)} a Plan ${planLabel(planId)}, tu contenido no se eliminará pero dejará de estar visible públicamente. Si vuelves a subir de plan, se restaurará automáticamente.`,
      items,
    }
  }

  const handleSave = async (deleteTipos = []) => {
    const token = localStorage.getItem('token')
    if (!token) return
    setSaving(true)
    try {
      const body = {
        tipo_cuenta: tipoCuenta,
        vende_productos: tipoCuenta === 'general' ? vendeProductos : false,
        ofrece_servicios: tipoCuenta === 'general' ? ofreceServicios : false,
        ofrece_arriendos: tipoCuenta === 'general' ? ofreceArriendos : false,
        plan_id: planId,
        delete_tipos: deleteTipos,
      }
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        Object.assign(stored, {
          tipo_cuenta: data.user.tipo_cuenta,
          plan_id: data.user.plan_id,
          vende_productos: data.user.vende_productos,
          ofrece_servicios: data.user.ofrece_servicios,
          ofrece_arriendos: data.user.ofrece_arriendos,
        })
        localStorage.setItem('user', JSON.stringify(stored))
        // Recargar counts
        const countsRes = await fetch(`${API}/api/auth/profile/counts`, { headers: { Authorization: `Bearer ${token}` } })
        setCounts(await countsRes.json())
      }
      setEditing(false)
    } catch (err) {
      console.error('Error guardando perfil:', err)
    }
    setSaving(false)
  }

  const handleSaveClick = () => {
    const warning = buildDeleteWarning()
    if (warning) {
      setConfirmPopup(warning)
      return
    }
    const downgrade = buildDowngradeWarning()
    if (downgrade) {
      setDowngradePopup(downgrade)
      return
    }
    handleSave()
  }

  const planLabel = (id) => id === 3 ? 'Premium' : id === 2 ? 'Normal' : 'Gratis'
  const planColor = user?.plan_id === 3 ? 'text-amber-400' : user?.plan_id === 2 ? 'text-blue-400' : 'text-slate-400'

  const tipoCuentaLabel = () => {
    if (user?.tipo_cuenta === 'turismo') return 'Turismo'
    const tipos = []
    if (user?.vende_productos) tipos.push('Productos')
    if (user?.ofrece_servicios) tipos.push('Servicios')
    if (user?.ofrece_arriendos) tipos.push('Arriendos')
    return tipos.length > 0 ? tipos.join(', ') : '—'
  }

  const ubicacion = [user?.direccion, user?.comuna].filter(Boolean).join(', ') || '—'

  const checkboxClass = (checked) =>
    `w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${checked ? 'bg-primary border-primary' : 'border-slate-300 hover:border-primary/50'}`

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-center relative">
          <button onClick={onClose} className="absolute top-3 right-3 h-6 w-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <span className="material-symbols-outlined text-white text-sm">close</span>
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-4xl text-white">person</span>
          </div>
          {loading ? (
            <p className="text-white/70 text-sm">Cargando...</p>
          ) : user ? (
            <>
              <h3 className="text-lg font-bold text-white">{user.nombre}</h3>
              <span className={`text-xs font-bold ${planColor}`}>Plan {planLabel(user.plan_id)}</span>
            </>
          ) : (
            <p className="text-white/70 text-sm">Sin datos</p>
          )}
        </div>

        {/* Datos */}
        {user && (
          <div className="px-6 py-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-lg text-primary/60 mt-0.5">mail</span>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Correo</p>
                <p className="text-sm text-slate-700">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-lg text-primary/60 mt-0.5">call</span>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</p>
                <p className="text-sm text-slate-700">{user.telefono || '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-lg text-primary/60 mt-0.5">location_on</span>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Ubicación</p>
                <p className="text-sm text-slate-700">{ubicacion}</p>
              </div>
            </div>

            {/* Tipo de cuenta - editable */}
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-lg text-primary/60 mt-0.5">storefront</span>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tipo de cuenta</p>
                {!editing ? (
                  <p className="text-sm text-slate-700">{tipoCuentaLabel()}</p>
                ) : (
                  <div className="mt-1 space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTipoCuenta('general')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${tipoCuenta === 'general' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >Comercio</button>
                      <button
                        onClick={() => setTipoCuenta('turismo')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${tipoCuenta === 'turismo' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >Turismo</button>
                    </div>
                    {tipoCuenta === 'general' && (
                      <div className="flex flex-col gap-1.5 ml-1">
                        <label className="flex items-center gap-2 cursor-pointer" onClick={() => setVendeProductos(!vendeProductos)}>
                          <div className={checkboxClass(vendeProductos)}>
                            {vendeProductos && <span className="material-symbols-outlined text-white text-xs">check</span>}
                          </div>
                          <span className="text-xs text-slate-600">Productos</span>
                          {counts?.productos > 0 && <span className="text-[10px] text-slate-400">({counts.productos})</span>}
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer" onClick={() => setOfreceServicios(!ofreceServicios)}>
                          <div className={checkboxClass(ofreceServicios)}>
                            {ofreceServicios && <span className="material-symbols-outlined text-white text-xs">check</span>}
                          </div>
                          <span className="text-xs text-slate-600">Servicios</span>
                          {counts?.servicios > 0 && <span className="text-[10px] text-slate-400">({counts.servicios})</span>}
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer" onClick={() => setOfreceArriendos(!ofreceArriendos)}>
                          <div className={checkboxClass(ofreceArriendos)}>
                            {ofreceArriendos && <span className="material-symbols-outlined text-white text-xs">check</span>}
                          </div>
                          <span className="text-xs text-slate-600">Arriendos</span>
                          {counts?.arriendos > 0 && <span className="text-[10px] text-slate-400">({counts.arriendos})</span>}
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Plan - editable */}
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-lg text-primary/60 mt-0.5">star</span>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Plan</p>
                {!editing ? (
                  <p className="text-sm text-slate-700">Plan {planLabel(user.plan_id)}</p>
                ) : (
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3].map(p => (
                      <button
                        key={p}
                        onClick={() => setPlanId(p)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${planId === p
                          ? (p === 3 ? 'bg-amber-400 text-amber-900' : p === 2 ? 'bg-blue-500 text-white' : 'bg-slate-500 text-white')
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >{planLabel(p)}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-lg text-primary/60 mt-0.5">calendar_today</span>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Miembro desde</p>
                <p className="text-sm text-slate-700">{user.created_at ? new Date(user.created_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
              </div>
            </div>

            {/* Botones */}
            <div className="pt-2 border-t border-slate-100">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Editar cuenta
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(false)
                      setTipoCuenta(user.tipo_cuenta || 'general')
                      setVendeProductos(!!user.vende_productos)
                      setOfreceServicios(!!user.ofrece_servicios)
                      setOfreceArriendos(!!user.ofrece_arriendos)
                      setPlanId(user.plan_id || 1)
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-all"
                  >Cancelar</button>
                  <button
                    onClick={handleSaveClick}
                    disabled={saving}
                    className="flex-1 py-2 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : <><span className="material-symbols-outlined text-sm">save</span>Guardar</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Popup de confirmación de eliminación */}
      {confirmPopup && (
        <ConfirmDeletePopup
          message={confirmPopup.message}
          details={confirmPopup.details}
          onCancel={() => setConfirmPopup(null)}
          onConfirm={() => {
            setConfirmPopup(null)
            handleSave(confirmPopup.deleteTipos || [])
          }}
        />
      )}

      {/* Popup de confirmación de downgrade */}
      {downgradePopup && (
        <ConfirmDowngradePopup
          message={downgradePopup.message}
          items={downgradePopup.items}
          onCancel={() => setDowngradePopup(null)}
          onConfirm={() => {
            setDowngradePopup(null)
            handleSave()
          }}
        />
      )}
    </div>
  )
}

export default function AdminHeader({ onToggleSidebar }) {
  const [showProfile, setShowProfile] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const hasPage = user.plan_id && user.plan_id >= 2
  const isProg = (user.rol || 'usuario') === 'programador'

  return (
    <>
      <header className={`sticky top-0 z-50 text-white shadow-lg ${isProg ? 'bg-slate-950' : 'bg-primary'}`}>
        <div className="flex items-center h-14 sm:h-16 px-3 sm:px-4 md:px-6">
          {/* Botón hamburguesa */}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">menu</span>
          </button>

          {/* Icono usuario */}
          {!isProg && (
            <button
              onClick={() => setShowProfile(true)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors ml-1 mr-2 sm:mr-4"
              title="Mi perfil"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl text-white/70">account_circle</span>
            </button>
          )}

          {/* Título centrado (solo admin normal, oculto en mobile) */}
          <div className="flex-1 flex items-center justify-center">
            {!isProg && (
              <span className="hidden sm:inline text-sm md:text-lg font-bold uppercase tracking-wider text-white">
                Panel Administrador
              </span>
            )}
          </div>

          {/* Programador: botón salir */}
          {isProg && (
            <button
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/' }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors mr-1 sm:mr-3"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">logout</span>
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">Salir</span>
            </button>
          )}

          {/* Logo Solo a un Click a la derecha */}
          <a href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity shrink-0">
            <div className={`p-1 sm:p-1.5 rounded-lg leading-none ${isProg ? 'bg-emerald-500/20 text-emerald-400' : 'bg-accent text-primary'}`}>
              <span className="material-symbols-outlined block text-xl sm:text-2xl font-bold">ads_click</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-white/70">Solo a</span>
              <span className="text-base sm:text-xl font-black italic tracking-tight text-white">
                un <span className={`uppercase ${isProg ? 'text-emerald-400' : 'text-accent'}`}>CLICK</span>
              </span>
            </div>
          </a>
        </div>

        {/* Barra "Ver mi página" solo para plan Normal y Premium (no programador) */}
        {hasPage && !isProg && (
          <div className="bg-[#4A2070] border-t border-white/10 py-1.5 flex justify-center">
            <a
              href={user.tipo_cuenta === 'turismo' ? `/?turismo=${user.id}` : `/?store=${user.id}`}
              className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
              Ver mi página
            </a>
          </div>
        )}
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  )
}
