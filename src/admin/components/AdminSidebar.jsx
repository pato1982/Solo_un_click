import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const menuGeneral = [
  { label: 'Mi Negocio', icon: 'storefront', path: '/admin/negocio' },
  { label: 'Productos', icon: 'inventory_2', path: '/admin' },
  { label: 'Carruseles', icon: 'view_carousel', path: '/admin/carruseles', minPlan: 2 },
  { label: 'Banner', icon: 'photo_library', path: '/admin/banner', minPlan: 3 },
  { label: 'Estadísticas', icon: 'bar_chart', path: '/admin/estadisticas' },
]

const menuTurismo = [
  { label: 'Mi Negocio', icon: 'storefront', path: '/admin/negocio' },
  { label: 'Portada', icon: 'home', path: '/admin/portada' },
  { label: 'Mi Página', icon: 'web', path: '/admin/pagina', minPlan: 3 },
  { label: 'Tour', icon: 'tour', path: '/admin/tour', minPlan: 3 },
  { label: 'Estadísticas', icon: 'bar_chart', path: '/admin/estadisticas', minPlan: 3 },
]

const PLAN_NAMES = { 2: 'Normal', 3: 'Premium' }

export default function AdminSidebar({ open }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const planId = user.plan_id || 1
  const tipoCuenta = user.tipo_cuenta || 'general'
  const menuItems = tipoCuenta === 'turismo' ? menuTurismo : menuGeneral
  const [lockedPopup, setLockedPopup] = useState(null)
  const location = useLocation()

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-40 w-64 bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo / enlace al sitio */}
      <div className="p-4 border-b border-gray-100">
        <a
          href="/"
          className="flex items-center gap-2 text-xs text-primary hover:text-accent transition-colors font-semibold"
        >
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          Ver sitio público
        </a>
      </div>

      {/* Navegación */}
      <nav className="p-3 flex flex-col gap-1">
        {menuItems.map((item) => {
          const locked = item.minPlan && planId < item.minPlan
          const isActive = item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path)

          if (locked) {
            return (
              <button
                key={item.path}
                onClick={() => setLockedPopup({ label: item.label, minPlan: item.minPlan })}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:bg-gray-100 hover:text-gray-500 w-full`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
                <span className="material-symbols-outlined text-sm ml-auto">lock</span>
              </button>
            )
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Pie del sidebar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-lg">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">Administrador</p>
            <p className="text-[10px] text-gray-400">admin@soloaunclick.cl</p>
          </div>
        </div>
      </div>

      {/* Popup contenido bloqueado */}
      {lockedPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setLockedPopup(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-amber-500">workspace_premium</span>
              </div>
              <h3 className="text-sm font-bold text-gray-800">Contenido exclusivo {PLAN_NAMES[lockedPopup.minPlan] || 'Premium'}</h3>
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                La sección <strong className="text-primary">{lockedPopup.label}</strong> está disponible a partir del <strong>Plan {PLAN_NAMES[lockedPopup.minPlan] || 'Premium'}</strong>. Actualiza tu plan para acceder a esta funcionalidad.
              </p>
              <button onClick={() => setLockedPopup(null)} className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors mt-1">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
