import { NavLink } from 'react-router-dom'

const menuItems = [
  { label: 'Productos', icon: 'inventory_2', path: '/admin' },
  // { label: 'Tiendas', icon: 'storefront', path: '/admin/tiendas' },
  // { label: 'Pedidos', icon: 'shopping_cart', path: '/admin/pedidos' },
  // { label: 'Usuarios', icon: 'group', path: '/admin/usuarios' },
  // { label: 'Configuración', icon: 'settings', path: '/admin/configuracion' },
]

export default function AdminSidebar({ open }) {
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
        {menuItems.map((item) => (
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
        ))}
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
    </aside>
  )
}
